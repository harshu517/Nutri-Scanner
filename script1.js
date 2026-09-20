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

            document.getElementById("result").innerHTML =
                "✅ Scanned Successfully!<br><br>" +
                decodedText;

        },

        function(errorMessage) {
            // Keep scanning
        }

    ).then(function() {

        running = true;

        document.getElementById("result").innerHTML =
            "📷 Camera is ready...";

    }).catch(function(error) {

        document.getElementById("result").innerHTML =
            "❌ Camera could not be started.";

        console.log(error);

    });
}


/* Stop Scanner */

function stopScanner() {

    if (!scanner || !running) return;

    scanner.stop().then(function() {

        running = false;

        document.getElementById("result").innerHTML =
            "⏹ Scanner stopped.";

    }).catch(function(error) {

        console.log(error);

    });
}