const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/*
========================================
  PLACE ID → UNIVERSE ID
========================================
*/
async function getUniverseId(placeId) {
    try {
        const res = await axios.get(
            `https://apis.roproxy.com/universes/v1/places/${placeId}/universe`
        );

        return res.data.universeId;
    } catch (err) {
        console.log("Universe error:", err.response?.status || err.message);
        return null;
    }
}

/*
========================================
  GAMEPASS PRICE (NEW API)
========================================
*/
async function getGamepassPrice(gamePassId) {
    try {
        const res = await axios.get(
            `https://apis.roproxy.com/game-passes/v1/game-passes/${gamePassId}/product-info`
        );

        return res.data.PriceInRobux || 0;
    } catch (err) {
        return 0;
    }
}

/*
========================================
  GET GAMEPASSES
========================================
*/
async function getGamepasses(universeId) {
    try {
        const res = await axios.get(
            `https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes?limit=100&sortOrder=Asc`
        );

        const passes = res.data.gamePasses || [];

        // ⚡ PARALLEL (beaucoup plus rapide)
        const result = await Promise.all(
            passes.map(async (pass) => {
                const price = await getGamepassPrice(pass.id);

                return {
                    id: pass.id,
                    productId: pass.productId,
                    name: pass.displayName,
                    price: price,
                    isForSale: pass.isForSale
                };
            })
        );

        return result;

    } catch (err) {
        console.log("Gamepass error:", err.response?.status || err.message);
        return [];
    }
}

/*
========================================
  MAIN ROUTE
========================================
*/
app.get("/gamepasses/:placeId", async (req, res) => {
    const placeId = req.params.placeId;

    if (!placeId) {
        return res.status(400).json({ error: "Missing placeId" });
    }

    // 1. universeId
    const universeId = await getUniverseId(placeId);

    if (!universeId) {
        return res.status(404).json({ error: "Universe not found" });
    }

    // 2. gamepasses
    const gamepasses = await getGamepasses(universeId);

    return res.json({
        placeId,
        universeId,
        count: gamepasses.length,
        gamepasses
    });
});

/*
========================================
  START SERVER
========================================
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("API running on port " + PORT);
});
