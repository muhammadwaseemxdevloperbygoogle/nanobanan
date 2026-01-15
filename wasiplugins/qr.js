const QRCode = require('qrcode');

module.exports = {
    name: 'qr',
    aliases: ['qrcode', 'makeqr'],
    category: 'Utilities',
    desc: 'Generate QR code from text or URL',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_args } = context;

        if (!wasi_args) {
            return wasi_sock.sendMessage(wasi_sender, {
                text: '❌ *Please provide text or URL!*\n\nUsage: `.qr https://example.com`'
            });
        }

        try {
            // Generate QR code as buffer
            const qrBuffer = await QRCode.toBuffer(wasi_args, {
                type: 'png',
                width: 512,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            await wasi_sock.sendMessage(wasi_sender, {
                image: qrBuffer,
                caption: `📱 *QR Code Generated!*\n\n📝 *Content:*\n${wasi_args}`
            });

        } catch (error) {
            console.error('QR error:', error);
            await wasi_sock.sendMessage(wasi_sender, { text: '❌ Failed to generate QR code.' });
        }
    }
};
