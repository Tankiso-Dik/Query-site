document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const productsTableBody = document.querySelector('#productsTable tbody');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const previewImagesContainer = document.getElementById('previewImagesContainer');
    const screenshotsContainer = document.getElementById('screenshotsContainer');
    const featuresContainer = document.getElementById('featuresContainer');

    const API_URL = '/api/products';

    // Helper function to add a URL input field
    function addUrlInput(container, value = '') {
        const div = document.createElement('div');
        div.classList.add('dynamic-input-item');

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.placeholder = 'Enter URL';
        input.classList.add('dynamic-url-input');

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('btn-danger', 'remove-url-btn');
        removeButton.addEventListener('click', () => {
            div.remove();
        });

        div.appendChild(input);
        div.appendChild(removeButton);
        container.appendChild(div);
    }

    // Function to fetch and display products
    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            const products = await response.json();
            productsTableBody.innerHTML = ''; // Clear existing rows
            products.forEach(product => {
                const row = productsTableBody.insertRow();
                row.insertCell(0).textContent = product.id;
                row.insertCell(1).textContent = product.listingName;
                row.insertCell(2).textContent = product.officialName;
                const actionsCell = row.insertCell(3);

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.classList.add('btn-secondary');
                editButton.addEventListener('click', () => editProduct(product));
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('btn-danger');
                deleteButton.addEventListener('click', () => deleteProduct(product.id));
                actionsCell.appendChild(deleteButton);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Failed to load products.');
        }
    }

    // Function to populate form for editing
    function editProduct(product) {
        productIdInput.value = product.id;
        document.getElementById('listingName').value = product.listingName || '';
        document.getElementById('officialName').value = product.officialName || '';
        document.getElementById('imagePolished').value = product.imagePolished || '';
        document.getElementById('videoUrl').value = product.videoUrl || '';
        document.getElementById('googleDriveVideoUrl').value = product.googleDriveVideoUrl || '';
        document.getElementById('youtubeVideoUrl').value = product.youtubeVideoUrl || '';
        document.getElementById('gumroadUrl').value = product.gumroadUrl || '';
        document.getElementById('etsyUrl').value = product.etsyUrl || '';
        document.getElementById('creativeMarketUrl').value = product.creativeMarketUrl || '';
        document.getElementById('payhipUrl').value = product.payhipUrl || '';
        document.getElementById('features').value = (product.features || []).join(', ');
        document.getElementById('description').value = product.description || '';
        document.getElementById('instructions').value = product.instructions || '';
        document.getElementById('thumbnail').value = product.thumbnail || '';

        // Clear existing dynamic inputs
        previewImagesContainer.innerHTML = '';
        screenshotsContainer.innerHTML = '';
        featuresContainer.innerHTML = '';

        // Populate dynamic inputs for previewImages
        (product.previewImages || []).forEach(url => addUrlInput(previewImagesContainer, url));
        // Populate dynamic inputs for screenshots
        (product.screenshots || []).forEach(url => addUrlInput(screenshotsContainer, url));
        // Populate dynamic inputs for features
        (product.features || []).forEach(feature => addUrlInput(featuresContainer, feature));
    }

    // Function to clear the form
    clearFormBtn.addEventListener('click', () => {
        productForm.reset();
        productIdInput.value = '';
        previewImagesContainer.innerHTML = ''; // Clear dynamic inputs
        screenshotsContainer.innerHTML = ''; // Clear dynamic inputs
        featuresContainer.innerHTML = ''; // Clear dynamic inputs
    });

    // Add event listeners for "Add URL" buttons
    document.querySelectorAll('.add-url-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetContainerId = event.target.dataset.target;
            const container = document.getElementById(targetContainerId);
            addUrlInput(container);
        });
    });

    // Handle form submission (Add/Edit)
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = productIdInput.value;

        // Function to get values from dynamic inputs
        const getDynamicInputValues = (container) => {
            return Array.from(container.querySelectorAll('.dynamic-url-input'))
                        .map(input => input.value.trim())
                        .filter(value => value !== '');
        };

        const productData = {
            listingName: document.getElementById('listingName').value,
            officialName: document.getElementById('officialName').value,
            imagePolished: document.getElementById('imagePolished').value,
            videoUrl: document.getElementById('videoUrl').value,
            googleDriveVideoUrl: document.getElementById('googleDriveVideoUrl').value,
            youtubeVideoUrl: document.getElementById('youtubeVideoUrl').value,
            gumroadUrl: document.getElementById('gumroadUrl').value,
            etsyUrl: document.getElementById('etsyUrl').value,
            creativeMarketUrl: document.getElementById('creativeMarketUrl').value,
            payhipUrl: document.getElementById('payhipUrl').value,
            features: document.getElementById('features').value.split(',').map(f => f.trim()).filter(f => f !== ''),
            description: document.getElementById('description').value,
            instructions: document.getElementById('instructions').value,
            thumbnail: document.getElementById('thumbnail').value,
            previewImages: getDynamicInputValues(previewImagesContainer),
            screenshots: getDynamicInputValues(screenshotsContainer)
        };

        try {
            let response;
            if (id) {
                // Update existing product
                response = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
            } else {
                // Add new product
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
            }

            if (response.ok) {
                alert('Product saved successfully!');
                productForm.reset();
                productIdInput.value = '';
                previewImagesContainer.innerHTML = ''; // Clear dynamic inputs
                screenshotsContainer.innerHTML = ''; // Clear dynamic inputs
                fetchProducts(); // Refresh the list
            } else {
                const errorData = await response.json();
                alert(`Failed to save product: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('An error occurred while saving the product.');
        }
    });

    // Function to delete a product
    async function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Product deleted successfully!');
                fetchProducts(); // Refresh the list
            } else {
                const errorData = await response.json();
                alert(`Failed to delete product: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('An error occurred while deleting the product.');
        }
    }

    // Initial fetch of products when the page loads
    fetchProducts();
});