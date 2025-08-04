const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Status endpoint
app.get('/status', (req, res) => {
    res.status(200).send('OK');
});

// Get random product
app.get('/random-product', async (req, res) => {
    try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
        const products = JSON.parse(data);
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'No products available' });
        }
        
        const randomIndex = Math.floor(Math.random() * products.length);
        const product = products[randomIndex];
        
        const platforms = ['gumroad', 'etsy', 'creativeMarket', 'payhip']
            .map(platform => ({
                name: platform,
                url: product[`${platform}Url`]
            }))
            .filter(platform => platform.url && platform.url.trim() !== '');
        
        const randomPlatform = platforms.length > 0 ? platforms[Math.floor(Math.random() * platforms.length)] : { name: 'none', url: '' };
        
        const result = {
            listingName: product.listingName || '',
            officialName: product.officialName || '',
            description: product.description || '',
            features: product.features || [],
            instructions: product.instructions || '',
            imagePolished: product.imagePolished || [],
            altText: product.altText || [],
            googleDriveVideoUrl: product.googleDriveVideoUrl || '',
            youtubeVideoUrl: product.youtubeVideoUrl || '',
            selectedPlatform: randomPlatform.name,
            selectedUrl: randomPlatform.url,
            gumroadUrl: product.gumroadUrl || '',
            creativeMarketUrl: product.creativeMarketUrl || '',
            etsyUrl: product.etsyUrl || '',
            payhipUrl: product.payhipUrl || '',
            tags: product.tags || [],
            categories: product.categories || []
        };
        
        res.json(result);
    } catch (error) {
        console.error('Error getting random product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.json([]);
        }
        console.error('Error reading products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new product
app.post('/api/products', async (req, res) => {
    try {
        let products = [];
        try {
            const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
            products = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
        
        const newProduct = {
            ...req.body,
            id: Date.now().toString()
        };
        
        products.push(newProduct);
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
        let products = JSON.parse(data);
        
        const index = products.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const id = products[index].id;
        products[index] = { ...req.body, id };
        
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        
        res.json(products[index]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
        let products = JSON.parse(data);
        
        const filteredProducts = products.filter(p => p.id !== req.params.id);
        
        if (filteredProducts.length === products.length) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        await fs.writeFile(PRODUCTS_FILE, JSON.stringify(filteredProducts, null, 2));
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
