let scanner = null;
let running = false;

/* Start Scanner */
function startScanner() {
    if (running) return;

    scanner = new Html5Qrcode("reader");

    const config = {
        fps: 10,
        qrbox: {
            width: 280,
            height: 180
        }
    };

    scanner.start(
        { facingMode: "environment" },
        config,

        function(decodedText) {
            // Display loading state
            document.getElementById("result").innerHTML = `
                <p>🔍 Barcode: <b>${decodedText}</b></p>
                <p style="color: #ffcc00; margin-top: 8px;">⏳ Fetching product details...</p>
            `;

            stopScanner();

            // Call function to fetch product details
            getProductDetails(decodedText);
        },

        function(errorMessage) {
            // Keep scanning silently
        }

    ).then(function() {
        running = true;
        document.getElementById("result").innerHTML = "📷 Camera is ready...";
    }).catch(function(error) {
        document.getElementById("result").innerHTML = "❌ Could not start camera.";
        console.error(error);
    });
}

/* Fetch Product Details */
async function getProductDetails(barcode) {
    const resultBox = document.getElementById("result");

    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        const data = await response.json();

        if (data.status === 1 && data.product) {
            const prod = data.product;
            const name = prod.product_name || "Unknown Product";
            const brand = prod.brands || "Unknown Brand";
            const calories = prod.nutriments ? (prod.nutriments["energy-kcal_100g"] || "N/A") : "N/A";
            const image = prod.image_front_url || "";

            resultBox.innerHTML = `
                <div style="text-align: left; margin-top: 10px; color: #fff;">
                    ${image ? `<img src="${image}" style="width: 100px; display: block; margin: 0 auto 10px auto; border-radius: 8px;">` : ""}
                    <p><b>🏷️ Product:</b> ${name}</p>
                    <p><b>🏢 Brand:</b> ${brand}</p>
                    <p><b>🔥 Calories (100g):</b> ${calories} kcal</p>
                    <p><b>🔢 Barcode:</b> ${barcode}</p>
                </div>
            `;
        } else {
            resultBox.innerHTML = `
                <p><b>Barcode:</b> ${barcode}</p>
                <p style="color: #ffaa00; margin-top: 8px;">⚠️ Product not found in database.</p>
            `;
        }
    } catch (err) {
        console.error(err);
        resultBox.innerHTML = `<p style="color: red;">❌ Failed to connect to server.</p>`;
    }
}

/* Stop Scanner */
function stopScanner() {
    if (!scanner || !running) return;

    scanner.stop().then(function() {
        running = false;
    }).catch(function(error) {
        console.error(error);
    });
}
