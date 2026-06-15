export async function onRequestPost(context) {
    // context.request berisi data yang dikirim dari HTML
    // context.env berisi variabel rahasia (Environment Variables)
    const { request, env } = context;

    try {
        // 1. Ambil data JSON dari frontend (Nama & Nomor)
        const data = await request.json();
        const { nama, nomor } = data;

        // Validasi sederhana
        if (!nama || !nomor) {
            return new Response(JSON.stringify({ success: false, error: "Nama dan Nomor wajib diisi" }), { status: 400 });
        }

        // 2. Tentukan isi pesan otomatis
        const pesanTeks = `Halo ${nama}! Terima kasih sudah mengisi form kami. Ini adalah pesan otomatis dari sistem.`;

        // 3. Format data untuk wa-api.id (application/x-www-form-urlencoded)
        const urlEncodedData = new URLSearchParams();
        urlEncodedData.append('target', nomor);
        urlEncodedData.append('message', pesanTeks);

        // 4. Kirim request ke wa-api.id menggunakan rahasia dari env.WA_TOKEN
        const waResponse = await fetch('https://wa-api.id/api/v1/send', {
            method: 'POST',
            headers: {
                // WA_TOKEN akan kita atur di Dashboard Cloudflare
                'Authorization': `Bearer ${env.WA_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncodedData
        });

        const waResult = await waResponse.json();

        // 5. Kembalikan respon sukses ke HTML
        return new Response(JSON.stringify({ success: true, api_response: waResult }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}