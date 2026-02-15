let map;
let marker;
let circle;

// 地図の初期化
function initMap() {
    // デフォルト位置（日本の中心）
    map = L.map('map').setView([35.6762, 139.6503], 13);

    // タイルレイヤーの追加（OpenStreetMap）
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
}

// 位置情報の取得と地図への表示
function getLocation() {
    const status = document.getElementById('status');
    const coordinates = document.getElementById('coordinates');

    if ('geolocation' in navigator) {
        status.textContent = '位置情報を取得中...';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // 既存のマーカーと円を削除
                if (marker) {
                    map.removeLayer(marker);
                }
                if (circle) {
                    map.removeLayer(circle);
                }

                // 地図の中心を移動
                map.setView([lat, lng], 15);

                // マーカーを追加
                marker = L.marker([lat, lng])
                    .bindPopup(`<strong>現在位置</strong><br>緯度: ${lat.toFixed(6)}<br>経度: ${lng.toFixed(6)}<br>精度: ${accuracy.toFixed(1)}m`)
                    .addTo(map)
                    .openPopup();

                // 精度を示す円を追加
                circle = L.circle([lat, lng], {
                    radius: accuracy,
                    color: 'blue',
                    fillColor: '#30f',
                    fillOpacity: 0.1,
                    weight: 2
                }).addTo(map);

                // 座標情報を表示
                coordinates.innerHTML = `
                    <strong>位置情報:</strong><br>
                    緯度: ${lat.toFixed(6)}<br>
                    経度: ${lng.toFixed(6)}<br>
                    精度: ±${accuracy.toFixed(1)}m
                `;

                status.textContent = '✓ 位置情報を取得しました';
                status.style.color = 'green';
            },
            function(error) {
                let errorMsg = '位置情報の取得に失敗しました';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = '位置情報へのアクセスが拒否されています。ブラウザの設定を確認してください。';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = '位置情報が利用できません。';
                        break;
                    case error.TIMEOUT:
                        errorMsg = '位置情報の取得がタイムアウトしました。';
                        break;
                }
                
                status.textContent = '✗ ' + errorMsg;
                status.style.color = 'red';
                console.error('Error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        status.textContent = '✗ このブラウザは位置情報をサポートしていません';
        status.style.color = 'red';
    }
}

// ページロード時の処理
window.addEventListener('load', function() {
    initMap();
    getLocation();

    // 更新ボタンのイベントリスナー
    document.getElementById('refreshBtn').addEventListener('click', getLocation);
});
