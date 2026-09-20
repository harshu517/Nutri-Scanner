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
            document.getElementById("result").innerHTML = `
                <p>🔍 Barcode: <b>${decodedText}</b></p>
                <p style="color: #ffcc00; margin-top: 8px;">⏳ Loading nutrition & product details...</p>
            `;

            stopScanner();
            fetchFullProductDetails(decodedText);
        },

        function(errorMessage) {
            // Keep scanning
        }

    ).then(function() {
        running = true;
        document.getElementById("result").innerHTML = "📷 Camera is ready...";
    }).catch(function(error) {
        document.getElementById("result").innerHTML = "❌ Could not access camera.";
        console.error(error);
    });
}

/* Fetch Full Product Details */
async function fetchFullProductDetails(barcode) {
    const resultBox = document.getElementById("result");

    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        const data = await response.json();

        if (data.status === 1 && data.product) {
            const p = data.product;
            const name = p.product_name || "Unknown Product";
            const brand = p.brands || "Unknown Brand";
            const image = p.image_front_url || "";
            const quantity = p.quantity || "N/A";
            
            // Nutrition data (per 100g)
            const nutriments = p.nutriments || {};
            const calories = nutriments["energy-kcal_100g"] !== undefined ? `${nutriments["energy-kcal_100g"]} kcal` : "N/A";
            const protein = nutriments["proteins_100g"] !== undefined ? `${nutriments["proteins_100g"]} g` : "N/A";
            const fat = nutriments["fat_100g"] !== undefined ? `${nutriments["fat_100g"]} g` : "N/A";
            const carbs = nutriments["carbohydrates_100g"] !== undefined ? `${nutriments["carbohydrates_100g"]} g` : "N/A";
            const sugar = nutriments["sugars_100g"] !== undefined ? `${nutriments["sugars_100g"]} g` : "N/A";

            // Shelf life info from database (if available)
            const expirationInfo = p.expiration_date || p.shelf_life || "Check physical packet stamp";

            resultBox.innerHTML = `
                <div style="text-align: left; margin-top: 15px; color: #fff; font-size: 14px;">
                    ${image ? `<img src="${image}" alt="${name}" style="width: 110px; display: block; margin: 0 auto 15px auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);">` : ""}
                    
                    <h3 style="color: #00eaff; margin-bottom: 8px; font-size: 18px;">${name}</h3>
                    <p><b>🏢 Brand:</b> ${brand}</p>
                    <p><b>📦 Quantity:</b> ${quantity}</p>
                    <p><b>🔢 Barcode:</b> ${barcode}</p>

                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 12px 0;">

                    <h4 style="color: #ffcc00; margin-bottom: 6px;">⚡ Nutrition (per 100g):</h4>
                    <p>• <b>Calories:</b> ${calories}</p>
                    <p>• <b>Protein:</b> ${protein}</p>
                    <p>• <b>Total Fat:</b> ${fat}</p>
                    <p>• <b>Carbohydrates:</b> ${carbs}</p>
                    <p>• <b>Sugars:</b> ${sugar}</p>

                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 12px 0;">

                    <h4 style="color: #ff0080; margin-bottom: 6px;">📅 Date Information:</h4>
                    <p><b>• Expiry / Shelf Life:</b> ${expirationInfo}</p>
                    <p style="font-size: 12px; color: #aaa; margin-top: 4px;">
                        ℹ️ <i>Note: Exact Mfg & Exp dates vary per batch and are stamped directly on the packaging.</i>
                    </p>
                </div>
            `;
        } else {
            resultBox.innerHTML = `
                <div style="color: #ff9999; margin-top: 10px;">
                    <p><b>Barcode:</b> ${barcode}</p>
                    <p style="margin-top: 8px;">⚠️ Product not found in database.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error(err);
        resultBox.innerHTML = `<p style="color: #ff5555;">❌ Error connecting to database.</p>`;
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
