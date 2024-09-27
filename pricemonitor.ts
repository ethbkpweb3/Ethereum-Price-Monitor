import axios from 'axios';
import * as fs from 'fs';

interface Config {
    telegramBotToken: string;
    chatId: string;
    checkInterval: number;
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
const config: Config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

let lastPrice: number | null = null;

async function fetchEthPrice(): Promise<void> {
    try {
        const response = await axios.get(COINGECKO_API_URL);
        const price: number = response.data.ethereum.usd;
        console.log(`Current ETH price: $${price}`);

        // Send a message if the price changes
        if (lastPrice !== null && lastPrice !== price) {
            await sendTelegramMessage(`Ethereum price changed! New price: $${price}`);
        }

        lastPrice = price;
    } catch (error) {
        console.error('Error fetching ETH price:', error);
    }
}

async function sendTelegramMessage(message: string): Promise<void> {
    const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
    try {
        const response = await axios.post(url, {
            chat_id: config.chatId,
            text: message,
        });
        console.log('Message sent :', message);
        console.log('Response:', response.data); // Log the response for debugging
    } catch (error: any) { // Assert the type of error as any
        console.error('Error sending message to Telegram:', 
            error.response ? error.response.data : error.message);
    }
}

async function startPriceMonitor(): Promise<void> {
    console.log('Starting ...');
    await fetchEthPrice(); // Fetch initial price
    setInterval(fetchEthPrice, config.checkInterval); // Fetch price at intervals
}

// Start the price monitor
startPriceMonitor();
