var express = require("express");
var router = express.Router();

var racuni = require("../controllers/RacuniController.js");

router.post("/racuni/get", racuni.Get);
router.post("/racuni/popust", racuni.Popust);
router.post("/racuni/cijena", racuni.Cijena);
router.post("/racuni/report", racuni.Report);
router.post("/racuni/delete", racuni.Delete);

router.get("/izvjestaj/xlsx/download", racuni.Download);

module.exports = router;
