var express = require("express");
var router = express.Router();

var samples = require("../controllers/SampleController.js");

router.get("/uzorci/lokacije/list", samples.LokacijeList);
router.get("/uzorci/customers/list", samples.CustomersList);
router.post("/uzorci/sekcije/list", samples.ListBySection);
// 22.03.2019
router.post("/uzorci/labassay/tip", samples.ListByLAbAssayType);
// ............................................................
router.post("/uzorci/sekcije/listp", samples.ListBySectionP);
router.post("/uzorci/sekcije/testovi", samples.TestsBySection);
router.get("/uzorci/sekcije/list", samples.SectionList);
router.post("/uzorci/save", samples.Save);
router.post("/uzorci/savep", samples.SaveP);
router.post("/uzorci/patient", samples.Patient);
router.get("/uzorci/list/:section", samples.List);
router.get("/uzorci/listsve", samples.ListSve);
router.get("/uzorci/show/:id", samples.Show);
router.post("/uzorci/delete", samples.Delete);
router.post("/uzorci/update", samples.Update);
router.get("/uzorci/racuni", samples.Racuni);
router.post("/uzorci/racuni/:id", samples.selectSample);
router.get("/uzorci/barcode/:id", samples.BarData);
router.post("/uzorci/komentar/:id", samples.setKomentar);
router.get("/uzorci/komentar/:id", samples.getKomentar);
router.get("/api/patients", samples.apiUrlPatients);
router.get("/patient/details/:id", samples.patientDetails);
router.post("/labassays", samples.prijemLabassays);
router.post("/sacuvaj/uzorke", samples.sacuvajUzorke);

module.exports = router;
