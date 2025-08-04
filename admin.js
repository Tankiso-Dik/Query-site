document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const productsTableBody = document.querySelector('#productsTable tbody');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const imagePolishedContainer = document.getElementById('imagePolishedContainer');
    const featuresContainer = document.getElementById('featuresContainer');
    const tagsContainer = document.getElementById('tagsContainer');
    const categoriesContainer = document.getElementById('categoriesContainer');

    const API_URL = '/api/products';

    // Helper function to add a dynamic input field
    function addInput(container, type, data = {}) {
        const div = document.createElement('div');
        div.classList.add('dynamic-input-item');

        if (type === 'image') {
            const urlInput = document.createElement('input');
            urlInput.type = 'text';
            urlInput.value = data.url || '';
            urlInput.placeholder = 'Enter Image URL';
            urlInput.classList.add('dynamic-url-input');

            const altInput = document.createElement('input');
            altInput.type = 'text';
            altInput.value = data.alt || '';
            altInput.placeholder = 'Enter Alt Text';
            altInput.classList.add('dynamic-alt-input');

            div.appendChild(urlInput);
            div.appendChild(altInput);
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = data.value || '';
            input.placeholder = 'Enter value';
            input.classList.add('dynamic-simple-input');
            div.appendChild(input);
        }

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.type = 'button';
        removeButton.classList.add('btn-danger', 'remove-btn');
        removeButton.addEventListener('click', () => div.remove());

        div.appendChild(removeButton);
        container.appendChild(div);
    }

    // Function to fetch and display products
    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const products = await response.json();
            productsTableBody.innerHTML = '';
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
        productForm.reset();
        productIdInput.value = product.id;
        document.getElementById('listingName').value = product.listingName || '';
        document.getElementById('officialName').value = product.officialName || '';
        document.getElementById('description').value = product.description || '';
        document.getElementById('instructions').value = product.instructions || '';
        document.getElementById('googleDriveVideoUrl').value = product.googleDriveVideoUrl || '';
        document.getElementById('youtubeVideoUrl').value = product.youtubeVideoUrl || '';
        document.getElementById('gumroadUrl').value = product.gumroadUrl || '';
        document.getElementById('creativeMarketUrl').value = product.creativeMarketUrl || '';
        document.getElementById('etsyUrl').value = product.etsyUrl || '';
        document.getElementById('payhipUrl').value = product.payhipUrl || '';

        // Clear and populate dynamic fields
        [featuresContainer, imagePolishedContainer, tagsContainer, categoriesContainer].forEach(c => c.innerHTML = '');
        (product.features || []).forEach(value => addInput(featuresContainer, 'simple', { value }));
        (product.tags || []).forEach(value => addInput(tagsContainer, 'simple', { value }));
        (product.categories || []).forEach(value => addInput(categoriesContainer, 'simple', { value }));
        (product.imagePolished || []).forEach((url, i) => {
            addInput(imagePolishedContainer, 'image', { url, alt: (product.altText || [])[i] || '' });
        });
    }

    // Function to clear the form
    clearFormBtn.addEventListener('click', () => {
        productForm.reset();
        productIdInput.value = '';
        [featuresContainer, imagePolishedContainer, tagsContainer, categoriesContainer].forEach(c => c.innerHTML = '');
    });

    // Add event listeners for "Add" buttons
    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetContainer = document.getElementById(event.target.dataset.target);
            const type = event.target.dataset.type;
            addInput(targetContainer, type);
        });
    });

    // Handle form submission (Add/Edit)
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = productIdInput.value;

        const getSimpleInputValues = (container) => 
            Array.from(container.querySelectorAll('.dynamic-simple-input')).map(input => input.value.trim()).filter(Boolean);

        const getImageData = (container) => {
            const images = Array.from(container.querySelectorAll('.dynamic-input-item')).map(item => ({
                url: item.querySelector('.dynamic-url-input').value.trim(),
                alt: item.querySelector('.dynamic-alt-input').value.trim(),
            })).filter(img => img.url);
            return {
                imagePolished: images.map(img => img.url),
                altText: images.map(img => img.alt),
            };
        };

        const imageData = getImageData(imagePolishedContainer);

        const productData = {
            listingName: document.getElementById('listingName').value,
            officialName: document.getElementById('officialName').value,
            description: document.getElementById('description').value,
            features: getSimpleInputValues(featuresContainer),
            instructions: document.getElementById('instructions').value,
            imagePolished: imageData.imagePolished,
            altText: imageData.altText,
            googleDriveVideoUrl: document.getElementById('googleDriveVideoUrl').value,
            youtubeVideoUrl: document.getElementById('youtubeVideoUrl').value,
            gumroadUrl: document.getElementById('gumroadUrl').value,
            creativeMarketUrl: document.getElementById('creativeMarketUrl').value,
            etsyUrl: document.getElementById('etsyUrl').value,
            payhipUrl: document.getElementById('payhipUrl').value,
            tags: getSimpleInputValues(tagsContainer),
            categories: getSimpleInputValues(categoriesContainer),
        };

        try {
            const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                alert('Product saved successfully!');
                clearFormBtn.click();
                fetchProducts();
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
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Product deleted successfully!');
                fetchProducts();
            } else {
                const errorData = await response.json();
                alert(`Failed to delete product: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('An error occurred while deleting the product.');
        }
    }

    // Initial fetch of products
    fetchProducts();
});
