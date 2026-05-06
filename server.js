const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/*
====================================
  GAMEPASSES VIA USERID
====================================
*/

app.get("/gamepasses/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        // 1. get games du joueur
        const gamesRes = await axios.get(
            `https://games.roproxy.com/v2/users/${userId}/games?sortOrder=Asc&limit=50`
        );

        const games = gamesRes.data.data || [];
        let allPasses = [];

        // 2. boucle games
        for (const game of games) {
            const placeId = game.rootPlace?.id;
            if (!placeId) continue;

            try {
                // 3. get gamepasses du jeu
                const passRes = await axios.get(
                    `https://games.roproxy.com/v1/games/${placeId}/game-passes?limit=100&sortOrder=Asc`
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

            } catch (e) {
                // ignore error game individuel
            }
        }

        return res.json(allPasses);

    } catch (err) {
        console.log("ERROR:", err.message);
        return res.json([]);
    }
});

/*
====================================
  START SERVER
====================================
*/

app.listen(process.env.PORT || 3000, () => {
    console.log("Render API running");
});
