const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const mongodbsession = require("connect-mongodb-session")(session);
const app = express();
const port = 3000;
// Modelo del usuario.
const UserModel = require("./models/User");
const mongoURI = "mongodb://localhost:27017/sessions";

// Conexion a MongoDB
mongoose
  .connect("mongodb://localhost:27017/sessions", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Mongo DB conected!");
  });

const store = new mongodbsession({
  uri: mongoURI,
  collection: "mySessions",
});

// Seteo de las vistas.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "key that will sign the cooke",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// Zona del Rutas, llevarse esto a otro carpeta/archivo...

// Ruta principal...

app.get("/", (req, res) => {
  res.render("index");
});

// Rutas Login.
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  // Si el usuario no existe se devielve al login.
  if (!user) {
    return res.redirect("/login");
  }
  // Si el usuario existe comparo las password para
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // La contraseña no es correcta!
    return res.redirect("/login");
  }
  // Si esta todo ok lo enviamos el dashboard.
  res.redirect("/dashboard");
});

// Rutas de Register.
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Primero revisar si el usuario ya esta registrado!.
  let user = await UserModel.findOne({ email });

  if (user) {
    return res.redirect("/register");
  }
  const hashedPsw = await bcrypt.hash(password, 12);
  user = new UserModel({
    username,
    email,
    password: hashedPsw,
  });

  await user.save(); // Metodo que guarda el usuario creado.
  res.redirect("/login");
});

// Ruta del dashboard
app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// app.get("/", (req, res) => {
//   req.session.isAuth = true;
//   console.log(req.session);
//   console.log(req.session.id);
//   res.send("sesiones y cookies :)");
// });

// Archivos estaticos.
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`On port: ${port}`);
});
