var mongoose = require("mongoose");
var User = require("../models/User");
var tipAparata = require("../models/Postavke");
var Audit_LabAssays = require("../models/Audit");
var fs = require("fs");
var tipAparata = mongoose.model("tipAparata");
var tehnologijaAparata = mongoose.model("tehnologijaAparata");
var tipUzorka = mongoose.model("tipUzorka");
var Lokacija = mongoose.model("Lokacija");
var Doktor = mongoose.model("Doktor");
var Sekcija = mongoose.model("Sekcija");
var grupaTesta = mongoose.model("grupaTesta");
var Analyser = mongoose.model("Analyser");
var LabAssays = mongoose.model("LabAssays");
var AnaAssays = mongoose.model("AnaAssays");
var ReferentneGrupe = mongoose.model("ReferentneGrupe");
var Jedinice = mongoose.model("Jedinice");
var Results = mongoose.model("Results");
var Paneli = mongoose.model("Paneli");
var User = mongoose.model("User");
var Audit_LabAssays = mongoose.model("Audit_LabAssays");
var Audit_AnaAssays = mongoose.model("Audit_AnaAssays");
var Site = mongoose.model("Site");

const config = require("../config/index");

var postavkeController = {};

// PostavkeController.js

postavkeController.GetProtokol = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var uslov = {};

    uslov = {
      site: mongoose.Types.ObjectId(req.query.site),
    };

    var Data = {};
    var Code = null;
    var counter = 0;
    var condition = false;
    var current = new Date().getFullYear();
    // console.log(current);

    Protokol.find(uslov)
      .populate("site")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          Code = results[0].site.sifra;

          results.forEach((element) => {
            element.protokol.forEach((protokol) => {
              counter++;
              if (protokol.godina == current) {
                // console.log(protokol);
                Data = protokol;

                condition = true;
              }
            });

            if (counter === element.protokol.length) {
              if (!condition) {
                // console.log("Insert New year.");
                Data = {
                  godina: JSON.stringify(current),
                  count: "0",
                  code: results[0].site.naziv,
                };
                element.protokol.push(Data);
              }
            }

            element.save();
          });

          res.json({
            success: true,
            message: "Protokol.",
            Data: Data,
            Code: Code,
          });
        }
      });
  }
};

postavkeController.SetProtokol = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var uslov = {};

    uslov = {
      site: mongoose.Types.ObjectId(req.body.site),
    };

    var Data = {};
    var counter = 0;
    var condition = false;
    var current = new Date().getFullYear();
    // console.log(current);

    Protokol.find(uslov)
      .populate("site")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          results.forEach((element) => {
            element.protokol.forEach((protokol) => {
              counter++;
              if (protokol.godina == current) {
                // console.log(protokol);
                protokol.count = JSON.stringify(Number(protokol.count) + 1);
                Data = protokol;

                condition = true;
              }
            });

            if (counter === element.protokol.length) {
              if (condition) {
                // console.log("Update protocol number.");
                element.protokol.pop();
                element.protokol.push(Data);
              }
            }

            element.save();
          });

          res.json({
            success: true,
            message: "Izmjena uspješno obavljena.",
          });
        }
      });
  }
};

postavkeController.generalno = function(req, res) {
  var data = [];
  data.push("TIP APARATA");
  data.push("TEHNOLOGIJA APARATA");
  data.push("GRUPE TESTOVA");
  data.push("REFERENTNE GRUPE");
  data.push("MJERNE JEDINICE");
  data.push("TIPOVI UZORKA");
  var obj = {};
  obj.data = data;
  Sekcija.find({}).exec(function(err, sekcije) {
    if (err) {
      console.log("Greška:", err);
    } else {
      var sekcija = [];
      obj.sekcije = sekcija;
      sekcije.forEach(element => {
        sekcija.push(element.sekcija);
      });
      obj.sekcije = sekcija;
      res.json({
        success: true,
        message: "Sve sekcije",
        obj
      });
    }
  });
};

postavkeController.delete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    switch (req.body.postavkaSelected) {
      case "TIP APARATA":
        tipAparata.remove(
          {
            _id: req.body.postavkaId
          },
          function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              tipAparata.find({}).exec(function(err, tip) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Tip aparata izbrisan",
                    tip
                  });
                }
              });
            }
          }
        );
        break;
      case "TEHNOLOGIJA APARATA":
        tehnologijaAparata.remove(
          {
            _id: req.body.postavkaId
          },
          function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              tehnologijaAparata.find({}).exec(function(err, tehno) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Tehnologija aparata izbrisana",
                    tehno
                  });
                }
              });
            }
          }
        );
        break;
      case "GRUPE TESTOVA":
        grupaTesta.remove(
          {
            _id: req.body.postavkaId
          },
          function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              grupaTesta.find({}).exec(function(err, grupaT) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Grupa testa izbrisana",
                    grupaT
                  });
                }
              });
            }
          }
        );
        break;
      case "REFERENTNE GRUPE":
        ReferentneGrupe.remove(
          {
            _id: req.body.postavkaId
          },
          function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              ReferentneGrupe.find({}).exec(function(err, refgrupa) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Referentna Grupa testa izbrisana",
                    refgrupa
                  });
                }
              });
            }
          }
        );
        break;
      case "MJERNE JEDINICE":
        Jedinice.remove(
          {
            _id: req.body.postavkaId
          },
          function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              Jedinice.find({}).exec(function(err, jedinice) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  jedinice = jedinice.sort(function(a, b) {
                    return a.jedinica.localeCompare(b.jedinica, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  res.json({
                    success: true,
                    message: "Jedinica izbrisana",
                    jedinice
                  });
                }
              });
            }
          }
        );
        break;
      case "TIPOVI UZORKA":
        tipUzorka.remove(
          {
            _id: req.body.postavkaId
          },
          function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              tipUzorka.find({}).exec(function(err, tipovi) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Tip uzorka",
                    tipovi
                  });
                }
              });
            }
          }
        );
        break;
      default:
        res.json({
          success: false,
          message: "Postavka nije izbrisana"
        });
        break;
    }
  }
};

postavkeController.save = function(req, res) {
  if (req.body.tipAparata.length > 1) {
    var tip = new tipAparata(req.body);
    tip.site = mongoose.Types.ObjectId(req.body.site);
    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB."
      });
    } else {
      tip.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Postavka za tip aparata sačuvana"
          });
        }
      });
    }
  }
  if (req.body.tehnologijaAparata.length > 1) {
    var tehno = new tehnologijaAparata(req.body);
    tehno.site = mongoose.Types.ObjectId(req.body.site);
    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB."
      });
    } else {
      tehno.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Postavka za tehnologiju aparata sačuvana"
          });
        }
      });
    }
  }
  if (req.body.grupa.length > 1) {
    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB."
      });
    } else {
      Sekcija.findOne({
        sekcija: req.body.sekcija
      }).exec(function(err, sekcija) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (sekcija) {
            req.body.sekcija = sekcija;
            var grupa = new grupaTesta(req.body);
            grupa.site = mongoose.Types.ObjectId(req.body.site);
            grupa.save(function(err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                res.json({
                  success: true,
                  message: "Postavka za grupu testa sačuvana"
                });
              }
            });
          } else {
            res.json({
              success: false,
              message: "Nije pronađena sekcija vezana za odabranu grupu"
            });
          }
        }
      });
    }
  }
  if (req.body.referentnaGrupa.length > 1) {
    req.body.grupa = req.body.referentnaGrupa;
    var grupa = new ReferentneGrupe(req.body);
    grupa.site = mongoose.Types.ObjectId(req.body.site);
    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB."
      });
    } else {
      grupa.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Postavka za referentnu grupu  sačuvana"
          });
        }
      });
    }
  }
  if (req.body.jedinica.length > 1) {
    var jedinica = new Jedinice(req.body);
    jedinica.site = mongoose.Types.ObjectId(req.body.site);
    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB."
      });
    } else {
      jedinica.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Postavka za mjernu jedinicu  sačuvana"
          });
        }
      });
    }
  }
  if (req.body.tipUzorka.length > 1) {
    req.body.tip = req.body.tipUzorka;
    var tip = new tipUzorka(req.body);
    tip.site = mongoose.Types.ObjectId(req.body.site);
    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB."
      });
    } else {
      tip.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Postavka za tip uzorka  sačuvana"
          });
        }
      });
    }
  }
};

postavkeController.list = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tipAparata.find({}).exec(function(err, tip) {
      if (err) {
        console.log("Greška:", err);
        // res.json({ success: false, message: err})
      } else {
        tehnologijaAparata.find({}).exec(function(err, tehno) {
          if (err) {
            console.log("Greška:", err);
            // res.json({ success: false, message: err})
          } else {
            grupaTesta
              .find({})
              .populate("sekcija")
              .exec(function(err, grupa) {
                if (err) {
                  console.log("Greška:", err);
                  // res.json({ success: false, message: err})
                } else {
                  ReferentneGrupe.find({}).exec(function(err, refGrupa) {
                    if (err) {
                      console.log("Greška:", err);
                      // res.json({ success: false, message: err})
                    } else {
                      Jedinice.find({}).exec(function(err, jedinice) {
                        if (err) {
                          console.log("Greška:", err);
                          // res.json({ success: false, message: err})
                        } else {
                          tipUzorka.find({}).exec(function(err, tipUzo) {
                            if (err) {
                              console.log("Greška:", err);
                              res.json({
                                success: false,
                                message: err
                              });
                            } else {
                              var data = {};
                              data.tip = tip;
                              data.tehno = tehno;
                              data.grupa = grupa;
                              data.refgrupa = refGrupa;
                              data.jedinice = jedinice.sort(function(a, b) {
                                return a.jedinica.localeCompare(
                                  b.jedinica,
                                  undefined,
                                  {
                                    numeric: true,
                                    sensitivity: "base"
                                  }
                                );
                              });
                              data.tipUzorka = tipUzo;
                              res.json({
                                success: true,
                                message: "Sve postavke",
                                data
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
        });
      }
    });
  }
};

postavkeController.lokacijaSave = function(req, res) {
  req.body.lokacija = req.body.lokacija; // .toUpperCase().trim()
  var lokacija = new Lokacija(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    lokacija.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Postavka za lokaciju uspješno sačuvana"
        });
      }
    });
  }
};

postavkeController.lokacijaList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Lokacija.find({ site: mongoose.Types.ObjectId(req.query.site) })
      .populate("site")
      .exec(function(err, lokacije) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          var lokacija = [];
          if (lokacije.length) {
            lokacije.forEach(element => {
              lokacija.push(element);
            });
            res.json({
              success: true,
              message: "Sve lokacije",
              lokacija
            });
          } else {
            res.json({
              success: true,
              message: "Ne postoji definisana niti jedna lokacija",
              lokacija
            });
          }
        }
      });
  }
};

postavkeController.lokacijaDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Lokacija.findOne({
      _id: req.body.lokacija,
      site: req.body.site
    }).exec(function(err, lokacija) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (!lokacija) {
          res.json({
            success: false,
            message: "Ne pronadjena lokacija za brisanje"
          });
        } else {
          Lokacija.remove(
            {
              _id: lokacija._id
            },
            function(err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: "Ne mogu izbrisati lokaciju"
                });
              } else {
                res.json({
                  success: true,
                  message: "Lokacija izbrisana",
                  lokacija
                });
              }
            }
          );
        }
      }
    });
  }
};

postavkeController.doktorSave = function(req, res) {
  req.body.doktorIme = req.body.doktorIme;
  req.body.doktorPrezime = req.body.doktorPrezime;
  var doktor = new Doktor(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    doktor.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Postavka za doktora uspješno sačuvana"
        });
      }
    });
  }
};

postavkeController.doktorList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Doktor.find({ site: req.query.site }).exec(function(err, doktori) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: "Greška prilikom pronalaženja doktora."
        });
      } else {
        var doktor = [];
        var doktorsve = [];
        var obj = {};
        if (doktori.length) {
          doktori.forEach(element => {
            obj = {};
            obj.doktorIme = element.doktorIme;
            obj.doktorPrezime = element.doktorPrezime;
            obj.lokacija = element.lokacija;
            obj._id = element._id;
            doktor.push(obj);
            doktorsve.push(element);
          });
          res.json({
            success: true,
            message: "Svi doktori",
            doktor,
            doktorsve
          });
        } else {
          res.json({
            success: true,
            message: "Ne postoji definisana niti jednan doktor",
            doktor
          });
        }
      }
    });
  }
};

postavkeController.doktorDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Doktor.findOne({
      _id: req.body.id
    }).exec(function(err, doktor) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: "Greška prilikom pronalaženja doktora."
        });
      } else {
        if (doktor) {
          Doktor.remove(
            {
              _id: doktor._id
            },
            function(err) {
              if (err) {
                console.log("Greška:", err);
              } else {
                res.json({
                  success: true,
                  message: "Doktor izbrisan",
                  doktor
                });
              }
            }
          );
        } else {
          res.json({
            success: true,
            message: "Ne postoji odabrani doktor"
          });
        }
      }
    });
  }
};

postavkeController.sekcijaSave = function(req, res) {
  req.body.sekcija = req.body.sekcija.toUpperCase();
  var sekcija = new Sekcija(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    sekcija.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Postavka za sekciju uspješno sačuvana"
        });
      }
    });
  }
};

postavkeController.sekcijaList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Sekcija.find({}).exec(function(err, sekcije) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        var sekcija = [];
        var obj = {};
        if (sekcije.length) {
          sekcije.forEach(element => {
            obj = {};
            obj.sekcija = element.sekcija;
            sekcija.push(obj);
          });
          res.json({
            success: true,
            message: "Sve sekcije",
            sekcija
          });
        } else {
          res.json({
            success: true,
            message: "Ne postoji definisana niti jedna sekcija"
          });
        }
      }
    });
  }
};

postavkeController.sekcijaDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Sekcija.findOne({
      sekcija: req.body.sekcija
    }).exec(function(err, sekcija) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (sekcija) {
          Sekcija.remove(
            {
              _id: sekcija._id
            },
            function(err) {
              if (err) {
                console.log("Greška:", err);
              } else {
                res.json({
                  success: true,
                  message: "Lokacija izbrisana",
                  sekcija
                });
              }
            }
          );
        } else {
          res.json({
            success: true,
            message: "Nije pronađena tražena sekcija "
          });
        }
      }
    });
  }
};

postavkeController.aparatMountList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tipAparata.find({}).exec(function(err, tipovi) {
      if (err) {
        console.log("Greška:", err);
        // res.json({ success: false, message: err})
      } else {
        var tip = [];

        tipovi.forEach(element => {
          tip.push(element.tipAparata);
        });

        tehnologijaAparata.find({}).exec(function(err, tehnologije) {
          if (err) {
            console.log("Greška:", err);
            // res.json({ success: false, message: err})
          } else {
            var tehnologija = [];

            tehnologije.forEach(element => {
              tehnologija.push(element.tehnologijaAparata);
            });
            Sekcija.find({}).exec(function(err, sekcije) {
              if (err) {
                console.log("Greška:", err);
                // res.json({ success: false, message: err})
              } else {
                var sekcija = [];
                sekcije.forEach(element => {
                  sekcija.push(element.sekcija);
                });
                Analyser.find({
                  site: mongoose.Types.ObjectId(req.query.site)
                }).exec(function(err, aparati) {
                  if (err) {
                    console.log("Greška:", err);
                    // res.json({ success: false, message: err})
                  } else {
                    var obj = {};
                    obj.aparat = [];
                    aparati.forEach(element => {
                      obj.aparat.push(element);
                    });
                    obj.tip = tip;
                    obj.tehnologija = tehnologija;
                    obj.sekcija = sekcija;
                    res.json({
                      success: true,
                      message: "Svi tipovi,tehnologije i sekcije",
                      obj
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

postavkeController.grupaMountList = function(req, res) {
  grupaTesta
    .find({})
    .populate("sekcija")
    .exec(function(err, grupe) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        var grupa = [];
        if (grupe.length) {
          grupe.forEach(element => {
            if (element.sekcija !== null) {
              if (element.sekcija.sekcija === req.body.sekcija) {
                grupa.push(element.grupa);
              }
            }
          });
          res.json({
            success: true,
            message: "Poslane grupe za sekciju",
            grupa
          });
        } else {
          res.json({
            success: true,
            message: "Nema definisane grupe za odabranu sekciju"
          });
        }
      }
    });
};

postavkeController.jedinicaMountList = function(req, res) {
  Jedinice.find({}).exec(function(err, jedinice) {
    if (err) {
      console.log("Greška:", err);
      res.json({
        success: false,
        message: err
      });
    } else {
      var jedinica = [];

      jedinice = jedinice.sort(function(a, b) {
        return a.jedinica.localeCompare(b.jedinica, undefined, {
          numeric: true,
          sensitivity: "base"
        });
      });

      jedinice.forEach(element => {
        jedinica.push(element.jedinica);
      });

      res.json({
        success: true,
        message: "Poslane mjerne jedinice",
        jedinica
      });
    }
  });
};

postavkeController.aparatSave = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    var analyser = new Analyser(req.body);
    analyser.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Postavka za aparat uspješno sačuvana"
        });
      }
    });
  }
};

postavkeController.aparatList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Analyser.find({ site: mongoose.Types.ObjectId(req.query.site) })
      .populate("site")
      .exec(function(err, aparati) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Lista aparata",
            aparati
          });
        }
      });
  }
};

postavkeController.aparatDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Analyser.remove(
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
          res.json({
            success: true,
            message: "Aparat izbrisan"
          });
        }
      }
    );
  }
};

postavkeController.labtestSave = function(req, res) {
  if (req.body.multi === "Da") {
    req.body.multi = true;
  } else {
    req.body.multi = false;
  }
  req.body.created_by = req.body.decoded.user;
  var labtest = new LabAssays(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    labtest.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Postavka za labtest sačuvana"
        });
      }
    });
  }
};

postavkeController.labtestList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.find({}).exec(function(err, testovi) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Sve testovi",
          testovi
        });
      }
    });
  }
};

postavkeController.labtestDelete = function(req, res) {
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
          res.json({
            success: true,
            message: "LAbTest izbrisan"
          });
        }
      }
    );
  }
};

postavkeController.anatestEdit = function(req, res) {
  // console.log('postavkeController.anatestEdit = function (req, res) {')
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: req.body._id
    }).exec(function(err, anaassay) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (anaassay) {
          (anaassay.kod = req.body.kod),
            (anaassay.metoda = req.body.metoda),
            (anaassay.float = req.body.float),
            (anaassay.aparat = mongoose.Types.ObjectId(req.body.analizator)),
            (anaassay.updated_by = req.body.decoded.user);
          anaassay.updated_at = Date.now();

          LabAssays.findOne({
            _id: mongoose.Types.ObjectId(anaassay.test)
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
                      res.json({
                        success: true,
                        message: "Success"
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
            message: "Greška"
          });
        }
      }
    });
  }
};

postavkeController.labtestEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.findOne({
      _id: req.body._id
    }).exec(function(err, labassay) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (labassay) {
          var labassa = labassay.toObject();
          delete labassa._id;
          delete labassa.__v;
          var auditLA = new Audit_LabAssays(labassa);
          auditLA.save();

          (labassay.sifra = req.body.sifra),
            (labassay.naziv = req.body.naziv),
            (labassay.analit = req.body.analit),
            (labassay.jedinica = req.body.jedinica),
            (labassay.grouporder = req.body.grouporder),
            (labassay.price = req.body.price),
            (labassay.code = req.body.code),
            (labassay.specific = req.body.specific),
            (labassay.sekcija = req.body.sekcija),
            (labassay.grupa = req.body.grupa),
            (labassay.kategorija = req.body.kategorija),
            (labassay.interpretacija = req.body.interpretacija),
            (labassay.tip = req.body.tip),
            (labassay.entryorder = req.body.entryorder),
            (labassay.sites = req.body.sites);
          labassay.updated_by = req.body.decoded.user;
          labassay.updated_at = Date.now();

          labassay.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              AnaAssays.find({}).exec(function(err, anaassays) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  anaassays.forEach(anaassay => {
                    if (anaassay.test == req.body._id) {
                      anaassay.sekcija = req.body.sekcija;
                      anaassay.grupa = req.body.grupa;
                      anaassay.save();
                    }
                  });

                  res.json({
                    success: true,
                    message: "Success"
                  });
                }
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Greška"
          });
        }
      }
    });
  }
};

postavkeController.aparatListAll = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Analyser.find({})
      .populate("site")
      .exec(function(err, aparati) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Lista aparata",
            aparati
          });
        }
      });
  }
};

postavkeController.labtestAnalitEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.findOne({
      _id: req.body.analit_id
    }).exec(function(err, test) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        var analiti = [];
        var tmpEl = {};
        if (test) {
          test.multiparam.forEach(element => {
            if (element.naziv != req.body.analit) {
              analiti.push(element);
            }
            if (element.naziv === req.body.analit) {
              tmpEl.kod = element.kod;
              tmpEl.naziv = element.naziv;
              tmpEl.opis = element.opis;
              tmpEl.jedinica = req.body.unit;
              tmpEl._id = element._id;
              analiti.push(tmpEl);
              tmpEl = {};
            }
          });
          test.multiparam = [];
          test.multiparam = analiti;
          test.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Analiti testa" + req.body.analit_id,
                analiti
              });
            }
          });
        } else {
          res.json({
            success: true,
            message: "Ne postoji laboratorijski test"
          });
        }
      }
    });
  }
};

postavkeController.labtestAnalitSave = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.findOne({
      _id: req.body.analit_id
    }).exec(function(err, test) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (test) {
          var analit = {};
          analit.kod = req.body.analitKod;
          analit.naziv = req.body.analitNaziv;
          analit.opis = req.body.analitOpis;
          analit.jedinica = req.body.analitJedinica;
          test.multiparam.push(analit);
          test.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              var analiti = test.multiparam;
              res.json({
                success: true,
                message: "Postavka za analit labtesta sačuvana",
                analiti
              });
            }
          });
        } else {
          res.json({
            success: true,
            message: "NE postoji laboratorijski test"
          });
        }
      }
    });
  }
};

postavkeController.labtestAnalitList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.findOne({
      _id: req.body.analit_id
    }).exec(function(err, test) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        var analiti = [];
        if (test) {
          analiti = test.multiparam;
          res.json({
            success: true,
            message: "Analiti testa " + req.body.analit,
            analiti
          });
        } else {
          res.json({
            success: true,
            message: "Ne postoji laboratorijski test"
          });
        }
      }
    });
  }
};

postavkeController.labtestAnalitDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.findOne({
      _id: req.body.analit_id
    }).exec(function(err, test) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        var analiti = [];
        if (test) {
          test.multiparam.forEach(element => {
            if (element.naziv != req.body.analit) {
              analiti.push(element);
            }
          });
          test.multiparam = [];
          test.multiparam = analiti;
          test.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Analiti testa" + req.body.analit_id,
                analiti
              });
            }
          });
        } else {
          res.json({
            success: true,
            message: "Ne postoji laboratorijski test"
          });
        }
      }
    });
  }
};

postavkeController.labtestGroupList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    grupaTesta
      .find({})
      .populate("sekcija")
      .exec(function(err, grupa) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          var grupe = [];
          grupa.forEach(element => {
            if (element.sekcija !== null) {
              if (element.sekcija.sekcija === req.body.sekcija) {
                grupe.push(element);
              }
            }
          });
          res.json({
            success: true,
            message: "Grupe laboratorijskih testova proslijeđene",
            grupe
          });
        }
      });
  }
};

postavkeController.labtestAssayList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    LabAssays.find({
      sekcija: req.body.sekcija,
      grupa: req.body.grupa
    }).exec(function(err, tests) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Testovi po sekciji i grupi",
          tests
        });
      }
    });
  }
};

postavkeController.aptestSave = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Analyser.findOne({
      ime: req.body.aparat,
      site: mongoose.Types.ObjectId(req.body.site)
    }).exec(function(err, analyser) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (analyser) {
          LabAssays.findOne({
            analit: req.body.test
          }).exec(function(err, assay) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if (assay) {
                req.body.aparat = analyser;
                req.body.test = assay;
                req.body.created_by = req.body.decoded.user;
                var aptest = new AnaAssays(req.body);
                aptest.save(function(err) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err
                    });
                  } else {
                    res.json({
                      success: true,
                      message: "Postavka za test aparata sačuvana"
                    });
                  }
                });
              } else {
                res.json({
                  success: true,
                  message: "Nije pronađen laboratorijski test"
                });
              }
            }
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronađen aparat"
          });
        }
      }
    });
  }
};

postavkeController.aptestList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Analyser.find({
      ime: req.body.aparat,
      site: mongoose.Types.ObjectId(req.body.site)
    }).exec(function(err, aparat) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        AnaAssays.find({
          aparat: aparat,
          disabled: false,
          site: mongoose.Types.ObjectId(req.body.site)
        })
          .populate("test")
          .exec(function(err, aptests) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Listing aptestova u prilogu",
                aptests
              });
            }
          });
      }
    });
  }
};

postavkeController.aptestListAll = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.find({
      disabled: false,
      site: mongoose.Types.ObjectId(req.body.site)
    })
      .populate("test aparat")
      .exec(function(err, aptests) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Testovi u prilogu.",
            aptests
          });
        }
      });
  }
};

postavkeController.aptestShow = function(req, res) {
  Results.findOne({
    id: req.body.id_u
  })
    .populate("rezultati.labassay rezultati.rezultat.anaassay")
    .exec(function(err, rezultat) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (rezultat) {
          rezultat.rezultati.forEach(element => {
            if (element._id.equals(mongoose.Types.ObjectId(req.body.testID))) {
              var i = 0;
              var duzina = element.rezultat.length;
              element.rezultat.forEach(rez => {
                Analyser.findOne({
                  _id: mongoose.Types.ObjectId(rez.anaassay.aparat)
                }).exec(function(err, aparat) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err
                    });
                  } else {
                    rez.anaassay.aparat = aparat;
                    i++;
                    if (duzina === i) {
                      res.json({
                        success: true,
                        message: "Listing aptestova u prilogu",
                        element
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

postavkeController.aptestDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.remove(
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
          res.json({
            success: true,
            message: "Test aparata izbrisan"
          });
        }
      }
    );
  }
};

postavkeController.referentneList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test),
      site: mongoose.Types.ObjectId(req.body.site)
    })
      .populate("test aparat")
      .exec(function(err, aptest) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (aptest) {
            ReferentneGrupe.find({}).exec(function(err, refGrupe) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                var obj = {};
                if (aptest.test.multi === true) {
                  obj.multi = true;
                  obj.analiti = aptest.test.multiparam;
                } else {
                  obj.multi = false;
                }
                obj.aptest = aptest;
                obj.referentnaGrupa = refGrupe;
                obj.reference = [];
                if (aptest.test.multi === true) {
                  aptest.reference.forEach(element => {
                    if (element.analit === req.body.analitzaRef) {
                      obj.reference.push(element);
                    }
                  });
                } else {
                  aptest.reference.forEach(element => {
                    if (element.analit === req.body.analit) {
                      obj.reference.push(element);
                    }
                  });
                }
                res.json({
                  success: true,
                  message: "Listing aptestova u prilogu",
                  obj
                });
              }
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronadjen test aparata"
            });
          }
        }
      });
  }
};

postavkeController.referentneSave = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test),
      site: mongoose.Types.ObjectId(req.body.site)
    }).exec(function(err, assay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (assay) {
          var ref = {};
          ref.grupa = req.body.refGrupa;
          ref.refd = req.body.dRef;
          ref.dDob = req.body.dDob;
          ref.gDob = req.body.gDob;
          ref.refg = req.body.gRef;
          ref.spol = req.body.spol;
          assay.reference.push(ref);
          assay.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              var referentne = assay.reference;
              res.json({
                success: true,
                message: "Referentna sacuvana",
                referentne
              });
            }
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronadjen test aparata"
          });
        }
      }
    });
  }
};

postavkeController.referentneDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test),
      site: mongoose.Types.ObjectId(req.body.site)
    }).exec(function(err, assay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (assay) {
          var referentne = [];
          assay.reference.forEach(element => {
            if (element._id != req.body.id) {
              referentne.push(element);
            }
          });
          assay.reference = referentne;
          assay.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Referentna izbrisana",
                referentne
              });
            }
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronadjen test aparata"
          });
        }
      }
    });
  }
};

postavkeController.refAnalitSave = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test),
      site: mongoose.Types.ObjectId(req.body.site)
    })
      .populate("test aparat")
      .exec(function(err, assay) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (assay) {
            var ref = {};
            ref.analit = req.body.analit;
            ref.grupa = req.body.refGrupa;
            ref.refd = req.body.dRef;
            ref.refg = req.body.gRef;
            ref.dDob = req.body.dDob;
            ref.gDob = req.body.gDob;
            ref.spol = req.body.spol;
            assay.reference.push(ref);
            assay.save(function(err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                var referentne = [];
                assay.reference.forEach(element => {
                  if (element.analit === req.body.analit) {
                    referentne.push(element);
                  }
                });
                res.json({
                  success: true,
                  message: "Referentna sacuvana",
                  referentne
                });
              }
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronadjen test aparata"
            });
          }
        }
      });
  }
};

postavkeController.refAnalitDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test),
      site: mongoose.Types.ObjectId(req.body.site)
    })
      .populate("test aparat")
      .exec(function(err, assay) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (assay) {
            var referentne = [];
            assay.reference.forEach(element => {
              if (!element._id.equals(mongoose.Types.ObjectId(req.body.id))) {
                referentne.push(element);
              }
            });
            assay.reference = referentne;
            assay.save(function(err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                res.json({
                  success: true,
                  message: "Referentna izbrisana",
                  referentne
                });
              }
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronadjen test aparata"
            });
          }
        }
      });
  }
};

postavkeController.aptestCalculated = function(req, res) {
  var labtest = new LabAssays(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    labtest.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Postavka za kalkulirani labtest sačuvana"
        });
      }
    });
  }
};

postavkeController.kontroleSave = function(req, res) {
  req.body.aparat = req.body.reference[0].aparat;
  var reference = [];
  req.body.reference.forEach(element => {
    reference.push({
      anaassay: element._id,
      refd: element.refd,
      refg: element.refg,
      jedinica: element.test.jedinica
    });
  });
  req.body.reference = reference;
  var kontrola = new Kontrole(req.body);
  kontrola.save(function(err) {
    if (err) {
      console.log("Greška:", err);
      res.json({
        success: false,
        message: err
      });
    } else {
      res.json({
        success: true,
        message: "Postavka za kontrolu sačuvana"
      });
    }
  });
};

postavkeController.kontroleDetalji = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Kontrole.findOne({
      _id: req.body._id
    })
      .populate()
      .exec(function(err, kontrola) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (kontrola) {
            var i = 0;
            kontrola.reference.forEach(element => {
              AnaAssays.findOne({
                _id: mongoose.Types.ObjectId(element.anaassay)
              })
                .populate("test aparat")
                .exec(function(err, assay) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err
                    });
                  } else {
                    if (assay) {
                      element.anaassay = assay;
                      i++;
                      if (i === kontrola.reference.length) {
                        res.json({
                          success: true,
                          message: "OK",
                          kontrola
                        });
                      }
                    } else {
                      res.json({
                        success: true,
                        message: "Nije pronadjen test aparata"
                      });
                    }
                  }
                });
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronadjena kontrola aparata"
            });
          }
        }
      });
  }
};

postavkeController.paneliSave = function(req, res) {
  var panel = new Paneli(req.body);
  panel.save(function(err) {
    if (err) {
      console.log("Greška:", err);
      res.json({
        success: false,
        message: err
      });
    } else {
      res.json({
        success: true,
        message: "Postavka za panel sačuvana"
      });
    }
  });
};

postavkeController.paneliList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Paneli.find({ site: mongoose.Types.ObjectId(req.query.site) })
      .lean()
      .exec(function(err, paneli) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (paneli.length) {
            res.json({
              success: true,
              message: "Pronadjeni paneli",
              paneli: paneli
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronadjen niti jedan panel"
            });
          }
        }
      });
  }
};

postavkeController.referentneUpdate = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test),
      site: mongoose.Types.ObjectId(req.body.site)
    }).exec(function(err, assay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (assay) {
          var referentne = [];
          var ref = {};
          ref.grupa = req.body.grupa;
          ref.refd = req.body.refd;
          ref.dDob = req.body.dDob;
          ref.gDob = req.body.gDob;
          ref.refg = req.body.refg;
          ref.spol = req.body.spol;
          ref.interp = req.body.interp;
          ref.extend = req.body.extend;

          // console.log(req.body)

          assay.reference.forEach(element => {
            // console.log('Nisu pronadjene reference...')
            if (element._id != req.body.id) {
              element.extend = req.body.extend;
              referentne.push(element);
            }
            if (element._id.equals(mongoose.Types.ObjectId(req.body.id))) {
              // console.log('Pronadjene reference...')
              ref._id = element._id;
              referentne.push(ref);
            }
          });
          assay.reference = referentne;
          assay.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Referentna izmjenjena",
                referentne
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Nije pronadjen test aparata"
          });
        }
      }
    });
  }
};

postavkeController.refAnalitUpdate = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test),
      site: mongoose.Types.ObjectId(req.body.site)
    }).exec(function(err, assay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (assay) {
          var referentne = [];
          var ref = {};
          ref.analit = req.body.analit;
          ref.grupa = req.body.grupa;
          ref.refd = req.body.refd;
          ref.refg = req.body.refg;
          ref.dDob = req.body.dDob;
          ref.gDob = req.body.gDob;
          ref.spol = req.body.spol;
          ref.interp = req.body.interp;

          assay.reference.forEach(element => {
            if (!element._id.equals(mongoose.Types.ObjectId(req.body.id))) {
              referentne.push(element);
            }
            if (element._id.equals(mongoose.Types.ObjectId(req.body.id))) {
              referentne.push(ref);
            }
          });
          assay.reference = referentne;
          assay.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Referentna izmjenjena",
                referentne
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Nije pronadjen test aparata"
          });
        }
      }
    });
  }
};

postavkeController.sajtoviSave = function(req, res) {
  const jwt = require("jsonwebtoken");
  var writestream = fs.createWriteStream(
    config.site_path + req.body.sifra + ".jpeg"
  );
  var readstream = fs
    .createReadStream(config.multer_temp + req.body.sifra + ".jpeg")
    .pipe(writestream);

  writestream.on("finish", function() {
    var token = req.body.token || req.query.token;
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        res.json({
          status: "error",
          message: "Niste autorizirani",
          data: null
        });
      } else {
        req.body.decoded = decoded;
        req.body.created_by = req.body.decoded.user;
        var site = new Site(req.body);

        site.save(function(err, novisite) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
            });
          } else {
            User.findOne({
              email: "admin@atom.ba"
            }).exec(function(err, admin) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                if (admin) {
                  admin.sites.push(novisite._id);
                  admin.save();
                }
                fs.unlinkSync(config.multer_temp + req.body.sifra + ".jpeg");
                res.json({
                  success: true,
                  message: "Postavka za sajt sačuvana"
                });
              }
            });
          }
        });
      }
    });
  });
};

postavkeController.sajtoviList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.find({})
      .lean()
      .exec(function(err, sajtovi) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (sajtovi.length) {
            res.json({
              success: true,
              message: "Pronadjeni sajtovi",
              sajtovi: sajtovi
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronadjen niti jedan sajt"
            });
          }
        }
      });
  }
};

postavkeController.sajtoviDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.findOne({
      naziv: req.body.naziv
    }).exec(function(err, site) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (site) {
          site.remove();
          res.json({
            success: true,
            message: "Sajt uspjesno izbrisan"
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronadjen sajt"
          });
        }
      }
    });
  }
};

postavkeController.sajtoviEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.findOne({
      _id: req.body._id
    }).exec(function(err, site) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (site) {
          site.opis = req.body.opis;
          site.adresa = req.body.adresa;
          site.odgovornoLice = req.body.odgovornoLice;
          site.telefon = req.body.telefon;
          site.email = req.body.emailadr;
          site.web = req.body.web;
          site.save();
          res.json({
            success: true,
            message: "Ok",
            site: "Site je uspješno izmjenjen."
          });
        } else {
          res.json({
            success: false,
            message: "greska"
          });
        }
      }
    });
  }
};

postavkeController.getSajt = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.findOne({ _id: req.params.id })
      .lean()
      .exec(function(err, sajt) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (sajt) {
            res.json({
              success: true,
              message: "Pronadjeni sajt",
              sajt: sajt
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronadjen niti jedan sajt"
            });
          }
        }
      });
  }
};

postavkeController.refTipUpdate = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    // AnaAssays.find({site: mongoose.Types.ObjectId(req.body.site)}).populate('test').exec(function (err, assays) {
    //   if (err) {
    // console.log("Greška:", err)
    //   }
    //   else {

    //     assays.forEach(element => {
    //       if(!element.test.multi){
    //         element.interpretacija = 'Referentni interval'
    //         element.save()
    //       }
    //     })

    //     res.json({ success: true, message: 'AnaAssays izmjenjen' })
    //   }
    // })

    AnaAssays.findOne({ _id: req.body.id }).exec(function(err, assay) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (assay) {
          var assa = assay.toObject();
          delete assa._id;
          delete assa.__v;
          var auditAA = new Audit_AnaAssays(assa);
          auditAA.save();
          assay.tipoviUzorka = req.body.tipovi;
          assay.interpretacija = req.body.interpretacija;
          assay.updated_by = req.body.decoded.user;
          assay.updated_at = Date.now();
          assay.save();
          res.json({
            success: true,
            message: "Ok",
            data: "Tip je uspješno izmjenjen."
          });
        } else {
          res.json({ success: false, message: "greska" });
        }
      }
    });
  }
};

postavkeController.userSajtoviList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    User.findOne({ email: req.body.decoded.user })
      .populate("sites")
      .exec(function(err, korisnik) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (korisnik) {
            res.json({
              success: true,
              message: "Pronadjeni sajtovi",
              sajtovi: korisnik.sites
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronadjen niti jedan sajt"
            });
          }
        }
      });
  }
};

postavkeController.panelDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Paneli.findOne({
      sifra: req.body.sifra,
      site: req.body.site
    }).exec(function(err, panel) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (panel) {
          panel.remove();
          res.json({
            success: true,
            message: "Panel izbrisan"
          });
        } else {
          res.json({
            success: true,
            message: "Nije pronadjen niti jedan panel"
          });
        }
      }
    });
  }
};

postavkeController.mjestaDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.findOne({
      _id: req.body.site
    }).exec(function(err, site) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (site) {
          for (var i = 0; i < site.mjesta.length; i++) {
            if (site.mjesta[i] === req.body.mjesto) {
              site.mjesta.splice(i, 1);
              site.save();
              break;
            }
          }
          res.json({
            success: true,
            message: "Ok",
            site: "Mjesto je uspješno obrisano."
          });
        } else {
          res.json({
            success: false,
            message: "Greška."
          });
        }
      }
    });
  }
};

postavkeController.mjestoSave = function(req, res) {
  req.body.mjesto = req.body.mjesto.toUpperCase().trim();

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.findOne({
      _id: req.body.site
    }).exec(function(err, site) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (site) {
          site.mjesta.push(req.body.mjesto);
          site.save();
          res.json({
            success: true,
            message: "Ok",
            site: "Mjesto je uspješno dodano."
          });
        } else {
          res.json({
            success: false,
            message: "Greška."
          });
        }
      }
    });
  }
};

// 29.05.2019
// client/src/components/anaassays

postavkeController.SaveReference = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.anaassay),
      site: mongoose.Types.ObjectId(req.body.site)
    }).exec(function(err, assay) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        if (assay) {
          var referentne = req.body.referentne;

          /* referentne = referentne.sort(function (a, b) {
            return a.dDob.localeCompare(b.dDob, undefined, {
              numeric: true,
              sensitivity: 'base'
            }) 
            || a.grupa.localeCompare(b.grupa, undefined, {
              numeric: true,
              sensitivity: 'base'
            }) 
            || a.spol.localeCompare(b.spol, undefined, {
              numeric: true,
              sensitivity: 'base'
            })
          }) */

          assay.reference = referentne;

          assay.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Referentna vrijednost uspješno izmjenjena.",
                referentne
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Nije pronađen test aparata."
          });
        }
      }
    });
  }
};

postavkeController.AddRefMulti = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    AnaAssays.findOne({
      _id: mongoose.Types.ObjectId(req.body.test),
      site: mongoose.Types.ObjectId(req.body.site)
    })
      .populate("test aparat")
      .exec(function(err, assay) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (assay) {
            var ref = {};
            ref.analit = req.body.analit;
            ref.grupa = req.body.refGrupa;
            ref.refd = req.body.dRef;
            ref.refg = req.body.gRef;
            ref.dDob = req.body.dDob;
            ref.gDob = req.body.gDob;
            ref.spol = req.body.spol;

            assay.reference.push(ref);

            assay.save(function(err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                res.json({
                  success: true,
                  message: "Referentna vrijednost uspješno sačuvana.",
                  referentne: assay.reference
                });
              }
            });
          } else {
            res.json({
              success: true,
              message: "Nije pronađen test aparata."
            });
          }
        }
      });
  }
};

module.exports = postavkeController;
