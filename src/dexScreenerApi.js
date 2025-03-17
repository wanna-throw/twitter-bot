// src/dexScreenerApi.js
const axios = require("axios");

/**
 * getTokenData(tokenName)
 *  - tokenName: e.g. "ethereum", "doge", "shiba"
 *  - Returns: { mcap, liquidity, txFees, dexVersion, price, priceChange24h }
 */
async function getTokenData(tokenName) {
  try {
    // Dexscreener search endpoint
    const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(tokenName)}`;
    const response = await axios.get(url);

    const pairs = response.data?.pairs;
    if (!pairs || pairs.length === 0) {
      return null; // No results
    }

    // Take the first match
    const first = pairs[0];

    // Parse relevant fields
    const chainId = first.chainId || "unknown";
    const fdv = first.fdv || null;         // FDV as "mcap"
    const volumeUsd = first.volume24hUsd || 0;
    const liquidityUsd = first.liquidity?.usd || 0;
    const priceUsd = first.priceUsd || 0;
    const priceChange24h = first.priceChange?.h24 || 0;

    // Simple fee estimate
    const feeRate = 0.003;
    const estimatedFees = volumeUsd * feeRate;

    return {
      mcap: fdv,
      liquidity: liquidityUsd,
      txFees: estimatedFees,
      dexVersion: `Dex on ${chainId}`,
      price: priceUsd,
      priceChange24h
    };
  } catch (err) {
    console.error(`Error fetching data for ${tokenName} from DexScreener:`, err);
    return null;
  }
}

module.exports = {
  getTokenData,
};
