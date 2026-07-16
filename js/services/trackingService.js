/**
 * ============================================================
 * TEKNOVISTA.KIT
 * Order Tracking Service
 * ------------------------------------------------------------
 * Bertugas sebagai komunikasi antara Frontend dan Google Apps Script.
 * Tidak mengubah DOM.
 * Tidak membuat Toast.
 * Tidak membuat Modal.
 * Hanya mengirim request dan mengembalikan response.
 * ============================================================
 */

const TrackingService = {

    /**
     * Melacak pesanan berdasarkan Order ID dan Nomor WhatsApp
     * @param {string} orderId
     * @param {string} whatsapp
     * @returns {Promise<Object>}
     */
    async trackOrder(orderId, whatsapp) {

        if (!orderId || !whatsapp) {
            throw new Error("Order ID dan Nomor WhatsApp wajib diisi.");
        }

        const payload = {
            action: "track",
            orderId: String(orderId).trim(),
            whatsapp: String(whatsapp).trim()
        };

        console.group("🔎 [TRACKING SERVICE]");
        console.log("Endpoint :", APP_CONFIG.gasApiUrl);
        console.log("Payload  :", payload);

        try {

            const response = await fetch(APP_CONFIG.gasApiUrl, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status} ${response.statusText}`
                );
            }

            const result = await response.json();

            console.log("Response :", result);

            if (result.status !== "success") {
                throw new Error(
                    result.message || "Pesanan tidak ditemukan."
                );
            }

            console.groupEnd();

            return result.data;

        } catch (error) {

            console.error("[TRACKING SERVICE]", error);
            console.groupEnd();

            throw error;
        }

    }

};

window.TrackingService = TrackingService;