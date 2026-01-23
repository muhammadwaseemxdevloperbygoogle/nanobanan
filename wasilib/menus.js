const moment = require('moment-timezone');
const os = require('os');
const process = require('process');
const config = require('../wasi');

const getSystemInfo = (pushName, wasi_plugins) => {
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
    const date = moment().tz(config.timeZone).format('DD/MM/YYYY');

    // Count unique absolute plugin names (not aliases)
    const uniquePluginsCount = new Set(Array.from(wasi_plugins.values())).size;

    return {
        botName: config.botName,
        mode: config.mode,
        prefix: config.prefix,
        uptime: fmt_uptime,
        ram: `${usedMem} / ${totalMem} GB`,
        time: time,
        date: date,
        totalPlugins: uniquePluginsCount,
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
    classic: (info, cmds) => {
        let text = `┏ 💐 ${info.botName} 💐 ┓\n`;
        text += `👋 HELLO, ${info.user.toUpperCase()}!\n`;
        text += `┗━━━━━━━━━━━━━━━┛\n`;
        text += `┏ COMMAND PANEL ┓\n`;
        text += `🔹 RUN   : ${info.uptime}\n`;
        text += `🔹 MODE  : ${info.mode}\n`;
        text += `🔹 PREFIX: ${info.prefix}\n`;
        text += `🔹 TOTAL : ${info.totalPlugins}\n`;
        text += `🔹 RAM   : ${info.ram}\n`;
        text += `🔹 TIME  : ${info.time}\n`;
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
        text += `🚀 Mode: ${info.mode}\n`;
        text += `📦 Plugins: ${info.totalPlugins}\n\n`;

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
        text += `➤ *Plugins*: ${info.totalPlugins}\n`;
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
        text += `  📦 ${info.totalPlugins} Modules\n`;
        text += `  ⏱️ ${info.uptime}\n\n`;

        for (const cat of cmds) {
            text += `┌───[ *${cat.category}* ]\n`;
            text += cat.cmds.map(c => `│ >_ ${c}`).join('\n');
            text += `\n└─────────────────\n`;
        }
        return text;
    },

    // 5. Card (Premium Card Look)
    card: (info, cmds) => {
        let text = `╭━━━━━━━━━━━━━━━━━━╮\n`;
        text += `┃ 👋 *${info.user}*\n`;
        text += `┃ 👑 *${info.botName}*\n`;
        text += `╰━━━━━━━━━━━━━━━━━━╯\n`;
        text += `╔━━━━━━━━━━━━━━━━━━╗\n`;
        text += `  🔹 *UPTIME:* ${info.uptime}\n`;
        text += `  🔹 *TOTAL:* ${info.totalPlugins}\n`;
        text += `  🔹 *PREFIX:* ${info.prefix}\n`;
        text += `  🔹 *RAM:* ${info.ram}\n`;
        text += `╚━━━━━━━━━━━━━━━━━━╝\n\n`;

        for (const cat of cmds) {
            text += `┏━━━「 *${cat.category}* 」\n`;
            text += cat.cmds.map(c => `┃ ✨ ${c}`).join('\n');
            text += `\n┗━━━━━━━━━━━━━━━━━━\n`;
        }
        text += `\n*© 2024 WASI-MD-V7*`;
        return text;
    },

    // 6. Aesthetic (Cute/Decorated)
    aesthetic: (info, cmds) => {
        let text = `★·.·´¯\`·.·★ ${info.botName} ★·.·´¯\`·.·★\n\n`;
        text += `✿ ᴜsᴇʀ : ${info.user}\n`;
        text += `✿ ᴍᴏᴅᴇ : ${info.mode}\n`;
        text += `✿ ᴛᴏᴛᴀʟ : ${info.totalPlugins}\n`;
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
    const info = getSystemInfo(pushName, wasi_plugins);
    const cmds = getCommands(wasi_plugins);

    // Fallback if style doesn't exist
    const selectedStyle = designs[style] ? designs[style] : designs.classic;
    return selectedStyle(info, cmds);
};

module.exports = { getMenu, designs };
