const axios = require('axios');

const facts = [
    "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.",
    "Octopuses have three hearts and blue blood.",
    "A group of flamingos is called a 'flamboyance'.",
    "The shortest war in history lasted 38 to 45 minutes between Britain and Zanzibar.",
    "Bananas are berries, but strawberries aren't.",
    "The inventor of the Pringles can is buried in one.",
    "A day on Venus is longer than a year on Venus.",
    "Cows have best friends and get stressed when separated.",
    "The Twitter bird has a name - Larry.",
    "There are more possible iterations of a game of chess than there are atoms in the known universe."
];

module.exports = {
    name: 'fact',
    aliases: ['facts', 'didyouknow'],
    category: 'Fun',
    desc: 'Get a random interesting fact',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        try {
            let fact;
            try {
                // Try useless facts API
                const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 5000 });
                fact = response.data.text;
            } catch {
                // Fallback to local facts
                fact = facts[Math.floor(Math.random() * facts.length)];
            }

            await wasi_sock.sendMessage(wasi_sender, {
                text: `🧠 *Did You Know?*\n\n${fact}`
            });

        } catch (error) {
            console.error('Fact error:', error);
            const fallback = facts[Math.floor(Math.random() * facts.length)];
            await wasi_sock.sendMessage(wasi_sender, { text: `🧠 ${fallback}` });
        }
    }
};
