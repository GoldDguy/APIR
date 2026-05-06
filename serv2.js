const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/*
========================================
  1. GET GAMES + GAMEPASSES
========================================
*/

app.get("/passes/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        // 1. récupérer les jeux du joueur
        const gamesRes = await axios.get(
            `https://games.roproxy.com/v2/users/${userId}/games?sortOrder=Asc&limit=50`
        );

        const games = gamesRes.data.data || [];
        let allPasses = [];

        // 2. pour chaque jeu → récupérer gamepasses
        for (const game of games) {
            const gameId = game.id;

            try {
                const passRes = await axios.get(
                    `https://games.roproxy.com/v1/games/${gameId}/game-passes?limit=100&sortOrder=Asc`
                );

                const passes = passRes.data.data || [];

                for (const pass of passes) {
                    if (pass.isForSale) {
                        allPasses.push({
                            Item: {
                                AssetId: pass.id,
                                AssetType: 34,
                                Name: pass.name
                            },
                            Product: {
                                PriceInRobux: pass.price || 0
                            }
                        });
                    }
                }

            } catch (e) {
                // ignore game errors
            }
        }

        return res.json(allPasses);

    } catch (err) {
        console.log(err);
        return res.json([]);
    }
});

/*
========================================
  2. SERVER START
========================================
*/

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
