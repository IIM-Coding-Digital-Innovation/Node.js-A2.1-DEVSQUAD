const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const port = 3000;

const cors = require("cors");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({msg: "Hello world"});
})

app.post("/", (req, res) => {
    res.json(req.body);
})

app.put("/", (req, res) => {
    res.json(req.body);
})

app.delete("/", (req, res) => {
    res.json(req.body);
})
server.listen(port, () => {
    console.log(`On écoute sur le port ${port}`);
})