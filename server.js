// Importation de la bibliothèque Express
const express = require("express");

// Initialisation de l'application Express
const app = express();

// Création du serveur HTTP utilisant l'application Express
const server = require("http").Server(app);

// Importation de la bibliothèque UUID pour générer des identificateurs uniques
const { v4: uuidv4 } = require("uuid");

// Définition du moteur de vue pour l'application (EJS)
app.set("view engine", "ejs");

// Initialisation de Socket.IO en utilisant le serveur HTTP
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

// Importation de la bibliothèque PeerJS pour les communications en peer-to-peer
const { ExpressPeerServer } = require("peer");

// Configuration de la bibliothèque PeerJS
const opinions = {
  debug: true,
}

// Utilisation de PeerJS comme middleware pour l'application Express
app.use("/peerjs", ExpressPeerServer(server, opinions));

// Utilisation de la bibliothèque Express pour servir des fichiers statiques (CSS, images, etc.)
app.use(express.static("public"));

// Définition d'une route racine qui redirige vers une URL avec un identificateur unique
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// Définition d'une route pour une salle de chat avec un identificateur spécifique
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// Gestionnaire d'événements pour les connections de sockets
io.on("connection", (socket) => {
  // Gestionnaire d'événements pour la jointure à une salle de chat
  socket.on("join-room", (roomId, userId, userName) => {
    // Rejoindre la salle de chat avec l'identificateur spécifié
    socket.join(roomId);
    // Diffuser l'événement "user-connected" à tous les utilisateurs connectés dans la salle, sauf celui qui vient de se connecter
    setTimeout(()=>{
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000)
    // Gestionnaire d'événements pour la reception d'un message
    socket.on("message", (message) => {
      // Diffuser l'événement "createMessage" à tous les utilisateurs connectés dans la salle avec le contenu du message et le nom d'utilisateur
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030);
