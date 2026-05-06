const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/*
========================================
  CONFIG
========================================
*/

const BASE_GAMES = "https://games.roproxy.com";
const BASE_ECONOMY = "https://economy.roproxy.com";

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
            `${BASE_GAMES}/v1/games/multiget-place-details?placeIds=${placeId}`
        );

        const universeId = gameInfo.data[0]?.universeId;

        if (!universeId) {
            console.log("No universeId for place:", placeId);
            return res.json([]);
        }

        // 2️⃣ récupérer gamepasses
        const passesRes = await axios.get(
            `${BASE_ECONOMY}/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`
        );

        const passes = passesRes.data.data || [];

        // 3️⃣ format Roblox
        const result = passes
            .filter(p => p.isForSale)
            .map(pass => ({
                Item: {
                    AssetId: pass.id,
                    Name: pass.name || "GamePass",
                    AssetType: 34
                },
                Product: {
                    PriceInRobux: pass.price || 0
                }
            }));

        console.log(`✅ ${result.length} passes trouvés pour place ${placeId}`);

        res.json(result);

    } catch (err) {
        console.log("❌ ERROR:", err.message);
        res.json([]);
    }
});

/*
========================================
  HEALTH CHECK
========================================
*/

app.get("/", (req, res) => {
    res.send("API ONLINE");
});

/*
========================================
  START SERVER
========================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 API running on port " + PORT);
});
