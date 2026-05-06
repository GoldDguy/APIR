const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

/*
========================================
  GET UNIVERSE ID FROM PLACE ID
========================================
*/
async function getUniverseIdFromPlaceId(placeId) {
    try {
        const response = await axios.get(
            `https://apis.roproxy.com/universes/v1/places/${placeId}/universe`
        );
        return response.data.universeId;
    } catch (err) {
        console.log("Error fetching universe ID:", err.message);
        return null;
    }
}

/*
========================================
  GAMEPASSES FROM PLACE ID (AUTO CONVERT)
========================================
*/
app.get("/gamepasses/place/:placeId", async (req, res) => {
    const placeId = req.params.placeId;
    try {
        const universeId = await getUniverseIdFromPlaceId(placeId);
        if (!universeId) {
            return res.status(404).json({ error: "Universe not found for this place" });
        }
        const response = await axios.get(
            `https://apis.roproxy.com/game-passes/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`
        );
        const data = response.data;
        if (!data || !data.data) {
            return res.json([]);
        }
        const result = data.data
            .filter(pass => pass.isForSale)
            .map(pass => ({
                id: pass.id,
                name: pass.name || "GamePass",
                price: pass.price || 0
            }));
        return res.json(result);
    } catch (err) {
        console.log("GamePass error:", err.response?.status || err.message);
        return res.status(500).json({ error: "Failed to fetch gamepasses" });
    }
});

/*
========================================
  GAMEPASSES FROM UNIVERSE ID (LEGACY)
========================================
*/
app.get("/gamepasses/:universeId", async (req, res) => {
    const universeId = req.params.universeId;
    try {
        const response = await axios.get(
            `https://apis.roproxy.com/game-passes/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`
        );
        const data = response.data;
        if (!data || !data.data) {
            return res.json([]);
        }
        const result = data.data
            .filter(pass => pass.isForSale)
            .map(pass => ({
                id: pass.id,
                name: pass.name || "GamePass",
                price: pass.price || 0
            }));
        return res.json(result);
    } catch (err) {
        console.log("GamePass error:", err.response?.status || err.message);
        return res.json([]);
    }
});

/*
========================================
  GAMEPASSES FROM USER ID
========================================
*/
app.get("/user/:userId/gamepasses", async (req, res) => {
    const userId = req.params.userId;
    try {
        const gamesResponse = await axios.get(
            `https://games.roproxy.com/v2/users/${userId}/games?sortOrder=Asc&limit=50`
        );
        const games = gamesResponse.data?.data;
        if (!games || games.length === 0) {
            return res.json([]);
        }

        const allPasses = [];

        for (const game of games) {
            const placeId = game.rootPlace?.id;
            if (!placeId) continue;

            try {
                const universeId = await getUniverseIdFromPlaceId(placeId);
                if (!universeId) continue;

                const passResponse = await axios.get(
                    `https://apis.roproxy.com/game-passes/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`
                );

                const passes = passResponse.data?.data || [];

                for (const pass of passes) {
                    if (pass.isForSale) {
                        allPasses.push({
                            id: pass.id,
                            name: pass.name || "GamePass",
                            price: pass.price || 0,
                            gameId: universeId,
                            gameName: game.name || "Unknown"
                        });
                    }
                }
            } catch (err) {
                console.log(`Erreur jeu ${placeId}:`, err.message);
                continue;
            }

            await new Promise(r => setTimeout(r, 150));
        }

        return res.json(allPasses);
    } catch (err) {
        console.log("User games error:", err.message);
        return res.status(500).json({ error: "Failed to fetch user gamepasses" });
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
    console.log("API running on port " + PORT);
});
