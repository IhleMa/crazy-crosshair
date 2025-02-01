document.addEventListener("DOMContentLoaded", async () => {
    loadGallery();
});

let currentFilePath = null; // Stores the currently loaded file path

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // Clear the gallery before loading

    const images = await window.electronAPI.loadGallery();
    
    images.forEach(filePath => {
        const imgContainer = document.createElement("div");
        imgContainer.className = "gallery-item";

        const img = document.createElement("img");
        img.src = `file://${filePath}`;
        img.className = "gallery-img";
        img.onclick = () => loadImageToCanvas(img.src, filePath); // Pass filePath

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "🗑";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = () => deleteDrawing(filePath, imgContainer);

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        gallery.appendChild(imgContainer);
    });
}

function loadImageToCanvas(imageSrc, filePath) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        currentFilePath = filePath; // Store file path for overwriting
    };
}

function deleteDrawing(filePath, imgContainer) {
    window.electronAPI.deleteDrawing(filePath);
    window.electronAPI.onDeleteResponse(response => {
        if (response.success) {
            imgContainer.remove();
        } else {
            alert("Error deleting file: " + response.error);
        }
    });
}

function saveCanvas() {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(canvas, 0, 0);
    const dataUrl = tempCanvas.toDataURL("image/png");

    // If editing an existing file, overwrite it
    if (currentFilePath) {
        window.electronAPI.saveImage(dataUrl, currentFilePath);
    } else {
        window.electronAPI.saveImage(dataUrl, null); // Save as new if no file is loaded
    }

}

