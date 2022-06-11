var express = require("express");
var router = express.Router();

var pacijenti = require("../controllers/PacijentController.js");

router.post("/pacijenti/unos/find", pacijenti.PatientFind);
router.post("/pacijenti/unos/findid", pacijenti.PatientFindID);
router.post("/pacijenti/unos/save", pacijenti.PatientSave);
router.get("/pacijenti/detalji/:id", pacijenti.DetaljanPregled);
router.post("/pacijenti/detalji/update/:id", pacijenti.PacijentUpdate);

module.exports = router;
