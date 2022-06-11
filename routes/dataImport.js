var express = require("express");
var router = express.Router();

var dataImport = require("../controllers/dataImportController.js");

router.get("/fetch/templates", dataImport.fetchTemplate);
router.post("/import/xlsx/sekcije", dataImport.sekcijeImport);

module.exports = router;
