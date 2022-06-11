var mongoose = require("mongoose");

var Loger = require("../models/Loger");

var Frizider = mongoose.model("Frizider");
var TempLog = mongoose.model("TempLog");

var logerController = {};

logerController.Create = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    req.body.created_at = Date.now();
    req.body.created_by = req.body.decoded.user;
    var device = new Frizider(req.body);
    if (mongoose.connection.readyState != 1) {
      res.json({
        success: false,
        message: "Greška prilikom konekcije na MongoDB."
      });
    } else {
      device.save(function(err, device) {
        if (err) {
          console.log("Greška:", err);
          res.json({ success: false, message: err });
        } else {
          res.json({
            success: true,
            message: "Pacijent uspješno sačuvan.",
            device
          });
        }
      });
    }
  }
};
logerController.Read = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    console.log("logerController.Read = function(req, res) {");
  }
};

logerController.Graph = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    // console.log(req.body.from);
    // console.log(req.body.to);

    var from = new Date(req.body.from).setHours(
      new Date(req.body.from).getHours() - 2
    );
    var to = new Date(req.body.to).setHours(
      new Date(req.body.to).getHours() - 2
    );

    var uslov = {};

    uslov = {
      datumVrijeme: {
        $gt: new Date(from),
        $lt: new Date(to)
      },
      frizider: mongoose.Types.ObjectId(req.body.data._id)
    };

    // console.log(uslov);

    TempLog.find(uslov)
      .sort({ datumVrijeme: -1 })
      .limit(100)
      .populate("frizider")
      .exec(function(err, logs) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (!logs.length) {
            res.json({ success: false, message: "Nema podataka." });
          } else {
            var temperatura = [];
            var vlaznost = [];
            var refd = [];
            var refg = [];
            var labels = [];
            var vrijeme = [];
            var data = [...logs];

            logs.reverse();

            logs.forEach(log => {
              vrijeme.push(log.datumVrijeme);
              labels.push(log.datumVrijeme.toString().substring(4, 21));
              temperatura.push(log.temperatura);
              vlaznost.push(log.vlaznost);
              refd.push(log.frizider.opseg.refd);
              refg.push(log.frizider.opseg.refg);
            });
            var graphdata = {
              vrijeme: vrijeme,
              labels: labels,
              temperatura: temperatura,
              vlaznost: vlaznost,
              refd: refd,
              refg: refg,
              templabel: "TEMPERATURA-" + logs[0].frizider.ime,
              humlabel: "VLAŽNOST-" + logs[0].frizider.ime
            };
            res.json({
              success: true,
              message: "Logovi uspješno pronadjeni.",
              logs: data,
              graphdata
            });
          }
        }
      });
  }
};

// Frizider

logerController.FriziderList = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Frizider.find({ site: mongoose.Types.ObjectId(req.query.site) }).exec(
      function(err, frizideri) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          res.json({
            success: true,
            message: "Frižideri.",
            frizideri: frizideri
          });
        }
      }
    );
  }
};

logerController.FriziderDelete = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Frizider.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.frizider._id)
      },
      function(err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err
          });
        } else {
          Frizider.find({}).exec(function(err, frizideri) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err
              });
            } else {
              res.json({
                success: true,
                message: "Frižideri.",
                frizideri: frizideri
              });
            }
          });
        }
      }
    );
  }
};

logerController.FriziderEdit = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB."
    });
  } else {
    Frizider.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.element._id) },

      {
        lokacija: req.body.element.lokacija,
        opis: req.body.element.opis,
        ime: req.body.element.ime,
        slave_id: req.body.element.slave_id,
        mac: req.body.element.mac,
        opseg: req.body.element.opseg,
        odgovoran: req.body.element.postavke,
        site: mongoose.Types.ObjectId(req.body.element.site),
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

module.exports = logerController;
