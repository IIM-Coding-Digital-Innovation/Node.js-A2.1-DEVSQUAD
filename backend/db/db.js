const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
function dbConnexion () {
    mongoose.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connexion à la base de donnée établie"))
    .catch(error => console.log(error))
}

module.exports = dbConnexion


// const mongoose = require('mongoose')
// mongoose.set('strictQuery', true);

// mongoose.connect('mongodb://localhost:27017', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log("Connected to the database!");
// });