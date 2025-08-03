document.addEventListener('DOMContentLoaded', function() {
    const randomBtn = document.getElementById('randomBtn');
    const resultContainer = document.getElementById('result');
    const productName = document.getElementById('productName');
    const productOfficial = document.getElementById('productOfficial');
    const productThumbnail = document.getElementById('productThumbnail');
    const productDescription = document.getElementById('productDescription');
    const productInstructions = document.getElementById('productInstructions');
    const previewImagesDisplay = document.getElementById('previewImagesDisplay');
    const screenshotsDisplay = document.getElementById('screenshotsDisplay');
    const driveLink = document.getElementById('driveLink');
    const youtubeLink = document.getElementById('youtubeLink');
    const platformName = document.getElementById('platformName');
    const platformUrl = document.getElementById('platformUrl');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyBtn = document.getElementById('copyBtn');

    // Helper function to display images
    function displayImages(container, imageUrls) {
        container.innerHTML = ''; // Clear previous images
        if (imageUrls && imageUrls.length > 0) {
            imageUrls.forEach(url => {
                if (url.trim() !== '') {
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = 'Product Image';
                    img.classList.add('product-image-gallery');
                    container.appendChild(img);
                }
            });
        }
    }

    randomBtn.addEventListener('click', async function() {
        randomBtn.textContent = 'Loading...';
        randomBtn.disabled = true;
        
        try {
            const response = await fetch('/random-product');
            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
                return;
            }
            
            // Display product info
            productName.textContent = data.listingName;
            productOfficial.textContent = data.officialName;
            productDescription.textContent = data.description || '';
            productInstructions.textContent = data.instructions || '';

            // Display thumbnail
            if (data.thumbnail) {
                productThumbnail.src = data.thumbnail;
                productThumbnail.style.display = 'block';
            } else {
                productThumbnail.style.display = 'none';
            }

            // Display preview images and screenshots
            displayImages(previewImagesDisplay, data.previewImages);
            displayImages(screenshotsDisplay, data.screenshots);
            
            // Set video links
            driveLink.href = data.googleDriveVideoUrl;
            youtubeLink.href = data.youtubeVideoUrl;
            
            // Set platform info
            platformName.textContent = data.selectedPlatform.charAt(0).toUpperCase() + data.selectedPlatform.slice(1);
            platformUrl.href = data.selectedUrl;
            
            // Display JSON
            jsonOutput.value = JSON.stringify(data, null, 2);
            
            // Show result
            resultContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error fetching product. Please try again.');
        } finally {
            randomBtn.textContent = 'Get Random Product';
            randomBtn.disabled = false;
        }
    });

    copyBtn.addEventListener('click', function() {
        jsonOutput.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});