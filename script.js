document.addEventListener('DOMContentLoaded', function() {
    const randomBtn = document.getElementById('randomBtn');
    const resultContainer = document.getElementById('result');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyBtn = document.getElementById('copyBtn');
    const statusIndicator = document.getElementById('status-indicator');

    async function checkBackendStatus() {
        try {
            const response = await fetch('/status');
            if (response.ok) {
                statusIndicator.classList.remove('status-offline');
                statusIndicator.classList.add('status-online');
            } else {
                statusIndicator.classList.remove('status-online');
                statusIndicator.classList.add('status-offline');
            }
        } catch (error) {
            statusIndicator.classList.remove('status-online');
            statusIndicator.classList.add('status-offline');
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

    checkBackendStatus();
});