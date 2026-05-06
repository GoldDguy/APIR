const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/*
========================================
  GAMEPASSES API ROBLOX
========================================
*/

app.get("/passes/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const gamesRes = await axios.get(
            `https://games.roproxy.com/v2/users/${userId}/games?sortOrder=Asc&limit=50`
        );

        const games = gamesRes.data.data || [];
        let allPasses = [];

        for (const game of games) {
            try {
                const passRes = await axios.get(
                    `https://games.roproxy.com/v1/games/${game.id}/game-passes?limit=100`
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

            } catch (e) {}
        }

        res.json(allPasses);

    } catch (err) {
        console.log(err);
        res.json([]);
    }
});

/*
========================================
  START SERVER
========================================
*/

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
