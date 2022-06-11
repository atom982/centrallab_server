var mongoose = require("mongoose");
var Schema = require("../models/Postavke");
var Settings = mongoose.model("Settings");

var fs = require("fs");
const config = require("../config/index");

var settingsController = {};

// Sites

settingsController.SitesGet = function(req, res) {
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
          message: "Sites.",
          sites: sites
        });
      }
    });
  }
};

settingsController.SitesEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.element._id) },

      {
        sifra: req.body.element.sifra,
        naziv: req.body.element.naziv,
        opis: req.body.element.opis,
        adresa: req.body.element.adresa,
        odgovornoLice: req.body.element.odgovornoLice,
        telefon: req.body.element.telefon,
        mikrobioloski: req.body.element.mikrobioloski,
        email: req.body.element.email,
        mjesta: req.body.element.mjesta,
        web: req.body.element.web,
        sidebar: req.body.element.sidebar,
        postavke: req.body.element.postavke,
        created_at: req.body.element.created_at,
        updated_at: req.body.element.updated_at,
        created_by: req.body.element.created_by,
        updated_by: req.body.element.updated_by,
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
        res.json({
          success: true,
          message: "Izmjena uspješno obavljena.",
          element: element
        });
      }
    });
  }
};

settingsController.SidebarEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.findOne({
      _id: mongoose.Types.ObjectId(req.body.site)
    }).exec(function(err, site) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (site) {
          // site.sidebar = req.body.sidebar;

          // console.log(req.body.element.class);

          var Sidebar = [];

          site.sidebar.forEach(bar => {
            if (bar.naziv === req.body.element.naziv) {
              if (req.body.type === "Show") {
                Sidebar.push({
                  naziv: bar.naziv,
                  class: bar.class,
                  show: !req.body.element.show,
                  disabled: bar.disabled
                });
              } else {
                Sidebar.push(req.body.element);
              }
            } else {
              Sidebar.push(bar);
            }
          });

          // console.log(Sidebar)

          site.sidebar = Sidebar;

          site.updated_by = req.body.decoded.user;
          site.updated_at = Date.now();

          site.save(function(err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Success."
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Greška."
          });
        }
      }
    });
    /* Site.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.element._id) },

      {
        sifra: req.body.element.sifra,
        naziv: req.body.element.naziv,
        opis: req.body.element.opis,
        adresa: req.body.element.adresa,
        odgovornoLice: req.body.element.odgovornoLice,
        telefon: req.body.element.telefon,
        email: req.body.element.email,
        mjesta: req.body.element.mjesta,
        web: req.body.element.web,
        sidebar: req.body.element.sidebar,
        postavke: req.body.element.postavke,
        created_at: req.body.element.created_at,
        updated_at: req.body.element.updated_at,
        created_by: req.body.element.created_by,
        updated_by: req.body.element.updated_by,
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
        res.json({
          success: true,
          message: "Izmjena uspješno obavljena.",
          element: element
        });
      }
    }); */
  }
};

settingsController.SitesRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.remove(
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
                message: "Sites.",
                sites: sites
              });
            }
          });
        }
      }
    );
  }
};

settingsController.SitesInsert = function(req, res) {
  var element = new Site(req.body);
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
              message: "Unos uspješno obavljen.",
              sites: sites
            });
          }
        });
      }
    });
  }
};

// Users

settingsController.UsersGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    User.find({})
      .populate("site")
      .exec(function(err, users) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          if (users.length) {
            Site.find({})
              .lean()
              .exec(function(err, sites) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  if (sites.length) {
                    res.json({
                      success: true,
                      message: "Korisnici.",
                      sites: sites,
                      users: users
                    });
                  } else {
                    res.json({
                      success: true,
                      message: "Nema validnih podataka."
                    });
                  }
                }
              });
          } else {
            res.json({
              success: true,
              message: "Nema validnih podataka."
            });
          }
        }
      });
  }
};

settingsController.UsersEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    // console.log(req.body.element);
    User.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.element._id) },

      {
        ime: req.body.element.ime,
        prezime: req.body.element.prezime,
        email: req.body.element.email,
        password: req.body.element.password,
        token: req.body.element.token,
        role: req.body.element.role,
        postavke: req.body.element.postavke,
        site: mongoose.Types.ObjectId(req.body.element.site._id),
        sites: req.body.element.sites,
        created_at: req.body.element.created_at,
        updated_at: req.body.element.updated_at,
        created_by: req.body.element.created_by,
        updated_by: req.body.element.updated_by,
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
        res.json({
          success: true,
          message: "Izmjena uspješno obavljena.",
          element: element
        });
      }
    });
  }
};

settingsController.UsersRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    User.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.user._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          User.find({})
            .populate("site")
            .exec(function(err, users) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                if (users.length) {
                  Site.find({})
                    .lean()
                    .exec(function(err, sites) {
                      if (err) {
                        console.log("Greška:", err);
                        res.json({
                          success: false,
                          message: err
                        });
                      } else {
                        if (sites.length) {
                          res.json({
                            success: true,
                            message: "Korisnici.",
                            sites: sites,
                            users: users
                          });
                        } else {
                          res.json({
                            success: true,
                            message: "Nema validnih podataka."
                          });
                        }
                      }
                    });
                } else {
                  res.json({
                    success: true,
                    message: "Nema validnih podataka."
                  });
                }
              }
            });
        }
      }
    );
  }
};

settingsController.UsersInsert = function(req, res) {
  if (!req.body.email || !req.body.password || !req.body.role)
    res.json({
      success: false,
      message: "Prerequisites not met."
    });
  else {
    req.body.token = "TKTokenInit";
    req.body.site = mongoose.Types.ObjectId(req.body.site);
    req.body.created_by = req.body.decoded.user;

    var user = new User(req.body);

    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB."
      });
    } else {
      user.save(error => {
        if (error)
          return res.json({
            success: false,
            message: "Username already exists."
          });
        res.json({ success: true, message: "Account created successfully." });
      });
    }
  }
};

// Analysers

settingsController.AnalysersGet = function(req, res) {
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
            message: "Analizatori.",
            analysers: analysers
          });
        }
      });
  }
};

settingsController.AnalysersEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Analyser.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.analyser._id) },

      {
        ime: req.body.analyser.ime,
        sn: req.body.analyser.sn,
        make: req.body.analyser.make,
        manual: req.body.analyser.manual,
        site: mongoose.Types.ObjectId(req.body.analyser.site._id),
        tip: req.body.analyser.tip,
        tehnologija: req.body.analyser.tehnologija,
        sekcija: req.body.analyser.sekcija,
        __v: req.body.analyser.__v
      },

      { upsert: false }
    ).exec(function(err, analyser) {
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
          analyser: analyser
        });
      }
    });
  }
};

settingsController.AnalysersRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Analyser.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.analyser._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Analyser.find({}).exec(function(err, analysers) {
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
                analysers: analysers
              });
            }
          });
        }
      }
    );
  }
};

settingsController.AnalysersInsert = function(req, res) {
  req.body.site = mongoose.Types.ObjectId(req.body.selected_site._id);
  var analyser = new Analyser(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
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
          message: "Unos uspješno obavljen."
        });
      }
    });
  }
};

// Lokacije

settingsController.LokacijeGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
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
            message: "Lokacije.",
            lokacije: lokacije
          });
        }
      });
  }
};

settingsController.CustomersGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Customers.find({})
      .populate("site")
      .exec(function(err, customers) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          customers = customers.sort(function(a, b) {
            return a.naziv.localeCompare(b.naziv, undefined, {
              numeric: true,
              sensitivity: "base"
            });
          });

          res.json({
            success: true,
            message: "Customers.",
            customers: customers
          });
        }
      });
  }
};

settingsController.LokacijeEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Lokacija.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.lokacija._id) },

      {
        lokacija: req.body.lokacija.lokacija,
        sendEmail: req.body.lokacija.sendEmail,
        email: req.body.lokacija.email,
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

settingsController.LokacijeRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Lokacija.remove(
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

settingsController.LokacijeInsert = function(req, res) {
  var lokacija = new Lokacija(req.body.lokacija);
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
                message: "Unos uspješno obavljen.",
                lokacije: lokacije
              });
            }
          });
      }
    });
  }
};

// Doktori

settingsController.DoktoriGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Doktor.find({})
      .populate("site")
      .exec(function(err, doktori) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          doktori.forEach(element => {
            element.site_code = element.site.sifra;
          });

          doktori = doktori.sort(function(a, b) {
            return a.site_code.localeCompare(b.site_code, undefined, {
              numeric: true,
              sensitivity: "base"
            });
          });

          res.json({
            success: true,
            message: "Doktori.",
            doktori: doktori
          });
        }
      });
  }
};

settingsController.DoktoriEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Doktor.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.doktor._id) },

      {
        doktorIme: req.body.doktor.doktorIme,
        doktorPrezime: req.body.doktor.doktorPrezime,
        lokacija: req.body.doktor.lokacija,
        site: mongoose.Types.ObjectId(req.body.doktor.site._id),
        __v: req.body.doktor.__v
      },

      { upsert: false }
    ).exec(function(err, doktor) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Doktor.find({})
          .populate("site")
          .exec(function(err, doktori) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              doktori.forEach(element => {
                element.site_code = element.site.sifra;
              });

              doktori = doktori.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });

              res.json({
                success: true,
                message: "Izmjena uspješno obavljena.",
                doktor: doktor,
                doktori: doktori
              });
            }
          });
      }
    });
  }
};

settingsController.DoktoriRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Doktor.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.doktor._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Doktor.find({})
            .populate("site")
            .exec(function(err, doktori) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                doktori.forEach(element => {
                  element.site_code = element.site.sifra;
                });

                doktori = doktori.sort(function(a, b) {
                  return a.site_code.localeCompare(b.site_code, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                res.json({
                  success: true,
                  message: "Brisanje uspješno obavljeno.",
                  doktori: doktori
                });
              }
            });
        }
      }
    );
  }
};

settingsController.DoktoriInsert = function(req, res) {
  var doktor = new Doktor(req.body.doktor);
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
        Doktor.find({})
          .populate("site")
          .exec(function(err, doktori) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              doktori.forEach(element => {
                element.site_code = element.site.sifra;
              });

              doktori = doktori.sort(function(a, b) {
                return a.site_code.localeCompare(b.site_code, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });

              res.json({
                success: true,
                message: "Unos uspješno obavljen.",
                doktori: doktori
              });
            }
          });
      }
    });
  }
};

// Mjesta

settingsController.MjestaGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    res.json({
      success: true
    });
  }
};

settingsController.MjestaEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    res.json({
      success: true
    });
  }
};

settingsController.MjestaRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.findOne({
      _id: req.body.site_id
    }).exec(function(err, site) {
      if (err) {
        res.json({
          success: false,
          message: err
        });
      } else {
        if (site) {
          for (var i = 0; i < site.mjesta.length; i++) {
            if (site.mjesta[i] === req.body.mjesto) {
              site.mjesta.splice(i, 1);

              site.mjesta = site.mjesta.sort(function(a, b) {
                return a.localeCompare(b, undefined, {
                  numeric: true,
                  sensitivity: "base"
                });
              });

              site.save();
              break;
            }
          }
          res.json({
            success: true,
            message: "Brisanje uspješno obavljeno."
          });
        }
      }
    });
  }
};

settingsController.MjestaInsert = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Site.findOne({
      _id: req.body.site_id
    }).exec(function(err, site) {
      if (err) {
        res.json({
          success: false,
          message: err
        });
      } else {
        if (site) {
          site.mjesta.push(req.body.mjesto);

          site.mjesta = site.mjesta.sort(function(a, b) {
            return a.localeCompare(b, undefined, {
              numeric: true,
              sensitivity: "base"
            });
          });

          site.save();
          res.json({
            success: true,
            message: "Unos uspješno obavljen."
          });
        }
      }
    });
  }
};

// Sekcije

settingsController.SekcijeGet = function(req, res) {
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
        sekcije = sekcije.sort(function(a, b) {
          return a.order.localeCompare(b.order, undefined, {
            numeric: true,
            sensitivity: "base"
          });
        });

        res.json({
          success: true,
          message: "Sekcije.",
          sekcije: sekcije
        });
      }
    });
  }
};

settingsController.SekcijeEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Sekcija.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.sekcija._id) },

      {
        order: req.body.sekcija.order,
        sekcija: req.body.sekcija.sekcija,
        __v: req.body.sekcija.__v
      },

      { upsert: false }
    ).exec(function(err, sekcija) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
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
            Settings.find({}).exec(function(err, settings) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err
                });
              } else {
                sekcije = sekcije.sort(function(a, b) {
                  return a.order.localeCompare(b.order, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].sekcije = [];

                sekcije.forEach(element => {
                  settings[0].sekcije.push(element.sekcija);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Izmjena uspješno obavljena.",
                  sekcija: sekcija,
                  sekcije: sekcije
                });
              }
            });
          }
        });
      }
    });
  }
};

settingsController.SekcijeRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Sekcija.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.sekcija._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
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
              Settings.find({}).exec(function(err, settings) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  sekcije = sekcije.sort(function(a, b) {
                    return a.order.localeCompare(b.order, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  settings[0].sekcije = [];

                  sekcije.forEach(element => {
                    settings[0].sekcije.push(element.sekcija);
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Brisanje uspješno obavljeno.",
                    sekcije: sekcije
                  });
                }
              });
            }
          });
        }
      }
    );
  }
};

settingsController.SekcijeInsert = function(req, res) {
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
        Sekcija.find({}).exec(function(err, sekcije) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                sekcije = sekcije.sort(function(a, b) {
                  return a.order.localeCompare(b.order, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].sekcije = [];

                sekcije.forEach(element => {
                  settings[0].sekcije.push(element.sekcija);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  sekcije: sekcije
                });
              }
            });
          }
        });
      }
    });
  }
};

// Grupe testova

settingsController.GrupeGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
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
          grupe.forEach(element => {
            element.order = element.sekcija.order;
          });

          grupe = grupe.sort(function(a, b) {
            return a.order.localeCompare(b.order, undefined, {
              numeric: true,
              sensitivity: "base"
            });
          });

          res.json({
            success: true,
            message: "Grupe.",
            grupe: grupe
          });
        }
      });
  }
};

settingsController.GrupeEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    grupaTesta
      .replaceOne(
        { _id: mongoose.Types.ObjectId(req.body.grupa._id) },

        {
          grupa: req.body.grupa.grupa,
          sekcija: mongoose.Types.ObjectId(req.body.grupa.sekcija._id),
          __v: req.body.grupa.__v
        },

        { upsert: false }
      )
      .exec(function(err, grupa) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
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
                Settings.find({}).exec(function(err, settings) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err
                    });
                  } else {
                    grupe.forEach(element => {
                      element.order = element.sekcija.order;
                    });

                    grupe = grupe.sort(function(a, b) {
                      return a.order.localeCompare(b.order, undefined, {
                        numeric: true,
                        sensitivity: "base"
                      });
                    });

                    settings[0].grupe = [];

                    grupe.forEach(element => {
                      if (
                        !settings[0].grupe.filter(
                          grupa => grupa === element.grupa
                        ).length > 0
                      ) {
                        settings[0].grupe.push(element.grupa);
                      }
                    });

                    settings[0].save();

                    res.json({
                      success: true,
                      message: "Izmjena uspješno obavljena.",
                      grupa: grupa,
                      grupe: grupe
                    });
                  }
                });
              }
            });
        }
      });
  }
};

settingsController.GrupeRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    grupaTesta.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.grupa._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
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
                Settings.find({}).exec(function(err, settings) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err
                    });
                  } else {
                    grupe.forEach(element => {
                      element.order = element.sekcija.order;
                    });

                    grupe = grupe.sort(function(a, b) {
                      return a.order.localeCompare(b.order, undefined, {
                        numeric: true,
                        sensitivity: "base"
                      });
                    });

                    settings[0].grupe = [];

                    grupe.forEach(element => {
                      if (
                        !settings[0].grupe.filter(
                          grupa => grupa === element.grupa
                        ).length > 0
                      ) {
                        settings[0].grupe.push(element.grupa);
                      }
                    });

                    settings[0].save();

                    res.json({
                      success: true,
                      message: "Brisanje uspješno obavljeno.",
                      grupe: grupe
                    });
                  }
                });
              }
            });
        }
      }
    );
  }
};

settingsController.GrupeInsert = function(req, res) {
  var grupa = new grupaTesta(req.body);

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
              Settings.find({}).exec(function(err, settings) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err
                  });
                } else {
                  grupe.forEach(element => {
                    element.order = element.sekcija.order;
                  });

                  grupe = grupe.sort(function(a, b) {
                    return a.order.localeCompare(b.order, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  settings[0].grupe = [];

                  grupe.forEach(element => {
                    if (
                      !settings[0].grupe.filter(
                        grupa => grupa === element.grupa
                      ).length > 0
                    ) {
                      settings[0].grupe.push(element.grupa);
                    }
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Unos uspješno obavljen.",
                    grupe: grupe
                  });
                }
              });
            }
          });
      }
    });
  }
};

// Referentne grupe

settingsController.RefGrGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    ReferentneGrupe.find({}).exec(function(err, ref_grupe) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        ref_grupe = ref_grupe.sort(function(a, b) {
          return a.grupa.localeCompare(b.grupa, undefined, {
            numeric: true,
            sensitivity: "base"
          });
        });

        res.json({
          success: true,
          message: "Referentne grupe.",
          ref_grupe: ref_grupe
        });
      }
    });
  }
};

settingsController.RefGrEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    ReferentneGrupe.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.ref_grupa._id) },

      {
        grupa: req.body.ref_grupa.grupa,
        __v: req.body.ref_grupa.__v
      },

      { upsert: false }
    ).exec(function(err, ref_grupa) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        ReferentneGrupe.find({}).exec(function(err, ref_grupe) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                ref_grupe = ref_grupe.sort(function(a, b) {
                  return a.grupa.localeCompare(b.grupa, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].ref_grupe = [];

                ref_grupe.forEach(element => {
                  settings[0].ref_grupe.push(element.grupa);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Izmjena uspješno obavljena.",
                  ref_grupa: ref_grupa,
                  ref_grupe: ref_grupe
                });
              }
            });
          }
        });
      }
    });
  }
};

settingsController.RefGrRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    ReferentneGrupe.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.ref_grupa._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          ReferentneGrupe.find({}).exec(function(err, ref_grupe) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
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
                  ref_grupe = ref_grupe.sort(function(a, b) {
                    return a.grupa.localeCompare(b.grupa, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  settings[0].ref_grupe = [];

                  ref_grupe.forEach(element => {
                    settings[0].ref_grupe.push(element.grupa);
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Brisanje uspješno obavljeno.",
                    ref_grupe: ref_grupe
                  });
                }
              });
            }
          });
        }
      }
    );
  }
};

settingsController.RefGrInsert = function(req, res) {
  var ref_grupa = new ReferentneGrupe(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    ref_grupa.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        ReferentneGrupe.find({}).exec(function(err, ref_grupe) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                ref_grupe = ref_grupe.sort(function(a, b) {
                  return a.grupa.localeCompare(b.grupa, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].ref_grupe = [];

                ref_grupe.forEach(element => {
                  settings[0].ref_grupe.push(element.grupa);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  ref_grupe: ref_grupe
                });
              }
            });
          }
        });
      }
    });
  }
};

// Mjerne jedinice

settingsController.JediniceGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
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
          message: "Mjerne jedinice.",
          jedinice: jedinice
        });
      }
    });
  }
};

settingsController.JediniceEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Jedinice.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.jedinica._id) },

      {
        jedinica: req.body.jedinica.jedinica,
        __v: req.body.jedinica.__v
      },

      { upsert: false }
    ).exec(function(err, jedinica) {
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
            Settings.find({}).exec(function(err, settings) {
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

                settings[0].jedinice = [];

                jedinice.forEach(element => {
                  settings[0].jedinice.push(element.jedinica);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Izmjena uspješno obavljena.",
                  jedinica: jedinica,
                  jedinice: jedinice
                });
              }
            });
          }
        });
      }
    });
  }
};

settingsController.JediniceRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Jedinice.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.jedinica._id)
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
              Settings.find({}).exec(function(err, settings) {
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

                  settings[0].jedinice = [];

                  jedinice.forEach(element => {
                    settings[0].jedinice.push(element.jedinica);
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Brisanje uspješno obavljeno.",
                    jedinice: jedinice
                  });
                }
              });
            }
          });
        }
      }
    );
  }
};

settingsController.JediniceInsert = function(req, res) {
  var jedinica = new Jedinice(req.body);
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
        Jedinice.find({}).exec(function(err, jedinice) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                jedinice = jedinice.sort(function(a, b) {
                  return a.jedinica.localeCompare(b.jedinica, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].jedinice = [];

                jedinice.forEach(element => {
                  settings[0].jedinice.push(element.jedinica);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  jedinice: jedinice
                });
              }
            });
          }
        });
      }
    });
  }
};

// Tehnologije analizatora

settingsController.TehAnalizatorGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tehnologijaAparata.find({}).exec(function(err, tehnologije) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        tehnologije = tehnologije.sort(function(a, b) {
          return a.tehnologijaAparata.localeCompare(
            b.tehnologijaAparata,
            undefined,
            {
              numeric: true,
              sensitivity: "base"
            }
          );
        });

        res.json({
          success: true,
          message: "Tehnologije analizatora.",
          tehnologije: tehnologije
        });
      }
    });
  }
};

settingsController.TehAnalizatorEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tehnologijaAparata
      .replaceOne(
        { _id: mongoose.Types.ObjectId(req.body.tehnologija._id) },

        {
          tehnologijaAparata: req.body.tehnologija.tehnologijaAparata,
          __v: req.body.tehnologija.__v
        },

        { upsert: false }
      )
      .exec(function(err, tehnologija) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          tehnologijaAparata.find({}).exec(function(err, tehnologije) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
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
                  tehnologije = tehnologije.sort(function(a, b) {
                    return a.tehnologijaAparata.localeCompare(
                      b.tehnologijaAparata,
                      undefined,
                      {
                        numeric: true,
                        sensitivity: "base"
                      }
                    );
                  });

                  settings[0].analyser_tehnologije = [];

                  tehnologije.forEach(element => {
                    settings[0].analyser_tehnologije.push(
                      element.tehnologijaAparata
                    );
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Izmjena uspješno obavljena.",
                    tehnologija: tehnologija,
                    tehnologije: tehnologije
                  });
                }
              });
            }
          });
        }
      });
  }
};

settingsController.TehAnalizatorRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tehnologijaAparata.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.tehnologija._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          tehnologijaAparata.find({}).exec(function(err, tehnologije) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
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
                  tehnologije = tehnologije.sort(function(a, b) {
                    return a.tehnologijaAparata.localeCompare(
                      b.tehnologijaAparata,
                      undefined,
                      {
                        numeric: true,
                        sensitivity: "base"
                      }
                    );
                  });

                  settings[0].analyser_tehnologije = [];

                  tehnologije.forEach(element => {
                    settings[0].analyser_tehnologije.push(
                      element.tehnologijaAparata
                    );
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Brisanje uspješno obavljeno.",
                    tehnologije: tehnologije
                  });
                }
              });
            }
          });
        }
      }
    );
  }
};

settingsController.TehAnalizatorInsert = function(req, res) {
  var tehnologija = new tehnologijaAparata(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tehnologija.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        tehnologijaAparata.find({}).exec(function(err, tehnologije) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                tehnologije = tehnologije.sort(function(a, b) {
                  return a.tehnologijaAparata.localeCompare(
                    b.tehnologijaAparata,
                    undefined,
                    {
                      numeric: true,
                      sensitivity: "base"
                    }
                  );
                });

                settings[0].analyser_tehnologije = [];

                tehnologije.forEach(element => {
                  settings[0].analyser_tehnologije.push(
                    element.tehnologijaAparata
                  );
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  tehnologije: tehnologije
                });
              }
            });
          }
        });
      }
    });
  }
};

// Tipovi analizatora

settingsController.TipAnalizatorGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tipAparata.find({}).exec(function(err, tipovi) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        tipovi = tipovi.sort(function(a, b) {
          return a.tipAparata.localeCompare(b.tipAparata, undefined, {
            numeric: true,
            sensitivity: "base"
          });
        });

        res.json({
          success: true,
          message: "Tipovi analizatora.",
          tipovi: tipovi
        });
      }
    });
  }
};

settingsController.TipAnalizatorEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tipAparata
      .replaceOne(
        { _id: mongoose.Types.ObjectId(req.body.tip._id) },

        {
          tipAparata: req.body.tip.tipAparata,
          __v: req.body.tip.__v
        },

        { upsert: false }
      )
      .exec(function(err, tip) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          tipAparata.find({}).exec(function(err, tipovi) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
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
                  tipovi = tipovi.sort(function(a, b) {
                    return a.tipAparata.localeCompare(b.tipAparata, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  settings[0].analyser_tipovi = [];

                  tipovi.forEach(element => {
                    settings[0].analyser_tipovi.push(element.tipAparata);
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Izmjena uspješno obavljena.",
                    tip: tip,
                    tipovi: tipovi
                  });
                }
              });
            }
          });
        }
      });
  }
};

settingsController.TipAnalizatorRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tipAparata.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.tip._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          tipAparata.find({}).exec(function(err, tipovi) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
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
                  tipovi = tipovi.sort(function(a, b) {
                    return a.tipAparata.localeCompare(b.tipAparata, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  settings[0].analyser_tipovi = [];

                  tipovi.forEach(element => {
                    settings[0].analyser_tipovi.push(element.tipAparata);
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Brisanje uspješno obavljeno.",
                    tipovi: tipovi
                  });
                }
              });
            }
          });
        }
      }
    );
  }
};

settingsController.TipAnalizatorInsert = function(req, res) {
  var tip = new tipAparata(req.body);
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
        tipAparata.find({}).exec(function(err, tipovi) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                tipovi = tipovi.sort(function(a, b) {
                  return a.tipAparata.localeCompare(b.tipAparata, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].analyser_tipovi = [];

                tipovi.forEach(element => {
                  settings[0].analyser_tipovi.push(element.tipAparata);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  tipovi: tipovi
                });
              }
            });
          }
        });
      }
    });
  }
};

// Tipovi uzoraka

settingsController.UzorakGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tipUzorka.find({}).exec(function(err, uzorci) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        uzorci = uzorci.sort(function(a, b) {
          return a.tip.localeCompare(b.tip, undefined, {
            numeric: true,
            sensitivity: "base"
          });
        });

        res.json({
          success: true,
          message: "Tipovi uzoraka.",
          uzorci: uzorci
        });
      }
    });
  }
};

settingsController.UzorakEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tipUzorka
      .replaceOne(
        { _id: mongoose.Types.ObjectId(req.body.uzorak._id) },

        {
          tip: req.body.uzorak.tip,
          __v: req.body.uzorak.__v
        },

        { upsert: false }
      )
      .exec(function(err, uzorak) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          tipUzorka.find({}).exec(function(err, uzorci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
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
                  uzorci = uzorci.sort(function(a, b) {
                    return a.tip.localeCompare(b.tip, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  settings[0].ana_tipovi = [];

                  uzorci.forEach(element => {
                    settings[0].ana_tipovi.push(element.tip);
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Izmjena uspješno obavljena.",
                    uzorak: uzorak,
                    uzorci: uzorci
                  });
                }
              });
            }
          });
        }
      });
  }
};

settingsController.UzorakRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    tipUzorka.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.uzorak._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          tipUzorka.find({}).exec(function(err, uzorci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
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
                  uzorci = uzorci.sort(function(a, b) {
                    return a.tip.localeCompare(b.tip, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  settings[0].ana_tipovi = [];

                  uzorci.forEach(element => {
                    settings[0].ana_tipovi.push(element.tip);
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Brisanje uspješno obavljeno.",
                    uzorci: uzorci
                  });
                }
              });
            }
          });
        }
      }
    );
  }
};

settingsController.UzorakInsert = function(req, res) {
  var uzorak = new tipUzorka(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    uzorak.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        tipUzorka.find({}).exec(function(err, uzorci) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                uzorci = uzorci.sort(function(a, b) {
                  return a.tip.localeCompare(b.tip, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].ana_tipovi = [];

                uzorci.forEach(element => {
                  settings[0].ana_tipovi.push(element.tip);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  uzorci: uzorci
                });
              }
            });
          }
        });
      }
    });
  }
};

// Analize

settingsController.AnalizeGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {

    AnaAssays.find({ site: mongoose.Types.ObjectId(req.query.site), disabled: false }).populate("test aparat").exec(function(err, analize) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {

        analize = analize.sort(function(a, b) {
          return a.test.grouporder.localeCompare(b.test.grouporder, undefined, {
            numeric: true,
            sensitivity: "base"
          });
        });

        res.json({
          success: true,
          message: "Analize.",
          analize: analize
        });
      }
    });
    /* LabAssays.find({ disabled: false }).exec(function(err, analize) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        res.json({
          success: true,
          message: "Analize.",
          analize: analize
        });
      }
    }); */
  }
};

settingsController.AnalizaEdit = function(req, res) {
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
          (labassay.active = req.body.status),
            (labassay.updated_by = req.body.decoded.user);
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
                  if (anaassays) {
                    anaassays.forEach(anaassay => {
                      if (anaassay.test == req.body._id) {
                        (anaassay.active = req.body.status),
                          (anaassay.updated_by = req.body.decoded.user);
                        anaassay.updated_at = Date.now();
                        anaassay.save();
                      }
                    });

                    res.json({
                      success: true,
                      message: "Success."
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

// Definicija uzoraka

settingsController.UzorakDefGet = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Uzorci.find({}).exec(function(err, uzorci) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        uzorci = uzorci.sort(function(a, b) {
          return a.tip.localeCompare(b.tip, undefined, {
            numeric: true,
            sensitivity: "base"
          });
        });

        res.json({
          success: true,
          message: "Uzorci.",
          uzorci: uzorci
        });
      }
    });
  }
};

settingsController.UzorakDefEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Uzorci.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.uzorak._id) },

      {
        ime: req.body.uzorak.ime,
        code: req.body.uzorak.code,
        tip: req.body.uzorak.tip,
        patient: req.body.uzorak.patient,
        testovi: req.body.uzorak.testovi,
        testoviTag: req.body.uzorak.testoviTag,
        hitno: req.body.uzorak.hitno,
        time: req.body.uzorak.time,
        komentar: req.body.uzorak.komentar,

        __v: req.body.uzorak.__v
      },

      { upsert: false }
    ).exec(function(err, uzorak) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Uzorci.find({}).exec(function(err, uzorci) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                uzorci = uzorci.sort(function(a, b) {
                  return a.tip.localeCompare(b.tip, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].lab_tipovi = [];

                uzorci.forEach(element => {
                  settings[0].lab_tipovi.push(element.tip);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Izmjena uspješno obavljena.",
                  uzorak: uzorak,
                  uzorci: uzorci
                });
              }
            });
          }
        });
      }
    });
  }
};

settingsController.UzorakDefRemove = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Uzorci.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.uzorak._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Uzorci.find({}).exec(function(err, uzorci) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
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
                  uzorci = uzorci.sort(function(a, b) {
                    return a.tip.localeCompare(b.tip, undefined, {
                      numeric: true,
                      sensitivity: "base"
                    });
                  });

                  settings[0].lab_tipovi = [];

                  uzorci.forEach(element => {
                    settings[0].lab_tipovi.push(element.tip);
                  });

                  settings[0].save();

                  res.json({
                    success: true,
                    message: "Brisanje uspješno obavljeno.",
                    uzorci: uzorci
                  });
                }
              });
            }
          });
        }
      }
    );
  }
};

settingsController.UzorakDefInsert = function(req, res) {
  var uzorak = new Uzorci(req.body.tip);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    uzorak.save(function(err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err
        });
      } else {
        Uzorci.find({}).exec(function(err, uzorci) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err
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
                uzorci = uzorci.sort(function(a, b) {
                  return a.tip.localeCompare(b.tip, undefined, {
                    numeric: true,
                    sensitivity: "base"
                  });
                });

                settings[0].lab_tipovi = [];

                uzorci.forEach(element => {
                  settings[0].lab_tipovi.push(element.tip);
                });

                settings[0].save();

                res.json({
                  success: true,
                  message: "Unos uspješno obavljen.",
                  uzorci: uzorci
                });
              }
            });
          }
        });
      }
    });
  }
};

module.exports = settingsController;
