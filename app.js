let barcodeResult = "";

// 1. Inisialisasi Scanner Barcode
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
    { facingMode: "environment" }, 
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (decodedText) => {
        barcodeResult = decodedText;
        alert("Barcode Terdeteksi: " + decodedText);
    }
);

// 2. Cek Status Koneksi
window.addEventListener('online', syncData);
window.addEventListener('offline', () => {
    document.getElementById('onlineStatus').innerText = "Offline (Mode Simpan Lokal)";
});

// 3. Simpan Data (Offline First)
function saveData() {
    const val = document.getElementById('pressureValue').value;
    const data = {
        id: Date.now(),
        barcode: barcodeResult,
        pressure: val,
        timestamp: new Date().toISOString()
    };

    let logs = JSON.parse(localStorage.getItem('manometer_logs') || "[]");
    logs.push(data);
    localStorage.setItem('manometer_logs', JSON.stringify(logs));

    alert("Data tersimpan di lokal!");
    if (navigator.onLine) syncData();
}

// 4. Upload Otomatis saat Online
async function syncData() {
    document.getElementById('onlineStatus').innerText = "Online - Mengirim data...";
    let logs = JSON.parse(localStorage.getItem('manometer_logs') || "[]");

    if (logs.length === 0) return;

    try {
        // Ganti URL dengan API endpoint servermu
        const response = await fetch('https://api-kamu.com/upload', {
            method: 'POST',
            body: JSON.stringify(logs),
            headers: {'Content-Type': 'application/json'}
        });

        if (response.ok) {
            localStorage.removeItem('manometer_logs');
            alert("Semua data lokal berhasil sinkron ke server!");
        }
    } catch (err) {
        console.log("Gagal sinkron, mungkin server down. Tetap di lokal.");
    }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}