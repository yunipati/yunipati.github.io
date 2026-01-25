// ボタンと表示エリアの要素を取得
const button = document.getElementById('time-button');
const displayArea = document.getElementById('display-area');

// ボタンをクリックした時の処理
button.addEventListener('click', () => {
    // 現在の日時を取得
    const now = new Date();
    
    // 読みやすい形式に変換
    const timeString = now.toLocaleString('ja-JP');
    
    // 画面に表示
    displayArea.textContent = "ボタンが押された日時: " + timeString;
});
