const fonts = {
    original: (text) => text,
    typewriter: (text) => {
        const map = 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９';
        const from = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return text.split('').map(char => {
            const index = from.indexOf(char);
            return index >= 0 ? map.substr(index, 1) : char; // substr is safe here as map is fixed width chars? actually unicode chars are 1 unit? 
            // Wait, JS strings are UTF-16. These wide chars are surrogate pairs? No, usually they are BMP. 
            // Better to use arrays.
        }).join('');
    },
    bold: (text) => {
        const map = '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗';
        const from = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        // Note: Bold numbers are: 𝟎-𝟗 (U+1D7CE)
        // Let's use a mapping function that is safer for unicode.
        return text.replace(/[a-zA-Z0-9]/g, (char) => {
            const index = from.indexOf(char);
            return index !== -1 ? [...map][index] : char;
        });
    },
    italic: (text) => {
        const map = '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡0123456789'; // Numbers usually don't have italics in this block
        const from = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return text.replace(/[a-zA-Z0-9]/g, (char) => {
            const index = from.indexOf(char);
            return index !== -1 ? [...map][index] || char : char;
        });
    },
    circle: (text) => {
        const map = 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ0①②③④⑤⑥⑦⑧⑨';
        const from = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return text.replace(/[a-zA-Z0-9]/g, (char) => {
            const index = from.indexOf(char);
            return index !== -1 ? [...map][index] : char;
        });
    },
    square: (text) => {
        const map = 'a𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙0123456789';
        // Square is actually 
        // 🄰 🄱 🄲...
        const mapSq = '🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789';
        const from = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return text.replace(/[a-zA-Z]/g, (char) => { // Only letters typically nice in squares
            const index = from.indexOf(char);
            return index !== -1 ? [...mapSq][index] : char;
        });
    },
    emoji: (text) => {
        const from = 'abcdefghijklmnopqrstuvwxyz';
        const map = '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(' ');
        return text.toLowerCase().split('').map(c => {
            const i = from.indexOf(c);
            return i >= 0 ? map[i] : c;
        }).join('');
    },
    gothic: (text) => {
        const map = '𝖆𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗';
        const from = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return text.replace(/[a-zA-Z0-9]/g, (char) => {
            const index = from.indexOf(char);
            return index !== -1 ? [...map][index] : char;
        });
    },
    double: (text) => {
        const map = '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡';
        const from = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return text.replace(/[a-zA-Z0-9]/g, (char) => {
            const index = from.indexOf(char);
            return index !== -1 ? [...map][index] : char;
        });
    }
};

const applyFont = (text, fontStyle = 'original') => {
    if (!text) return text;
    // Don't format commands or strict things?
    // User wants "all over bot", mostly replies.

    if (fonts[fontStyle]) {
        return fonts[fontStyle](text);
    }
    return text;
};

module.exports = { fonts, applyFont };
