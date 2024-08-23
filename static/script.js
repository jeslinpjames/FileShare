function updateSpeed(speedMbps, speedMBps) {
    const downloadSpeedElem = document.getElementById('download-speed');
    const downloadSpeedMBElem = document.getElementById('download-speed-MB');
    if (downloadSpeedElem && downloadSpeedMBElem) {
        downloadSpeedElem.textContent = speedMbps.toFixed(2);
        downloadSpeedMBElem.textContent = speedMBps.toFixed(2);
    }

    const uploadSpeedElem = document.getElementById('upload-speed');
    const uploadSpeedMBElem = document.getElementById('upload-speed-MB');
    if (uploadSpeedElem && uploadSpeedMBElem) {
        uploadSpeedElem.textContent = speedMbps.toFixed(2);
        uploadSpeedMBElem.textContent = speedMBps.toFixed(2);
    }
}
