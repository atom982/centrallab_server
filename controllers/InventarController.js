var mongoose = require("mongoose");

var Inventar = require("../models/Inventar");

var OJ = mongoose.model("OJ");
var Dobavljac = mongoose.model("Dobavljac");
var VrstaUgovora = mongoose.model("VrstaUgovora");
var Produkt = mongoose.model("Produkt");
var Ugovor = mongoose.model("Ugovor");

var inventarController = {};

inventarController.CreateOJ = function(req, res) {
  var lokacija = new OJ(req.body.lokacija);
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
        OJ.find({})
          .populate("site")
          .exec(function(err, lokacije) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              lokacije.forEach(element => {
                element.site_code = element.site.sifra;
              });

              lokacije = lokacije.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });

              res.json({
                success: true,
                message: "Unos uspješno obavljen.",
                lokacije: lokacije
              });
            }
          });
      }
    });
  }
};

inventarController.ListOJ = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    OJ.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, lista) {
      res.json({
        success: true,
        message: "Lista organizacionih jedinica",
        list: lista
      })
    }) 
  }
};

inventarController.EditOJ = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    OJ.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.lokacija._id) },

      {
        naziv: req.body.lokacija.naziv,
        site: mongoose.Types.ObjectId(req.body.lokacija.site._id),
        __v: req.body.lokacija.__v
      },

      { upsert: false }
    ).exec(function(err, lokacija) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Lokacija.find({})
          .populate("site")
          .exec(function(err, lokacije) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              lokacije.forEach(element => {
                element.site_code = element.site.sifra;
              });

              lokacije = lokacije.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });

              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                lokacija: lokacija
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteOJ = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    OJ.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.lokacija._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          OJ.find({})
            .populate("site")
            .exec(function(err, lokacije) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                lokacije.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                lokacije = lokacije.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  lokacije: lokacije
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateDob = function(req, res) {
  var dobavljac = new Dobavljac(req.body.dobavljac);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    dobavljac.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Dobavljac.find({})
          .populate("site")
          .exec(function(err, dobavljaci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(dobavljaci.length){
                dobavljaci.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                dobavljaci = dobavljaci.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  dobavljaci: dobavljaci
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  dobavljaci: []
                });
              }
            }
          });
      }
    });
  }
};
inventarController.ListDob = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Dobavljac.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, lista) {
      res.json({
        success: true,
        message: "Lista organizacionih jedinica",
        dobavljaci: lista
      })
    }) 
  }
};
inventarController.EditDob = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Dobavljac.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.dobavljac._id) },

      {
        naziv: req.body.dobavljac.naziv,
        idbroj: req.body.dobavljac.idbroj,
        adresa: req.body.dobavljac.adresa,
        tel: req.body.dobavljac.tel,
        email: req.body.dobavljac.email,
        site: mongoose.Types.ObjectId(req.body.dobavljac.site._id),
        created_by:req.body.dobavljac.created_by,
        updated_by:req.body.decoded.user,
        __v: req.body.dobavljac.__v
      },
      { upsert: false }
    ).exec(function(err, dobavljac) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Dobavljac.find({})
          .populate("site")
          .exec(function(err, dobavljaci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              dobavljaci.forEach(element => {
                element.site_code = element.site.sifra;
              });

              dobavljaci =  dobavljaci.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                dobavljaci: dobavljaci
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteDob = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Dobavljac.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.dobavljac._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Dobavljac.find({})
            .populate("site")
            .exec(function(err, dobavljaci) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                dobavljaci.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                dobavljaci = dobavljaci.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  dobavljaci: dobavljaci
                });
              }
            });
        }
      }
    );
  }
};
inventarController.CreateVrsta = function(req, res) {
  var vrstaugovora = new VrstaUgovora(req.body.vrsta);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    vrstaugovora.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        VrstaUgovora.find({})
          .populate("site")
          .exec(function(err, vrsteugovora) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(vrsteugovora.length){
                vrsteugovora.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                vrsteugovora = vrsteugovora.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  vrsteugovora: vrsteugovora
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  vrsteugovora: []
                });
              }
            }
          });
      }
    });
  }
};
inventarController.ListVrsta = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    VrstaUgovora.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, vrsteugovora) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        vrsteugovora: vrsteugovora
      })
    }) 
  }
};
inventarController.EditVrsta = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    VrstaUgovora.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.vrsta._id) },

      {
        naziv: req.body.vrsta.naziv,
        site: mongoose.Types.ObjectId(req.body.vrsta.site._id),
        __v: req.body.vrsta.__v
      },
      { upsert: false }
    ).exec(function(err, vrsta) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        VrstaUgovora.find({})
          .populate("site")
          .exec(function(err, vrsteugovora) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              vrsteugovora.forEach(element => {
                element.site_code = element.site.sifra;
              });

              vrsteugovora =  vrsteugovora.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                vrsteugovora: vrsteugovora
              });
            }
          });
      }
    });
  }
};
inventarController.DeleteVrsta = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    VrstaUgovora.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.vrsta._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          VrstaUgovora.find({})
            .populate("site")
            .exec(function(err, vrsteugovora) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                vrsteugovora.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                vrsteugovora = vrsteugovora.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  vrsteugovora: vrsteugovora
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateUgovor = function(req, res) {
  
  req.body.ugovor.created_by = req.body.decoded.user
  var ugovor = new Ugovor(req.body.ugovor);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    ugovor.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Ugovor.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, ugovori) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(ugovori.length){
                ugovori.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                ugovori = ugovori.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  ugovori: ugovori
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  ugovori: []
                });
              }
            }
          });
      }
    });
  }
};

inventarController.ListUgovor = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Ugovor.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site vrsta dobavljac oj').exec(function (err, ugovori) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        ugovori: ugovori
      })
    }) 
  }
};

inventarController.EditUgovor = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Ugovor.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.ugovor._id) },

      {
        naziv: req.body.ugovor.naziv,
        vrijednost:req.body.ugovor.vrijednost,
        vazi_od:req.body.ugovor.vazi_od,
        vazi_do:req.body.ugovor.vazi_do,
        created_at:req.body.ugovor.created_at,
        updated_at:req.body.ugovor.updated_at,
        created_by:req.body.ugovor.created_by,
        vrsta:mongoose.Types.ObjectId(req.body.ugovor.vrsta._id),
        dobavljac:mongoose.Types.ObjectId(req.body.ugovor.dobavljac._id),
        oj:mongoose.Types.ObjectId(req.body.ugovor.oj._id),
        site: mongoose.Types.ObjectId(req.body.ugovor.site._id),
        __v: req.body.ugovor.__v
      },
      { upsert: false }
    ).exec(function(err, ugovor) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Ugovor.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, ugovori) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              ugovori.forEach(element => {
                element.site_code = element.site.sifra;
              });

              ugovori =  ugovori.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                ugovori: ugovori
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteUgovor = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Ugovor.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.ugovor._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Ugovor.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, ugovori) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                ugovori.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                ugovori = ugovori.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  ugovori: ugovori
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateKlasa = function(req, res) {
  

  var klasa = new Klasa(req.body.klasa);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    klasa.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Klasa.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, klase) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(klase.length){
                klase.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                klase = klase.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  klase: klase
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  ugovori: []
                });
              }
            }
          });
      }
    });
  }
};
inventarController.ListKlasa = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klasa.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, klase) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        klase: klase
      })
    }) 
  }
};

inventarController.EditKlasa = function(req, res) {
 
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klasa.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.klasa._id) },

      {
        naziv: req.body.klasa.naziv,
        site: mongoose.Types.ObjectId(req.body.klasa.site._id),
        __v: req.body.klasa.__v
      },
      { upsert: false }
    ).exec(function(err, klasa) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Klasa.find({})
          .populate("site")
          .exec(function(err, klase) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              klase.forEach(element => {
                element.site_code = element.site.sifra;
              });

              klase =  klase.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                klase: klase
              });
            }
          });
      }
    });
  }
};
inventarController.DeleteKlasa = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klasa.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.klasa._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Klasa.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, klase) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                klase.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                klase = klase.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  klase: klase
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateProgram = function(req, res) {
  

  var program = new Program(req.body.program);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    program.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Program.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, programi) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(programi.length){
                programi.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                programi = programi.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  programi: programi
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  programi: []
                });
              }
            }
          });
      }
    });
  }
};

inventarController.ListProgram = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Program.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, programi) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        programi: programi
      })
    }) 
  }
};

inventarController.EditProgram = function(req, res) {
 
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Program.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.program._id) },

      {
        naziv: req.body.program.naziv,
        site: mongoose.Types.ObjectId(req.body.program.site._id),
        __v: req.body.program.__v
      },
      { upsert: false }
    ).exec(function(err, program) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Program.find({})
          .populate("site")
          .exec(function(err, programi) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              programi.forEach(element => {
                element.site_code = element.site.sifra;
              });

              programi =  programi.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                programi: programi
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteProgram = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Program.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.program._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Program.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, programi) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                programi.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                programi = programi.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  programi: programi
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreatePlatforma = function(req, res) {
  

  var platforma = new Platforma(req.body.platforma);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    platforma.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Platforma.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, platforme) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(platforme.length){
                platforme.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                platforme = platforme.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  platforme: platforme
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  platforme: []
                });
              }
            }
          });
      }
    });
  }
};

inventarController.ListPlatforma = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Platforma.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, platforme) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        platforme: platforme
      })
    }) 
  }
};

inventarController.EditPlatforma = function(req, res) {
 
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Platforma.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.platforma._id) },

      {
        naziv: req.body.platforma.naziv,
        site: mongoose.Types.ObjectId(req.body.platforma.site._id),
        __v: req.body.platforma.__v
      },
      { upsert: false }
    ).exec(function(err, platforma) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Platforma.find({})
          .populate("site")
          .exec(function(err, platforme) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              platforme.forEach(element => {
                element.site_code = element.site.sifra;
              });

              platforme =  platforme.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                platforme: platforme
              });
            }
          });
      }
    });
  }
};

inventarController.DeletePlatforma = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Platforma.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.platforma._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Platforma.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, platforme) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                platforme.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                platforme = platforme.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  platforme: platforme
                });
              }
            });
        }
      }
    );
  }
};

inventarController.CreateProdukt = function(req, res) {

  req.body.produkt.created_by = req.body.decoded.user
  req.body.produkt.site = req.body.site
  var produkt = new Produkt(req.body.produkt);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
   produkt.save(function(err) {
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
        })
      }
    });
  }
};
inventarController.ReadProdukt = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Produkt.findOne({site:mongoose.Types.ObjectId(req.body.site), LN:req.body.LN}).populate('site klasa program platforma').exec(function (err, produkt) {
      if(produkt){
        res.json({
          success: true,
          message: "Produkt postoji",
          produkt: produkt
        })
      }else{
        res.json({
          success: false,
          message: "Produkt ne postoji",
          produkt: {}
        })
      }

    })
  }
};

inventarController.apiUrlProdukti = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var limit = 50000;

    if (!req.query.filter) {
      req.query.filter = "";
      limit = 100;
    }

    if (req.query.filter === "") {
      req.query.filter = "";
      limit = 100;
    } else {
      limit = 50000;
    }

    var uslov = { site: mongoose.Types.ObjectId(req.query.site) };

    switch (parametar) {
      case "LN":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          LN: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };
        break;

      case "OPIS":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          opis: {
            $regex: ".*" + req.query.filter.toUpperCase() + ".*"
          }
        };

        break;

      case "PAKOVANJE":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          pakovanje: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };

        break;

      default:
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),     
        };
        break;
    }

    Produkt.find(uslov)
      .sort({ _id: -1 })
      .populate('proizvodjac')
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "LN":
              results = results.filter(function(result) {
                return result.LN
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "OPIS":
              results = results.filter(function(result) {
                return result.opis
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "PAKOVANJE":
              results = results.filter(function(result) {
                return result.pakovanje
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var fil = req.query.filter.split(" ");    
              if(req.query.filter!=="" && fil.length){
              results = results.filter(function(result) {
                  return fil.some(word => result.LN.toLowerCase().indexOf(word.toLowerCase()) !== -1 || result.opis.toLowerCase().includes(word.toLowerCase()) )
              });
             }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "inventar/produkti?sort=" +
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
            "inventar/produkti?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "LN":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.LN == b.LN ? 0 : +(a.LN > b.LN) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.LN == b.LN ? 0 : +(a.LN < b.LN) || -1;
                });
              }
              break;
            case "opis":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.opis == b.opis
                    ? 0
                    : +(a.opis > b.opis) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.opis == b.opis
                    ? 0
                    : +(a.opis < b.opis) || -1;
                });
              }
              break;
            case "pakovanje":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.pakovanje == b.pakovanje ? 0 : +(a.pakovanje > b.pakovanje) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.pakovanje == b.pakovanje ? 0 : +(a.pakovanje < b.pakovanje) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(produkt => {
            switch (produkt.spol) {
              case "MUŠKI":
                var icon =
                  '<span style="font-size: 12px; color:#4ab2e3;" class="fa fa-mars"></span>';
                break;
              case "ŽENSKI":
                var icon =
                  '<span style="font-size: 12px; color:#db76df;" class="fa fa-venus"></span>';
                break;
              default:
                var icon =
                  '<span style="font-size: 12px; color:#f7cc36;" class="fa fa-genderless"></span>';
                break;
            }

            var prijem =
              "<button style='white-space: nowrap;' title='' id='" +
              produkt.LN +
              "' style='font-size: 11px;' class='btn btn-secondary-info btn-micro'><span id='" +
              produkt.LN +
              "' style='font-size: 12px;' class='fa fa-flask'></span> <span style='text-transform: none; font-size: 12px;'>Prijem</span></button>";



            var izmjeni =
              "<button style='white-space: nowrap;' title='' id='" +
              produkt._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              produkt._id +
              "' class='fa fa-edit'></span> Uredi</button>";

            json.data.push({
              icon: icon,
              LN: produkt.LN,
              OPIS: produkt.opis,
              PAKOVANJE: produkt.pakovanje,
              MJERA: produkt.jedinica_mjere,
              PROIZVODJAC:produkt.proizvodjac.naziv,
              IZMJENI:izmjeni,
              id: produkt._id
            });
          });
          res.json(json);
        }
      });
  }
};
inventarController.ListProdukti = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Produkt.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, lista) {
      res.json({
        success: true,
        message: "Lista oproizvoda",
        proizvodi: lista
      })
    }) 
  }
};
//--------------------------------------------
inventarController.CreateProizvodjac = function(req, res) {
  

  var proizvodjac = new Proizvodjac(req.body.proizvodjac);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    proizvodjac.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Proizvodjac.find({})
          .populate("site vrsta dobavljac oj")
          .exec(function(err, proizvodjaci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(proizvodjaci.length){
                proizvodjaci.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                proizvodjaci = proizvodjaci.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  proizvodjaci: proizvodjaci
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  proizvodjaci: []
                });
              }
            }
          });
      }
    });
  }
};

inventarController.ListProizvodjac = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Proizvodjac.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, proizvodjaci) {
      res.json({
        success: true,
        message: "Lista vrsta ugovora",
        proizvodjaci: proizvodjaci
      })
    }) 
  }
};

inventarController.EditProizvodjac = function(req, res) {
 
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Proizvodjac.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.proizvodjac._id) },

      {
        naziv: req.body.proizvodjac.naziv,
        site: mongoose.Types.ObjectId(req.body.proizvodjac.site._id),
        __v: req.body.proizvodjac.__v
      },
      { upsert: false }
    ).exec(function(err, proizvodjac) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Proizvodjac.find({})
          .populate("site")
          .exec(function(err, proizvodjaci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              proizvodjaci.forEach(element => {
                element.site_code = element.site.sifra;
              });

              proizvodjaci =  proizvodjaci.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                proizvodjaci: proizvodjaci
              });
            }
          });
      }
    });
  }
};

inventarController.DeleteProizvodjac = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Proizvodjac.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.proizvodjac._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Proizvodjac.find({})
            .populate("site vrsta dobavljac oj")
            .exec(function(err, proizvodjaci) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                proizvodjaci.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                proizvodjaci = proizvodjaci.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  proizvodjaci: proizvodjaci
                });
              }
            });
        }
      }
    );
  }
};
//-------------------------------------------
inventarController.CreateKlijent = function(req, res) {
  
  req.body.klijent.created_by = req.body.decoded.user
  var klijent = new Klijent(req.body.klijent);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    klijent.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Klijent.find({})
          .populate("site")
          .exec(function(err, klijenti) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(klijenti.length){
                klijenti.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                klijenti = klijenti.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  klijenti: klijenti
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  klijenti: []
                });
              }
            }
          });
      }
    });
  }
};
inventarController.ListKlijenti = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klijent.find({site:mongoose.Types.ObjectId(req.query.site)}).populate('site').exec(function (err, klijenti) {
      res.json({
        success: true,
        message: "Lista organizacionih jedinica",
        klijenti: klijenti
      })
    }) 
  }
};
inventarController.EditKlijent = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klijent.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.klijent._id) },

      {
        naziv: req.body.klijent.naziv,
        idbroj: req.body.klijent.idbroj,
        adresa: req.body.klijent.adresa,
        tel: req.body.klijent.tel,
        email: req.body.klijent.email,
        default:req.body.klijent.default,
        site: mongoose.Types.ObjectId(req.body.klijent.site._id),
        created_by:req.body.klijent.created_by,
        updated_by:req.body.decoded.user,
        __v: req.body.klijent.__v
      },
      { upsert: false }
    ).exec(function(err, klijent) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Klijent.find({})
          .populate("site")
          .exec(function(err, klijenti) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              klijenti.forEach(element => {
                element.site_code = element.site.sifra;
              });

              klijenti =  klijenti.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });
              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                klijenti: klijenti
              });
            }
          });
      }
    });
  }
};
inventarController.DeleteKlijent = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Klijent.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.klijent._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Klijent.find({})
            .populate("site")
            .exec(function(err, klijenti) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                klijenti.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                klijenti = klijenti.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  klijenti: klijenti
                });
              }
            });
        }
      }
    );
  }
};
inventarController.CreateCijeneD= function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    var counter  = 0
    req.body.cijene.forEach(element => {
      element.created_by = req.body.decoded.user
      var dobavljacc = new CijenaDobavljac(element);
      dobavljacc.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          counter++    
          if(counter ===req.body.cijene.length){
            res.json({
              success: true,
              message: "Unos uspješno obavljen.",
            });
          }   
        }
      });
    });
  }
};
inventarController.CreateCijeneK= function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    var counter  = 0
    req.body.cijene.forEach(element => {
      element.created_by = req.body.decoded.user
      var klijentc = new CijenaKlijent(element);
      klijentc.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          counter++    
          if(counter ===req.body.cijene.length){
            res.json({
              success: true,
              message: "Unos uspješno obavljen.",
            });
          }   
        }
      });
    });
  }
};
inventarController.apiUrlUgovori = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var limit = 50000;

    if (!req.query.filter) {
      req.query.filter = "";
      limit = 100;
    }

    if (req.query.filter === "") {
      req.query.filter = "";
      limit = 100;
    } else {
      limit = 50000;
    }

    var uslov = { site: mongoose.Types.ObjectId(req.query.site) };

    switch (parametar) {

      case "LN":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          LN: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };
        break;

      case "OPIS":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          opis: {
            $regex: ".*" + req.query.filter.toUpperCase() + ".*"
          }
        };

        break;

      case "PAKOVANJE":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          pakovanje: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };

        break;

      default:
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),     
        };
        break;
    }

    if(req.query.datum ==="KLIJENTI"){

  
    CijenaKlijent.find(uslov)
      .sort({ _id: -1 })
      .populate('produkt klijent')
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          // console.log('results')
          // console.log(results)
          switch (parametar) {
            case "NAZIV":
              results = results.filter(function(result) {
                return result.klijent.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "LN":
              results = results.filter(function(result) {
                return result.produkt.LN
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "OPIS":
              results = results.filter(function(result) {
                return result.produkt.opis
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "PAKOVANJE":
              results = results.filter(function(result) {
                return result.produkt.pakovanje
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var fil = req.query.filter.split(" ");    
              if(req.query.filter!=="" && fil.length){
              results = results.filter(function(result) {
                  return fil.some(word => result.produkt.LN.toLowerCase().indexOf(word.toLowerCase()) !== -1 || result.produkt.opis.toLowerCase().includes(word.toLowerCase()) )
              });
             }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "inventar/ugovori?sort=" +
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
            "inventar/ugovori?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "LN":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.LN == b.produkt.LN ? 0 : +(a.produkt.LN > b.produkt.LN) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.LN == b.produkt.LN ? 0 : +(a.produkt.LN < b.produkt.LN) || -1;
                });
              }
              break;
            case "opis":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.opis == b.produkt.opis
                    ? 0
                    : +(a.produkt.opis > b.produkt.opis) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.opis == b.produkt.opis
                    ? 0
                    : +(a.produkt.opis < b.produkt.opis) || -1;
                });
              }
              break;
            case "pakovanje":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.pakovanje == b.produkt.pakovanje ? 0 : +(a.produkt.pakovanje > b.produkt.pakovanje) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.pakovanje == b.produkt.pakovanje ? 0 : +(a.produkt.pakovanje < b.produkt.pakovanje) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(cijena => {
            switch (cijena.spol) {
              case "MUŠKI":
                var icon =
                  '<span style="font-size: 12px; color:#4ab2e3;" class="fa fa-mars"></span>';
                break;
              case "ŽENSKI":
                var icon =
                  '<span style="font-size: 12px; color:#db76df;" class="fa fa-venus"></span>';
                break;
              default:
                var icon =
                  '<span style="font-size: 12px; color:#f7cc36;" class="fa fa-genderless"></span>';
                break;
            }

            var prijem =
              "<button style='white-space: nowrap;' title='' id='" +
              cijena.LN +
              "' style='font-size: 11px;' class='btn btn-secondary-info btn-micro'><span id='" +
              cijena.LN +
              "' style='font-size: 12px;' class='fa fa-flask'></span> <span style='text-transform: none; font-size: 12px;'>Prijem</span></button>";



            var izmjeni =
              "<button style='white-space: nowrap;' title='' id='" +
              cijena._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              cijena._id +
              "' class='fa fa-edit'></span> Uredi</button>";

            json.data.push({
              icon: icon,
              NAZIV:cijena.klijent.naziv,
              LN: cijena.produkt.LN,
              OPIS: cijena.produkt.opis,
              PAKOVANJE: cijena.produkt.pakovanje,
              MJERA: cijena.produkt.jedinica_mjere,
              CIJENA:cijena.cijena,
              IZMJENI:izmjeni,
              id: cijena._id
            });
          });
          res.json(json);
        }
      });
    }else{
      // case DOBAVLJACI
      CijenaDobavljac.find(uslov)
      .sort({ _id: -1 })
      .populate('produkt dobavljac klijent')
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "LN":
              results = results.filter(function(result) {
                return result.produkt.LN
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "OPIS":
              results = results.filter(function(result) {
                return result.produkt.opis
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "PAKOVANJE":
              results = results.filter(function(result) {
                return result.produkt.pakovanje
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var fil = req.query.filter.split(" ");    
              if(req.query.filter!=="" && fil.length){
              results = results.filter(function(result) {
                  return fil.some(word => result.produkt.LN.toLowerCase().indexOf(word.toLowerCase()) !== -1 || result.produkt.opis.toLowerCase().includes(word.toLowerCase()) )
              });
             }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "inventar/ugovori?sort=" +
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
            "inventar/ugovori?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "LN":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.LN == b.produkt.LN ? 0 : +(a.produkt.LN > b.produkt.LN) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.LN == b.produkt.LN ? 0 : +(a.produkt.LN < b.produkt.LN) || -1;
                });
              }
              break;
            case "opis":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.opis == b.produkt.opis
                    ? 0
                    : +(a.produkt.opis > b.produkt.opis) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.opis == b.produkt.opis
                    ? 0
                    : +(a.produkt.opis < b.produkt.opis) || -1;
                });
              }
              break;
            case "pakovanje":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.pakovanje == b.produkt.pakovanje ? 0 : +(a.produkt.pakovanje > b.produkt.pakovanje) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.pakovanje == b.produkt.pakovanje ? 0 : +(a.produkt.pakovanje < b.produkt.pakovanje) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(cijena => {
            switch (cijena.spol) {
              case "MUŠKI":
                var icon =
                  '<span style="font-size: 12px; color:#4ab2e3;" class="fa fa-mars"></span>';
                break;
              case "ŽENSKI":
                var icon =
                  '<span style="font-size: 12px; color:#db76df;" class="fa fa-venus"></span>';
                break;
              default:
                var icon =
                  '<span style="font-size: 12px; color:#f7cc36;" class="fa fa-genderless"></span>';
                break;
            }

            var prijem =
              "<button style='white-space: nowrap;' title='' id='" +
              cijena.LN +
              "' style='font-size: 11px;' class='btn btn-secondary-info btn-micro'><span id='" +
              cijena.LN +
              "' style='font-size: 12px;' class='fa fa-flask'></span> <span style='text-transform: none; font-size: 12px;'>Prijem</span></button>";


            var izmjeni =
              "<button style='white-space: nowrap;' title='' id='" +
              cijena._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              cijena._id +
              "' class='fa fa-edit'></span> Uredi</button>";

            json.data.push({
              icon: icon,
              NAZIV:cijena.dobavljac.naziv,
              ZA_KLIJENTA:cijena.klijent.naziv,
              LN: cijena.produkt.LN,
              OPIS: cijena.produkt.opis,
              PAKOVANJE: cijena.produkt.pakovanje,
              MJERA: cijena.produkt.jedinica_mjere,
              CIJENA:cijena.cijena,
              IZMJENI:izmjeni,
              id: cijena._id
            });
          });
          res.json(json);
        }
      });
    }
  }
};
inventarController.ListCijeneD = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    CijenaDobavljac.find({site:mongoose.Types.ObjectId(req.query.site),klijent:mongoose.Types.ObjectId(req.query.klijent),dobavljac:mongoose.Types.ObjectId(req.query.dobavljac)}).populate('site produkt dobavljac').exec(function (err, produkti) {
      res.json({
        success: true,
        message: "Lista cijena i produkata za dobavljaca",
        produkti: produkti
      })
    }) 
  }
};
inventarController.CreateUlaz = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    var counter  = 0
    req.body.ulaz.forEach(element => {
      element.created_by = req.body.decoded.user
      var ulaz = new Ulaz(element);
      ulaz.save(function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          counter++    
          if(counter ===req.body.ulaz.length){
            if(req.body.ulaz[0].narudzbenica != ''){
              Narudzbenica.findOne({_id:req.body.ulaz[0].narudzbenica}).populate('site').exec(function (err, narudzbenica) {
               
                if(narudzbenica){
                  var count = 0
                  narudzbenica.produkti.forEach(stavka => {
                    req.body.ulaz.forEach(ulaz => {
                      if(stavka.produkt.equals(mongoose.Types.ObjectId(ulaz.produkt)) && stavka.kolicina===ulaz.kolicina){
                          count++
                      }
                    });
                  });
                  if(count = narudzbenica.produkti.length){
                    narudzbenica.status = "ZAPRIMLJENO"
                    narudzbenica.save()
                  }
                }
              })
            }
            res.json({
              success: true,
              message: "Unos uspješno obavljen.",
            });
          }   
        }
      });
    });
  }
};
inventarController.ListCijeneK = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    CijenaKlijent.find({site:mongoose.Types.ObjectId(req.query.site),klijent:mongoose.Types.ObjectId(req.query.klijent)}).populate('site produkt klijent').exec(function (err, produkti) {
      res.json({
        success: true,
        message: "Lista cijena i produkata za dobavljaca",
        produkti: produkti
      })
    }) 
  }
};
inventarController.ListUlaz = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Ulaz.find({site:mongoose.Types.ObjectId(req.query.site),status:"STANJE"}).populate('site produkt klijent').exec(function (err, produkti) {
      res.json({
        success: true,
        message: "Lista ulaznog stanja",
        produkti: produkti
      })
    }) 
  }
};
inventarController.CreateIzlaz = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    var counter  = 0
    req.body.izdato.forEach(element => {
      element.created_by = req.body.decoded.user
      var izlaz = new Izlaz(element);
      izlaz.save(function(err,saved) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          counter++    
          //
          Ulaz.findOne({_id:saved.ulaz}).exec(function (err, found) {
            if (found) {
              if(found.kolicina == saved.kolicina){
                found.status ="RAZDUZEN"
                found.kolicina = "0"
                found.save()
                console.log("updatej ulaz sa nula i status RAZDUZEN")
              }else{
                found.kolicina = found.kolicina - saved.kolicina
                found.save()
                console.log('updateaj samo novo stanje za ulaz found.koliciona- saved .kolicina')
              }
            }

          })
          //
          if(counter ===req.body.izdato.length){
            res.json({
              success: true,
              message: "Izlaz uspješno obavljen.",
            });
          }   
        }
      });
    });
  }
};
inventarController.apiUrlStanje = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var limit = 50000;

    if (!req.query.filter) {
      req.query.filter = "";
      limit = 100;
    }

    if (req.query.filter === "") {
      req.query.filter = "";
      limit = 100;
    } else {
      limit = 50000;
    }

    var uslov = { site: mongoose.Types.ObjectId(req.query.site) };

    switch (parametar) {
      case "NAZIV":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          klijent: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" },
          status:"STANJE"
        };
        break;
      case "LN":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          LN: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" },
          status:"STANJE"
        };
        break;

      case "OPIS":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          opis: {
            $regex: ".*" + req.query.filter.toUpperCase() + ".*"
          },
          status:"STANJE"
        };

        break;

      case "PAKOVANJE":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          pakovanje: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" },
          status:"STANJE"
        };

        break;

      default:
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site), 
          status:"STANJE"    
        };
        break;
    }
  
    Ulaz.find(uslov)
      .sort({ _id: -1 })
      .populate('produkt dobavljac cijenad')
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "LN":
              results = results.filter(function(result) {
                return result.produkt.LN
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "OPIS":
              results = results.filter(function(result) {
                return result.produkt.opis
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "PAKOVANJE":
              results = results.filter(function(result) {
                return result.produkt.pakovanje
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var fil = req.query.filter.split(" ");    
              if(req.query.filter!=="" && fil.length){
              results = results.filter(function(result) {
                  return fil.some(word => result.produkt.LN.toLowerCase().indexOf(word.toLowerCase()) !== -1 || result.produkt.opis.toLowerCase().includes(word.toLowerCase()) )
              });
             }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "inventar/ugovori?sort=" +
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
            "inventar/ugovori?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "LN":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.LN == b.produkt.LN ? 0 : +(a.produkt.LN > b.produkt.LN) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.LN == b.produkt.LN ? 0 : +(a.produkt.LN < b.produkt.LN) || -1;
                });
              }
              break;
            case "opis":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.opis == b.produkt.opis
                    ? 0
                    : +(a.produkt.opis > b.produkt.opis) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.opis == b.produkt.opis
                    ? 0
                    : +(a.produkt.opis < b.produkt.opis) || -1;
                });
              }
              break;
            case "pakovanje":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.produkt.pakovanje == b.produkt.pakovanje ? 0 : +(a.produkt.pakovanje > b.produkt.pakovanje) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.produkt.pakovanje == b.produkt.pakovanje ? 0 : +(a.produkt.pakovanje < b.produkt.pakovanje) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);
          function monthDiff(d2, d1) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }
         
          niz.forEach(stanje => {

            if ((new Date(stanje.expDT).getTime()) >= (new Date().getTime())) {
          
              var icon =
              '<span style="font-size: 12px; color:#33FF55;" class="fa fa-check"></span>';
              if (monthDiff(new Date(stanje.expDT), new Date()) < 3){
                
                var icon =
                '<span style="font-size: 12px; color:#FFD433;" class="fa fa-warning"></span>';
              }
            }else{
              var icon =
              '<span style="font-size: 12px; color:#FF3F33;" class="fa fa-exclamation-triangle"></span>'; 
             
            } 

            if(stanje.kolicina <= stanje.produkt.upozorenje){
              var iconk =
              '<span style="font-size: 12px; color:#FFD433;" class="fa fa-warning"></span>';
            }
           
            var izmjeni =
              "<button style='white-space: nowrap;' title='' id='" +
              stanje._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              stanje._id +
              "' class='fa fa-edit'></span> Uredi</button>"

            json.data.push({
              icon: icon,
              iconk:iconk,
              NAZIV:stanje.produkt.naziv,
              LN: stanje.produkt.LN,
              OPIS: stanje.produkt.opis,
              KOLICINA:stanje.kolicina,
              MJERA: stanje.produkt.jedinica_mjere,
              CIJENA:stanje.cijenad.cijena,
              PAKOVANJE: stanje.produkt.pakovanje,
              EXP:stanje.expDT,
              IZMJENI:izmjeni,
              id: stanje._id
            });
          });
          res.json(json);
        }
      });
    
  }
};
inventarController.CreateNarudzbenica = function(req, res) {

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Narudzbenica.find({site:mongoose.Types.ObjectId(req.body.narudzbenica.site),klijent:mongoose.Types.ObjectId(req.body.narudzbenica.klijent)})
    .populate("site")
    .exec(function(err, svenarudzbenice) {
      var d = new Date();
      req.body.narudzbenica.created_by = req.body.decoded.user
      var tmp = d.getFullYear().toString()
      req.body.narudzbenica.ID = (svenarudzbenice.length+1)+"/"+(d.getMonth()+1)+"-"+tmp.substring(2,4)
      var narudzbenica = new Narudzbenica(req.body.narudzbenica);
      
    narudzbenica.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Narudzbenica.find({site:mongoose.Types.ObjectId(req.body.narudzbenica.site),klijent:mongoose.Types.ObjectId(req.body.narudzbenica.klijent)})
          .populate("site")
          .exec(function(err, narudzbenice) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              if(narudzbenice.length){
                narudzbenice.forEach(element => {
                  element.site_code = element.site.sifra;
                });
  
                narudzbenice = narudzbenice.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });
  
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  narudzbenice: narudzbenice
                });
              }else{
                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  narudzbenice: []
                });
              }
            }
        });
      }
    });
  })
  }
};
inventarController.ListNarudzbenica = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Narudzbenica.find({site:mongoose.Types.ObjectId(req.query.site),klijent:mongoose.Types.ObjectId(req.query.klijent)}).populate('site produkti.produkt').exec(function (err, narudzbenice) {
      res.json({
        success: true,
        message: "Lista narudzbenica",
        narudzbenice: narudzbenice
      })
    }) 
  }
};
inventarController.ListNarudzbenicaN = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Narudzbenica.find({site:mongoose.Types.ObjectId(req.query.site),klijent:mongoose.Types.ObjectId(req.query.klijent),status:"NARUČENO"}).populate('site produkti.produkt').exec(function (err, narudzbenice) {
      res.json({
        success: true,
        message: "Lista narudzbenica",
        narudzbenice: narudzbenice
      })
    }) 
  }
};
inventarController.apiUrlNarudzbenice = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var limit = 50000;

    if (!req.query.filter) {
      req.query.filter = "";
      limit = 100;
    }

    if (req.query.filter === "") {
      req.query.filter = "";
      limit = 100;
    } else {
      limit = 50000;
    }

    var uslov = { site: mongoose.Types.ObjectId(req.query.site) };

    switch (parametar) {
      case "ID":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          ID: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" },
          status:req.query.datum
        };
        break;
      case "KLIJENT":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          klijent: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" },
          status:req.query.datum
        };
        break;
        case "DOBAVLJAC":
          uslov = {
            site: mongoose.Types.ObjectId(req.query.site),
            dobavljac: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" },
            status:req.query.datum
          };
          break;
      default:
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),  
          status:req.query.datum
        };
        break;
    }
    Narudzbenica.find(uslov)
      .sort({ _id: -1 })
      .populate('klijent dobavljac site')
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ID":
              results = results.filter(function(result) {
                return result.ID
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "KLIJENT":
              results = results.filter(function(result) {
                return result.klijent.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "DOBAVLJAC":
              results = results.filter(function(result) {
                return result.dobavljac.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var fil = req.query.filter.split(" ");    
              if(req.query.filter!=="" && fil.length){
              results = results.filter(function(result) {
                  return fil.some(word => result.ID.toLowerCase().indexOf(word.toLowerCase()) !== -1 || result.ID.toLowerCase().includes(word.toLowerCase()) )
              });
             }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "inventar/narudzbenice?sort=" +
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
            "inventar/narudzbenice?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "ID":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.ID == b.ID ? 0 : +(a.ID > b.ID) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.ID == b.ID ? 0 : +(a.ID < b.ID) || -1;
                });
              }
              break;
            case "KLIJENT":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.klijent.naziv == b.klijent.naziv
                    ? 0
                    : +(a.klijent.naziv > b.klijent.naziv) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.klijent.naziv == b.klijent.naziv
                    ? 0
                    : +(a.klijent.naziv < b.klijent.naziv) || -1;
                });
              }
              break;
            case "DOBAVLJAC":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.dobavljac.naziv == b.dobavljac.naziv ? 0 : +(a.dobavljac.naziv > b.dobavljac.naziv) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.dobavljac.naziv == b.dobavljac.naziv ? 0 : +(a.dobavljac.naziv < b.dobavljac.naziv) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);
          function monthDiff(d2, d1) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }
         
          niz.forEach(narudzbenica => {
           
            var izmjeni =
              "<button style='white-space: nowrap;' title='' id='" +
              narudzbenica._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              narudzbenica._id +
              "' class='fa fa-edit'></span> Uredi</button>";

            json.data.push({
              ID:narudzbenica.ID,
              KLIJENT: narudzbenica.klijent.naziv,
              DOBAVLJAC: narudzbenica.dobavljac.naziv,
              STATUS:narudzbenica.status,
              DATUM: narudzbenica.created_at,
              IZMJENI:izmjeni,
              id: narudzbenica._id
            });
          });
          res.json(json);
        }
      });
    
  }
};
inventarController.apiUrlUlaz = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var limit = 50000;

    if (!req.query.filter) {
      req.query.filter = "";
      limit = 100;
    }

    if (req.query.filter === "") {
      req.query.filter = "";
      limit = 100;
    } else {
      limit = 50000;
    }

    var uslov = { site: mongoose.Types.ObjectId(req.query.site) };

    switch (parametar) {
      case "LN":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          LN: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };
        break;

      case "OPIS":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          opis: {
            $regex: ".*" + req.query.filter.toUpperCase() + ".*"
          }
        };

        break;

      case "PAKOVANJE":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          pakovanje: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };

        break;

      default:
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),     
        };
        break;
    }

    Ulaz.find(uslov)
      .sort({ _id: -1 })
      .populate('produkt dobavljac klijent narudzbenica cijenad site')
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "DOBAVLJAC":
              results = results.filter(function(result) {
                return result.dobavljac.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "KLIJENT":
              results = results.filter(function(result) {
                return result.klijent.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "RACUN":
              results = results.filter(function(result) {
                return result.racunbr
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var fil = req.query.filter.split(" ");    
              if(req.query.filter!=="" && fil.length){
              results = results.filter(function(result) {
                  return fil.some(word => result.dobavljac.naziv.toLowerCase().indexOf(word.toLowerCase()) !== -1 || result.klijent.naziv.toLowerCase().includes(word.toLowerCase()) )
              });
             }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "inventar/ulaz?sort=" +
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
            "inventar/ulaz?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "DOBAVLJAC":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.dobavljac.naziv == b.dobavljac.naziv ? 0 : +(a.dobavljac.naziv > b.dobavljac.naziv) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.dobavljac.naziv == b.dobavljac.naziv ? 0 : +(a.dobavljac.naziv < b.dobavljac.naziv) || -1;
                });
              }
              break;
            case "KLIJENT":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.klijent.naziv == b.klijent.naziv 
                    ? 0
                    : +(a.klijent.naziv  > b.klijent.naziv ) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.klijent.naziv  == b.klijent.naziv 
                    ? 0
                    : +(a.klijent.naziv < b.klijent.naziv ) || -1;
                });
              }
              break;
            case "RACUN":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.racunbr == b.racunbr ? 0 : +(a.racunbr > b.racunbr) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.racunbr == b.racunbr ? 0 : +(a.racunbr < b.racunbr) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(ulaz => {
            switch (ulaz.spol) {
              case "MUŠKI":
                var icon =
                  '<span style="font-size: 12px; color:#4ab2e3;" class="fa fa-mars"></span>';
                break;
              case "ŽENSKI":
                var icon =
                  '<span style="font-size: 12px; color:#db76df;" class="fa fa-venus"></span>';
                break;
              default:
                var icon =
                  '<span style="font-size: 12px; color:#f7cc36;" class="fa fa-genderless"></span>';
                break;
            }

            var prijem =
              "<button style='white-space: nowrap;' title='' id='" +
              ulaz.LN +
              "' style='font-size: 11px;' class='btn btn-secondary-info btn-micro'><span id='" +
              ulaz.LN +
              "' style='font-size: 12px;' class='fa fa-flask'></span> <span style='text-transform: none; font-size: 12px;'>Prijem</span></button>";



            var izmjeni =
              "<button style='white-space: nowrap;' title='' id='" +
              ulaz._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              ulaz._id +
              "' class='fa fa-edit'></span> Uredi</button>";

            json.data.push({
              icon: icon,
              DOBAVLJAC: ulaz.dobavljac.naziv,
              KLIJENT: ulaz.klijent.naziv,
              RACUN: ulaz.racunbr,
              PRODUKT:ulaz.produkt.opis,
              KOLICINA:ulaz.kolicina,
              CIJENA:ulaz.cijenad.cijena,
              DATUM: ulaz.created_at,
              NARUDZBENICA: (  ulaz.narudzbenica === null) ? '-' : ulaz.narudzbenica.ID ,
              IZMJENI:izmjeni,
              id: ulaz._id
            });
          });
          res.json(json);
        }
      });
  }
};
inventarController.apiUrlIzlaz = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var limit = 50000;

    if (!req.query.filter) {
      req.query.filter = "";
      limit = 100;
    }

    if (req.query.filter === "") {
      req.query.filter = "";
      limit = 100;
    } else {
      limit = 50000;
    }

    var uslov = { site: mongoose.Types.ObjectId(req.query.site) };

    switch (parametar) {
      case "LN":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          LN: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };
        break;

      case "OPIS":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          opis: {
            $regex: ".*" + req.query.filter.toUpperCase() + ".*"
          }
        };

        break;

      case "PAKOVANJE":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          pakovanje: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };

        break;

      default:
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),     
        };
        break;
    }

    Izlaz.find(uslov)
      .sort({ _id: -1 })
      .populate('ulaz klijent cijenak site produkt')
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "KLIJENT":
              results = results.filter(function(result) {
                return result.klijent.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break
            case "RACUN":
              results = results.filter(function(result) {
                return result.racunbr
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var fil = req.query.filter.split(" ");    
              if(req.query.filter!=="" && fil.length){
              results = results.filter(function(result) {
                  return fil.some(word => result.klijent.naziv.toLowerCase().indexOf(word.toLowerCase()) !== -1 || result.racun.naziv.toLowerCase().includes(word.toLowerCase()) )
              });
             }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "inventar/izlaz?sort=" +
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
            "inventar/izlaz?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "KLIJENT":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.klijent.naziv == b.klijent.naziv 
                    ? 0
                    : +(a.klijent.naziv  > b.klijent.naziv ) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.klijent.naziv  == b.klijent.naziv 
                    ? 0
                    : +(a.klijent.naziv < b.klijent.naziv ) || -1;
                });
              }
              break;
            case "RACUN":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.racunbr == b.racunbr ? 0 : +(a.racunbr > b.racunbr) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.racunbr == b.racunbr ? 0 : +(a.racunbr < b.racunbr) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(izlaz => {
            var izmjeni =
              "<button style='white-space: nowrap;' title='' id='" +
              izlaz._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              izlaz._id +
              "' class='fa fa-edit'></span> Uredi</button>";

            json.data.push({
              KLIJENT: izlaz.klijent.naziv,
              RACUN: izlaz.racunbr,
              PRODUKT: izlaz.produkt.opis,
              KOLICINA: izlaz.kolicina,
              CIJENA:izlaz.cijenak.cijena,
              DATUM: izlaz.created_at ,
              IZMJENI:izmjeni,
              id: izlaz._id
            });
          });
          res.json(json);
        }
      });
  }
};
module.exports = inventarController;
