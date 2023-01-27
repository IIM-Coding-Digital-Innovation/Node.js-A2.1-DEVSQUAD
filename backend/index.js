
const app = require('express')( );
const http = require("http");
const server = http.createServer(app);
const port = 3000;
const cors = require("cors");
const io = require('socket.io')(server)


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/frontend/index.html`);
});

io.on('connection',() =>    {
    console.log('Un utilisateur s\'est connecté');
});

server.listen(3000, () => {
    console.log('On écoute sur le port 3000... !');
});








// app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/frontend/index.html`)
    res.json(`${__dirname}/frontend/index.html`)
})


app.get("/api/user", (req, res) => {
    res.json(req.body.name);
})

app.post("/api/user", (req, res) => {
    // req.body.name = req.

    res.json(req.body)
    // res.json(req.body);
})

app.delete("/api/user", (req, res) => {
    
    res.json({nom:"",mdp:""});
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

io.on("chat message", () => {
    console.log("Message: " + msg)
})
