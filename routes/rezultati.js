var express = require("express");
var router = express.Router();

var rezultat = require("../controllers/RezultatController.js");

// Get all rezultats
router.get("/rezultati/list/:section", rezultat.list);
router.get("/rezultati/listsve", rezultat.listSve);

router.get("/rezultati/olist/:section", rezultat.olist);
router.get("/rezultati/olistsve", rezultat.olistSve);

// Get single rezultat by id
router.get("/rezultati/show/:patient/:id", rezultat.show);
router.get("/rezultati/showsingle/:id", rezultat.showSingle);
router.get("/rezultati/sekcija/:id", rezultat.sekcijaShow);

// Edit rezultat
router.post("/rezultati/edit/:id", rezultat.edit);
router.post("/rezultati/edit/ispis/:id", rezultat.editIspis);
router.post("/rezultati/edit/analit/:id", rezultat.editAnalit);

// Edit rezultat
router.post("/rezultati/append/:id", rezultat.Append);

// Edit update
router.post("/rezultati/update/:sid/:rezid", rezultat.update);

// Edit update
router.post("/rezultati/izaberimulti/:id", rezultat.izborMulti);

module.exports = router;
