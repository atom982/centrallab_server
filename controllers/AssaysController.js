var mongoose = require("mongoose");
var Schema = require("../models/Postavke");
var Settings = mongoose.model("Settings");
var LabAssays = mongoose.model("LabAssays");
var AnaAssays = mongoose.model("AnaAssays");

var fs = require("fs");
const config = require("../config/index");

var assaysController = {};

// AssaysController.js

assaysController.Settings = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Settings.find({}).exec(function(err, settings) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Settings.",
          settings
        });
      }
    });
  }
};

assaysController.Analyser = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Analyser.find({})
      .populate("site")
      .exec(function(err, analysers) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Analyser.",
            analysers,
            analysers
          });
        }
      });
  }
};

assaysController.Site = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.find({}).exec(function(err, sites) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Site.",
          sites,
          sites
        });
      }
    });
  }
};

assaysController.LabAssaysList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.find({}).exec(function(err, labassays) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Success.",
          labassays
        });
      }
    });
  }
};

assaysController.AnaAssaysList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.find({
      site: mongoose.Types.ObjectId(req.query.site)
    })
      .populate("aparat test site")
      .exec(function(err, anaassays) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Success.",
            anaassays
          });
        }
      });
  }
};

assaysController.LabAssaySave = function(req, res) {
  req.body.created_by = req.body.decoded.user;
  var labassay = new LabAssays(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    labassay.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Analiza sačuvana.",
          labassay: labassay
        });
      }
    });
  }
};

assaysController.AnaAssaySave = function(req, res) {
  req.body.created_by = req.body.decoded.user;
  req.body.aparat = mongoose.Types.ObjectId(req.body.aparat);
  req.body.test = mongoose.Types.ObjectId(req.body.test);
  req.body.site = mongoose.Types.ObjectId(req.body.site);
  var anaassay = new AnaAssays(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test)
    }).exec(function(err, labassay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (!labassay.calculated) {
          labassay.manual = req.body.manual;
        }

        labassay.save(function(err) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
            });
          } else {
            anaassay.save(function(err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                AnaAssays.findOne({
                  _id: mongoose.Types.ObjectId(anaassay._id)
                })
                  .populate("aparat test site")
                  .exec(function(err, assay) {
                    if (err) {
                      console.log("Greška:", err);
                      res.json({
                        success: false,
                        message: err
                      });
                    } else {
                      res.json({
                        success: true,
                        message: "Analiza sačuvana.",
                        anaassay: assay
                      });
                    }
                  });
              }
            });
          }
        });
      }
    });
  }
};

assaysController.LabAssayEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.labassay._id) },

      {
        sifra: req.body.labassay.sifra,
        naziv: req.body.labassay.naziv,
        multi: req.body.labassay.multi,
        multiparam: req.body.labassay.multiparam,
        analit: req.body.labassay.analit,
        sekcija: req.body.labassay.sekcija,
        grupa: req.body.labassay.grupa,
        grouporder: req.body.labassay.grouporder,
        jedinica: req.body.labassay.jedinica,
        tip: req.body.labassay.tip,
        bundle: req.body.labassay.bundle,
        specific: req.body.labassay.specific,
        bundledTests: req.body.labassay.bundledTests,
        kategorija: req.body.labassay.kategorija,
        orderbyusage: req.body.labassay.orderbyusage,
        manual: req.body.labassay.manual,
        disabled: req.body.labassay.disabled,
        calculated: req.body.labassay.calculated,
        calculatedTests: req.body.labassay.calculatedTests,
        calculatedFormula: req.body.labassay.calculatedFormula,
        price: req.body.labassay.price,
        code: req.body.labassay.code,
        entryorder: req.body.labassay.entryorder,
        analyser: req.body.labassay.analyser,
        sites: req.body.labassay.sites,
        interpretacija: req.body.labassay.interpretacija,
        active: req.body.labassay.active,
        test_type: req.body.labassay.test_type,
        neg_description: req.body.labassay.neg_description,
        pos_description: req.body.labassay.pos_description,
        bakterije: req.body.labassay.bakterije,
        created_at: req.body.labassay.created_at,
        updated_at: req.body.labassay.updated_at,
        created_by: req.body.labassay.created_by,
        updated_by: req.body.labassay.updated_by
      },

      { upsert: false }
    ).exec(function(err, labassay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Izmjena uspješno obavljena.",
          labassay
        });
      }
    });
  }
};

assaysController.CalcEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.labassay._id)
    }).exec(function(err, labassay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        labassay.bundledTests[0].labassay = req.body.labassay._id;
        labassay.save(function(err) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
            });
          } else {
            res.json({
              success: true,
              message: "Izmjena uspješno obavljena.",
              labassay
            });
          }
        });
      }
    });
  }
};

assaysController.AnaAssayEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.anaassay._id) },

      {
        aparat: mongoose.Types.ObjectId(req.body.anaassay.aparat),
        test: mongoose.Types.ObjectId(req.body.anaassay.test),
        disabled: req.body.anaassay.disabled,
        sekcija: req.body.anaassay.sekcija,
        grupa: req.body.anaassay.grupa,
        kod: req.body.anaassay.kod,
        metoda: req.body.anaassay.metoda,
        active: req.body.anaassay.active,
        reference: req.body.anaassay.reference,
        tipoviUzorka: req.body.anaassay.tipoviUzorka,
        site: mongoose.Types.ObjectId(req.body.anaassay.site),
        price: req.body.anaassay.price,
        created_at: req.body.anaassay.created_at,
        updated_at: req.body.anaassay.updated_at,
        created_by: req.body.anaassay.created_by,
        updated_by: req.body.anaassay.updated_by
      },

      { upsert: false }
    ).exec(function(err, anaassay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Izmjena uspješno obavljena.",
          anaassay
        });
      }
    });
  }
};

assaysController.Price = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.find({}).exec(function(err, labassays) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (labassays.length) {
          var i = 0;
          var condition = false;
          labassays.forEach(element => {
            i++;
            condition = false;

            if (element.bundledTests.length) {
              element.bundledTests.forEach(test => {
                if (test.labassay === req.body._id) {
                  condition = true;
                  test.itemName = req.body.naziv;
                  test.opis = req.body.analit;
                  test.cijena = req.body.price;
                  test.code = req.body.code;
                }
              });
            }

            if (element.calculated && element.calculatedTests.length) {
              element.calculatedTests.forEach(calc => {
                if (calc.labassay === req.body._id) {
                  condition = true;
                  calc.ime_testa = req.body.naziv;
                  calc.analit = req.body.analit;
                  calc.itemName = req.body.naziv;
                  calc.opis = req.body.analit;
                  calc.cijena = req.body.price;
                  calc.code = req.body.code;
                }
              });
            }
            if (condition) {
              element.save();
            }
          });

          if (i === labassays.length) {
            res.json({
              success: true,
              message: "Izmjena cijene uspješno obavljena."
            });
          }
        } else {
          res.json({
            success: false,
            message: "Nema podataka."
          });
        }
      }
    });
  }
};

module.exports = assaysController;
