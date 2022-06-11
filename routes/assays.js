var express = require("express");
var router = express.Router();

var assays = require("../controllers/AssaysController.js");

router.get("/assays/settings", assays.Settings);
router.get("/assays/analyser", assays.Analyser);
router.get("/assays/site", assays.Site);
router.get("/assays/lab/list", assays.LabAssaysList);
router.get("/assays/ana/list", assays.AnaAssaysList);
router.post("/assays/lab/save", assays.LabAssaySave);
router.post("/assays/ana/save", assays.AnaAssaySave);
router.post("/assays/lab/edit", assays.LabAssayEdit);
router.post("/assays/lab/calc/edit", assays.CalcEdit);
router.post("/assays/ana/edit", assays.AnaAssayEdit);
router.post("/assays/lab/price", assays.Price);

module.exports = router;
