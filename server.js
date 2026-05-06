const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/*
========================================
  GAMEPASSES FROM UNIVERSE ID
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

        const result = data.data.map(pass => ({
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
  HEALTH CHECK (IMPORTANT)
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
