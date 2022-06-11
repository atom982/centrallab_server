var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var fs = require("fs");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var env = require("dotenv").config();
var crypto = require("crypto");
var path = require("path");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const passportConfig = require("./config/passport")(passport);

config = require("./config/index");

mongoose
  .connect(
    "mongodb://" +
      process.env.DB_USER +
      ":" +
      process.env.DB_PASSWORD +
      "%2B" +
      "@" +
      process.env.DB_HOST +
      ":" +
      process.env.DB_PORT +
      "/" +
      process.env.DB_NAME
  )
  .then(() =>
    console.log(
      "Connected to " +
        process.env.DB_NAME +
        " DB || PORT:" +
        process.env.DB_PORT
    )
  )
  .catch(err => console.error(err));

mongoose.Promise = global.Promise;

var users = require("./routes/users");
var apiUrl = require("./routes/apiUrl");
var assays = require("./routes/assays");
var settings = require("./routes/settings");
var samples = require("./routes/samples");
var rezultati = require("./routes/rezultati");
var auth = require("./routes/auth");
var postavke = require("./routes/postavke");
var kontrole = require("./routes/kontrole");
var nalazi = require("./routes/nalazi");
var pacijenti = require("./routes/pacijenti");
var reports = require("./routes/reports");
var racuni = require("./routes/racuni");
var dashboard = require("./routes/dashboard");
var odobravanje = require("./routes/odobravanje");
var loger =  require("./routes/loger");
var mikrobiologija =  require("./routes/mikrobiologija");
var integration =  require("./routes/integration");
var inventar =  require("./routes/inventar");

// Partneri - Pošiljaoc, Naručioc i Izvršioc
var partneri = require("./routes/partneri");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

app.use(bodyParser.json({ limit: "5000kb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "5000kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/.well-known/acme-challenge/:id", function(req, res) {
  res
    .status(200)
    .send(req.params.id + ".7XYzZaNiZoGXiYCHMEsBSARn2xwrBx-cAHMFnI1N4j8");
});

app.get("/cert", function(req, res) {
  fs.readFile(config.cert_key + "cert.pem", "utf-8", function(err, cert) {
    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control')
    // res.set('Content-Type', 'text/plain')
    res.set("Content-Type", "text/plain");
    res.setHeader("Access-Control-Allow-Origin", "*");
    //console.log(cert);
    res.send(cert);
  });
});

app.get("/sign-message", function(req, res) {
  var toSign = req.query.request;
  fs.readFile(config.root_key + "key.pfx", function(err, privateKey) {
    var sign = crypto.createSign("SHA1");
    sign.update(toSign);
    var signature = sign.sign({ key: privateKey }, "base64");
    res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control')
    res.set("Content-Type", "text/plain");
    res.send(signature);
  });
});

app.use(validateUser, auth);
app.use(validateUser, apiUrl);
app.use(validateUser, assays);
app.use(validateUser, settings);
app.use(validateUser, pacijenti);
app.use(validateUser, samples);
app.use(validateUser, rezultati);
app.use(validateUser, nalazi);
app.use(validateUser, kontrole);
app.use(validateUser, reports);
app.use(validateUser, postavke);
app.use(validateUser, racuni);
app.use(validateUser, dashboard);
app.use(validateUser, odobravanje);
app.use(validateUser, loger);
app.use(validateUser, mikrobiologija);
app.use(validateUser, integration);
app.use(validateUser, inventar);

// Partneri - Pošiljaoc, Naručioc i Izvršioc
app.use(validateUser, partneri);

function validateUser(req, res, next) {
  if (
    req.originalUrl === "/login/users" ||
    req.originalUrl.includes("acme-challenge")||
    req.originalUrl === "/post/api"||
    req.originalUrl === "/get/api"
  ) {
    next();
  } else {
    var token = req.body.token || req.query.token;
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        if (config.baseURL.includes(".com") || config.baseURL.includes("ilab.ba")) {
          res.redirect(config.baseURL);
        } else {
          res.json({
            status: "error",
            message: "Unauthorized access",
            data: null
          });
        }
      } else {
        req.body.decoded = decoded;
        next();
      }
    });
  }
}

app.use(function(req, res, next) {
  var err = new Error("Nije pronađeno");
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
});

module.exports = app;
