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
  UNIVERSE → GAMEPASSES
========================================
*/
async function getGamepasses(universeId) {
    try {
        const res = await axios.get(
            `https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes?limit=100&sortOrder=Asc`
        );

        const data = res.data;

        return (data.gamePasses || []).map(pass => ({
            id: pass.id,
            productId: pass.productId,
            name: pass.displayName,
            price: pass.price || 0,
            isForSale: pass.isForSale
        }));
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

    // 1. GET universeId
    const universeId = await getUniverseId(placeId);

    if (!universeId) {
        return res.status(404).json({
            error: "Universe not found from placeId"
        });
    }

    // 2. GET gamepasses
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
