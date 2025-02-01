document.addEventListener("DOMContentLoaded", async () => {
    loadGallery();
});

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
        img.onclick = () => loadImageToCanvas(img.src);

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "🗑";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = () => deleteDrawing(filePath, imgContainer);

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        gallery.appendChild(imgContainer);
    });
}

function loadImageToCanvas(imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
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
