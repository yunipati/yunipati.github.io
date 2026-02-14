// ゲーム設定
const COLS = 6;
const ROWS = 12;
const BLOCK_SIZE = 40;
const COLORS = ['#FF0000', '#0000FF', '#00DD00', '#FFDD00', '#FF00FF', '#00DDDD'];

// ゲーム状態
let gameBoard = [];
let currentPuyo = null;
let nextPuyo = null;
let score = 0;
let gameActive = false;
let gamePaused = false;
let gameOver = false;
let dropCounter = 0;
const dropSpeed = 30;

// Canvas要素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const statusDisplay = document.getElementById('status');

// ボタンイベント
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// Puyoクラス
class Puyo {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }
}

// PuyoPairクラス（2つのぷよがくっついている状態）
class PuyoPair {
  constructor(x, y, color1, color2, orientation = 0) {
    this.x = x;
    this.y = y;
    this.color1 = color1;
    this.color2 = color2;
    this.orientation = orientation; // 0=上下, 1=右左, 2=下上, 3=左右
  }

  getBlocks() {
    const blocks = [
      { x: this.x, y: this.y, color: this.color1 }
    ];

    if (this.orientation === 0) {
      blocks.push({ x: this.x, y: this.y - 1, color: this.color2 });
    } else if (this.orientation === 1) {
      blocks.push({ x: this.x + 1, y: this.y, color: this.color2 });
    } else if (this.orientation === 2) {
      blocks.push({ x: this.x, y: this.y + 1, color: this.color2 });
    } else if (this.orientation === 3) {
      blocks.push({ x: this.x - 1, y: this.y, color: this.color2 });
    }

    return blocks;
  }
}

// ゲーム初期化
function initBoard() {
  gameBoard = [];
  for (let i = 0; i < ROWS; i++) {
    gameBoard[i] = new Array(COLS).fill(null);
  }
}

// ランダムな色を取得
function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// 新しいペアを生成
function generateNewPair() {
  const color1 = getRandomColor();
  const color2 = getRandomColor();
  return new PuyoPair(Math.floor(COLS / 2) - 1, 1, color1, color2);
}

// ゲーム開始
function startGame() {
  if (!gameActive) {
    gameActive = true;
    gamePaused = false;
    gameOver = false;
    initBoard();
    score = 0;
    scoreDisplay.textContent = score;
    statusDisplay.textContent = 'ゲーム中';
    currentPuyo = generateNewPair();
    gameLoop();
  }
}

// ポーズ切り替え
function togglePause() {
  if (gameActive) {
    gamePaused = !gamePaused;
    statusDisplay.textContent = gamePaused ? 'ポーズ中' : 'ゲーム中';
    if (!gamePaused) {
      gameLoop();
    }
  }
}

// リセット
function resetGame() {
  gameActive = false;
  gamePaused = false;
  gameOver = false;
  score = 0;
  initBoard();
  scoreDisplay.textContent = score;
  statusDisplay.textContent = 'ゲーム停止';
  draw();
}

// キー入力処理
function handleKeyPress(e) {
  if (!gameActive || gamePaused) return;

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      moveLeft();
      break;
    case 'ArrowRight':
      e.preventDefault();
      moveRight();
      break;
    case 'ArrowUp':
      e.preventDefault();
      rotate();
      break;
    case 'ArrowDown':
      e.preventDefault();
      moveDown();
      break;
    case ' ':
      e.preventDefault();
      togglePause();
      break;
  }
}

// 左移動
function moveLeft() {
  if (canMove(-1, 0)) {
    currentPuyo.x--;
  }
}

// 右移動
function moveRight() {
  if (canMove(1, 0)) {
    currentPuyo.x++;
  }
}

// 回転
function rotate() {
  const oldOrientation = currentPuyo.orientation;
  currentPuyo.orientation = (currentPuyo.orientation + 1) % 4;

  if (!isValidPosition()) {
    currentPuyo.orientation = oldOrientation;
  }
}

// 下移動
function moveDown() {
  if (canMove(0, 1)) {
    currentPuyo.y++;
  } else {
    placePuyo();
  }
}

// 移動可能かチェック
function canMove(dx, dy) {
  const blocks = currentPuyo.getBlocks();
  return blocks.every(block => {
    const newX = block.x + dx;
    const newY = block.y + dy;
    
    // 左右の境界チェック
    if (newX < 0 || newX >= COLS) return false;
    
    // 下の境界チェック
    if (newY >= ROWS) return false;
    
    // 画面上部（y < 0）は落下を許可
    if (newY < 0) return true;
    
    // ボード内の場合は空きをチェック
    return gameBoard[newY][newX] === null;
  });
}

// 位置チェック
function isValidPosition() {
  const blocks = currentPuyo.getBlocks();
  return blocks.every(block => {
    return isInBounds(block.x, block.y) && gameBoard[block.y][block.x] === null;
  });
}

// 境界内かチェック
function isInBounds(x, y) {
  return x >= 0 && x < COLS && y >= 0 && y < ROWS;
}

// ぷよを配置
function placePuyo() {
  const blocks = currentPuyo.getBlocks();
  let placedAny = false;

  // ボード内のブロックだけを配置
  blocks.forEach(block => {
    if (block.y >= 0 && block.y < ROWS && block.x >= 0 && block.x < COLS) {
      gameBoard[block.y][block.x] = block.color;
      placedAny = true;
    }
  });

  // ボード内に配置されたブロックがない場合はゲームオーバー
  if (!placedAny) {
    gameOver = true;
    gameActive = false;
    statusDisplay.textContent = 'ゲームオーバー';
    return;
  }

  // 配置後に必ず重力を適用
  applyGravity();
  removePuyo();
  currentPuyo = generateNewPair();
  if (!isValidPosition()) {
    gameOver = true;
    gameActive = false;
    statusDisplay.textContent = 'ゲームオーバー';
  }
}

// ぷよの消滅判定と処理
function removePuyo() {
  let removed = false;

  do {
    removed = false;
    const toRemove = new Set();

    // つながっているぷよをマーク
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (gameBoard[y][x] !== null) {
          const connected = getConnectedPuyo(x, y, new Set());
          if (connected.size >= 4) {
            connected.forEach(pos => toRemove.add(pos));
          }
        }
      }
    }

    // マークされたぷよを削除
    if (toRemove.size > 0) {
      removed = true;
      score += toRemove.size * 10;
      toRemove.forEach(pos => {
        const [x, y] = pos.split(',').map(Number);
        gameBoard[y][x] = null;
      });
      scoreDisplay.textContent = score;

      // 落下処理
      applyGravity();
    }
  } while (removed);
}

// つながっているぷよを取得
function getConnectedPuyo(x, y, visited) {
  const key = `${x},${y}`;
  if (visited.has(key)) return visited;

  if (x < 0 || x >= COLS || y < 0 || y >= ROWS || gameBoard[y][x] === null) {
    return visited;
  }

  const color = gameBoard[y][x];
  visited.add(key);

  // 上下左右をチェック
  getConnectedPuyo(x, y - 1, visited);
  getConnectedPuyo(x, y + 1, visited);
  getConnectedPuyo(x - 1, y, visited);
  getConnectedPuyo(x + 1, y, visited);

  // 同じ色のもののみ探索するようにフィルター
  return new Set([...visited].filter(pos => {
    const [px, py] = pos.split(',').map(Number);
    return gameBoard[py][px] === color;
  }));
}

// 重力を適用
function applyGravity() {
  for (let x = 0; x < COLS; x++) {
    let writePos = ROWS - 1;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (gameBoard[y][x] !== null) {
        gameBoard[writePos][x] = gameBoard[y][x];
        if (writePos !== y) {
          gameBoard[y][x] = null;
        }
        writePos--;
      }
    }
  }
}

// ゲームループ
function gameLoop() {
  if (!gameActive || gamePaused) return;

  dropCounter++;
  if (dropCounter >= dropSpeed) {
    dropCounter = 0;
    if (canMove(0, 1)) {
      currentPuyo.y++;
    } else {
      placePuyo();
    }
  }

  draw();

  if (gameActive && !gamePaused) {
    requestAnimationFrame(gameLoop);
  }
}

// 描画
function draw() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // グリッド描画
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  for (let i = 1; i < COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * BLOCK_SIZE, 0);
    ctx.lineTo(i * BLOCK_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let i = 1; i < ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * BLOCK_SIZE);
    ctx.lineTo(canvas.width, i * BLOCK_SIZE);
    ctx.stroke();
  }

  // ボードのぷよ描画
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (gameBoard[y][x] !== null) {
        drawBlock(x, y, gameBoard[y][x]);
      }
    }
  }

  // 現在のぷよペア描画
  if (currentPuyo && gameActive) {
    const blocks = currentPuyo.getBlocks();
    blocks.forEach(block => {
      if (block.y >= 0) {
        drawBlock(block.x, block.y, block.color, true);
      }
    });
  }
}

// ブロック描画
function drawBlock(x, y, color, isActive = false) {
  const px = x * BLOCK_SIZE + BLOCK_SIZE / 2;
  const py = y * BLOCK_SIZE + BLOCK_SIZE / 2;
  const radius = BLOCK_SIZE / 2 - 4;

  // 円を描画
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fill();

  // 外枠
  ctx.strokeStyle = isActive ? '#fff' : 'rgba(255,255,255,0.5)';
  ctx.lineWidth = isActive ? 2 : 1;
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.stroke();

  // ハイライト
  if (isActive) {
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, radius - 3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// 初期描画
initBoard();
draw();
