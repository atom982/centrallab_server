var express = require("express");
var router = express.Router();

var odobravanje = require("../controllers/OdobravanjeController.js");

router.post("/rezultati/odobravanje/odobri/:id", odobravanje.OdobriSve);
router.post("/rezultati/odobravanje/ukloni/:id", odobravanje.UkloniOdobrenje);
router.post("/rezultati/odobravanje/retest/da", odobravanje.RetestActivate);
router.post("/rezultati/odobravanje/retest/ne", odobravanje.RetestDeactivate);
router.post("/rezultati/odobravanje/retest/save", odobravanje.RetestSave);
router.post("/rezultati/odobravanje/calculate/:id", odobravanje.Calculate);
router.post("/rezultati/odobravanje/sacuvaj/:id", odobravanje.SacuvajRezultate);
router.post("/rezultati/odobravanje/analiti/:id", odobravanje.SacuvajAnalite);
router.post("/rezultati/odobravanje/references", odobravanje.SetReferences);
router.post("/rezultati/odobravanje/results", odobravanje.GetAllResults);
router.post("/rezultati/odobravanje/choose", odobravanje.ChooseResult);
router.post("/rezultati/odobravanje/reference", odobravanje.Reference);
router.post("/rezultati/odobravanje/multi/choose", odobravanje.ChooseMulti);
router.get(
  "/rezultati/odobravanje/samples/:patient/:id",
  odobravanje.GetSamples
);
router.get("/get/pid/today", odobravanje.getPID);
router.get(
  "/rezultati/odobravanje/barcodes/:patient/:id",
  odobravanje.GetBarcodes
);
router.get("/rezultati/odobravanje/analysers", odobravanje.GetAnalysers);
router.post("/rezultati/obrada/verifikacija/:id", odobravanje.verifikacija);
router.post("/rezultati/nalazi/status", odobravanje.StatusNalaza);

router.get("/rezultati/pagination", odobravanje.PreviousNext);
router.get("/patient/evaluation/single", odobravanje.EvaluationSingle);
router.get("/labassay/evaluation/single", odobravanje.LabAssayEvalSingle);
router.get("/patient/evaluation/multi", odobravanje.EvaluationMulti);
router.get("/labassay/evaluation/multi", odobravanje.LabAssayEvalMulti);

module.exports = router;
