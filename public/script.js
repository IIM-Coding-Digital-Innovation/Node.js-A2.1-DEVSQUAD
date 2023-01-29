const socket = io("/"); //Utilisation de la lib socket.io pour établir la connexion avec le serveur
const videoGrid = document.getElementById("video-grid"); //get par l'id la div "video-grid" | cf /views/room.ejs
const myVideo = document.createElement("video"); // crée l'élement video
const showChat = document.querySelector("#showChat"); //get la div "showChat" | cf /views/room.ejs
const backBtn = document.querySelector(".header__back"); //selectionne la div header__back
myVideo.muted = true;


//modification du style de certaines class css & affichage du chat au click du bouton chat en responsive (personne 1)
backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

//modification du style de certaines class css & affichage du chat au click du bouton chat en responsive (personne 2)
showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const user = prompt("Enter your name"); //demande a l'utilisateur d'entrer son pseudo et le stock dans la variable "user"

var peer = new Peer({
  host: '127.0.0.1', //host (adress ip en local)
  port: 3030, //port
  path: '/peerjs', //chemin d'accès
  config: {
    //'iceServers' est utilisée pour configurer les serveurs STUN et TURN
    'iceServers': [

      //Serveurs STUN => découvrir l'adresse ip publique d'un user derrière un routeur NAT pour permettre aux users de comminuqer entre eux directement
      //Doc : https://www.comptia.org/content/guides/what-is-network-address-translation (NAT) || https://www.frameip.com/entete-stun/ (STUN)

      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },            //Serveurs STUN publique disponible
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },

      //On effectue 2 requêtes pour etre sur que ca marche car certains réseaux peuvent bloquer l'un des protocoles 
      //(UDP = plus rapide , plus sensible aux erreurs de transmission) (TCP = plus fiable , plus lent)


      //SERVER TURN (connexions p2p entre des perifériques qui se trouvent derrière des pare-feu ou des routeurs NAT)
      //Doc : https://webrtc.org/getting-started/turn-server?hl=fr

      {
        url: 'turn:192.158.29.39:3478?transport=udp', //Url du serveur TURN + le port ou il écoute (utilse le protocole UDP) || Doc :  https://fr.wikipedia.org/wiki/User_Datagram_Protocol
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', //clé d'authentification pour accèder au serveur TURN
        username: '28224511:1379330808' //nom d'utilisateur pour accèder au serveur TURN
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp', //Url du serveur TURN + le port ou il écoute (utilse le protocole TCP) || Doc : https://web.maths.unsw.edu.au/~lafaye/CCM/internet/tcp.htm
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', //clé d'authentification pour accèder au serveur TURN
        username: '28224511:1379330808' //nom d'utilisateur pour accèder au serveur TURN
      }
    ]
  },

  debug: 3 //niveau de débbogage dispo : 0-5 
  //3 = génère des informations de débogage détaillées qui peuvent être utilisées pour comprendre ce qui se passe dans le code et résoudre les éventuels problèmes.
});

let myVideoStream; //Stock le résultat de la méthode getUserMedia
navigator.mediaDevices //objet
  .getUserMedia({ //flux audio et vidéo de l'utilisateur
    audio: true, //demande accès audio
    video: true, //demande accès vidéo
  })
  .then((stream) => { //fonction fléché pour renvoyé le résultat par la méthode
    myVideoStream = stream; //myVideoStream contient la valeur des données du flux audio / vidéo
    addVideoStream(myVideo, stream); //add le flux vidéo et audio contenu dans "stream" sur la page web dans une class defini par "myVideo" 

    peer.on("call", (call) => { //si un appel vidéo est recu
      console.log('someone call me'); //test console
      call.answer(stream); //definis le flux audio/vidéo a transmettre en réponse
      const video = document.createElement("video"); //on crée un new element sur la page pour mettre les infos
      call.on("stream", (userVideoStream) => { //quand un appel vidéo est recu et accepté
        addVideoStream(video, userVideoStream); //ajout des données de flux vidéo
      });
    });

    socket.on("user-connected", (userId) => { //si connexion d'un nouvel utilisateur
      connectToNewUser(userId, stream); //definit son id et son flux audio/vidéo
    });
  });

const connectToNewUser = (userId, stream) => { //permet de se connecter a un nouvel utilisateur , prend en entrée l'id de l'utilisateur et un flux vidéo
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream); //effectue un appel a l'utilisateur en utilisant la méthode call avec comme paramètres l'id de l'utilisateur et le flux vidéo
  const video = document.createElement("video");//on crée un new element sur la page pour mettre les infos
  call.on("stream", (userVideoStream) => { //quand un appel vidéo est recu et accepté
    addVideoStream(video, userVideoStream); //ajout des données de flux vidéo
  });
};

peer.on("open", (id) => { //lorsque l'évènement open est déclenché alors
  console.log('my id is' + id); //met dans la console l'id de l'utilisateur
  socket.emit("join-room", ROOM_ID, id, user); //emet via les sockets un évènement join-room qui contenient l'id de la room , l'identifiant de l'utilisateur et son nom
});

//fonction qui ajoute le flux vidéo a une source HTML
const addVideoStream = (video, stream) => { //prend en entrée un élément video et un flux
  video.srcObject = stream; //flux est affecté a la propriété srcObject de l'élément vidéo
  video.addEventListener("loadedmetadata", () => { //permet de déclencher la lecture de la vidéo dès que les métadonnées sont chargées
    video.play(); //démarre la lecture de la vidéo
    videoGrid.append(video); //la vidéo est ajouté a l'élément "videoGrid"
  });
};

let text = document.querySelector("#chat_message"); //selectionne div "chat_message"
let send = document.getElementById("send"); //selectionne div par l'id "send
let messages = document.querySelector(".messages"); //selectionne div "message"

send.addEventListener("click", (e) => { //lorsque le bouton send (pour envoyé un message) est cliqué
  if (text.value.length !== 0) { //si la valeur du champ "text" n'est pas vide alors
    socket.emit("message", text.value); //on emet la valeur a travers la socket
    text.value = ""; //après ca la valeur text est réinitialisée
  }
});

text.addEventListener("keydown", (e) => { //si une touche est utilisé
  if (e.key === "Enter" && text.value.length !== 0) { //si cette touche est la touche "entrée" et que la longueur de la valeur text n'est pas égale a null alors
    socket.emit("message", text.value); //on send avec la socket le nom de l'évènement (message) et la valeur du "text"
    text.value = ""; //après ca la valeur text est réinitialisée
  }
});

const inviteButton = document.querySelector("#inviteButton"); //recupere la div pour le bouton d'invitation
const muteButton = document.querySelector("#muteButton"); //recupere la div pour le bouton de mute
const stopVideo = document.querySelector("#stopVideo"); //recupere la div pour le bouton de caméra
muteButton.addEventListener("click", () => { //au clique sur le bouton mute
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) { //si il est activé
    myVideoStream.getAudioTracks()[0].enabled = false; //on met l'audio en false
    html = `<i class="fas fa-microphone-slash"></i>`; //on remplace l'illustration
    muteButton.classList.toggle("background__red"); //ajoute la classe background__red (si l'audio est activé elle n'est pas présente)
    muteButton.innerHTML = html; //on applique les changements
  } else { //sinon si c'est sur false
    myVideoStream.getAudioTracks()[0].enabled = true; //on met l'audio en true
    html = `<i class="fas fa-microphone"></i>`; //on remplace l'illustration
    muteButton.classList.toggle("background__red"); //retire la classe background__red
    muteButton.innerHTML = html;//on applique les changements
  }
});

stopVideo.addEventListener("click", () => { //au clique sur le bouton de la caméra
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) { //si activé
    myVideoStream.getVideoTracks()[0].enabled = false; //on met l'audio en false
    html = `<i class="fas fa-video-slash"></i>`; //on remplace l'illustration
    stopVideo.classList.toggle("background__red"); //ajoute la classe background__red (si la caméra est activé elle n'est pas présente)
    stopVideo.innerHTML = html; //on applique les changements
  } else { //sinon si il n'est pas activé
    myVideoStream.getVideoTracks()[0].enabled = true; //on met l'audio en true
    html = `<i class="fas fa-video"></i>`; //on remplace l'illustration
    stopVideo.classList.toggle("background__red"); //retire la classe background__red
    stopVideo.innerHTML = html; //on applique les changements
  }
});

inviteButton.addEventListener("click", (e) => { //au clique sur le bouton d'invitation
  prompt(
    "Copies ce lien et envoies le aux gens que tu veux inviter pour parler", //envoie le message contenant une phrase qui explique + le lien actuel de la room
    window.location.href
  );
});

socket.on("createMessage", (message, userName) => { //évenèment "createMessage" déclenché sur le socket , appelle de la fonction avec deux arguments (le message et le username associé)
  messages.innerHTML =
    messages.innerHTML + //Création d'un nouvel élément html
    `<div class="message"> 
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName //si l'userName = user de la session alors ecrire me : {message} sinon mettre {userName} : {message}
    }</span> </b>
        <span>${message}</span>
    </div>`;
});
