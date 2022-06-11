var express = require("express");
var router = express.Router();

var nalazi = require("../controllers/NalaziController.js");

router.get("/nalazi/list", nalazi.List);
router.get("/nalazi/verifikacija/:id", nalazi.Pregled);
router.post("/nalazi/create", nalazi.Nalaz);
router.post("/nalazi/mail", nalazi.Mail);
router.post("/nalazi/odobri", nalazi.odobriNalaz);
router.post("/nalazi/memo", nalazi.setHeight);
router.post("/nalazi/delete", nalazi.obrisiNalaz);
router.get("/nalazi/pregled/:id", nalazi.pregledNalaz);
router.post("/outbox/delete", nalazi.obrisiOutbox);
router.get("/nalazi/outbox/:id", nalazi.outboxNalaz);
router.post("/nalazi/check/:pid/:id", nalazi.checkifComplete);

module.exports = router;
