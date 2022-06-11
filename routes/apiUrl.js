var express = require("express");
var router = express.Router();

var apiUrl = require("../controllers/apiUrlController.js");

router.get("/prijem/pacijenti", apiUrl.apiUrlPatients);
router.get("/obrada/pregled", apiUrl.apiUrlObradaPregled);
router.get("/nalazi/pregled", apiUrl.apiUrlNalaziPregled);
router.get("/nalazi/outbox", apiUrl.apiUrlNalaziOutbox);
router.get("/assays/lab", apiUrl.apiUrlLabAssays);
router.get("/assays/ana", apiUrl.apiUrlAnaAssays);
router.get("/control/edit", apiUrl.apiUrlControlEdit);
router.get("/control/results", apiUrl.apiUrlControlResults);

module.exports = router;
