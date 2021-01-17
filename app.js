// richiederlo il prima possibile nel server
// in questo modo ha accesso al .env
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// la crittografia di mongoose utilizza una qualunque stringa random per cifrare il messaggio
// se una persona sa il secret può decifrare le password
// const secret = "ciao";

// da fare prima del model dato che poi dobbiamo passare lo user schema
// in pratica cifra tutta la collection ma mettendo l'ultimo parametro gli diciamo di cifrare solo la password
// con save() cifra e con find() decifra
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  newUser.save((err) => {
    if (err) console.log(err);
    else res.render("secrets");
  });
});

app.post("/login", (req, res) => {
  User.findOne({ email: req.body.username }, (err, foundUser) => {
    if (err) console.log(err);
    else {
      if (foundUser.password === req.body.password) res.render("secrets");
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000.");
});
