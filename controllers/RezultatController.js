var mongoose = require("mongoose");
var fs = require("fs");
var Results = require("../models/Postavke");
var Results = mongoose.model("Results");
var Audit = require("../models/Audit");
var Audit_Rezultati = mongoose.model("Audit_Rezultati");
var calculated = require("../funkcije/calculated/calculated");

const config = require("../config/index");

var rezultatController = {};

// RezultatConroller.js

rezultatController.list = function(req, res) {
  var danasnjiDatum = new Date();
  danasnjiDatum.setDate(danasnjiDatum.getDate());
  var trenutniMjesec = danasnjiDatum.getMonth() + 1;
  var trenutniDan = danasnjiDatum.getUTCDate();
  if (trenutniDan < 10) {
    trenutniDan = "0" + trenutniDan;
  }
  if (trenutniMjesec < 10) {
    trenutniMjesec = "0" + trenutniMjesec;
  }
  var danasnjiDatum =
    danasnjiDatum.getFullYear() + "-" + trenutniMjesec + "-" + trenutniDan;
  var from = new Date();
  var to = new Date();
  switch (req.query.datum) {
    case "Svi Rezultati":
      var doo = new Date();
      var od = new Date();
      od.setFullYear(od.getFullYear() - 1);
      to = doo;
      from = od;
      break;
    default:
      to = danasnjiDatum + "T23:59:59";
      to = new Date(to + "Z");
      from = danasnjiDatum + "T00:00:00";
      from = new Date(from + "Z");
      break;
  }

  var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
  var order = req.query.sort
    .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
    .trim();
  var uslov = {};
  uslov = {
    created_at: {
      $gt: from,
      $lt: to
    },
    site: mongoose.Types.ObjectId(req.query.site)
  };
  if (!req.query.filter) {
    req.query.filter = "";
  }
  Results.find(uslov)
    .populate("sample patient rezultati.labassay")
    .exec(function(err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        var selectedresults = [];
        var sectionExist = false;
        rezultati.forEach(rezultat => {
          sectionExist = false;
          rezultat.rezultati.forEach(test => {
            if (test.labassay.sekcija === req.params.section) {
              sectionExist = true;
            }
          });
          if (sectionExist) {
            selectedresults.push(rezultat);
          }
        });
        rezultati = selectedresults;

        switch (parametar) {
          case "ime":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.patient.ime
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "prezime":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.patient.prezime
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "id":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.id
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          default:
            rezultati = rezultati.filter(function(rezultat) {
              return (
                rezultat.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase()) ||
                rezultat.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase())
              );
            });
            break;
        }

        var json = {};
        var novirez = [];
        var control = false;

        rezultati.forEach(element => {
          control = false;
          element.rezultati.forEach(rez => {
            if (rez.rezultat.length > 0) {
              control = true;
            }
          });
          if (element.controlmulti) {
            novirez.push(element);
          }

          if (control && novirez.indexOf(element) === -1) {
            novirez.push(element);
          }
        });

        rezultati = novirez;

        json.data = [];

        switch (parametar) {
          case "ime":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.patient.ime == b.patient.ime
                  ? 0
                  : +(a.patient.ime > b.patient.ime) || -1;
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return a.patient.ime == b.patient.ime
                  ? 0
                  : +(a.patient.ime < b.patient.ime) || -1;
              });
            }
            break;
          case "prezime":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.patient.prezime == b.patient.prezime
                  ? 0
                  : +(a.patient.prezime > b.patient.prezime) || -1;
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return a.patient.prezime == b.patient.prezime
                  ? 0
                  : +(a.patient.prezime < b.patient.prezime) || -1;
              });
            }
            break;
          case "id":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.id.localeCompare(b.id, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return b.id.localeCompare(a.id, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            break;
          default:
            rezultati.sort(function(a, b) {
              return b.id.localeCompare(a.id, undefined, {
                numeric: true,
                sensitivity: "base"
              });
            });
            break;
        }
        var niz = rezultati;
        var init = false;

        niz.forEach(rezultat => {
          var uslov = 0;
          var uobradi = 0;
          var nijeodobren = 0;
          var odobren = 0;
          var rezod = false;

          init = false;
          rezultat.rezultati.forEach(element => {
            uslov++;
            if (element.status === "U OBRADI") {
              uobradi++;
            }
            if (element.status === "NIJE ODOBREN") {
              nijeodobren++;
            }
            if (element.status === "ODOBREN") {
              odobren++;
            }
            if (element.rezultat.length) {
              init = true;
            }
            if ((uslov = rezultat.rezultati.length)) {
              if (uobradi > 0) {
                rezultat.status = "U OBRADI";
                rezod = false;
              } else if (nijeodobren > 0) {
                rezultat.status = "NIJE ODOBREN";
                rezod = false;
              } else {
                rezultat.status = "ODOBREN";
                rezod = true;
              }
            }
          });
          if (rezultat.controlmulti && init === false) {
            init = true;
          }
          if (init) {
            var link = "";
            if (rezod) {
              link =
                "<button title='Kontrola za ispis' class='btn btn-info btn-micro'><span class='fa fa-file-text'></span> DA</button>";
            } else {
              link =
                "<button disabled title='Nije dostupno' class='btn btn-info btn-micro'><span class='disabled fa fa-file-text'></span> NE</button>";
            }

            var pregled =
              "<button  title='Detaljan pregled rezultata' class='btn btn-primary btn-micro'><span class='glyphicon glyphicon-search'></span> PREGLED</button>";
            var status = "<strong>" + rezultat.status + "</strong>";
            if (
              req.query.datum === "U OBRADI" &&
              rezultat.status === "U OBRADI"
            ) {
              json.data.push({
                rezultati: pregled,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
            if (
              req.query.datum === "NIJE ODOBREN" &&
              rezultat.status === "NIJE ODOBREN"
            ) {
              json.data.push({
                rezultati: pregled,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
            if (
              req.query.datum === "ODOBREN" &&
              rezultat.status === "ODOBREN"
            ) {
              json.data.push({
                rezultati: pregled,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
            if (req.query.datum === "Svi Rezultati") {
              json.data.push({
                rezultati: pregled,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
            if (req.query.datum === "DANAS") {
              json.data.push({
                rezultati: pregled,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
          }
        });
        json.total = json.data.length;
        json.per_page = req.query.per_page;
        json.current_page = req.query.page;
        json.last_page = Math.ceil(json.total / json.per_page);
        json.next_page_url =
          config.baseURL +
          "rezultati?sort=" +
          req.query.sort +
          "&page=" +
          (req.query.page + 1) +
          "&per_page=" +
          req.query.per_page;
        var prev_page = null;
        if (json.current_page - 1 !== 0) {
          prev_page = json.current_page - 1;
        }
        json.prev_page_url =
          config.baseURL +
          "rezultati?sort=" +
          req.query.sort +
          "&page=" +
          prev_page +
          "&per_page=" +
          req.query.per_page;
        json.from = (json.current_page - 1) * 10 + 1;
        json.to = (json.current_page - 1) * 10 + 10;
        json.data = json.data.slice(json.from - 1, json.to);
        res.json(json);
      }
    });
};

rezultatController.olist = function(req, res) {
  var danasnjiDatum = new Date();
  danasnjiDatum.setDate(danasnjiDatum.getDate());
  var trenutniMjesec = danasnjiDatum.getMonth() + 1;
  var trenutniDan = danasnjiDatum.getUTCDate();
  if (trenutniDan < 10) {
    trenutniDan = "0" + trenutniDan;
  }
  if (trenutniMjesec < 10) {
    trenutniMjesec = "0" + trenutniMjesec;
  }
  var danasnjiDatum =
    danasnjiDatum.getFullYear() + "-" + trenutniMjesec + "-" + trenutniDan;
  var from = new Date();
  var to = new Date();
  switch (req.query.datum) {
    case "Svi Rezultati":
      var doo = new Date();
      var od = new Date();
      od.setFullYear(od.getFullYear() - 1);
      to = doo;
      from = od;
      break;
    default:
      to = danasnjiDatum + "T23:59:59";
      to = new Date(to + "Z");
      from = danasnjiDatum + "T00:00:00";
      from = new Date(from + "Z");
      break;
  }

  var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
  var order = req.query.sort
    .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
    .trim();
  var uslov = {};
  uslov = {
    updated_at: {
      $gt: from,
      $lt: to
    },
    site: mongoose.Types.ObjectId(req.query.site)
  };
  if (!req.query.filter) {
    req.query.filter = "";
  }
  Results.find(uslov)
    .populate("sample patient rezultati.labassay")
    .exec(function(err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        var selectedresults = [];
        var sectionExist = false;
        rezultati.forEach(rezultat => {
          sectionExist = false;
          rezultat.rezultati.forEach(test => {
            if (test.labassay.sekcija === req.params.section) {
              sectionExist = true;
            }
          });
          if (sectionExist) {
            selectedresults.push(rezultat);
          }
        });
        rezultati = selectedresults;
        switch (parametar) {
          case "ime":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.patient.ime
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "prezime":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.patient.prezime
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "id":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.id
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          default:
            rezultati = rezultati.filter(function(rezultat) {
              return (
                rezultat.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase()) ||
                rezultat.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase())
              );
            });
            break;
        }
        var json = {};
        var novirez = [];
        var control = false;
        rezultati.forEach(element => {
          control = false;
          element.rezultati.forEach(rez => {
            if (rez.rezultat.length > 0) {
              control = true;
            }
          });
          if (element.controlmulti) {
            novirez.push(element);
          }
          if (control && novirez.indexOf(element) === -1) {
            novirez.push(element);
          }
        });

        rezultati = novirez;

        json.data = [];

        switch (parametar) {
          case "ime":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.patient.ime == b.patient.ime
                  ? 0
                  : +(a.patient.ime > b.patient.ime) || -1;
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return a.patient.ime == b.patient.ime
                  ? 0
                  : +(a.patient.ime < b.patient.ime) || -1;
              });
            }
            break;
          case "prezime":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.patient.prezime == b.patient.prezime
                  ? 0
                  : +(a.patient.prezime > b.patient.prezime) || -1;
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return a.patient.prezime == b.patient.prezime
                  ? 0
                  : +(a.patient.prezime < b.patient.prezime) || -1;
              });
            }
            break;
          case "id":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.id.localeCompare(b.id, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return b.id.localeCompare(a.id, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            break;
          default:
            rezultati.sort(function(a, b) {
              return b.id.localeCompare(a.id, undefined, {
                numeric: true,
                sensitivity: "base"
              });
            });
            break;
        }

        var niz = rezultati;
        var init = false;

        niz.forEach(rezultat => {
          var uslov = 0;
          var uobradi = 0;
          var nijeodobren = 0;
          var odobren = 0;
          var verod = false;

          init = false;
          rezultat.rezultati.forEach(element => {
            uslov++;

            if (element.status === "U OBRADI") {
              uobradi++;
            }
            if (element.status === "NIJE ODOBREN") {
              nijeodobren++;
            }
            if (element.status === "ODOBREN") {
              odobren++;
            }
            if (element.rezultat.length || rezultat.controlmulti) {
              init = true;
            }
            if ((uslov = rezultat.rezultati.length)) {
              if (uobradi > 0) {
                rezultat.status = "U OBRADI";
                verod = false;
              } else if (nijeodobren > 0) {
                rezultat.status = "NIJE ODOBREN";
                verod = false;
              } else {
                rezultat.status = "ODOBREN";
                verod = true;
              }
            }
          });

          if (init) {
            var link = "";
            if (verod) {
              link =
                "<button title='Kontrola za ispis' class='btn btn-info btn-micro'><span class='fa fa-file-text'></span> DA</button>";
            } else {
              link =
                "<button disabled title='Nije dostupno' class='btn btn-info btn-micro'><span class='disabled fa fa-file-text'></span> NE</button>";
            }
            var verifikacija =
              "<button  title='Verifikacija rezultata' class='btn btn-primary btn-micro'><span class='glyphicon glyphicon-search'></span> PREGLED</button>";
            var status = "<strong>" + rezultat.status + "</strong>";

            if (
              req.query.datum === "U OBRADI" &&
              rezultat.status === "U OBRADI"
            ) {
              json.data.push({
                verifikacija: verifikacija,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
            if (
              req.query.datum === "NIJE ODOBREN" &&
              rezultat.status === "NIJE ODOBREN"
            ) {
              json.data.push({
                verifikacija: verifikacija,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
            if (
              req.query.datum === "ODOBREN" &&
              rezultat.status === "ODOBREN"
            ) {
              json.data.push({
                verifikacija: verifikacija,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
            if (req.query.datum === "Svi Rezultati") {
              json.data.push({
                verifikacija: verifikacija,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
            if (req.query.datum === "DANAS") {
              json.data.push({
                verifikacija: verifikacija,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                nalaz: link,
                status: status
              });
            }
          }
        });
        json.total = json.data.length;
        json.per_page = req.query.per_page;
        json.current_page = req.query.page;
        json.last_page = Math.ceil(json.total / json.per_page);
        json.next_page_url =
          config.baseURL +
          "rezultati?sort=" +
          req.query.sort +
          "&page=" +
          (req.query.page + 1) +
          "&per_page=" +
          req.query.per_page;
        var prev_page = null;
        if (json.current_page - 1 !== 0) {
          prev_page = json.current_page - 1;
        }
        json.prev_page_url =
          config.baseURL +
          "rezultati?sort=" +
          req.query.sort +
          "&page=" +
          prev_page +
          "&per_page=" +
          req.query.per_page;
        json.from = (json.current_page - 1) * 10 + 1;
        json.to = (json.current_page - 1) * 10 + 10;
        json.data = json.data.slice(json.from - 1, json.to);
        res.json(json);
      }
    });
};

rezultatController.show = function(req, res) {
  var danasnjiDatum = new Date(req.query.date);
  danasnjiDatum.setDate(danasnjiDatum.getDate());
  var trenutniMjesec = danasnjiDatum.getMonth() + 1;
  var trenutniDan = danasnjiDatum.getUTCDate();
  if (trenutniDan < 10) {
    trenutniDan = "0" + trenutniDan;
  }
  if (trenutniMjesec < 10) {
    trenutniMjesec = "0" + trenutniMjesec;
  }
  var danasnjiDatum =
    danasnjiDatum.getFullYear() + "-" + trenutniMjesec + "-" + trenutniDan;
  var from = new Date();
  var to = new Date();

  to = danasnjiDatum + "T23:59:59";
  to = new Date(to + "Z");
  from = danasnjiDatum + "T00:00:00";
  from = new Date(from + "Z");

  var uslov = {};
  uslov = {
    created_at: {
      $gt: from,
      $lt: to
    },
    site: mongoose.Types.ObjectId(req.query.site),
    patient: mongoose.Types.ObjectId(req.params.patient)
  };

  Results.find(uslov)
    .populate("patient sample rezultati.labassay rezultati.rezultat.anaassay")
    .lean()
    .exec(function(err, results) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (results.length) {
          results = results.filter(function(rezultat) {
            return rezultat.sample.pid === req.params.id;
          });
          res.json({
            success: true,
            message: "Rezultat nije pronadjen",
            results: results
          });
        } else {
          res.json({
            success: false,
            message: "Rezultat nije pronadjen"
          });
        }
        // res.render("../views/rezultati/show", {rezultat: rezultat})
      }
    });
};
rezultatController.showSingle = function(req, res) {  
  Results.findOne({
    id: req.params.id
  })
    .populate("patient sample rezultati.labassay rezultati.rezultat.anaassay")
    .lean()
    .exec(function(err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          var json = {};

          json.ime = rezultat.patient.ime;
          json.verificiran = rezultat.verificiran;
          json.status = rezultat.status;
          json.prezime = rezultat.patient.prezime;
          json.spol = rezultat.patient.spol;
          json.email = rezultat.patient.email;
          json.jmbg = rezultat.patient.jmbg;
          json.id = rezultat.patient._id;
          json.multi = rezultat.multi;
          json.pid = rezultat.sample.pid;
          json.data = [];
          json.multidata = [];
          var eseji = [];
          if (rezultat.multi.length) {
            k = 0;
            rezultat.multi.forEach(instance => {
              LabAssays.findOne({
                "multiparam._id": instance[0].labassay
              })
                .lean()
                .exec(function(err, param) {
                  if (err) {
                    console.log("Greška:", err);
                  } else {
                    if (param) {
                      LabAssays.findOne({
                        _id: param._id
                      })
                        .lean()
                        .exec(function(err, labtest) {
                          if (err) {
                            console.log("Greška:", err);
                          } else {
                            k++;
                            if (param) {
                              json.multidata.push({
                                labassay: labtest,
                                rezultat: instance
                              });

                              if (k === rezultat.multi.length) {
                                json.nodata = [];
                                if (rezultat.rezultati.length) {
                                  rezultat.rezultati.forEach(element => {
                                    if (element.rezultat.length) {
                                      json.data.push({
                                        testovi: element
                                      });
                                    } else {
                                      json.nodata.push(element.labassay);
                                    }
                                    if (element.rezultat.length > 0) {
                                      if (
                                        element.rezultat[0].dilucija ===
                                          "MULTI" &&
                                        element.rezultat[0].module_sn ===
                                          "APARAT"
                                      ) {
                                        rezultat.multi.forEach(set => {
                                          set.forEach(res => {
                                            if (
                                              res.labtest.equals(
                                                mongoose.Types.ObjectId(
                                                  element.labassay._id
                                                )
                                              )
                                            ) {
                                              res.rezultat.forEach(result => {
                                                if (result.rezultat_f === "") {
                                                  if (
                                                    json.nodata.indexOf(
                                                      element.labassay
                                                    ) === -1
                                                  ) {
                                                    json.nodata.push(
                                                      element.labassay
                                                    );
                                                  }
                                                }
                                              });
                                            }
                                          });
                                        });
                                      }
                                    }
                                  });
                                }

                                res.json(json);
                              }
                            }
                          }
                        });
                    }
                  }
                });
            });
          } else {
            json.nodata = [];
            rezultat.rezultati.forEach(element => {
              if (element.rezultat.length) {
                json.data.push({
                  testovi: element
                });
              } else {
                json.nodata.push(element.labassay);
              }
            });
            res.json(json);
          }
        } else {
          res.json({
            success: false,
            message: "Rezultat nije pronadjen"
          });
        }
        // res.render("../views/rezultati/show", {rezultat: rezultat})
      }
    });
};
rezultatController.Append = function(req, res) {
  Results.findOne({
    id: req.body.id_u
  })
    .populate("patient rezultati.labassay rezultati.rezultat.anaassay")
    .exec(function(err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        var noviRezultati = [];
        var test = {};
        var Audit_Rez = new Audit_Rezultati({
          id: rezultat.id,
          rezultati: rezultat.rezultati
        });
        Audit_Rez.save();
        if (rezultat) {
          rezultat.rezultati.forEach(result => {
            if (result._id.equals(mongoose.Types.ObjectId(req.body.id_t))) {
              result.rezultat.forEach(element => {
                if (
                  element._id.equals(mongoose.Types.ObjectId(req.params.id))
                ) {
                  test = element;
                  test.updated_by = req.body.decoded.user;
                  test.updated_at = Date.now();
                  ima = true;
                } else {
                  noviRezultati.push(element);
                }
              });
              noviRezultati.push(test);
              result.rezultat = noviRezultati;
              rezultat.save(function(err, rez) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  res.json({
                    success: true,
                    message: "Rezultati poredani",
                    rez
                  });
                }
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Rezultat nije pronadjen"
          });
        }
      }
    });
};

rezultatController.edit = function(req, res) {
  Results.findOne({
    "rezultati.rezultat._id": req.params.id
  }).exec(function(err, rezultat) {
    if (err) {
      console.log("Greška:", err);
    } else {
      var labassay = {};
      var audit = {};
      audit.id = rezultat.id;
      audit.rezultati = rezultat.rezultati;
      var Audit_Rez = new Audit_Rezultati(audit);
      Audit_Rez.save();
      rezultat.rezultati.forEach(test => {
        test.rezultat.forEach(element => {
          if (element._id.equals(mongoose.Types.ObjectId(req.params.id))) {
            element.rezultat_f = req.body.rezultat;
            element.updated_by = req.body.decoded.user;
            element.updated_at = Date.now();
            labassay = test.labassay;
            test.status = "NIJE ODOBREN";
          }
        });
      });
      Samples.findOne({
        id: rezultat.id
      })
        .populate("tests.labassay")
        .exec(function(err, sample) {
          if (err) {
            console.log("Greška:", err);
          } else {
            sample.tests.forEach(element => {
              if (element.labassay.equals(labassay)) {
                element.status_t = "REALIZOVAN";
              }
            });
            sample.save();
          }
        });
      rezultat.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Rezultat promijenjen"
          });
        }
      });
    }
  });
};

rezultatController.editIspis = function(req, res) {
  Results.findOne({
    "rezultati.rezultat._id": req.params.id
  }).exec(function(err, rezultat) {
    if (err) {
      console.log("Greška:", err);
    } else {
      rezultat.rezultati.forEach(test => {
        test.rezultat.forEach(element => {
          if (element._id.equals(mongoose.Types.ObjectId(req.params.id))) {
            element.rezultat_i = req.body.rezultat;
          }
        });
      });
      rezultat.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Flag za printanje na nalazu je promijenjen"
          });
        }
      });
    }
  });
};

rezultatController.update = function(req, res) {
  var rezu_id = mongoose.Types.ObjectId(req.params.rezid);
  Rezultat.findOne({
    uzorak_id: req.params.sid
  }).exec(function(err, uzorak) {
    if (err) {
      console.log("Greška:", err);
    } else {
      uzorak.rezultat.forEach(function(rez) {
        if (rez._id.equals(rezu_id)) {
          rez.odobren = true;
          uzorak.save();
          res.send("Rezultat odobren");
        }
      });
    }
  });
};

rezultatController.sekcijaShow = function(req, res) {
  Results.findOne({
    id: req.params.id
  })
    .populate("sample")
    .exec(function(err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          res.json({
            success: true,
            message: "Rezulatat pronadjen",
            sekcija: rezultat.sample.sekcija
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronadjen rezultat"
          });
        }
      }
    });
};

rezultatController.editAnalit = function(req, res) {
  Results.findOne({
    id: req.body.sid
  })
    .populate("sample")
    .exec(function(err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          var audit = {};
          audit.id = rezultat.id;
          audit.rezultati = rezultat.rezultati;
          audit.multi = rezultat.multi;
          var Audit_Rez = new Audit_Rezultati(audit);
          Audit_Rez.save();
          rezultat.multi.forEach(instance => {
            instance.forEach(multirez => {
              if (
                multirez.labtest.equals(
                  mongoose.Types.ObjectId(req.body.labassay)
                ) &&
                multirez.labassay.equals(
                  mongoose.Types.ObjectId(req.body.analit)
                )
              ) {
                multirez.rezultat[0].rezultat_f = req.body.rezultat;
                multirez.rezultat[0].updated_at = Date.now();
                multirez.rezultat[0].updated_by = req.body.decoded.user;
                var novi = new Results(rezultat);
                novi.save();
              }
            });
          });
          res.json({
            success: true,
            message: "Rezulatat pronadjen",
            sekcija: rezultat.sample.sekcija
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronadjen rezultat"
          });
        }
      }
    });
};

rezultatController.izborMulti = function(req, res) {
  Results.findOne({
    id: req.params.id
  })
    .populate("sample")
    .exec(function(err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          var temp = "";
          var k = 1;
          var mlength = 0;

          rezultat.multi.forEach(instance => {
            k = 0;
            instance.forEach(multirez => {
              k++;
              if (
                multirez.labtest.equals(mongoose.Types.ObjectId(req.body.test))
              ) {
                for (i = 0; i < multirez.rezultat.length; i++) {
                  if (i === parseInt(req.body.izbor)) {
                    temp = multirez.rezultat[0].rezultat_f;
                    tempvp = multirez.rezultat[0].vrijeme_prijenosa;
                    tempvr = multirez.rezultat[0].vrijeme_rezultata;
                    multirez.rezultat[0].rezultat_f =
                      multirez.rezultat[i].rezultat_f;
                    multirez.rezultat[0].vrijeme_prijenosa =
                      multirez.rezultat[i].vrijeme_prijenosa;
                    multirez.rezultat[0].vrijeme_rezultata =
                      multirez.rezultat[i].vrijeme_rezultata;
                    multirez.rezultat[i].rezultat_f = temp;
                    multirez.rezultat[i].vrijeme_prijenosa = tempvp;
                    multirez.rezultat[i].vrijeme_rezultata = tempvr;
                  }
                }
              }
              mlength = instance.length;
            });

            if (k === mlength) {
              var novi = new Results(rezultat);
              novi.save();
            }
          });
          res.json({
            success: true,
            message: "Rezulatat pronadjen",
            sekcija: rezultat.sample.sekcija
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronadjen rezultat"
          });
        }
      }
    });
};

rezultatController.listSve = function(req, res) {
  var danasnjiDatum = new Date();
  danasnjiDatum.setDate(danasnjiDatum.getDate());
  var trenutniMjesec = danasnjiDatum.getMonth() + 1;
  var trenutniDan = danasnjiDatum.getUTCDate();
  if (trenutniDan < 10) {
    trenutniDan = "0" + trenutniDan;
  }
  if (trenutniMjesec < 10) {
    trenutniMjesec = "0" + trenutniMjesec;
  }
  var danasnjiDatum =
    danasnjiDatum.getFullYear() + "-" + trenutniMjesec + "-" + trenutniDan;
  var from = new Date();
  var to = new Date();
  switch (req.query.datum) {
    case "Svi Rezultati":
      var doo = new Date();
      var od = new Date();
      od.setFullYear(od.getFullYear() - 1);
      to = doo;
      from = od;
      break;
    default:
      to = danasnjiDatum + "T23:59:59";
      to = new Date(to + "Z");
      from = danasnjiDatum + "T00:00:00";
      from = new Date(from + "Z");
      break;
  }

  var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
  var order = req.query.sort
    .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
    .trim();
  var uslov = {};
  uslov = {
    created_at: {
      $gt: from,
      $lt: to
    },
    site: mongoose.Types.ObjectId(req.query.site)
  };
  if (!req.query.filter) {
    req.query.filter = "";
  }
  Results.find(uslov)
    .populate("sample patient rezultati.labassay")
    .exec(function(err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        switch (parametar) {
          case "ime":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.patient.ime
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "prezime":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.patient.prezime
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "id":
            rezultati = rezultati.filter(function(rezultat) {
              return rezultat.id
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          default:
            rezultati = rezultati.filter(function(rezultat) {
              return (
                rezultat.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase()) ||
                rezultat.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase())
              );
            });
            break;
        }

        var json = {};
        var novirez = [];
        var control = false;

        rezultati.forEach(element => {
          control = false;
          element.rezultati.forEach(rez => {
            if (rez.rezultat.length > 0) {
              control = true;
            }
          });
          if (element.controlmulti) {
            novirez.push(element);
          }

          if (control && novirez.indexOf(element) === -1) {
            novirez.push(element);
          }
        });

        rezultati = novirez;

        json.data = [];

        switch (parametar) {
          case "ime":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.patient.ime == b.patient.ime
                  ? 0
                  : +(a.patient.ime > b.patient.ime) || -1;
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return a.patient.ime == b.patient.ime
                  ? 0
                  : +(a.patient.ime < b.patient.ime) || -1;
              });
            }
            break;
          case "prezime":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.patient.prezime == b.patient.prezime
                  ? 0
                  : +(a.patient.prezime > b.patient.prezime) || -1;
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return a.patient.prezime == b.patient.prezime
                  ? 0
                  : +(a.patient.prezime < b.patient.prezime) || -1;
              });
            }
            break;
          case "id":
            if (order === "asc") {
              rezultati.sort(function(a, b) {
                return a.id.localeCompare(b.id, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            if (order === "desc") {
              rezultati.sort(function(a, b) {
                return b.id.localeCompare(a.id, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
            }
            break;
          default:
            rezultati.sort(function(a, b) {
              return b.id.localeCompare(a.id, undefined, {
                numeric: true,
                sensitivity: "base"
              });
            });
            break;
        }
        var niz = rezultati;
        var init = false;

        niz.forEach(rezultat => {
          var uslov = 0;
          var uobradi = 0;
          var nijeodobren = 0;
          var odobren = 0;
          var rezod = false;

          init = false;
          rezultat.rezultati.forEach(element => {
            uslov++;
            if (element.status === "U OBRADI") {
              uobradi++;
            }
            if (element.status === "NIJE ODOBREN") {
              nijeodobren++;
            }
            if (element.status === "ODOBREN") {
              odobren++;
            }
            if (element.rezultat.length) {
              init = true;
            }
            if ((uslov = rezultat.rezultati.length)) {
              if (uobradi > 0) {
                rezultat.status = "U OBRADI";
                rezod = false;
              } else if (nijeodobren > 0) {
                rezultat.status = "NIJE ODOBREN";
                rezod = false;
              } else {
                rezultat.status = "ODOBREN";
                rezod = true;
              }
            }
          });
          if (rezultat.controlmulti && init === false) {
            init = true;
          }
          if (init) {
            var link = "";
            if (rezod) {
              link =
                "<button title='Kontrola za ispis' class='btn btn-info btn-micro'><span class='fa fa-file-text'></span> DA</button>";
            } else {
              link =
                "<button disabled title='Nije dostupno' class='btn btn-info btn-micro'><span class='disabled fa fa-file-text'></span> NE</button>";
            }

            var pregled =
              "<button  title='Detaljan pregled rezultata' class='btn btn-primary btn-micro'><span class='glyphicon glyphicon-search'></span> PREGLED</button>";
            var status = "<strong>" + rezultat.status + "</strong>";
            if (parseInt(rezultat.sample.pid) % 2 == 0) {
              var badge = '<span class="circle badge-warning"></span>';
            }
            if (Math.abs(parseInt(rezultat.sample.pid) % 2) == 1) {
              var badge = '<span class="circle badge-info"></span>';
            }
            if (
              req.query.datum === "U OBRADI" &&
              rezultat.status === "U OBRADI"
            ) {
              json.data.push({
                badge: badge,
                pacijent: rezultat.sample.pid,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                rezultati: pregled,
                status: status
              });
            }
            if (
              req.query.datum === "NIJE ODOBREN" &&
              rezultat.status === "NIJE ODOBREN"
            ) {
              json.data.push({
                badge: badge,
                pacijent: rezultat.sample.pid,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                rezultati: pregled,
                status: status
              });
            }
            if (
              req.query.datum === "ODOBREN" &&
              rezultat.status === "ODOBREN"
            ) {
              json.data.push({
                badge: badge,
                pacijent: rezultat.sample.pid,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                rezultati: pregled,
                status: status
              });
            }
            if (req.query.datum === "Svi Rezultati") {
              json.data.push({
                badge: badge,
                pacijent: rezultat.sample.pid,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                rezultati: pregled,
                status: status
              });
            }
            if (req.query.datum === "DANAS") {
              json.data.push({
                badge: badge,
                pacijent: rezultat.sample.pid,
                ime: rezultat.patient.ime,
                prezime: rezultat.patient.prezime,
                id: rezultat.id,
                rezultati: pregled,
                status: status
              });
            }
          }
        });
        json.total = json.data.length;
        json.per_page = req.query.per_page;
        json.current_page = req.query.page;
        json.last_page = Math.ceil(json.total / json.per_page);
        json.next_page_url =
          config.baseURL +
          "rezultati?sort=" +
          req.query.sort +
          "&page=" +
          (req.query.page + 1) +
          "&per_page=" +
          req.query.per_page;
        var prev_page = null;
        if (json.current_page - 1 !== 0) {
          prev_page = json.current_page - 1;
        }
        json.prev_page_url =
          config.baseURL +
          "rezultati?sort=" +
          req.query.sort +
          "&page=" +
          prev_page +
          "&per_page=" +
          req.query.per_page;
        json.from = (json.current_page - 1) * 10 + 1;
        json.to = (json.current_page - 1) * 10 + 10;
        json.data = json.data.slice(json.from - 1, json.to);
        res.json(json);
      }
    });
};

rezultatController.olistSve = function(req, res) {
  // console.log("Rezultati (Pretraga)");
  var danasnjiDatum = new Date();
  danasnjiDatum.setDate(danasnjiDatum.getDate());
  var trenutniMjesec = danasnjiDatum.getMonth() + 1;
  var trenutniDan = danasnjiDatum.getUTCDate();
  if (trenutniDan < 10) {
    trenutniDan = "0" + trenutniDan;
  }
  if (trenutniMjesec < 10) {
    trenutniMjesec = "0" + trenutniMjesec;
  }
  var danasnjiDatum =
    danasnjiDatum.getFullYear() + "-" + trenutniMjesec + "-" + trenutniDan;
  var from = new Date();
  var to = new Date();
  ////
  var datum = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .substring(0, 10);
  var to = new Date(datum + "T23:59:59Z");
  var from = new Date(datum + "T00:00:00Z");

  function startOfWeek(date) {
    var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

    return new Date(date.setDate(diff));
  }

  switch (req.query.datum) {
    case "AKTIVNI (14)": // Nezavršeni (zadnjih 14 dana, ne uključujući DANAS)
      datum = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 1))
      ).substring(1, 11);

      var datum14 = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 14))
      ).substring(1, 11);

      var to = new Date(datum + "T23:59:59");
      from = new Date(datum14 + "T00:00:00");

      break;

    case "NEDOVRŠENO": // Nezavršeni (zadnjih 14 dana, ne uključujući DANAS)
      datum = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 1))
      ).substring(1, 11);

      var datum14 = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 14))
      ).substring(1, 11);

      var to = new Date(datum + "T23:59:59");
      from = new Date(datum14 + "T00:00:00");

      break;

    case "Svi Rezultati":
      var datum14 = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 14))
      ).substring(1, 11);

      var to = new Date(datum + "T23:59:59");
      from = new Date(datum14 + "T00:00:00");

      break;
    case "Ova sedmica":
      var to = new Date(datum + "T23:59:59");
      var datum7 = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 7))
      ).substring(1, 11);

      from = new Date(datum7 + "T00:00:00");
      break;
    default:
      var to = new Date(datum + "T23:59:59");
      var from = new Date(datum + "T00:00:00");
      break;
  }
  // console.log("od:" + from);
  // console.log("do:" + to);

  var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
  var order = req.query.sort
    .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
    .trim();
  var uslov = {};
  uslov = {
    created_at: {
      $gt: from,
      $lt: to
    },
    site: mongoose.Types.ObjectId(req.query.site)
  };
  if (!req.query.filter) {
    req.query.filter = "";
  }
  Results.find(uslov)
    .populate("sample patient rezultati.labassay")
    .sort({
      created_at: -1
    })
    .exec(function(err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultati.length) {
          var newRezultati = [];
          var badge = '<span class="circle badge-info"></span>';

          rezultati.forEach(element => {
            if (
              !newRezultati.filter(
                rezultat =>
                  rezultat.id === element.sample.pid &&
                  JSON.stringify(rezultat.date).substring(1, 11) ===
                    JSON.stringify(element.created_at).substring(1, 11)
              ).length > 0
            ) {
              newRezultati.push({
                badge: badge,
                obrada:
                  "<button id='" +
                  element.patient._id +
                  "' title='Obrada rezultata' class='btn btn-primary btn-micro'><span class='glyphicon glyphicon-search'></span> PREGLED</button>",
                odobravanje:
                  "<button id='" +
                  element.patient._id +
                  "' title='Verifikacija rezultata' class='btn btn-primary btn-micro'><span class='glyphicon glyphicon-search'></span> PREGLED</button>",
                id: element.sample.pid,
                ime: element.patient.ime,
                prezime: element.patient.prezime,
                jmbg: element.patient.jmbg,
                barcodes: "", //"<button id='" + element.patient._id + "' title='Printanje barkodova' class='btn btn-info btn-micro'><span id='" + element.patient._id + "' class='fa fa-barcode'></span>"+element.sample.pid+"</button>",
                predracun: "",
                _id: element.patient._id,
                date: element.created_at,
                time: JSON.stringify(element.created_at).substring(12, 17),
                datum:
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(9, 11) +
                  "." +
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(6, 8) +
                  "." +
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(1, 5),
                remove: false
              });
            }
            // "<button title='Printanje barkoda' class='btn btn-info btn-micro'  id='" + config.barURL + "images/barcodes/" + uzorak.id + ".png'><span id='" + config.barURL + "images/barcodes/" + uzorak.id + ".png' class='fa fa-barcode'></span> Printaj</button>"
          });

          newRezultati.forEach(newrez => {
            var samples = "";
            var pac = "";
            var check = true;
            rezultati.forEach(rez => {
              if (
                newrez.id === rez.sample.pid &&
                newrez.datum ===
                  JSON.stringify(
                    JSON.stringify(rez.created_at).substring(1, 11)
                  ).slice(9, 11) +
                    "." +
                    JSON.stringify(
                      JSON.stringify(rez.created_at).substring(1, 11)
                    ).slice(6, 8) +
                    "." +
                    JSON.stringify(
                      JSON.stringify(rez.created_at).substring(1, 11)
                    ).slice(1, 5)
              ) {
                samples += rez.id + ",";
                pac = rez.patient._id;
                if (rez.status != "ODOBREN") {
                  check = false;
                }
                newrez.barcodes +=
                  "<button id='" +
                  rez.id +
                  "' title='" +
                  rez.id +
                  "' class='btn btn-info btn-micro'><span id='" +
                  rez.id +
                  "' class='fa fa-barcode'>&nbsp;</span>" +
                  rez.id[0] +
                  "</button>";
              }
            });
            samples = samples.replace(/(.+),$/, "$1");
            newrez.remove = check;
            newrez.predracun =
              "<button title='Ispis predračuna za pacijenta' id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='btn btn-primary btn-micro'><span id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='fa fa-euro'></span> RAČUN</button>";

            newrez.racun =
              "<button title='Ispis predračuna za pacijenta' id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='btn btn-primary btn-micro'><span id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='fa fa-euro'></span> RAČUN</button>";
          });
          if (req.query.datum === "RADNA LISTA") {
            rezultati = newRezultati.filter(function(rezultat) {
              return rezultat.remove === false;
            });
          } else if (
            req.query.datum === "AKTIVNI (14)" ||
            req.query.datum === "NEDOVRŠENO"
          ) {
            rezultati = newRezultati.filter(function(rezultat) {
              return rezultat.remove === false;
            });
          } else if (req.query.datum === "VERIFICIRAN") {
            rezultati = newRezultati.filter(function(rezultat) {
              return rezultat.remove === false;
            });
          } else {
            rezultati = newRezultati;
          }

          switch (parametar) {
            case "ime":
              rezultati = rezultati.filter(function(rezultat) {
                return rezultat.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              rezultati = rezultati.filter(function(rezultat) {
                return rezultat.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "id":
              rezultati = rezultati.filter(function(rezultat) {
                return rezultat.id.includes(req.query.filter);
              });
              break;
            default:
              rezultati = rezultati.filter(function(rezultat) {
                return (
                  rezultat.ime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) ||
                  rezultat.prezime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) ||
                  rezultat.id.includes(req.query.filter)
                );
              });
              break;
          }
          var json = {};

          json.data = [];

          switch (parametar) {
            case "ime":
              if (order === "asc") {
                rezultati.sort(function(a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime > b.ime) || -1;
                });
              }
              if (order === "desc") {
                rezultati.sort(function(a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime < b.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                rezultati.sort(function(a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime > b.prezime) || -1;
                });
              }
              if (order === "desc") {
                rezultati.sort(function(a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime < b.prezime) || -1;
                });
              }
              break;
            case "id":
              if (order === "asc") {
                rezultati.sort(function(a, b) {
                  return a.id.localeCompare(b.id, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }
              if (order === "desc") {
                rezultati.sort(function(a, b) {
                  return b.id.localeCompare(a.id, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
              }

              break;
            default:
              rezultati.sort(function(a, b) {
                return b.id.localeCompare(a.id, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              break;
          }

          json.data = rezultati;

          json.total = json.data.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "rezultati?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "rezultati?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = json.data.slice(json.from - 1, json.to);
          res.json(json);
        } else {
          res.json({
            success: false,
            message: "Nema pronadjenih rezultata"
          });
        }
      }
    });
};

module.exports = rezultatController;
