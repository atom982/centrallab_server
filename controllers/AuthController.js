const jwt = require("jsonwebtoken"),
  config = require("../config/index");

var mongoose = require("mongoose");
var User = require("../models/User");
var Audit = require("../models/Audit");
var fs = require("fs");
var User = mongoose.model("User");
var Audit = mongoose.model("Audit_Login");

var authController = {};

// AuthController.js

authController.login = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    User.findOne({ email: req.body.email }, (error, user) => {
      if (error) throw error;
      if (!user)
        res.send({ success: false, message: "Korisnik nije pronađen." });
      else {
        Site.findOne({ _id: mongoose.Types.ObjectId(user.site) }).exec(
          function (err, site) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err,
              });
            } else {
              if (user.active) {
                user.comparePassword(req.body.password, (error, matches) => {
                  if (matches && !error) {
                    const payload = {
                      user: user.email,
                    };
                    const token = jwt.sign(payload, process.env.JWT_SECRET);
                    const data = {
                      sidebar: user.sidebar,
                      localId: user.email,
                      mikrobioloski: site.mikrobioloski,
                      idToken: token,
                      expiresIn: 3600,
                      site: user.site,
                      language: user.postavke.language,
                      customer: user.postavke.customer,
                      idleTime: user.postavke.idleTime,
                      pid_bcode: user.postavke.pid_bcode,
                      default_route: user.postavke.default_route,
                      access: user.postavke.access,
                      changed_at: user.changed_at, 
                      display: user.postavke.display,
                      reports: user.postavke.reports,
                      sites: user.sites,
                    };
                    user.token = token;
                    user.save();
                    var object = {};
                    object.user = user.email;
                    object.login_at = Date.now();
                    object.token = token;
                    object.site = user.site;
                    var audit_log = new Audit(object);
                    audit_log.save();
                    res.json({
                      success: true,
                      message: "Korisnik uspješno prijavljen.",
                      data,
                    });
                  } else {
                    res.send({ success: false, message: "Pogrešna šifra." });
                  }
                });
              } else {
                console.log("User Account has Expired.");
                res.send({
                  success: false,
                  message: "User Account has Expired.",
                });
              }
            }
          }
        );
      }
    });
  }
};

authController.logout = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Audit.findOne(
      {
        email: req.body.email,
        token: req.body.token,
        site: mongoose.Types.ObjectId(req.body.site),
      },
      (error, user) => {
        if (error) throw error;
        if (!user)
          res.send({ success: false, message: "Korisnik nije pronađen." });
        else {
          user.logout_at = Date.now();
          user.type = req.body.type;
          user.save();
          res.json({ success: true, message: "Korisnik uspješno odjavljen." });
        }
      }
    );
  }
};

authController.getUsers = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    User.find({})
      .populate("site")
      .exec(function (err, users) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (users.length) {
            Site.find({})
              .lean()
              .exec(function (err, sites) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err,
                  });
                } else {
                  if (sites.length) {
                    res.json({
                      success: true,
                      message: "Korisnici.",
                      sites: sites,
                      users: users,
                    });
                  } else {
                    res.json({
                      success: true,
                      message: "Nema validnih podataka.",
                    });
                  }
                }
              });
          } else {
            res.json({
              success: true,
              message: "Nema validnih podataka.",
              user,
            });
          }
        }
      });
  }
};

authController.korisnikDelete = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    User.findOne({ _id: req.body._id }).exec(function (err, user) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (!user) {
          res.json({
            success: false,
            message: "Ne pronadjen korisnik za brisanje.",
          });
        } else {
          User.remove({ _id: req.body._id }, function (err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: "Ne mogu izbrisati korisnika.",
              });
            } else {
              res.json({ success: true, message: "Korisnik izbrisan.", user });
            }
          });
        }
      }
    });
  }
};

authController.korisnikRole = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    User.findOne({ _id: req.body._id }).exec(function (err, user) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (user) {
          user.role = req.body.role;
          user.updated_by = req.body.decoded.user;
          user.updated_at = Date.now();
          user.save();
          res.json({
            success: true,
            message: "Ok",
            data: "Rola je uspješno izmjenjena.",
          });
        } else {
          res.json({ success: false, message: "Greška." });
        }
      }
    });
  }
};

authController.mySettings = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    User.findOne({ email: req.body.email }).exec(function (err, user) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (user) {
          user.postavke.card_view = req.body.card_view;
          user.postavke.language = req.body.language;
          user.postavke.idleTime = req.body.idleTime;
          user.updated_by = req.body.decoded.user;
          user.updated_at = Date.now();
          user.save();
          res.json({
            success: true,
            message: "Ok",
            data: "Postavka je uspješno izmjenjena.",
          });
        } else {
          res.json({ success: false, message: "Greška." });
        }
      }
    });
  }
};

authController.verify = (headers) => {
  if (headers && headers.authorization) {
    const split = headers.authorization.split(" ");
    if (split.length === 2) return split[1];
    else return null;
  } else return null;
};

authController.imageUpload = function (req, res) {
  var file = config.auth_path + req.body.name + ".jpeg";
  var data = req.body.base64String.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, "base64");
  fs.writeFile(file, buf, (err) => {});
  res.json({ success: true, message: "Image uploaded." });
};

authController.signup = function (req, res) {
  req.body.created_by = req.body.decoded.user;
  if (!req.body.email || !req.body.password || !req.body.role)
    res.json({
      success: false,
      message: "Please, pass a username, password and role.",
    });
  else {
    req.body.token = "TKTokenInit";
    req.body.site = mongoose.Types.ObjectId(req.body.site);
    var user = new User(req.body);
    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB.",
      });
    } else {
      user.save((error) => {
        if (error)
          return res.json({
            success: false,
            message: "Username already exists.",
          });
        res.json({ success: true, message: "Account created successfully" });
      });
    }
  }
};

authController.initSignup = function (req, res) {
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) throw error;
    if (!user) {
      req.body.token = "TKTokenInit";
      var user = new User(req.body);
      if (mongoose.connection.readyState != 1) {
        res.json({
          success: false,
          message: "Greška prilikom konekcije na MongoDB.",
        });
      } else {
        user.save((error) => {
          if (error)
            return res.json({
              success: false,
              message: "Account NOT created.",
            });
          res.json({ success: true, message: "Account created successfully." });
        });
      }
    } else {
      res.json({ success: false, message: "Korisnik postoji." });
    }
  });
};

authController.image = function (req, res) {
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) throw error;
    if (!user)
      res.status(401).send({ success: false, message: " User not found." });
    else {
      var data = {};
      data.role = user.role;
      var appRoot = process.cwd();
      var path = config.auth_path + req.params.image + ".jpeg";

      fs.readFile(path, "utf8", function (err, image) {
        if (!err) {
          data.link =
            config.baseURL + "images/users/" + req.params.image + ".jpeg";
          res.json({ success: true, message: "Using user image", data, user });
        } else {
          data.link = config.baseURL + "images/users/default.jpeg";
          res.json({
            success: true,
            message: "Using default image",
            data,
            user,
          });
        }
      });
    }
  });
};

authController.sifra = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    User.findOne({ email: req.body.email }, (error, user) => {
      if (error) throw error;
      if (!user)
        res.status(200).send({
          success: false,
          message: "Info",
          data: "Greška prilikom promjene šifre.",
        });
      else {
        user.comparePassword(req.body.password, (error, matches) => {
          if (matches && !error) {
            const payload = {
              user: user.email,
            };
            user.password = req.body.novaSifra;
            user.changed_at = new Date(
              new Date().getTime() -
                new Date().getTimezoneOffset() * 60000
            );
            user.updated_by = req.body.decoded.user;
            user.updated_at = new Date(
              new Date().getTime() -
                new Date().getTimezoneOffset() * 60000
            );
            user.save();
            res.json({
              success: true,
              message: "Ok",
              data: "Šifra je uspješno izmjenjena.",
            });
          } else {
            res.status(200).send({
              success: false,
              message: "Info",
              data: "Trenutna šifra nije ispravna.",
            });
          }
        });
      }
    });
  }
};

authController.imageUpload2 = function (req, res) {
  const jwt = require("jsonwebtoken");
  var writestream = fs.createWriteStream(
    config.auth_path + req.body.user + ".jpeg"
  );
  var readstream = fs
    .createReadStream(config.multer_temp + req.body.user + ".jpeg")
    .pipe(writestream);

  writestream.on("finish", function () {
    var token = req.body.token || req.query.token;
    jwt.verify(token, process.env.JWT_SECRET, function (err) {
      if (err) {
        res.json({
          status: "error",
          message: "Niste autorizirani",
          data: null,
        });
      } else {
        fs.unlinkSync(config.multer_temp + req.body.user + ".jpeg");
        res.json({
          success: true,
          message: "Slika sačuvana",
        });
      }
    });
  });
};

authController.intPost = function (req, res) {
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) throw error;
    if (!user)
      res.json({
        success: false,
        message: "Greška 1",
      });
    else {
      user.comparePassword(req.body.password, (error, matches) => {
        if (matches && !error) {
          //---------------------------------

          IntegrationRaw.findOne(
            { protokol: req.body.protokol },
            (error, slog) => {
              if (error) throw error;
              if (!slog) {
                var protokol = new IntegrationRaw(req.body);
                protokol.save(function (err, protokol) {
                  if (err) {
                    res.json({ success: false, message: "Greška 2s:" + err });
                  } else {
                    req.body.created_at = Date.now();
                    req.body.created_by = req.body.email;
                    req.body.duhan = "NEPOZNATO";
                    req.body.dijabetes = "NEPOZNATO";
                    req.body.telefon = "NEPOZNATO";
                    req.body.email = "NEPOZNATO";
                    req.body.adresa = "NEPOZNATO";
                    req.body.ime = req.body.pime.toUpperCase();
                    req.body.prezime = req.body.pprez.toUpperCase();
                    req.body.jmbg =
                      req.body.jmbg7.trim() +
                      String(Math.random() * 100000).substring(0, 5) +
                      "P";
                    req.body.ime_oca = req.body.imeo.toUpperCase();
                    req.body.spol = req.body.spol.toUpperCase();
                    req.body.site = "5c69f68c338fe912f99f833b";
                    var pacijent = new Patients(req.body);
                    pacijent.save(function (err, pacijent) {
                      if (err) {
                        res.json({
                          success: false,
                          message: "Greška 3s:" + err,
                        });
                      } else {
                        console.log(req.body.analize);
                        var order = {};
                        order.site = "5c69f68c338fe912f99f833b";
                        order.timestamp = Date.now();
                        order.siteCode = "S";

                        order.uzorci = [
                          { tip: "Serum 1", testovi: [] },
                          { tip: "Serum 2", testovi: [] },
                          { tip: "Serum 3", testovi: [] },
                          { tip: "Serum 4", testovi: [] },
                          { tip: "kapilarna krv", testovi: [] },
                          { tip: "Krv 1", testovi: [] },
                          { tip: "Krv 2", testovi: [] },
                          { tip: "Krv EDTA", testovi: [] },
                          { tip: "Plazma 1", testovi: [] },
                          { tip: "Plazma ABO", testovi: [] },
                          { tip: "Plazma EDTA", testovi: [] },
                          { tip: "Plazma Citrat", testovi: [] },
                          { tip: "Plazma Heparin", testovi: [] },
                          { tip: "Plazma NaF", testovi: [] },
                          { tip: "Urin 1", testovi: [] },
                          { tip: "Urin 24h", testovi: [] },
                          { tip: "Feces 1", testovi: [] },
                          { tip: "Bris 1", testovi: [] },
                          { tip: "Ejakulat", testovi: [] },
                        ];
                        order.lokacija = "5c713f63cfe109792dfbdc9b";
                        order.drstanje = "NE";
                        order.anticoag = "NE";
                        order.protokol = req.body.protokol;
                        var counter = 0;
                        req.body.analize.forEach((remote) => {
                          Integration.findOne({ remote_id: remote.trim() })
                            .populate("local_id")
                            .exec(function (err, local) {
                              counter++;
                              if (local) {
                                order.uzorci.forEach((uzorak) => {
                                  if (uzorak.tip === local.local_id.tip) {
                                    uzorak.ime = uzorak.tip.split(" ")[0];
                                    uzorak.code = [];
                                    uzorak.patient = pacijent;
                                    if (
                                      !uzorak.testovi.filter((e) =>
                                        e._id.equals(local.local_id._id)
                                      ).length > 0
                                    ) {
                                      uzorak.testovi.push({
                                        itemName: local.local_id.naziv,
                                        opis: local.local_id.analit,
                                        uzorak: local.local_id.tip,
                                        cijena: local.local_id.price,
                                        klasa: "primary",
                                        _id: local.local_id._id,
                                      });
                                    }

                                    uzorak.hitno = false;
                                    uzorak.time = new Date(
                                      new Date().getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    )
                                      .toISOString()
                                      .slice(0, -8)
                                      .replace("T", " ");
                                    uzorak.komentar = "";
                                  }
                                });
                              } else {
                                console.log("analiza nije pronadjena");
                              }
                              if (req.body.analize.length === counter) {
                                var complete = [];
                                order.uzorci.forEach((uzorak) => {
                                  if (uzorak.testovi.length) {
                                    complete.push(uzorak);
                                  }
                                });
                                order.uzorci = complete;
                                order.decoded = { user: req.body.email };
                                req.body = order;
                                if (order.uzorci.length) {
                                  prijem.sacuvajUzorke(req, res);
                                } else {
                                  res.json({
                                    success: true,
                                    message:
                                      "Sifre testova nisu definisane u LIS-u",
                                    protokol: req.body.protokol,
                                  });
                                }
                              }
                            });
                        });
                      }
                    });
                  }
                });
              } else {
                res.json({
                  success: true,
                  message: "Protokol vec unesen",
                  data: slog.protokol,
                });
              }
            }
          );
          //---------------------------------
        } else {
          res.json({
            success: false,
            message: "Greška 2",
          });
        }
      });
    }
  });
};
authController.intGet = function (req, res) {
  console.log("UPIT za podatke");
  console.log(req.body);
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) throw error;
    if (!user)
      res.json({
        success: false,
        message: "Greška 1",
      });
    else {
      user.comparePassword(req.body.password, (error, matches) => {
        if (matches && !error) {
          //---------------------------------
          Integration.find({}, (error, intanalize) => {
            IntegrationRaw.findOne(
              { protokol: req.body.protokol },
              (error, slog) => {
                if (error) throw error;
                if (slog) {
                  var temp = [];
                  intanalize.forEach((intanaliza) => {
                    slog.analize.forEach((element) => {
                      if (element === intanaliza.remote_id) {
                        temp.push({
                          remote_id: intanaliza.remote_id,
                          local_id: intanaliza.local_id,
                          multi: intanaliza.multiparam.type,
                          multi_id: intanaliza.multiparam.id,
                        });
                      }
                    });
                  });
                  Results.find({ protokol: slog.protokol })
                    .populate("patient")
                    .exec(function (err, results) {
                      if (results.length) {
                        console.log("Broj uzoraka:" + results.length);
                        results.forEach((result) => {
                          temp.forEach((element) => {
                            if (!element.multi) {
                              result.rezultati.forEach((rezultat) => {
                                if (
                                  rezultat.labassay.equals(
                                    mongoose.Types.ObjectId(element.local_id)
                                  )
                                ) {
                                  //
                                  if (
                                    result.verificiran &&
                                    rezultat.rezultat[
                                      rezultat.rezultat.length - 1
                                    ].rezultat_f != ""
                                  ) {
                                    element.rezultat =
                                      rezultat.rezultat[
                                        rezultat.rezultat.length - 1
                                      ].rezultat_f;
                                    element.refd = rezultat.refd;
                                    element.refg = rezultat.refg;
                                    element.jedinica =
                                      rezultat.rezultat[
                                        rezultat.rezultat.length - 1
                                      ].jedinice_f;
                                  }
                                }
                              });
                            } else {
                              result.multi.forEach((multi) => {
                                multi.forEach((analit) => {
                                  if (
                                    analit.rezultat[0].anaassay.equals(
                                      element.multi_id
                                    )
                                  ) {
                                    if (
                                      result.verificiran &&
                                      analit.rezultat[0].rezultat_f != ""
                                    ) {
                                      element.rezultat =
                                        analit.rezultat[0].rezultat_f;
                                      element.refd = analit.refd;
                                      element.refg = analit.refg;
                                      element.jedinica =
                                        analit.rezultat[0].jedinice_f;
                                    }
                                  }
                                });
                              });
                            }
                          });
                        });
                        res.json({
                          success: true,
                          message: "Rezultati za protokol:" + slog.protokol,
                          rezultati: temp,
                        });
                      } else {
                        res.json({
                          success: true,
                          message: "Rezultati za protokol nisu pronadjeni",
                        });
                      }
                    });
                } else {
                  res.json({
                    success: false,
                    message: "Traženi protokol nije unesen!",
                  });
                }
              }
            );
          });
          //---------------------------------
        } else {
          res.json({
            success: false,
            message: "Greška 2",
          });
        }
      });
    }
  });
};
module.exports = authController;
