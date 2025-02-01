document.addEventListener("DOMContentLoaded", async () => {
    loadGallery();
});

let currentFilePath = null; // Stores the currently loaded file path

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // Clear gallery before reloading

    // Check if the placeholder already exists
    if (!document.getElementById("new-drawing-placeholder")) {
        const newDrawingPlaceholder = document.createElement("div");
        newDrawingPlaceholder.className = "gallery-item";
        newDrawingPlaceholder.id = "new-drawing-placeholder"; // Unique ID
        newDrawingPlaceholder.innerText = "+";
        newDrawingPlaceholder.onclick = createNewDrawing;
        gallery.appendChild(newDrawingPlaceholder);
    }

    const images = await window.electronAPI.loadGallery();
    
    images.forEach(filePath => {
        // Prevent duplicate images
        if (document.querySelector(`[data-path="${filePath}"]`)) return;

        const imgContainer = document.createElement("div");
        imgContainer.className = "gallery-item";
        imgContainer.setAttribute("data-path", filePath); // Unique identifier

        const img = document.createElement("img");
        img.src = `file://${filePath}?t=${new Date().getTime()}`; // Prevents caching issues
        img.className = "gallery-img";
        img.onclick = () => loadImageToCanvas(img.src, filePath);

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "🗑";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = () => deleteDrawing(filePath, imgContainer);

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        gallery.appendChild(imgContainer);
    });
}



function createNewDrawing() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentFilePath = null; // Ensure new drawings don’t overwrite old ones
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

    if (currentFilePath) {
        window.electronAPI.saveImage(dataUrl, currentFilePath);
    } else {
        window.electronAPI.saveImage(dataUrl, null);
    }

    window.electronAPI.onSaveResponse((response) => {
        if (response.success) {
            console.log("Image saved:", response.path);
            setTimeout(loadGallery, 500); // Silent refresh
        } else {
            console.error("Save failed:", response.error);
        }
    });
}







