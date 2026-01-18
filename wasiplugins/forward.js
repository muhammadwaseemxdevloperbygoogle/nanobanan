module.exports = {
    name: 'forward',
    aliases: ['f'],
    category: 'Tools',
    desc: 'Forward a replied message to multiple JIDs (private, group, or newsletter)',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;

        // 1. Validate: Must be replying to a message
        const quotedContext = wasi_msg.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = quotedContext?.quotedMessage;

        if (!quotedContext || !quotedMessage) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please reply to a message you want to forward.' });
        }

        // 2. Validate: Must provide JIDs
        const inputArgs = wasi_args.join(' ');
        if (!inputArgs) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ Please provide destination JIDs separated by commas.\n\nExample: .f 123@s.whatsapp.net, 456@g.us' });
        }

        // 3. Parse JIDs
        // Split by comma, trim whitespace, and filter empty
        const targetJids = inputArgs.split(',').map(j => j.trim()).filter(j => j.length > 0);

        if (targetJids.length === 0) {
            return await wasi_sock.sendMessage(wasi_sender, { text: '❌ No valid JIDs found.' });
        }

        // 4. Construct a Virtual Message Object for Forwarding
        // Baileys expects a WebMessageInfo object to forward. We construct one from the quote.
        const virtualMsg = {
            key: {
                remoteJid: wasi_sender, // The chat where the message was quoted from
                fromMe: false,          // It wasn't sent by us (usually)
                id: quotedContext.stanzaId,
                participant: quotedContext.participant // The original sender
            },
            message: quotedMessage
        };

        await wasi_sock.sendMessage(wasi_sender, { text: `🔄 Forwarding to ${targetJids.length} targets...` });

        // 5. Forward Loop
        let successCount = 0;
        let failCount = 0;
        const failedJids = [];

        for (const jid of targetJids) {
            try {
                // Formatting JID if needed (user might forget @s.whatsapp.net for numbers)
                // Heuristic: If it's just digits, append @s.whatsapp.net. 
                // If it contains '-', likely group (@g.us). 
                // But users instructed "provide jid ids", so we assume they provide full JIDs or we can be smart.
                // Let's rely on raw JID first, but maybe clean input.

                let target = jid;
                // Basic cleanup if user pasted weird stuff
                target = target.replace(/\s/g, '');

                await wasi_sock.sendMessage(target, {
                    forward: virtualMsg,
                    force: true // Force forwarding even if it was forwarded before
                });
                successCount++;

                // Small delay to prevent rate limits
                await new Promise(r => setTimeout(r, 500));

            } catch (error) {
                console.error(`Forward failed for ${jid}:`, error.message);
                failCount++;
                failedJids.push(jid);
            }
        }

        // 6. Report
        let report = `✅ *Forwarding Complete*\n\n`;
        report += `📨 Sent: ${successCount}\n`;
        report += `❌ Failed: ${failCount}`;

        if (failCount > 0) {
            report += `\n\n*Failed JIDs:*\n${failedJids.join('\n')}`;
        }

        await wasi_sock.sendMessage(wasi_sender, { text: report });
    }
};
