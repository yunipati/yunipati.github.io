// 初期化
document.getElementById('convertBtn').addEventListener('click', () => {
  const inputValue = document.getElementById('inputNumber').value;
  convertNumber(inputValue);
});

// Enterキーで変換
document.getElementById('inputNumber').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const inputValue = document.getElementById('inputNumber').value;
    convertNumber(inputValue);
  }
});

// 数値変換関数
function convertNumber(input) {
  // 入力値を数値に変換
  const decimal = parseInt(input, 10);

  // 入力値が有効な数値かチェック
  if (isNaN(decimal)) {
    alert('有効な10進数を入力してください。');
    return;
  }

  // 2進数に変換
  const binary = decimal.toString(2);
  
  // 8進数に変換
  const octal = decimal.toString(8);
  
  // 16進数に変換（大文字）
  const hexadecimal = decimal.toString(16).toUpperCase();
  
  // 16進数に変換（小文字）
  const hexadecimalLower = decimal.toString(16);

  // 結果を表示
  document.getElementById('binaryResult').textContent = binary;
  document.getElementById('octalResult').textContent = octal;
  document.getElementById('hexResult').textContent = hexadecimal;

  // 詳細情報を表示
  document.getElementById('decimalInfo').textContent = decimal;
  document.getElementById('hexLowerInfo').textContent = hexadecimalLower;
  document.getElementById('octalInfo').textContent = octal;
  document.getElementById('negativeInfo').textContent = -decimal;

  // 入力フィールドも更新
  document.getElementById('inputNumber').value = decimal;
}

// クリップボードにコピー
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent;

  // テキストをクリップボードにコピー
  navigator.clipboard.writeText(text).then(() => {
    // コピー成功時の視覚的フィードバック
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'コピーしました!';
    
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(() => {
    alert('コピーに失敗しました。');
  });
}

// ページロード時に初期値で変換
window.addEventListener('load', () => {
  convertNumber(255);
});
