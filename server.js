const express = require("express");
const axios = require("axios");

const app = express();

async function getGamepassPrice(gamePassId) {
    try {
        const res = await axios.get(
            `https://apis.roproxy.com/game-passes/v1/game-passes/${gamePassId}/product-info`
        );

        return res.data.PriceInRobux || 0;
    } catch {
        return 0;
    }
}

async function getGamepasses(universeId) {
    try {
        const res = await axios.get(
            `https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes?limit=100&sortOrder=Asc`
        );

        const passes = res.data.gamePasses || [];

        return await Promise.all(
            passes.map(async (pass) => ({
                id: pass.id,
                productId: pass.productId,
                name: pass.displayName,
                price: await getGamepassPrice(pass.id),
                isForSale: pass.isForSale
            }))
        );

    } catch {
        return [];
    }
}

app.get("/gamepasses/:userId", async (req, res) => {

    const userId = req.params.userId;

    try {

        // Jeux du joueur
        const games = await axios.get(
            `https://games.roproxy.com/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Asc`
        );

        const universes = games.data.data || [];

        // Tous les gamepasses de tous les jeux
        const allPasses = await Promise.all(

            universes.map(async (game) => {

                const passes = await getGamepasses(game.id);

                return {
                    universeId: game.id,
                    placeId: game.rootPlace.id,
                    gameName: game.name,
                    gamepasses: passes
                };

            })

        );

        res.json({
            userId,
            games: allPasses
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("API running on port " + PORT);
});
