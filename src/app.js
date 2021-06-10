const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const mongodbsession = require("connect-mongodb-session")(session);
const app = express();
const port = 3000;
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



// app.get("/", (req, res) => {
//   req.session.isAuth = true;
//   console.log(req.session);
//   console.log(req.session.id);
//   res.send("sesiones y cookies :)");
// });


// Archivos estaticos.
app.use(express.static(path.join(__dirname, 'public')));


app.listen(port, () => {
  console.log(`On port: ${port}`);
});
