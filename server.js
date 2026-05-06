const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/*
========================================
  GAMEPASSES FROM GAME IDS
========================================
*/

app.get("/gamepasses/:gameId", async (req, res) => {
    const gameId = req.params.gameId;

    try {
        const response = await axios.get(
            `https://apis.roproxy.com/game-passes/v1/games/${gameId}/game-passes?limit=100&sortOrder=Asc`
        );

        const data = response.data;

        const result = (data.data || []).map(pass => ({
            id: pass.id,
            name: pass.name,
            price: pass.price || 0,
            isForSale: pass.isForSale
        }));

        return res.json(result);

    } catch (err) {
        console.log("GamePass error:", err.message);
        return res.json([]);
    }
});

/*
========================================
  START
========================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("API running on port " + PORT);
});
