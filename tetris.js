// テトロミノの定義
const TETROMINOS = {
    I: { shape: [[1, 1, 1, 1]], color: '#00F0F0' },
    O: { shape: [[1, 1], [1, 1]], color: '#F0F000' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#A000F0' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00F000' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#F00000' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000F0' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#F0A000' }
};

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

let board;
let currentPiece;
let nextPiece;
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lines = 0;
let level = 1;
let dropSpeed = 500;
let lastDropTime = 0;
let gameCanvas, gameCtx;
let nextCanvas, nextCtx;

// ゲーム初期化
function initGame() {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    dropSpeed = 500;
    lastDropTime = 0;
    gameRunning = true;
    gamePaused = false;
    
    currentPiece = createNewPiece();
    nextPiece = createNewPiece();
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('gameOverText').style.display = 'none';
    
    gameLoop();
}

// 新しいピースを作成
function createNewPiece() {
    const keys = Object.keys(TETROMINOS);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const tetromino = TETROMINOS[key];
    
    return {
        shape: tetromino.shape,
        color: tetromino.color,
        row: 0,
        col: Math.floor((COLS - tetromino.shape[0].length) / 2)
    };
}

// ピースを回転
function rotatePiece(piece) {
    const newShape = piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
    );
    
    const originalShape = piece.shape;
    piece.shape = newShape;
    
    // 壁蹴りロジック
    if (!isValidMove(piece)) {
        for (let offset = 1; offset <= 3; offset++) {
            piece.col += offset;
            if (isValidMove(piece)) break;
            piece.col -= 2 * offset;
            if (isValidMove(piece)) break;
            piece.col += offset;
        }
        
        if (!isValidMove(piece)) {
            piece.shape = originalShape;
        }
    }
}

// ピース移動の有効性チェック
function isValidMove(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 0) continue;
            
            const boardRow = piece.row + r;
            const boardCol = piece.col + c;
            
            if (boardRow < 0) continue;
            if (boardRow >= ROWS || boardCol < 0 || boardCol >= COLS) {
                return false;
            }
            
            if (board[boardRow][boardCol] !== 0) {
                return false;
            }
        }
    }
    return true;
}

// ピースをボードに固定
function lockPiece(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 0) continue;
            
            const boardRow = piece.row + r;
            const boardCol = piece.col + c;
            
            if (boardRow >= 0) {
                board[boardRow][boardCol] = piece.color;
            }
        }
    }
}

// ラインクリアチェック
function clearLines() {
    let clearedLines = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            clearedLines++;
            row++;
        }
    }
    
    if (clearedLines > 0) {
        const lineScores = [40, 100, 300, 1200];
        score += lineScores[clearedLines - 1] * level;
        lines += clearedLines;
        
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropSpeed = Math.max(100, 500 - (level - 1) * 50);
        }
        
        document.getElementById('score').textContent = score;
        document.getElementById('level').textContent = level;
        document.getElementById('lines').textContent = lines;
    }
    
    return clearedLines > 0;
}

// ゲームオーバー判定
function isGameOver(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 0) continue;
            
            const boardRow = piece.row + r;
            if (boardRow < 0 && board[boardRow + 1] && board[boardRow + 1][piece.col + c] !== 0) {
                return true;
            }
        }
    }
    return false;
}

// ゲームループ
function gameLoop() {
    if (!gameRunning || gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const now = Date.now();
    
    // ピース落下
    if (now - lastDropTime > dropSpeed) {
        currentPiece.row++;
        
        if (!isValidMove(currentPiece)) {
            currentPiece.row--;
            lockPiece(currentPiece);
            clearLines();
            
            currentPiece = nextPiece;
            nextPiece = createNewPiece();
            
            if (!isValidMove(currentPiece)) {
                endGame();
            }
        }
        
        lastDropTime = now;
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// 描画
function draw() {
    // ゲームボード描画
    gameCtx.fillStyle = '#1a1a1a';
    gameCtx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    
    // グリッド描画
    gameCtx.strokeStyle = '#333';
    gameCtx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
        gameCtx.beginPath();
        gameCtx.moveTo(i * BLOCK_SIZE, 0);
        gameCtx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        gameCtx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
        gameCtx.beginPath();
        gameCtx.moveTo(0, i * BLOCK_SIZE);
        gameCtx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
        gameCtx.stroke();
    }
    
    // ボード上のピース描画
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 0) {
                gameCtx.fillStyle = board[r][c];
                gameCtx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            }
        }
    }
    
    // 現在のピース描画
    if (gameRunning && !gamePaused) {
        gameCtx.fillStyle = currentPiece.color;
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c] === 1) {
                    const x = (currentPiece.col + c) * BLOCK_SIZE + 1;
                    const y = (currentPiece.row + r) * BLOCK_SIZE + 1;
                    gameCtx.fillRect(x, y, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                }
            }
        }
    }
    
    // NEXTピース描画
    nextCtx.fillStyle = '#1a1a1a';
    nextCtx.fillRect(0, 0, 120, 120);
    
    nextCtx.fillStyle = nextPiece.color;
    const offsetX = (120 - nextPiece.shape[0].length * 20) / 2;
    const offsetY = (120 - nextPiece.shape.length * 20) / 2;
    for (let r = 0; r < nextPiece.shape.length; r++) {
        for (let c = 0; c < nextPiece.shape[r].length; c++) {
            if (nextPiece.shape[r][c] === 1) {
                nextCtx.fillRect(offsetX + c * 20 + 1, offsetY + r * 20 + 1, 18, 18);
            }
        }
    }
}

// ゲーム終了
function endGame() {
    gameRunning = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('gameOverText').style.display = 'block';
}

// キーボード操作
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            currentPiece.col--;
            if (!isValidMove(currentPiece)) {
                currentPiece.col++;
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            currentPiece.col++;
            if (!isValidMove(currentPiece)) {
                currentPiece.col--;
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotatePiece(currentPiece);
            break;
        case 'ArrowDown':
            e.preventDefault();
            currentPiece.row++;
            if (!isValidMove(currentPiece)) {
                currentPiece.row--;
            }
            lastDropTime = Date.now();
            break;
        case ' ':
            e.preventDefault();
            while (isValidMove(currentPiece)) {
                currentPiece.row++;
            }
            currentPiece.row--;
            lockPiece(currentPiece);
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createNewPiece();
            if (!isValidMove(currentPiece)) {
                endGame();
            }
            break;
    }
});

// ボタンイベント
document.getElementById('startBtn').addEventListener('click', initGame);
document.getElementById('pauseBtn').addEventListener('click', () => {
    gamePaused = !gamePaused;
    document.getElementById('pauseBtn').textContent = gamePaused ? '再開' : '一時停止';
});

// ページロード時
window.addEventListener('load', () => {
    gameCanvas = document.getElementById('gameCanvas');
    gameCtx = gameCanvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
});
