var mongoose = require("mongoose");
var Samples = mongoose.model("Samples");
var Results = mongoose.model("Results");
const config = require("../config/index");
const fs = require("fs");
const net = require("net");

var odobravanjeController = {};

// OdobravanjeController.js

odobravanjeController.getPID = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var datum = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .substring(0, 10);

    var from = new Date(datum + "T00:00:00Z");
    var to = new Date(datum + "T23:59:59Z");

    var uslov = {};

    uslov = {
      created_at: {
        $gt: new Date(from.setHours(2)),
        $lt: new Date(to.setHours(25, 59, 59)),
      },
      site: mongoose.Types.ObjectId(req.query.site),
    };

    Samples.find(uslov)
      .lean()
      .exec(function (err, uzorci) {
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (uzorci.length) {
            var pids = [""];
            var total = ["0"];
            var complete = [];

            uzorci.forEach((uzorak) => {
              total.push(uzorak.pid);
              if (uzorak.patient == req.query.patient) {
                pids.push(uzorak.pid);
                complete.push({ pid: uzorak.pid, timestamp: uzorak.timestamp });
              }
            });

            total.sort(function (a, b) {
              return a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            });

            pids.sort(function (a, b) {
              return a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            });

            uniq = [...new Set(pids)];
            all_pids = [...new Set(total)];

            res.json({
              success: true,
              message: "Success.",
              pids: uniq,
              all_pids: all_pids,
              complete: complete,
            });
          } else {
            res.json({
              success: false,
              message: "Nema podataka.",
              pids: [""],
              all_pids: ["0"],
              complete: [],
            });
          }
        }
      });
  }
};

odobravanjeController.EvaluationSingle = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.find({
      patient: mongoose.Types.ObjectId(req.query.patient),
      site: mongoose.Types.ObjectId(req.query.site),
    })
      .populate("patient")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (results.length) {
            var count = 0;
            var Results = [];

            results.forEach((element) => {
              count++;
              if (element.verificiran) {
                Results.push(element);
              }

              if (count == results.length) {
                res.json({
                  success: true,
                  message: "Success.",
                  Results,
                });
              }
            });
          } else {
            var Results = [];
            res.json({
              success: false,
              message: "Nema podataka.",
              Results,
            });
          }
        }
      });
  }
};

odobravanjeController.LabAssayEvalSingle = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var datum = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .substring(0, 10);

    var datum14 = JSON.stringify(
      new Date(new Date().setDate(new Date().getDate() - 14))
    ).substring(1, 11);

    var from = new Date(datum + "T00:00:00Z");
    var to = new Date(datum + "T23:59:59Z");

    switch (req.query.range) {
      case "7":
        datum = JSON.stringify(
          new Date(new Date().setDate(new Date().getDate() - 1))
        ).substring(1, 11);

        from = new Date(datum14 + "T00:00:00");
        to = new Date(datum + "T23:59:59");

        break;

      case "14":
        from = new Date(datum14 + "T00:00:00");
        to = new Date(datum + "T23:59:59");

        break;

      default:
        from = new Date(datum + "T00:00:00");
        to = new Date(datum + "T23:59:59");

        break;
    }

    var uslov = {};

    uslov = {
      created_at: {
        $gt: new Date(from.setHours(2)),
        $lt: new Date(to.setHours(25, 59, 59)),
      },
      site: mongoose.Types.ObjectId(req.query.site),
    };

    Results.find(uslov)
      .populate("patient")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (results.length) {
            var count = 0;
            var Results = [];

            results.forEach((element) => {
              count++;
              if (element.verificiran) {
                Results.push(element);
              }

              if (count == results.length) {
                res.json({
                  success: true,
                  message: "Success.",
                  Results,
                });
              }
            });
          } else {
            var Results = [];
            res.json({
              success: false,
              message: "Nema podataka.",
              Results,
            });
          }
        }
      });
  }
};

odobravanjeController.EvaluationMulti = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.find({
      patient: mongoose.Types.ObjectId(req.query.patient),
      site: mongoose.Types.ObjectId(req.query.site),
    })
      .populate("patient")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (results.length) {
            var count = 0;
            var Multi = [];

            results.forEach((element) => {
              count++;
              element.rezultati.forEach((rez) => {
                if (
                  rez.labassay == req.query.labassay &&
                  element.verificiran &&
                  rez.rezultat[rez.rezultat.length - 1].rezultat_f.trim() != ""
                ) {
                  var obj = {
                    rezultat: [],
                    multi: [],
                  };
                  obj.rezultat = rez;

                  element.multi.forEach((multi) => {
                    if (multi[0].labtest == req.query.labassay) {
                      obj.multi = multi;
                    }
                  });

                  Multi.push(obj);
                }
              });

              if (count == results.length) {
                res.json({
                  success: true,
                  message: "Success.",
                  Multi,
                });
              }
            });
          } else {
            var Multi = [];
            res.json({
              success: false,
              message: "Nema podataka.",
              Multi,
            });
          }
        }
      });
  }
};

odobravanjeController.LabAssayEvalMulti = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var datum = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .substring(0, 10);

    var datum14 = JSON.stringify(
      new Date(new Date().setDate(new Date().getDate() - 14))
    ).substring(1, 11);

    var from = new Date(datum + "T00:00:00Z");
    var to = new Date(datum + "T23:59:59Z");

    switch (req.query.range) {
      case "7":
        datum = JSON.stringify(
          new Date(new Date().setDate(new Date().getDate() - 1))
        ).substring(1, 11);

        from = new Date(datum14 + "T00:00:00");
        to = new Date(datum + "T23:59:59");

        break;

      case "14":
        from = new Date(datum14 + "T00:00:00");
        to = new Date(datum + "T23:59:59");

        break;

      default:
        from = new Date(datum + "T00:00:00");
        to = new Date(datum + "T23:59:59");

        break;
    }

    var uslov = {};

    uslov = {
      created_at: {
        $gt: new Date(from.setHours(2)),
        $lt: new Date(to.setHours(25, 59, 59)),
      },
      site: mongoose.Types.ObjectId(req.query.site),
    };

    Results.find(uslov)
      .populate("patient")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (results.length) {
            var count = 0;
            var Multi = [];

            results.forEach((element) => {
              count++;
              element.rezultati.forEach((rez) => {
                if (
                  rez.labassay == req.query.labassay &&
                  element.verificiran &&
                  rez.rezultat[rez.rezultat.length - 1].rezultat_f.trim() != ""
                ) {
                  var obj = {
                    rezultat: [],
                    multi: [],
                  };
                  obj.rezultat = rez;

                  element.multi.forEach((multi) => {
                    if (multi[0].labtest == req.query.labassay) {
                      obj.multi = multi;
                    }
                  });

                  Multi.push(obj);
                }
              });

              if (count == results.length) {
                res.json({
                  success: true,
                  message: "Success.",
                  Multi,
                });
              }
            });
          } else {
            var Multi = [];
            res.json({
              success: false,
              message: "Nema podataka.",
              Multi,
            });
          }
        }
      });
  }
};

odobravanjeController.GetAnalysers = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    AnaAssays.find({
      test: mongoose.Types.ObjectId(req.query.test),
    })
      .populate("aparat test site")
      .exec(function (err, anaassays) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          res.json({
            success: true,
            message: "Success.",
            anaassays,
          });
        }
      });
  }
};

odobravanjeController.PreviousNext = function (req, res) {
  function Unique(arr, key = "pid") {
    const map = new Map();
    arr.map((el) => {
      if (!map.has(el[key])) {
        map.set(el[key], el);
      }
    });
    return [...map.values()];
  }

  from = new Date(req.query.date.substring(0, 10) + "T00:00:00");
  to = new Date(req.query.date.substring(0, 10) + "T23:59:59");

  var uslov = {};

  uslov = {
    created_at: {
      $gt: new Date(from.setHours(2)),
      $lt: new Date(to.setHours(25, 59, 59)),
    },
    site: mongoose.Types.ObjectId(req.query.site),
  };

  // console.log(uslov)
  // console.log(req.query.pid)

  Results.find(uslov)
    .populate("sample patient")
    .sort({
      created_at: 1,
    })
    .exec(function (err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultati.length) {
          var Rezultati = [];
          var Length = [];
          rezultati.forEach((element) => {
            Length.push({
              pid: element.sample.pid,
              patient: element.patient._id,
              date: element.created_at,
            });

            if (
              !Rezultati.filter(
                (rezultat) =>
                  rezultat.id === element.sample.pid &&
                  JSON.stringify(rezultat.date).substring(1, 11) ===
                    JSON.stringify(element.created_at).substring(1, 11)
              ).length > 0
            ) {
              if (
                req.query.pid == element.sample.pid &&
                req.query.date.substring(0, 10) ==
                  JSON.stringify(element.created_at).substring(1, 11)
              ) {
                Rezultati.push({
                  pid: element.sample.pid,
                  patient: element.patient._id,
                  date: element.created_at,
                });
              }
            }
          });

          var json = {};
          json.data = {};
          json.rezultati = Unique(Length);
          json.data = Unique(Rezultati)[0];
          res.json(json);
        } else {
          res.json({
            success: false,
            message: "Nema pronađenih rezultata",
          });
        }
      }
    });
};

odobravanjeController.GetAllResults = function (req, res) {
  Results.findOne({
    id: req.body.id,
  })
    .populate("rezultati.labassay rezultati.rezultat.anaassay")
    .exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        if (rezultat) {
          rezultat.rezultati.forEach((element) => {
            if (
              element.labassay.equals(
                mongoose.Types.ObjectId(req.body.labassay)
              )
            ) {
              var i = 0;
              var duzina = element.rezultat.length;
              element.rezultat.forEach((rez) => {
                Analyser.findOne({
                  _id: mongoose.Types.ObjectId(rez.anaassay.aparat),
                }).exec(function (err, aparat) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err,
                    });
                  } else {
                    rez.anaassay.aparat = aparat;
                    i++;
                    if (duzina === i) {
                      res.json({
                        success: true,
                        message: "Rezultati u prilogu.",
                        element,
                      });
                    }
                  }
                });
              });
            }
          });
        }
      }
    });
};

odobravanjeController.ChooseResult = function (req, res) {
  Results.findOne({
    id: req.body.id,
  })
    .populate("patient rezultati.labassay rezultati.rezultat.anaassay")
    .exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        var noviRezultati = [];
        var test = {};
        var Audit_Rez = new Audit_Rezultati({
          id: rezultat.id,
          rezultati: rezultat.rezultati,
        });
        Audit_Rez.save();
        if (rezultat) {
          rezultat.rezultati.forEach((result) => {
            if (
              result.labassay.equals(mongoose.Types.ObjectId(req.body.labassay))
            ) {
              result.rezultat.forEach((element) => {
                if (
                  element._id.equals(mongoose.Types.ObjectId(req.body.picked))
                ) {
                  test = element;
                  test.updated_by = req.body.decoded.user;
                  test.updated_at = Date.now();
                } else {
                  noviRezultati.push(element);
                }
              });
              noviRezultati.push(test);
              result.rezultat = noviRezultati;
              rezultat.save(function (err, rez) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  res.json({
                    success: true,
                    message: "Rezultati sortirani.",
                    rez,
                  });
                }
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Rezultat nije pronađen.",
          });
        }
      }
    });
};

odobravanjeController.ChooseMulti = function (req, res) {
  console.log("odobravanjeController.ChooseMulti = function(req, res) {");
  res.json({
    success: true,
    message: "Success.",
  });

  // Results.findOne({
  //   id: req.body.id
  // })
  //   .populate("sample")
  //   .exec(function(err, rezultat) {
  //     if (err) {
  //       console.log("Greška:", err);
  //     } else {
  //       if (rezultat) {
  //         var temp = "";
  //         var k = 1;
  //         var mlength = 0;

  //         rezultat.multi.forEach(instance => {
  //           k = 0;
  //           instance.forEach(multirez => {
  //             k++;
  //             if (
  //               multirez.labtest.equals(mongoose.Types.ObjectId(req.body.test))
  //             ) {
  //               for (i = 0; i < multirez.rezultat.length; i++) {
  //                 if (i === parseInt(req.body.izbor)) {
  //                   temp = multirez.rezultat[0].rezultat_f;
  //                   tempvp = multirez.rezultat[0].vrijeme_prijenosa;
  //                   tempvr = multirez.rezultat[0].vrijeme_rezultata;
  //                   multirez.rezultat[0].rezultat_f =
  //                     multirez.rezultat[i].rezultat_f;
  //                   multirez.rezultat[0].vrijeme_prijenosa =
  //                     multirez.rezultat[i].vrijeme_prijenosa;
  //                   multirez.rezultat[0].vrijeme_rezultata =
  //                     multirez.rezultat[i].vrijeme_rezultata;
  //                   multirez.rezultat[i].rezultat_f = temp;
  //                   multirez.rezultat[i].vrijeme_prijenosa = tempvp;
  //                   multirez.rezultat[i].vrijeme_rezultata = tempvr;
  //                 }
  //               }
  //             }
  //             mlength = instance.length;
  //           });

  //           if (k === mlength) {
  //             var novi = new Results(rezultat);
  //             novi.save();
  //           }
  //         });
  //         res.json({
  //           success: true,
  //           message: "Rezultati sortirani."
  //         });
  //       } else {
  //         res.json({
  //           success: true,
  //           message: "Rezultat nije pronađen."
  //         });
  //       }
  //     }
  //   });
};

// Set References, Salko Islamović (15.04.2019)
odobravanjeController.SetReferences = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    // console.log(req.body.analyser._id);
    // console.log(req.body.analiza.labassay_id);
    AnaAssays.findOne({
      aparat: mongoose.Types.ObjectId(req.body.analyser._id),
      test: mongoose.Types.ObjectId(req.body.analiza.labassay_id),
    })
      .populate("test")
      .exec(function (err, anaassay) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (anaassay) {
            var reference = require("../funkcije/shared/set_references");
            var starost = require("../funkcije/shared/starostReferentne");
            let age = starost.get(req.body.pacijent.jmbg);
            // console.log("Starost pacijenta: " + age);

            let set = {};

            anaassay.reference = anaassay.reference.sort(function (a, b) {
              return a.dDob.localeCompare(b.dDob, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            });

            Results.findOne({
              id: req.body.id,
              site: req.body.site,
            }).exec(function (err, result) {
              if (err) {
                console.log("Greška:", err);
              } else {
                if (result) {
                  result.rezultati.forEach((element) => {
                    if (
                      JSON.stringify(element.labassay) ===
                      JSON.stringify(req.body.analiza.labassay_id)
                    ) {
                      element.rezultat[
                        element.rezultat.length - 1
                      ].anaassay = mongoose.Types.ObjectId(anaassay._id);

                      anaassay.reference.forEach((ref) => {
                        set = reference.get(
                          anaassay.test.naziv,
                          "",
                          ref.grupa,
                          ref.spol,
                          req.body.pacijent.spol,
                          ref.refd,
                          ref.refg,
                          ref.interp,
                          ref.extend,
                          "",
                          "",
                          "",
                          "",
                          "",
                          age,
                          ref.dDob,
                          ref.gDob,
                          req.body.pacijent.jmbg
                        );
                        // console.log("Kod Analize: " + anaassay.kod);
                        // console.log(set);

                        if (set.hasOwnProperty("grupa")) {
                          element.interp = set.interp;
                          element.extend = set.extend;
                          element.refd = set.refd;
                          element.refg = set.refg;
                        }
                      });
                    }
                  });
                  result.updated_at = Date.now();
                  result.updated_by = req.body.decoded.user;

                  result.save(function (err) {
                    if (err) {
                      console.log("Greška:", err);
                      res.json({
                        success: false,
                        message: err,
                      });
                    } else {
                      res.json({
                        success: true,
                        rezultat: result,
                        message: "Success.",
                      });
                    }
                  });
                } else {
                  res.json({
                    success: false,
                    message: "Rezultat nije pronađen.",
                  });
                }
              }
            });
          } else {
            res.json({
              success: false,
              message: "Assay nije pronađen.",
            });
          }
        }
      });
  }
}; // End of Set References

odobravanjeController.GetSamples = function (req, res) {
  // console.log(">> odobravanjeController.GetSamples = function(req, res) {");
  var datum = JSON.stringify(req.query.date).substring(1, 11);

  from = datum + "T00:00:00";
  from = new Date(from + "Z");
  to = datum + "T23:59:59";
  to = new Date(to + "Z");

  var uslov = {};

  uslov = {
    created_at: {
      $gt: from,
      $lt: to,
    },
    site: mongoose.Types.ObjectId(req.query.site),
    patient: mongoose.Types.ObjectId(req.params.patient),
  };

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.find(uslov)
      .populate("patient sample rezultati.labassay rezultati.rezultat.anaassay")
      .lean()
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (results.length) {
            results = results.filter(function (rezultat) {
              return rezultat.sample.pid === req.params.id;
            });

            Lokacija.findOne({
              _id: mongoose.Types.ObjectId(results[0].sample.lokacija),
            }).exec(function (err, lokacija) {
              if (err) {
                console.log("Greška:", err);
              } else {
                if (!lokacija) {
                  res.json({
                    success: false,
                    message: "Lokacija nije pronađena.",
                  });
                } else {
                  var pdf = config.nalaz_path + "samples/";
                  let final_pdf =
                    config.nalaz_path + results[0].timestamp + ".pdf";
                  let final = false;

                  results.forEach((element) => {
                    let file = pdf + element.id + ".pdf";

                    try {
                      if (fs.existsSync(file)) {
                        element.pdf_exists = true;
                      } else {
                        element.pdf_exists = false;
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  });

                  try {
                    if (fs.existsSync(final_pdf)) {
                      final = true;
                    } else {
                      final = false;
                    }
                  } catch (err) {
                    console.error(err);
                  }

                  res.json({
                    success: true,
                    message: "Rezultati za pacijenta pronađeni.",
                    results: results,
                    lokacija: lokacija,
                    final_pdf: final,
                  });
                }
              }
            });
          } else {
            res.json({
              success: false,
              message: "Rezultati nisu pronađeni.",
            });
          }
        }
      });
  }
};

// Status nalaza, Salko Islamović (18.03.2019)
odobravanjeController.StatusNalaza = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    // Audit_Nalazi
    // Izmjena vremena izdavanja nalaza, nakon Verifikacije

    Nalazi.findOne({
      timestamp: req.body.timestamp,
      location: req.body.location,
      naziv: req.body.naziv,
    }).exec(function (err, nalaz) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (nalaz) {
          nalaz.status = req.body.status;

          // nalaz.created_at = new Date(
          //   new Date().getTime() - new Date().getTimezoneOffset() * 60000
          // );

          nalaz.updated_at = new Date(
            new Date().getTime() - new Date().getTimezoneOffset() * 60000
          );

          // nalaz.created_by = req.body.decoded.user;
          nalaz.updated_by = req.body.decoded.user;

          nalaz.save(function (err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err,
              });
            } else {
              res.json({
                success: true,
                message: "Status nalaza uspješno izmjenjen.",
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Nalaz nije pronađen.",
          });
        }
      }
    });
  }
}; // End of Status nalaza

// Obrada, Salko Islamović (13.03.2019)
odobravanjeController.verifikacija = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.findOne({
      id: req.params.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          rezultat.verificiran = req.body.verify;
          rezultat.save();
          res.json({
            success: true,
            message: "Ok!",
          });
        } else {
          res.json({
            success: false,
            message: "Greška.",
          });
        }
      }
    });
  }
};
// End of Obrada

odobravanjeController.OdobriSve = function (req, res) {
  var kompletiran = true;

  Results.findOne({
    id: req.params.id,
  }).exec(function (err, rezultat) {
    if (err) {
      console.log("Greška:", err);
    } else {
      var audit = {};
      audit.id = rezultat.id;
      audit.rezultati = rezultat.rezultati;
      var Audit_Rez = new Audit_Rezultati(audit);
      Audit_Rez.save();

      var i = 0;
      var j = 0;

      rezultat.rezultati.forEach((test) => {
        test.rezultat.forEach((element) => {
          element.odobren = true;
          element.odobren_by = req.body.decoded.user;
          element.odobren_at = Date.now();
          element.updated_by = req.body.decoded.user;
          element.updated_at = Date.now();
        });
        i++;
        test.status = "ODOBREN";
        test.retest = false;
      });

      if (i === rezultat.rezultati.length) {
        rezultat.rezultati.forEach((test) => {
          if (test.status != "ODOBREN") {
            kompletiran = false;
          }
          j++;
        });
      }

      if (
        i === rezultat.rezultati.length &&
        kompletiran &&
        j === rezultat.rezultati.length
      ) {
        Samples.findOne({
          id: rezultat.id,
        })
          .populate("tests.labassay")
          .exec(function (err, uzorak) {
            if (err) {
              console.log("Greška:", err);
            } else {
              uzorak.status = "ODOBREN";

              var io = req.app.get("socketio");
              // io.emit('odobren', rezultat.id, rezultat.site, uzorak.tests[0].labassay.sekcija)

              uzorak.tests.forEach((element) => {
                element.status_r = false;
                element.status_t = "ODOBREN";
              });

              rezultat.status = "ODOBREN";

              uzorak.save(function (err) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err,
                  });
                } else {
                  rezultat.save();
                  res.json({
                    success: true,
                    message: "Uzorak odobren.",
                  });
                }
              });
            }
          });
      }
    }
  });
};

odobravanjeController.UkloniOdobrenje = function (req, res) {
  var kompletiran = true;

  var zaprimljen = 0;
  var realizovan = 0;

  Results.findOne({
    id: req.params.id,
  }).exec(function (err, rezultat) {
    if (err) {
      console.log("Greška:", err);
    } else {
      var audit = {};
      audit.id = rezultat.id;
      audit.rezultati = rezultat.rezultati;
      var Audit_Rez = new Audit_Rezultati(audit);
      Audit_Rez.save();

      var i = 0;
      var j = 0;

      rezultat.rezultati.forEach((test) => {
        test.rezultat.forEach((element) => {
          element.odobren = false;
          element.odobren_by = req.body.decoded.user;
          element.odobren_at = Date.now();
          element.updated_by = req.body.decoded.user;
          element.updated_at = Date.now();

          if (element.rezultat_f === "") {
            zaprimljen++;
            test.status = "ZAPRIMLJEN";
          }
          if (element.rezultat_f != "") {
            realizovan++;
            test.status = "REALIZOVAN";
          }
        });
        i++;
      });

      if (i === rezultat.rezultati.length) {
        rezultat.rezultati.forEach((test) => {
          if (test.status === "ODOBREN") {
            kompletiran = false;
          }
          j++;
        });
      }

      if (
        i === rezultat.rezultati.length &&
        kompletiran &&
        j === rezultat.rezultati.length
      ) {
        Samples.findOne({
          id: rezultat.id,
        })
          .populate("tests.labassay")
          .exec(function (err, uzorak) {
            if (err) {
              console.log("Greška:", err);
            } else {
              if (realizovan < 1) {
                uzorak.status = "ZAPRIMLJEN";
                rezultat.status = "ZAPRIMLJEN";
              }
              if (zaprimljen < 1) {
                uzorak.status = "REALIZOVAN";
                rezultat.status = "REALIZOVAN";
              }
              if (zaprimljen > 0 && realizovan > 0) {
                uzorak.status = "U OBRADI";
                rezultat.status = "U OBRADI";
              }

              var io = req.app.get("socketio");
              // io.emit('odobren', rezultat.id, rezultat.site, uzorak.tests[0].labassay.sekcija)

              uzorak.tests.forEach((element) => {
                element.status_r = false;
                element.status_t = "REALIZOVAN";
              });

              uzorak.save(function (err) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err,
                  });
                } else {
                  rezultat.save();
                  res.json({
                    success: true,
                    message: "Uzorak odobren.",
                  });
                }
              });
            }
          });
      }
    }
  });
};

odobravanjeController.RetestActivate = function (req, res) {
  console.log("Retest Activate");
  Results.findOne({
    id: req.body.id_u,
  })
    .populate("patient rezultati.labassay rezultati.rezultat.anaassay")
    .exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        rezultat.rezultati.forEach((test) => {
          if (req.body.id_t === test.labassay.sifra) {
            test.retest = true;
          }
        });
        Samples.findOne({
          id: req.body.id_u,
        })
          .populate("tests.labassay")
          .exec(function (err, uzorak) {
            if (err) {
              console.log("Greška:", err);
            } else {
              uzorak.tests.forEach((element) => {
                if (element.labassay.sifra === req.body.id_t) {
                  element.status_r = true;
                  console.log("aktiviran retest:" + req.body.id_t);
                }
              });
              uzorak.save();
              rezultat.save();

              res.json({
                success: true,
                message: "Retest activated.",
              });
            }
          });
      }
    });
};

odobravanjeController.RetestDeactivate = function (req, res) {
  Results.findOne({
    id: req.body.id_u,
  })
    .populate("patient rezultati.labassay rezultati.rezultat.anaassay")
    .exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        rezultat.rezultati.forEach((test) => {
          if (req.body.id_t === test.labassay.sifra) {
            test.retest = false;
          }
        });
        Samples.findOne({
          id: req.body.id_u,
        })
          .populate("tests.labassay")
          .exec(function (err, uzorak) {
            if (err) {
              console.log("Greška:", err);
            } else {
              uzorak.tests.forEach((element) => {
                if (element.labassay.sifra === req.body.id_t) {
                  element.status_r = false;
                }
              });
              uzorak.save();
              rezultat.save();

              res.json({
                success: true,
                message: "Retest deactivated.",
              });
            }
          });
      }
    });
};

odobravanjeController.RetestSave = function (req, res) {
  Results.findOne({
    id: req.body.sid,
  })
    .populate("patient rezultati.labassay rezultati.rezultat.anaassay")
    .exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        req.body.rezultati.forEach((rez) => {
          rezultat.rezultati.forEach((test) => {
            if (rez.test === test.labassay.sifra) {
              test.retest = rez.retest;
              // console.log("r - " + rez.ime + " / " + rez.retest)
            }
          });
        });

        Samples.findOne({
          id: req.body.sid,
        })
          .populate("tests.labassay")
          .exec(function (err, uzorak) {
            if (err) {
              console.log("Greška:", err);
            } else {
              req.body.rezultati.forEach((rez) => {
                uzorak.tests.forEach((element) => {
                  if (element.labassay.sifra === rez.test) {
                    element.status_r = rez.retest;
                    // console.log("s - " + rez.ime + " / " + rez.retest)
                  }
                });
              });

              uzorak.save();
              rezultat.save();

              res.json({
                success: true,
                message: "Retest saved.",
              });
            }
          });
      }
    });
};

odobravanjeController.Calculate = function (req, res) {
  // console.log("odobravanjeController.Calculate");
  // console.log(req.params.id);

  var query = req.params.id.slice(-5);
  var realizovano = true;
  var formula = [];
  var final = "";

  if (req.body.ime.includes("OGTT -") || req.body.ime.includes("Insulin -")) {
    // console.log(req.body.ime);
    query = req.params.id;
  }

  Results.find({
    id: {
      $regex: query,
    },
  })
    .populate("rezultati.labassay sample patient")
    .exec(function (err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultati.length) {
          LabAssays.findOne({
            _id: req.body._id,
          }).exec(function (err, labassay) {
            if (err) {
              console.log("Greška:", err);
            } else {
              if (labassay) {
                labassay.calculatedTests.forEach((kalkulirani) => {
                  rezultati.forEach((rezultat) => {
                    if (req.body.pid === rezultat.sample.pid) {
                      rezultat.rezultati.forEach((result) => {
                        if (
                          result.labassay.equals(
                            mongoose.Types.ObjectId(kalkulirani.labassay)
                          )
                        ) {
                          formula = labassay.calculatedFormula;
                        }
                      });
                    }
                  });
                });

                formula.forEach((clan, i, array) => {
                  if (clan.length > 20) {
                    rezultati.forEach((result) => {
                      if (req.body.pid === result.sample.pid) {
                        result.rezultati.forEach((element) => {
                          if (
                            element.labassay._id.equals(
                              mongoose.Types.ObjectId(clan)
                            )
                          ) {
                            array[i] =
                              element.rezultat[
                                element.rezultat.length - 1
                              ].rezultat_f;
                          }
                        });
                      }
                    });
                  }
                });

                final = "";
                var count = 0;
                realizovano = true;

                formula.forEach((broj) => {
                  count++;
                  final += broj;
                  if (broj.length > 20 || broj === "") {
                    realizovano = false;
                  }
                });

                if (realizovano && count === formula.length) {
                  // console.log(final);
                  AnaAssays.findOne({
                    test: req.body._id,
                    site: mongoose.Types.ObjectId(req.body.site),
                  })
                    .populate("aparat")
                    .exec(function (err, testap) {
                      if (err) {
                        console.log("Greška:", err);
                      } else {
                        var greska = false;

                        try {
                          eval(final);
                        } catch (err) {
                          greska = true;
                        } finally {
                          if (!greska) {
                            // console.log(final);
                            if (eval(final).toString().includes(".")) {
                              var calculated = eval(final).toFixed(2);
                            } else {
                              var calculated = eval(final);
                            }

                            rezultati.forEach((rezultat) => {
                              if (req.body.pid === rezultat.sample.pid) {
                                rezultat.rezultati.forEach((result) => {
                                  if (
                                    result.labassay.equals(
                                      mongoose.Types.ObjectId(req.body._id)
                                    )
                                  ) {
                                    result.rezultat.push({
                                      anaassay: testap._id,
                                      rezultat_f: calculated,
                                      rezultat_m: [],
                                      jedinice_f: labassay.jedinica,
                                      vrijeme_prijenosa: Date.now(),
                                      vrijeme_rezultata: Date.now(),
                                      odobren: false,
                                      sn: testap.aparat.sn,
                                      dilucija: "n/a",
                                      module_sn: "n/a",
                                      reagens_lot: "n/a",
                                      reagens_sn: "n/a",
                                      rezultat_p: "",
                                      jedinice_p: "",
                                      rezultat_i: "",
                                      odobren_by: "",
                                      odobren_at: null,
                                      created_at: Date.now(),
                                      updated_at: null,
                                      created_by: req.body.decoded.user,
                                      updated_by: null,
                                    });

                                    rezultat.save(function (err) {
                                      if (err) {
                                        console.log("Greška:", err);
                                        res.json({
                                          success: false,
                                          message: err,
                                        });
                                      } else {
                                        res.json({
                                          success: true,
                                          message: "Calculated...",
                                        });
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          } else {
                            res.json({
                              success: false,
                              message: "Greška...",
                            });
                          }
                        }
                      }
                    });
                }
              }
            }
          });
        }
      }
    });
};

odobravanjeController.SacuvajRezultate = function (req, res) {
  Results.findOne({
    id: req.params.id,
  }).exec(function (err, rezultat) {
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

        rezultat.rezultati.forEach((element) => {
          req.body.rezultati.forEach((rez) => {
            if (element._id.equals(mongoose.Types.ObjectId(rez.IDE))) {
              element.rezultat.forEach((test) => {
                if (test._id.equals(mongoose.Types.ObjectId(rez.id))) {
                  test.rezultat_f = rez.rezultat;
                  // console.log(rez.rezultat_m)
                  test.rezultat_m = rez.rezultat_m;
                  element.status = "REALIZOVAN";
                }
              });
            }
          });
        });

        Samples.findOne({
          id: req.params.id,
        })
          .populate("tests.labassay")
          .exec(function (err, sample) {
            if (err) {
              console.log("Greška:", err);
            } else {
              sample.tests.forEach((element) => {
                req.body.rezultati.forEach((rez) => {
                  if (
                    element.labassay.equals(
                      mongoose.Types.ObjectId(rez.laIDE)
                    ) &&
                    rez.rezultat != ""
                  ) {
                    element.status_t = "REALIZOVAN";
                  }
                });
              });
              sample.save();
            }
          });
        rezultat.save(function (err) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err,
            });
          } else {
            res.json({
              success: true,
              message: "Rezultati sačuvani.",
            });
          }
        });
      } else {
        res.json({
          success: true,
          message: "Nije pronadjen rezultat",
        });
      }
    }
  });
};

odobravanjeController.SacuvajAnalite = function (req, res) {
  Results.findOne({
    id: req.params.id,
  })
    .populate("sample")
    .exec(function (err, rezultat) {
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

          var i = 0;
          var j = 0;
          var empty = true;

          rezultat.multi.forEach((instance) => {
            i++;
            instance.forEach((multirez) => {
              req.body.analiti.forEach((analit) => {
                if (
                  multirez.labtest.equals(
                    mongoose.Types.ObjectId(analit.labID)
                  ) &&
                  multirez.labassay.equals(
                    mongoose.Types.ObjectId(analit.analit)
                  )
                ) {
                  multirez.rezultat[0].rezultat_f = analit.rezultat;
                  multirez.rezultat[0].updated_at = Date.now();
                  multirez.rezultat[0].updated_by = req.body.decoded.user;
                  if (analit.rezultat != "") {
                    empty = false;
                  }
                }
              });
            });
          });

          if (i === rezultat.multi.length) {
            rezultat.rezultati.forEach((element) => {
              j++;
              if (
                element.labassay.equals(
                  mongoose.Types.ObjectId(req.body.analiti[0].labID)
                )
              ) {
                if (empty) {
                  element.rezultat[0].rezultat_f = "";
                } else {
                  element.rezultat[0].rezultat_f = "0";
                }
              }
            });
          }

          if (i === rezultat.multi.length && j === rezultat.rezultati.length) {
            var novi = new Results(rezultat);
            novi.save();
          }

          res.json({
            success: true,
            message: "Analiti sačuvani.",
            sekcija: rezultat.sample.sekcija,
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronađen rezultat.",
          });
        }
      }
    });
};

odobravanjeController.GetBarcodes = function (req, res) {
  // console.log("barcodes route");
  // console.log(req.query);
  // console.log(req.params);

  var datum = req.query.date.split("-");
  datum = datum[2] + "-" + datum[1] + "-" + datum[0];

  from = datum + "T00:00:00";
  from = new Date(from + "Z");
  to = datum + "T23:59:59";
  to = new Date(to + "Z");

  var uslov = {};
  uslov = {
    created_at: {
      $gt: from,
      $lt: to,
    },
    site: mongoose.Types.ObjectId(req.query.site),
    id: req.params.patient,
  };

  Results.find(uslov)
    .populate("patient sample rezultati.labassay rezultati.rezultat.anaassay")
    .lean()
    .exec(function (err, results) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (results.length) {
          results = results.filter(function (rezultat) {
            return rezultat.sample.pid === req.params.id;
          });
          res.json({
            success: true,
            message: "Rezultati za pacijenta pronađeni.",
            results: results,
          });
        } else {
          res.json({
            success: false,
            message: "Rezultati nisu pronađeni.",
          });
        }
      }
    });
};

odobravanjeController.Reference = function (req, res) {
  Results.findOne({
    id: req.body.reference.sample,
  }).exec(function (err, rezultat) {
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

        rezultat.rezultati.forEach((element) => {
          if (
            element.labassay.equals(
              mongoose.Types.ObjectId(req.body.reference.labassay)
            )
          ) {
            element.refd = req.body.reference.dref;
            element.refg = req.body.reference.gref;
            element.interp = req.body.reference.interp;
            element.extend = req.body.reference.extend;
            element.rezultat[element.rezultat.length - 1].jedinice_f =
              req.body.reference.jedinica;
          }
        });

        rezultat.updated_by = req.body.decoded.user;
        rezultat.updated_at = Date.now();

        rezultat.save(function (err) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err,
            });
          } else {
            res.json({
              success: true,
              message: "Referentne vrijednosti sačuvane.",
            });
          }
        });
      } else {
        res.json({
          success: true,
          message: "Nije pronađen rezultat",
        });
      }
    }
  });
};

module.exports = odobravanjeController;
