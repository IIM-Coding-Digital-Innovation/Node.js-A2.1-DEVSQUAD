const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const port = 3000;

const cors = require("cors");

app.use(express.json());
app.use(cors());

app.get("/api/user", (req, res) => {
    res.json({msg: "Hello world"});
})

app.post("/api/user", (req, res) => {
    res.json(req.body);
})

app.delete("/api/user", (req, res) => {
    res.json(req.body);
})

app.post("/api/user/login", (req, res) => {
    res.json(req.body);
})

app.get("/api/user/logout", (req, res) => {
    res.json({msg: "Hello world"});
})

app.post("/api/user/forget", (req, res) => {
    res.json(req.body);
})


server.listen(port, () => {
    console.log(`On écoute sur le port ${port}`);
})

