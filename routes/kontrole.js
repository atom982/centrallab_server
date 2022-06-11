var express = require("express");
var router = express.Router();

var kontrole = require("../controllers/KontroleController.js");

router.post("/kontrole/aparat/list", kontrole.ListByAnalyser);
router.post("/kontrole/tip/aparat/list", kontrole.ListByTypeandAnalyser);
router.post("/kontrole/aparat/testovi/list", kontrole.ListTestsByAnalyser);
router.post("/kontrole/uzorci/save", kontrole.KontrolaSave);
router.post("/kontrole/uzorci/delete", kontrole.KontrolaDelete);
router.post("/kontrole/pregled/delete", kontrole.KontrolaPregledDelete);
router.get("/kontrole/list", kontrole.List);
router.post("/kontrole/pregled/levey", kontrole.KontrolaLevey);
router.post("/kontrole/pregled/lotovi", kontrole.KontrolaLotovi);
router.post("/kontrole/pregled/:id", kontrole.Show);
router.post("/kontrole/manual/create/:id", kontrole.ManualCreate);
router.post("/kontrole/rezultat/update/:id", kontrole.RezultatUpdate);

// New Routes

router.get("/kontrole/list/all", kontrole.KontroleGet);
router.post("/kreference/list/all", kontrole.KreferenceGet);
router.post("/kontrole/definicija/save", kontrole.KontroleDefinicijaSave);
router.post("/kontrole/definicija/delete", kontrole.KontroleDefinicijaDelete);
router.post("/kontrole/definicija/edit", kontrole.KontroleDefinicijaEdit);
router.post("/kontrole/definicija/get", kontrole.KontroleDefinicijaGet);
router.post("/kontrole/definicija/reference", kontrole.KontroleDefinicijaRef);
router.post("/kontrole/unos/save", kontrole.KontroleSave);

// Obrada Kontrolnih uzoraka - Routes

router.post("/control/sample/get", kontrole.ControlSampleGet);
router.post("/control/sample/delete", kontrole.ControlSampleDelete);
router.post("/control/comment/get", kontrole.ControlCommentGet);
router.post("/control/comment/set", kontrole.ControlCommentSet);
router.post("/control/results/save", kontrole.ControlResultsSave);
router.post("/control/retest/enable", kontrole.ControlRetestEnable);
router.post("/control/retest/disable", kontrole.ControlRetestDisable);
router.post("/control/results/approve", kontrole.ControlResultsApprove);
router.post("/control/results/disapprove", kontrole.ControlResultsDisapprove);
router.post("/control/results/verify", kontrole.ControlResultsVerify);
router.post("/control/results/unverify", kontrole.ControlResultsUnverify);
router.post("/control/nalazi/create", kontrole.ControlNalaziCreate);
router.post("/control/nalazi/mail", kontrole.ControlNalaziMail);

// Exports

module.exports = router;
