var express = require("express");
var router = express.Router();

var partneri = require("../controllers/PartneriController.js");

// Partneri - Pošiljaoc, Naručioc i Izvršioc
router.get("/partneri/all/get", partneri.PartneriAllGet);
router.get("/partneri/single/get", partneri.PartneriSingleGet);
router.post("/partneri/new/insert", partneri.PartneriNewInsert);
router.post("/partneri/single/edit", partneri.PartneriSingleEdit);
router.post("/partneri/single/remove", partneri.PartneriSingleRemove);
router.post("/partneri/all/remove", partneri.PartneriAllRemove);

module.exports = router;
