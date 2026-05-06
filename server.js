const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/*
========================================
  GET GAMEPASSES FROM PLACE ID
========================================
*/

app.get("/gamepasses/:placeId", async (req, res) => {
    const placeId = req.params.placeId;

    try {
        // 1️⃣ récupérer universeId depuis placeId
        const gameInfo = await axios.get(
            `https://games.roproxy.com/v1/games/multiget-place-details?placeIds=${placeId}`
        );

        const universeId = gameInfo.data[0]?.universeId;

        if (!universeId) {
            return res.json([]);
        }

        // 2️⃣ récupérer gamepasses via universeId
        const passesRes = await axios.get(
            `https://economy.roproxy.com/v1/games/${universeId}/game-passes?limit=100`
        );

        const passes = passesRes.data.data || [];

        const result = passes.map(pass => ({
            Item: {
                AssetId: pass.id,
                Name: pass.name,
                AssetType: 34
            },
            Product: {
                PriceInRobux: pass.price || 0
            }
        }));

        res.json(result);

    } catch (err) {
        console.log("ERROR:", err.message);
        res.json([]);
    }
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
