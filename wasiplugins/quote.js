const axios = require('axios');

const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "If you look at what you have in life, you'll always have more.", author: "Oprah Winfrey" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
];

module.exports = {
    name: 'quote',
    aliases: ['quotes', 'motivation'],
    category: 'Fun',
    desc: 'Get a random inspirational quote',
    wasi_handler: async (wasi_sock, wasi_sender, context) => {
        try {
            // Try to get quote from API first
            let quote;
            try {
                const response = await axios.get('https://api.quotable.io/random', { timeout: 5000 });
                quote = { text: response.data.content, author: response.data.author };
            } catch {
                // Fallback to local quotes
                quote = quotes[Math.floor(Math.random() * quotes.length)];
            }

            const quoteText = `
╭─────────────────────╮
│      💭 *QUOTE*
╰─────────────────────╯

"${quote.text}"

                 — *${quote.author}*
`.trim();

            await wasi_sock.sendMessage(wasi_sender, { text: quoteText });

        } catch (error) {
            console.error('Quote error:', error);
            const fallback = quotes[Math.floor(Math.random() * quotes.length)];
            await wasi_sock.sendMessage(wasi_sender, {
                text: `💭 "${fallback.text}"\n\n— *${fallback.author}*`
            });
        }
    }
};
