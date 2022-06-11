var mongoose = require("mongoose");
var Samples = mongoose.model("Samples");
var Results = mongoose.model("Results");

var dashboardController = {};

// DashboardController.js

dashboardController.DonutChart = function (req, res) {
  var datum = new Date();

  datum.setDate(datum.getDate());

  var mjesec = datum.getMonth() + 1;
  var dan = datum.getUTCDate();

  if (dan < 10) {
    dan = "0" + dan;
  }

  if (mjesec < 10) {
    mjesec = "0" + mjesec;
  }

  var datum = datum.getFullYear() + "-" + mjesec + "-" + dan;

  var from = new Date();
  var to = new Date();

  from = datum + "T00:00:00";
  from = new Date(from + "Z");
  to = datum + "T23:59:59";
  to = new Date(to + "Z");

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.find({
      created_at: {
        $gt: new Date(from.setHours(1)),
      },
      site: mongoose.Types.ObjectId(req.query.site),
    }).exec(function (err, results) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
        });
      } else {
        if (!results.length) {
          var json = {};
          json.zaprimljenUzorak = 0;
          json.uObradiUzorak = 0;
          json.realizovanUzorak = 0;
          json.obradjenUzorak = 0;
          json.empty = true;

          res.json({
            success: true,
            message: "Nema uzoraka",
            json,
            results,
          });
        } else {
          var json = {};
          json.zaprimljenUzorak = 0;
          json.uObradiUzorak = 0;
          json.realizovanUzorak = 0;
          json.obradjenUzorak = 0;
          json.empty = false;

          results.forEach((element) => {
            var uslov = 0;
            var zaprimljen = 0;
            var realizovan = 0;
            var status_uzorka = element.status;
            var verificiran = element.verificiran;

            if (element.verificiran) {
              json.obradjenUzorak++;
            } else {
              json.zaprimljenUzorak++;
            }

            // if (status_uzorka === "ODOBREN" || verificiran) {
            //   json.obradjenUzorak++;
            // } else {
            //   element.rezultati.forEach(test => {
            //     uslov++;
            //     if (test.rezultat[test.rezultat.length - 1].rezultat_f === "") {
            //       zaprimljen++;
            //     }
            //     if (test.rezultat[test.rezultat.length - 1].rezultat_f != "") {
            //       realizovan++;
            //     }

            //     if (uslov === element.rezultati.length) {
            //       if (zaprimljen < 1) {
            //         json.realizovanUzorak++;
            //       } else if (realizovan < 1) {
            //         json.zaprimljenUzorak++;
            //       } else {
            //         json.uObradiUzorak++;
            //       }
            //     }
            //   });
            // }
          });
          res.json({
            success: true,
            message: "Ima uzoraka",
            json,
            results,
          });
        }
      }
    });
  }
};

dashboardController.VerticalBar = function (req, res) {
  var datum = new Date();
  datum.setDate(datum.getDate());

  var mjesec = datum.getMonth() + 1;
  var dan = datum.getUTCDate();

  if (dan < 10) {
    dan = "0" + dan;
  }

  if (mjesec < 10) {
    mjesec = "0" + mjesec;
  }

  var datum = datum.getFullYear() + "-" + mjesec + "-" + dan;

  var from = new Date();
  var to = new Date();

  from = datum + "T00:00:00";
  from = new Date(from + "Z");
  to = datum + "T23:59:59";
  to = new Date(to + "Z");

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.find({
      created_at: {
        $gt: new Date(from.setHours(1)),
      },
      site: mongoose.Types.ObjectId(req.query.site),
    })
      .populate("patient")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
          });
        } else {
          var barData = {};
          barData.labels = [];
          barData.labela = [];
          barData.data = [];
          barData.obr = [];
          barData.patients = [];

          var temp = null;
          var labela = null;
          var counter = 0;
          var brojac = 0;
          var jmbg = [];

          results.forEach((result) => {
            temp = result.id.slice(4, result.id.length);
            if (
              !barData.labels.filter((element) => element === temp).length > 0
            ) {
              labela = temp.slice(4, 6) + "/" + temp.slice(2, 4);
              barData.labels.push(temp);
              // barData.labela.push(labela);
              barData.labela.push("");
            }
          });

          barData.labels.forEach((element) => {
            counter = 0;
            brojac = 0;
            jmbg = [];

            results.forEach((result) => {
              temp = result.id.slice(4, result.id.length);
              if (temp === element) {
                counter++;
                if (
                  result.status === "ODOBREN" ||
                  result.verificiran === true
                ) {
                  brojac++;
                }
                if (
                  !jmbg.filter((pacijent) => pacijent === result.patient.jmbg)
                    .length > 0
                ) {
                  jmbg.push(result.patient.jmbg);
                }
              }
            });

            barData.data.push(counter);
            barData.obr.push(brojac);
            barData.patients.push(jmbg.length);
          });
          res.json({
            success: true,
            message: "VerticalBarChart Data",
            barData,
          });
        }
      });
  }
};

dashboardController.InfoWidgets = function (req, res) {
  var datum = new Date();
  datum.setDate(datum.getDate());

  var mjesec = datum.getMonth() + 1;
  var dan = datum.getUTCDate();

  if (dan < 10) {
    dan = "0" + dan;
  }

  if (mjesec < 10) {
    mjesec = "0" + mjesec;
  }

  var datum = datum.getFullYear() + "-" + mjesec + "-" + dan;

  var from = new Date();
  var to = new Date();

  from = datum + "T00:00:00";
  from = new Date(from + "Z");
  to = datum + "T23:59:59";
  to = new Date(to + "Z");

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.find({
      created_at: {
        $gt: new Date(from.setHours(1)),
      },
      site: mongoose.Types.ObjectId(req.query.site),
    }).exec(function (err, results) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
        });
      } else {
        if (!results.length) {
          var json = {};
          json.ukupnoUzoraka = 0;
          json.obradjenUzorak = 0;
          json.realizovanoTestova = 0;
          json.ukupnoTestova = 0;
          json.empty = true;

          res.json({
            success: true,
            message: "Nema uzoraka",
            json,
            results,
          });
        } else {
          var json = {};
          json.ukupnoUzoraka = results.length;
          json.obradjenUzorak = 0;
          json.realizovanoTestova = 0;
          json.ukupnoTestova = 0;
          json.empty = false;

          results.forEach((element) => {
            if (element.verificiran) {
              json.obradjenUzorak++;
            }

            // var uslov = 0;
            // var status_uzorka = element.status;
            // var verificiran = element.verificiran;

            // element.rezultati.forEach(test => {
            //   uslov++;

            //   if (test.rezultat[test.rezultat.length - 1].rezultat_f != "") {
            //     json.realizovanoTestova++;
            //   }

            //   if (uslov === element.rezultati.length) {
            //     if (status_uzorka === "ODOBREN" || verificiran) {
            //       json.obradjenUzorak++;
            //     }
            //   }
            // });
            // json.ukupnoTestova += element.rezultati.length;
          });
          res.json({
            success: true,
            message: "Ima uzoraka",
            json,
            results,
          });
        }
      }
    });
  }
};

dashboardController.Patients = function (req, res) {
  var datum = new Date();
  datum.setDate(datum.getDate());

  var mjesec = datum.getMonth() + 1;
  var dan = datum.getUTCDate();

  if (dan < 10) {
    dan = "0" + dan;
  }

  if (mjesec < 10) {
    mjesec = "0" + mjesec;
  }

  var datum = datum.getFullYear() + "-" + mjesec + "-" + dan;

  var from = new Date();
  var to = new Date();

  from = datum + "T00:00:00";
  from = new Date(from + "Z");
  to = datum + "T23:59:59";
  to = new Date(to + "Z");

  var uslov = {};
  uslov = {
    created_at: {
      $gt: new Date(from.setHours(1)),
    },
    site: mongoose.Types.ObjectId(req.query.site),
  };

  Samples.find(uslov)
    .populate("patient")
    .sort({ _id: -1 })
    .limit(20)
    .exec(function (err, samples) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
        });
      } else {
        if (samples.length) {
          samples = samples.sort(function (a, b) {
            return b.pid.localeCompare(a.pid, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });

          // samples.forEach(element => {

          //   console.log(element.pid)

          // });

          var jmbg = [samples[0].pid];
          res.json({
            success: true,
            jmbg: jmbg,
          });
        } else {
          res.json({
            success: true,
            jmbg: "0",
          });
        }
      }
    });
};

dashboardController.LineChart = function (req, res) {
  console.log("Patients Dialog Disabled.");

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.find({
      created_at: {
        $gte: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000),
      },
      site: mongoose.Types.ObjectId(req.query.site),
    })
      .populate("patient")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
          });
        } else {
          var barData = {};
          barData.labels = [];
          barData.labela = [];
          barData.data = [];
          barData.obr = [];
          barData.patients = [];

          var temp = null;
          var labela = null;
          var mjesta = [""];
          var lokacija = "";
          var Rezultati = [];
          var counter = 0;
          var brojac = 0;
          var jmbg = [];

          if (req.query.adresa.trim() === "") {
            lokacija = "Sve lokacije";
          } else {
            lokacija = req.query.adresa;
          }

          results.forEach((result) => {
            if (
              !mjesta.filter((pacijent) => pacijent === result.patient.adresa)
                .length > 0
            ) {
              mjesta.push(result.patient.adresa);
            }

            if (req.query.adresa.trim() === "") {
              Rezultati.push(result);
            } else {
              if (req.query.adresa.trim() === result.patient.adresa) {
                Rezultati.push(result);
              }
            }
          });

          Rezultati.forEach((result) => {
            temp = result.id.slice(4, result.id.length);
            if (
              !barData.labels.filter((element) => element === temp).length > 0
            ) {
              labela = temp.slice(4, 6) + "/" + temp.slice(2, 4);
              barData.labels.push(temp);
              barData.labela.push(labela);
            }
          });

          barData.labels.forEach((element) => {
            counter = 0;
            brojac = 0;
            jmbg = [];

            Rezultati.forEach((result) => {
              temp = result.id.slice(4, result.id.length);
              if (temp === element) {
                counter++;
                if (
                  result.status === "ODOBREN" ||
                  result.verificiran === true
                ) {
                  brojac++;
                }
                if (
                  !jmbg.filter((pacijent) => pacijent === result.patient.jmbg)
                    .length > 0
                ) {
                  jmbg.push(result.patient.jmbg);
                }
              }
            });

            barData.data.push(counter);
            barData.obr.push(brojac);
            barData.patients.push(jmbg.length);
          });
          res.json({
            success: true,
            message: "LineChart Data",
            barData,
            mjesta,
            lokacija,
          });
        }
      });
  }
};

module.exports = dashboardController;
