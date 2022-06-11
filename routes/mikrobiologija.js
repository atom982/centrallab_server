var express = require("express");
var router = express.Router();

var mikrobiologija = require("../controllers/MikrobiologijaController.js");

// Analize
router.get("/mikrobiologija/analize/get", mikrobiologija.AnalizeGet);
router.post("/mikrobiologija/analize/edit", mikrobiologija.AnalizeEdit);
router.post("/mikrobiologija/analize/remove", mikrobiologija.AnalizeRemove);

// Bakterije
router.get("/mikrobiologija/bakterije/get", mikrobiologija.BakterijeGet);
router.post("/mikrobiologija/bakterije/insert", mikrobiologija.BakterijeInsert);
router.post("/mikrobiologija/bakterije/edit", mikrobiologija.BakterijeEdit);
router.post("/mikrobiologija/bakterije/remove", mikrobiologija.BakterijeRemove);

// Antibiogrami
router.get("/mikrobiologija/antibiogrami/get", mikrobiologija.AntibiogramiGet);
router.post(
  "/mikrobiologija/antibiogrami/insert",
  mikrobiologija.AntibiogramiInsert
);
router.post(
  "/mikrobiologija/antibiogrami/edit",
  mikrobiologija.AntibiogramiEdit
);
router.post(
  "/mikrobiologija/antibiogrami/remove",
  mikrobiologija.AntibiogramiRemove
);

// Antibiotici
router.get("/mikrobiologija/antibiotici/get", mikrobiologija.AntibioticiGet);
router.post(
  "/mikrobiologija/antibiotici/insert",
  mikrobiologija.AntibioticiInsert
);
router.post("/mikrobiologija/antibiotici/edit", mikrobiologija.AntibioticiEdit);
router.post(
  "/mikrobiologija/antibiotici/remove",
  mikrobiologija.AntibioticiRemove
);

module.exports = router;
