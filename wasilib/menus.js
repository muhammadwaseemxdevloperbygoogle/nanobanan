const moment = require('moment-timezone');
const os = require('os');
const process = require('process');
const config = require('../wasi');

const getSystemInfo = (pushName) => {
    const uptime = process.uptime();
    const fmt_uptime = [
        Math.floor(uptime / 3600).toString().padStart(2, '0') + 'h',
        Math.floor((uptime % 3600) / 60).toString().padStart(2, '0') + 'm',
        Math.floor(uptime % 60).toString().padStart(2, '0') + 's'
    ].join(' ');

    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const time = moment().tz(config.timeZone).format('hh:mm:ss a');

    return {
        botName: config.botName,
        mode: config.mode,
        prefix: config.prefix,
        uptime: fmt_uptime,
        ram: `${usedMem} / ${totalMem} GB`,
        time: time,
        user: pushName || 'User'
    };
};

const getCommands = (wasi_plugins) => {
    const categories = new Map();
    const uniquePlugins = new Set(wasi_plugins.values());
    for (const plugin of uniquePlugins) {
        const cat = plugin.category || 'Other';
        if (!categories.has(cat)) categories.set(cat, []);
        categories.get(cat).push(plugin.name);
    }
    return Array.from(categories.keys()).sort().map(cat => ({
        category: cat,
        cmds: categories.get(cat).sort()
    }));
};

const designs = {
    // 1. Classic (Original)
    classic: (info, cmds, helpers) => {
        let text = `┏ 💐 ${info.botName} 💐 ┓\n`;
        text += `👋 HELLO, ${info.user.toUpperCase()}!\n`;
        text += `┗━━━━━━━━━━━━━━━┛\n`;
        text += `┏ COMMAND PANEL ┓\n`;
        text += `🔹 RUN   : ${info.uptime}\n`;
        text += `🔹 MODE  : ${info.mode}\n`;
        text += `🔹 PREFIX: ${info.prefix}\n`;
        text += `🔹 RAM   : ${info.ram}\n`;
        text += `🔹 TIME  : ${info.time}\n`;
        text += `🔹 USER  : ${info.user}\n`;
        text += `┗━━━━━━━━━━━━━━━┛\n\n`;

        for (const cat of cmds) {
            text += `┏━┫ *${cat.category.toUpperCase()}* ┣━┓\n`;
            for (const cmd of cat.cmds) {
                text += `┣ ◦ ${cmd}\n`;
            }
            text += `┗━━━━━━━━━━━━━━━┛\n`;
        }
        text += `\n✨ _Powered by ${info.botName}_`;
        return text;
    },

    // 2. Simple (Clean list)
    simple: (info, cmds) => {
        let text = `*${info.botName}*\n\n`;
        text += `👤 User: ${info.user}\n`;
        text += `⏳ Uptime: ${info.uptime}\n`;
        text += `🚀 Mode: ${info.mode}\n\n`;

        for (const cat of cmds) {
            text += `*--- ${cat.category.toUpperCase()} ---*\n`;
            text += cat.cmds.map(c => `• ${info.prefix}${c}`).join('\n');
            text += `\n\n`;
        }
        return text;
    },

    // 3. Bold (Heavy headers)
    bold: (info, cmds) => {
        let text = `█▓▒░ *${info.botName.toUpperCase()}* ░▒▓█\n\n`;
        text += `➤ *User*: ${info.user}\n`;
        text += `➤ *Prefix*: ${info.prefix}\n`;
        text += `➤ *Time*: ${info.time}\n\n`;

        for (const cat of cmds) {
            text += `╭─⬡ *${cat.category}* ⬡\n`;
            text += cat.cmds.map(c => `│ ⬢ ${c}`).join('\n');
            text += `\n╰───────────────\n`;
        }
        return text;
    },

    // 4. Tech (Futuristic)
    tech: (info, cmds) => {
        let text = `╔════════════════╗\n`;
        text += `║   SYSTEM ONLINE  ║\n`;
        text += `╚════════════════╝\n`;
        text += `  ⚡ ${info.botName} v7\n`;
        text += `  👤 ${info.user}\n`;
        text += `  ⏱️ ${info.uptime}\n\n`;

        for (const cat of cmds) {
            text += `┌───[ *${cat.category}* ]\n`;
            text += cat.cmds.map(c => `│ >_ ${c}`).join('\n');
            text += `\n└─────────────────\n`;
        }
        return text;
    },

    // 5. Aesthetic (Cute/Decorated)
    aesthetic: (info, cmds) => {
        let text = `★·.·´¯\`·.·★ ${info.botName} ★·.·´¯\`·.·★\n\n`;
        text += `✿ ᴜsᴇʀ : ${info.user}\n`;
        text += `✿ ᴍᴏᴅᴇ : ${info.mode}\n`;
        text += `✿ ʀᴀᴍ  : ${info.ram}\n\n`;

        for (const cat of cmds) {
            text += `╭─── ･ ｡ﾟ☆: *. ${cat.category} .* :☆ﾟ. ───╮\n`;
            text += cat.cmds.map(c => `│ ❥ ${c}`).join('\n');
            text += `\n╰────────────────────────────╯\n`;
        }
        return text;
    }
};

const getMenu = (wasi_plugins, pushName, style = 'classic') => {
    const info = getSystemInfo(pushName);
    const cmds = getCommands(wasi_plugins);

    // Fallback if style doesn't exist
    const selectedStyle = designs[style] ? designs[style] : designs.classic;
    return selectedStyle(info, cmds);
};

module.exports = { getMenu, designs };
