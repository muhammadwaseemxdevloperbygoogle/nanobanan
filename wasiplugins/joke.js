const axios = require('axios');

const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What do you call a fake noodle? An impasta!",
    "Why did the bicycle fall over? Because it was two-tired!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why can't you give Elsa a balloon? Because she will let it go!",
    "What do you call a fish without eyes? A fsh!",
    "Why did the math book look so sad? Because it had too many problems."
];

module.exports = {
    name: 'joke',
    aliases: ['jokes', 'funny'],
    category: 'Fun',
    desc: 'Get a random joke',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        try {
            let joke;
            try {
                // Try official joke API
                const response = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 5000 });
                joke = `${response.data.setup}\n\n${response.data.punchline}`;
            } catch {
                // Fallback to local jokes
                joke = jokes[Math.floor(Math.random() * jokes.length)];
            }

            await wasi_sock.sendMessage(wasi_sender, {
                text: `😂 *Random Joke*\n\n${joke}`
            });

        } catch (error) {
            console.error('Joke error:', error);
            const fallback = jokes[Math.floor(Math.random() * jokes.length)];
            await wasi_sock.sendMessage(wasi_sender, { text: `😂 ${fallback}` });
        }
    }
};
