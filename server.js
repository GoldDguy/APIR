const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/*
========================================
  GET GAMEPASSES FROM UNIVERSE ID
========================================
*/

app.get("/gamepasses/:universeId", async (req, res) => {
    const universeId = req.params.universeId;

    try {
        const response = await axios.get(
            `https://apis.roproxy.com/game-passes/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`
        );

        const data = response.data;

        const passes = (data.data || []).map(pass => ({
            id: pass.id,
            name: pass.name,
            price: pass.price || 0,
            isForSale: pass.isForSale
        }));

        return res.json(passes);

    } catch (err) {
        console.log("GamePass API error:", err.message);
        return res.json([]);
    }
});

/*
========================================
  GET PLAYER GAMES
========================================
*/

app.get("/games/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const response = await axios.get(
            `https://games.roproxy.com/v2/users/${userId}/games?sortOrder=Asc&limit=50`
        );

        return res.json(response.data);

    } catch (err) {
        console.log("Games API error:", err.message);
        return res.json({ data: [] });
    }
});

/*
========================================
  START SERVER (RENDER REQUIREMENT)
========================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
