var express = require("express");
var router = express.Router();
var multer = require("multer");
var postavke = require("../controllers/PostavkeController.js");
const config = require("../config/index");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, config.multer_temp);
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname + ".jpeg");
  }
});

var upload = multer({ storage: storage });

router.post("/postavke/generalno", postavke.generalno);
router.post("/postavke/save", postavke.save);
router.get("/postavke/list", postavke.list);
router.post("/postavke/delete", postavke.delete);
router.post("/postavke/lokacija/save", postavke.lokacijaSave);
router.get("/postavke/lokacija/list", postavke.lokacijaList);
router.post("/postavke/lokacija/delete", postavke.lokacijaDelete);
router.post("/postavke/doktor/save", postavke.doktorSave);
router.get("/postavke/doktor/list", postavke.doktorList);
router.post("/postavke/doktor/delete", postavke.doktorDelete);
router.post("/postavke/sekcija/save", postavke.sekcijaSave);
router.get("/postavke/sekcija/list", postavke.sekcijaList);
router.post("/postavke/sekcija/delete", postavke.sekcijaDelete);
router.get("/postavke/aparat/mount/list", postavke.aparatMountList);
router.post("/postavke/aparat/mount/list", postavke.grupaMountList);
router.get("/postavke/jedinice/mount/list", postavke.jedinicaMountList);
router.post("/postavke/aparat/save", postavke.aparatSave);
router.get("/postavke/aparat/list", postavke.aparatList);
router.get("/postavke/aparat/listall", postavke.aparatListAll);
router.post("/postavke/aparat/delete", postavke.aparatDelete);
router.post("/postavke/labtest/save", postavke.labtestSave);
router.get("/postavke/labtest/list", postavke.labtestList);
router.post("/postavke/labtest/delete", postavke.labtestDelete);
router.post("/postavke/labtest/edit", postavke.labtestEdit);
router.post("/postavke/anatest/edit", postavke.anatestEdit);
router.post("/postavke/labtest/analit/save", postavke.labtestAnalitSave);
router.post("/postavke/labtest/analit/list", postavke.labtestAnalitList);
router.post("/postavke/labtest/analit/delete", postavke.labtestAnalitDelete);
router.post("/postavke/labtest/analit/edit", postavke.labtestAnalitEdit);
router.post("/postavke/labtest/group/list", postavke.labtestGroupList);
router.post("/postavke/labtest/assay/list", postavke.labtestAssayList);
router.post("/postavke/aptest/save", postavke.aptestSave);
router.post("/postavke/aptest/calculated", postavke.aptestCalculated);
router.post("/postavke/aptest/list", postavke.aptestList);
router.post("/postavke/aptest/show/:id", postavke.aptestShow);
router.post("/postavke/aptest/listall", postavke.aptestListAll);
router.post("/postavke/aptest/delete", postavke.aptestDelete);
router.post("/postavke/aptest/referentne/list", postavke.referentneList);
router.post("/postavke/aptest/referentne/save", postavke.referentneSave);
router.post("/postavke/aptest/referentne/update", postavke.referentneUpdate);
router.post("/postavke/aptest/referentne/delete", postavke.referentneDelete);
router.post("/postavke/aptest/analit/referentne/save", postavke.refAnalitSave);
router.post(
  "/postavke/aptest/analit/referentne/update",
  postavke.refAnalitUpdate
);
router.post(
  "/postavke/aptest/analit/referentne/delete",
  postavke.refAnalitDelete
);
router.post("/postavke/aptest/reftip/update", postavke.refTipUpdate);
router.post("/postavke/kontrole/save", postavke.kontroleSave);
router.post("/postavke/kontrole/detalji", postavke.kontroleDetalji);
router.post("/postavke/paneli/save", postavke.paneliSave);
router.get("/postavke/paneli/list", postavke.paneliList);
router.post("/postavke/paneli/delete", postavke.panelDelete);
router.post(
  "/postavke/sajtovi/save",
  upload.single("file"),
  postavke.sajtoviSave
);
router.get("/postavke/sajtovi/list", postavke.sajtoviList);
router.get("/postavke/user/sajtovi/list", postavke.userSajtoviList);
router.post("/postavke/sajtovi/delete", postavke.sajtoviDelete);
router.post("/postavke/sajtovi/update", postavke.sajtoviEdit);
router.post("/postavke/sajtovi/:id", postavke.getSajt);
router.post("/postavke/mjesta/delete", postavke.mjestaDelete);
router.post("/postavke/mjesto/save", postavke.mjestoSave);

// 29.05.2019
// client/src/components/anaassays

router.post("/postavke/aptest/reference/save", postavke.SaveReference);
router.post("/postavke/aptest/analit/referentne/multi", postavke.AddRefMulti);


// Protokol

router.get("/postavke/protokol/get", postavke.GetProtokol);
router.post("/postavke/protokol/set", postavke.SetProtokol);
module.exports = router;
