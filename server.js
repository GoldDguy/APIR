const express = require("express");
const app = express();

app.use(express.json());

let database = {};

app.post("/addPasses", (req, res) => {
    const { userId, passes } = req.body;
    database[userId] = passes;
    res.send({ success: true });
});

app.get("/passes/:userId", (req, res) => {
    res.send(database[req.params.userId] || []);
});

app.listen(3000, () => console.log("Server running"));
