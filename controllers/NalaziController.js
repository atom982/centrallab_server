const config = require("../config/index");
var mongoose = require("mongoose");
var fs = require("fs");

var Lokacija = mongoose.model("Lokacija");
var Results = mongoose.model("Results");
var Nalazi = mongoose.model("Nalazi");
var Outbox = mongoose.model("Outbox");
var interpretacija = require("../funkcije/reference");
var report_template = require("./report_functions/report_template");

var iskljucen = require("./iskljuci/iskljucen");

var nodemailer = require("nodemailer");
const HummusRecipe = require("hummus-recipe");

var nalazController = {};

// Obrada, Salko Islamović (13.03.2019)
nalazController.Mail = function (req, res) {
  var timestamp = (
    new Date().getTime() -
    new Date().getTimezoneOffset() * 60000
  ).toString();

  switch (req.body.parametar) {
    case "/partials":
      var input = config.nalaz_path + "partials/" + req.body.naziv + ".pdf";

      break;

    case "/samples":
      var input = config.nalaz_path + "samples/" + req.body.naziv + ".pdf";

      break;

    default:
      var input = config.nalaz_path + req.body.naziv + ".pdf";
      break;
  }
  // var input = config.nalaz_path + req.body.naziv + '.pdf';
  var output = config.nalaz_path + "emails/" + timestamp + ".pdf";

  // console.log(req.body.parametar)
  // console.log(input)
  // console.log(output)

  const pdfDoc = new HummusRecipe(input, output);

  var page = pdfDoc.metadata.pages;

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Nalazi.findOne({
      timestamp: req.body.timestamp,
      // location: req.body.location,
      naziv: req.body.naziv,
      // status: true
    })
      .populate("patient site")
      .exec(function (err, nalaz) {
        if (err) {
          res.json({
            success: false,
            message: "Greška prilikom pronalaženja nalaza.",
          });
        } else {
          if (!nalaz) {
            res.json({
              success: false,
              message: "Nalaz nije pronađen.",
            });
          } else {
            var height = nalaz.height;
            var heightStamp = (Number(nalaz.height) + 20).toString();
						console.log(heightStamp)

            let pageStr = [];

            for (i = 0; i < page; i++) {
              pageStr.push(i + 1);
            }

            var logo_x = 45;
            var logo_y = 25;
            var logo_w = 200;
            // var eddress = "-eddress";

            pageStr.forEach((str) => {
              if (str == page) {
                if (str > 1) {
                  logo_x = 1000;
                } else {
                }
                pdfDoc
                  .editPage(str)
                  // .image(config.nalaz_logo + nalaz.site.sifra + ".jpg", logo_x, logo_y, { width: logo_w, keepAspectRatio: true })
                 .image(
										config.nalaz_signature +
											nalaz.site.sifra +
											'-' +
											"Stamp" +
											'.png',
										172,
										heightStamp,
										{ width: 120, keepAspectRatio: true }
									)
									.image(
										config.nalaz_signature +
											nalaz.site.sifra +
											'-' +
											"centrallab" +
											'.png',
										372,
										heightStamp - 20,
										{ width: 150, keepAspectRatio: true }
									)
                  // .image(config.nalaz_footer + nalaz.site.sifra + eddress + ".jpg", 0, 745, { width: 615, keepAspectRatio: true })
                  // .text("Stranica " + str + " od " + page, 300, 790, { fontSize: 8, align: "center center" })
                  .endPage();
              } else {
                if (str > 1) {
                  logo_x = 1000; // Ispiši Logo samo na prvoj stranici
                } else {
                }
                pdfDoc
                  .editPage(str)
                  // .image(config.nalaz_logo + nalaz.site.sifra + ".jpg", logo_x, logo_y, { width: logo_w, keepAspectRatio: true })
                  // .image(config.nalaz_footer + nalaz.site.sifra + eddress + ".jpg", 0, 745, { width: 615, keepAspectRatio: true })
                  // .text("Stranica " + str + " od " + page, 300, 790, { fontSize: 8, align: "center center" })
                  .endPage();
              }
            });

            // pdfDoc.encrypt({ userPassword: '123', ownerPassword: '123', userProtectionFlag: 4 }).endPDF(()=>{});

            pdfDoc.endPDF(function (err) {
              if (err) {
                console.log("Greška:", err);
              } else {
                if (nalaz.patient.spol === "MUŠKI") {
                  var postovani = "Poštovani";
                } else {
                  var postovani = "Poštovana";
                }

                var naslov = postovani + " " + nalaz.patient.ime + ",";
                var text =
                  "U prilogu se nalaze rezultati laboratorijskih pretraga. <br> Hvala Vam na povjerenju.<br><br> Srdačan pozdrav,";

                var html = require("../mailtemplate/mail_template");

                var template = html.MailTemplate(
                  nalaz.site.naziv,
                  nalaz.site.sifra,
                  nalaz.site.web,
                  naslov,
                  text,
                  nalaz.site.opis,
                  nalaz.site.adresa,
                  nalaz.site.email,
                  nalaz.site.telefon,
                  nalaz.site.mobitel
                );

                var smtpConfig = {
                  pool: true,
                  host: process.env.MAIL_HOST,
                  port: process.env.MAIL_PORT,
                  secure: true,
                  auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASSWORD,
                  },
                  tls: {
                    rejectUnauthorized: false,
                  },
                };

                var transporter = nodemailer.createTransport(smtpConfig);

                // var cc = process.env.MAIL_USER;
                var cc = nalaz.site.email;

                var mailOptions = {
                  from:
                    '"' +
                    nalaz.site.opis +
                    '"' +
                    " <" +
                    process.env.MAIL_USER +
                    ">",
                  to: req.body.email, // + ',' + cc,
                  replyTo: nalaz.site.email,
                  subject:
                    "Nalaz za pacijenta: " +
                    nalaz.patient.ime +
                    " " +
                    nalaz.patient.prezime,
                  html: template,
                  attachments: [
                    {
                      filename: timestamp + ".pdf",
                      content: fs.createReadStream(
                        config.nalaz_path + "emails/" + timestamp + ".pdf"
                      ),
                    },
                  ],
                };

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log("Greška:", error);
                    res.json({
                      success: false,
                      message: "Greška prilikom slanja maila.",
                    });
                  } else {
                    // console.log(info.response);
                    // console.log(info.messageId)
                    var outbox = new Outbox({
                      to: req.body.email,
                      subject: mailOptions.subject,
                      naziv: timestamp,
                      nalaz: nalaz._id,
                      language: "BA",
                      patient: nalaz.patient._id,
                      migrated: false,
                      site: nalaz.site._id,
                      created_at: new Date(
                        new Date().getTime() -
                          new Date().getTimezoneOffset() * 60000
                      ),
                      created_by: req.body.decoded.user,
                    });
                    // console.log(outbox);

                    // to: { type: String, required: true },
                    // subject: { type: String, required: true },
                    // naziv: { type: String, required: true },
                    // nalaz: { type: mongoose.Schema.ObjectId, ref: "Nalazi" },
                    // language: { type: String, default: "BA" },
                    // patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
                    // migrated: { type: Boolean, default: false },
                    // site: { type: mongoose.Schema.ObjectId, ref: "Site" },
                    // created_at: {
                    // 	type: Date,
                    // 	default: new Date(
                    // 	new Date().getTime() - new Date().getTimezoneOffset() * 60000
                    // 	),
                    // },
                    // created_by: { type: String, default: "" },

                    outbox.save(function (err) {
                      if (err) {
                        console.log("Greška:", err);
                        res.json({
                          success: false,
                          message: err,
                        });
                      } else {
                        res.json({
                          success: true,
                          message: "Mail uspješno poslan.",
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        }
      });
  }
};
// End of Obrada

nalazController.setHeight = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Nalazi.findOne({
      timestamp: req.body.timestamp,
      location: req.body.location,
      naziv: req.body.naziv,
    })
      .populate("patient site")
      .exec(function (err, nalaz) {
        if (err) {
          res.json({
            success: false,
            message: "Greška prilikom pronalaženja nalaza.",
          });
        } else {
          if (!nalaz) {
            res.json({
              success: false,
              message: "Nalaz nije pronađen.",
            });
          } else {
            nalaz.height = req.body.height;
            nalaz.save();
            res.json({
              success: true,
              message: "Height Set.",
            });
          }
        }
      });
  }
};

nalazController.List = function (req, res) {
  // console.log("Verifikacija (Pretraga)");
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
      var datum14 = JSON.stringify(
        new Date(new Date().setDate(new Date().getDate() - 14))
      ).substring(1, 11);

      to = new Date(danasnjiDatum + "T23:59:59");
      from = new Date(datum14 + "T00:00:00");
    } else {
      to = new Date(danasnjiDatum + "T23:59:59");
      var from = new Date(danasnjiDatum + "T00:00:00");
    }

    // console.log("od:" + from);
    // console.log("do:" + to);

    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();
    var uslov = {};
    uslov = {
      updated_at: {
        $gt: from,
        $lt: to,
      },
      site: req.query.site,
    };
    if (!req.query.filter) {
      req.query.filter = "";
    }

    Results.find(uslov)
      .populate("sample patient ")
      .exec(function (err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "id":
              results = results.filter(function (result) {
                return result.sample.pid.includes(req.query.filter);
              });
              break;

            case "ime":
              results = results.filter(function (result) {
                return result.patient.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;

            case "prezime":
              results = results.filter(function (result) {
                return result.patient.prezime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              results = results.filter(function (result) {
                return result.patient.jmbg
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              results = results.filter(function (result) {
                return (
                  result.patient.ime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase()) ||
                  result.patient.prezime
                    .toLowerCase()
                    .includes(req.query.filter.toLowerCase())
                );
              });
              break;
          }
          switch (parametar) {
            case "id":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.sample.pid.localeCompare(b.sample.pid, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return b.sample.pid.localeCompare(a.sample.pid, undefined, {
                    numeric: true,
                    sensitivity: "base",
                  });
                });
              }
              break;

            case "ime":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime > b.patient.ime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.patient.ime == b.patient.ime
                    ? 0
                    : +(a.patient.ime < b.patient.ime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime > b.patient.prezime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.patient.prezime == b.patient.prezime
                    ? 0
                    : +(a.patient.prezime < b.patient.prezime) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                results.sort(function (a, b) {
                  return a.patient.jmbg == b.patient.jmbg
                    ? 0
                    : +(a.patient.jmbg > b.patient.jmbg) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function (a, b) {
                  return a.patient.jmbg == b.patient.jmbg
                    ? 0
                    : +(a.patient.jmbg < b.patient.jmbg) || -1;
                });
              }
              break;
            default:
              results.sort(function (a, b) {
                return Date.parse(a.updated_at) == Date.parse(b.updated_at)
                  ? 0
                  : +(Date.parse(a.updated_at) < Date.parse(b.updated_at)) ||
                      -1;
              });
              break;
          }

          var noviNiz = [];

          if (req.query.datum === "RADNA LISTA") {
            results.forEach((element) => {
              if (element.status === "ODOBREN" && !element.isPrinted) {
                if (
                  !noviNiz.filter(
                    (rezultat) =>
                      rezultat.sample.pid === element.sample.pid &&
                      JSON.stringify(rezultat.created_at).substring(1, 11) ===
                        JSON.stringify(element.created_at).substring(1, 11)
                  ).length > 0
                ) {
                  noviNiz.push(element);
                }
              }
            });
          } else {
            results.forEach((element) => {
              if (element.status === "ODOBREN") {
                if (
                  !noviNiz.filter(
                    (rezultat) =>
                      rezultat.sample.pid === element.sample.pid &&
                      JSON.stringify(rezultat.created_at).substring(1, 11) ===
                        JSON.stringify(element.created_at).substring(1, 11)
                  ).length > 0
                ) {
                  noviNiz.push(element);
                }
              }
            });
          }

          var json = {};
          json.total = noviNiz.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "nalazi/list?sort=" +
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
            "nalazi/list?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];
          noviNiz = noviNiz.slice(json.from - 1, json.to);

          noviNiz.forEach((uzorak) => {
            var temp = new Date(uzorak.created_at);
            var datum =
              temp.getDate() +
              "-" +
              (temp.getMonth() + 1) +
              "-" +
              temp.getFullYear();

            var nalaz =
              "<button id='" +
              uzorak.patient._id +
              "' class='btn btn-primary btn-micro'><span id='" +
              uzorak.patient._id +
              "' class='glyphicon glyphicon-search'></span> NALAZ</button>";
            var akcija = "<strong>ODOBRENO</strong>";
            json.data.push({
              nalazi: nalaz,
              pacijent: uzorak.sample.pid,
              ime: uzorak.patient.ime,
              prezime: uzorak.patient.prezime,
              jmbg: uzorak.patient.jmbg,
              izmjena: akcija,
              // datum: datum
              datum:
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
                ).slice(1, 5),
            });
          });
          res.json(json);
        }
      });
  }
};

nalazController.Pregled = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Results.find({
      patient: mongoose.Types.ObjectId(req.params.id),
      status: "ODOBREN",
      site: req.query.site,
    })
      .populate(
        "patient rezultati.labassay rezultati.rezultat.anaassay sample patient.lokacija sample.lokacija"
      )
      .exec(function (err, results) {
        if (results.length) {
          results.sort(function (a, b) {
            return Date.parse(a.updated_at) == Date.parse(b.updated_at)
              ? 0
              : +(Date.parse(a.updated_at) < Date.parse(b.updated_at)) || -1;
          });
          res.json(results);
        } else {
          res.json(
            (success = true),
            (message = "Nema pronadjenih rezultata"),
            (results = [])
          );
        }
      });
  }
};

nalazController.Nalaz = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var napomena = req.body.napomena;
    var siteID = req.body.site;
    var specificni = [];
    var refSpecificni = "";
    // console.log(req.body);

    var uslov = {};

    if (req.body.timestamp != "MIGRATED") {
      uslov = {
        timestamp: req.body.timestamp,
        site: mongoose.Types.ObjectId(req.body.site),
      };
    } else {
      uslov = {
        site: mongoose.Types.ObjectId(req.body.site),
      };
    }

    Results.find(uslov)
      .populate(
        "patient rezultati.labassay rezultati.rezultat.anaassay sample patient.lokacija site posiljaoc narucioc"
      )
      .exec(function (err, results) {
        if (results.length) {
          var uzorci = [];
          var rezultati = [];
          var test = {};
          var temp = [];
          var novirezultati = [];
          var legenda = [];
          var checkIskljucen;
          var i = 0;
          var j = 0;
          var lokacija = "";
          var site_data = results[0].site;

          var COV2Ag = false;
					var uzorakBris = ""

          results.forEach((element) => {
            req.body.samples.forEach((sample) => {
              if (mongoose.Types.ObjectId(sample).equals(element._id)) {
                uzorci.push({
                  id: element.sample.id,
                  komentar: element.sample.komentar,
                });
                lokacija = element.sample.lokacija;
                var OGTT = false;
                var Insulin = false;
                var specifProlaktin = false;
                var specifGluk = false;
                var specifKortizol = false;
                element.rezultati.forEach((r) => {
                  // OGTT (Test opterećenja glukozom)

                  if (r.interp == "ogtt") {
                    OGTT = true;
                  }

                  // console.log(r.labassay._id)

                  if (JSON.stringify(r.labassay._id) === '"600d45a2391b8e1ede1271fd"') {
                    // COV2 Ag
										COV2Ag = true;
										uzorakBris = element.id
                    console.log(uzorakBris)
                  }

                  // Inzulinemija

                  if (r.interp == "insul") {
                    Insulin = true;
                  }

                  // if (r.labassay.naziv.includes('Prolaktin P')) {
                  // 	specifProlaktin = true;
                  // }

                  // if (r.labassay.naziv.includes('Gluk-')) {
                  // 	specifGluk = true;
                  // }

                  // if (r.labassay.naziv.includes('Kortizol-')) {
                  // 	specifKortizol = true;
                  // }
                });

                // OGTT (Test opterećenja glukozom)

                if (OGTT) {
                  element.rezultati = element.rezultati.filter(function (item) {
                    return item.labassay._id != "5f0b730ac0cfe63397f4aa10"; // Glukoza
                  });
                }

                // Inzulinemija

                if (Insulin) {
                  element.rezultati = element.rezultati.filter(function (item) {
                    return item.labassay._id != "5f40e80b90fa666d29c02e51"; // Inzulin
                  });
                }

                // if (specifProlaktin) {
                // 	element.rezultati = element.rezultati.filter(function(item) {
                // 		return item.labassay.naziv !== 'Prolaktin';
                // 	});
                // }

                // if (specifGluk) {
                // 	element.rezultati = element.rezultati.filter(function(item) {
                // 		return item.labassay.naziv !== 'Gluk';
                // 	});
                // }

                // if (specifKortizol) {
                // 	element.rezultati = element.rezultati.filter(function(item) {
                // 		return item.labassay.naziv !== 'Kortizol';
                // 	});
                // }

                rezultati.push(element);

                var ana = [];
                i = 0;

                element.rezultati.forEach((rezultat) => {
                  checkIskljucen = iskljucen.test(
                    rezultat.labassay.naziv,
                    req.body.site
                  );
                  if (
                    rezultat.rezultat[0] != undefined &&
                    rezultat.rezultat[0].dilucija === "MULTI" &&
                    checkIskljucen
                  ) {
                    element.multi.forEach((multi) => {
                      multi.forEach((mm) => {
                        if (
                          rezultat.labassay._id.equals(
                            mongoose.Types.ObjectId(mm.labtest)
                          )
                        )
                          if (
                            mm.rezultat[0].rezultat_f != "" &&
                            !mm.rezultat[0].rezultat_f.includes("--") &&
                            iskljucen.test(
                              mm.rezultat[0].dilucija,
                              req.body.site
                            )
                          ) {
                            // checkIskljucen = iskljucen.test(mm.rezultat[0].dilucija, req.body.site)
                            // Preskoci analite koji nemaju rezultat
                            // mm.rezultat[0].dilucija != 'PDWs' && mm.rezultat[0].dilucija != 'P-LCC' && mm.rezultat[0].dilucija !='P-LCR' &&
                            // mm.rezultat[0].dilucija != 'RDWs' ) {

                            test.izbor = rezultat.labassay.analit;
                            test.naziv = mm.rezultat[0].dilucija;
                            test.jedinica = mm.rezultat[0].jedinice_f;

                            /* if (rezultat.labassay.naziv.includes("KKS")) {
                              if (!isNaN(mm.rezultat[0].rezultat_f)) {
                                if (mm.rezultat[0].rezultat_f.includes(".")) {
                                  test.rezultat = parseFloat(
                                    mm.rezultat[0].rezultat_f
                                  ).toFixed(2);
                                } else {
                                  test.rezultat = mm.rezultat[0].rezultat_f;
                                }
                              } else {
                                test.rezultat = mm.rezultat[0].rezultat_f;
                              }
                            } else {
                              test.rezultat = mm.rezultat[0].rezultat_f;
                            } */

                            test.rezultat = mm.rezultat[0].rezultat_f;

                            test.refd = mm.refd;
                            test.refg = mm.refg;
                            test.interp = mm.interp;
                            test.extend = mm.extend;
                            test.refGrupa = mm.grupa;

                            if (test.rezultat === null) {
                              test.rezultat = "";
                            }

                            temp.push(
                              interpretacija.Interpretation(
                                test.naziv,
                                test.rezultat,
                                test.jedinica,
                                test.refd,
                                test.refg,
                                siteID,
                                test.interp,
                                test.extend
                              )[0]
                            );
                            temp.push({
                              rezultat: interpretacija.Interpretation(
                                test.naziv,
                                test.rezultat,
                                test.jedinica,
                                test.refd,
                                test.refg,
                                siteID,
                                test.interp,
                                test.extend
                              )[1],
                              kontrola: interpretacija.Interpretation(
                                test.naziv,
                                test.rezultat,
                                test.jedinica,
                                test.refd,
                                test.refg,
                                siteID,
                                test.interp,
                                test.extend
                              )[5],
                            });
                            // temp.push(
                            //   interpretacija.Interpretation(test.naziv, test.rezultat, test.jedinica, test.refd, test.refg, siteID, test.interp, test.extend)[5]
                            // );
                            temp.push(
                              interpretacija.Interpretation(
                                test.naziv,
                                test.rezultat,
                                test.jedinica,
                                test.refd,
                                test.refg,
                                siteID,
                                test.interp,
                                test.extend
                              )[3]
                            );
                            temp.push({
                              reference: interpretacija.Interpretation(
                                test.naziv,
                                test.rezultat,
                                test.jedinica,
                                test.refd,
                                test.refg,
                                siteID,
                                test.interp,
                                test.extend
                              )[4],
                              extend: interpretacija.Interpretation(
                                test.naziv,
                                test.rezultat,
                                test.jedinica,
                                test.refd,
                                test.refg,
                                siteID,
                                test.interp,
                                test.extend
                              )[6],
                            });

                            ana.push(temp);

                            temp = [];
                            test = {};
                          }
                      });

                      if (ana.length) {
                        if (!element.site.postavke.nalazLegenda) {
                          novirezultati.push({
                            sekcija: rezultat.labassay.sekcija,
                            grupa: rezultat.labassay.grupa,
                            order: rezultat.labassay.grouporder,
                            multi: rezultat.labassay.naziv,
                            test: rezultat.labassay.analit,
                            rezultat: ana,
                          });
                        } else {
                          if (
                            !legenda.filter(
                              (tip) => tip === element.id.substring(0, 1)
                            ).length > 0
                          ) {
                            legenda.push(element.id.substring(0, 1));
                          }
                          novirezultati.push({
                            sekcija: rezultat.labassay.sekcija,
                            grupa: rezultat.labassay.grupa,
                            order: rezultat.labassay.grouporder,
                            multi:
                              "[" +
                              element.id.substring(0, 1) +
                              "] " +
                              rezultat.labassay.naziv,
                            test:
                              "[" +
                              element.id.substring(0, 1) +
                              "] " +
                              rezultat.labassay.analit,
                            rezultat: ana,
                          });
                        }
                      }
                      ana = [];
                    });
                  } else {
                    checkIskljucen = iskljucen.test(
                      rezultat.labassay.naziv,
                      req.body.site
                    );
                    if (
                      rezultat.rezultat.length &&
                      checkIskljucen &&
                      rezultat.rezultat[rezultat.rezultat.length - 1]
                        .rezultat_f != "" // &&
                      // !rezultat.rezultat[rezultat.rezultat.length - 1].rezultat_f.includes('-')
                    ) {
                      // Mikrobiologija
                      var mikrobiologija = false;

                      if (
                        rezultat.labassay.test_type === "mikrobiologija" ||
                        rezultat.rezultat[rezultat.rezultat.length - 1]
                          .rezultat_m.length > 0
                      ) {
                        mikrobiologija = true;
                        // console.log(rezultat.labassay.analit)
                      }
                      // End of ...

                      if (element.site.postavke.nalazLegenda) {
                        if (
                          !legenda.filter(
                            (tip) => tip === element.id.substring(0, 1)
                          ).length > 0
                        ) {
                          legenda.push(element.id.substring(0, 1));
                        }
                        test.naziv =
                          "[" +
                          element.id.substring(0, 1) +
                          "] " +
                          rezultat.labassay.analit;

                        // console.log(test.naziv);
                      } else {
                        test.naziv = rezultat.labassay.analit;
                      }

                      test.jedinica =
                        rezultat.rezultat[
                          rezultat.rezultat.length - 1
                        ].jedinice_f;
                      test.rezultat =
                        rezultat.rezultat[
                          rezultat.rezultat.length - 1
                        ].rezultat_f;
                      test.refd = rezultat.refd;
                      test.refg = rezultat.refg;
                      test.interp = rezultat.interp;
                      test.extend = rezultat.extend;
                      test.grupa = rezultat.labassay.grupa;
                      test.refGrupa = rezultat.refGrupa;
                      test.anaassay =
                        rezultat.rezultat[
                          rezultat.rezultat.length - 1
                        ].anaassay;

                      if (test.rezultat === null) {
                        test.rezultat = "";
                      }

                      if (
                        rezultat.rezultat[rezultat.rezultat.length - 1].anaassay
                          .float != "" &&
                        !isNaN(
                          rezultat.rezultat[rezultat.rezultat.length - 1]
                            .anaassay.float
                        ) &&
                        !isNaN(test.rezultat)
                      ) {
                        let float = Number(
                          rezultat.rezultat[rezultat.rezultat.length - 1]
                            .anaassay.float
                        );
                        test.rezultat = parseFloat(test.rezultat).toFixed(
                          float
                        );
                      }

                      var tmptest = test.naziv;
                      if (tmptest.includes("]")) {
                        tmptest = tmptest.split("]")[1].trim();
                      }

                      var interp_spec = test.interp;

                      if (interp_spec === "spec") {
                        // console.log('Test:' + tmptest)
                        // console.log('Interpretacija:' + interp_spec)

                        j++;

                        // console.log(j)

                        refSpecificni = j + '*';

                        // refSpecificni = "*";

                        specificni.push({
                          naziv: tmptest,
                          fussnote: refSpecificni,
                          extend: test.extend,
                          labassay: rezultat.labassay, // _id of LabAssay
                          anaassay: test.anaassay, // AnaAssay Object
                        });
                      } else {
                        refSpecificni = "none";
                      }

                      temp.push(
                        interpretacija.Interpretation(
                          test.naziv,
                          test.rezultat,
                          test.jedinica,
                          test.refd,
                          test.refg,
                          siteID,
                          test.interp,
                          test.extend,
                          refSpecificni
                        )[0]
                      );
                      temp.push({
                        rezultat: interpretacija.Interpretation(
                          test.naziv,
                          test.rezultat,
                          test.jedinica,
                          test.refd,
                          test.refg,
                          siteID,
                          test.interp,
                          test.extend,
                          refSpecificni
                        )[1],
                        kontrola: interpretacija.Interpretation(
                          test.naziv,
                          test.rezultat,
                          test.jedinica,
                          test.refd,
                          test.refg,
                          siteID,
                          test.interp,
                          test.extend,
                          refSpecificni
                        )[5],
                      });
                      // temp.push(
                      //   interpretacija.Interpretation(test.naziv, test.rezultat, test.jedinica, test.refd, test.refg, siteID, test.interp, test.extend, refSpecificni)[5]
                      // );
                      temp.push(
                        interpretacija.Interpretation(
                          test.naziv,
                          test.rezultat,
                          test.jedinica,
                          test.refd,
                          test.refg,
                          siteID,
                          test.interp,
                          test.extend,
                          refSpecificni
                        )[3]
                      );
                      temp.push({
                        reference: interpretacija.Interpretation(
                          test.naziv,
                          test.rezultat,
                          test.jedinica,
                          test.refd,
                          test.refg,
                          siteID,
                          test.interp,
                          test.extend,
                          refSpecificni
                        )[4],
                        extend: interpretacija.Interpretation(
                          test.naziv,
                          test.rezultat,
                          test.jedinica,
                          test.refd,
                          test.refg,
                          siteID,
                          test.interp,
                          test.extend,
                          refSpecificni
                        )[6],
                      });

                      if (!mikrobiologija) {
                        novirezultati.push({
                          sekcija: rezultat.labassay.sekcija,
                          grupa: rezultat.labassay.grupa,
                          order: rezultat.labassay.grouporder,
                          rezultat: temp,
                          mikrobiologija: false,
                          data:
                            rezultat.rezultat[rezultat.rezultat.length - 1]
                              .rezultat_m,
                        });
                      } else {
                        var kontrola = "No Class";
                        if (
                          rezultat.rezultat[rezultat.rezultat.length - 1]
                            .rezultat_m[0].pozitivan
                        ) {
                          kontrola = "Red";
                        } else if (
                          rezultat.rezultat[rezultat.rezultat.length - 1]
                            .rezultat_m[0].negativan
                        ) {
                          kontrola = "Green";
                        }

                        temp[1].kontrola = kontrola;

                        novirezultati.push({
                          sekcija: rezultat.labassay.sekcija,
                          grupa: rezultat.labassay.grupa,
                          order: rezultat.labassay.grouporder,
                          rezultat: temp,
                          mikrobiologija: true,
                          data:
                            rezultat.rezultat[rezultat.rezultat.length - 1]
                              .rezultat_m,
                        });
                      }

                      test = {};
                      temp = [];
                    }
                  }
                  i++;
                });
              }
            });
          });

          uzorci.sort(function (a, b) {
            return a.id.localeCompare(b.id, undefined, {
              numeric: false,
              sensitivity: "base",
            });
          });

          var komentar_za_ispis = "";

          uzorci.forEach((element) => {
            if (element.komentar.length > 1) {
              komentar_za_ispis = komentar_za_ispis + element.komentar + "\n";
            }
          });

          var sekcije = [];
          var tempnizsekcije = [];

          novirezultati.sort(function (a, b) {
            return a.order.localeCompare(b.order, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });

          var zaispis = [];
          var tempniz = [];

          var i = 0;
          novirezultati.forEach((element) => {
            i++;
            if (
              tempniz.filter((e) => e.grupa === element.grupa).length > 0 ||
              !tempniz.length
            ) {
              tempniz.push(element);
              if (i === novirezultati.length) {
                zaispis.push(tempniz);
              }
            } else {
              zaispis.push(tempniz);
              tempniz = [];
              tempniz.push(element);
              if (i === novirezultati.length) {
                zaispis.push(tempniz);
              }
            }
          });

          tempniz = [];
          var sekcijeniz = [];
          i = 0;
          novirezultati.forEach((element) => {
            // console.log(element.mikrobiologija)
            i++;
            if (!element.mikrobiologija) {
              if (
                tempniz.filter((e) => e.sekcija === element.sekcija).length >
                  0 ||
                !tempniz.length
              ) {
                tempniz.push(element);
                if (i === novirezultati.length) {
                  sekcijeniz.push(tempniz);
                }
              } else {
                sekcijeniz.push(tempniz);
                tempniz = [];
                tempniz.push(element);
                if (i === novirezultati.length) {
                  sekcijeniz.push(tempniz);
                }
              }
            } else {
              /* if (element.rezultat[0].includes("[")) {
                console.warn(element.rezultat[0].substring(4));
              } else{
                console.warn(element.rezultat[0]);
              } */

              if (
                tempniz.filter((e) => e.sekcija === element.sekcija).length >
                  0 ||
                !tempniz.length
              ) {
                tempniz.push(element);
                if (i === novirezultati.length) {
                  sekcijeniz.push(tempniz);
                }
              } else {
                sekcijeniz.push(tempniz);
                tempniz = [];
                tempniz.push(element);
                if (i === novirezultati.length) {
                  sekcijeniz.push(tempniz);
                }
              }
            }
          });

          tempniz = [];
          novirezultati = [];

          sekcijeniz.sort(([a], [b]) => a.order.localeCompare(b.order));

          var Data = {};
          var d = new Date(Date.now());
          var mjesec = d.getMonth() + 1;
          if (mjesec < 10) {
            mjesec = "0" + mjesec;
          }
          var dan = d.getUTCDate();
          if (dan < 10) {
            dan = "0" + dan;
          }
          var god = d.getFullYear();

          Data.pid = rezultati[0].sample.pid;

          Data.protokol = "CLG" + rezultati[0].sample.pid + "/" + rezultati[0].sample.id.substr(rezultati[0].sample.id.length - 5);

          Data.uzorkovano = rezultati[0].sample.datum;

          // Data.protokol = rezultati[0].sample.protokol;

          Data.uzorkovano_t = rezultati[0].sample.datum.substring(11, 16);
          // console.log(Data.uzorkovano_t)

          Data.posiljaoc = rezultati[0].posiljaoc;
          Data.narucioc = rezultati[0].narucioc;

          Data.posiljaoc = rezultati[0].posiljaoc;
          Data.narucioc = rezultati[0].narucioc;

          Data.ime = rezultati[0].patient.ime;
          Data.prezime = rezultati[0].patient.prezime;
          Data.roditelj = rezultati[0].patient.roditelj;
          Data.jmbg = rezultati[0].patient.jmbg;
          Data.godiste = Data.jmbg.substring(4, 7);

          switch (Data.godiste[0]) {
            case "9":
              Data.godiste = "1" + Data.godiste;
              break;
            case "0":
              Data.godiste = "2" + Data.godiste;
              break;

            default:
              break;
          }

          Data.spol = rezultati[0].patient.spol;
          Data.duhan = rezultati[0].patient.duhan;
          Data.dijabetes = rezultati[0].patient.dijabetes;
          Data.datum = dan + "." + mjesec + "." + god;
          Data.patient = rezultati[0].patient._id;
          Data.telefon = rezultati[0].patient.telefon;
          var sat = d.getHours();
          if (sat < 10) {
            sat = "0" + sat;
          }

          var min = d.getMinutes();
          if (min < 10) {
            min = "0" + min;
          }

          var sec = d.getSeconds();
          if (sec < 10) {
            sec = "0" + sec;
          }

          Data.vrijeme = sat + ":" + min + ":" + sec;

          if (req.body.idNalaza === "") {
            req.body.idNalaza = "5b37adfa96370c1d403b62d1";
          }

          // Audit_Nalazi

          Nalazi.findOne({
            timestamp: req.body.timestamp,
            location: req.body.location,
            naziv: req.body.naziv,
          }).exec(function (err, nalaz) {
            if (err) {
              console.log("Greška:", err);
            } else {
              if (!nalaz) {
                var obj = {};
                obj.patient = Data.patient;
                obj.komentar = komentar_za_ispis;
                obj.headers = [
                  "Naziv pretrage",
                  "Rezultat",
                  // "Upozorenje",
                  "Jedinica",
                  "Referentni interval",
                ];
                obj.headersa = [
                  "Naziv pretrage",
                  "Rezultat",
                  // "Upozorenje",
                  "Jedinica",
                  "Referentni interval",
                ];
                obj.rows = sekcijeniz;
                obj.site = req.body.site;
                obj.uzorci = req.body.uzorci;
                obj.timestamp = req.body.timestamp;
                obj.location = req.body.location;

                // console.log(req.body.klijent);

                if (req.body.klijent != null) {
                  obj.customer = mongoose.Types.ObjectId(req.body.klijent);
                }

                obj.naziv = req.body.naziv;

                obj.status = req.body.status;
                obj.legenda = legenda;
                obj.specificni = specificni;
                obj.uzorkovano = Data.uzorkovano;
                obj.protokol = Data.protokol;
                obj.pid = Data.pid;

                obj.posiljaoc = Data.posiljaoc;
                obj.narucioc = Data.narucioc;

                // obj.languages = ["BA"]

                obj.created_at = new Date(
                 new Date().getTime() - new Date().getTimezoneOffset() * 60000
                );

                obj.updated_at = new Date(
                  new Date().getTime() - new Date().getTimezoneOffset() * 60000
                );

                obj.created_by = req.body.decoded.user;
                obj.updated_by = req.body.decoded.user;

                var novi = new Nalazi(obj);

                novi.save(function (err, report) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err,
                    });
                  } else {
                    var baseConfig = {};
                    baseConfig.nalaz_path = config.nalaz_path;
                    baseConfig.nalaz_ptsansregular = config.nalaz_ptsansregular;
                    baseConfig.nalaz_ptsansbold = config.nalaz_ptsansbold;
                    baseConfig.nalaz_logo = config.nalaz_logo;
                    baseConfig.nalaz_references = config.nalaz_references;
                    baseConfig.nalaz_footer = config.nalaz_footer;
                    baseConfig.nalaz_signature = config.nalaz_signature;
                    baseConfig.user = req.body.decoded.user;
                    baseConfig.barcode_path  = config.sample_path;
                    baseConfig.QRCodes = config.QRCodes;

                    report_template.create_report(
                      report,
                      baseConfig,
                      Data,
                      legenda,
                      sekcijeniz,
                      komentar_za_ispis,
                      res,
                      specificni,
                      req.body.type,
                      req.body.naziv,
                      lokacija,
                      req.body.site,
                      site_data,
											uzorakBris
                    );
                  }
                });
              } else {
                var obj = {};
                nalaz.patient = Data.patient;
                nalaz.komentar = komentar_za_ispis;
                nalaz.headers = [
                  "Naziv pretrage",
                  "Rezultat",
                  // "Upozorenje",
                  "Jedinica",
                  "Referentni interval",
                ];
                nalaz.headersa = [
                  "Naziv pretrage",
                  "Rezultat",
                  // "Upozorenje",
                  "Jedinica",
                  "Referentni interval",
                ];
                nalaz.rows = sekcijeniz;

                // nalaz.languages = ["BA"]

                // nalaz.created_at = new Date(
                // 	new Date().getTime() - new Date().getTimezoneOffset() * 60000
                // );

                nalaz.updated_at = new Date(
                  new Date().getTime() - new Date().getTimezoneOffset() * 60000
                );

                // nalaz.created_by = req.body.decoded.user;
                nalaz.updated_by = req.body.decoded.user;

                nalaz.specificni = specificni;
                nalaz.uzorkovano = Data.uzorkovano;
                nalaz.posiljaoc = Data.posiljaoc;
                nalaz.narucioc = Data.narucioc;
                nalaz.protokol = Data.protokol;
                nalaz.save(function (err, report) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err,
                    });
                  } else {
                    var baseConfig = {};
                    baseConfig.nalaz_path = config.nalaz_path;
                    baseConfig.nalaz_ptsansregular = config.nalaz_ptsansregular;
                    baseConfig.nalaz_ptsansbold = config.nalaz_ptsansbold;
                    baseConfig.nalaz_logo = config.nalaz_logo;
                    baseConfig.nalaz_references = config.nalaz_references;
                    baseConfig.nalaz_footer = config.nalaz_footer;
                    baseConfig.nalaz_signature = config.nalaz_signature;
                    baseConfig.user = req.body.decoded.user;
                    baseConfig.barcode_path  = config.sample_path;
                    baseConfig.QRCodes = config.QRCodes;
                    
                    report_template.create_report(
                      report,
                      baseConfig,
                      Data,
                      legenda,
                      sekcijeniz,
                      komentar_za_ispis,
                      res,
                      specificni,
                      req.body.type,
                      req.body.naziv,
                      lokacija,
                      req.body.site,
                      site_data,
											uzorakBris
                    );
                  }
                });
              }
            }
          });
        } else {
          res.json({
            success: true,
            message: "Nema pronađenih rezultata",
          });
        }
      });
  }
};

nalazController.odobriNalaz = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Nalazi.findOne({
      _id: mongoose.Types.ObjectId(req.body.idNalaza),
    }).exec(function (err, nalaz) {
      if (err) {
        res.json({
          success: false,
          message: "Nalaz succesfully saved NOT",
        });
      } else {
        if (!nalaz) {
          res.json({
            success: false,
            message: "Nalaz succesfully saved NOT",
          });
        } else {
          // console.log("nalaz");
          Lokacija.findOne({
            _id: mongoose.Types.ObjectId(req.body.lokacija),
          }).exec(function (err, lokacija) {
            if (err) {
            } else {
              var counter = 0;

              req.body.rezultati.forEach((rez) => {
                Results.findOne({
                  id: rez,
                }).exec(function (err, rezultat) {
                  if (err) {
                  } else {
                    rezultat.isPrinted = true;
                    rezultat.save();
                    counter++;
                    if (counter === req.body.rezultati.length) {
                      // console.log(req.body.status);
                      nalaz.status = req.body.status;
                      nalaz.save();
                      res.json({
                        success: true,
                        message: "Nalaz succesfully saved",
                        lokacija: lokacija,
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
  }
};

nalazController.obrisiNalaz = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Nalazi.findOne({
      _id: mongoose.Types.ObjectId(req.body.idNalaza),
    }).exec(function (err, nalaz) {
      if (err) {
        res.json({
          success: false,
          message: "Nalaz succesfully deleted NOT",
        });
      } else {
        if (!nalaz) {
          res.json({
            success: false,
            message: "Nalaz succesfully deleted NOT",
          });
        } else {
          nalaz.remove();
          fs.unlink(
            config.nalaz_path + req.body.idNalaza + ".pdf",
            function (err) {
              if (err) {
                // console.error(err.toString());
              } else {
                if (req.body.flag) {
                  var file = config.logs_path + "nalazDelete.txt";
                  var data = {};
                  data.user = req.body.email;

                  d = new Date(Date.now());
                  var mjesec = d.getMonth() + 1;
                  if (mjesec < 10) {
                    mjesec = "0" + mjesec;
                  }
                  var dan = d.getUTCDate();
                  if (dan < 10) {
                    dan = "0" + dan;
                  }
                  var god = d.getFullYear();
                  var datum = god + "/" + mjesec + "/" + dan;
                  var vrijeme =
                    d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                  data.vrijeme = datum + "T" + vrijeme;
                  data.sample = req.body.idNalaza;
                  data.result = nalaz;
                  var text = JSON.stringify(data);
                  fs.appendFile(file, text, function (err) {});
                }
                /* console.warn(
                config.nalaz_path + req.body.idNalaza + ".pdf" + " obrisan"
              ); */
              }
            }
          );
          res.json({
            success: true,
            message: "Nalaz succesfully deleted",
          });
        }
      }
    });
  }
};

nalazController.pregledNalaz = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Nalazi.findOne({
      naziv: req.params.id,
    })
      .populate("patient")
      .exec(function (err, nalaz) {
        if (err) {
          res.json({
            success: false,
            message: "Greška prilikom pronalaženja nalaza.",
          });
        } else {
          if (!nalaz) {
            res.json({
              success: false,
              message: "Nalaz nije pronađen.",
            });
          } else {
            res.json({
              success: true,
              message: "Nalaz pronađen.",
              nalaz: nalaz,
            });
          }
        }
      });
  }
};

nalazController.obrisiOutbox = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Outbox.findOne({
      _id: mongoose.Types.ObjectId(req.body.idNalaza),
    }).exec(function (err, nalaz) {
      if (err) {
        res.json({
          success: false,
          message: "Greška!",
        });
      } else {
        if (!nalaz) {
          res.json({
            success: false,
            message: "OUTBOX NOT DELETED",
          });
        } else {
          nalaz.remove();
          res.json({
            success: true,
            message: "OUTBOX DELETED",
          });
        }
      }
    });
  }
};

nalazController.outboxNalaz = function (req, res) {
  var uslov = {};
  if (req.params.id.length > "1553105746532".length) {
    uslov = {
      nalaz: mongoose.Types.ObjectId(req.params.id),
    };
  } else {
    uslov = {
      naziv: req.params.id,
    };
  }
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Outbox.findOne(uslov)
      .populate("patient nalaz")
      .exec(function (err, nalaz) {
        if (err) {
          res.json({
            success: false,
            message: "Greška!",
          });
        } else {
          if (!nalaz) {
            res.json({
              success: false,
              message: "NALAZ NOT FOUND",
            });
          } else {
            res.json({
              success: true,
              message: "NALAZ FOUND",
              nalaz: nalaz,
            });
          }
        }
      });
  }
};

nalazController.checkifComplete = function (req, res) {
  // console.log("check function ");
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var tmpDate = req.body.datum.split("-");
    if (tmpDate[1] < 10) {
      tmpDate[1] = "0" + tmpDate[1];
    }
    if (tmpDate[0] < 10) {
      tmpDate[0] = "0" + tmpDate[0];
    }
    danasnjiDatum = tmpDate[2] + "-" + tmpDate[1] + "-" + tmpDate[0];
    // console.log(req.params);
    var from = new Date();
    var to = new Date();
    to = danasnjiDatum + "T23:59:59Z";
    from = danasnjiDatum + "T00:00:00Z";
    var uslov = {};
    uslov = {
      created_at: {
        $gt: from,
        $lt: to,
      },
      patient: mongoose.Types.ObjectId(req.params.id),
      site: mongoose.Types.ObjectId(req.body.site),
    };

    Results.find(uslov)
      .populate("patient sample")
      .exec(function (err, rezultati) {
        if (err) {
          res.json({
            success: false,
            message: "Greška!",
          });
        } else {
          if (rezultati.length) {
            var temp = [];

            rezultati.forEach((rezultat) => {
              if (rezultat.sample.pid === req.params.pid) {
                temp.push(rezultat);
              }
            });
            res.json({
              success: true,
              message: "Rezultati uspješno pronadjeni",
              rezultati: temp,
            });
          } else {
            res.json({
              success: true,
              message: "Nema rezultata za pacijenta",
            });
          }
        }
      });
  }
};

module.exports = nalazController;
