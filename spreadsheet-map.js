const SPREADSHEET_ID = '1kg6beAVSaljlWA3WFWgUxx5UlDsDkImbQmxkPWs1IhA';
const SHEET_GID = '0';
const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

const map = L.map('map').setView([36.2, 138.2], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = L.featureGroup().addTo(map);
const status = document.getElementById('status');
const reloadButton = document.getElementById('reload');

function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s_\-　]/g, '');
}

function findColumn(columns, aliases) {
  return columns.findIndex(column => aliases.some(alias => normalize(column.label) === normalize(alias)));
}

function getCellValue(cell) {
  if (!cell) return '';
  return cell.f ?? cell.v ?? '';
}

function extractPoints(table) {
  const columns = table.cols || [];
  const latitudeColumn = findColumn(columns, ['緯度', 'latitude', 'lat']);
  const longitudeColumn = findColumn(columns, ['経度', 'longitude', 'lon', 'lng', 'long']);
  if (latitudeColumn < 0 || longitudeColumn < 0) {
    throw new Error('緯度・経度の列が見つかりません。列名を「緯度」「経度」または latitude / longitude にしてください。');
  }

  const nameColumn = findColumn(columns, ['名称', '名前', '地点名', '施設名', 'name', 'title', '場所', '住所', 'address']);
  const rssiColumn = findColumn(columns, ['RSSI', '受信信号強度', '信号強度']);
  return (table.rows || []).flatMap((row, index) => {
    const cells = row.c || [];
    const latitude = Number(getCellValue(cells[latitudeColumn]));
    const longitude = Number(getCellValue(cells[longitudeColumn]));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return [];
    const name = nameColumn >= 0 ? String(getCellValue(cells[nameColumn])).trim() : '';
    const rssi = rssiColumn >= 0 ? String(getCellValue(cells[rssiColumn])).trim() : '';
    return [{ latitude, longitude, name: name || `地点 ${index + 1}`, rssi }];
  });
}

function showPoints(points) {
  markers.clearLayers();
  points.forEach(point => {
    const popup = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'popup-title';
    title.textContent = point.name;
    const coordinates = document.createElement('div');
    coordinates.className = 'popup-coordinate';
    coordinates.textContent = `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
    popup.append(title, coordinates);
    if (point.rssi) {
      const rssi = document.createElement('div');
      rssi.className = 'popup-rssi';
      rssi.textContent = `RSSI: ${point.rssi}`;
      popup.append(rssi);
    }
    L.marker([point.latitude, point.longitude]).bindPopup(popup).addTo(markers);
  });
  if (points.length) map.fitBounds(markers.getBounds(), { padding: [32, 32], maxZoom: 15 });
  status.textContent = points.length ? `${points.length} 件の地点を表示しています` : '有効な緯度・経度のデータがありません';
  status.classList.toggle('error', points.length === 0);
}

async function loadSheet() {
  reloadButton.disabled = true;
  status.classList.remove('error');
  status.textContent = 'スプレッドシートを読み込んでいます…';
  try {
    const response = await fetch(sheetUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Google Sheetsからデータを取得できませんでした (HTTP ${response.status})`);
    const text = await response.text();
    const jsonText = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    if (!jsonText || jsonText === '{}') throw new Error('シートのデータを読み取れませんでした');
    const result = JSON.parse(jsonText);
    if (result.status !== 'ok') throw new Error('シートのデータを読み取れませんでした');
    showPoints(extractPoints(result.table));
  } catch (error) {
    status.textContent = `${error.message}。シートの共有設定を「リンクを知っている全員が閲覧可」にして、緯度・経度の列があることを確認してください。`;
    status.classList.add('error');
    console.error(error);
  } finally {
    reloadButton.disabled = false;
  }
}

reloadButton.addEventListener('click', loadSheet);
loadSheet();
