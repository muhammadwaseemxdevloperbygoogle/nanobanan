const { wasi_getBotConfig, wasi_updateBotConfig } = require('../wasilib/database');
const config = require('../wasi');

// Extended Emoji Sets
const emojis = ['❤', '💕', '😻', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '🙂', '🤗', '😊', '🎊', '🎉', '🎁', '🎈', '👋'];
const mojis = ['💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '❤️‍', '🔥', '❤️‍', '🩹', '💯', '♨️', '💢', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🌐', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄️', '🎴', '🎭️', '🔇', '🔈️', '🔉', '🔊', '🔔', '🔕', '🎼', '🎵', '🎶', '💹', '🏧', '🚮', '🚰', '♿️', '🚹️', '🚺️', '🚻', '🚼️', '🚾', '🛂', '🛃', '🛄', '🛅', '⚠️', '🚸', '⛔️', '🚫', '🚳', '🚭️', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '⛎', '🔀', '🔁', '🔂', '▶️', '⏩️', '⏭️', '⏯️', '◀️', '⏪️', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴', '♀️', '♂️', '⚧', '✖️', '➕', '➖', '➗', '♾️', '‼️', '⁉️', '❓️', '❔', '❕', '❗️', '〰️', '💱', '💲', '⚕️', '♻️', '⚜️', '🔱', '📛', '🔰', '⭕️', '✅', '☑️', '✔️', '❌', '❎', '➰', '➿', '〽️', '✳️', '✴️', '❇️', '©️', '®️', '™️', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔠', '🔡', '🔢', '🔣', '🔤', '🅰️', '🆎', '🅱️', '🆑', '🆒', '🆓', 'ℹ️', '🆔', 'Ⓜ️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯️', '🉐', '🈹', '🈚️', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫️', '⚪️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛️', '⬜️', '◼️', '◻️', '◾️', '◽️', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲'];

module.exports = {
    name: "autoreact",
    aliases: ["autoreaction", "areact"],
    category: "Settings",
    desc: "Enable/Disable Auto Reaction feature",
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        const { wasi_msg, wasi_args } = context;
        const sessionId = config.sessionId || 'wasi_session';

        try {
            let dbConfig = await wasi_getBotConfig(sessionId);
            let checkinfo = dbConfig ? (dbConfig.toObject ? dbConfig.toObject() : dbConfig) : {};

            let textt = wasi_args[0] ? wasi_args[0].toLowerCase().trim() : '';
            let action = textt.startsWith('on') || textt.includes('act') || textt.includes('true') ? 'true' :
                textt.includes('disable') || textt.includes('deact') || textt.includes('off') ? 'false' :
                    textt.includes('cmd') ? 'cmd' :
                        textt.includes('all') ? 'all' : '';

            if (!action) {
                await wasi_sock.sendMessage(wasi_sender, {
                    text: `*_Auto_Reaction Currently:_* ${checkinfo.autoreaction === 'true' || checkinfo.autoreaction === 'all' || checkinfo.autoreaction === 'cmd' ? 'Enabled (' + checkinfo.autoreaction + ')' : 'Disabled'}\n\n*_Usage:_*\n.autoreact on (Reacts to some)\n.autoreact all (Reacts to all messages)\n.autoreact cmd (Reacts on commands)\n.autoreact off (Disable)`
                }, { quoted: wasi_msg });
            } else {
                if (action === 'false') {
                    if (checkinfo.autoreaction === 'false') return await wasi_sock.sendMessage(wasi_sender, { text: '*_Auto_Reaction Already Disabled_*' }, { quoted: wasi_msg });
                    await wasi_updateBotConfig(sessionId, { 'autoreaction': 'false' });
                    await wasi_sock.sendMessage(wasi_sender, { text: '*_Auto_Reaction Successfully Disabled!_*' }, { quoted: wasi_msg });
                } else if (action === 'cmd' || action === 'all' || action === 'true') {
                    if (checkinfo.autoreaction === action) return await wasi_sock.sendMessage(wasi_sender, { text: `*_Auto_Reaction Already set to ${action}!_*` }, { quoted: wasi_msg });
                    await wasi_updateBotConfig(sessionId, { 'autoreaction': action });
                    await wasi_sock.sendMessage(wasi_sender, { text: `*_Auto_Reaction Successfully Enabled (${action})!_*` }, { quoted: wasi_msg });
                } else {
                    await wasi_sock.sendMessage(wasi_sender, { text: '*_Please provide valid instructions!_*\n*_Use on/all/cmd/off to set Auto Reaction!_*' }, { quoted: wasi_msg });
                }
            }
        } catch (e) {
            console.error("AutoReact Config Error:", e);
            await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` }, { quoted: wasi_msg });
        }
    },

    // Exporting the listener logic
    autoReactLogic: async (wasi_sock, wasi_msg, isCmd, currentConfig) => {
        try {
            if (!wasi_msg || wasi_msg.key.fromMe) return;

            // Use the passed config
            const autoreaction = currentConfig ? currentConfig.autoreaction : 'false';

            if (!autoreaction || autoreaction === "false") return;

            if (autoreaction === 'true' || (isCmd && autoreaction === 'cmd')) {
                await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: wasi_msg.key } });
            } else if (autoreaction === 'all') {
                await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { react: { text: mojis[Math.floor(Math.random() * mojis.length)], key: wasi_msg.key } });
            }
        } catch (e) {
            // console.log("Error in Auto Reaction Logic:", e);
        }
    }
};
