const express = require("express");
const axios = require("axios");

const app = express();

/*
========================================
  SAFE GAMEPASS FETCH (MULTI TRY)
========================================
*/

async function fetchGamepasses(universeId) {

    // ⚠️ plusieurs endpoints testés
    const urls = [
        `https://apis.roproxy.com/game-passes/v1/games/${universeId}/game-passes?limit=100`,
        `https://games.roproxy.com/v1/games/${universeId}/game-passes?limit=100`
    ];

    for (const url of urls) {
        try {
            const res = await axios.get(url);
            if (res.data && res.data.data) {
                return res.data.data;
            }
        } catch (e) {
            console.log("Fail API:", url);
        }
    }

    return [];
}

/*
========================================
  ROUTE
========================================
*/

app.get("/gamepasses/:universeId", async (req, res) => {
    const universeId = req.params.universeId;

    try {
        const passes = await fetchGamepasses(universeId);

        const result = passes.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price || 0
        }));

        res.json(result);

    } catch (err) {
        console.log(err);
        res.json([]);
    }
});

/*
========================================
  START
========================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running");
});
