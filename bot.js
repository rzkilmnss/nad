require("dotenv").config();
const { ethers } = require("ethers");
const axios = require("axios");

// Konfigurasi
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Fungsi untuk ambil token hype dari Nad.fun
async function getHypeToken() {
    try {
        const response = await axios.get("https://nad.fun/api/trending"); // Ganti dengan API yang benar
        const tokens = response.data.tokens; 
        return tokens[0]; // Ambil token pertama yang paling hype
    } catch (error) {
        console.error("Gagal fetch token:", error.message);
        return null;
    }
}

// Fungsi untuk beli token
async function buyToken(tokenAddress, amount) {
    try {
        const tx = await wallet.sendTransaction({
            to: tokenAddress,
            value: ethers.parseEther(amount),
        });
        console.log(`Membeli ${amount} MON di ${tokenAddress} | Tx: ${tx.hash}`);
        await tx.wait();
        console.log("Transaksi sukses!");
    } catch (error) {
        console.error("Gagal beli token:", error.message);
    }
}

// Jalankan bot
(async () => {
    console.log("Bot dimulai...");
    const token = await getHypeToken();
    if (token) {
        console.log("Token Hype:", token.name, "-", token.address);
        await buyToken(token.address, "0.01"); // Beli 0.01 MON token
    } else {
        console.log("Tidak ada token hype saat ini.");
    }
})();
