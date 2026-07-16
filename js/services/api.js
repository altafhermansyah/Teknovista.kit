/**
 * AMERTA 2026 Official Order Website — Service Layer
 * Terintegrasi dengan Google Apps Script, Client-Side Compression, & Auto-Rename File
 */

/**
 * Fallback untuk file PDF (Tidak bisa dikompres via Canvas)
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

/**
 * ENGINE OPTIMALISASI: Kompresi Gambar HTML5 Canvas
 * Mengubah ukuran gambar besar menjadi maksimal lebar 800px dengan kualitas 70%
 */
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Lebar maksimal yang aman dan ringan
                let width = img.width;
                let height = img.height;

                // Kalkulasi rasio jika gambar terlalu besar
                if (width > MAX_WIDTH) {
                    height = Math.round((height *= MAX_WIDTH / width));
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Ekspor menjadi JPEG dengan kualitas 70% agar sangat ringan
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
                resolve(compressedBase64);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

const ApiService = {
    /**
     * Mengirim payload pesanan dan file bukti transfer ke Google Apps Script
     */
    submitOrder: async (orderPayload, fileObj) => {
        console.group('🚀 [API SERVICE] Memproses & Mengirim Pesanan');
        
        let finalBase64 = "";
        let finalType = fileObj.type;
        
        // --- 1. FITUR RENAME FILE OTOMATIS ---
        // Bersihkan nama pembeli dari karakter khusus agar aman di sistem (diganti underscore)
        const sanitizedName = orderPayload.nama.replace(/[^a-zA-Z0-9]/g, "_");
        let finalName = `Bukti_${sanitizedName}_${orderPayload.orderId}`;

        // --- 2. FITUR KOMPRESI & BASE64 ---
        if (fileObj.type.startsWith('image/')) {
            console.log('Sedang mengompresi gambar untuk mempercepat upload...');
            finalBase64 = await compressImage(fileObj);
            finalType = 'image/jpeg'; // Paksa ke JPEG karena hasil output canvas
            finalName += ".jpg"; // Tambahkan ekstensi gambar
        } else {
            console.log('File adalah PDF, melewati tahap kompresi...');
            finalBase64 = await fileToBase64(fileObj);
            // Ambil ekstensi asli (misal: .pdf)
            const ext = fileObj.name.split('.').pop();
            finalName += `.${ext}`;
        }

        // --- 3. SUSUN PAYLOAD AKHIR ---
        const finalPayload = {
            ...orderPayload,
            fileName: finalName,
            fileType: finalType,
            fileData: finalBase64
        };

        console.log('Target Endpoint:', APP_CONFIG.gasApiUrl);
        console.log('File Name Output:', finalName);
        
        try {
            // --- 4. KIRIM KE GOOGLE APPS SCRIPT ---
            const response = await fetch(APP_CONFIG.gasApiUrl, {
                method: 'POST',
                body: JSON.stringify(finalPayload)
            });
            
            const result = await response.json();
            
            if (result.status !== 'success') {
                throw new Error(result.message || 'Terjadi kesalahan pada server Google.');
            }
            
            console.groupEnd();
            return result;

        } catch (error) {
            console.error("API Submission Error:", error);
            console.groupEnd();
            throw error; 
        }
    }
};