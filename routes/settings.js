var express = require("express");
var router = express.Router();

var settings = require("../controllers/SettingsController.js");

// Sites
router.get("/postavke/list/sites", settings.SitesGet);
router.post("/postavke/sites/edit", settings.SitesEdit);
router.post("/postavke/sidebar/edit", settings.SidebarEdit);
router.post("/postavke/sites/remove", settings.SitesRemove);
router.post("/postavke/sites/insert", settings.SitesInsert);

// Users
router.get("/postavke/list/users", settings.UsersGet);
router.post("/postavke/users/edit", settings.UsersEdit);
router.post("/postavke/users/remove", settings.UsersRemove);
router.post("/postavke/users/insert", settings.UsersInsert);

// Analysers
router.get("/postavke/list/analysers", settings.AnalysersGet);
router.post("/postavke/analysers/edit", settings.AnalysersEdit);
router.post("/postavke/analysers/remove", settings.AnalysersRemove);
router.post("/postavke/analysers/insert", settings.AnalysersInsert);

// Lokacije
router.get("/postavke/list/lokacije", settings.LokacijeGet);
router.get("/postavke/list/customers", settings.CustomersGet);
router.post("/postavke/lokacije/edit", settings.LokacijeEdit);
router.post("/postavke/lokacije/remove", settings.LokacijeRemove);
router.post("/postavke/lokacije/insert", settings.LokacijeInsert);

// Doktori
router.get("/postavke/list/doktori", settings.DoktoriGet);
router.post("/postavke/doktori/edit", settings.DoktoriEdit);
router.post("/postavke/doktori/remove", settings.DoktoriRemove);
router.post("/postavke/doktori/insert", settings.DoktoriInsert);

// Mjesta
router.get("/postavke/list/mjesta", settings.MjestaGet);
router.post("/postavke/mjesta/edit", settings.MjestaEdit);
router.post("/postavke/mjesta/remove", settings.MjestaRemove);
router.post("/postavke/mjesta/insert", settings.MjestaInsert);

// Sekcije
router.get("/postavke/list/sekcije", settings.SekcijeGet);
router.post("/postavke/sekcije/edit", settings.SekcijeEdit);
router.post("/postavke/sekcije/remove", settings.SekcijeRemove);
router.post("/postavke/sekcije/insert", settings.SekcijeInsert);

// Grupe testova
router.get("/postavke/list/grupe", settings.GrupeGet);
router.post("/postavke/grupe/edit", settings.GrupeEdit);
router.post("/postavke/grupe/remove", settings.GrupeRemove);
router.post("/postavke/grupe/insert", settings.GrupeInsert);

// Referentne grupe
router.get("/postavke/list/refgr", settings.RefGrGet);
router.post("/postavke/refgr/edit", settings.RefGrEdit);
router.post("/postavke/refgr/remove", settings.RefGrRemove);
router.post("/postavke/refgr/insert", settings.RefGrInsert);

// Mjerne jedinice
router.get("/postavke/list/jedinice", settings.JediniceGet);
router.post("/postavke/jedinice/edit", settings.JediniceEdit);
router.post("/postavke/jedinice/remove", settings.JediniceRemove);
router.post("/postavke/jedinice/insert", settings.JediniceInsert);

// Tehnologije analizatora
router.get("/postavke/list/tehnologije", settings.TehAnalizatorGet);
router.post("/postavke/tehnologije/edit", settings.TehAnalizatorEdit);
router.post("/postavke/tehnologije/remove", settings.TehAnalizatorRemove);
router.post("/postavke/tehnologije/insert", settings.TehAnalizatorInsert);

// Tipovi analizatora
router.get("/postavke/list/tipovi", settings.TipAnalizatorGet);
router.post("/postavke/tipovi/edit", settings.TipAnalizatorEdit);
router.post("/postavke/tipovi/remove", settings.TipAnalizatorRemove);
router.post("/postavke/tipovi/insert", settings.TipAnalizatorInsert);

// Tipovi uzoraka
router.get("/postavke/list/uzorak", settings.UzorakGet);
router.post("/postavke/uzorak/edit", settings.UzorakEdit);
router.post("/postavke/uzorak/remove", settings.UzorakRemove);
router.post("/postavke/uzorak/insert", settings.UzorakInsert);

// Definicija uzoraka
router.get("/postavke/list/def/uzorak", settings.UzorakDefGet);
router.post("/postavke/uzorak/def/edit", settings.UzorakDefEdit);
router.post("/postavke/uzorak/def/remove", settings.UzorakDefRemove);
router.post("/postavke/uzorak/def/insert", settings.UzorakDefInsert);

// Analize
router.get("/postavke/list/analize", settings.AnalizeGet);
router.post("/postavke/analiza/edit", settings.AnalizaEdit);

module.exports = router;
