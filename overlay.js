window.overlayAPI.setOverlayImage((imagePath) => {
    console.log("Overlay received image path:", imagePath);
    const overlayImage = document.getElementById("overlayImage");

    if (imagePath) {
        overlayImage.src = imagePath;
        console.log("Image src set to:", overlayImage.src);
    } else {
        console.error("Received empty image path!");
    }
});
