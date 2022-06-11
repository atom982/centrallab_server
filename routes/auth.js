var express = require("express");
var router = express.Router();
var multer = require("multer");
var auth = require("../controllers/AuthController.js");
const config = require("../config/index");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, config.multer_temp);
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname + ".jpeg");
  }
});

var upload = multer({ storage: storage });

router.post("/login/users", auth.login);
router.post("/logout/users", auth.logout);
router.post("/signup", auth.signup);
router.post("/init/signup", auth.initSignup);
router.post("/users/sifra", auth.sifra);
router.post("/users/:image", auth.image);
router.post("/korisnik/brisanje", auth.korisnikDelete);
router.post("/korisnik/role", auth.korisnikRole);
router.post("/korisnik/private", auth.mySettings);
router.post("/image/upload", auth.imageUpload);
router.get("/users/list", auth.getUsers);
router.post("/image/upload2", upload.single("file"), auth.imageUpload2);

module.exports = router;
