var express = require("express");
var router = express.Router();

var nalazi = require("../controllers/ReportController.js");

router.post("/reports/kprotokola", nalazi.KProtokol);
router.post("/reports/worklists", nalazi.WorkList);
router.post("/reports/fpodanu", nalazi.FPodanu);
router.post("/reports/fpodanu/graph", nalazi.FPodanuGraph);
router.post("/reports/ppodanu", nalazi.PPodanu);
router.post("/reports/ppomjestu", nalazi.PPomjestu);
router.post("/reports/ppolokaciji", nalazi.PPoLokaciji);
router.post("/reports/tatpopacijentu", nalazi.TATpopacijentu);
// router.get('/nalazi/verifikacija/:id', nalazi.Pregled)

module.exports = router;
