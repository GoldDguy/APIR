const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

app.get("/gamepasses/:placeId", async (req, res) => {
    const placeId = req.params.placeId;
    try {
        const gameInfo = await axios.get(
            `https://apis.roproxy.com/universes/v1/places/${placeId}/universe`
        );
        const universeId = gameInfo.data?.universeId;
        if (!universeId) {
            console.log("No universeId for place:", placeId);
            return res.json([]);
        }

        const passesRes = await axios.get(
            `https://games.roproxy.com/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`
        );
        const passes = passesRes.data.data || [];

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

        console.log(`✅ ${result.length} passes pour place ${placeId}`);
        res.json(result);
    } catch (err) {
        console.log("❌ ERROR:", err.message);
        res.json([]);
    }
});

app.get("/", (req, res) => {
    res.send("API ONLINE");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 API running on port " + PORT);
});
