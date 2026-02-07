let startTime;
let timerId;
let isRunning = false;
const limit = 10000; // 10秒

const timerDisplay = document.getElementById('timer');
const actionBtn = document.getElementById('actionBtn');
const resultDisplay = document.getElementById('result');

actionBtn.addEventListener('click', () => {
    if (!isRunning) {
        startTimer();
    } else {
        stopTimer();
    }
});

function startTimer() {
    isRunning = true;
    actionBtn.textContent = '今だ！ストップ！';
    resultDisplay.innerHTML = '';
    startTime = Date.now();
    
    // 10ミリ秒ごとに更新
    timerId = setInterval(updateTimer, 10);
}

function updateTimer() {
    const elapsed = Date.now() - startTime;
    const remaining = (limit - elapsed) / 1000;
    
    // 残り3秒（表示が7.00以下）になったら隠す
    if (remaining <= 3) {
        timerDisplay.textContent = "???";
    } else {
        timerDisplay.textContent = remaining.toFixed(2);
    }

    // 0秒を超えてマイナスになっても、ユーザーが押すまで計測は継続
}

function stopTimer() {
    isRunning = false;
    actionBtn.textContent = 'もう一度遊ぶ';
    clearInterval(timerId);
    
    const stopTime = Date.now();
    const elapsed = stopTime - startTime;
    const diffSeconds = (limit - elapsed) / 1000;
    const absDiff = Math.abs(diffSeconds);

    // 最終的な数字を表示（マイナスも許容）
    timerDisplay.textContent = diffSeconds.toFixed(2);

    let statusClass = "";
    let statusText = "";

    // 0.5秒以内判定
    if (absDiff <= 0.5) {
        statusClass = "success";
        statusText = "【セーフ！】素晴らしい感覚です！";
    } else {
        statusClass = "fail";
        statusText = "【アウト！】ズレすぎです。";
    }

    resultDisplay.innerHTML = `
        誤差: ${absDiff.toFixed(2)} 秒<br>
        <span class="${statusClass}">${statusText}</span>
    `;
}
