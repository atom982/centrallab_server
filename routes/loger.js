var express = require("express");
var router = express.Router();

var loger = require("../controllers/LogerController.js");

router.post("/loger/create", loger.Create);
router.post("/loger/read", loger.Read);
router.post("/loger/graph", loger.Graph);

router.get("/loger/list/frizideri", loger.FriziderList);
router.post("/loger/frizider/delete", loger.FriziderDelete);
router.post("/loger/frizider/edit", loger.FriziderEdit);

module.exports = router;