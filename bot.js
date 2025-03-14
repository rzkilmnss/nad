require("dotenv").config();
const { ethers } = require("ethers");
const WebSocket = require("ws");

// Konfigurasi
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Koneksi ke WebSocket Nad.fun
const ws = new WebSocket("wss://api-server.nad.fun/wss");

ws.on("open", () => {
    console.log("Terhubung ke WebSocket Nad.fun...");
    
    // Subscribe ke order terbaru berdasarkan waktu pembuatan
    const message = JSON.stringify({
        jsonrpc: "2.0",
        method: "order_subscribe",
        params: { order_type: "creation_time" },
        id: 1
    });

    ws.send(message);
});

ws.on("message", async (data) => {
    const response = JSON.parse(data);
    if (response.result) {
        const tokens = response.result;
        console.log("🔥 Token Trending Ditemukan:", tokens);

        // Ambil token pertama dari daftar dan beli
        const firstToken = tokens[0]; // Ambil token pertama yang trending
        if (firstToken) {
            console.log(`🔹 Membeli token: ${firstToken.token_address}`);
            await buyToken(firstToken.token_address, "0.01");
        }
    }
});

ws.on("error", (error) => {
    console.error("WebSocket Error:", error);
});

// Fungsi untuk beli token
async function buyToken(tokenAddress, amount) {
    try {
        const tx = await wallet.sendTransaction({
            to: tokenAddress,
            value: ethers.parseEther(amount),
        });
        console.log(`✅ Membeli ${amount} MON di ${tokenAddress} | Tx: ${tx.hash}`);
        await tx.wait();
        console.log("✅ Transaksi sukses!");
    } catch (error) {
        console.error("❌ Gagal beli token:", error.message);
    }
}
