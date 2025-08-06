const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'products');
const platformsPath = path.join(__dirname, 'platforms.json');

function loadPlatforms() {
  try {
    const data = fs.readFileSync(platformsPath, 'utf8');
    const platforms = JSON.parse(data);
    if (!Array.isArray(platforms) || platforms.length === 0) {
      console.error('❌ platforms.json not found or contains no platforms.');
      process.exit(0);
    }
    return platforms;
  } catch (err) {
    console.error('❌ platforms.json not found or contains no platforms.');
    process.exit(0);
  }
}

function loadProducts() {
  let files;
  try {
    files = fs.readdirSync(productsDir);
  } catch (err) {
    console.error('❌ No valid product JSONs found in /products.');
    process.exit(0);
  }

  const validProducts = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(productsDir, file);
    let product;
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      product = JSON.parse(data);
    } catch (err) {
      console.log(`⚠️ Skipped: ${file} → invalid JSON`);
      continue;
    }

    const missingFields = [];
    if (typeof product.listingName !== 'string' || product.listingName.trim() === '') missingFields.push('listingName');
    if (typeof product.officialName !== 'string' || product.officialName.trim() === '') missingFields.push('officialName');
    if (!Array.isArray(product.imagePolished) || product.imagePolished.length === 0 || !product.imagePolished.every(img => typeof img === 'string' && img.trim() !== '')) missingFields.push('imagePolished');
    if (typeof product.selectedPlatform !== 'string' || product.selectedPlatform.trim() === '') missingFields.push('selectedPlatform');
    if (typeof product.selectedUrl !== 'string' || product.selectedUrl.trim() === '') missingFields.push('selectedUrl');

    if (missingFields.length > 0) {
      console.log(`⚠️ Skipped: ${file} → missing fields: ${missingFields.join(', ')}`);
      continue;
    }

    validProducts.push({ file, data: product });
  }

  return validProducts;
}

const platforms = loadPlatforms();
const selectedPlatform = platforms[Math.floor(Math.random() * platforms.length)];
const products = loadProducts().filter(p => p.data.selectedPlatform === selectedPlatform);

if (products.length === 0) {
  console.error('❌ No valid product JSONs found in /products.');
  process.exit(0);
}

const chosen = products[Math.floor(Math.random() * products.length)];

console.log(`🎲 Selected Product: ${chosen.file}`);
console.log(`📝 Listing Name: ${chosen.data.listingName}`);
console.log(`🏷️ Official Name: ${chosen.data.officialName}`);
console.log(`📌 Selected Platform: ${selectedPlatform}`);
console.log(`🔗 URL: ${chosen.data.selectedUrl}`);
console.log('🖼️ Images:');
chosen.data.imagePolished.forEach(img => console.log(`- ${img}`));
