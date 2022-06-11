var mongoose = require("mongoose");
const config = require("../config/index");
const fs = require("fs");

var apiUrlController = {};

apiUrlController.apiUrlPatients = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err,
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
      case "ime":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          ime: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" },
        };
        break;

      case "prezime":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          prezime: {
            $regex: ".*" + req.query.filter.toUpperCase() + ".*",
          },
        };

        break;

      case "jmbg":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          jmbg: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" },
        };

        break;

      default:
        var imeiprezime = req.query.filter.toLowerCase().split(" ");
        if (imeiprezime.length === 2) {
          var name = imeiprezime[0];
          var surname = imeiprezime[1];
          uslov = {
            site: mongoose.Types.ObjectId(req.query.site),
            ime: {
              $regex: ".*" + name.toUpperCase() + ".*",
            },
            prezime: {
              $regex: ".*" + surname.toUpperCase() + ".*",
            },
          };
        }

        if (imeiprezime.length === 1) {
          var name = imeiprezime[0];
          uslov = {
            site: mongoose.Types.ObjectId(req.query.site),

            $or: [
              {
                ime: { $regex: ".*" + name.toUpperCase() + ".*" },
              },
              {
                prezime: { $regex: ".*" + name.toUpperCase() + ".*" },
              },
            ],
          };
        }

        break;
    }

    Patients.find(uslov)
      .sort({ _id: -1 })
      .limit(limit)
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              results = results.filter(function (result) {
                return result.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              results = results.filter(function (result) {
                return result.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              results = results.filter(function (result) {
                return result.jmbg
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var pacijent = req.query.filter.toLowerCase().split(" ");
              if (pacijent.length === 2) {
                var name = pacijent[0];
                var surname = pacijent[1];
                results = results.filter(function (result) {
                  return (
                    (result.ime.toLowerCase().includes(name) &&
                      result.prezime.toLowerCase().includes(surname)) ||
                    (result.ime.toLowerCase().includes(surname) &&
                      result.prezime.toLowerCase().includes(name))
                  );
                });
              }
              if (pacijent.length === 1) {
                var name = pacijent[0];
                results = results.filter(function (result) {
                  return (
                    result.ime.toLowerCase().includes(name) ||
                    result.prezime.toLowerCase().includes(name)
                  );
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
            "prijem/pacijenti?sort=" +
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
            "prijem/pacijenti?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "ime":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime > b.ime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.ime == b.ime ? 0 : +(a.ime < b.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime > b.prezime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.prezime == b.prezime
                    ? 0
                    : +(a.prezime < b.prezime) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.jmbg == b.jmbg ? 0 : +(a.jmbg > b.jmbg) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.jmbg == b.jmbg ? 0 : +(a.jmbg < b.jmbg) || -1;
                });
              }
              break;
            default:
              results.sort(function (a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach((patient) => {
            switch (patient.spol) {
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
              patient.jmbg +
              "' style='font-size: 11px;' class='btn btn-secondary-info btn-micro'><span id='" +
              patient.jmbg +
              "' style='font-size: 12px;' class='fa fa-flask'></span> <span style='text-transform: none; font-size: 12px;'>Prijem</span></button>";

            var jmbg = "<span>" + patient.jmbg + "</span>";

            if (patient.jmbg.includes("P")) {
              jmbg =
                "<span>" +
                patient.jmbg.slice(0, -1) +
                "<span style='color: #e34a4a;'>" +
                patient.jmbg.slice(-1) +
                "</span></span>";
            }

            var detalji =
              "<button style='white-space: nowrap;' title='' id='" +
              patient._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              patient._id +
              "' class='fa fa-edit'></span> Uredi</button>";

            var godiste = patient.jmbg.substring(4, 7);
            switch (godiste[0]) {
              case "9":
                godiste = "1" + godiste + "";
                break;
              case "0":
                godiste = "2" + godiste + "";
                break;
              default:
                godiste = "";
                break;
            }

            if (godiste == "1920") {
              var godisteTemp = "<span style='color: #e34a4a;'>*</span>";
            } else {
              var godisteTemp = godiste;
            }

            var kontakt = "<span style='color: #e34a4a;'>*</span>";

            if (
              patient.telefon.trim() != "" &&
              patient.telefon.trim() != "NEPOZNATO"
            ) {
              kontakt = patient.telefon;
            }

            var email = "<span style='color: #e34a4a;'>*</span>";

            if (
              patient.email.trim() != "" &&
              patient.email.trim() != "NEPOZNATO"
            ) {
              email = patient.email;
            }

            json.data.push({
              email: email,
              kontakt: kontakt,
              godiste: godisteTemp,
              icon: icon,
              ime: patient.ime,
              prezime: patient.prezime,
              prijem: prijem,
              jmbg: jmbg,
              spol: patient.spol,
              detalji: detalji,
              id: patient._id,
            });
          });
          res.json(json);
        }
      });
  }
};

apiUrlController.apiUrlObradaPregled = function (req, res) {
  var datum = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .substring(0, 10);

  var datum14 = JSON.stringify(
    new Date(new Date().setDate(new Date().getDate() - 14))
  ).substring(1, 11);

  var datum7 = JSON.stringify(
    new Date(new Date().setDate(new Date().getDate() - 7))
  ).substring(1, 11);

  var from = new Date(datum + "T00:00:00Z");
  var to = new Date(datum + "T23:59:59Z");

  switch (req.query.datum) {
    case "NEDOVRŠENO":
      // Moguća dodatna korekcija uslova izmedju 00:00 i 01:00 sati

      datum = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 1))
      ).substring(1, 11);

      // console.log(datum)

      from = new Date(datum14 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    case "Svi Rezultati":
      from = new Date(datum14 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    case "Mikrobiologija":
      from = new Date(datum7 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    default:
      from = new Date(datum + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;
  }

  var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
  var order = req.query.sort
    .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
    .trim();
  var uslov = {};

  uslov = {
    created_at: {
      $gt: new Date(from.setHours(1)),
      $lt: new Date(to.setHours(24, 59, 59)),
    },
    site: mongoose.Types.ObjectId(req.query.site),
  };

  if (!req.query.filter) {
    req.query.filter = "";
  }

  if (
    req.query.dateRangeMin != undefined &&
    req.query.dateRangeMax != undefined
  ) {
    if (req.query.dateRangeMin != "" && req.query.dateRangeMax != "") {
      // console.log('Potrebna korekcija uslova.')
      from = new Date(req.query.dateRangeMin + "T00:00:00");
      to = new Date(req.query.dateRangeMax + "T23:59:59");
      uslov = {
        created_at: {
          $gt: new Date(from.setHours(1)),
          $lt: new Date(to.setHours(24, 59, 59)),
        },
        site: mongoose.Types.ObjectId(req.query.site),
      };
      req.query.datum = "Svi Rezultati";
    }
  }

  if (
    req.query.dateRangeMin != "" &&
    req.query.dateRangeMax != "" &&
    req.query.dateRangeMin != req.query.dateRangeMax
  ) {
    // console.log('Potrebna korekcija uslova.')
    from = new Date(req.query.dateRangeMin + "T00:00:00");
    to = new Date(req.query.dateRangeMax + "T23:59:59");
    uslov = {
      created_at: {
        $gt: new Date(from.setHours(1)),
        $lt: new Date(to.setHours(24, 59, 59)),
      },
      site: mongoose.Types.ObjectId(req.query.site),
    };
    req.query.datum = "Svi Rezultati";
  }

  // console.log(uslov.created_at)

  Results.find(uslov)
    .populate("sample patient rezultati.labassay posiljaoc narucioc")
    .sort({
      created_at: -1,
    })
    .exec(function (err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultati.length) {
          var Rezultati = [];

          rezultati.forEach((element) => {
            if (
              !Rezultati.filter(
                (rezultat) =>
                  rezultat.id === element.sample.pid &&
                  JSON.stringify(rezultat.date).substring(1, 11) ===
                    JSON.stringify(element.created_at).substring(1, 11)
              ).length > 0
            ) {
              var posiljaoc = null;
              var narucioc = null;
              var partner =
                '<strong><span style="font-size: 13px; color:#d9d9d9;">Lični zahtjev</span></strong>';

              if (element.narucioc != null) {
                var icon =
                  '<i style="font-size: 14px; color:#f7cc36;" class="fa fa-handshake-o" title="' +
                  element.narucioc.naziv +
                  '"></i>';
                narucioc = element.narucioc;
                partner =
                  '<strong><span style="font-size: 13px; color:#4ae387;">' +
                  element.narucioc.naziv +
                  "</span></strong>";
              }

              if (element.posiljaoc != null) {
                var icon =
                  '<i style="font-size: 14px; color:#f7cc36;" class="fa fa-handshake-o" title="' +
                  element.posiljaoc.naziv +
                  '"></i>';
                posiljaoc = element.posiljaoc;
                partner =
                  '<strong><span style="font-size: 13px; color:#4ae387;">' +
                  element.posiljaoc.naziv +
                  "</span></strong>";
              }

              if (element.posiljaoc == null && element.narucioc == null) {
                var icon =
                  '<i style="font-size: 14px; color:#d9d9d9;" class="fa fa-handshake-o"></i>';
              }

              var godiste = element.patient.jmbg.substring(4, 7);
              switch (godiste[0]) {
                case "9":
                  godiste = "1" + godiste + "";
                  break;
                case "0":
                  godiste = "2" + godiste + "";
                  break;
                default:
                  godiste = "";
                  break;
              }

              if (godiste == "1920") {
                var godisteTemp = "<span style='color: #e34a4a;'>*</span>";
              } else {
                var godisteTemp = godiste;
              }

              Rezultati.push({
                partneri: partner,
                narucioc: element.narucioc,
                posiljaoc: element.posiljaoc,
                obrada:
                  "<button style='white-space: nowrap;' id='" +
                  element.patient._id +
                  "' title='' class='btn btn-primary btn-micro'><span class='glyphicon glyphicon-search'></span> PREGLED</button>",
                id: element.sample.pid,
                ime: element.patient.ime,
                prezime: element.patient.prezime,
                jmbg: godisteTemp,

                nodiscount: element.sample.nodiscount,
                discount: element.sample.discount,
                total: element.sample.total,

                micro: false,
                barcodes: "",
                racun: "",
                _id: element.patient._id,
                date: element.created_at,

                datum:
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(9, 11) +
                  "." +
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(6, 8) +
                  "." +
                  JSON.stringify(
                    JSON.stringify(element.created_at).substring(1, 11)
                  ).slice(1, 5),

                time: JSON.stringify(element.created_at).substring(12, 17),

                remove: false,
              });
            }
          });

          Rezultati.forEach((newrez) => {
            var samples = "";
            var pac = "";
            var check = true;
            var micro = false;
            var verificiran = true;
            var uzorci = [];

            rezultati.forEach((rez) => {
              if (
                newrez.id === rez.sample.pid &&
                newrez.datum ===
                  JSON.stringify(
                    JSON.stringify(rez.created_at).substring(1, 11)
                  ).slice(9, 11) +
                    "." +
                    JSON.stringify(
                      JSON.stringify(rez.created_at).substring(1, 11)
                    ).slice(6, 8) +
                    "." +
                    JSON.stringify(
                      JSON.stringify(rez.created_at).substring(1, 11)
                    ).slice(1, 5)
              ) {
                samples += rez.id + ",";
                if (!rez.verificiran) {
                  verificiran = false;
                }

                pac = rez.patient._id;

                if (!rez.verificiran) {
                  check = false;
                }

                if (rez.sample.tip.includes("Mikrobiologija")) {
                  micro = true;
                }

                uzorci.push(rez.id);
                newrez.code128 =
                  '<i style="font-size: 16px; color:#333;" class="fa fa-barcode"></i>';

                newrez.barcodes +=
                  "<button style='white-space: nowrap;' id='" +
                  rez.id +
                  "' title='" +
                  rez.id +
                  "' class='btn btn-info btn-micro'><span id='" +
                  rez.id +
                  "' class='fa fa-barcode'>&nbsp;</span>" +
                  rez.id[0] +
                  "</button>";
              }
            });

            samples = samples.replace(/(.+),$/, "$1");
            newrez.remove = check;
            newrez.micro = micro;

            newrez.uzorci = uzorci;

            newrez.verificiran = verificiran;

            if(newrez.nodiscount == null || newrez.discount == null || newrez.total == null){
              newrez.racun =
              "<button style='font-size: 12px; white-space: nowrap;' title='' id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='btn btn-secondary-danger btn-micro'><span id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='fa fa-credit-card'></span> RAČUN</button>";

            }else{
              newrez.racun =
              "<button style='font-size: 12px; white-space: nowrap;' title='' id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='btn btn-secondary btn-micro'><span id='" +
              pac +
              "?uzorci=" +
              samples +
              "' class='fa fa-credit-card'></span> RAČUN</button>";
            }        
          });

          if (req.query.datum === "RADNA LISTA") {
            rezultati = Rezultati.filter(function (rezultat) {
              return rezultat.verificiran === false;
            });
          } else if (req.query.datum === "VERIFICIRAN") {
            rezultati = Rezultati.filter(function (rezultat) {
              return rezultat.verificiran === true;
            });
          } else if (req.query.datum === "NEDOVRŠENO") {
            rezultati = Rezultati.filter(function (rezultat) {
              return rezultat.verificiran === false;
            });
          } else if (req.query.datum === "Mikrobiologija") {
            rezultati = Rezultati.filter(function (rezultat) {
              return rezultat.micro === true && rezultat.verificiran === false;
            });
          } else {
            // console.log('Svi Rezultati')
            rezultati = Rezultati;
          }

          var Query = req.query.filter.trim();

          if (
            Query.length === 10 &&
            isNaN(Query.charAt(0)) &&
            isNaN(Query.charAt(4)) &&
            (Query.charAt(4) === "A" || Query.charAt(4) === "B") &&
            !isNaN(Query.charAt(1)) &&
            !isNaN(Query.charAt(2)) &&
            !isNaN(Query.charAt(3)) &&
            !isNaN(Query.charAt(5)) &&
            !isNaN(Query.charAt(6)) &&
            !isNaN(Query.charAt(7)) &&
            !isNaN(Query.charAt(8)) &&
            !isNaN(Query.charAt(9))
          ) {
            console.log("Query by Sample ID: " + Query);

            var filtered = [];

            rezultati.forEach((element) => {
              element.uzorci.forEach((uzorak) => {
                if (uzorak === Query) {
                  filtered.push(element);
                }
              });
            });

            rezultati = filtered;

            // console.log(rezultati)

            var json = {};

            json.data = [];

            json.data = rezultati;
            json.total = json.data.length;
            json.per_page = req.query.per_page;
            json.current_page = req.query.page;
            json.last_page = Math.ceil(json.total / json.per_page);
            json.next_page_url =
              config.baseURL +
              "obrada/pregled?sort=" +
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
              "obrada/pregled?sort=" +
              req.query.sort +
              "&page=" +
              prev_page +
              "&per_page=" +
              req.query.per_page;
            json.from = (json.current_page - 1) * 10 + 1;
            json.to = (json.current_page - 1) * 10 + 10;
            json.data = json.data.slice(json.from - 1, json.to);
            res.json(json);
          } else {
            switch (parametar) {
              case "ime":
                rezultati = rezultati.filter(function (rezultat) {
                  return rezultat.ime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase());
                });
                break;
              case "prezime":
                rezultati = rezultati.filter(function (rezultat) {
                  return rezultat.prezime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase());
                });
                break;
              case "id":
                rezultati = rezultati.filter(function (rezultat) {
                  return rezultat.id.includes(req.query.filter);
                });
                break;
              default:
                var pacijent = req.query.filter.toLowerCase().split(" ");
                if (pacijent.length === 2) {
                  var name = pacijent[0];
                  var surname = pacijent[1];
                  rezultati = rezultati.filter(function (rezultat) {
                    return (
                      (rezultat.ime.toLowerCase().includes(name) &&
                        rezultat.prezime.toLowerCase().includes(surname)) ||
                      (rezultat.ime.toLowerCase().includes(surname) &&
                        rezultat.prezime.toLowerCase().includes(name))
                    );
                  });
                }
                if (pacijent.length === 1) {
                  var name = pacijent[0];
                  rezultati = rezultati.filter(function (rezultat) {
                    return (
                      rezultat.ime.toLowerCase().includes(name) ||
                      rezultat.prezime.toLowerCase().includes(name) ||
                      rezultat.id.includes(req.query.filter)
                    );
                  });
                }
                break;
            }
            var json = {};

            json.data = [];

            switch (parametar) {
              case "ime":
                if (order === "asc") {
                  rezultati.sort(function (a, b) {
                    return a.ime == b.ime ? 0 : +(a.ime > b.ime) || -1;
                  });
                }
                if (order === "desc") {
                  rezultati.sort(function (a, b) {
                    return a.ime == b.ime ? 0 : +(a.ime < b.ime) || -1;
                  });
                }
                break;
              case "prezime":
                if (order === "asc") {
                  rezultati.sort(function (a, b) {
                    return a.prezime == b.prezime
                      ? 0
                      : +(a.prezime > b.prezime) || -1;
                  });
                }
                if (order === "desc") {
                  rezultati.sort(function (a, b) {
                    return a.prezime == b.prezime
                      ? 0
                      : +(a.prezime < b.prezime) || -1;
                  });
                }
                break;
              case "id":
                if (order === "asc") {
                  rezultati.sort(function (a, b) {
                    return a.id.localeCompare(b.id, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                if (order === "desc") {
                  rezultati.sort(function (a, b) {
                    return b.id.localeCompare(a.id, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }

                break;

              default:
                if (
                  req.query.datum == "NEDOVRŠENO" ||
                  req.query.datum == "Svi Rezultati"
                ) {
                  rezultati.sort(function (a, b) {
                    return Date.parse(a.date) == Date.parse(b.date)
                      ? 0
                      : +(Date.parse(a.date) < Date.parse(b.date)) || -1;
                  });
                }

                if (
                  req.query.datum != "NEDOVRŠENO" &&
                  req.query.datum != "Svi Rezultati"
                ) {
                  rezultati.sort(function (a, b) {
                    return b.id.localeCompare(a.id, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }

                break;
            }

            json.data = rezultati;
            json.total = json.data.length;
            json.per_page = req.query.per_page;
            json.current_page = req.query.page;
            json.last_page = Math.ceil(json.total / json.per_page);
            json.next_page_url =
              config.baseURL +
              "obrada/pregled?sort=" +
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
              "obrada/pregled?sort=" +
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
        } else {
          res.json({
            success: false,
            message: "Nema pronađenih rezultata",
          });
        }
      }
    });
};

apiUrlController.apiUrlNalaziPregled = function (req, res) {
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
      from = od.toISOString().substring(0, 10) + "T00:00:00";
      from = new Date(from + "Z");
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
        $gt: new Date(from.setHours(1)),
      },
      status: true,
      site: mongoose.Types.ObjectId(req.query.site),
    };

    if (!req.query.filter) {
      req.query.filter = "";
    }

    if (
      req.query.dateRangeMin != undefined &&
      req.query.dateRangeMax != undefined
    ) {
      if (
        req.query.dateRangeMin != "" &&
        req.query.dateRangeMax != "" &&
        req.query.dateRangeMin === req.query.dateRangeMax
      ) {
        // console.log('Potrebna korekcija uslova.')
        from = new Date(req.query.dateRangeMin + "T00:00:00");
        to = new Date(req.query.dateRangeMax + "T23:59:59");
        uslov = {
          updated_at: {
            $gt: new Date(from.setHours(1)),
            $lt: new Date(to.setHours(24, 59, 59)),
          },
          status: true,
          site: mongoose.Types.ObjectId(req.query.site),
        };
      }

      if (
        req.query.dateRangeMin != "" &&
        req.query.dateRangeMax != "" &&
        req.query.dateRangeMin != req.query.dateRangeMax
      ) {
        // console.log('Potrebna korekcija uslova.')
        from = new Date(req.query.dateRangeMin + "T00:00:00");
        to = new Date(req.query.dateRangeMax + "T23:59:59");
        uslov = {
          updated_at: {
            $gt: new Date(from.setHours(1)),
            $lt: new Date(to.setHours(24, 59, 59)),
          },
          status: true,
          site: mongoose.Types.ObjectId(req.query.site),
        };
        req.query.datum = "Svi Rezultati";
      }
    }

    // console.log("Nalazi/Pregled:")
    // console.log(uslov.updated_at)

    Nalazi.find(uslov)
      .populate("patient posiljaoc narucioc")
      .exec(function (err, nalazi) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              nalazi = nalazi.filter(function (result) {
                return result.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              nalazi = nalazi.filter(function (result) {
                return result.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              nalazi = nalazi.filter(function (result) {
                return result.patient.jmbg
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var pacijent = req.query.filter.toLowerCase().split(" ");
              if (pacijent.length === 2) {
                var name = pacijent[0];
                var surname = pacijent[1];
                nalazi = nalazi.filter(function (result) {
                  return (
                    (result.patient.ime.toLowerCase().includes(name) &&
                      result.patient.prezime.toLowerCase().includes(surname)) ||
                    (result.patient.ime.toLowerCase().includes(surname) &&
                      result.patient.prezime.toLowerCase().includes(name))
                  );
                });
              }
              if (pacijent.length === 1) {
                var name = pacijent[0];
                nalazi = nalazi.filter(function (result) {
                  return (
                    result.patient.ime.toLowerCase().includes(name) ||
                    result.patient.prezime.toLowerCase().includes(name)
                  );
                });
              }
              break;
          }
          switch (parametar) {
            case "ime":
              if (order === "asc") {
                nalazi.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime > b.patient.ime) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime < b.patient.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                nalazi.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime > b.patient.prezime) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime < b.patient.prezime) || -1;
                });
              }
              break;
            // case "jmbg":
            //   if (order === "asc") {
            //     nalazi.sort(function (a, b) {
            //       return a.patient.jmbg.localeCompare(
            //         b.patient.jmbg,
            //         undefined,
            //         {
            //           numeric: true,
            //           sensitivity: "base",
            //         }
            //       );
            //     });
            //   }
            //   if (order === "desc") {
            //     nalazi.sort(function (a, b) {
            //       return b.patient.jmbg.localeCompare(
            //         a.patient.jmbg,
            //         undefined,
            //         {
            //           numeric: true,
            //           sensitivity: "base",
            //         }
            //       );
            //     });
            //   }
            //   break;
            default:
              nalazi.sort(function (a, b) {
                return Date.parse(a.updated_at) == Date.parse(b.updated_at)
                  ? 0
                  : +(Date.parse(a.updated_at) < Date.parse(b.updated_at)) ||
                      -1;
              });
              break;
          }
          var i = 0;
          var noviNiz = [];

          nalazi.forEach((element) => {
            if (element.status) {
              i++;
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
            "nalazi/pregled?sort=" +
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
            "nalazi/pregled?sort=" +
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
            if (uzorak.status || i > 0) {
              var pdf = config.nalaz_path;
              var exists = false;
              var file = pdf + uzorak._id + ".pdf";

              // console.log(file)

              try {
                if (fs.existsSync(file)) {
                  exists = true;
                } else {
                  exists = false;
                }
              } catch (err) {
                console.error(err);
              }

              var nalaz =
                "<button style='white-space: nowrap;' id='" +
                uzorak.timestamp +
                "' class='btn btn-secondary btn-micro'> BA</button>";

              var en =
                "<button style='white-space: nowrap;' id='" +
                uzorak.timestamp +
                "' class='btn btn-pale btn-micro'> EN</button>";

              var de =
                "<button style='white-space: nowrap;' id='" +
                uzorak.timestamp +
                "' class='btn btn-pale btn-micro'> DE</button>";

              var tmp_time = new Date(
                new Date(uzorak.updated_at)
                // .getTime() -
                //   new Date(uzorak.updated_at).getTimezoneOffset() * 60000
              ).toISOString();

              var akcija =
                JSON.stringify(uzorak.updated_at).slice(9, 11) +
                "." +
                JSON.stringify(uzorak.updated_at).slice(6, 8) +
                "." +
                JSON.stringify(uzorak.updated_at).slice(1, 5);
              var time = JSON.stringify(tmp_time).substring(12, 17);
              var uzorci = [];
              uzorak.uzorci.forEach((element) => {
                uzorci.push(element.sid);
              });

              var godiste = uzorak.patient.jmbg.substring(4, 7);
              switch (godiste[0]) {
                case "9":
                  godiste = "1" + godiste + "";
                  break;
                case "0":
                  godiste = "2" + godiste + "";
                  break;
                default:
                  godiste = "";
                  break;
              }

              if (godiste == "1920") {
                var godisteTemp = "<span style='color: #e34a4a;'>*</span>";
              } else {
                var godisteTemp = godiste;
              }

              var pacijent = uzorak.patient.ime + " " + uzorak.patient.prezime;

              if (uzorci.length > 1) {
                var partials =
                  "<i name='" +
                  pacijent +
                  "' id='" +
                  uzorci +
                  "' style='color:#4ae387;' class='vuestic-icon vuestic-icon-files'></i>";
              } else if (uzorci.length == 1) {
                var partials =
                  "<i name='" +
                  pacijent +
                  "' id='" +
                  uzorci +
                  "' style='color:#d9d9d9;' class='vuestic-icon vuestic-icon-files'></i>";
              } else {
                var partials = "";
              }

              var brisanje =
                "<button style='white-space: nowrap;' title='Brisanje nalaza' uzorka' id='" +
                uzorak._id +
                "' class='btn btn-danger btn-micro'><span id='" +
                uzorak._id +
                "' class='fa fa-trash-o'></span> IZBRIŠI</button>";

              var kontakt = "<span style='color: #e34a4a;'>*</span>";

              if (
                uzorak.patient.telefon.trim() != "" &&
                uzorak.patient.telefon.trim() != "NEPOZNATO"
              ) {
                kontakt = uzorak.patient.telefon;
              }

              // console.log(uzorak.posiljaoc)

              var posiljaoc = null;
              var narucioc = null;
              var partner =
                '<strong><span style="font-size: 13px; color:#d9d9d9;">Lični zahtjev</span></strong>';

              if (uzorak.narucioc != null) {
                var icon =
                  '<i style="font-size: 14px; color:#f7cc36;" class="fa fa-handshake-o" title="' +
                  uzorak.narucioc.naziv +
                  '"></i>';
                narucioc = uzorak.narucioc;
                partner =
                  '<strong><span style="font-size: 13px; color:#4ae387;">' +
                  uzorak.narucioc.naziv +
                  "</span></strong>";
              }

              if (uzorak.posiljaoc != null) {
                var icon =
                  '<i style="font-size: 14px; color:#f7cc36;" class="fa fa-handshake-o" title="' +
                  uzorak.posiljaoc.naziv +
                  '"></i>';
                posiljaoc = uzorak.posiljaoc;
                partner =
                  '<strong><span style="font-size: 13px; color:#4ae387;">' +
                  uzorak.posiljaoc.naziv +
                  "</span></strong>";
              }

              if (uzorak.posiljaoc == null && uzorak.narucioc == null) {
                var icon =
                  '<i style="font-size: 14px; color:#d9d9d9;" class="fa fa-handshake-o"></i>';
              }

              json.data.push({
                partneri: partner,
                narucioc: uzorak.narucioc,
                posiljaoc: uzorak.posiljaoc,
                telefon: kontakt,
                godiste: godisteTemp,
                en: en,
                de: de,
                nalazipregled: nalaz,
                ime: uzorak.patient.ime,
                prezime: uzorak.patient.prezime,
                status: "<strong>VERIFICIRAN</strong>",
                jmbg: uzorak.patient.jmbg,
                uzorci: uzorci,
                partials: partials,

                time: time,
                izmjena: akcija,
                brisanje: brisanje,
              });
            }
          });
          res.json(json);
        }
      });
  }
};

apiUrlController.apiUrlNalaziOutbox = function (req, res) {
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
      from = od.toISOString().substring(0, 10) + "T00:00:00";
      from = new Date(from + "Z");
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
      created_at: {
        $gt: new Date(from.setHours(1)),
      },
      patient: {
        $exists: true,
      },
      site: mongoose.Types.ObjectId(req.query.site),
    };

    if (!req.query.filter) {
      req.query.filter = "";
    }

    if (
      req.query.dateRangeMin != undefined &&
      req.query.dateRangeMax != undefined
    ) {
      if (
        req.query.dateRangeMin != "" &&
        req.query.dateRangeMax != "" &&
        req.query.dateRangeMin === req.query.dateRangeMax
      ) {
        // console.log('Potrebna korekcija uslova.')
        from = new Date(req.query.dateRangeMin + "T00:00:00");
        to = new Date(req.query.dateRangeMax + "T23:59:59");
        uslov = {
          created_at: {
            $gt: new Date(from.setHours(1)),
            $lt: new Date(to.setHours(24, 59, 59)),
          },
          patient: {
            $exists: true,
          },
          site: mongoose.Types.ObjectId(req.query.site),
        };
      }

      if (
        req.query.dateRangeMin != "" &&
        req.query.dateRangeMax != "" &&
        req.query.dateRangeMin != req.query.dateRangeMax
      ) {
        // console.log('Potrebna korekcija uslova.')
        from = new Date(req.query.dateRangeMin + "T00:00:00");
        to = new Date(req.query.dateRangeMax + "T23:59:59");
        uslov = {
          created_at: {
            $gt: new Date(from.setHours(1)),
            $lt: new Date(to.setHours(24, 59, 59)),
          },
          patient: {
            $exists: true,
          },
          site: mongoose.Types.ObjectId(req.query.site),
        };
        req.query.datum = "Svi Rezultati";
      }
    }

    // console.log("Outbox/Pregled:")
    // console.log(uslov.created_at)

    Outbox.find(uslov)
      .populate("patient nalaz")
      .exec(function (err, nalazi) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              nalazi = nalazi.filter(function (result) {
                return result.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              nalazi = nalazi.filter(function (result) {
                return result.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              nalazi = nalazi.filter(function (result) {
                return result.patient.jmbg
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var pacijent = req.query.filter.toLowerCase().split(" ");
              if (pacijent.length === 2) {
                var name = pacijent[0];
                var surname = pacijent[1];
                nalazi = nalazi.filter(function (result) {
                  return (
                    (result.patient.ime.toLowerCase().includes(name) &&
                      result.patient.prezime.toLowerCase().includes(surname)) ||
                    (result.patient.ime.toLowerCase().includes(surname) &&
                      result.patient.prezime.toLowerCase().includes(name))
                  );
                });
              }
              if (pacijent.length === 1) {
                var name = pacijent[0];
                nalazi = nalazi.filter(function (result) {
                  return (
                    result.patient.ime.toLowerCase().includes(name) ||
                    result.patient.prezime.toLowerCase().includes(name)
                  );
                });
              }
              break;
          }
          switch (parametar) {
            case "ime":
              if (order === "asc") {
                nalazi.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime > b.patient.ime) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime < b.patient.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                nalazi.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime > b.patient.prezime) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime < b.patient.prezime) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                nalazi.sort(function (a, b) {
                  return a.patient.jmbg == b.patient.jmbg
                    ? 0
                    : +(a.patient.jmbg > b.patient.jmbg) || -1;
                });
              }
              if (order === "desc") {
                nalazi.sort(function (a, b) {
                  return a.patient.jmbg == b.patient.jmbg
                    ? 0
                    : +(a.patient.jmbg < b.patient.jmbg) || -1;
                });
              }
              break;
            default:
              nalazi.sort(function (a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }
          var i = 0;
          var noviNiz = [];

          nalazi.forEach((element) => {
            i++;
            noviNiz.push(element);
          });

          var json = {};
          json.total = noviNiz.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "nalazi/outbox?sort=" +
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
            "nalazi/outbox?sort=" +
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
            if (uzorak.status || i > 0) {
              if (uzorak.nalaz._id != null && uzorak.nalaz._id != undefined) {
                switch (uzorak.language) {
                  case "BA":
                    var nalaz =
                      "<button style='text-transform: none; white-space: nowrap;' id='" +
                      uzorak.naziv +
                      "' class='btn btn-primary btn-micro'><span id='" +
                      uzorak.naziv +
                      "' class='fa fa-envelope-o'></span> Outbox (BA)</button>";

                    break;

                  default:
                    var nalaz =
                      "<button style='white-space: nowrap;' id='" +
                      uzorak.naziv +
                      "' class='btn btn-pale btn-micro'><span id='" +
                      uzorak.naziv +
                      "' class='fa fa-envelope-o'></span> NALAZ (BA)</button>";
                    break;
                }

                var godiste = uzorak.patient.jmbg.substring(4, 7);
                switch (godiste[0]) {
                  case "9":
                    godiste = "1" + godiste + "";
                    break;
                  case "0":
                    godiste = "2" + godiste + "";
                    break;
                  default:
                    godiste = "";
                    break;
                }

                if (godiste == "1920") {
                  var godisteTemp = "<span style='color: #e34a4a;'>*</span>";
                } else {
                  var godisteTemp = godiste;
                }

                var akcija = "<strong>POSLANO</strong>";
                var brisanje =
                  "<button style='white-space: nowrap;' title='Brisanje nalaza' uzorka' name='" +
                  uzorak.nalaz._id +
                  "' id='" +
                  uzorak._id +
                  "' class='btn btn-danger btn-micro'><span name='" +
                  uzorak.nalaz._id +
                  "' id='" +
                  uzorak._id +
                  "' class='fa fa-trash-o'></span> IZBRIŠI</button>";

                var dan = uzorak.created_at.toString().substring(8, 10);
                var mjesec = uzorak.created_at.toString().substring(4, 7);
                var godina = uzorak.created_at.toString().substring(11, 15);

                switch (mjesec) {
                  case "Jan":
                    mjesec = "01";
                    break;
                  case "Feb":
                    mjesec = "02";
                    break;
                  case "Mar":
                    mjesec = "03";
                    break;
                  case "Apr":
                    mjesec = "04";
                    break;
                  case "May":
                    mjesec = "05";
                    break;
                  case "Jun":
                    mjesec = "06";
                    break;
                  case "Jul":
                    mjesec = "07";
                    break;
                  case "Aug":
                    mjesec = "08";
                    break;
                  case "Sep":
                    mjesec = "09";
                    break;
                  case "Oct":
                    mjesec = "10";
                    break;
                  case "Nov":
                    mjesec = "11";
                    break;
                  case "Dec":
                    mjesec = "12";
                    break;
                  default:
                    mjesec = "00";
                    break;
                }

                /* var datum =
                  dan +
                  "." +
                  mjesec +
                  "." +
                  godina +
                  " " +
                  uzorak.created_at.toString().substring(16, 21); */

                var datum =
                  JSON.stringify(
                    JSON.stringify(uzorak.created_at).substring(1, 11)
                  ).slice(9, 11) +
                  "." +
                  JSON.stringify(
                    JSON.stringify(uzorak.created_at).substring(1, 11)
                  ).slice(6, 8) +
                  "." +
                  JSON.stringify(
                    JSON.stringify(uzorak.created_at).substring(1, 11)
                  ).slice(1, 5) +
                  " " +
                  JSON.stringify(uzorak.created_at).substring(12, 17);

                // console.log(datum);

                var kontakt = "<span style='color: #e34a4a;'>*</span>";

                if (
                  uzorak.patient.telefon.trim() != "" &&
                  uzorak.patient.telefon.trim() != "NEPOZNATO"
                ) {
                  kontakt = uzorak.patient.telefon;
                }

                json.data.push({
                  outbox: nalaz,
                  godiste: godisteTemp,
                  kontakt: kontakt,
                  ime: uzorak.patient.ime,
                  prezime: uzorak.patient.prezime,
                  jmbg: uzorak.patient.jmbg,
                  izmjena: datum,
                  brisanjeOutbox: brisanje,
                  to: uzorak.to,
                  datum: datum,
                });
              }
            }
          });
          res.json(json);
        }
      });
  }
};

apiUrlController.apiUrlLabAssays = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err,
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    if (!req.query.filter) {
      req.query.filter = "";
    }

    var uslov = { disabled: false, active: true, test_type: "default" };

    Sekcija.find({}).exec(function (err, sekcije) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        /* sekcije = sekcije.sort(function (a, b) {
          return a.order.localeCompare(b.order, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }); */

        LabAssays.find(uslov).exec(function (err, results) {
          if (err) {
            console.log("Greška:", err);
          } else {
            results.forEach((result) => {
              result.order = result.grouporder;

              sekcije.forEach((sekcija) => {
                if (result.sekcija == sekcija.sekcija) {
                  result.order = sekcija.order + result.grouporder;
                }
              });
            });

            switch (parametar) {
              case "sifra":
                results = results.filter(function (result) {
                  return result.sifra
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase());
                });
                break;
              case "naziv":
                results = results.filter(function (result) {
                  return result.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase());
                });
                break;
              case "analit":
                results = results.filter(function (result) {
                  return result.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase());
                });
                break;
              case "sekcija":
                results = results.filter(function (result) {
                  return result.sekcija
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase());
                });
                break;
              case "order":
                results = results.filter(function (result) {
                  return result.grouporder
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase());
                });
                break;

              default:
                results = results.filter(function (result) {
                  return (
                    result.naziv
                      .toLowerCase()
                      .includes(req.query.filter.toLowerCase()) ||
                    result.analit
                      .toLowerCase()
                      .includes(req.query.filter.toLowerCase())
                  );
                });
                break;
            }

            var json = {};
            json.total = results.length;
            json.per_page = req.query.per_page;
            json.current_page = req.query.page;
            json.last_page = Math.ceil(json.total / json.per_page);
            json.next_page_url =
              config.baseURL +
              "assays/lab?sort=" +
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
              "assays/lab?sort=" +
              req.query.sort +
              "&page=" +
              prev_page +
              "&per_page=" +
              req.query.per_page;
            json.from = (json.current_page - 1) * 10 + 1;
            json.to = (json.current_page - 1) * 10 + 10;
            json.data = [];

            switch (parametar) {
              case "sifra":
                if (order === "asc") {
                  results = results.sort(function (a, b) {
                    return a.sifra.localeCompare(b.sifra, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                if (order === "desc") {
                  results = results.sort(function (a, b) {
                    return b.sifra.localeCompare(a.sifra, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                break;
              case "naziv":
                if (order === "asc") {
                  results = results.sort(function (a, b) {
                    return a.naziv.localeCompare(b.naziv, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                if (order === "desc") {
                  results = results.sort(function (a, b) {
                    return b.naziv.localeCompare(a.naziv, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                break;
              case "analit":
                if (order === "asc") {
                  results = results.sort(function (a, b) {
                    return a.analit.localeCompare(b.analit, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                if (order === "desc") {
                  results = results.sort(function (a, b) {
                    return b.analit.localeCompare(a.analit, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                break;
              case "sekcija":
                if (order === "asc") {
                  results = results.sort(function (a, b) {
                    return a.sekcija.localeCompare(b.sekcija, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                if (order === "desc") {
                  results = results.sort(function (a, b) {
                    return b.sekcija.localeCompare(a.sekcija, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                  });
                }
                break;
              case "order":
                if (order === "asc") {
                  results.sort(function (a, b) {
                    return a.grouporder == b.grouporder
                      ? 0
                      : +(a.grouporder > b.grouporder) || -1;
                  });
                }
                if (order === "desc") {
                  results.sort(function (a, b) {
                    return a.grouporder == b.grouporder
                      ? 0
                      : +(a.grouporder < b.grouporder) || -1;
                  });
                }
                break;
              default:
                results = results.sort(function (a, b) {
                  return a.grouporder.localeCompare(b.grouporder, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
                break;
            }

            var niz = results.slice(json.from - 1, json.to);

            niz.forEach((labassay) => {
              var multi = "";
              var icon = "";

              if (labassay.multi) {
                multi =
                  '<button class="btn btn-primary btn-micro"><span class="fa fa-gears"></span></button>';
              } else if (!labassay.multi) {
                multi =
                  '<button class="btn btn-pale btn-micro"><span class="fa fa-ban"></span></button>';
              } else {
              }

              if (req.query.access < 1) {
                if (!labassay.manual && !labassay.calculated) {
                  icon =
                    '<span style="color: #4ae387; font-size: 12px;" class="vuestic-icon vuestic-icon-settings"></span>';
                } else if (labassay.manual) {
                  icon =
                    '<span style="color: #d9d9d9; font-size: 12px;" class="vuestic-icon vuestic-icon-settings"></span>';
                } else if (!labassay.manual && labassay.calculated) {
                  icon =
                    '<span style="color: #f7cc36; font-size: 12px;" class="vuestic-icon vuestic-icon-settings"></span>';
                } else {
                }
              } else {
                if (!labassay.manual && !labassay.calculated) {
                  icon = '<span class="circle badge-primary"></span>';
                } else if (labassay.manual) {
                  icon = '<span class="circle badge-pale"></span>';
                } else if (!labassay.manual && labassay.calculated) {
                  icon = '<span class="circle badge-warning"></span>';
                } else {
                }
              }

              var edit =
                '<button class="btn btn-warning btn-micro"><span class="glyphicon glyphicon-edit"></span></button>';
              var akcija =
                '<button class="btn btn-danger btn-micro"><span class="fa fa-trash-o"></span></button>';
              // var akcija = '<span style="color:#e34a4a;" class="fa fa-trash-o"></span>';

              // console.log(labassay.tip)

              json.data.push({
                labassay: labassay,
                uzorak: labassay.tip,
                id: labassay._id,
                icon: icon,
                sifra: labassay.sifra,
                price: labassay.price + " KM",
                naziv: labassay.naziv,
                analit: labassay.analit,
                jedinica: labassay.jedinica,
                multi: multi,
                order: labassay.grouporder,
                sekcija: labassay.sekcija,
                uredi: edit,
                akcija: akcija,
              });
            });
            res.json(json);
          }
        });
      }
    });
  }
};

apiUrlController.apiUrlAnaAssays = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err,
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    if (!req.query.filter) {
      req.query.filter = "";
    }

    var uslov = {
      disabled: false,
      active: true,
      site: mongoose.Types.ObjectId(req.query.site),
    };

    AnaAssays.find(uslov)
      .populate("test aparat")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "kod":
              results = results.filter(function (result) {
                return (
                  result.kod.includes(req.query.filter) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "naziv":
              results = results.filter(function (result) {
                return (
                  result.test.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "analit":
              results = results.filter(function (result) {
                return (
                  result.test.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;
            case "sekcija":
              results = results.filter(function (result) {
                return (
                  result.sekcija
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                  result.test.test_type === "default"
                );
              });
              break;

            default:
              results = results.filter(function (result) {
                return (
                  (result.test.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                    result.test.test_type === "default") ||
                  (result.test.analit
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) &&
                    result.test.test_type === "default")
                );
              });
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "assays/ana?sort=" +
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
            "assays/ana?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "kod":
              if (order === "asc") {
                results = results.sort(function (a, b) {
                  return a.kod.localeCompare(b.kod, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function (a, b) {
                  return b.kod.localeCompare(a.kod, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;
            case "naziv":
              if (order === "asc") {
                results = results.sort(function (a, b) {
                  return a.test.naziv.localeCompare(b.test.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function (a, b) {
                  return b.test.naziv.localeCompare(a.test.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;
            case "analit":
              if (order === "asc") {
                results = results.sort(function (a, b) {
                  return a.test.analit.localeCompare(b.test.analit, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function (a, b) {
                  return b.test.analit.localeCompare(a.test.analit, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;
            case "sekcija":
              if (order === "asc") {
                results = results.sort(function (a, b) {
                  return a.sekcija.localeCompare(b.sekcija, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function (a, b) {
                  return b.sekcija.localeCompare(a.sekcija, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;

            default:
              results = results.sort(function (a, b) {
                return a.test.grouporder.localeCompare(
                  b.test.grouporder,
                  undefined,
                  {
                    numeric: true,
                    sensitivity: "base",
                  }
                );
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach((anaassay) => {
            var kod = anaassay.kod;
            var naziv = anaassay.test.naziv;
            var analit = anaassay.test.analit;
            var tip = anaassay.tipoviUzorka[0];
            var analizator = anaassay.aparat.ime;
            var metoda = anaassay.metoda;
            var sekcija = anaassay.sekcija;

            if (anaassay.reference.length) {
              var reference =
                '<button class="btn btn-primary btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';
            } else {
              var reference =
                '<button class="btn btn-pale btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';
            }

            var uredi =
              '<button class="btn btn-warning btn-micro"><span class="glyphicon glyphicon-edit"></span></button>';
            var akcija =
              '<button class="btn btn-danger btn-micro"><span class="fa fa-trash-o"></span></button>';

            json.data.push({
              anaassay: anaassay,
              id: anaassay._id,
              kod: kod,
              naziv: naziv,
              analit: analit,
              tip: tip,
              analizator: analizator,
              metoda: metoda,
              sekcija: sekcija,
              reference: reference,
              uredi: uredi,
              akcija: akcija,
            });
          });
          res.json(json);
        }
      });
  }
};

// New Code

apiUrlController.apiUrlControlEdit = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err,
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    if (!req.query.filter) {
      req.query.filter = "";
    }

    var uslov = {
      site: mongoose.Types.ObjectId(req.query.site),
    };

    Kontrole.find(uslov)
      .populate("aparati")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "naziv":
              results = results.filter(function (result) {
                return result.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;

            case "proizvođač":
              results = results.filter(function (result) {
                return result.maker
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "LOT":
              results = results.filter(function (result) {
                return result.lot
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;

            default:
              results = results.filter(function (result) {
                return (
                  result.naziv
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) ||
                  result.maker
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase())
                );
              });
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "control/edit?sort=" +
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
            "control/edit?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "naziv":
              if (order === "asc") {
                results = results.sort(function (a, b) {
                  return a.naziv.localeCompare(b.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function (a, b) {
                  return b.naziv.localeCompare(a.naziv, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;

            case "proizvođač":
              if (order === "asc") {
                results = results.sort(function (a, b) {
                  return a.maker.localeCompare(b.maker, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function (a, b) {
                  return b.maker.localeCompare(a.maker, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;

            case "LOT":
              if (order === "asc") {
                results = results.sort(function (a, b) {
                  return a.lot.localeCompare(b.lot, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                results = results.sort(function (a, b) {
                  return b.lot.localeCompare(a.lot, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;

            default:
              results.sort(function (a, b) {
                return Date.parse(a.rok) == Date.parse(b.rok)
                  ? 0
                  : +(Date.parse(a.rok) < Date.parse(b.rok)) || -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach((control) => {
            var naziv = control.naziv;
            var proizvođač = control.maker;
            var LOT = control.lot;
            var analizatorDATA = control.aparati;
            var referenceDATA = control.aparati;
            var rok = control.rok.toISOString().substring(0, 10);

            if (control.multi) {
              var multi =
                '<span style="font-size: 14.5px; color:#555;">Multi</span>';
            } else {
              var multi =
                '<span style="font-size: 13px; color:#555;">Single</span>';
            }

            var isteklo = "";

            switch (Date.now() > control.rok) {
              case true:
                var isteklo =
                  '<span style="font-size: 14px; color:#e34a4a;" class="fa fa-ban"></span>';
                break;
              case false:
                var isteklo =
                  '<span style="font-size: 14px; color:#4ae387;" class="fa fa-check"></span>';
                break;
            }

            var analizator =
              '<button class="btn btn-info btn-micro"><span class="glyphicon glyphicon-object-align-bottom"></span></button>';

            var reference =
              '<button class="btn btn-primary btn-micro"><span class="glyphicon glyphicon-stats"></span></button>';

            var uredi =
              '<button class="btn btn-warning btn-micro"><span class="glyphicon glyphicon-edit"></span></button>';
            var akcija =
              '<button class="btn btn-danger btn-micro"><span class="fa fa-trash-o"></span></button>';

            json.data.push({
              control: control,
              icon: isteklo,
              id: control._id,
              naziv: naziv,
              proizvođač: proizvođač,
              rok: rok,
              LOT: LOT,
              analizatorDATA: analizatorDATA,
              tip: multi,
              referenceDATA: referenceDATA,
              analizator: analizator,
              reference: reference,
              uredi: uredi,
              akcija: akcija,
            });
          });
          res.json(json);
        }
      });
  }
};

//
//
//
//
//
//
//
//
//
//

apiUrlController.apiUrlControlResults = function (req, res) {
  var datum = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .substring(0, 10);

  var datum14 = JSON.stringify(
    new Date(new Date().setDate(new Date().getDate() - 14))
  ).substring(1, 11);

  var datum7 = JSON.stringify(
    new Date(new Date().setDate(new Date().getDate() - 7))
  ).substring(1, 11);

  var from = new Date(datum + "T00:00:00Z");
  var to = new Date(datum + "T23:59:59Z");

  switch (req.query.datum) {
    case "NEDOVRŠENO":
      datum = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 1))
      ).substring(1, 11);

      from = new Date(datum14 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    case "Svi Rezultati":
      from = new Date(datum14 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    case "Mikrobiologija":
      from = new Date(datum7 + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;

    default:
      from = new Date(datum + "T00:00:00");
      to = new Date(datum + "T23:59:59");

      break;
  }

  var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
  var order = req.query.sort
    .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
    .trim();
  var uslov = {};

  uslov = {
    created_at: {
      $gt: new Date(from.setHours(2)),
      $lt: new Date(to.setHours(25, 59, 59)),
    },
    site: mongoose.Types.ObjectId(req.query.site),
  };

  if (!req.query.filter) {
    req.query.filter = "";
  }

  if (
    req.query.dateRangeMin != undefined &&
    req.query.dateRangeMax != undefined
  ) {
    if (req.query.dateRangeMin != "" && req.query.dateRangeMax != "") {
      // console.log('Potrebna korekcija uslova.')
      from = new Date(req.query.dateRangeMin + "T00:00:00");
      to = new Date(req.query.dateRangeMax + "T23:59:59");
      uslov = {
        created_at: {
          $gt: new Date(from.setHours(2)),
          $lt: new Date(to.setHours(25, 59, 59)),
        },
        site: mongoose.Types.ObjectId(req.query.site),
      };
      req.query.datum = "Svi Rezultati";
    }
  }

  ControlSamples.find(uslov)
    .populate("kontrola site tests.labassay tests.aparat")
    .sort({
      created_at: -1,
    })
    .exec(function (err, rezultati) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultati.length) {
          var Rezultati = [];

          rezultati.forEach((element) => {
            if (element.kontrola.multi) {
              var tip =
                '<span style="font-size: 14.5px; color:#555;">Multi</span>';
            } else {
              var tip =
                '<span style="font-size: 13px; color:#555;">Single</span>';
            }

            var analizatori = element.kontrola.aparati;

            var Time = new Date(
              new Date(element.updated_at).getTime() -
                new Date(element.updated_at).getTimezoneOffset() * 60000
            ).toISOString();

            Rezultati.push({
              _id: element._id,
              control: element.id,
              kontrole:
                "<button style='white-space: nowrap;' id='" +
                element._id +
                "' title='' class='btn btn-warning btn-micro'><span class='glyphicon glyphicon-search'></span> PREGLED</button>",
              tip: tip,
              status: element.status,
              naziv: element.kontrola.naziv,
              proizvođač: element.kontrola.maker,
              lot: element.kontrola.lot,
              rok: element.kontrola.rok.toISOString().substring(0, 10),
              analizatori: analizatori, // Array of ObjectId
              barcode:
                "<button style='white-space: nowrap;' id='" +
                element.id +
                "' title='" +
                element.id +
                "' class='btn btn-info btn-micro'><span id='" +
                element.id +
                "' class='fa fa-barcode'>&nbsp;</span>" +
                element.id +
                "</button>",
              komentar: element.komentar,
              created: Time,

              datum:
                JSON.stringify(JSON.stringify(Time).substring(1, 11)).slice(
                  9,
                  11
                ) +
                "." +
                JSON.stringify(JSON.stringify(Time).substring(1, 11)).slice(
                  6,
                  8
                ) +
                "." +
                JSON.stringify(JSON.stringify(Time).substring(1, 11)).slice(
                  1,
                  5
                ),
              vrijeme: JSON.stringify(Time).substring(12, 17),
            });
          });

          if (req.query.datum === "RADNA LISTA") {
            rezultati = Rezultati.filter(function (rezultat) {
              return rezultat.status != "VERIFICIRAN";
            });
          } else if (req.query.datum === "VERIFICIRAN") {
            rezultati = Rezultati.filter(function (rezultat) {
              return rezultat.status === "VERIFICIRAN";
            });
          } else if (req.query.datum === "NEDOVRŠENO") {
            rezultati = Rezultati.filter(function (rezultat) {
              return rezultat.status != "VERIFICIRAN";
            });
          } else {
            rezultati = Rezultati;
          }

          switch (parametar) {
            case "naziv":
              rezultati = rezultati.filter(function (rezultat) {
                return rezultat.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "proizvođač":
              rezultati = rezultati.filter(function (rezultat) {
                return rezultat.proizvođač
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "lot":
              rezultati = rezultati.filter(function (rezultat) {
                return rezultat.lot.includes(req.query.filter);
              });
              break;
            default:
              rezultati = rezultati.filter(function (rezultat) {
                return rezultat.naziv
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
          }

          var json = {};

          json.data = [];

          switch (parametar) {
            case "naziv":
              if (order === "asc") {
                rezultati.sort(function (a, b) {
                  return a.naziv == b.naziv ? 0 : +(a.naziv > b.naziv) || -1;
                });
              }
              if (order === "desc") {
                rezultati.sort(function (a, b) {
                  return a.naziv == b.naziv ? 0 : +(a.naziv < b.naziv) || -1;
                });
              }
              break;
            case "proizvođač":
              if (order === "asc") {
                rezultati.sort(function (a, b) {
                  return a.proizvođač == b.proizvođač
                    ? 0
                    : +(a.proizvođač > b.proizvođač) || -1;
                });
              }
              if (order === "desc") {
                rezultati.sort(function (a, b) {
                  return a.proizvođač == b.proizvođač
                    ? 0
                    : +(a.proizvođač < b.proizvođač) || -1;
                });
              }
              break;
            case "lot":
              if (order === "asc") {
                rezultati.sort(function (a, b) {
                  return a.lot.localeCompare(b.lot, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                rezultati.sort(function (a, b) {
                  return b.lot.localeCompare(a.lot, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }

              break;
            default:
              rezultati.sort(function (a, b) {
                return Date.parse(a.created) == Date.parse(b.created)
                  ? 0
                  : +(Date.parse(a.created) < Date.parse(b.created)) || -1;
              });
              break;
          }

          json.data = rezultati;
          json.total = json.data.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "kontrole/obrada/pregled?sort=" +
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
            "kontrole/brada/pregled?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = json.data.slice(json.from - 1, json.to);
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

module.exports = apiUrlController;
