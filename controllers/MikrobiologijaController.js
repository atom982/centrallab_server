var mongoose = require("mongoose");

var Mikrobiologija = require("../models/Mikrobiologija");

var mikrobiologijaController = {};

// Analize

mikrobiologijaController.AnalizeGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.find({
      tip: /.*Mikrobiologija.*/,
      disabled: false,
      active: true
    })
      .populate("bakterije")
      .exec(function(err, analize) {
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
            analize
          });
        }
      });
  }
};

mikrobiologijaController.AnalizeEdit = function(req, res) {
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
        bakterije: req.body.bakterije,
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
        LabAssays.find({
          tip: /.*Mikrobiologija.*/
        }).exec(function(err, analize) {
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
              analize
            });
          }
        });
      }
    });
  }
};

mikrobiologijaController.AnalizeRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.remove(
      {
        _id: req.body._id
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          AnaAssays.remove(
            {
              test: req.body._id
            },
            function(err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                res.json({
                  success: true,
                  message: "Analiza izbrisana."
                });
              }
            }
          );
        }
      }
    );
  }
};

// Bakterije

mikrobiologijaController.BakterijeGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Bakterije.find({})
      .populate("antibiogram")
      .exec(function(err, bakterije) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Bakterije.",
            bakterije: bakterije
          });
        }
      });
  }
};

mikrobiologijaController.BakterijeInsert = function(req, res) {
  var element = new Bakterije(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    element.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Bakterije.find({})
          .populate("antibiogram")
          .exec(function(err, bakterije) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Unos uspješno obavljen.",
                bakterije: bakterije
              });
            }
          });
      }
    });
  }
};

mikrobiologijaController.BakterijeEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Bakterije.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.element._id) },

      {
        naziv: req.body.element.naziv,
        opis: req.body.element.opis,
        antibiogram: req.body.antibiogram,
        __v: req.body.element.__v
      },

      { upsert: false }
    ).exec(function(err, element) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Bakterije.find({})
          .populate("antibiogram")
          .exec(function(err, bakterije) {
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
                bakterije: bakterije
              });
            }
          });
      }
    });
  }
};

mikrobiologijaController.BakterijeRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.find({
      tip: /.*Mikrobiologija.*/
    })
      .populate("bakterije")
      .exec(function(err, analize) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          var dependency = false;
          var Data = [];

          analize.forEach(element => {
            element.bakterije.forEach(bakterija => {
              if (
                JSON.stringify(bakterija._id) === JSON.stringify(req.body._id)
              ) {
                dependency = true;
                Data.push(element);
              }
            });
          });

          if (!dependency) {
            Bakterije.remove(
              {
                _id: mongoose.Types.ObjectId(req.body._id)
              },
              function(err) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  Bakterije.find({})
                    .populate("antibiogram")
                    .exec(function(err, bakterije) {
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
                          bakterije: bakterije
                        });
                      }
                    });
                }
              }
            );
          } else {
            res.json({
              success: false,
              message: "Dependency found.",
              analize: Data
            });
          }
        }
      });
  }
};

// Antibiogrami

mikrobiologijaController.AntibiogramiGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Antibiogrami.find({})
      .populate("antibiotici")
      .exec(function(err, antibiogrami) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Antibiogrami.",
            antibiogrami: antibiogrami
          });
        }
      });
  }
};

mikrobiologijaController.AntibiogramiInsert = function(req, res) {
  var element = new Antibiogrami(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    element.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Antibiogrami.find({})
          .populate("antibiotici")
          .exec(function(err, antibiogrami) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Unos uspješno obavljen.",
                antibiogrami: antibiogrami
              });
            }
          });
      }
    });
  }
};

mikrobiologijaController.AntibiogramiEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Antibiogrami.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.element._id) },

      {
        naziv: req.body.element.naziv,
        opis: req.body.element.opis,
        antibiotici: req.body.antibiotici,
        __v: req.body.element.__v
      },

      { upsert: false }
    ).exec(function(err, element) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Antibiogrami.find({})
          .populate("antibiotici")
          .exec(function(err, antibiogrami) {
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
                antibiogrami: antibiogrami
              });
            }
          });
      }
    });
  }
};

mikrobiologijaController.AntibiogramiRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Bakterije.find({})
      .populate("antibiogram")
      .exec(function(err, bakterije) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          var dependency = false;
          var Data = [];

          bakterije.forEach(element => {
            if (
              JSON.stringify(element.antibiogram._id) ===
              JSON.stringify(req.body._id)
            ) {
              dependency = true;
              Data.push(element);
            }
          });

          if (!dependency) {
            Antibiogrami.remove(
              {
                _id: mongoose.Types.ObjectId(req.body._id)
              },
              function(err) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  Antibiogrami.find({})
                    .populate("antibiotici")
                    .exec(function(err, antibiogrami) {
                      if (err) {
                        console.log("Greška:", err);
                        res.json({
                          success: false,
                          message: err
                        });
                      } else {
                        res.json({
                          success: true,
                          message: "Brisanje uspješno obavljeno.",
                          antibiogrami: antibiogrami
                        });
                      }
                    });
                }
              }
            );
          } else {
            res.json({
              success: false,
              message: "Dependency found.",
              bakterije: Data
            });
          }
        }
      });
  }
};

// Antibiotici

mikrobiologijaController.AntibioticiGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Antibiotici.find({}).exec(function(err, antibiotici) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Antibiotici.",
          antibiotici: antibiotici
        });
      }
    });
  }
};

mikrobiologijaController.AntibioticiInsert = function(req, res) {
  var element = new Antibiotici(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    element.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Antibiotici.find({}).exec(function(err, antibiotici) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
            });
          } else {
            res.json({
              success: true,
              message: "Unos uspješno obavljen.",
              antibiotici: antibiotici
            });
          }
        });
      }
    });
  }
};

mikrobiologijaController.AntibioticiEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Antibiotici.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.element._id) },

      {
        naziv: req.body.element.naziv,
        opis: req.body.element.opis,
        rbr_a: req.body.element.rbr_a,
        __v: req.body.element.__v
      },

      { upsert: false }
    ).exec(function(err, element) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Antibiotici.find({}).exec(function(err, antibiotici) {
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
              antibiotici: antibiotici
            });
          }
        });
      }
    });
  }
};

mikrobiologijaController.AntibioticiRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Antibiogrami.find({})
      .populate("antibiotici")
      .exec(function(err, antibiogrami) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          var dependency = false;
          var Data = [];

          antibiogrami.forEach(element => {
            element.antibiotici.forEach(antibiotik => {
              if (
                JSON.stringify(antibiotik._id) === JSON.stringify(req.body._id)
              ) {
                dependency = true;
                Data.push(element);
              }
            });
          });

          if (!dependency) {
            Antibiotici.remove(
              {
                _id: mongoose.Types.ObjectId(req.body._id)
              },
              function(err) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  Antibiotici.find({}).exec(function(err, antibiotici) {
                    if (err) {
                      console.log("Greška:", err);
                      res.json({
                        success: false,
                        message: err
                      });
                    } else {
                      res.json({
                        success: true,
                        message: "Brisanje uspješno obavljeno.",
                        antibiotici: antibiotici
                      });
                    }
                  });
                }
              }
            );
          } else {
            res.json({
              success: false,
              message: "Dependency found.",
              antibiogrami: Data
            });
          }
        }
      });
  }
};

module.exports = mikrobiologijaController;
