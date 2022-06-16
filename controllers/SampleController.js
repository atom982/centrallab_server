const barcode = require("bwip-js");
const config = require("../config/index");
const net = require("net");
var Jimp = require("jimp");

var mongoose = require("mongoose");
var Lokacija = require("../models/Postavke");
var Audit_SampleDelete = require("../models/Audit");
var fs = require("fs");
var Lokacija = mongoose.model("Lokacija");
var Sekcija = mongoose.model("Sekcija");
var AnaAssays = mongoose.model("AnaAssays");
var Patients = mongoose.model("Patients");
var Samples = mongoose.model("Samples");
var Results = mongoose.model("Results");
var tipUzorka = mongoose.model("tipUzorka");
var Audit_SampleDelete = mongoose.model("Audit_SampleDelete");
var Audit_ResultDelete = mongoose.model("Audit_ResultDelete");
var Audit_Sample = mongoose.model("Audit_Sample");
var Audit_Result = mongoose.model("Audit_Result");
var sampleT = require("../funkcije/shared/sample_type");
var reference = require("../funkcije/shared/set_references");
var starost = require("../funkcije/shared/starostReferentne");
var komplet = [];
var multiresult = [];

var sampleController = {};

// SampleController.js

sampleController.LokacijeList = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Lokacija.find({
      site: mongoose.Types.ObjectId(req.query.site),
    }).exec(function (err, lokacije) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        res.json({
          success: true,
          message: "Sve lokacije",
          lokacije,
        });
      }
    });
  }
};

sampleController.CustomersList = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Customers.find({}).exec(function (err, customers) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        res.json({
          success: true,
          message: "Customers",
          customers,
        });
      }
    });
  }
};

sampleController.TestsBySection = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    LabAssays.find({}).exec(function (err, testovi) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (testovi.length) {
          var aparat = [];
          var calc = [];
          var manual = [];
          testovi.forEach((test) => {
            if (!test.manual && !test.calculated) {
              aparat.push(test);
            }
            if (test.calculated) {
              calc.push(test);
            }
            if (
              test.manual &&
              !test.naziv.includes("ROMA") &&
              !test.naziv.includes("Kl-Krea")
            ) {
              manual.push(test);
            }
          });
          aparat.sort(function (a, b) {
            return a.naziv.toLowerCase() == b.naziv.toLowerCase()
              ? 0
              : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
          });
          calc.sort(function (a, b) {
            return a.naziv.toLowerCase() == b.naziv.toLowerCase()
              ? 0
              : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
          });
          manual.sort(function (a, b) {
            return a.naziv.toLowerCase() == b.naziv.toLowerCase()
              ? 0
              : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
          });
          testovi = aparat.concat(calc).concat(manual);
          res.json({
            success: true,
            message: "Lista testova za " + req.body.sekcija + " sekciju",
            testovi,
          });
        } else {
          res.json({
            success: true,
            message:
              "Lista testova za " + req.body.sekcija + " sekciju je prazna",
            testovi,
          });
        }
      }
    });
  }
};

sampleController.ListByLAbAssayType = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    AnaAssays.find({
      site: mongoose.Types.ObjectId(req.body.site),
    })
      .populate("test")
      .exec(function (err, anaassays) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (anaassays.length) {
            var aparat = [];
            var calc = [];
            var manual = [];
            var testovi = [];

            anaassays.forEach((anaassay) => {
              if (anaassay.test.tip === req.body.tip) {
                // console.log(anaassay.test.naziv)
                if (!anaassay.test.manual && !anaassay.test.calculated) {
                  if (
                    !aparat.filter((test) => test._id === anaassay.test._id)
                      .length > 0
                  ) {
                    aparat.push(anaassay.test);
                  }
                }
                if (anaassay.test.calculated) {
                  if (
                    !calc.filter((test) => test._id === anaassay.test._id)
                      .length > 0
                  ) {
                    calc.push(anaassay.test);
                  }
                }
                if (anaassay.test.manual) {
                  if (
                    !manual.filter((test) => test._id === anaassay.test._id)
                      .length > 0
                  ) {
                    manual.push(anaassay.test);
                  }
                }
              }
            });
            aparat.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            calc.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            manual.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            testovi = aparat.concat(calc).concat(manual);
            res.json({
              success: true,
              message: "Lista testova za " + req.body.sekcija + " sekciju",
              testovi,
            });
          } else {
            res.json({
              success: true,
              message:
                "Lista testova za " + req.body.sekcija + " sekciju je prazna",
              testovi,
            });
          }
        }
      });
  }
};

sampleController.ListBySection = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    AnaAssays.find({
      site: mongoose.Types.ObjectId(req.body.site),
    })
      .populate("test")
      .exec(function (err, anaassays) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (anaassays.length) {
            var aparat = [];
            var calc = [];
            var manual = [];
            var testovi = [];

            anaassays.forEach((anaassay) => {
              anaassay.tipoviUzorka.forEach((tip) => {
                if (
                  tip === req.body.tip.toUpperCase() ||
                  tip === req.body.tip
                ) {
                  if (!anaassay.test.manual && !anaassay.test.calculated) {
                    if (
                      !aparat.filter((test) => test._id === anaassay.test._id)
                        .length > 0
                    ) {
                      aparat.push(anaassay.test);
                    }
                  }
                  if (anaassay.test.calculated) {
                    if (
                      !calc.filter((test) => test._id === anaassay.test._id)
                        .length > 0
                    ) {
                      calc.push(anaassay.test);
                    }
                  }
                  if (
                    anaassay.test.manual &&
                    !anaassay.test.naziv.includes("ROMA") &&
                    !anaassay.test.naziv.includes("Kl-Krea")
                  ) {
                    if (
                      !manual.filter((test) => test._id === anaassay.test._id)
                        .length > 0
                    ) {
                      manual.push(anaassay.test);
                    }
                  }
                }
              });
            });
            aparat.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            calc.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            manual.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            testovi = aparat.concat(calc).concat(manual);
            res.json({
              success: true,
              message: "Lista testova za " + req.body.sekcija + " sekciju",
              testovi,
            });
          } else {
            res.json({
              success: true,
              message:
                "Lista testova za " + req.body.sekcija + " sekciju je prazna",
              testovi,
            });
          }
        }
      });
  }
};

sampleController.ListBySectionP = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    AnaAssays.find({
      site: mongoose.Types.ObjectId(req.body.site),
    })
      .populate("test")
      .exec(function (err, anaassays) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (anaassays.length) {
            var aparat = [];
            var calc = [];
            var manual = [];
            var testovi = [];

            anaassays.forEach((anaassay) => {
              if (!anaassay.test.manual && !anaassay.test.calculated) {
                if (
                  !aparat.filter((test) => test._id === anaassay.test._id)
                    .length > 0
                ) {
                  aparat.push(anaassay.test);
                }
              }
              if (anaassay.test.calculated) {
                if (
                  !calc.filter((test) => test._id === anaassay.test._id)
                    .length > 0
                ) {
                  calc.push(anaassay.test);
                }
              }
              if (
                anaassay.test.manual &&
                !anaassay.test.naziv.includes("ROMA") &&
                !anaassay.test.naziv.includes("Kl-Krea")
              ) {
                if (
                  !manual.filter((test) => test._id === anaassay.test._id)
                    .length > 0
                ) {
                  manual.push(anaassay.test);
                }
              }
            });
            aparat.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            calc.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            manual.sort(function (a, b) {
              return a.naziv.toLowerCase() == b.naziv.toLowerCase()
                ? 0
                : +(a.naziv.toLowerCase() > b.naziv.toLowerCase()) || -1;
            });
            testovi = aparat.concat(calc).concat(manual);
            res.json({
              success: true,
              message: "Lista testova za " + req.body.sekcija + " sekciju",
              testovi,
            });
          } else {
            res.json({
              success: true,
              message:
                "Lista testova za " + req.body.sekcija + " sekciju je prazna",
              testovi,
            });
          }
        }
      });
  }
};

sampleController.SaveP = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    AnaAssays.find({
      site: mongoose.Types.ObjectId(req.body.site),
    })
      .populate("test")
      .exec(function (err, anaassays) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (anaassays.length) {
            var serum = [];
            var krv = [];
            var plazma = [];
            var ostalo = [];
            var urin = [];
            var feces = [];
            var likvor = [];
            var ascites = [];
            var dren = [];
            var znoj = [];
            var arterijska_krv = [];
            var venska_krv = [];
            var kapilarna_krv = [];
            var izljev_pleuralni = [];
            var punktat = [];
            var urin24 = [];
            anaassays.forEach((anaassay) => {
              req.body.testovi.forEach((test) => {
                if (
                  mongoose.Types.ObjectId(test.labassay).equals(
                    anaassay.test._id
                  )
                ) {
                  switch (anaassay.tipoviUzorka[0]) {
                    case "Serum":
                      serum.push(test);
                      break;
                    case "Krv":
                      krv.push(test);
                      break;
                    case "Plazma":
                      plazma.push(test);
                      break;
                    case "Urin":
                      urin.push(test);
                      break;
                    case "Feces":
                      feces.push(test);
                      break;
                    case "Ostalo":
                      ostalo.push(test);
                      break;
                    case "Likvor":
                      likvor.push(test);
                      break;
                    case "Ascites":
                      ascites.push(test);
                      break;
                    case "Dren":
                      dren.push(test);
                      break;
                    case "Znoj":
                      znoj.push(test);
                      break;
                    case "arterijska krv":
                      arterijska_krv.push(test);
                      break;
                    case "venska krv":
                      venska_krv.push(test);
                      break;
                    case "kapilarna krv":
                      kapilarna_krv.push(test);
                      break;
                    case "izljev pleuralni":
                      izljev_pleuralni.push(test);
                      break;
                    case "punktat":
                      punktat.push(test);
                      break;
                    case "urin 24":
                      urin24.push(test);
                      break;
                  }
                }
              });
            });
            var uzorci = [];
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
              danasnjiDatum.getFullYear() +
              "-" +
              trenutniMjesec +
              "-" +
              trenutniDan;
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
                $lt: to,
              },
              site: mongoose.Types.ObjectId(req.body.site),
            };
            Samples.find(uslov)
              .populate("patient")
              .sort({
                created_at: -1,
              })
              .limit(1)
              .exec(function (err, uzorak) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  if (uzorak.length) {
                    var tmp = parseFloat(uzorak[0].pid, 10);
                    if (isNaN(tmp)) {
                      tmp = 0;
                    }
                    var pid = String(tmp + 1);

                    if (serum.length) {
                      uzorci.push({
                        niz: serum,
                        tip: "Serum",
                        pid: pid,
                      });
                    }
                    if (krv.length) {
                      uzorci.push({
                        niz: krv,
                        tip: "Krv",
                        pid: pid,
                      });
                    }
                    if (plazma.length) {
                      uzorci.push({
                        niz: plazma,
                        tip: "Plazma",
                        pid: pid,
                      });
                    }
                    if (urin.length) {
                      uzorci.push({
                        niz: urin,
                        tip: "Urin",
                        pid: pid,
                      });
                    }
                    if (feces.length) {
                      uzorci.push({
                        niz: feces,
                        tip: "Feces",
                        pid: pid,
                      });
                    }
                    if (ostalo.length) {
                      uzorci.push({
                        niz: ostalo,
                        tip: "Ostalo",
                        pid: pid,
                      });
                    }
                    if (likvor.length) {
                      uzorci.push({
                        niz: likvor,
                        tip: "Likvor",
                        pid: pid,
                      });
                    }
                    if (ascites.length) {
                      uzorci.push({
                        niz: ascites,
                        tip: "Ascites",
                        pid: pid,
                      });
                    }
                    if (dren.length) {
                      uzorci.push({
                        niz: dren,
                        tip: "Dren",
                        pid: pid,
                      });
                    }
                    if (znoj.length) {
                      uzorci.push({
                        niz: znoj,
                        tip: "Znoj",
                        pid: pid,
                      });
                    }
                    if (arterijska_krv.length) {
                      uzorci.push({
                        niz: arterijska_krv,
                        tip: "arterijska krv",
                        pid: pid,
                      });
                    }
                    if (venska_krv.length) {
                      uzorci.push({
                        niz: venska_krv,
                        tip: "venska krv",
                        pid: pid,
                      });
                    }
                    if (kapilarna_krv.length) {
                      uzorci.push({
                        niz: kapilarna_krv,
                        tip: "kapilarna krv",
                        pid: pid,
                      });
                    }
                    if (izljev_pleuralni.length) {
                      uzorci.push({
                        niz: izljev_pleuralni,
                        tip: "izljev pleuralni",
                        pid: pid,
                      });
                    }
                    if (punktat.length) {
                      uzorci.push({
                        niz: punktat,
                        tip: "punktat",
                        pid: pid,
                      });
                    }
                    if (urin24.length) {
                      uzorci.push({
                        niz: urin24,
                        tip: "urin 24",
                        pid: pid,
                      });
                    }

                    res.json({
                      success: true,
                      message: "Lista testova za uzoraka",
                      data: uzorci,
                    });
                  } else {
                    if (serum.length) {
                      uzorci.push({
                        niz: serum,
                        tip: "Serum",
                        pid: "1",
                      });
                    }
                    if (krv.length) {
                      uzorci.push({
                        niz: krv,
                        tip: "Krv",
                        pid: "1",
                      });
                    }
                    if (plazma.length) {
                      uzorci.push({
                        niz: plazma,
                        tip: "Plazma",
                        pid: "1",
                      });
                    }
                    if (urin.length) {
                      uzorci.push({
                        niz: urin,
                        tip: "Urin",
                        pid: "1",
                      });
                    }
                    if (feces.length) {
                      uzorci.push({
                        niz: feces,
                        tip: "Feces",
                        pid: "1",
                      });
                    }
                    if (ostalo.length) {
                      uzorci.push({
                        niz: ostalo,
                        tip: "Ostalo",
                        pid: "1",
                      });
                    }
                    if (likvor.length) {
                      uzorci.push({
                        niz: likvor,
                        tip: "Likvor",
                        pid: "1",
                      });
                    }
                    if (ascites.length) {
                      uzorci.push({
                        niz: ascites,
                        tip: "Ascites",
                        pid: "1",
                      });
                    }
                    if (dren.length) {
                      uzorci.push({
                        niz: dren,
                        tip: "Dren",
                        pid: "1",
                      });
                    }
                    if (znoj.length) {
                      uzorci.push({
                        niz: znoj,
                        tip: "Znoj",
                        pid: "1",
                      });
                    }
                    if (arterijska_krv.length) {
                      uzorci.push({
                        niz: arterijska_krv,
                        tip: "arterijska krv",
                        pid: "1",
                      });
                    }
                    if (venska_krv.length) {
                      uzorci.push({
                        niz: venska_krv,
                        tip: "venska krv",
                        pid: "1",
                      });
                    }
                    if (kapilarna_krv.length) {
                      uzorci.push({
                        niz: kapilarna_krv,
                        tip: "kapilarna krv",
                        pid: "1",
                      });
                    }
                    if (izljev_pleuralni.length) {
                      uzorci.push({
                        niz: izljev_pleuralni,
                        tip: "izljev pleuralni",
                        pid: "1",
                      });
                    }
                    if (punktat.length) {
                      uzorci.push({
                        niz: punktat,
                        tip: "punktat",
                        pid: "1",
                      });
                    }
                    if (urin24.length) {
                      uzorci.push({
                        niz: urin24,
                        tip: "urin 24",
                        pid: "1",
                      });
                    }

                    res.json({
                      success: true,
                      message: "Lista testova za uzoraka",
                      data: uzorci,
                    });
                  }
                }
              });
          } else {
            res.json({
              success: true,
              message: "Lista uzoraka je  je prazna",
            });
          }
        }
      });
  }
};

sampleController.Save = function (req, res) {
  var age = null;
  var current = null;
  var starost = null;
  var g = new Date();
  var niz = "";
  var ni = "";
  var set = {};
  current = g.getFullYear().toString();
  if (req.body.jmbg.substring(4, 7).charAt(0) === "9") {
    age = "1" + req.body.jmbg.substring(4, 7);
  } else {
    age = "2" + req.body.jmbg.substring(4, 7);
  }
  var jmbgObj = {};
  jmbgObj = req.body.jmbgObj;

  if (jmbgObj.years < 1 && jmbgObj.months < 1) {
    if (jmbgObj.days < 15) {
      starost = 0.02;
    } else {
      starost = 0.06;
    }
  } else if (jmbgObj.years < 1) {
    if (jmbgObj.months > 10 && jmbgObj.months < 12) {
      starost = 0.95;
    } else if (jmbgObj.months > 9 && jmbgObj.months < 11) {
      starost = 0.87;
    } else if (jmbgObj.months > 8 && jmbgObj.months < 10) {
      starost = 0.8;
    } else if (jmbgObj.months > 7 && jmbgObj.months < 9) {
      starost = 0.7;
    } else if (jmbgObj.months > 6 && jmbgObj.months < 8) {
      starost = 0.63;
    } else if (jmbgObj.months > 5 && jmbgObj.months < 7) {
      starost = 0.55;
    } else if (jmbgObj.months > 4 && jmbgObj.months < 6) {
      starost = 0.45;
    } else if (jmbgObj.months > 3 && jmbgObj.months < 5) {
      starost = 0.37;
    } else if (jmbgObj.months > 2 && jmbgObj.months < 4) {
      starost = 0.3;
    } else if (jmbgObj.months > 1 && jmbgObj.months < 3) {
      starost = 0.22;
    } else if (jmbgObj.months > 0 && jmbgObj.months < 2) {
      starost = 0.1;
    }
  } else {
    starost = parseFloat(current) - parseFloat(age);
  }

  var rezultat = {};
  rezultat.rezultati = [];
  rezultat.multi = [];
  var manual = false;
  req.body.testovi.forEach((test) => {
    if (test.manual) {
      manual = true;
    }
  });
  if (!manual) {
    req.body.status = "ZAPRIMLJEN";
  } else {
    req.body.status = "U OBRADI";
  }
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Patients.findOne({
      jmbg: req.body.jmbg,
      site: mongoose.Types.ObjectId(req.body.site),
    })
      .lean()
      .exec(function (err, patientFound) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (!patientFound) {
            var pacijent = new Patients(req.body);

            pacijent.save(function (err, patient) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err,
                });
              } else {
                rezultat.patient = patient;
                var tests = [];
                var grupa = null;
                var refd = null;
                var refg = null;
                var zadnji = 0;
                req.body.testovi.forEach((test) => {
                  AnaAssays.findOne({
                    test: mongoose.Types.ObjectId(test.labassay),
                    site: mongoose.Types.ObjectId(req.body.site),
                  })
                    .populate("test")
                    .exec(function (err, testm) {
                      if (err) {
                        console.log("Greška:", err);
                      } else {
                        if (testm) {
                          if (test.manual) {
                            rezultat.created_at = Date.now();

                            tests.push({
                              labassay: mongoose.Types.ObjectId(test.labassay),
                              status_t: "U OBRADI",
                            });
                            if (testm.test.multi) {
                              testm.test.multiparam.forEach((param) => {
                                set = {};
                                testm.reference.forEach((ref) => {
                                  if (
                                    param._id.equals(
                                      mongoose.Types.ObjectId(ref.analit)
                                    )
                                  ) {
                                    set = reference.anaget(
                                      testm.test.naziv,
                                      req.body.menopauza,
                                      ref.grupa,
                                      ref.spol,
                                      req.body.spol,
                                      ref.refd,
                                      ref.refg,
                                      ref.interp,
                                      ref.extend,
                                      "",
                                      "",
                                      req.body.trudnica,
                                      req.body.anticoag,
                                      req.body.menstc,
                                      starost,
                                      ref.dDob,
                                      ref.gDob,
                                      ""
                                    );
                                    if (set.hasOwnProperty("grupa")) {
                                      grupa = set.grupa;
                                      refd = set.refd;
                                      refg = set.refg;
                                      interp = set.interp;
                                      extend = set.extend;
                                    }
                                  }
                                });
                                multiresult = [];

                                multiresult.push({
                                  anaassay: mongoose.Types.ObjectId(param._id),
                                  sn: param.naziv,
                                  vrijeme_prijenosa: Date.now(),
                                  vrijeme_rezultata: Date.now(),
                                  dilucija: param.opis,
                                  module_sn: param.kod,
                                  reagens_lot: "n/a",
                                  reagens_sn: "n/a",
                                  rezultat_f: "",
                                  rezultat_m: [],
                                  jedinice_f: param.jedinica,
                                  rezultat_p: "",
                                  jedinice_p: "",
                                  rezultat_i: "",
                                  odobren: false,
                                  created_at: Date.now(),
                                  created_by: req.body.decoded.user,
                                });
                                komplet.push({
                                  labassay: mongoose.Types.ObjectId(param._id),
                                  labtest: mongoose.Types.ObjectId(
                                    test.labassay
                                  ),
                                  status: "ZAPRIMLJEN",
                                  retest: false,
                                  grupa: grupa,
                                  interp: interp,
                                  extend: extend,
                                  refd: refd,
                                  refg: refg,
                                  rezultat: multiresult,
                                });
                              });
                              rezultat.multi.push(komplet);
                              rezultat.rezultati.push({
                                labassay: mongoose.Types.ObjectId(
                                  test.labassay
                                ),
                                status: "U OBRADI",
                                grupa: grupa,
                                interp: "none",
                                extend: "",
                                refd: "0",
                                refg: "0",
                                rezultat: [
                                  {
                                    anaassay: testm._id,
                                    sn: "MANUAL",
                                    vrijeme_prijenosa: Date.now(),
                                    vrijeme_rezultata: Date.now(),
                                    dilucija: "MULTI",
                                    module_sn: "MANUAL",
                                    reagens_lot: "n/a",
                                    reagens_sn: "n/a",
                                    rezultat_f: "",
                                    rezultat_m: [],
                                    jedinice_f: testm.test.jedinica,
                                    rezultat_p: "",
                                    jedinice_p: "",
                                    rezultat_i: "",
                                    odobren: false,
                                    created_at: Date.now(),
                                    created_by: req.body.decoded.user,
                                  },
                                ],
                              });
                              rezultat.controlmulti = true;
                              komplet = [];
                            } else {
                              // Kraj ako je rucni test sa analitima, pocetak ako je klasicni rucni test
                              set = {};
                              testm.reference = testm.reference.sort(function (
                                a,
                                b
                              ) {
                                return a.dDob.localeCompare(b.dDob, undefined, {
                                  numeric: true,
                                  sensitivity: "base",
                                });
                              });
                              testm.reference.forEach((element) => {
                                set = reference.get(
                                  testm.test.naziv,
                                  req.body.menopauza,
                                  element.grupa,
                                  element.spol,
                                  req.body.spol,
                                  element.refd,
                                  element.refg,
                                  element.interp,
                                  element.extend,
                                  patient.dijabetes,
                                  patient.duhan,
                                  req.body.trudnica,
                                  req.body.anticoag,
                                  req.body.menstc,
                                  starost,
                                  element.dDob,
                                  element.gDob,
                                  ""
                                );
                                if (set.hasOwnProperty("grupa")) {
                                  grupa = set.grupa;
                                  refd = set.refd;
                                  refg = set.refg;
                                  interp = set.interp;
                                  extend = set.extend;
                                }
                              });

                              rezultat.rezultati.push({
                                labassay: mongoose.Types.ObjectId(
                                  test.labassay
                                ),
                                status: "U OBRADI",
                                grupa: grupa,
                                interp: interp,
                                extend: extend,
                                refd: refd,
                                refg: refg,
                                rezultat: [
                                  {
                                    anaassay: testm._id,
                                    sn: "MANUAL",
                                    vrijeme_prijenosa: Date.now(),
                                    vrijeme_rezultata: Date.now(),
                                    dilucija: "n/a",
                                    module_sn: "n/a",
                                    reagens_lot: "n/a",
                                    reagens_sn: "n/a",
                                    rezultat_f: "",
                                    rezultat_m: [],
                                    jedinice_f: testm.test.jedinica,
                                    rezultat_p: "",
                                    jedinice_p: "",
                                    rezultat_i: "",
                                    odobren: false,
                                    created_at: Date.now(),
                                    created_by: req.body.decoded.user,
                                  },
                                ],
                              });
                            }
                          } // End if test rucni
                          else {
                            // Ako je test aparatski
                            tests.push({
                              labassay: mongoose.Types.ObjectId(test.labassay),
                            });
                            if (testm.test.multi) {
                              testm.test.multiparam.forEach((param) => {
                                set = {};
                                testm.reference.forEach((ref) => {
                                  if (
                                    param._id.equals(
                                      mongoose.Types.ObjectId(ref.analit)
                                    )
                                  ) {
                                    set = reference.anaget(
                                      testm.test.naziv,
                                      req.body.menopauza,
                                      ref.grupa,
                                      ref.spol,
                                      req.body.spol,
                                      ref.refd,
                                      ref.refg,
                                      ref.interp,
                                      ref.extend,
                                      "",
                                      "",
                                      req.body.trudnica,
                                      req.body.anticoag,
                                      req.body.menstc,
                                      starost,
                                      ref.dDob,
                                      ref.gDob,
                                      ""
                                    );
                                    if (set.hasOwnProperty("grupa")) {
                                      grupa = set.grupa;
                                      refd = set.refd;
                                      refg = set.refg;
                                      interp = set.interp;
                                      extend = set.extend;
                                    }
                                  }
                                });
                                multiresult = [];
                                multiresult.push({
                                  anaassay: mongoose.Types.ObjectId(param._id),
                                  sn: param.naziv,
                                  vrijeme_prijenosa: Date.now(),
                                  vrijeme_rezultata: Date.now(),
                                  dilucija: param.opis,
                                  module_sn: param.kod,
                                  reagens_lot: "n/a",
                                  reagens_sn: "n/a",
                                  rezultat_f: "",
                                  rezultat_m: [],
                                  jedinice_f: param.jedinica,
                                  rezultat_p: "",
                                  jedinice_p: "",
                                  rezultat_i: "",
                                  odobren: false,
                                  created_at: Date.now(),
                                  created_by: req.body.decoded.user,
                                });
                                komplet.push({
                                  labassay: mongoose.Types.ObjectId(param._id),
                                  labtest: mongoose.Types.ObjectId(
                                    test.labassay
                                  ),
                                  status: "ZAPRIMLJEN",
                                  retest: false,
                                  grupa: grupa,
                                  interp: interp,
                                  extend: extend,
                                  refd: refd,
                                  refg: refg,
                                  rezultat: multiresult,
                                });
                              });
                              rezultat.multi.push(komplet);
                              rezultat.rezultati.push({
                                labassay: mongoose.Types.ObjectId(
                                  test.labassay
                                ),
                                status: "U OBRADI",
                                grupa: grupa,
                                interp: "none",
                                extend: "",
                                refd: "0",
                                refg: "0",
                                rezultat: [
                                  {
                                    anaassay: testm._id,
                                    sn: "36148BG",
                                    vrijeme_prijenosa: Date.now(),
                                    vrijeme_rezultata: Date.now(),
                                    dilucija: "MULTI",
                                    module_sn: "APARAT",
                                    reagens_lot: "n/a",
                                    reagens_sn: "n/a",
                                    rezultat_f: "",
                                    rezultat_m: [],
                                    jedinice_f: "",
                                    rezultat_p: "",
                                    jedinice_p: "",
                                    rezultat_i: "",
                                    odobren: false,
                                    created_at: Date.now(),
                                    created_by: req.body.decoded.user,
                                  },
                                ],
                              });
                              komplet = [];
                            } else {
                              set = {};
                              testm.reference = testm.reference.sort(function (
                                a,
                                b
                              ) {
                                return a.dDob.localeCompare(b.dDob, undefined, {
                                  numeric: true,
                                  sensitivity: "base",
                                });
                              });
                              testm.reference.forEach((element) => {
                                set = reference.get(
                                  testm.test.naziv,
                                  req.body.menopauza,
                                  element.grupa,
                                  element.spol,
                                  req.body.spol,
                                  element.refd,
                                  element.refg,
                                  element.interp,
                                  element.extend,
                                  patient.dijabetes,
                                  patient.duhan,
                                  req.body.trudnica,
                                  req.body.anticoag,
                                  req.body.menstc,
                                  starost,
                                  element.dDob,
                                  element.gDob,
                                  ""
                                );
                                if (set.hasOwnProperty("grupa")) {
                                  grupa = set.grupa;
                                  refd = set.refd;
                                  refg = set.refg;
                                  interp = set.interp;
                                  extend = set.extend;
                                }
                              });

                              rezultat.rezultati.push({
                                labassay: mongoose.Types.ObjectId(
                                  test.labassay
                                ),
                                grupa: grupa,
                                interp: interp,
                                extend: extend,
                                refd: refd,
                                refg: refg,
                                rezultat: [
                                  {
                                    anaassay: testm._id,
                                    sn: "AUTO",
                                    vrijeme_prijenosa: Date.now(),
                                    vrijeme_rezultata: Date.now(),
                                    dilucija: "",
                                    module_sn: "",
                                    reagens_lot: "",
                                    reagens_sn: "",
                                    rezultat_f: "",
                                    rezultat_m: [],
                                    jedinice_f: testm.test.jedinica,
                                    rezultat_p: "",
                                    jedinice_p: "",
                                    rezultat_i: "",
                                    odobren: false,
                                    created_at: Date.now(),
                                    created_by: req.body.decoded.user,
                                  },
                                ],
                              });
                            }
                          } // Kraj ako je test aparatski
                          // POPULIRANJE SAMPLA I REZULTATA ZA PATIENT NOT FOUND VARIJANTU
                          zadnji++;
                          if (zadnji === req.body.testovi.length) {
                            req.body.tests = tests;
                            req.body.patient = patient;
                            req.body.lokacija = mongoose.Types.ObjectId(
                              req.body.lokacija
                            );
                            niz = req.body.datum.split("/");
                            ni = req.body.vrijeme.split(":");
                            req.body.datum = new Date(
                              niz[2],
                              niz[1] - 1,
                              niz[0],
                              ni[0],
                              ni[1]
                            );

                            var d = new Date();
                            var mjesec = d.getMonth() + 1;
                            if (mjesec < 10) {
                              mjesec = "0" + mjesec;
                            }

                            var dan = d.getUTCDate();
                            if (dan < 10) {
                              dan = "0" + dan;
                            }

                            var god = d.getFullYear().toString();
                            var datum = god.substring(3, 4) + mjesec + dan;

                            Samples.find({
                              id: new RegExp(
                                sampleT.tip(req.body.type) +
                                  "[0-9]{3}" +
                                  req.body.siteSifra +
                                  datum
                              ),
                            })
                              .populate("patient")
                              .sort({
                                created_at: -1,
                              })
                              .limit(1)
                              .exec(function (err, uzorak) {
                                if (err) {
                                  console.log("Greška:", err);
                                } else {
                                  if (uzorak.length) {
                                    var temp = uzorak[0].id.slice(1, 4);
                                    var iduz = String(parseFloat(temp, 10) + 1);
                                    switch (iduz.length) {
                                      case 1:
                                        iduz = "00" + iduz;
                                        break;
                                      case 2:
                                        iduz = "0" + iduz;
                                        break;
                                      default:
                                        iduz = "" + iduz;
                                    }
                                    req.body.id =
                                      sampleT.tip(req.body.type) +
                                      iduz +
                                      req.body.siteSifra +
                                      datum;

                                    barcode.toBuffer(
                                      {
                                        bcid: "code128", // Barcode type
                                        text: req.body.id, // Text to encode
                                        scaleX: 2, // 3x scaling factor
                                        scaleY: 3, // 3x scaling factor
                                        height: 14, // Bar height, in millimeters
                                        includetext: true, // Show human-readable text
                                        textxalign: "center", // Always good to set this
                                        paddingheight: 10,
                                        paddingwidth: 10,
                                        backgroundcolor: "FFFFFF",
                                      },
                                      function (err, png) {
                                        if (err) {
                                        } else {
                                          var file =
                                            config.sample_path +
                                            req.body.id +
                                            ".png";

                                          fs.writeFile(
                                            file,
                                            png.toString("base64"),
                                            {
                                              encoding: "base64",
                                            },
                                            function (err) {
                                              if (err) {
                                                console.log(err);
                                              } else {
                                                req.body.created_by =
                                                  req.body.decoded.user;
                                                var sample = new Samples(
                                                  req.body
                                                );
                                                sample.save(function (
                                                  err,
                                                  sample
                                                ) {
                                                  if (err) {
                                                    res.json({
                                                      success: false,
                                                      message: err,
                                                    });
                                                  } else {
                                                    var data = {};
                                                    data.sid = sample.id;
                                                    data.ime =
                                                      req.body.ime +
                                                      " " +
                                                      req.body.prezime;
                                                    rezultat.sample = sample;
                                                    rezultat.id = sample.id;
                                                    rezultat.status =
                                                      "U OBRADI";
                                                    rezultat.created_by =
                                                      req.body.decoded.user;
                                                    rezultat.site =
                                                      req.body.site;
                                                    var result = new Results(
                                                      rezultat
                                                    );
                                                    result.save();
                                                    komplet = [];
                                                    data.link =
                                                      config.barURL +
                                                      "images/barcodes/" +
                                                      data.sid +
                                                      ".png";
                                                    data.specialTest =
                                                      req.body.specialTest;
                                                    res.json({
                                                      success: true,
                                                      message:
                                                        "Uzorak uspješno sačuvan",
                                                      data,
                                                    });
                                                  }
                                                });
                                              }
                                            }
                                          );
                                        }
                                      }
                                    );
                                  } else {
                                    req.body.id =
                                      sampleT.tip(req.body.type) +
                                      "001" +
                                      req.body.siteSifra +
                                      datum;

                                    barcode.toBuffer(
                                      {
                                        bcid: "code128", // Barcode type
                                        text: req.body.id, // Text to encode
                                        scaleX: 2, // 3x scaling factor
                                        scaleY: 3, // 3x scaling factor
                                        height: 14, // Bar height, in millimeters
                                        includetext: true, // Show human-readable text
                                        textxalign: "center", // Always good to set this
                                        paddingheight: 10,
                                        paddingwidth: 10,
                                        backgroundcolor: "FFFFFF",
                                      },
                                      function (err, png) {
                                        if (err) {
                                        } else {
                                          var file =
                                            config.sample_path +
                                            req.body.id +
                                            ".png";
                                          fs.writeFile(
                                            file,
                                            png.toString("base64"),
                                            {
                                              encoding: "base64",
                                            },
                                            function (err) {
                                              if (err) {
                                                console.log(err);
                                              } else {
                                                req.body.created_by =
                                                  req.body.decoded.user;
                                                var sample = new Samples(
                                                  req.body
                                                );
                                                sample.save(function (
                                                  err,
                                                  sample
                                                ) {
                                                  if (err) {
                                                    res.json({
                                                      success: false,
                                                      message: err,
                                                    });
                                                  } else {
                                                    var data = {};
                                                    data.sid = sample.id;
                                                    data.ime =
                                                      req.body.ime +
                                                      " " +
                                                      req.body.prezime;
                                                    rezultat.sample = sample;
                                                    rezultat.id = sample.id;
                                                    rezultat.status =
                                                      "U OBRADI";
                                                    rezultat.created_by =
                                                      req.body.decoded.user;
                                                    rezultat.site =
                                                      req.body.site;
                                                    var result = new Results(
                                                      rezultat
                                                    );
                                                    result.save();
                                                    komplet = [];
                                                    data.link =
                                                      config.barURL +
                                                      "images/barcodes/" +
                                                      data.sid +
                                                      ".png";
                                                    data.specialTest =
                                                      req.body.specialTest;
                                                    res.json({
                                                      success: true,
                                                      message:
                                                        "Uzorak uspješno sačuvan",
                                                      data,
                                                    });
                                                  }
                                                });
                                              }
                                            }
                                          );
                                        }
                                      }
                                    );
                                  }
                                }
                              });
                          }
                          // KRAJ KRAJ POPULIRANJE SAMPLA I REZULTATA ZA PATIENT FOUND VARIJANTU
                        } // End ako je test pronadjen
                      }
                    });
                });
              }
            });
          } else {
            rezultat.patient = patientFound;
            var tests = [];
            var grupa = null;
            var refd = null;
            var refg = null;
            var zadnji = 0;
            req.body.testovi.forEach((test) => {
              AnaAssays.findOne({
                test: mongoose.Types.ObjectId(test.labassay),
                site: mongoose.Types.ObjectId(req.body.site),
              })
                .populate("test")
                .exec(function (err, testm) {
                  if (err) {
                    console.log("Greška:", err);
                  } else {
                    if (testm) {
                      if (test.manual) {
                        rezultat.created_at = Date.now();
                        tests.push({
                          labassay: mongoose.Types.ObjectId(test.labassay),
                          status_t: "U OBRADI",
                        });
                        if (testm.test.multi) {
                          testm.test.multiparam.forEach((param) => {
                            set = {};
                            testm.reference.forEach((ref) => {
                              if (
                                param._id.equals(
                                  mongoose.Types.ObjectId(ref.analit)
                                )
                              ) {
                                set = reference.anaget(
                                  testm.test.naziv,
                                  req.body.menopauza,
                                  ref.grupa,
                                  ref.spol,
                                  req.body.spol,
                                  ref.refd,
                                  ref.refg,
                                  ref.interp,
                                  ref.extend,
                                  "",
                                  "",
                                  req.body.trudnica,
                                  req.body.anticoag,
                                  req.body.menstc,
                                  starost,
                                  ref.dDob,
                                  ref.gDob,
                                  ""
                                );
                                if (set.hasOwnProperty("grupa")) {
                                  grupa = set.grupa;
                                  refd = set.refd;
                                  refg = set.refg;
                                  interp = set.interp;
                                  extend = set.extend;
                                }
                              }
                            });
                            multiresult = [];

                            multiresult.push({
                              anaassay: mongoose.Types.ObjectId(param._id),
                              sn: param.naziv,
                              vrijeme_prijenosa: Date.now(),
                              vrijeme_rezultata: Date.now(),
                              dilucija: param.opis,
                              module_sn: param.kod,
                              reagens_lot: "n/a",
                              reagens_sn: "n/a",
                              rezultat_f: "",
                              rezultat_m: [],
                              jedinice_f: param.jedinica,
                              rezultat_p: "",
                              jedinice_p: "",
                              rezultat_i: "",
                              odobren: false,
                              created_at: Date.now(),
                              created_by: req.body.decoded.user,
                            });
                            komplet.push({
                              labassay: mongoose.Types.ObjectId(param._id),
                              labtest: mongoose.Types.ObjectId(test.labassay),
                              status: "ZAPRIMLJEN",
                              retest: false,
                              grupa: grupa,
                              interp: interp,
                              extend: extend,
                              refd: refd,
                              refg: refg,
                              rezultat: multiresult,
                            });
                          });
                          rezultat.multi.push(komplet);
                          rezultat.rezultati.push({
                            labassay: mongoose.Types.ObjectId(test.labassay),
                            status: "U OBRADI",
                            grupa: grupa,
                            interp: "none",
                            extend: "",
                            refd: "0",
                            refg: "0",
                            rezultat: [
                              {
                                anaassay: testm._id,
                                sn: "MANUAL",
                                vrijeme_prijenosa: Date.now(),
                                vrijeme_rezultata: Date.now(),
                                dilucija: "MULTI",
                                module_sn: "MANUAL",
                                reagens_lot: "n/a",
                                reagens_sn: "n/a",
                                rezultat_f: "",
                                rezultat_m: [],
                                jedinice_f: testm.test.jedinica,
                                rezultat_p: "",
                                jedinice_p: "",
                                rezultat_i: "",
                                odobren: false,
                                created_at: Date.now(),
                                created_by: req.body.decoded.user,
                              },
                            ],
                          });
                          rezultat.controlmulti = true;
                          komplet = [];
                        } else {
                          // Kraj ako je rucni test sa analitima, pocetak ako je klasicni rucni test
                          set = {};
                          testm.reference = testm.reference.sort(function (
                            a,
                            b
                          ) {
                            return a.dDob.localeCompare(b.dDob, undefined, {
                              numeric: true,
                              sensitivity: "base",
                            });
                          });
                          testm.reference.forEach((element) => {
                            set = reference.get(
                              testm.test.naziv,
                              req.body.menopauza,
                              element.grupa,
                              element.spol,
                              req.body.spol,
                              element.refd,
                              element.refg,
                              element.interp,
                              element.extend,
                              patientFound.dijabetes,
                              patientFound.duhan,
                              req.body.trudnica,
                              req.body.anticoag,
                              req.body.menstc,
                              starost,
                              element.dDob,
                              element.gDob,
                              ""
                            );
                            if (set.hasOwnProperty("grupa")) {
                              grupa = set.grupa;
                              refd = set.refd;
                              refg = set.refg;
                              interp = set.interp;
                              extend = set.extend;
                            }
                          });

                          rezultat.rezultati.push({
                            labassay: mongoose.Types.ObjectId(test.labassay),
                            status: "U OBRADI",
                            grupa: grupa,
                            interp: interp,
                            extend: extend,
                            refd: refd,
                            refg: refg,
                            rezultat: [
                              {
                                anaassay: testm._id,
                                sn: "MANUAL",
                                vrijeme_prijenosa: Date.now(),
                                vrijeme_rezultata: Date.now(),
                                dilucija: "n/a",
                                module_sn: "n/a",
                                reagens_lot: "n/a",
                                reagens_sn: "n/a",
                                rezultat_f: "",
                                rezultat_m: [],
                                jedinice_f: testm.test.jedinica,
                                rezultat_p: "",
                                jedinice_p: "",
                                rezultat_i: "",
                                odobren: false,
                                created_at: Date.now(),
                                created_by: req.body.decoded.user,
                              },
                            ],
                          });
                        }
                      } // End if test rucni
                      else {
                        // Ako je test aparatski
                        tests.push({
                          labassay: mongoose.Types.ObjectId(test.labassay),
                        });
                        if (testm.test.multi) {
                          testm.test.multiparam.forEach((param) => {
                            set = {};
                            testm.reference.forEach((ref) => {
                              if (
                                param._id.equals(
                                  mongoose.Types.ObjectId(ref.analit)
                                )
                              ) {
                                set = reference.anaget(
                                  testm.test.naziv,
                                  req.body.menopauza,
                                  ref.grupa,
                                  ref.spol,
                                  req.body.spol,
                                  ref.refd,
                                  ref.refg,
                                  ref.interp,
                                  ref.extend,
                                  "",
                                  "",
                                  req.body.trudnica,
                                  req.body.anticoag,
                                  req.body.menstc,
                                  starost,
                                  ref.dDob,
                                  ref.gDob,
                                  ""
                                );
                                if (set.hasOwnProperty("grupa")) {
                                  grupa = set.grupa;
                                  refd = set.refd;
                                  refg = set.refg;
                                  interp = set.interp;
                                  extend = set.extend;
                                }
                              }
                            });
                            multiresult = [];
                            multiresult.push({
                              anaassay: mongoose.Types.ObjectId(param._id),
                              sn: param.naziv,
                              vrijeme_prijenosa: Date.now(),
                              vrijeme_rezultata: Date.now(),
                              dilucija: param.opis,
                              module_sn: param.kod,
                              reagens_lot: "n/a",
                              reagens_sn: "n/a",
                              rezultat_f: "",
                              rezultat_m: [],
                              jedinice_f: param.jedinica,
                              rezultat_p: "",
                              jedinice_p: "",
                              rezultat_i: "",
                              odobren: false,
                              created_at: Date.now(),
                              created_by: req.body.decoded.user,
                            });
                            komplet.push({
                              labassay: mongoose.Types.ObjectId(param._id),
                              labtest: mongoose.Types.ObjectId(test.labassay),
                              status: "ZAPRIMLJEN",
                              retest: false,
                              grupa: grupa,
                              interp: interp,
                              extend: extend,
                              refd: refd,
                              refg: refg,
                              rezultat: multiresult,
                            });
                          });
                          rezultat.multi.push(komplet);
                          rezultat.rezultati.push({
                            labassay: mongoose.Types.ObjectId(test.labassay),
                            status: "U OBRADI",
                            grupa: grupa,
                            interp: "none",
                            extend: "",
                            refd: "0",
                            refg: "0",
                            rezultat: [
                              {
                                anaassay: testm._id,
                                sn: "36148BG",
                                vrijeme_prijenosa: Date.now(),
                                vrijeme_rezultata: Date.now(),
                                dilucija: "MULTI",
                                module_sn: "APARAT",
                                reagens_lot: "n/a",
                                reagens_sn: "n/a",
                                rezultat_f: "",
                                rezultat_m: [],
                                jedinice_f: testm.test.jedinica,
                                rezultat_p: "",
                                jedinice_p: "",
                                rezultat_i: "",
                                odobren: false,
                                created_at: Date.now(),
                                created_by: req.body.decoded.user,
                              },
                            ],
                          });
                          komplet = [];
                        } else {
                          set = {};
                          testm.reference = testm.reference.sort(function (
                            a,
                            b
                          ) {
                            return a.dDob.localeCompare(b.dDob, undefined, {
                              numeric: true,
                              sensitivity: "base",
                            });
                          });
                          testm.reference.forEach((element) => {
                            set = reference.get(
                              testm.test.naziv,
                              req.body.menopauza,
                              element.grupa,
                              element.spol,
                              req.body.spol,
                              element.refd,
                              element.refg,
                              element.interp,
                              element.extend,
                              patientFound.dijabetes,
                              patientFound.duhan,
                              req.body.trudnica,
                              req.body.anticoag,
                              req.body.menstc,
                              starost,
                              element.dDob,
                              element.gDob,
                              ""
                            );
                            if (set.hasOwnProperty("grupa")) {
                              grupa = set.grupa;
                              refd = set.refd;
                              refg = set.refg;
                              interp = set.interp;
                              extend = set.extend;
                            }
                          });

                          rezultat.rezultati.push({
                            labassay: mongoose.Types.ObjectId(test.labassay),
                            grupa: grupa,
                            interp: interp,
                            extend: extend,
                            refd: refd,
                            refg: refg,
                            rezultat: [
                              {
                                anaassay: testm._id,
                                sn: "AUTO",
                                vrijeme_prijenosa: Date.now(),
                                vrijeme_rezultata: Date.now(),
                                dilucija: "",
                                module_sn: "",
                                reagens_lot: "",
                                reagens_sn: "",
                                rezultat_f: "",
                                rezultat_m: [],
                                jedinice_f: testm.test.jedinica,
                                rezultat_p: "",
                                jedinice_p: "",
                                rezultat_i: "",
                                odobren: false,
                                created_at: Date.now(),
                                created_by: req.body.decoded.user,
                              },
                            ],
                          });
                        }
                      } // Kraj ako je test aparatski
                      // POPULIRANJE SAMPLA I REZULTATA ZA PATIENT FOUND VARIJANTU
                      zadnji++;
                      if (zadnji === req.body.testovi.length) {
                        req.body.tests = tests;
                        req.body.patient = patientFound;
                        req.body.lokacija = mongoose.Types.ObjectId(
                          req.body.lokacija
                        );

                        niz = req.body.datum.split("/");
                        ni = req.body.vrijeme.split(":");

                        req.body.datum = new Date(
                          niz[2],
                          niz[1] - 1,
                          niz[0],
                          ni[0],
                          ni[1]
                        );

                        var d = new Date();
                        var mjesec = d.getMonth() + 1;
                        if (mjesec < 10) {
                          mjesec = "0" + mjesec;
                        }
                        var dan = d.getUTCDate();
                        if (dan < 10) {
                          dan = "0" + dan;
                        }

                        var god = d.getFullYear().toString();
                        var datum = god.substring(3, 4) + mjesec + dan;

                        Samples.find({
                          id: new RegExp(
                            sampleT.tip(req.body.type) +
                              "[0-9]{3}" +
                              req.body.siteSifra +
                              datum
                          ),
                        })
                          .populate("patient")
                          .sort({
                            created_at: -1,
                          })
                          .limit(1)
                          .exec(function (err, uzorak) {
                            if (err) {
                              console.log("Greška:", err);
                            } else {
                              if (uzorak.length) {
                                var temp = uzorak[0].id.slice(1, 4);
                                var iduz = String(parseFloat(temp, 10) + 1);
                                switch (iduz.length) {
                                  case 1:
                                    iduz = "00" + iduz;
                                    break;
                                  case 2:
                                    iduz = "0" + iduz;
                                    break;
                                  default:
                                    iduz = "" + iduz;
                                }
                                req.body.id =
                                  sampleT.tip(req.body.type) +
                                  iduz +
                                  req.body.siteSifra +
                                  datum;

                                barcode.toBuffer(
                                  {
                                    bcid: "code128", // Barcode type
                                    text: req.body.id, // Text to encode
                                    scaleX: 2, // 3x scaling factor
                                    scaleY: 3, // 3x scaling factor
                                    height: 14, // Bar height, in millimeters
                                    includetext: true, // Show human-readable text
                                    textxalign: "center", // Always good to set this
                                    paddingheight: 10,
                                    paddingwidth: 10,
                                    backgroundcolor: "FFFFFF",
                                  },
                                  function (err, png) {
                                    if (err) {
                                      console.log(err);
                                    } else {
                                      var file =
                                        config.sample_path +
                                        req.body.id +
                                        ".png";
                                      // console.log(uzorak)

                                      fs.writeFile(
                                        file,
                                        png.toString("base64"),
                                        {
                                          encoding: "base64",
                                        },
                                        function (err) {
                                          if (err) {
                                            console.log(err);
                                          } else {
                                            req.body.created_by =
                                              req.body.decoded.user;
                                            var sample = new Samples(req.body);
                                            sample.save(function (err, sample) {
                                              if (err) {
                                                res.json({
                                                  success: false,
                                                  message: err,
                                                });
                                              } else {
                                                var data = {};
                                                data.sid = sample.id;
                                                data.ime =
                                                  req.body.ime +
                                                  " " +
                                                  req.body.prezime;
                                                rezultat.sample = sample;
                                                rezultat.id = sample.id;
                                                rezultat.status = "U OBRADI";
                                                rezultat.created_by =
                                                  req.body.decoded.user;
                                                rezultat.site = req.body.site;
                                                var result = new Results(
                                                  rezultat
                                                );
                                                result.save();
                                                komplet = [];
                                                data.link =
                                                  config.barURL +
                                                  "images/barcodes/" +
                                                  data.sid +
                                                  ".png";
                                                data.specialTest =
                                                  req.body.specialTest;
                                                res.json({
                                                  success: true,
                                                  message:
                                                    "Uzorak uspješno sačuvan",
                                                  data,
                                                });
                                              }
                                            });
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              } else {
                                req.body.id =
                                  sampleT.tip(req.body.type) +
                                  "001" +
                                  req.body.siteSifra +
                                  datum;

                                barcode.toBuffer(
                                  {
                                    bcid: "code128", // Barcode type
                                    text: req.body.id, // Text to encode
                                    scaleX: 2, // 3x scaling factor
                                    scaleY: 3, // 3x scaling factor
                                    height: 14, // Bar height, in millimeters
                                    includetext: true, // Show human-readable text
                                    textxalign: "center", // Always good to set this
                                    paddingheight: 10,
                                    paddingwidth: 10,
                                    backgroundcolor: "FFFFFF",
                                  },
                                  function (err, png) {
                                    if (err) {
                                    } else {
                                      var file =
                                        config.sample_path +
                                        req.body.id +
                                        ".png";
                                      fs.writeFile(
                                        file,
                                        png.toString("base64"),
                                        {
                                          encoding: "base64",
                                        },
                                        function (err) {
                                          if (err) {
                                            console.log(err);
                                          } else {
                                            req.body.created_by =
                                              req.body.decoded.user;
                                            var sample = new Samples(req.body);
                                            sample.save(function (err, sample) {
                                              if (err) {
                                                res.json({
                                                  success: false,
                                                  message: err,
                                                });
                                              } else {
                                                var data = {};
                                                data.sid = sample.id;
                                                data.ime =
                                                  req.body.ime +
                                                  " " +
                                                  req.body.prezime;
                                                rezultat.sample = sample;
                                                rezultat.id = sample.id;
                                                rezultat.status = "U OBRADI";
                                                rezultat.created_by =
                                                  req.body.decoded.user;
                                                rezultat.site = req.body.site;
                                                var result = new Results(
                                                  rezultat
                                                );
                                                result.save();
                                                komplet = [];
                                                data.link =
                                                  config.barURL +
                                                  "images/barcodes/" +
                                                  data.sid +
                                                  ".png";
                                                data.specialTest =
                                                  req.body.specialTest;
                                                res.json({
                                                  success: true,
                                                  message:
                                                    "Uzorak uspješno sačuvan",
                                                  data,
                                                });
                                              }
                                            });
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            }
                          });
                      }
                      // KRAJ KRAJ POPULIRANJE SAMPLA I REZULTATA ZA PATIENT FOUND VARIJANTU
                    } // End ako je test pronadjen
                  }
                });
            });
          }
        }
      });
  }
};

sampleController.Patient = function (req, res) {
  Patients.findOne({
    jmbg: req.body.jmbg,
    site: mongoose.Types.ObjectId(req.body.site),
  }).exec(function (err, pacijent) {
    if (err) {
      console.log("Greška:", err);
      res.json({
        success: false,
        message: "Greška prilikom pretraživanja baze",
      });
    } else {
      if (pacijent) {
        res.json({
          success: true,
          message: "Pacijent postoji",
          pacijent,
        });
      } else {
        res.json({
          success: false,
          message: "Pacijent ne postoji",
        });
      }
    }
  });
};

sampleController.List = function (req, res) {
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
      $lt: to,
    },
    site: mongoose.Types.ObjectId(req.query.site),
  };
  if (!req.query.filter) {
    req.query.filter = "";
  }
  Samples.find(uslov)
    .populate("patient tests.labassay")
    .exec(function (err, samples) {
      if (err) {
        console.log("Greška:", err);
      } else {
        var selectedsamples = [];
        var sectionExist = false;
        samples.forEach((sample) => {
          if (sample.patient === null) {
            // console.log(sample.id)
          }
          sectionExist = false;
          sample.tests.forEach((test) => {
            if (test.labassay.sekcija === req.params.section) {
              sectionExist = true;
            }
          });
          if (sectionExist) {
            selectedsamples.push(sample);
          }
        });
        samples = selectedsamples;
        switch (parametar) {
          case "ime":
            uzorci = samples.filter(function (sample) {
              return sample.patient.ime
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "prezime":
            uzorci = samples.filter(function (sample) {
              return sample.patient.prezime
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          case "id":
            uzorci = samples.filter(function (sample) {
              return sample.id
                .toLowerCase()
                .includes(req.query.filter.toLowerCase());
            });
            break;
          default:
            uzorci = samples.filter(function (sample) {
              return (
                sample.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase()) ||
                sample.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase())
              );
            });
            break;
        }

        var json = {};

        json.data = [];

        switch (parametar) {
          case "ime":
            if (order === "asc") {
              uzorci.sort(function (a, b) {
                return a.patient.ime == b.patient.ime
                  ? 0
                  : +(a.patient.ime > b.patient.ime) || -1;
              });
            }
            if (order === "desc") {
              uzorci.sort(function (a, b) {
                return a.patient.ime == b.patient.ime
                  ? 0
                  : +(a.patient.ime < b.patient.ime) || -1;
              });
            }
            break;
          case "prezime":
            if (order === "asc") {
              uzorci.sort(function (a, b) {
                return a.patient.prezime == b.patient.prezime
                  ? 0
                  : +(a.patient.prezime > b.patient.prezime) || -1;
              });
            }
            if (order === "desc") {
              uzorci.sort(function (a, b) {
                return a.patient.prezime == b.patient.prezime
                  ? 0
                  : +(a.patient.prezime < b.patient.prezime) || -1;
              });
            }
            break;
          case "id":
            if (order === "asc") {
              uzorci.sort(function (a, b) {
                return a.id == b.id ? 0 : +(a.id > b.id) || -1;
              });
            }
            if (order === "desc") {
              uzorci.sort(function (a, b) {
                return a.id == b.id ? 0 : +(a.id < b.id) || -1;
              });
            }
            break;
          default:
            uzorci.sort(function (a, b) {
              return Date.parse(a.updated_at) == Date.parse(b.updated_at)
                ? 0
                : +(Date.parse(a.updated_at) < Date.parse(b.updated_at)) || -1;
            });
            break;
        }

        var niz = uzorci;
        niz.forEach((uzorak) => {
          var uslov = 0;
          var nacekanju = 0;
          var realizovan = 0;
          var uobradi = 0;
          var statusuzorka = uzorak.status;
          var deletable = false;

          uzorak.tests.forEach((element) => {
            uslov++;
            if (element.labassay.manual && element.status_t != "U OBRADI") {
              deletable = true;
            }
            if (!element.labassay.manual && element.status_t != "ZAPRIMLJEN") {
              deletable = true;
            }
            if (element.status_t === "ZAPRIMLJEN") {
              nacekanju++;
            }
            if (element.status_t === "U OBRADI") {
              uobradi++;
            }
            if (element.status_t === "REALIZOVAN") {
              realizovan++;
            }

            if ((uslov = uzorak.tests.length)) {
              if (nacekanju < 1 && uobradi < 1 && realizovan < 1) {
                // 0 - 0 - 0
                // Case is Not Possible
              } else if (nacekanju > 0 && uobradi < 1 && realizovan < 1) {
                // 1 - 0 - 0
                uzorak.status = "ZAPRIMLJEN";
              } else if (nacekanju > 0 && uobradi > 0 && realizovan < 1) {
                // 1 - 1 - 0
                if (statusuzorka != "OBRAĐEN") {
                  uzorak.status = "U OBRADI";
                } else {
                  uzorak.status = "OBRAĐEN";
                }
              } else if (nacekanju > 0 && uobradi < 1 && realizovan > 0) {
                // 1 - 0 - 1
                uzorak.status = "U OBRADI";
              } else if (nacekanju < 1 && uobradi > 0 && realizovan > 0) {
                // 0 - 1 - 1
                if (statusuzorka === "OBRAĐEN") {
                  uzorak.status = "OBRAĐEN";
                } else {
                  uzorak.status = "U OBRADI";
                }
              } else if (nacekanju < 1 && uobradi < 1 && realizovan > 0) {
                // 0 - 0 - 1
                if (statusuzorka === "OBRAĐEN") {
                  uzorak.status = "OBRAĐEN";
                } else {
                  uzorak.status = "REALIZOVAN";
                }
              } else if (nacekanju > 0 && uobradi > 0 && realizovan > 0) {
                // 1 - 1 - 1
                uzorak.status = "U OBRADI";
              } else if (nacekanju < 1 && uobradi > 0 && realizovan < 1) {
                // 0 - 1 - 0
                if (statusuzorka === "OBRAĐEN") {
                  uzorak.status = "OBRAĐEN";
                } else {
                  uzorak.status = "U OBRADI";
                }
              }
            }
          });

          switch (uzorak.status) {
            case "ZAPRIMLJEN":
              var badge = '<span class="circle badge-danger"></span>';
              var uredi =
                "<button title='Uredite uzorak' id='" +
                uzorak._id +
                "' class='btn btn-secondary btn-micro'><span id='" +
                uzorak._id +
                "' class='glyphicon glyphicon-edit'></span> UREDI</button>";
              break;
            case "U OBRADI":
              var badge = '<span class="circle badge-warning"></span>';
              var uredi =
                "<button title='Uredite uzorak' id='" +
                uzorak._id +
                "' class='btn btn-secondary btn-micro'><span id='" +
                uzorak._id +
                "' class='glyphicon glyphicon-edit'></span> UREDI</button>";
              break;
            case "REALIZOVAN":
              var badge = '<span class="circle badge-info"></span>';
              var uredi =
                "<button title='Uredite uzorak' id='" +
                uzorak._id +
                "' class='btn btn-secondary btn-micro'><span id='" +
                uzorak._id +
                "' class='glyphicon glyphicon-edit'></span> UREDI</button>";
              break;
            case "OBRAĐEN":
              var badge = '<span class="circle badge-primary"></span>';
              var uredi =
                "<button disabled title='Uzorak obrađen' id='" +
                uzorak._id +
                "' class='btn btn-primary btn-micro'><span id='" +
                uzorak._id +
                "' class='disabled glyphicon glyphicon-edit'></span> UREDI</button>";
              break;
            default:
              var badge = '<span class="circle badge-danger"></span>';
              var uredi =
                "<button title='Uredite uzorak' id='" +
                uzorak._id +
                "' class='btn btn-secondary btn-micro'><span id='" +
                uzorak._id +
                "' class='glyphicon glyphicon-edit'></span> UREDI</button>";
              break;
          }

          var link =
            "<button title='Printanje barkoda' class='btn btn-info btn-micro'  id='" +
            config.barURL +
            "images/barcodes/" +
            uzorak.id +
            ".png'><span id='" +
            config.barURL +
            "images/barcodes/" +
            uzorak.id +
            ".png' class='fa fa-barcode'></span> Printaj</button>";
          var detalji =
            "<button title='Detaljan pregled uzorka' id='" +
            uzorak._id +
            "' class='btn btn-primary btn-micro'><span id='" +
            uzorak._id +
            "' class='glyphicon glyphicon-search'></span> pregled</button>";
          if (deletable) {
            var izbrisi =
              "<button disabled title='Brisanje zapisa nije moguće' uzorka' id='" +
              uzorak._id +
              "' class='btn btn-danger btn-micro'><span id='" +
              uzorak._id +
              "' class='fa fa-trash-o'></span> IZBRIŠI</button>";
          } else {
            var izbrisi =
              "<button title='Brisanje zapisa' uzorka' id='" +
              uzorak._id +
              "' class='btn btn-danger btn-micro'><span id='" +
              uzorak._id +
              "' class='fa fa-trash-o'></span> IZBRIŠI</button>";
          }
          

          if (uzorak.prioritet.includes("HITAN")) {
            var prioritet = "<strong>" + uzorak.prioritet + "</strong>";
          } else if (uzorak.prioritet.includes("NORMALAN")) {
            var prioritet = uzorak.prioritet;
          } else {
            var prioritet = "Nema podataka.";
          }

          if (
            req.query.datum === "ZAPRIMLJEN" &&
            uzorak.status === "ZAPRIMLJEN"
          ) {
            json.data.push({
              detalji: detalji,
              ime: uzorak.patient.ime,
              prezime: uzorak.patient.prezime,
              id: uzorak.id,
              barkod: link,
              prioritet: prioritet,
              status: uzorak.status,
              izbrisi: izbrisi,
              badge: badge,
              uredi: uredi,
            });
          }
          if (req.query.datum === "U OBRADI" && uzorak.status === "U OBRADI") {
            json.data.push({
              detalji: detalji,
              ime: uzorak.patient.ime,
              prezime: uzorak.patient.prezime,
              id: uzorak.id,
              barkod: link,
              prioritet: prioritet,
              status: uzorak.status,
              izbrisi: izbrisi,
              badge: badge,
              uredi: uredi,
            });
          }
          if (
            req.query.datum === "REALIZOVAN" &&
            uzorak.status === "REALIZOVAN"
          ) {
            json.data.push({
              detalji: detalji,
              ime: uzorak.patient.ime,
              prezime: uzorak.patient.prezime,
              id: uzorak.id,
              barkod: link,
              prioritet: prioritet,
              status: uzorak.status,
              izbrisi: izbrisi,
              badge: badge,
              uredi: uredi,
            });
          }
          if (req.query.datum === "OBRAĐEN" && uzorak.status === "OBRAĐEN") {
            json.data.push({
              detalji: detalji,
              ime: uzorak.patient.ime,
              prezime: uzorak.patient.prezime,
              id: uzorak.id,
              barkod: link,
              prioritet: prioritet,
              status: uzorak.status,
              izbrisi: izbrisi,
              badge: badge,
              uredi: uredi,
            });
          }
          if (req.query.datum === "Svi Rezultati") {
            json.data.push({
              detalji: detalji,
              ime: uzorak.patient.ime,
              prezime: uzorak.patient.prezime,
              id: uzorak.id,
              barkod: link,
              prioritet: prioritet,
              status: uzorak.status,
              izbrisi: izbrisi,
              badge: badge,
              uredi: uredi,
            });
          }
          if (req.query.datum === "DANAS") {
            json.data.push({
              detalji: detalji,
              ime: uzorak.patient.ime,
              prezime: uzorak.patient.prezime,
              id: uzorak.id,
              barkod: link,
              prioritet: prioritet,
              status: uzorak.status,
              izbrisi: izbrisi,
              badge: badge,
              uredi: uredi,
            });
          }
        });
        json.total = json.data.length;
        json.per_page = req.query.per_page;
        json.current_page = req.query.page;
        json.last_page = Math.ceil(json.total / json.per_page);
        json.next_page_url =
          config.baseURL +
          "uzorci?sort=" +
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
          "uzorci?sort=" +
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

sampleController.Show = function (req, res) {
  Samples.findOne({
    id: req.params.id,
  })
    .populate("tests.labassay patient lokacija")
    .lean()
    .exec(function (err, uzorak) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (!uzorak)
          res.send({
            success: false,
            message: "Uzorak nije pronađen.",
          });
        else {
          Results.findOne({
            id: req.params.id,
          })
            .populate("rezultati.labassay")
            .exec(function (err, rezultat) {
              if (err) {
                console.log("Greška:", err);
              } else {
                if (!rezultat)
                  res.send({
                    success: false,
                    message: "Rezultat nije pronađen.",
                  });
                else {
                  uzorak.datum = uzorak.datum.toString();
                  res.send({
                    success: true,
                    message: "Rezultat  pronađen.",
                    rezultat: rezultat,
                    uzorak: uzorak,
                  });
                }
              }
            });
        }
      }
    });
};

sampleController.Delete = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Samples.findOne({
      //_id: req.body.id
      id: req.body.id,
    }).exec(function (err, id) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (!id) {
          res.json({
            success: false,
            message: "Nije pronađen uzorak za brisanje.",
          });
        } else {
          Results.findOne({
            id: id.id,
          }).exec(function (err, rezultat) {
            Samples.remove(
              {
                _id: id._id,
              },
              function (err) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: "Nije moguće izbrisati uzorak.",
                  });
                } else {
                  var del = {};
                  del.type = id.type;
                  del.id = id.id;
                  del.datum = id.datum;
                  del.status = id.status;
                  del.doktor = id.doktor;
                  del.lokacija = id.lokacija;
                  del.patient = id.patient;
                  del.trudnica = id.trudnica;
                  del.menstc = id.menstc;
                  del.anticoag = id.anticoag;
                  del.menopauza = id.menopauza;
                  del.site = id.site;
                  del.prioritet = id.prioritet;
                  del.komentar = id.komentar;
                  del.tests = id.tests;
                  del.created_at = id.created_at;
                  del.updated_at = id.updated_at;
                  del.created_by = id.created_by;
                  del.updated_by = id.updated_by;
                  del.deleted_by = req.body.decoded.user;
                  var delSample = new Audit_SampleDelete(del);
                  delSample.save();

                  // console.log("Delete.")
                  // Update Racuni Collection

                  // BEGIN

                  Racuni.findOne({
                    site: mongoose.Types.ObjectId(req.body.site),
                    timestamp: id.timestamp,
                  }).exec(function (err, racun) {
                    if (err) {
                      console.log("Greška:", err);
                      res.json({
                        success: false,
                        message: err,
                      });
                    } else {
                      if (racun) {
                        racun.valid = false;

                        racun.updated_at = new Date(
                          new Date().getTime() -
                            new Date().getTimezoneOffset() * 60000
                        );
                        // created_by
                        racun.updated_by = req.body.decoded.user;

                        racun.save(function (err) {
                          if (err) {
                            console.log("Greška:", err);
                            res.json({
                              success: false,
                              message: err,
                            });
                          } else {
                            res.json({
                              success: true,
                              message: "Uzorak uspješno izbrisan.",
                              id,
                            });
                          }
                        });
                      } else {
                        res.json({
                          success: true,
                          message: "Uzorak uspješno izbrisan.",
                          id,
                        });
                      }
                    }
                  });

                  // END
                }
              }
            );

            Results.remove(
              {
                _id: rezultat._id,
              },
              function (err) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  var delr = {};
                  delr.id = rezultat.id;
                  delr.sample = rezultat.sample;
                  delr.patient = rezultat.patient;
                  delr.status = rezultat.status;
                  delr.odobren = rezultat.odobren;
                  delr.created_at = rezultat.created_at;
                  delr.updated_at = rezultat.updated_at;
                  delr.rezultati = rezultat.rezultati;
                  delr.multi = rezultat.multi;
                  delr.controlmulti = rezultat.controlmulti;
                  delr.deleted_by = req.body.decoded.user;
                  var delResult = new Audit_ResultDelete(delr);
                  delResult.save();
                }
              }
            );
          });
        }
      }
    });
  }
};

sampleController.SectionList = function (req, res) {
  Sekcija.find({}).exec(function (err, sections) {
    if (err) {
      console.log("Greška:", err);
    } else {
      var sekcije = [];

      sections.sort(function (a, b) {
        return a.order == b.order ? 0 : +(a.order > b.order) || -1;
      });

      sections.forEach((element) => {
        sekcije.push(element.sekcija);
      });

      res.json({
        success: true,
        message: "Lista sekcija",
        sekcije,
      });
    }
  });
};

sampleController.Update = function (req, res) {
  var controlSave = false;
  Results.findOne({
    id: req.body.sid,
  })
    .populate("sample patient")
    .exec(function (err, result) {
      if (result) {
        var Created = result.created_at;

        var delr = {};
        delr.id = result.id;
        delr.sample = result.sample;
        delr.patient = result.patient;
        delr.status = result.status;
        delr.odobren = result.odobren;
        delr.created_at = result.created_at;
        delr.updated_at = result.updated_at;
        delr.created_by = result.created_by;
        delr.updated_by = result.updated_by;
        delr.rezultati = result.rezultati;
        delr.multi = result.multi;
        delr.controlmulti = result.controlmulti;
        var delResult = new Audit_Result(delr);
        delResult.save();

        var upd = {};
        upd.type = result.sample.type;
        upd.id = result.sample.id;
        upd.datum = result.sample.datum;
        upd.status = result.sample.status;
        upd.doktor = result.sample.doktor;
        upd.lokacija = result.sample.lokacija;
        upd.patient = result.sample.patient;
        upd.trudnica = result.sample.trudnica;
        upd.menstc = result.sample.menstc;
        upd.anticoag = result.sample.anticoag;
        upd.menopauza = result.sample.menopauza;
        upd.site = result.sample.site;
        upd.prioritet = result.sample.prioritet;
        upd.komentar = result.sample.komentar;
        upd.tests = result.sample.tests;
        upd.created_at = result.sample.created_at;
        upd.updated_at = result.sample.updated_at;
        upd.created_by = result.sample.created_by;
        upd.updated_by = result.sample.updated_by;
        var updSample = new Audit_Sample(upd);
        updSample.save();

        var counter = 0;
        var zaunos = true;
        var status_t = "ZAPRIMLJEN";
        var sampleTeststemp = result.sample.tests;
        result.sample.status = "U OBRADI";
        var age = null;
        var current = null;
        var starost = null;
        var g = new Date();
        current = g.getFullYear().toString();
        if (req.body.jmbg.substring(4, 7).charAt(0) === "9") {
          age = "1" + req.body.jmbg.substring(4, 7);
        } else {
          age = "2" + req.body.jmbg.substring(4, 7);
        }
        starost = parseFloat(current) - parseFloat(age);

        req.body.testovi.forEach((test) => {
          AnaAssays.findOne({
            test: mongoose.Types.ObjectId(test.labassay),
            site: mongoose.Types.ObjectId(req.body.site),
          })
            .populate("test")
            .exec(function (err, testm) {
              if (err) {
                console.log("Greška:", err);
              } else {
                status_t = "ZAPRIMLJEN";
                if (test.manual) {
                  status_t = "U OBRADI";
                }
                zaunos = true;
                result.sample.tests.forEach((element) => {
                  if (
                    element.labassay.equals(
                      mongoose.Types.ObjectId(test.labassay)
                    )
                  ) {
                    zaunos = false;
                  }
                });
                if (
                  !result.sample.tests.filter((e) =>
                    e.labassay.equals(mongoose.Types.ObjectId(test.labassay))
                  ).length > 0
                ) {
                  if (test.cijena.trim() != "" && !isNaN(test.cijena)) {
                    var CIJENA = test.cijena;
                  } else {
                    var CIJENA = "0";
                  }

                  sampleTeststemp.push({
                    cijena: CIJENA,
                    labassay: mongoose.Types.ObjectId(test.labassay),
                    status_r: false,
                    status_t: status_t,
                  });
                  if (testm) {
                    if (test.manual) {
                      result.created_at = Created;

                      if (testm.test.multi) {
                        testm.test.multiparam.forEach((param) => {
                          set = {};
                          testm.reference.forEach((ref) => {
                            if (
                              param._id.equals(
                                mongoose.Types.ObjectId(ref.analit)
                              )
                            ) {
                              set = reference.anaget(
                                testm.test.naziv,
                                req.body.menopauza,
                                ref.grupa,
                                ref.spol,
                                req.body.spol,
                                ref.refd,
                                ref.refg,
                                ref.interp,
                                ref.extend,
                                "",
                                "",
                                req.body.trudnica,
                                req.body.anticoag,
                                req.body.menstc,
                                starost,
                                ref.dDob,
                                ref.gDob,
                                ""
                              );
                              if (set.hasOwnProperty("grupa")) {
                                grupa = set.grupa;
                                refd = set.refd;
                                refg = set.refg;
                                interp = set.interp;
                                extend = set.extend;
                              }
                            }
                          });
                          multiresult = [];

                          multiresult.push({
                            anaassay: mongoose.Types.ObjectId(param._id),
                            sn: param.naziv,
                            vrijeme_prijenosa: Date.now(),
                            vrijeme_rezultata: Date.now(),
                            dilucija: param.opis,
                            module_sn: param.kod,
                            reagens_lot: "n/a",
                            reagens_sn: "n/a",
                            rezultat_f: "",
                            rezultat_m: [],
                            jedinice_f: param.jedinica,
                            rezultat_p: "",
                            jedinice_p: "",
                            rezultat_i: "",
                            odobren: false,
                          });
                          komplet.push({
                            labassay: mongoose.Types.ObjectId(param._id),
                            labtest: mongoose.Types.ObjectId(test.labassay),
                            status: "ZAPRIMLJEN",
                            retest: false,
                            grupa: grupa,
                            interp: interp,
                            extend: extend,
                            refd: refd,
                            refg: refg,
                            rezultat: multiresult,
                          });
                        });
                        result.multi.push(komplet);
                        result.rezultati.push({
                          labassay: mongoose.Types.ObjectId(test.labassay),
                          status: "U OBRADI",
                          grupa: grupa,
                          interp: "none",
                          extend: "",
                          refd: "0",
                          refg: "0",
                          rezultat: [
                            {
                              anaassay: testm._id,
                              sn: "MANUAL",
                              vrijeme_prijenosa: Date.now(),
                              vrijeme_rezultata: Date.now(),
                              dilucija: "MULTI",
                              module_sn: "MANUAL",
                              reagens_lot: "n/a",
                              reagens_sn: "n/a",
                              rezultat_f: "",
                              rezultat_m: [],
                              jedinice_f: testm.test.jedinica,
                              rezultat_p: "",
                              jedinice_p: "",
                              rezultat_i: "",
                              odobren: false,
                            },
                          ],
                        });
                        result.controlmulti = true;
                        komplet = [];
                      } else {
                        set = {};
                        testm.reference = testm.reference.sort(function (a, b) {
                          return a.dDob.localeCompare(b.dDob, undefined, {
                            numeric: true,
                            sensitivity: "base",
                          });
                        });
                        testm.reference.forEach((element) => {
                          set = reference.get(
                            testm.test.naziv,
                            req.body.menopauza,
                            element.grupa,
                            element.spol,
                            req.body.spol,
                            element.refd,
                            element.refg,
                            element.interp,
                            element.extend,
                            result.sample.patient.dijabetes,
                            result.sample.patient.duhan,
                            req.body.trudnica,
                            req.body.anticoag,
                            req.body.menstc,
                            starost,
                            element.dDob,
                            element.gDob,
                            req.body.jmbg
                          );
                          if (set.hasOwnProperty("grupa")) {
                            grupa = set.grupa;
                            refd = set.refd;
                            refg = set.refg;
                            interp = set.interp;
                            extend = set.extend;
                          }
                        });

                        result.rezultati.push({
                          labassay: mongoose.Types.ObjectId(test.labassay),
                          status: "U OBRADI",
                          grupa: grupa,
                          interp: interp,
                          extend: extend,
                          refd: refd,
                          refg: refg,
                          rezultat: [
                            {
                              anaassay: testm._id,
                              sn: "MANUAL",
                              vrijeme_prijenosa: Date.now(),
                              vrijeme_rezultata: Date.now(),
                              dilucija: "n/a",
                              module_sn: "n/a",
                              reagens_lot: "n/a",
                              reagens_sn: "n/a",
                              rezultat_f: "",
                              rezultat_m: [],
                              jedinice_f: testm.test.jedinica,
                              rezultat_p: "",
                              jedinice_p: "",
                              rezultat_i: "",
                              odobren: false,
                            },
                          ],
                        });
                      }
                    } else {
                      if (testm.test.multi) {
                        testm.test.multiparam.forEach((param) => {
                          set = {};
                          testm.reference.forEach((ref) => {
                            if (
                              param._id.equals(
                                mongoose.Types.ObjectId(ref.analit)
                              )
                            ) {
                              set = reference.anaget(
                                testm.test.naziv,
                                req.body.menopauza,
                                ref.grupa,
                                ref.spol,
                                req.body.spol,
                                ref.refd,
                                ref.refg,
                                ref.interp,
                                ref.extend,
                                "",
                                "",
                                req.body.trudnica,
                                req.body.anticoag,
                                req.body.menstc,
                                starost,
                                ref.dDob,
                                ref.gDob,
                                ""
                              );
                              if (set.hasOwnProperty("grupa")) {
                                grupa = set.grupa;
                                refd = set.refd;
                                refg = set.refg;
                                interp = set.interp;
                                extend = set.extend;
                              }
                            }
                          });
                          multiresult = [];
                          multiresult.push({
                            anaassay: mongoose.Types.ObjectId(param._id),
                            sn: param.naziv,
                            vrijeme_prijenosa: Date.now(),
                            vrijeme_rezultata: Date.now(),
                            dilucija: param.opis,
                            module_sn: param.kod,
                            reagens_lot: "n/a",
                            reagens_sn: "n/a",
                            rezultat_f: "",
                            rezultat_m: [],
                            jedinice_f: param.jedinica,
                            rezultat_p: "",
                            jedinice_p: "",
                            rezultat_i: "",
                            odobren: false,
                          });
                          komplet.push({
                            labassay: mongoose.Types.ObjectId(param._id),
                            labtest: mongoose.Types.ObjectId(test.labassay),
                            status: "ZAPRIMLJEN",
                            retest: false,
                            grupa: grupa,
                            interp: interp,
                            extend: extend,
                            refd: refd,
                            refg: refg,
                            rezultat: multiresult,
                          });
                        });
                        result.multi.push(komplet);
                        result.rezultati.push({
                          labassay: mongoose.Types.ObjectId(test.labassay),
                          status: "U OBRADI",
                          grupa: grupa,
                          interp: "none",
                          extend: "",
                          refd: "0",
                          refg: "0",
                          rezultat: [
                            {
                              anaassay: testm._id,
                              sn: "36148BG",
                              vrijeme_prijenosa: Date.now(),
                              vrijeme_rezultata: Date.now(),
                              dilucija: "MULTI",
                              module_sn: "APARAT",
                              reagens_lot: "n/a",
                              reagens_sn: "n/a",
                              rezultat_f: "",
                              rezultat_m: [],
                              jedinice_f: "",
                              rezultat_p: "",
                              jedinice_p: "",
                              rezultat_i: "",
                              odobren: false,
                            },
                          ],
                        });
                        komplet = [];
                      } else {
                        set = {};
                        testm.reference = testm.reference.sort(function (a, b) {
                          return a.dDob.localeCompare(b.dDob, undefined, {
                            numeric: true,
                            sensitivity: "base",
                          });
                        });
                        testm.reference.forEach((element) => {
                          set = reference.get(
                            testm.test.naziv,
                            req.body.menopauza,
                            element.grupa,
                            element.spol,
                            req.body.spol,
                            element.refd,
                            element.refg,
                            element.interp,
                            element.extend,
                            result.sample.patient.dijabetes,
                            result.sample.patient.duhan,
                            req.body.trudnica,
                            req.body.anticoag,
                            req.body.menstc,
                            starost,
                            element.dDob,
                            element.gDob,
                            req.body.jmbg
                          );
                          if (set.hasOwnProperty("grupa")) {
                            grupa = set.grupa;
                            refd = set.refd;
                            refg = set.refg;
                            interp = set.interp;
                            extend = set.extend;
                          }
                        });

                        result.rezultati.push({
                          labassay: mongoose.Types.ObjectId(test.labassay),
                          grupa: grupa,
                          interp: interp,
                          extend: extend,
                          refd: refd,
                          refg: refg,
                          rezultat: [
                            {
                              anaassay: testm._id,
                              sn: "AUTO",
                              vrijeme_prijenosa: Date.now(),
                              vrijeme_rezultata: Date.now(),
                              dilucija: "",
                              module_sn: "",
                              reagens_lot: "",
                              reagens_sn: "",
                              rezultat_f: "",
                              rezultat_m: [],
                              jedinice_f: testm.test.jedinica,
                              rezultat_p: "",
                              jedinice_p: "",
                              rezultat_i: "",
                              odobren: false,
                              created_at: Date.now(),
                              created_by: req.body.decoded.user,
                            },
                          ],
                        });
                      }
                    } // Kraj ako je test aparatski
                  }

                  counter++;

                  if (counter === req.body.testovi.length) {
                    result.sample.tests = sampleTeststemp;
                    result.sample.updated_at = Date.now();
                    result.sample.updated_by = req.body.decoded.user;

                    result.updated_at = Date.now();
                    result.updated_by = req.body.decoded.user;
                    result.status = "U OBRADI";
                    //REDNI BROJ PACIJENTA
                    var newsample = new Samples(result.sample);
                    newsample.save(function (err, nSamp) {
                      var zabrisanje = true;
                      var novisamples = [];
                      var novirezultati = [];
                      var novirezultatimulti = [];
                      novisamples = result.sample.tests;
                      novirezultati = result.rezultati;
                      novirezultatimulti = result.multi;
                      result.sample.tests.forEach((element) => {
                        zabrisanje = true;
                        req.body.testovi.forEach((test) => {
                          if (
                            element.labassay.equals(
                              mongoose.Types.ObjectId(test.labassay)
                            )
                          ) {
                            zabrisanje = false;
                          }
                        });
                        if (zabrisanje) {
                          novisamples = novisamples.filter(
                            (el) => !el.labassay.equals(element.labassay)
                          );
                          novirezultati = novirezultati.filter(
                            (el) => !el.labassay.equals(element.labassay)
                          );
                          novirezultatimulti = novirezultatimulti.filter(
                            (el) => !el[0].labtest.equals(element.labassay)
                          );
                        }
                      });

                      nSamp.tests = novisamples;
                      result.rezultati = novirezultati;
                      result.multi = novirezultatimulti;

                      if (result.rezultati.length) {
                        result.sample.updated_at = Date.now();
                        result.sample.updated_by = req.body.decoded.user;
                        result.updated_at = Date.now();
                        result.updated_by = req.body.decoded.user;
                        result.save();
                        var newsample = new Samples(nSamp);
                        newsample.save();
                      } else {
                        var del = {};
                        del.type = result.sample.type;
                        del.id = result.sample.id;
                        del.datum = result.sample.datum;
                        del.status = result.sample.status;
                        del.doktor = result.sample.doktor;
                        del.lokacija = result.sample.lokacija;
                        del.patient = result.sample.patient;
                        del.trudnica = result.sample.trudnica;
                        del.menstc = result.sample.menstc;
                        del.anticoag = result.sample.anticoag;
                        del.menopauza = result.sample.menopauza;
                        del.site = result.sample.site;
                        del.prioritet = result.sample.prioritet;
                        del.komentar = result.sample.komentar;
                        del.tests = result.sample.tests;
                        del.created_at = result.sample.created_at;
                        del.updated_at = result.sample.updated_at;
                        del.created_by = result.sample.created_by;
                        del.updated_by = result.sample.updated_by;
                        del.deleted_by = req.body.decoded.user;
                        var delSample = new Audit_SampleDelete(del);
                        delSample.save();
                        var delr = {};
                        delr.id = result.id;
                        delr.sample = result.sample;
                        delr.patient = result.patient;
                        delr.status = result.status;
                        delr.odobren = result.odobren;
                        delr.created_at = result.created_at;
                        delr.updated_at = result.updated_at;
                        delr.rezultati = result.rezultati;
                        delr.multi = result.multi;
                        delr.controlmulti = result.controlmulti;
                        delr.deleted_by = req.body.decoded.user;
                        var delResult = new Audit_ResultDelete(delr);
                        delResult.save();
                        result.remove();
                      }

                      // console.log("Update.")
                      // Update Racuni Collection

                      // BEGIN

                      Racuni.findOne({
                        site: mongoose.Types.ObjectId(req.body.site),
                        timestamp: result.sample.timestamp,
                      }).exec(function (err, racun) {
                        if (err) {
                          console.log("Greška:", err);
                          res.json({
                            success: false,
                            message: err,
                          });
                        } else {
                          if (racun) {
                            racun.valid = false;

                            racun.updated_at = new Date(
                              new Date().getTime() -
                                new Date().getTimezoneOffset() * 60000
                            );
                            // created_by
                            racun.updated_by = req.body.decoded.user;

                            racun.save(function (err) {
                              if (err) {
                                console.log("Greška:", err);
                                res.json({
                                  success: false,
                                  message: err,
                                });
                              } else {
                                res.json({
                                  success: true,
                                  message: "Uzorak uspješno izmjenjen.",
                                });
                              }
                            });
                          } else {
                            res.json({
                              success: true,
                              message: "Uzorak uspješno izmjenjen.",
                            });
                          }
                        }
                      });

                      // END
                    });

                    //REDNI BROJ PACIJENTA
                  }
                } else {
                  counter++;

                  if (counter === req.body.testovi.length) {
                    result.sample.tests = sampleTeststemp;
                    result.sample.updated_at = Date.now();
                    result.sample.updated_by = req.body.decoded.user;

                    result.updated_at = Date.now();
                    result.updated_by = req.body.decoded.user;
                    result.status = "U OBRADI";
                    //REDNI BROJ PACIJENTA
                    var newsample = new Samples(result.sample);
                    newsample.save(function (err, nSamp) {
                      var zabrisanje = true;
                      var novisamples = [];
                      var novirezultati = [];
                      var novirezultatimulti = [];
                      novisamples = result.sample.tests;
                      novirezultati = result.rezultati;
                      novirezultatimulti = result.multi;
                      result.sample.tests.forEach((element) => {
                        zabrisanje = true;
                        req.body.testovi.forEach((test) => {
                          if (
                            element.labassay.equals(
                              mongoose.Types.ObjectId(test.labassay)
                            )
                          ) {
                            zabrisanje = false;
                          }
                        });
                        if (zabrisanje) {
                          novisamples = novisamples.filter(
                            (el) => !el.labassay.equals(element.labassay)
                          );
                          novirezultati = novirezultati.filter(
                            (el) => !el.labassay.equals(element.labassay)
                          );
                          novirezultatimulti = novirezultatimulti.filter(
                            (el) => !el[0].labtest.equals(element.labassay)
                          );
                        }
                      });

                      nSamp.tests = novisamples;
                      result.rezultati = novirezultati;
                      result.multi = novirezultatimulti;

                      if (result.rezultati.length) {
                        result.sample.updated_at = Date.now();
                        result.sample.updated_by = req.body.decoded.user;
                        result.updated_at = Date.now();
                        result.updated_by = req.body.decoded.user;

                        result.save();
                        var newsample = new Samples(nSamp);
                        newsample.save();
                      } else {
                        var del = {};
                        del.type = result.sample.type;
                        del.id = result.sample.id;
                        del.datum = result.sample.datum;
                        del.status = result.sample.status;
                        del.doktor = result.sample.doktor;
                        del.lokacija = result.sample.lokacija;
                        del.patient = result.sample.patient;
                        del.trudnica = result.sample.trudnica;
                        del.menstc = result.sample.menstc;
                        del.anticoag = result.sample.anticoag;
                        del.menopauza = result.sample.menopauza;
                        del.site = result.sample.site;
                        del.prioritet = result.sample.prioritet;
                        del.komentar = result.sample.komentar;
                        del.tests = result.sample.tests;
                        del.created_at = result.sample.created_at;
                        del.updated_at = result.sample.updated_at;
                        del.created_by = result.sample.created_by;
                        del.updated_by = result.sample.updated_by;
                        del.deleted_by = req.body.decoded.user;
                        var delSample = new Audit_SampleDelete(del);
                        delSample.save();
                        var delr = {};
                        delr.id = result.id;
                        delr.sample = result.sample;
                        delr.patient = result.patient;
                        delr.status = result.status;
                        delr.odobren = result.odobren;
                        delr.created_at = result.created_at;
                        delr.updated_at = result.updated_at;
                        delr.rezultati = result.rezultati;
                        delr.multi = result.multi;
                        delr.controlmulti = result.controlmulti;
                        delr.deleted_by = req.body.decoded.user;
                        var delResult = new Audit_ResultDelete(delr);
                        delResult.save();
                        result.remove();
                        nSamp.remove();
                      }

                      // console.log("Update.")
                      // Update Racuni Collection

                      // BEGIN

                      Racuni.findOne({
                        site: mongoose.Types.ObjectId(req.body.site),
                        timestamp: result.sample.timestamp,
                      }).exec(function (err, racun) {
                        if (err) {
                          console.log("Greška:", err);
                          res.json({
                            success: false,
                            message: err,
                          });
                        } else {
                          if (racun) {
                            racun.valid = false;

                            racun.updated_at = new Date(
                              new Date().getTime() -
                                new Date().getTimezoneOffset() * 60000
                            );
                            // created_by
                            racun.updated_by = req.body.decoded.user;

                            racun.save(function (err) {
                              if (err) {
                                console.log("Greška:", err);
                                res.json({
                                  success: false,
                                  message: err,
                                });
                              } else {
                                res.json({
                                  success: true,
                                  message: "Uzorak uspješno izmjenjen.",
                                });
                              }
                            });
                          } else {
                            res.json({
                              success: true,
                              message: "Uzorak uspješno izmjenjen.",
                            });
                          }
                        }
                      });

                      // END
                    });

                    // REDNI BROJ PACIJENTA
                  }
                }
              }
            });
        });

        if (!req.body.testovi.length) {
          var del = {};
          del.type = result.sample.type;
          del.id = result.sample.id;
          del.datum = result.sample.datum;
          del.status = result.sample.status;
          del.doktor = result.sample.doktor;
          del.lokacija = result.sample.lokacija;
          del.patient = result.sample.patient;
          del.trudnica = result.sample.trudnica;
          del.menstc = result.sample.menstc;
          del.anticoag = result.sample.anticoag;
          del.menopauza = result.sample.menopauza;
          del.site = result.sample.site;
          del.prioritet = result.sample.prioritet;
          del.komentar = result.sample.komentar;
          del.tests = result.sample.tests;
          del.created_at = result.sample.created_at;
          del.updated_at = result.sample.updated_at;
          del.created_by = result.sample.created_by;
          del.updated_by = result.sample.updated_by;
          del.deleted_by = req.body.decoded.user;
          var delSample = new Audit_SampleDelete(del);
          delSample.save();
          var delr = {};
          delr.id = result.id;
          delr.sample = result.sample;
          delr.patient = result.patient;
          delr.status = result.status;
          delr.odobren = result.odobren;
          delr.created_at = result.created_at;
          delr.updated_at = result.updated_at;
          delr.rezultati = result.rezultati;
          delr.multi = result.multi;
          delr.controlmulti = result.controlmulti;
          delr.deleted_by = req.body.decoded.user;
          var delResult = new Audit_ResultDelete(delr);
          delResult.save();
          result.remove();
          var newsample = new Samples(result.sample);
          newsample.save(function (err, nSamp) {
            nSamp.remove();
            res.json({
              success: true,
              message: "Uzorak uspješno izmjenjen",
            });
          });
        }
      }
    });
};

sampleController.Racuni = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
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
    if (req.query.datum === "Svi Rezultati") {
      var doo = new Date();
      var od = new Date();
      od.setFullYear(od.getFullYear() - 1);
      to = doo;
      from = od;
    } else {
      to = danasnjiDatum + "T23:59:59";
      to = new Date(to + "Z");
      from = danasnjiDatum + "T00:00:00";
      from = new Date(from + "Z");
    }
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();
    var uslov = {};
    uslov = {
      updated_at: {
        $gt: from,
        $lt: to,
      },
      site: req.query.site,
    };
    if (!req.query.filter) {
      req.query.filter = "";
    }

    Samples.find(uslov)
      .populate("patient tests.labassay")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              results = results.filter(function (result) {
                return result.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;

            case "prezime":
              results = results.filter(function (result) {
                return result.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              results = results.filter(function (result) {
                return result.patient.jmbg
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              results = results.filter(function (result) {
                return (
                  result.patient.ime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) ||
                  result.patient.prezime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase())
                );
              });
              break;
          }
          switch (parametar) {
            case "ime":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime > b.patient.ime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime < b.patient.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime > b.patient.prezime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime < b.patient.prezime) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.patient.jmbg == b.patient.jmbg
                    ? 0
                    : +(a.patient.jmbg > b.patient.jmbg) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.patient.jmbg == b.patient.jmbg
                    ? 0
                    : +(a.patient.jmbg < b.patient.jmbg) || -1;
                });
              }
              break;
            default:
              results.sort(function (a, b) {
                return Date.parse(a.updated_at) == Date.parse(b.updated_at)
                  ? 0
                  : +(Date.parse(a.updated_at) < Date.parse(b.updated_at)) ||
                      -1;
              });
              break;
          }
          var i = 0;
          var noviNiz = [];

          results.forEach((element) => {
            i++;
            if (
              !noviNiz.filter(
                (rezultat) => rezultat.patient._id === element.patient._id
              ).length > 0
            ) {
              noviNiz.push(element);
            }
          });

          var json = {};
          json.total = noviNiz.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "nalazi/list?sort=" +
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
            "nalazi/list?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];
          noviNiz = noviNiz.slice(json.from - 1, json.to);
          var niz = noviNiz;

          niz.forEach((uzorak) => {
            if (uzorak.status === "ODOBREN" || i > 0) {
              var nalaz =
                "<button title='Ispis predračuna za pacijenta' id='" +
                uzorak.patient._id +
                "' class='btn btn-primary btn-micro'><span id='" +
                uzorak.patient._id +
                "' class='fa fa-euro'></span> PREDRAČUN</button>";
              var akcija = "<strong>21-10-2018</strong>";
              json.data.push({
                racuni: nalaz,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                jmbg: uzorak.patient.jmbg,
                izmjena: akcija,
              });
            }
          });
          res.json(json);
        }
      });
  }
};

sampleController.selectSample = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Samples.find({
      patient: mongoose.Types.ObjectId(req.params.id),
      site: req.body.site,
    })
      .populate("patient")
      .exec(function (err, results) {
        if (results.length) {
          results.sort(function (a, b) {
            return Date.parse(a.updated_at) == Date.parse(b.updated_at)
              ? 0
              : +(Date.parse(a.updated_at) < Date.parse(b.updated_at)) || -1;
          });
          res.json(results);
        } else {
          res.json(
            (success = true),
            (message = "Nema pronadjenih rezultata"),
            (results = [])
          );
        }
      });
  }
};

sampleController.BarData = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Samples.findOne({
      id: req.params.id,
      site: req.query.site,
    })
      .populate("patient tests.labassay")
      .exec(function (err, result) {
        if (result) {
          // Uslov za upit

          var jmbg = result.patient.jmbg;
          var godiste = jmbg.substring(4, 7);
          switch (godiste[0]) {
            case "9":
              godiste = "1" + godiste;
              break;
            case "0":
              godiste = "2" + godiste;
              break;

            default:
              break;
          }
          var temp = new Date(result.datum);
          temp.setDate(temp.getDate());
          var trenutniMjesec = temp.getMonth() + 1;
          var trenutniDan = temp.getUTCDate();
          if (trenutniDan < 10) {
            trenutniDan = "0" + trenutniDan;
          }
          if (trenutniMjesec < 10) {
            trenutniMjesec = "0" + trenutniMjesec;
          }

          var sat = temp.getHours();
          var min = temp.getMinutes();

          if (sat < 10) {
            sat = "0" + sat;
          }
          if (min < 10) {
            min = "0" + min;
          }

          var datum =
            trenutniDan +
            "." +
            trenutniMjesec +
            "." +
            temp.getFullYear().toString().substring(2, 4) +
            sat +
            ":" +
            min;
          // console.log(datum)
          var barData = {};

          barData.pacijentRBr = result.pid;
          barData.godiste = godiste;
          barData.datum = datum;
          barData.ime = result.patient.ime + " " + result.patient.prezime;
          barData.name = result.patient.ime;
          barData.surname = result.patient.prezime;
          barData.protokol = result.protokol;
          barData.sid = result.id;
          barData.link =
            config.barURL + "images/barcodes/" + result.id + ".png";
          // if (result.type === "Krv") {
          //   barData.code = result.tests[0].labassay.naziv.substring(0, 3)
          // } else {
          //   barData.code = ""
          // }

          barData.code = result.code;
          res.json(barData);
        } else {
          res.json(
            (success = true),
            (message = "Nema pronadjenih rezultata"),
            (result = [])
          );
        }
      });
  }
};

sampleController.ListSve = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
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
        $lt: to,
      },
      site: mongoose.Types.ObjectId(req.query.site),
    };
    if (!req.query.filter) {
      req.query.filter = "";
    }
    Samples.find(uslov)
      .populate("patient tests.labassay")
      .exec(function (err, samples) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              samples = samples.filter(function (sample) {
                return sample.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              samples = samples.filter(function (sample) {
                return sample.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "id":
              samples = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              samples = samples.filter(function (sample) {
                return (
                  sample.patient.ime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) ||
                  sample.patient.prezime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase())
                );
              });
              break;
          }

          var json = {};

          json.data = [];

          switch (parametar) {
            case "ime":
              if (order === "asc") {
                samples.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime > b.patient.ime) || -1;
                });
              }
              if (order === "desc") {
                samples.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime < b.patient.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                samples.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime > b.patient.prezime) || -1;
                });
              }
              if (order === "desc") {
                samples.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime < b.patient.prezime) || -1;
                });
              }
              break;
            case "id":
              if (order === "asc") {
                samples.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                });
              }
              if (order === "desc") {
                samples.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id < b.id) || -1;
                });
              }
              break;
            default:
              samples.sort(function (a, b) {
                return Date.parse(a.updated_at) == Date.parse(b.updated_at)
                  ? 0
                  : +(Date.parse(a.updated_at) < Date.parse(b.updated_at)) ||
                      -1;
              });
              break;
          }

          var niz = samples;
          niz.forEach((uzorak) => {
            var uslov = 0;
            var nacekanju = 0;
            var realizovan = 0;
            var uobradi = 0;
            var statusuzorka = uzorak.status;
            var deletable = false;

            uzorak.tests.forEach((element) => {
              uslov++;
              // console.log(uzorak.id)
              // console.log(element.labassay.naziv)
              if (element.labassay.manual && element.status_t != "U OBRADI") {
                deletable = true;
              }
              if (
                !element.labassay.manual &&
                element.status_t != "ZAPRIMLJEN"
              ) {
                deletable = true;
              }
              if (element.status_t === "ZAPRIMLJEN") {
                nacekanju++;
              }
              if (element.status_t === "U OBRADI") {
                uobradi++;
              }
              if (element.status_t === "REALIZOVAN") {
                realizovan++;
              }

              if ((uslov = uzorak.tests.length)) {
                if (nacekanju < 1 && uobradi < 1 && realizovan < 1) {
                  // 0 - 0 - 0
                  // Case is Not Possible
                } else if (nacekanju > 0 && uobradi < 1 && realizovan < 1) {
                  // 1 - 0 - 0
                  uzorak.status = "ZAPRIMLJEN";
                } else if (nacekanju > 0 && uobradi > 0 && realizovan < 1) {
                  // 1 - 1 - 0
                  if (statusuzorka != "OBRAĐEN") {
                    uzorak.status = "U OBRADI";
                  } else {
                    uzorak.status = "OBRAĐEN";
                  }
                } else if (nacekanju > 0 && uobradi < 1 && realizovan > 0) {
                  // 1 - 0 - 1
                  uzorak.status = "U OBRADI";
                } else if (nacekanju < 1 && uobradi > 0 && realizovan > 0) {
                  // 0 - 1 - 1
                  if (statusuzorka === "OBRAĐEN") {
                    uzorak.status = "OBRAĐEN";
                  } else {
                    uzorak.status = "U OBRADI";
                  }
                } else if (nacekanju < 1 && uobradi < 1 && realizovan > 0) {
                  // 0 - 0 - 1
                  if (statusuzorka === "OBRAĐEN") {
                    uzorak.status = "OBRAĐEN";
                  } else {
                    uzorak.status = "REALIZOVAN";
                  }
                } else if (nacekanju > 0 && uobradi > 0 && realizovan > 0) {
                  // 1 - 1 - 1
                  uzorak.status = "U OBRADI";
                } else if (nacekanju < 1 && uobradi > 0 && realizovan < 1) {
                  // 0 - 1 - 0
                  if (statusuzorka === "OBRAĐEN") {
                    uzorak.status = "OBRAĐEN";
                  } else {
                    uzorak.status = "U OBRADI";
                  }
                }
              }
            });

            switch (uzorak.status) {
              case "ZAPRIMLJEN":
                var badge = '<span class="circle badge-danger"></span>';
                var uredi =
                  "<button title='Uredite uzorak' id='" +
                  uzorak._id +
                  "' class='btn btn-secondary btn-micro'><span id='" +
                  uzorak._id +
                  "' class='glyphicon glyphicon-edit'></span> UREDI</button>";
                break;
              case "U OBRADI":
                var badge = '<span class="circle badge-warning"></span>';
                var uredi =
                  "<button title='Uredite uzorak' id='" +
                  uzorak._id +
                  "' class='btn btn-secondary btn-micro'><span id='" +
                  uzorak._id +
                  "' class='glyphicon glyphicon-edit'></span> UREDI</button>";
                break;
              case "REALIZOVAN":
                var badge = '<span class="circle badge-info"></span>';
                var uredi =
                  "<button title='Uredite uzorak' id='" +
                  uzorak._id +
                  "' class='btn btn-secondary btn-micro'><span id='" +
                  uzorak._id +
                  "' class='glyphicon glyphicon-edit'></span> UREDI</button>";
                break;
              case "OBRAĐEN":
                var badge = '<span class="circle badge-primary"></span>';
                var uredi =
                  "<button disabled title='Uzorak obrađen' id='" +
                  uzorak._id +
                  "' class='btn btn-primary btn-micro'><span id='" +
                  uzorak._id +
                  "' class='disabled glyphicon glyphicon-edit'></span> UREDI</button>";
                break;
              default:
                var badge = '<span class="circle badge-danger"></span>';
                var uredi =
                  "<button title='Uredite uzorak' id='" +
                  uzorak._id +
                  "' class='btn btn-secondary btn-micro'><span id='" +
                  uzorak._id +
                  "' class='glyphicon glyphicon-edit'></span> UREDI</button>";
                break;
            }

            var link =
              "<button title='Printanje barkoda' class='btn btn-info btn-micro'  id='" +
              config.barURL +
              "images/barcodes/" +
              uzorak.id +
              ".png'><span id='" +
              config.barURL +
              "images/barcodes/" +
              uzorak.id +
              ".png' class='fa fa-barcode'></span> Printaj</button>";
            var detalji =
              "<button title='Detaljan pregled uzorka' id='" +
              uzorak._id +
              "' class='btn btn-primary btn-micro'><span id='" +
              uzorak._id +
              "' class='glyphicon glyphicon-search'></span> pregled</button>";
            if (deletable) {
              var izbrisi =
                "<button disabled title='Brisanje zapisa nije moguće' uzorka' id='" +
                uzorak._id +
                "' class='btn btn-danger btn-micro'><span id='" +
                uzorak._id +
                "' class='fa fa-trash-o'></span> IZBRIŠI</button>";
            } else {
              var izbrisi =
                "<button title='Brisanje zapisa' uzorka' id='" +
                uzorak._id +
                "' class='btn btn-danger btn-micro'><span id='" +
                uzorak._id +
                "' class='fa fa-trash-o'></span> IZBRIŠI</button>";
            }

            if (uzorak.prioritet.includes("HITAN")) {
              var prioritet = "<strong>" + uzorak.prioritet + "</strong>";
            } else if (uzorak.prioritet.includes("NORMALAN")) {
              var prioritet = uzorak.prioritet;
            } else {
              var prioritet = "Nema podataka.";
            }

            if (
              req.query.datum === "ZAPRIMLJEN" &&
              uzorak.status === "ZAPRIMLJEN"
            ) {
              json.data.push({
                detalji: detalji,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                id: uzorak.id,
                pregled: detalji,
                barkod: link,
                prioritet: prioritet,
                status: uzorak.status,
                izbrisi: izbrisi,
                badge: badge,
                uredi: uredi,
              });
            }
            if (
              req.query.datum === "U OBRADI" &&
              uzorak.status === "U OBRADI"
            ) {
              json.data.push({
                detalji: detalji,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                id: uzorak.id,
                pregled: detalji,
                barkod: link,
                prioritet: prioritet,
                status: uzorak.status,
                izbrisi: izbrisi,
                badge: badge,
                uredi: uredi,
              });
            }
            if (
              req.query.datum === "REALIZOVAN" &&
              uzorak.status === "REALIZOVAN"
            ) {
              json.data.push({
                detalji: detalji,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                id: uzorak.id,
                pregled: detalji,
                barkod: link,
                prioritet: prioritet,
                status: uzorak.status,
                izbrisi: izbrisi,
                badge: badge,
                uredi: uredi,
              });
            }
            if (req.query.datum === "OBRAĐEN" && uzorak.status === "OBRAĐEN") {
              json.data.push({
                detalji: detalji,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                id: uzorak.id,
                pregled: detalji,
                barkod: link,
                prioritet: prioritet,
                status: uzorak.status,
                izbrisi: izbrisi,
                badge: badge,
                uredi: uredi,
              });
            }
            if (req.query.datum === "Svi Rezultati") {
              json.data.push({
                detalji: detalji,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                id: uzorak.id,
                pregled: detalji,
                barkod: link,
                prioritet: prioritet,
                status: uzorak.status,
                izbrisi: izbrisi,
                badge: badge,
                uredi: uredi,
              });
            }
            if (req.query.datum === "DANAS") {
              json.data.push({
                pacijent: uzorak.pid,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                id: uzorak.id,
                pregled: detalji,
                barkod: link,
                prioritet: prioritet,
                status: uzorak.status,
                izbrisi: izbrisi,
                badge: badge,
                uredi: uredi,
              });
            }
          });
          json.total = json.data.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "uzorci?sort=" +
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
            "uzorci?sort=" +
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
  }
};

sampleController.getKomentar = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Samples.findOne({
      id: req.params.id,
      site: req.query.site,
    })
      .populate("patient tests.labassay")
      .exec(function (err, result) {
        if (result) {
          // Uslov za upit
          // console.log('ruta komentar get')
          res.json({
            success: true,
            message: "Komentar uspješno dohvaćen",
            komentar: result.komentar,
          });
        } else {
          res.json({
            success: true,
            message: "Nema pronadjenih rezultata",
            result: [],
          });
        }
      });
  }
};

sampleController.setKomentar = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Samples.findOne({
      id: req.params.id,
      site: req.query.site,
    })
      .populate("patient tests.labassay")
      .exec(function (err, result) {
        if (result) {
          // Uslov za upit
          // console.log('ruta komentar set')
          // console.log(req.body)
          result.komentar = req.body.komentar;
          result.save();
          res.json({
            success: true,
            message: "Komentar uspješno sačuvan",
            komentar: req.body.komentar,
          });
        } else {
          res.json({
            success: true,
            message: "Nema pronadjenih rezultata",
            result: [],
          });
        }
      });
  }
};

sampleController.apiUrlPatients = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var param = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    // console.log(req.query)

    Patients.find({
      site: mongoose.Types.ObjectId(req.query.site),
    }).exec(function (err, patients) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        if (patients.length) {
          switch (param) {
            case "ime":
              patients = patients.filter(function (patient) {
                return patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              patients = patients.filter(function (patient) {
                return patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              patients = patients.filter(function (patient) {
                return patient.jmbg.includes(req.query.filter);
              });
              break;
            default:
              var full = req.query.filter.toLowerCase().split(" ");
              if (full.length === 2) {
                var name = full[0];
                var surname = full[1];
                patients = patients.filter(function (patient) {
                  return (
                    (patient.ime.toLowerCase().includes(name) &&
                      patient.prezime.toLowerCase().includes(surname)) ||
                    (patient.ime.toLowerCase().includes(surname) &&
                      patient.prezime.toLowerCase().includes(name))
                  );
                });
              }
              if (full.length === 1) {
                var name = full[0];
                patients = patients.filter(function (patient) {
                  return (
                    patient.ime.toLowerCase().includes(name) ||
                    patient.prezime.toLowerCase().includes(name)
                  );
                });
              }
              break;
          }

          var json = {};
          json.total = patients.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "api/patients?sort=" +
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
            "api/patients?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from =
            (json.current_page - 1) * parseInt(req.query.per_page) + 1;
          json.to =
            (json.current_page - 1) * parseInt(req.query.per_page) +
            parseInt(req.query.per_page);
          json.data = [];

          switch (param) {
            case "ime":
              if (order === "asc") {
                patients.sort(function (a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime > b.ime) || -1;
                });
              }
              if (order === "desc") {
                patients.sort(function (a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime < b.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                patients.sort(function (a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime > b.prezime) || -1;
                });
              }
              if (order === "desc") {
                patients.sort(function (a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime < b.prezime) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                patients = patients.sort(function (a, b) {
                  return a.jmbg.localeCompare(b.jmbg, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                patients = patients.sort(function (a, b) {
                  return b.jmbg.localeCompare(a.jmbg, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;
            default:
              patients.sort(function (a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var pat = patients.slice(json.from - 1, json.to);

          pat.forEach((element) => {
            switch (element.spol) {
              case "MUŠKI":
                element.badge = '<span class="circle badge-info"></span>';
                break;
              case "ŽENSKI":
                element.badge = '<span class="circle badge-violet"></span>';
                break;
              default:
                element.badge = '<span class="circle badge-warning"></span>';
                break;
            }

            json.data.push({
              id: element._id,
              badge: element.badge,
              ime: element.ime,
              prezime: element.prezime,
              jmbg: element.jmbg,
              spol: element.spol,
              edit:
                '<span style="font-size: 20px;" id="' +
                element._id +
                '" class="fa fa-edit"/>',
            });
          });

          res.json(json);
        } else {
          res.json({
            success: true,
            message: "Ne postoji niti jedan pacijent.",
            patients,
          });
        }
      }
    });
  }
};

sampleController.patientDetails = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Patients.findOne({
      _id: req.params.id,
      site: mongoose.Types.ObjectId(req.query.site),
    }).exec(function (err, patient) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        if (patient) {
          res.json({
            success: true,
            message: "Pacijent postoji.",
            patient,
          });
        } else {
          res.json({
            success: false,
            message: "Pacijent nije pronađen.",
          });
        }
      }
    });
  }
};

sampleController.prijemLabassays = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    LabAssays.find({
      active: true,
    }).exec(function (err, testovi) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        if (testovi.length) {
          res.json({
            success: true,
            message: "Uspješno pronadjeni testovi",
            testovi,
          });
        } else {
          res.json({
            success: false,
            message: "Nijedan test nije pronadjen.",
          });
        }
      }
    });
  }
};

sampleController.sacuvajUzorke = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    //

    var datum = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .substring(0, 10);

    var to = new Date(datum + "T23:59:59");
    var from = new Date(datum + "T00:00:00");

    var uslov = {};

    uslov = {
      created_at: {
        $gt: new Date(from.setHours(1)),
        $lt: new Date(to.setHours(24, 59, 59)),
      },
      site: mongoose.Types.ObjectId(req.body.site),
    };

    var age = starost.get(req.body.uzorci[0].patient.jmbg);

    // console.log('Starost: ' + age)
    var imeIprezime =
      req.body.uzorci[0].patient.ime + " " + req.body.uzorci[0].patient.prezime;
    var godiste = req.body.uzorci[0].patient.jmbg.slice(4, 7);

    if (godiste[0] === "9") {
      godiste = "1" + godiste;
    }
    if (godiste[0] === "0") {
      godiste = "2" + godiste;
    }
    var uzorcicount = 0;

    var data = [];

    // console.log(uslov)

    Samples.find(uslov)
      .lean()
      .exec(function (err, uzorci) {
        if (err) {
          console.log("Greška:", err);
        } else {
          //----------GET PID and SID------------*
          var pidAll = [];
          uzorci.forEach((uzorakBack) => {
            pidAll.push(uzorakBack.pid);
          });
          pidAll.push("0");
          pidAll.sort(function (a, b) {
            return b.localeCompare(a, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });
          //
          //console.log(pidAll)
          //
          var typeNrSerum = 0;
          var typeNrKrv = 0;
          var typeNrKapKrv = 0;
          var typeNrPlazma = 0;
          var typeNrBris = 0;
          var typeNrUrin = 0;
          var typeNrFeces = 0;
          var typeNrOstalo = 0;
          var typeNrEjakulat = 0;

          var priority = "NORMALAN";

          req.body.uzorci.forEach((uzorakFront) => {
            if (uzorakFront.hitno === true) {
              priority = "CITO";
            }
          });
          req.body.uzorci.forEach((uzorakFront) => {
            uzorakFront.all = [];

            uzorakFront.prioritet = priority;
            if (uzorakFront.ime[0] === "S") {
              uzorakFront.typeNrSerum = typeNrSerum;
              uzorakFront.all.push(
                "S000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
              typeNrSerum++;
            }
            if (uzorakFront.ime[0] === "K") {
              uzorakFront.typeNrKrv = typeNrKrv;
              uzorakFront.all.push(
                "K000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
              typeNrKrv++;
            }
            if (uzorakFront.ime[0] === "k") {
              uzorakFront.typeNrKapKrv = typeNrKapKrv;
              uzorakFront.all.push(
                "k000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
              typeNrKapKrv++;
            }

            if (uzorakFront.ime[0] === "P") {
              uzorakFront.typeNrPlazma = typeNrPlazma;
              uzorakFront.all.push(
                "P000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
              typeNrPlazma++;
            }
            if (uzorakFront.ime[0] === "B") {
              uzorakFront.typeNrBris = typeNrBris;
              uzorakFront.all.push(
                "B000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
              typeNrBris++;
            }
            if (uzorakFront.ime[0] === "U") {
              uzorakFront.typeNrUrin = typeNrUrin;
              uzorakFront.all.push(
                "U000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
              typeNrUrin++;
            }
            if (uzorakFront.ime[0] === "F") {
              uzorakFront.typeNrFeces = typeNrFeces;
              uzorakFront.all.push(
                "F000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
              typeNrFeces++;
            }
            if (uzorakFront.ime[0] === "O") {
              uzorakFront.typeNrOstalo = typeNrOstalo;
              uzorakFront.all.push(
                "O000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
              typeNrOstalo++;
            }
            if (uzorakFront.ime[0] === "E") {
              uzorakFront.typeNrEjakulat = 0;
              uzorakFront.all.push(
                "E000" +
                  req.body.siteCode +
                  datum.substring(3, 4) +
                  datum.substring(5, 7) +
                  datum.substring(8, 10)
              );
            }

            uzorci.forEach((uzorakBack) => {
              if (uzorakFront.ime[0] === uzorakBack.type[0]) {
                uzorakFront.all.push(uzorakBack.id);
              }
            });
          });

          req.body.uzorci.forEach((uzorakFront) => {
            uzorakFront.all.sort(function (a, b) {
              return a == b ? 0 : +(a < b) || -1;
            });
            uzorakFront.pid = String(parseFloat(pidAll[0], 10) + 1);
            uzorakFront.timestamp = req.body.timestamp;

            // console.log("PID: " + req.body.pid)

            if (req.body.pid != "" && req.body.complete.length) {
              uzorakFront.pid = req.body.pid;

              req.body.complete.forEach((element) => {
                if (element.pid == req.body.pid) {
                  uzorakFront.timestamp = element.timestamp;
                }
              });
            }

            switch (
              String(parseFloat(uzorakFront.all[0].slice(1, 4), 10) + 1).length
            ) {
              case 1:
                if (uzorakFront.ime[0] === "S") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrSerum
                    ).length > 1
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrSerum
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "00" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrSerum
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "K") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrKrv
                    ).length > 1
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrKrv
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "00" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrKrv
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "k") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrKapKrv
                    ).length > 1
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrKapKrv
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "00" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrKapKrv
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "P") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrPlazma
                    ).length > 1
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrPlazma
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "00" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrPlazma
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "B") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrBris
                    ).length > 1
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrBris
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "00" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrBris
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "U") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrUrin
                    ).length > 1
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrUrin
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "00" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrUrin
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "F") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrFeces
                    ).length > 1
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrFeces
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "00" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrFeces
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "O") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrOstalo
                    ).length > 1
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrOstalo
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "00" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrOstalo
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    "00" +
                    String(parseFloat(uzorakFront.all[0].slice(1, 4), 10) + 1) +
                    uzorakFront.all[0].substring(4, 10);
                }
                break;
              case 2:
                if (uzorakFront.ime[0] === "S") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrSerum
                    ).length > 2
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrSerum
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrSerum
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "K") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrKrv
                    ).length > 2
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrKrv
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrKrv
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "k") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrKapKrv
                    ).length > 2
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrKapKrv
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrKapKrv
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "P") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrPlazma
                    ).length > 2
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrPlazma
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrPlazma
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "B") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrBris
                    ).length > 2
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrBris
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrBris
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "U") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrUrin
                    ).length > 2
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrUrin
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrUrin
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "F") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrFeces
                    ).length > 2
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrFeces
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrFeces
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else if (uzorakFront.ime[0] === "O") {
                  if (
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrOstalo
                    ).length > 2
                  ) {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrOstalo
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  } else {
                    uzorakFront.id =
                      uzorakFront.ime[0] +
                      "0" +
                      String(
                        parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                          1 +
                          uzorakFront.typeNrOstalo
                      ) +
                      uzorakFront.all[0].substring(4, 10);
                  }
                } else {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    "0" +
                    String(parseFloat(uzorakFront.all[0].slice(1, 4), 10) + 1) +
                    uzorakFront.all[0].substring(4, 10);
                }
                break;
              default:
                if (uzorakFront.ime[0] === "S") {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrSerum
                    ) +
                    uzorakFront.all[0].substring(4, 10);
                } else if (uzorakFront.ime[0] === "K") {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrKrv
                    ) +
                    uzorakFront.all[0].substring(4, 10);
                } else if (uzorakFront.ime[0] === "k") {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrKapKrv
                    ) +
                    uzorakFront.all[0].substring(4, 10);
                } else if (uzorakFront.ime[0] === "P") {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrPlazma
                    ) +
                    uzorakFront.all[0].substring(4, 10);
                } else if (uzorakFront.ime[0] === "B") {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrBris
                    ) +
                    uzorakFront.all[0].substring(4, 10);
                } else if (uzorakFront.ime[0] === "U") {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrUrin
                    ) +
                    uzorakFront.all[0].substring(4, 10);
                } else if (uzorakFront.ime[0] === "F") {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrFeces
                    ) +
                    uzorakFront.all[0].substring(4, 10);
                } else if (uzorakFront.ime[0] === "O") {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(
                      parseFloat(uzorakFront.all[0].slice(1, 4), 10) +
                        1 +
                        uzorakFront.typeNrOstalo
                    ) +
                    uzorakFront.all[0].substring(4, 10);
                } else {
                  uzorakFront.id =
                    uzorakFront.ime[0] +
                    String(parseFloat(uzorakFront.all[0].slice(1, 4), 10) + 1) +
                    uzorakFront.all[0].substring(4, 10);
                }
            }
            //---------END GET PID and SID---------*
            //********************SINGLE SAMPLE SAVE******************************

            tests = [];

            uzorakFront.testovi.forEach((test) => {
              // console.log(test.cijena + " KM - " + test.opis);

              if (test.cijena.trim() != "" && !isNaN(test.cijena)) {
                var CIJENA = test.cijena;
              } else {
                var CIJENA = "0";
              }

              tests.push({
                cijena: CIJENA,
                labassay: mongoose.Types.ObjectId(test._id),
                status_t: "ZAPRIMLJEN",
              });
            });

            uzorakFront.datum = uzorakFront.time;
            uzorakFront.tests = tests;
            uzorakFront.site = mongoose.Types.ObjectId(req.body.site);
            uzorakFront.lokacija = mongoose.Types.ObjectId(req.body.lokacija);

            uzorakFront.protokol = req.body.BrojProtokola;

            if (req.body.klijent != null) {
              uzorakFront.customer = mongoose.Types.ObjectId(
                req.body.klijent._id
              );
            }

            uzorakFront.type = uzorakFront.ime;
            uzorakFront.trudnica = req.body.drstanje;

            var codeStr = "";

            if (uzorakFront.code.length > 0) {
              /* let b = Array.from(new Set(uzorakFront.code));
              uzorakFront.code = b.slice(0);

              uzorakFront.code.forEach((element) => {
                codeStr = codeStr + ", " + element;
              });

              codeStr = codeStr.substring(2, codeStr.length); */

              codeStr = uzorakFront.code[0];
            } else {
              codeStr = "";
            }

            uzorakFront.code = codeStr;

            uzorakFront.anticoag = req.body.anticoag;

            // Partneri - Pošiljaoc, Naručioc i Izvršioc
            uzorakFront.narucioc = req.body.narucioc;
            uzorakFront.posiljaoc = req.body.posiljaoc;

            // uzorakFront.popust = req.body.posiljaocPopust;

            uzorakFront.tip = uzorakFront.tip;
            uzorakFront.created_by = req.body.decoded.user;

            uzorakFront.created_at = new Date(
              new Date().getTime() - new Date().getTimezoneOffset() * 60000
            );

            uzorakFront.updated_at = new Date(
              new Date().getTime() - new Date().getTimezoneOffset() * 60000
            );

            var newsample = new Samples(uzorakFront);
            newsample.save(function (err, sample) {
              if (err) {
                // console.log('Cuvanje err:'+uzorcicount+err)
                res.json({
                  success: false,
                  message: err,
                });
              } else {
                //+++++++++++++++++++REZULTAT++++++++++++++++++++
                var rezultat = {};
                rezultat.rezultati = [];
                rezultat.multi = [];
                var komplet = [];

                var grupa = null;
                var refd = null;
                var refg = null;
                var zadnji = 0;
                // console.log('Checkpoint SAVE 1')
                sample.tests.forEach((test) => {
                  // console.log('Annaasay :'+test.labassay)
                  AnaAssays.findOne({
                    test: mongoose.Types.ObjectId(test.labassay),
                    site: mongoose.Types.ObjectId(req.body.site),
                  })
                    .populate("test")
                    .exec(function (err, testm) {
                      if (err) {
                        console.log("Greška:", err);
                      } else {
                        if (testm) {
                          if (test.manual) {
                            if (testm.test.multi) {
                              testm.test.multiparam.forEach((param) => {
                                set = {};
                                testm.reference.forEach((ref) => {
                                  if (
                                    param._id.equals(
                                      mongoose.Types.ObjectId(ref.analit)
                                    )
                                  ) {
                                    set = reference.anaget(
                                      testm.test.naziv,
                                      "", // req.body.menopauza,
                                      ref.grupa,
                                      ref.spol,
                                      req.body.uzorci[0].patient.spol,
                                      ref.refd,
                                      ref.refg,
                                      ref.interp,
                                      ref.extend,
                                      "",
                                      "",
                                      "", // req.body.trudnica,
                                      "", // req.body.anticoag,
                                      "", // req.body.menstc,
                                      age,
                                      ref.dDob,
                                      ref.gDob,
                                      ""
                                    );
                                    // console.log(set)
                                    if (set.hasOwnProperty("grupa")) {
                                      grupa = set.grupa;
                                      refd = set.refd;
                                      refg = set.refg;
                                      interp = set.interp;
                                      extend = set.extend;
                                    }
                                  }
                                });
                                // console.log('Checkpoint 1 - anaget')
                                // console.log(set)
                                multiresult = [];

                                multiresult.push({
                                  anaassay: mongoose.Types.ObjectId(param._id),
                                  sn: param.naziv,
                                  vrijeme_prijenosa: new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  ),
                                  vrijeme_rezultata: new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  ),
                                  dilucija: param.opis,
                                  module_sn: param.kod,
                                  reagens_lot: "n/a",
                                  reagens_sn: "n/a",
                                  rezultat_f: "",
                                  rezultat_m: [],
                                  jedinice_f: param.jedinica,
                                  rezultat_p: "",
                                  jedinice_p: "",
                                  rezultat_i: "",
                                  odobren: false,
                                  created_at: new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  ),
                                  created_by: req.body.decoded.user,
                                });
                                komplet.push({
                                  labassay: mongoose.Types.ObjectId(param._id),
                                  labtest: mongoose.Types.ObjectId(
                                    test.labassay
                                  ),
                                  status: "ZAPRIMLJEN",
                                  retest: false,
                                  grupa: grupa,
                                  interp: interp,
                                  extend: extend,
                                  refd: refd,
                                  refg: refg,
                                  rezultat: multiresult,
                                });
                              });
                              rezultat.multi.push(komplet);
                              rezultat.rezultati.push({
                                labassay: mongoose.Types.ObjectId(
                                  test.labassay
                                ),
                                status: "U OBRADI",
                                grupa: grupa,
                                interp: "none",
                                extend: "",
                                refd: "0",
                                refg: "0",
                                rezultat: [
                                  {
                                    anaassay: testm._id,
                                    sn: "MANUAL",
                                    vrijeme_prijenosa: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    vrijeme_rezultata: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    dilucija: "MULTI",
                                    module_sn: "MANUAL",
                                    reagens_lot: "n/a",
                                    reagens_sn: "n/a",
                                    rezultat_f: "",
                                    rezultat_m: [],
                                    jedinice_f: testm.test.jedinica,
                                    rezultat_p: "",
                                    jedinice_p: "",
                                    rezultat_i: "",
                                    odobren: false,
                                    created_at: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    created_by: req.body.decoded.user,
                                  },
                                ],
                              });
                              rezultat.controlmulti = true;
                              komplet = [];
                            } else {
                              // Kraj ako je rucni test sa analitima, pocetak ako je klasicni rucni test
                              set = {};
                              testm.reference = testm.reference.sort(function (
                                a,
                                b
                              ) {
                                return a.dDob.localeCompare(b.dDob, undefined, {
                                  numeric: true,
                                  sensitivity: "base",
                                });
                              });
                              testm.reference.forEach((element) => {
                                set = reference.get(
                                  testm.test.naziv,
                                  "",
                                  element.grupa,
                                  element.spol,
                                  req.body.uzorci[0].patient.spol,
                                  element.refd,
                                  element.refg,
                                  element.interp,
                                  element.extend,
                                  "",
                                  "",
                                  req.body.drstanje,
                                  req.body.anticoag,
                                  "",
                                  age,
                                  element.dDob,
                                  element.gDob,
                                  req.body.uzorci[0].patient.jmbg
                                );
                                // console.log('Checkpoint 1 - get')
                                // console.log(set)
                                if (set.hasOwnProperty("grupa")) {
                                  grupa = set.grupa;
                                  refd = set.refd;
                                  refg = set.refg;
                                  interp = set.interp;
                                  extend = set.extend;
                                }
                              });

                              rezultat.rezultati.push({
                                labassay: mongoose.Types.ObjectId(
                                  test.labassay
                                ),
                                status: "U OBRADI",
                                grupa: grupa,
                                interp: interp,
                                extend: extend,
                                refd: refd,
                                refg: refg,
                                rezultat: [
                                  {
                                    anaassay: testm._id,
                                    sn: "MANUAL",
                                    vrijeme_prijenosa: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    vrijeme_rezultata: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    dilucija: "n/a",
                                    module_sn: "n/a",
                                    reagens_lot: "n/a",
                                    reagens_sn: "n/a",
                                    rezultat_f: "",
                                    rezultat_m: [],
                                    jedinice_f: testm.test.jedinica,
                                    rezultat_p: "",
                                    jedinice_p: "",
                                    rezultat_i: "",
                                    odobren: false,
                                    created_at: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    created_by: req.body.decoded.user,
                                  },
                                ],
                              });
                            }
                          } // End if test rucni
                          else {
                            // Ako je test aparatski
                            if (testm.test.multi) {
                              testm.test.multiparam.forEach((param) => {
                                set = {};
                                testm.reference.forEach((ref) => {
                                  if (
                                    param._id.equals(
                                      mongoose.Types.ObjectId(ref.analit)
                                    )
                                  ) {
                                    set = reference.anaget(
                                      testm.test.naziv,
                                      "", // req.body.menopauza,
                                      ref.grupa,
                                      ref.spol,
                                      req.body.uzorci[0].patient.spol,
                                      ref.refd,
                                      ref.refg,
                                      ref.interp,
                                      ref.extend,
                                      "",
                                      "",
                                      "", // req.body.trudnica,
                                      "", // req.body.anticoag,
                                      "", // req.body.menstc,
                                      age,
                                      ref.dDob,
                                      ref.gDob,
                                      ""
                                    );
                                    if (set.hasOwnProperty("grupa")) {
                                      grupa = set.grupa;
                                      refd = set.refd;
                                      refg = set.refg;
                                      interp = set.interp;
                                      extend = set.extend;
                                    }
                                  }
                                });
                                // console.log('Checkpoint 2 - anaget')
                                // console.log(set)
                                multiresult = [];
                                multiresult.push({
                                  anaassay: mongoose.Types.ObjectId(param._id),
                                  sn: param.naziv,
                                  vrijeme_prijenosa: new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  ),
                                  vrijeme_rezultata: new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  ),
                                  dilucija: param.opis,
                                  module_sn: param.kod,
                                  reagens_lot: "n/a",
                                  reagens_sn: "n/a",
                                  rezultat_f: "",
                                  rezultat_m: [],
                                  jedinice_f: param.jedinica,
                                  rezultat_p: "",
                                  jedinice_p: "",
                                  rezultat_i: "",
                                  odobren: false,
                                  created_at: new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  ),
                                  created_by: req.body.decoded.user,
                                });
                                komplet.push({
                                  labassay: mongoose.Types.ObjectId(param._id),
                                  labtest: mongoose.Types.ObjectId(
                                    test.labassay
                                  ),
                                  status: "ZAPRIMLJEN",
                                  retest: false,
                                  grupa: grupa,
                                  interp: interp,
                                  extend: extend,
                                  refd: refd,
                                  refg: refg,
                                  rezultat: multiresult,
                                });
                              });
                              rezultat.multi.push(komplet);
                              rezultat.rezultati.push({
                                labassay: mongoose.Types.ObjectId(
                                  test.labassay
                                ),
                                status: "U OBRADI",
                                grupa: grupa,
                                interp: "none",
                                extend: "",
                                refd: "0",
                                refg: "0",
                                rezultat: [
                                  {
                                    anaassay: testm._id,
                                    sn: "36148BG",
                                    vrijeme_prijenosa: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    vrijeme_rezultata: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    dilucija: "MULTI",
                                    module_sn: "APARAT",
                                    reagens_lot: "n/a",
                                    reagens_sn: "n/a",
                                    rezultat_f: "",
                                    rezultat_m: [],
                                    jedinice_f: testm.test.jedinica,
                                    rezultat_p: "",
                                    jedinice_p: "",
                                    rezultat_i: "",
                                    odobren: false,
                                    created_at: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    created_by: req.body.decoded.user,
                                  },
                                ],
                              });
                              komplet = [];
                            } else {
                              set = {};
                              testm.reference = testm.reference.sort(function (
                                a,
                                b
                              ) {
                                return a.dDob.localeCompare(b.dDob, undefined, {
                                  numeric: true,
                                  sensitivity: "base",
                                });
                              });
                              testm.reference.forEach((element) => {
                                set = reference.get(
                                  testm.test.naziv,
                                  "",
                                  element.grupa,
                                  element.spol,
                                  req.body.uzorci[0].patient.spol,
                                  element.refd,
                                  element.refg,
                                  element.interp,
                                  element.extend,
                                  "",
                                  "",
                                  req.body.drstanje,
                                  req.body.anticoag,
                                  "",
                                  age,
                                  element.dDob,
                                  element.gDob,
                                  req.body.uzorci[0].patient.jmbg
                                );
                                if (set.hasOwnProperty("grupa")) {
                                  grupa = set.grupa;
                                  refd = set.refd;
                                  refg = set.refg;
                                  interp = set.interp;
                                  extend = set.extend;
                                }
                              });
                              // console.log('Checkpoint 2- get')
                              // console.log(set)
                              rezultat.rezultati.push({
                                labassay: mongoose.Types.ObjectId(
                                  test.labassay
                                ),
                                grupa: grupa,
                                interp: interp,
                                extend: extend,
                                refd: refd,
                                refg: refg,
                                rezultat: [
                                  {
                                    anaassay: testm._id,
                                    sn: "AUTO",
                                    vrijeme_prijenosa: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    vrijeme_rezultata: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    dilucija: "",
                                    module_sn: "",
                                    reagens_lot: "",
                                    reagens_sn: "",
                                    rezultat_f: "",
                                    rezultat_m: [],
                                    jedinice_f: testm.test.jedinica,
                                    rezultat_p: "",
                                    jedinice_p: "",
                                    rezultat_i: "",
                                    odobren: false,
                                    created_at: new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    ),
                                    created_by: req.body.decoded.user,
                                  },
                                ],
                              });
                            }
                          } // Kraj ako je test aparatski

                          // console.log('Checkpoint SAVE 2')
                          // console.log(zadnji)
                          zadnji++;
                          if (zadnji === sample.tests.length) {
                            // console.log('Checkpoint SAVE 3')
                            // console.log(zadnji)
                            barcode.toBuffer(
                              {
                                bcid: "code128", // Barcode type
                                text: sample.id, // Text to encode
                                scaleX: 2, // 3x scaling factor
                                scaleY: 3, // 3x scaling factor
                                height: 14, // Bar height, in millimeters
                                includetext: true, // Show human-readable text
                                textxalign: "center", // Always good to set this
                                paddingheight: 10,
                                paddingwidth: 10,
                                backgroundcolor: "FFFFFF",
                              },
                              function (err, png) {
                                if (err) {
                                  // console.log(err)
                                } else {
                                  var file =
                                    config.sample_path + sample.id + ".png";
                                  // console.log(uzorak)

                                  fs.writeFile(
                                    file,
                                    png.toString("base64"),
                                    {
                                      encoding: "base64",
                                    },
                                    function (err) {
                                      if (err) {
                                        // console.log(err)
                                      } else {
                                        rezultat.created_at = new Date(
                                          new Date().getTime() -
                                            new Date().getTimezoneOffset() *
                                              60000
                                        );

                                        rezultat.updated_at = new Date(
                                          new Date().getTime() -
                                            new Date().getTimezoneOffset() *
                                              60000
                                        );
                                        rezultat.sample = sample;

                                        // Partneri - Pošiljaoc, Naručioc i Izvršioc
                                        rezultat.narucioc = req.body.narucioc;
                                        rezultat.posiljaoc = req.body.posiljaoc;

                                        // rezultat.popust = req.body.posiljaocPopust;

                                        rezultat.id = sample.id;
                                        if (
                                          req.body.protokol !== undefined &&
                                          req.body.protokol !== null
                                        ) {
                                          rezultat.protokol = req.body.protokol;
                                        } else {
                                          rezultat.protokol = uzorakFront.pid;
                                        }
                                        rezultat.patient = sample.patient;

                                        if (req.body.klijent != null) {
                                          rezultat.customer =
                                            mongoose.Types.ObjectId(
                                              req.body.klijent._id
                                            );
                                        }

                                        rezultat.status = "U OBRADI";

                                        if (req.body.pid != "") {
                                          req.body.complete.forEach(
                                            (element) => {
                                              if (element.pid == req.body.pid) {
                                                rezultat.timestamp =
                                                  element.timestamp;
                                              }
                                            }
                                          );
                                        } else {
                                          rezultat.timestamp =
                                            req.body.timestamp;
                                        }

                                        rezultat.created_by =
                                          req.body.decoded.user;

                                        rezultat.protokol =
                                          req.body.BrojProtokola;

                                        rezultat.site = req.body.site;
                                        var newresult = new Results(rezultat);
                                        newresult.save(function (err, result) {
                                          // console.log("Save.")
                                          // Update Racuni Collection

                                          if (err) {
                                            res.json({
                                              success: false,
                                              message: err,
                                            });
                                          } else {
                                            uzorcicount++;
                                            data.push({
                                              jmbg: req.body.uzorci[0].patient
                                                .jmbg,
                                              spol: req.body.uzorci[0].patient
                                                .spol,
                                              code: sample.code,
                                              sid: result.id,
                                              pid: sample.pid,
                                              patient: imeIprezime,
                                              godiste: godiste,
                                              datum: sample.datum,
                                              created_at: sample.created_at,
                                              prioritet: sample.prioritet,
                                              link: (link =
                                                config.barURL +
                                                "images/barcodes/" +
                                                result.id +
                                                ".png"),
                                              uzorci: result.rezultati,
                                            });
                                            if (
                                              uzorcicount ===
                                              req.body.uzorci.length
                                            ) {
                                              // BEGIN

                                              // console.log(sample.timestamp)

                                              Racuni.findOne({
                                                site: mongoose.Types.ObjectId(
                                                  req.body.site
                                                ),
                                                timestamp: sample.timestamp,
                                              }).exec(function (err, racun) {
                                                if (err) {
                                                  console.log("Greška:", err);
                                                  res.json({
                                                    success: false,
                                                    message: err,
                                                  });
                                                } else {
                                                  if (racun) {
                                                    racun.valid = false;

                                                    racun.updated_at = new Date(
                                                      new Date().getTime() -
                                                        new Date().getTimezoneOffset() *
                                                          60000
                                                    );

                                                    // created_by

                                                    racun.updated_by =
                                                      req.body.decoded.user;

                                                    racun.save(function (err) {
                                                      if (err) {
                                                        console.log(
                                                          "Greška:",
                                                          err
                                                        );
                                                        res.json({
                                                          success: false,
                                                          message: err,
                                                        });
                                                      } else {
                                                        res.json({
                                                          success: true,
                                                          message:
                                                            "Uzorci uspješno sačuvani",
                                                          data,
                                                        });
                                                      }
                                                    });
                                                  } else {
                                                    res.json({
                                                      success: true,
                                                      message:
                                                        "Uzorci uspješno sačuvani",
                                                      data,
                                                    });
                                                  }
                                                }
                                              });

                                              // END
                                            }
                                          }
                                        });
                                      }
                                    }
                                  );
                                }
                              }
                            );

                            // +++++++++++++++++++++++++
                          }
                        }
                      }
                    });
                });

                // +++++++++++++++++++ REZULTAT ++++++++++++++++++++
              }
            });
          });
        }
      });
  }
};

module.exports = sampleController;
