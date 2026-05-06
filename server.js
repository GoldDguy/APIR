const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/*
========================================
  API GAMEPASSES ROBLOX
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

        // 2. parcourir chaque jeu
        for (const game of games) {
            try {
                const gameId = game.id;

                const passRes = await axios.get(
                    `https://games.roproxy.com/v1/games/${gameId}/game-passes?limit=100&sortOrder=Asc`
                );

                const passes = passRes.data.data || [];

                for (const pass of passes) {
                    if (pass.isForSale) {
                        allPasses.push({
                            Item: {
                                AssetId: pass.id,
                                Name: pass.name,
                                AssetType: 34
                            },
                            Product: {
                                PriceInRobux: pass.price || 0
                            }
                        });
                    }
                }

            } catch (errGame) {
                console.log("Erreur game:", game.id);
            }
        }

        // réponse finale
        res.json(allPasses);

    } catch (err) {
        console.log("API ERROR:", err.message);
        res.json([]);
    }
});

/*
========================================
  HEALTH CHECK (Render)
========================================
*/

app.get("/", (req, res) => {
    res.send("API is running");
});

/*
========================================
  START SERVER (IMPORTANT RENDER)
========================================
*/

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
