const gridSize = 20;
const tileCount = 20;
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let direction = {x: 1, y: 0};
let nextDirection = {x: 1, y: 0};
let score = 0;
let gameRunning = false;
let gameSpeed = 100;

const gameContainer = document.getElementById('gameContainer');
const scoreDisplay = document.getElementById('score');
const statusDisplay = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// ゲームボードの初期化
function initBoard() {
    gameContainer.innerHTML = '';
    gameContainer.style.display = 'grid';
    gameContainer.style.gridTemplateColumns = `repeat(${tileCount}, 1fr)`;
    gameContainer.style.gap = '1px';
    gameContainer.style.backgroundColor = '#333';
    gameContainer.style.padding = '10px';
    gameContainer.style.width = '400px';
    gameContainer.style.height = '400px';
    gameContainer.style.margin = '20px auto';
    
    for (let i = 0; i < tileCount * tileCount; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `tile-${i}`;
        gameContainer.appendChild(tile);
    }
}

// 描画処理
function draw() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.className = 'tile');
    
    // ヘビを描画
    snake.forEach((segment, index) => {
        const id = segment.y * tileCount + segment.x;
        const tile = document.getElementById(`tile-${id}`);
        if (tile) {
            tile.classList.add(index === 0 ? 'head' : 'body');
        }
    });
    
    // 食べ物を描画
    const foodId = food.y * tileCount + food.x;
    const foodTile = document.getElementById(`tile-${foodId}`);
    if (foodTile) {
        foodTile.classList.add('food');
    }
}

// ゲーム更新
function update() {
    direction = nextDirection;
    
    // 次の位置を計算
    const head = snake[0];
    const newHead = {
        x: (head.x + direction.x + tileCount) % tileCount,
        y: (head.y + direction.y + tileCount) % tileCount
    };
    
    // 自分自身に衝突したか確認
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(newHead);
    
    // 食べ物を食べたか確認
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
    
    draw();
}

// 食べ物を生成
function generateFood() {
    let newFood;
    let isOnSnake = true;
    
    while (isOnSnake) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    
    food = newFood;
}

// ゲームオーバー
function gameOver() {
    gameRunning = false;
    statusDisplay.textContent = `ゲームオーバー！ 最終スコア: ${score}`;
    startBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
    statusDisplay.style.color = 'red';
}

// ゲーム開始
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        statusDisplay.textContent = 'ゲーム中...';
        statusDisplay.style.color = '#666';
        startBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';
    }
}

// ゲームリセット
function resetGame() {
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    scoreDisplay.textContent = '0';
    gameRunning = false;
    statusDisplay.textContent = 'ゲーム開始: 矢印キーで操作';
    statusDisplay.style.color = '#666';
    startBtn.style.display = 'inline-block';
    resetBtn.style.display = 'none';
    draw();
}

// キー入力処理
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = {x: 0, y: -1};
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = {x: 0, y: 1};
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = {x: -1, y: 0};
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = {x: 1, y: 0};
            e.preventDefault();
            break;
    }
});

// ゲームループ
let gameLoopInterval;
function startGameLoop() {
    gameLoopInterval = setInterval(() => {
        if (gameRunning) {
            update();
        }
    }, gameSpeed);
}

// 初期化
initBoard();
draw();
startGameLoop();
