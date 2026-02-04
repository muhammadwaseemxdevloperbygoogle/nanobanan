const { wasi_cmd, bot_ } = require('../wasilib/wasi');
let bots = false;
let utd = false;

// Extended Emoji Sets
const emojis = ['❤', '💕', '😻', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '🙂', '🤗', '😊', '🎊', '🎉', '🎁', '🎈', '👋'];
const mojis = ['💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '❤️‍', '🔥', '❤️‍', '🩹', '💯', '♨️', '💢', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🌐', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄️', '🎴', '🎭️', '🔇', '🔈️', '🔉', '🔊', '🔔', '🔕', '🎼', '🎵', '🎶', '💹', '🏧', '🚮', '🚰', '♿️', '🚹️', '🚺️', '🚻', '🚼️', '🚾', '🛂', '🛃', '🛄', '🛅', '⚠️', '🚸', '⛔️', '🚫', '🚳', '🚭️', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '⛎', '🔀', '🔁', '🔂', '▶️', '⏩️', '⏭️', '⏯️', '◀️', '⏪️', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴', '♀️', '♂️', '⚧', '✖️', '➕', '➖', '➗', '♾️', '‼️', '⁉️', '❓️', '❔', '❕', '❗️', '〰️', '💱', '💲', '⚕️', '♻️', '⚜️', '🔱', '📛', '🔰', '⭕️', '✅', '☑️', '✔️', '❌', '❎', '➰', '➿', '〽️', '✳️', '✴️', '❇️', '©️', '®️', '™️', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔠', '🔡', '🔢', '🔣', '🔤', '🅰️', '🆎', '🅱️', '🆑', '🆒', '🆓', 'ℹ️', '🆔', 'Ⓜ️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯️', '🉐', '🈹', '🈚️', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫️', '⚪️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛️', '⬜️', '◼️', '◻️', '◾️', '◽️', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲'];

wasi_cmd({
    name: "autoreact",
    alias: ["autoreaction", "areact"],
    desc: "Enable/Disable Auto Reaction feature",
    category: "Settings",
    filename: __filename
}, async (wasi_sock, wasi_sender, context) => {
    const { wasi_msg, wasi_args } = context;
    try {
        let checkinfo = await bot_.findOne({ 'id': `bot_${wasi_sender.split("@")[0]}` }) || await bot_.new({ 'id': `bot_${wasi_sender.split("@")[0]}` });
        let textt = wasi_args[0] ? wasi_args[0].toLowerCase().trim() : '';
        let action = textt.startsWith('on') || textt.includes('act') || textt.includes('true') ? 'true' :
            textt.includes('disable') || textt.includes('deact') || textt.includes('off') ? 'false' :
                textt.includes('cmd') ? 'cmd' :
                    textt.includes('all') ? 'all' : '';

        // Flag to refetch settings logic
        utd = true;

        if (!action) {
            await wasi_sock.sendMessage(wasi_sender, {
                text: `*_Auto_Reaction Currently:_* ${checkinfo.autoreaction === 'true' || checkinfo.autoreaction === 'all' || checkinfo.autoreaction === 'cmd' ? 'Enabled (' + checkinfo.autoreaction + ')' : 'Disabled'}\n\n*_Usage:_*\n.autoreact on (Reacts to some)\n.autoreact all (Reacts to all messages)\n.autoreact cmd (Reacts on commands)\n.autoreact off (Disable)`
            }, { quoted: wasi_msg });
        } else {
            if (action === 'false') {
                if (checkinfo.autoreaction === 'false') return await wasi_sock.sendMessage(wasi_sender, { text: '*_Auto_Reaction Already Disabled_*' }, { quoted: wasi_msg });
                await bot_.updateOne({ 'id': `bot_${wasi_sender.split("@")[0]}` }, { 'autoreaction': 'false' });
                await wasi_sock.sendMessage(wasi_sender, { text: '*_Auto_Reaction Successfully Disabled!_*' }, { quoted: wasi_msg });
            } else if (action === 'cmd' || action === 'all' || action === 'true') {
                if (checkinfo.autoreaction === action) return await wasi_sock.sendMessage(wasi_sender, { text: `*_Auto_Reaction Already set to ${action}!_*` }, { quoted: wasi_msg });
                await bot_.updateOne({ 'id': `bot_${wasi_sender.split("@")[0]}` }, { 'autoreaction': action });
                await wasi_sock.sendMessage(wasi_sender, { text: `*_Auto_Reaction Successfully Enabled (${action})!_*` }, { quoted: wasi_msg });
            } else {
                await wasi_sock.sendMessage(wasi_sender, { text: '*_Please provide valid instructions!_*\n*_Use on/all/cmd/off to set Auto Reaction!_*' }, { quoted: wasi_msg });
            }
        }
    } catch (e) {
        console.error("AutoReact Config Error:", e);
        await wasi_sock.sendMessage(wasi_sender, { text: `❌ Error: ${e.message}` }, { quoted: wasi_msg });
    }
});

// Listener Event (This logic needs to be integrated into the main message handler in index.js or similar, 
// as plugins in V7 structure typically export 'wasi_handler'. 
// However, since V7 doesn't support 'on: main' listeners in plugins directly like V2, 
// this file will just handle the CONFIGURATION command.
// The actual REACTION LOGIC needs to be added to the main message listener.)

// NOTE: To make this work fully, we need to modify the main message handler to check for 'autoreaction' status.
// I will instructions on where to add the logic below or check if V7 supports middleware.

module.exports = {
    // Exporting the listener logic so we can require it in the main file if needed
    autoReactLogic: async (wasi_sock, wasi_msg, isCmd) => {
        try {
            if (!wasi_msg || wasi_msg.key.fromMe) return;

            // Simple caching to avoid DB hit every message
            if (!bots || utd) {
                // Assuming single bot instance for now, or fetch based on owner
                // V7 seems to use a JSON file or simple DB. We need to match existing DB logic.
                // If bot_ is not available globally, we might need a different approach.
                // For now, let's assume we can fetch it.
                bots = await bot_.findOne({ id: `bot_${wasi_msg.pushName}` }) || {};
                utd = false;
            }

            if (!bots || !bots.autoreaction || bots.autoreaction === "false") return;

            if (bots.autoreaction === 'true' || (isCmd && bots.autoreaction === 'cmd')) {
                await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: wasi_msg.key } });
            } else if (bots.autoreaction === 'all') {
                await wasi_sock.sendMessage(wasi_msg.key.remoteJid, { react: { text: mojis[Math.floor(Math.random() * mojis.length)], key: wasi_msg.key } });
            }
        } catch (e) {
            console.log("Error in Auto Reaction Logic:", e);
        }
    }
};
