const path = require("path");
const config = require("../config/index");

var mongoose = require("mongoose");
var fs = require("fs");
const { forEach } = require("../models/User");

var Samples = mongoose.model("Samples");
var Racuni = mongoose.model("Racuni");

PDFDocument = require("pdfkit");

var racuniController = {};

// RacuniController.js

class PDFDocumentWithTables extends PDFDocument {
  constructor(options) {
    super(options);
  }

  table(table, arg0, arg1, arg2) {
    let startX = this.page.margins.left,
      startY = this.y;
    let options = {};

    if (typeof arg0 === "number" && typeof arg1 === "number") {
      startX = arg0;
      startY = arg1;

      if (typeof arg2 === "object") options = arg2;
    } else if (typeof arg0 === "object") {
      options = arg0;
    }

    const columnCount = table.headers.length;
    const columnSpacing = options.columnSpacing || 2;
    const rowSpacing = options.rowSpacing || 2;
    const usableWidth =
      options.width ||
      this.page.width - this.page.margins.left - this.page.margins.right;
    const prepareHeader = options.prepareHeader || (() => {});
    const prepareRow = options.prepareRow || (() => {});
    const computeRowHeight = (row) => {
      let result = 0;

      row.forEach((cell) => {
        const cellHeight = this.heightOfString(cell, {
          width: columnWidth,
          align: "left",
        });
        result = Math.max(result, cellHeight);
      });
      return result + rowSpacing;
    };

    const columnContainerWidth = usableWidth / columnCount;
    const columnWidth = columnContainerWidth - columnSpacing;
    const maxY = this.page.height - this.page.margins.bottom;
    let rowBottomY = 0;

    this.on("pageAdded", () => {
      startY = this.page.margins.top + 20;
      rowBottomY = 0;
    });
    // Allow the user to override style for headers
    prepareHeader();
    // Check to have enough room for header and first rows
    if (startY + 3 * computeRowHeight(table.headers) > maxY) this.addPage();
    // Print all headers
    table.headers.forEach((header, i) => {
      if (i === 0) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth + 40,
          align: "left",
        });
      }
      if (i === 1) {
        this.text(header, startX + 40 + i * columnContainerWidth, startY, {
          width: columnWidth - 40,
          align: "center",
        });
      }
    });
    // Refresh the y coordinate of the bottom of the headers row
    rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);
    // Separation line between headers and rows
    this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
      .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
      .lineWidth(2)
      .stroke();

    table.rows.forEach((row, i) => {
      const rowHeight = 15; // computeRowHeight(row)
      // Switch to next page if we cannot go any further because the space is ove
      // For safety, consider 3 rows margin instead of just one
      if (startY + 3 * rowHeight < maxY) {
        startY = rowBottomY + rowSpacing;
      } else {
        this.addPage();
      }
      // Allow the user to override style for rows
      prepareRow(row, i);
      // Print all cells of the current row
      var tempcell0 = "";
      var tempcell1 = "";

      row.forEach((cell, i) => {
        if (i === 0) {
          tempcell0 = cell;
          this.text(cell, startX + i * columnContainerWidth, startY, {
            width: columnWidth + 40,
            align: "left",
          });
        }
        if (i === 1) {
          tempcell1 = cell;
          this.text(cell, startX + 40 + i * columnContainerWidth, startY, {
            width: columnWidth - 40,
            align: "center",
          });
        }
      });
      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);
      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(1)
        .opacity(0.7)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });
    this.x = startX;
    this.moveDown();
    return this;
  }
}

// PREDRAČUN, Medicinsko-biohemijski laboratorij "Central Lab" Gradačac
// 12.06.2022. godine

racuniController.Get = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    // console.log("req.body");
    req.body.samples = req.body.uzorci.split(",");
    Samples.find({
      site: req.body.site,
      patient: req.body.patient,
    })
      .populate("patient site tests.labassay posiljaoc")
      .exec(function (err, samples) {
        if (samples.length) {
          var testovi = [];

          var nodiscount = 0;
          var total = 0;

          var OGTT = false;
          var Insulin = false;
          var posiljaoc = null;
          var Posiljaoc = null;

          var timestamp = "";

          var init_nodiscount = null;
          var init_discount = null;
          var init_total = null;
          var sampled_at = null;
          var PID = null;

          samples.forEach((element) => {
            req.body.samples.forEach((sample) => {
              if (sample === element.id) {
                timestamp = element.timestamp;
                sampled_at = element.created_at;
                PID = element.pid;

                if (
                  element.nodiscount == null ||
                  element.discount == null ||
                  element.total == null
                ) {
                  init_nodiscount = 0;
                  init_discount = 0;
                  init_total = 0;
                } else {
                  init_nodiscount = parseFloat(
                    Number(element.nodiscount).toFixed(2)
                  );
                  init_discount = parseFloat(
                    Number(element.discount).toFixed(2)
                  );
                  init_total = parseFloat(Number(element.total).toFixed(2));
                }

                if (element.posiljaoc != null) {
                  posiljaoc = element.posiljaoc.opis; // Pošiljaoc
                  Posiljaoc = element.posiljaoc._id;
                }

                element.tests.forEach((test) => {
                  if (test.labassay.naziv.includes("OGTT -")) {
                    // Not allowed
                    OGTT = true;
                  }

                  if (test.labassay.naziv.includes("INS -")) {
                    // Not allowed
                    Insulin = true;
                  }

                  testovi.push({
                    labassay: test.labassay,
                    sekcija: test.labassay.sekcija,
                    grupa: test.labassay.grupa,
                    order: test.labassay.grouporder,
                    test: test.labassay.analit,
                    cijena: parseFloat(Number(test.cijena).toFixed(2)),
                    CIJENA: parseFloat(Number(test.labassay.price).toFixed(2)),
                  });
                });
              }
            });
          });

          // Izbacivanje, OGTT

          if (OGTT) {
            testovi = testovi.filter(function (item) {
              return item.labassay._id != "5f0b730ac0cfe63397f4aa10"; // Glukoza
            });
          }

          // Izbacivanje, INZULINEMIJA

          if (Insulin) {
            testovi = testovi.filter(function (item) {
              return item.labassay._id != "5f40e80b90fa666d29c02e51"; // Inzulin
            });
          }

          // Sort

          testovi.sort(function (a, b) {
            return a.order.localeCompare(b.order, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });

          testovi.forEach((element) => {
            // Ukupna cijena po trenutno važećem cjenovniku, bez popusta
            nodiscount += parseFloat(Number(element.cijena).toFixed(2));
          });

          // Get

          total = parseFloat(
            (nodiscount * ((100 - init_discount) / 100)).toFixed(2)
          );

          var res_nodiscount = nodiscount;
          var res_discount = init_discount;
          var res_total = total;

          // Izdavanje računa:

          var date = new Date(Date.now());

          var mjesec = date.getMonth() + 1;

          if (mjesec < 10) {
            mjesec = "0" + mjesec;
          }

          var dan = date.getUTCDate();

          if (dan < 10) {
            dan = "0" + dan;
          }

          var godina = date.getFullYear();

          var datum = dan + "." + mjesec + "." + godina;

          var sat = date.getHours();

          if (sat < 10) {
            sat = "0" + sat;
          }

          var min = date.getMinutes();

          if (min < 10) {
            min = "0" + min;
          }

          var sec = date.getSeconds();

          if (sec < 10) {
            sec = "0" + sec;
          }

          var vrijeme = sat + ":" + min + ":" + sec;

          // Patient data

          var ime = samples[0].patient.ime;

          if(samples[0].patient.roditelj.trim() != ""){
            var prezime = samples[0].patient.prezime + " (" + samples[0].patient.roditelj + ")"
          }else{
            var prezime = samples[0].patient.prezime;
          }
          
          var jmbg = samples[0].patient.jmbg;
          var telefon = samples[0].patient.telefon;
          var spol =
            samples[0].patient.spol[0].toUpperCase() +
            samples[0].patient.spol.slice(1).toLowerCase();

          var godiste = jmbg.substring(4, 7);

          switch (godiste[0]) {
            case "9":
              godiste = "1" + godiste;
              break;

            case "0":
              godiste = "2" + godiste;
              break;

            default:
              break;
          }

          var rowsno = "Predračun";

          const doc = new PDFDocumentWithTables({
            bufferPages: true,
            margins: { top: 80, bottom: 50, left: 50, right: 50 },
          });

          doc.pipe(
            fs
              .createWriteStream(config.racuni_path + timestamp + ".pdf")
              .on("finish", function () {
                var counter = 0;

                samples.forEach((element) => {
                  req.body.samples.forEach((sample) => {
                    if (sample === element.id) {
                      timestamp = element.timestamp;
                      sampled_at = element.created_at;
                      PID = element.pid;

                      element.nodiscount = res_nodiscount.toString();
                      element.discount = res_discount.toString();
                      element.total = res_total.toString();

                      element.save(function (err) {
                        if (err) {
                          console.log("Greška:", err);
                          res.json({
                            success: false,
                            message: err,
                          });
                        } else {
                          counter++;
                          if (counter === req.body.samples.length) {
                            Racuni.findOne({
                              site: mongoose.Types.ObjectId(req.body.site),
                              timestamp: timestamp,
                            }).exec(function (err, racun) {
                              if (err) {
                                console.log("Greška:", err);
                                res.json({
                                  success: false,
                                  message: err,
                                });
                              } else {
                                if (racun) {
                                  res.json({
                                    success: true,
                                    message: "Račun uspješno kreiran",
                                    link: timestamp + ".pdf",

                                    nodiscount: parseFloat(
                                      Number(res_nodiscount).toFixed(2)
                                    ),
                                    discount: parseFloat(
                                      Number(res_discount).toFixed(2)
                                    ),
                                    total: parseFloat(
                                      Number(res_total).toFixed(2)
                                    ),
                                  });
                                } else {
                                  var invoice = {};

                                  invoice.nodiscount =
                                    res_nodiscount.toString();
                                  invoice.discount = res_discount.toString();
                                  invoice.total = res_total.toString();
                                  invoice.assays = testovi;
                                  invoice.samples = req.body.samples;
                                  invoice.timestamp = timestamp;
                                  invoice.valid = true;
                                  invoice.site = req.body.site;
                                  invoice.patient = req.body.patient;
                                  invoice.posiljaoc = Posiljaoc;
                                  invoice.narucioc = null;
                                  invoice.created_at = new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  );
                                  invoice.updated_at = null;
                                  invoice.created_by = req.body.decoded.user;
                                  invoice.sampled_at = sampled_at;
                                  invoice.pid = PID;
                                  invoice.updated_by = req.body.decoded.user;

                                  var Invoice = new Racuni(invoice);

                                  Invoice.save(function (err) {
                                    if (err) {
                                      console.log("Greška:", err);
                                      res.json({
                                        success: false,
                                        message: err,
                                      });
                                    } else {
                                      res.json({
                                        success: true,
                                        message: "Račun uspješno kreiran",
                                        link: timestamp + ".pdf",

                                        nodiscount: parseFloat(
                                          Number(res_nodiscount).toFixed(2)
                                        ),
                                        discount: parseFloat(
                                          Number(res_discount).toFixed(2)
                                        ),
                                        total: parseFloat(
                                          Number(res_total).toFixed(2)
                                        ),
                                      });
                                    }
                                  });
                                }
                              }
                            });
                          }
                        }
                      });
                    }
                  });
                });
              })
          );
          doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
          doc.registerFont("PTSansBold", config.nalaz_ptsansbold);

          var code = samples[0].site.sifra;

          doc.image(config.nalaz_logo + code + ".jpg", 50, 13 - 9, {
            width: 280,
            keepAspectRatio: true,
          });

          switch (code) {
            case "B": // CENTRAL LAB Gradačac
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Ul. Josipa Šibera 3, 76250 Gradačac, BiH", 345, 20 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Tel: +387 35 81 63 17", 345, 32.5 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Mob: +387 62 73 73 03 i +387 61 23 47 05", 345, 45 - 3 - 12.5)
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("E-mail: clgradacac@gmail.com i", 345, 57.5 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("            biohemija@bih.net.ba", 341 + 5, 70 - 3 - 12.5)
            
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Facebook: facebook.com/CentralLabGradacac", 345, 70 - 3); 

            break;

            default:
              break;
          }

          doc
            .fontSize(9)
            .fillColor("#7B8186")
            .moveTo(0, 90)
            .lineTo(650, 90)
            .lineWidth(0.7)
            .opacity(0.5)
            .fillAndStroke("#7B8186", "#7B8186")
            .opacity(1);

          if (posiljaoc != null) {
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("Za: " + posiljaoc, 390, 95);
          }

          // Prilagođavanje visine .PDF

          var nvisina = 100;
          var datRodjenja =
            jmbg.substring(0, 2) + "." + jmbg.substring(2, 4) + ".";

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .fillColor("black")
            .text("Prezime i ime: ", 50, nvisina);
          doc
            .font("PTSansBold")
            .fontSize(14)
            .text(
              " " + prezime.toUpperCase() + " " + ime.toUpperCase(),
              142 - 17,
              nvisina - 2
            );

          if (datRodjenja.includes("01.01") && godiste == "1920") {
            var pacijent = prezime.toUpperCase() + " " + ime.toUpperCase();
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Datum rođenja:", 50, nvisina + 16)
              .text("Nema podataka", 150 - 17, nvisina + 16);
          } else if (!datRodjenja.includes("00.00")) {
            var pacijent =
              prezime.toUpperCase() +
              " " +
              ime.toUpperCase() // +
              // " (" +
              // godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Datum rođenja:", 50, nvisina + 16)
              .text(datRodjenja + godiste + ".", 150 - 17, nvisina + 16);
          } else {
            var pacijent =
              prezime.toUpperCase() +
              " " +
              ime.toUpperCase() // +
              // " (" +
              // godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Godište:", 50, nvisina + 16)
              .text(godiste + ".", 150 - 56, nvisina + 16);
          }

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("Spol:", 50, nvisina + 32)
            .text(
              spol[0].toUpperCase() + spol.slice(1).toLowerCase(),
              96 - 17,
              nvisina + 32
            );

          if (
            telefon === "NEPOZNATO" ||
            telefon === "Nema podataka" ||
            telefon.trim() === "" ||
            telefon.length < 9
          ) {
            telefon = "";
            // nvisina = nvisina - 12;
          } else {
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Kontakt:", 50, nvisina + 48)
              .text(telefon, 150 - 54, nvisina + 48);
          }

          doc
            .font("PTSansRegular")
            .fontSize(10)
            .text("Izdavanje računa:", 390, nvisina + 3 + 15 + 3)
            .font("PTSansBold")
            .text(
              datum + " " + vrijeme.substring(0, 5),
              468,
              nvisina + 3 + 15 + 3
            );

          doc
            .font("PTSansBold")
            .fontSize(12)
            .text(rowsno, 50, nvisina + 70);
          doc.moveDown(0.6);

          var niz = [];
          var headers = ["Naziv laboratorijske pretrage", "Iznos"];
          var rows = [];

          testovi.forEach((element) => {
            niz = [];
            niz.push(element.test);
            niz.push(element.cijena);
            rows.push(niz);
          });

          doc.table(
            {
              headers: headers,
              rows: rows,
            },
            {
              prepareHeader: () => doc.fontSize(8),
              prepareRow: (row, i) => doc.fontSize(10),
            }
          );

          if (parseFloat(Number(res_discount).toFixed(2)) != 0) {
            // Sa popustom

            doc
              .font("PTSansRegular")
              .text("Ukupno: " + res_nodiscount.toString() + " BAM", 425)
              .text(
                "Popust: " +
                  parseFloat(Number(res_discount).toFixed(2)).toString() +
                  " %",
                425
              )
              .moveDown(0.5);

            doc
              .font("PTSansBold")
              .text("Za platiti: " + res_total.toString() + " BAM", {
                underline: true,
              });
          } else {
            // Bez popusta

            doc
              .font("PTSansBold")
              .text("", 425)
              .text("Ukupno: " + res_nodiscount.toString() + " BAM", {
                underline: true,
              });
          }

          const range = doc.bufferedPageRange();

          for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("", 50, 740, { lineBreak: false });
            doc
              .fontSize(9)
              .fillColor("#7B8186")
              .moveTo(0, 756)
              .lineTo(650, 756)
              .lineWidth(0.7)
              .opacity(0.5)
              .fillAndStroke("#7B8186", "#7B8186")
              .opacity(1);

            doc
              .font("PTSansRegular")
              .fontSize(9)
              .fillColor("black")
              .text("Pacijent: " + pacijent, 50, 760, { lineBreak: false });
            doc
              .font("PTSansBold")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("ATOM Laboratory Software", 470, 760, { lineBreak: false });
            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("by", 470, 770, { lineBreak: false });
            doc
              .font("PTSansBold")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("iLab d.o.o. Sarajevo", 480, 770, { lineBreak: false });

            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("black")
              .text(
                `Stranica ${i + 1} od ${range.count}`,
                doc.page.width / 2 - 25,
                doc.page.height - 18,
                { lineBreak: false }
              );
          }
          doc.end();
        } else {
          res.json({
            success: true,
            message: "Nema pronađenih rezultata.",
          });
        }
      });
  }
};

racuniController.Popust = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    // console.log("req.body");
    req.body.samples = req.body.uzorci.split(",");
    Samples.find({
      site: req.body.site,
      patient: req.body.patient,
    })
      .populate("patient site tests.labassay posiljaoc")
      .exec(function (err, samples) {
        if (samples.length) {
          var testovi = [];

          var nodiscount = 0;
          var total = 0;

          var OGTT = false;
          var Insulin = false;
          var posiljaoc = null;
          var Posiljaoc = null;

          var init_nodiscount = null;
          var init_discount = null;
          var init_total = null;
          var sampled_at = null;
          var PID = null;

          samples.forEach((element) => {
            req.body.samples.forEach((sample) => {
              if (sample === element.id) {
                timestamp = element.timestamp;
                sampled_at = element.created_at;
                PID = element.pid;

                if (
                  element.nodiscount == null ||
                  element.discount == null ||
                  element.total == null
                ) {
                  init_nodiscount = 0;
                  init_discount = 0;
                  init_total = 0;
                } else {
                  init_nodiscount = parseFloat(
                    Number(element.nodiscount).toFixed(2)
                  );
                  init_discount = parseFloat(
                    Number(element.discount).toFixed(2)
                  );
                  init_total = parseFloat(Number(element.total).toFixed(2));
                }

                if (element.posiljaoc != null) {
                  posiljaoc = element.posiljaoc.opis; // Pošiljaoc
                  Posiljaoc = element.posiljaoc._id;
                }

                element.tests.forEach((test) => {
                  if (test.labassay.naziv.includes("OGTT -")) {
                    // Not allowed
                    OGTT = true;
                  }

                  if (test.labassay.naziv.includes("INS -")) {
                    // Not allowed
                    Insulin = true;
                  }

                  testovi.push({
                    labassay: test.labassay,
                    sekcija: test.labassay.sekcija,
                    grupa: test.labassay.grupa,
                    order: test.labassay.grouporder,
                    test: test.labassay.analit,
                    cijena: parseFloat(Number(test.cijena).toFixed(2)),
                    CIJENA: parseFloat(Number(test.labassay.price).toFixed(2)),
                  });
                });
              }
            });
          });

          // Izbacivanje, OGTT

          if (OGTT) {
            testovi = testovi.filter(function (item) {
              return item.labassay._id != "5f0b730ac0cfe63397f4aa10"; // Glukoza
            });
          }

          // Izbacivanje, INZULINEMIJA

          if (Insulin) {
            testovi = testovi.filter(function (item) {
              return item.labassay._id != "5f40e80b90fa666d29c02e51"; // Inzulin
            });
          }

          // Sort

          testovi.sort(function (a, b) {
            return a.order.localeCompare(b.order, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });

          testovi.forEach((element) => {
            // Ukupna cijena po trenutno važećem cjenovniku, bez popusta
            nodiscount += parseFloat(Number(element.cijena).toFixed(2));
          });

          // Popust

          var res_nodiscount = nodiscount;
          var res_discount = req.body.popust;
          var res_total = req.body.total;

          // Izdavanje računa:

          var date = new Date(Date.now());

          var mjesec = date.getMonth() + 1;

          if (mjesec < 10) {
            mjesec = "0" + mjesec;
          }

          var dan = date.getUTCDate();

          if (dan < 10) {
            dan = "0" + dan;
          }

          var godina = date.getFullYear();

          var datum = dan + "." + mjesec + "." + godina;

          var sat = date.getHours();

          if (sat < 10) {
            sat = "0" + sat;
          }

          var min = date.getMinutes();

          if (min < 10) {
            min = "0" + min;
          }

          var sec = date.getSeconds();

          if (sec < 10) {
            sec = "0" + sec;
          }

          var vrijeme = sat + ":" + min + ":" + sec;

          // Patient data

          var ime = samples[0].patient.ime;

          if(samples[0].patient.roditelj.trim() != ""){
            var prezime = samples[0].patient.prezime + " (" + samples[0].patient.roditelj + ")"
          }else{
            var prezime = samples[0].patient.prezime;
          }

          var jmbg = samples[0].patient.jmbg;
          var telefon = samples[0].patient.telefon;
          var spol =
            samples[0].patient.spol[0].toUpperCase() +
            samples[0].patient.spol.slice(1).toLowerCase();

          var godiste = jmbg.substring(4, 7);

          switch (godiste[0]) {
            case "9":
              godiste = "1" + godiste;
              break;

            case "0":
              godiste = "2" + godiste;
              break;

            default:
              break;
          }

          var rowsno = "Predračun";

          const doc = new PDFDocumentWithTables({
            bufferPages: true,
            margins: { top: 80, bottom: 50, left: 50, right: 50 },
          });

          doc.pipe(
            fs
              .createWriteStream(config.racuni_path + timestamp + ".pdf")
              .on("finish", function () {
                var counter = 0;

                samples.forEach((element) => {
                  req.body.samples.forEach((sample) => {
                    if (sample === element.id) {
                      timestamp = element.timestamp;
                      sampled_at = element.created_at;
                      PID = element.pid;

                      element.nodiscount = res_nodiscount.toString();
                      element.discount = res_discount.toString();
                      element.total = res_total.toString();

                      element.save(function (err) {
                        if (err) {
                          console.log("Greška:", err);
                          res.json({
                            success: false,
                            message: err,
                          });
                        } else {
                          counter++;
                          if (counter === req.body.samples.length) {
                            Racuni.findOne({
                              site: mongoose.Types.ObjectId(req.body.site),
                              timestamp: timestamp,
                            }).exec(function (err, racun) {
                              if (err) {
                                console.log("Greška:", err);
                                res.json({
                                  success: false,
                                  message: err,
                                });
                              } else {
                                if (racun) {
                                  racun.nodiscount = res_nodiscount.toString();
                                  racun.discount = res_discount.toString();
                                  racun.total = res_total.toString();
                                  racun.assays = testovi;
                                  racun.samples = req.body.samples;
                                  // timestamp
                                  // sites
                                  // patient
                                  // posiljaoc
                                  // narucioc
                                  // created_at
                                  // sampled_at
                                  // pid
                                  racun.valid = true;
                                  racun.updated_at = new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  );
                                  // created_by
                                  racun.updated_by = req.body.decoded.user;

                                  racun.save(function (err) {
                                    if (err) {
                                      console.log("Greška:", err);
                                      res.json({
                                        success: false,
                                        message: err,
                                      });
                                    } else {
                                      res.json({
                                        success: true,
                                        message: "Račun uspješno kreiran",
                                        link: timestamp + ".pdf",

                                        nodiscount: parseFloat(
                                          Number(res_nodiscount).toFixed(2)
                                        ),
                                        discount: parseFloat(
                                          Number(res_discount).toFixed(2)
                                        ),
                                        total: parseFloat(
                                          Number(res_total).toFixed(2)
                                        ),
                                      });
                                    }
                                  });
                                } else {
                                  var invoice = {};

                                  invoice.nodiscount =
                                    res_nodiscount.toString();
                                  invoice.discount = res_discount.toString();
                                  invoice.total = res_total.toString();
                                  invoice.assays = testovi;
                                  invoice.samples = req.body.samples;
                                  invoice.timestamp = timestamp;
                                  invoice.valid = true;
                                  invoice.site = req.body.site;
                                  invoice.patient = req.body.patient;
                                  invoice.posiljaoc = Posiljaoc;
                                  invoice.narucioc = null;
                                  invoice.created_at = new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  );
                                  invoice.updated_at = null;
                                  invoice.created_by = req.body.decoded.user;
                                  invoice.sampled_at = sampled_at;
                                  invoice.pid = PID;
                                  invoice.updated_by = req.body.decoded.user;

                                  var Invoice = new Racuni(invoice);

                                  Invoice.save(function (err) {
                                    if (err) {
                                      console.log("Greška:", err);
                                      res.json({
                                        success: false,
                                        message: err,
                                      });
                                    } else {
                                      res.json({
                                        success: true,
                                        message: "Račun uspješno kreiran",
                                        link: timestamp + ".pdf",

                                        nodiscount: parseFloat(
                                          Number(res_nodiscount).toFixed(2)
                                        ),
                                        discount: parseFloat(
                                          Number(res_discount).toFixed(2)
                                        ),
                                        total: parseFloat(
                                          Number(res_total).toFixed(2)
                                        ),
                                      });
                                    }
                                  });
                                }
                              }
                            });
                          }
                        }
                      });
                    }
                  });
                });
              })
          );
          doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
          doc.registerFont("PTSansBold", config.nalaz_ptsansbold);

          var code = samples[0].site.sifra;

          doc.image(config.nalaz_logo + code + ".jpg", 50, 13 - 9, {
            width: 280,
            keepAspectRatio: true,
          });

          switch (code) {
            case "B": // CENTRAL LAB Gradačac
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Ul. Josipa Šibera 3, 76250 Gradačac, BiH", 345, 20 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Tel: +387 35 81 63 17", 345, 32.5 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Mob: +387 62 73 73 03 i +387 61 23 47 05", 345, 45 - 3 - 12.5)
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("E-mail: clgradacac@gmail.com i", 345, 57.5 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("            biohemija@bih.net.ba", 341 + 5, 70 - 3 - 12.5)
            
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Facebook: facebook.com/CentralLabGradacac", 345, 70 - 3); 

            break;

            default:
              break;
          }

          doc
            .fontSize(9)
            .fillColor("#7B8186")
            .moveTo(0, 90)
            .lineTo(650, 90)
            .lineWidth(0.7)
            .opacity(0.5)
            .fillAndStroke("#7B8186", "#7B8186")
            .opacity(1);

          if (posiljaoc != null) {
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("Za: " + posiljaoc, 390, 95);
          }

          // Prilagođavanje visine .PDF

          var nvisina = 100;
          var datRodjenja =
            jmbg.substring(0, 2) + "." + jmbg.substring(2, 4) + ".";

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .fillColor("black")
            .text("Prezime i ime: ", 50, nvisina);
          doc
            .font("PTSansBold")
            .fontSize(14)
            .text(
              " " + prezime.toUpperCase() + " " + ime.toUpperCase(),
              142 - 17,
              nvisina - 2
            );

          if (datRodjenja.includes("01.01") && godiste == "1920") {
            var pacijent = prezime.toUpperCase() + " " + ime.toUpperCase();
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Datum rođenja:", 50, nvisina + 16)
              .text("Nema podataka", 150 - 17, nvisina + 16);
          } else if (!datRodjenja.includes("00.00")) {
            var pacijent =
              prezime.toUpperCase() +
              " " +
              ime.toUpperCase() // +
              // " (" +
              // godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Datum rođenja:", 50, nvisina + 16)
              .text(datRodjenja + godiste + ".", 150 - 17, nvisina + 16);
          } else {
            var pacijent =
              prezime.toUpperCase() +
              " " +
              ime.toUpperCase() // +
              // " (" +
              // godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Godište:", 50, nvisina + 16)
              .text(godiste + ".", 150 - 56, nvisina + 16);
          }

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("Spol:", 50, nvisina + 32)
            .text(
              spol[0].toUpperCase() + spol.slice(1).toLowerCase(),
              96 - 17,
              nvisina + 32
            );

          if (
            telefon === "NEPOZNATO" ||
            telefon === "Nema podataka" ||
            telefon.trim() === "" ||
            telefon.length < 9
          ) {
            telefon = "";
            // nvisina = nvisina - 12;
          } else {
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Kontakt:", 50, nvisina + 48)
              .text(telefon, 150 - 54, nvisina + 48);
          }

          doc
            .font("PTSansRegular")
            .fontSize(10)
            .text("Izdavanje računa:", 390, nvisina + 3 + 15 + 3)
            .font("PTSansBold")
            .text(
              datum + " " + vrijeme.substring(0, 5),
              468,
              nvisina + 3 + 15 + 3
            );

          doc
            .font("PTSansBold")
            .fontSize(12)
            .text(rowsno, 50, nvisina + 70);
          doc.moveDown(0.6);

          var niz = [];
          var headers = ["Naziv laboratorijske pretrage", "Iznos"];
          var rows = [];

          testovi.forEach((element) => {
            niz = [];
            niz.push(element.test);
            niz.push(element.cijena);
            rows.push(niz);
          });

          doc.table(
            {
              headers: headers,
              rows: rows,
            },
            {
              prepareHeader: () => doc.fontSize(8),
              prepareRow: (row, i) => doc.fontSize(10),
            }
          );

          if (parseFloat(Number(res_discount).toFixed(2)) != 0) {
            // Sa popustom

            doc
              .font("PTSansRegular")
              .text("Ukupno: " + res_nodiscount.toString() + " BAM", 425)
              .text(
                "Popust: " +
                  parseFloat(Number(res_discount).toFixed(2)).toString() +
                  " %",
                425
              )
              .moveDown(0.5);

            doc
              .font("PTSansBold")
              .text("Za platiti: " + res_total.toString() + " BAM", {
                underline: true,
              });
          } else {
            // Bez popusta

            doc
              .font("PTSansBold")
              .text("", 425)
              .text("Ukupno: " + res_nodiscount.toString() + " BAM", {
                underline: true,
              });
          }

          const range = doc.bufferedPageRange();

          for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("", 50, 740, { lineBreak: false });
            doc
              .fontSize(9)
              .fillColor("#7B8186")
              .moveTo(0, 756)
              .lineTo(650, 756)
              .lineWidth(0.7)
              .opacity(0.5)
              .fillAndStroke("#7B8186", "#7B8186")
              .opacity(1);

            doc
              .font("PTSansRegular")
              .fontSize(9)
              .fillColor("black")
              .text("Pacijent: " + pacijent, 50, 760, { lineBreak: false });
            doc
              .font("PTSansBold")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("ATOM Laboratory Software", 470, 760, { lineBreak: false });
            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("by", 470, 770, { lineBreak: false });
            doc
              .font("PTSansBold")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("iLab d.o.o. Sarajevo", 480, 770, { lineBreak: false });

            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("black")
              .text(
                `Stranica ${i + 1} od ${range.count}`,
                doc.page.width / 2 - 25,
                doc.page.height - 18,
                { lineBreak: false }
              );
          }
          doc.end();
        } else {
          res.json({
            success: true,
            message: "Nema pronađenih rezultata.",
          });
        }
      });
  }
};

racuniController.Cijena = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    // console.log("req.body");
    req.body.samples = req.body.uzorci.split(",");
    Samples.find({
      site: req.body.site,
      patient: req.body.patient,
    })
      .populate("patient site tests.labassay posiljaoc")
      .exec(function (err, samples) {
        if (samples.length) {
          var testovi = [];

          var nodiscount = 0;
          var total = 0;

          var OGTT = false;
          var Insulin = false;
          var posiljaoc = null;
          var Posiljaoc = null;

          var init_nodiscount = null;
          var init_discount = null;
          var init_total = null;
          var sampled_at = null;
          var PID = null;

          samples.forEach((element) => {
            req.body.samples.forEach((sample) => {
              if (sample === element.id) {
                timestamp = element.timestamp;
                sampled_at = element.created_at;
                PID = element.pid;

                if (
                  element.nodiscount == null ||
                  element.discount == null ||
                  element.total == null
                ) {
                  init_nodiscount = 0;
                  init_discount = 0;
                  init_total = 0;
                } else {
                  init_nodiscount = parseFloat(
                    Number(element.nodiscount).toFixed(2)
                  );
                  init_discount = parseFloat(
                    Number(element.discount).toFixed(2)
                  );
                  init_total = parseFloat(Number(element.total).toFixed(2));
                }

                if (element.posiljaoc != null) {
                  posiljaoc = element.posiljaoc.opis; // Pošiljaoc
                  Posiljaoc = element.posiljaoc._id;
                }

                element.tests.forEach((test) => {
                  if (test.labassay.naziv.includes("OGTT -")) {
                    // Not allowed
                    OGTT = true;
                  }

                  if (test.labassay.naziv.includes("INS -")) {
                    // Not allowed
                    Insulin = true;
                  }

                  testovi.push({
                    labassay: test.labassay,
                    sekcija: test.labassay.sekcija,
                    grupa: test.labassay.grupa,
                    order: test.labassay.grouporder,
                    test: test.labassay.analit,
                    cijena: parseFloat(Number(test.cijena).toFixed(2)),
                    CIJENA: parseFloat(Number(test.labassay.price).toFixed(2)),
                  });
                });
              }
            });
          });

          // Izbacivanje, OGTT

          if (OGTT) {
            testovi = testovi.filter(function (item) {
              return item.labassay._id != "5f0b730ac0cfe63397f4aa10"; // Glukoza
            });
          }

          // Izbacivanje, INZULINEMIJA

          if (Insulin) {
            testovi = testovi.filter(function (item) {
              return item.labassay._id != "5f40e80b90fa666d29c02e51"; // Inzulin
            });
          }

          // Sort

          testovi.sort(function (a, b) {
            return a.order.localeCompare(b.order, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });

          testovi.forEach((element) => {
            // Ukupna cijena po trenutno važećem cjenovniku, bez popusta
            nodiscount += parseFloat(Number(element.cijena).toFixed(2));
          });

          // Cijena

          var res_nodiscount = nodiscount;
          var res_discount = req.body.popust;
          var res_total = req.body.total;

          // Izdavanje računa:

          var date = new Date(Date.now());

          var mjesec = date.getMonth() + 1;

          if (mjesec < 10) {
            mjesec = "0" + mjesec;
          }

          var dan = date.getUTCDate();

          if (dan < 10) {
            dan = "0" + dan;
          }

          var godina = date.getFullYear();

          var datum = dan + "." + mjesec + "." + godina;

          var sat = date.getHours();

          if (sat < 10) {
            sat = "0" + sat;
          }

          var min = date.getMinutes();

          if (min < 10) {
            min = "0" + min;
          }

          var sec = date.getSeconds();

          if (sec < 10) {
            sec = "0" + sec;
          }

          var vrijeme = sat + ":" + min + ":" + sec;

          // Patient data

          var ime = samples[0].patient.ime;
          
          if(samples[0].patient.roditelj.trim() != ""){
            var prezime = samples[0].patient.prezime + " (" + samples[0].patient.roditelj + ")"
          }else{
            var prezime = samples[0].patient.prezime;
          }

          var jmbg = samples[0].patient.jmbg;
          var telefon = samples[0].patient.telefon;
          var spol =
            samples[0].patient.spol[0].toUpperCase() +
            samples[0].patient.spol.slice(1).toLowerCase();

          var godiste = jmbg.substring(4, 7);

          switch (godiste[0]) {
            case "9":
              godiste = "1" + godiste;
              break;

            case "0":
              godiste = "2" + godiste;
              break;

            default:
              break;
          }

          var rowsno = "Predračun";

          const doc = new PDFDocumentWithTables({
            bufferPages: true,
            margins: { top: 80, bottom: 50, left: 50, right: 50 },
          });

          doc.pipe(
            fs
              .createWriteStream(config.racuni_path + timestamp + ".pdf")
              .on("finish", function () {
                var counter = 0;

                samples.forEach((element) => {
                  req.body.samples.forEach((sample) => {
                    if (sample === element.id) {
                      timestamp = element.timestamp;
                      sampled_at = element.created_at;
                      PID = element.pid;

                      element.nodiscount = res_nodiscount.toString();
                      element.discount = res_discount.toString();
                      element.total = res_total.toString();

                      element.save(function (err) {
                        if (err) {
                          console.log("Greška:", err);
                          res.json({
                            success: false,
                            message: err,
                          });
                        } else {
                          counter++;
                          if (counter === req.body.samples.length) {
                            // var audit = {};
                            // audit.user = req.body.decoded.user;
                            // audit.protokol = req.body.protokol;
                            // audit.exists = false;
                            // audit.response = null;
                            // audit.time = new Date(
                            //   new Date().getTime() - new Date().getTimezoneOffset() * 60000
                            // );
                            // var Audit = new Check(audit);

                            // Audit.save(function (err) {
                            //   if (err) {
                            //     console.log("Greška:", err);
                            //     res.json({
                            //       success: false,
                            //       message: err,
                            //     });
                            //   } else {
                            //     res.json({
                            //       success: false,
                            //       message: "Nema dostupnih podataka.",
                            //       nalaz: null,
                            //     });
                            //   }
                            // });

                            // BEGIN

                            Racuni.findOne({
                              site: mongoose.Types.ObjectId(req.body.site),
                              timestamp: timestamp,
                            }).exec(function (err, racun) {
                              if (err) {
                                console.log("Greška:", err);
                                res.json({
                                  success: false,
                                  message: err,
                                });
                              } else {
                                if (racun) {
                                  racun.nodiscount = res_nodiscount.toString();
                                  racun.discount = res_discount.toString();
                                  racun.total = res_total.toString();
                                  racun.assays = testovi;
                                  racun.samples = req.body.samples;
                                  // timestamp
                                  // sites
                                  // patient
                                  // posiljaoc
                                  // narucioc
                                  // created_at
                                  // sampled_at
                                  // pid
                                  racun.valid = true;
                                  racun.updated_at = new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  );
                                  // created_by
                                  racun.updated_by = req.body.decoded.user;

                                  racun.save(function (err) {
                                    if (err) {
                                      console.log("Greška:", err);
                                      res.json({
                                        success: false,
                                        message: err,
                                      });
                                    } else {
                                      res.json({
                                        success: true,
                                        message: "Račun uspješno kreiran",
                                        link: timestamp + ".pdf",

                                        nodiscount: parseFloat(
                                          Number(res_nodiscount).toFixed(2)
                                        ),
                                        discount: parseFloat(
                                          Number(res_discount).toFixed(2)
                                        ),
                                        total: parseFloat(
                                          Number(res_total).toFixed(2)
                                        ),
                                      });
                                    }
                                  });
                                } else {
                                  var invoice = {};

                                  invoice.nodiscount =
                                    res_nodiscount.toString();
                                  invoice.discount = res_discount.toString();
                                  invoice.total = res_total.toString();
                                  invoice.assays = testovi;
                                  invoice.samples = req.body.samples;
                                  invoice.timestamp = timestamp;
                                  invoice.valid = true;
                                  invoice.site = req.body.site;
                                  invoice.patient = req.body.patient;
                                  invoice.posiljaoc = Posiljaoc;
                                  invoice.narucioc = null;
                                  invoice.created_at = new Date(
                                    new Date().getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  );
                                  invoice.updated_at = null;
                                  invoice.created_by = req.body.decoded.user;
                                  invoice.sampled_at = sampled_at;
                                  invoice.pid = PID;
                                  invoice.updated_by = req.body.decoded.user;

                                  var Invoice = new Racuni(invoice);

                                  Invoice.save(function (err) {
                                    if (err) {
                                      console.log("Greška:", err);
                                      res.json({
                                        success: false,
                                        message: err,
                                      });
                                    } else {
                                      res.json({
                                        success: true,
                                        message: "Račun uspješno kreiran",
                                        link: timestamp + ".pdf",

                                        nodiscount: parseFloat(
                                          Number(res_nodiscount).toFixed(2)
                                        ),
                                        discount: parseFloat(
                                          Number(res_discount).toFixed(2)
                                        ),
                                        total: parseFloat(
                                          Number(res_total).toFixed(2)
                                        ),
                                      });
                                    }
                                  });
                                }
                              }
                            });
                            // END
                          }
                        }
                      });
                    }
                  });
                });
              })
          );
          doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
          doc.registerFont("PTSansBold", config.nalaz_ptsansbold);

          var code = samples[0].site.sifra;

          doc.image(config.nalaz_logo + code + ".jpg", 50, 13 - 9, {
            width: 280,
            keepAspectRatio: true,
          });

          switch (code) {
            case "B": // CENTRAL LAB Gradačac
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Ul. Josipa Šibera 3, 76250 Gradačac, BiH", 345, 20 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Tel: +387 35 81 63 17", 345, 32.5 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Mob: +387 62 73 73 03 i +387 61 23 47 05", 345, 45 - 3 - 12.5)
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("E-mail: clgradacac@gmail.com i", 345, 57.5 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("            biohemija@bih.net.ba", 341 + 5, 70 - 3 - 12.5)
            
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Facebook: facebook.com/CentralLabGradacac", 345, 70 - 3); 

            break;

            default:
              break;
          }

          doc
            .fontSize(9)
            .fillColor("#7B8186")
            .moveTo(0, 90)
            .lineTo(650, 90)
            .lineWidth(0.7)
            .opacity(0.5)
            .fillAndStroke("#7B8186", "#7B8186")
            .opacity(1);

          if (posiljaoc != null) {
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("Za: " + posiljaoc, 390, 95);
          }

          // Prilagođavanje visine .PDF

          var nvisina = 100;
          var datRodjenja =
            jmbg.substring(0, 2) + "." + jmbg.substring(2, 4) + ".";

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .fillColor("black")
            .text("Prezime i ime: ", 50, nvisina);
          doc
            .font("PTSansBold")
            .fontSize(14)
            .text(
              " " + prezime.toUpperCase() + " " + ime.toUpperCase(),
              142 - 17,
              nvisina - 2
            );

          if (datRodjenja.includes("01.01") && godiste == "1920") {
            var pacijent = prezime.toUpperCase() + " " + ime.toUpperCase();
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Datum rođenja:", 50, nvisina + 16)
              .text("Nema podataka", 150 - 17, nvisina + 16);
          } else if (!datRodjenja.includes("00.00")) {
            var pacijent =
              prezime.toUpperCase() +
              " " +
              ime.toUpperCase() // +
              // " (" +
              // godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Datum rođenja:", 50, nvisina + 16)
              .text(datRodjenja + godiste + ".", 150 - 17, nvisina + 16);
          } else {
            var pacijent =
              prezime.toUpperCase() +
              " " +
              ime.toUpperCase() // +
              // " (" +
              // godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Godište:", 50, nvisina + 16)
              .text(godiste + ".", 150 - 56, nvisina + 16);
          }

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("Spol:", 50, nvisina + 32)
            .text(
              spol[0].toUpperCase() + spol.slice(1).toLowerCase(),
              96 - 17,
              nvisina + 32
            );

          if (
            telefon === "NEPOZNATO" ||
            telefon === "Nema podataka" ||
            telefon.trim() === "" ||
            telefon.length < 9
          ) {
            telefon = "";
            // nvisina = nvisina - 12;
          } else {
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Kontakt:", 50, nvisina + 48)
              .text(telefon, 150 - 54, nvisina + 48);
          }

          doc
            .font("PTSansRegular")
            .fontSize(10)
            .text("Izdavanje računa:", 390, nvisina + 3 + 15 + 3)
            .font("PTSansBold")
            .text(
              datum + " " + vrijeme.substring(0, 5),
              468,
              nvisina + 3 + 15 + 3
            );

          doc
            .font("PTSansBold")
            .fontSize(12)
            .text(rowsno, 50, nvisina + 70);
          doc.moveDown(0.6);

          var niz = [];
          var headers = ["Naziv laboratorijske pretrage", "Iznos"];
          var rows = [];

          testovi.forEach((element) => {
            niz = [];
            niz.push(element.test);
            niz.push(element.cijena);
            rows.push(niz);
          });

          doc.table(
            {
              headers: headers,
              rows: rows,
            },
            {
              prepareHeader: () => doc.fontSize(8),
              prepareRow: (row, i) => doc.fontSize(10),
            }
          );

          if (parseFloat(Number(res_discount).toFixed(2)) != 0) {
            // Sa popustom

            doc
              .font("PTSansRegular")
              .text("Ukupno: " + res_nodiscount.toString() + " BAM", 425)
              .text(
                "Popust: " +
                  parseFloat(Number(res_discount).toFixed(2)).toString() +
                  " %",
                425
              )
              .moveDown(0.5);

            doc
              .font("PTSansBold")
              .text("Za platiti: " + res_total.toString() + " BAM", {
                underline: true,
              });
          } else {
            // Bez popusta

            doc
              .font("PTSansBold")
              .text("", 425)
              .text("Ukupno: " + res_nodiscount.toString() + " BAM", {
                underline: true,
              });
          }

          const range = doc.bufferedPageRange();

          for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("", 50, 740, { lineBreak: false });
            doc
              .fontSize(9)
              .fillColor("#7B8186")
              .moveTo(0, 756)
              .lineTo(650, 756)
              .lineWidth(0.7)
              .opacity(0.5)
              .fillAndStroke("#7B8186", "#7B8186")
              .opacity(1);

            doc
              .font("PTSansRegular")
              .fontSize(9)
              .fillColor("black")
              .text("Pacijent: " + pacijent, 50, 760, { lineBreak: false });
            doc
              .font("PTSansBold")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("ATOM Laboratory Software", 470, 760, { lineBreak: false });
            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("by", 470, 770, { lineBreak: false });
            doc
              .font("PTSansBold")
              .fontSize(8)
              .fillColor("#7B8186")
              .text("iLab d.o.o. Sarajevo", 480, 770, { lineBreak: false });

            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("black")
              .text(
                `Stranica ${i + 1} od ${range.count}`,
                doc.page.width / 2 - 25,
                doc.page.height - 18,
                { lineBreak: false }
              );
          }
          doc.end();
        } else {
          res.json({
            success: true,
            message: "Nema pronađenih rezultata.",
          });
        }
      });
  }
};

racuniController.Report = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    switch (req.body.range) {
      case "JUČER":
        var danasnjiDatum = new Date(
          new Date().setDate(new Date().getDate() - 1)
        );

        break;

      case "DANAS":
        var danasnjiDatum = new Date(new Date().setDate(new Date().getDate()));

        break;

      default:
        var danasnjiDatum = new Date(new Date().setDate(new Date().getDate()));

        break;
    }

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
    to = danasnjiDatum + "T23:59:59";
    to = new Date(to + "Z");
    from = danasnjiDatum + "T00:00:00";
    from = new Date(from + "Z");

    var uslov = {};
    uslov = {
      sampled_at: {
        $gt: new Date(from),
        $lt: new Date(to.setHours(1)),
      },
      site: mongoose.Types.ObjectId(req.body.site),
    };

    // console.log(req.body.range);
    // console.log(uslov.sampled_at);

    Racuni.find(uslov)
      .populate("site patient posiljaoc")
      .exec(function (err, racuni) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          if (racuni.length) {
            var Izvjestaj = [];
            var izvjestaj = {};

            var Data = [];
            var record = {};

            var TOTAL = 0;
            var CASH = 0;
            var VIRMAN = 0;

            racuni.forEach((element) => {
              izvjestaj = {};
              record = {};

              if (element.posiljaoc == null) {
                var partner = "Lični zahtjev";
              } else {
                var partner = element.posiljaoc.naziv;
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
                var godisteTemp = "*";
              } else {
                var godisteTemp = godiste;
              }

              izvjestaj._id = element._id;
              izvjestaj.partner = partner;
              izvjestaj.pid = element.pid;
              izvjestaj.ime = element.patient.ime;
              izvjestaj.prezime = element.patient.prezime;
              izvjestaj.godiste = godisteTemp;
              izvjestaj.nodiscount = element.nodiscount;
              izvjestaj.created_at = element.created_at;
              izvjestaj.discount = element.discount;
              izvjestaj.updated_by = element.updated_by;
              izvjestaj.total = element.total;
              izvjestaj.valid = element.valid;
              izvjestaj.samples = element.samples;

              TOTAL += parseFloat(Number(element.total).toFixed(2));

              if (partner === "Lični zahtjev") {
                CASH += parseFloat(Number(element.total).toFixed(2));
              } else {
                VIRMAN += parseFloat(Number(element.total).toFixed(2));
              }

              (izvjestaj.datum =
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
                ).slice(1, 5)),
                Izvjestaj.push(izvjestaj);

              // RECORD

              record.partner = izvjestaj.partner;
              record.pid = izvjestaj.pid;
              record.ime = izvjestaj.ime;
              record.prezime = izvjestaj.prezime;
              record.godiste = izvjestaj.godiste;
              record.nodiscount = izvjestaj.nodiscount;
              record.discount = izvjestaj.discount;
              record.total = izvjestaj.total.toString();

              record.datum = izvjestaj.datum;
              record.updated_by = izvjestaj.updated_by;

              Data.push(record);
            });

            Izvjestaj.sort(function (a, b) {
              return Date.parse(a.created_at) == Date.parse(b.created_at)
                ? 0
                : +(Date.parse(a.created_at) < Date.parse(b.created_at)) || -1;
            });

            // CASH

            izvjestaj = {};
            record = {};

            izvjestaj._id = "";
            izvjestaj.partner = "";
            izvjestaj.pid = "";
            izvjestaj.ime = "";
            izvjestaj.prezime = "";
            izvjestaj.godiste = "";
            izvjestaj.nodiscount = "";
            izvjestaj.created_at = new Date(
              new Date().getTime() - new Date().getTimezoneOffset() * 60000
            );
            izvjestaj.datum = "CASH";
            izvjestaj.discount = "";
            izvjestaj.total = CASH;
            izvjestaj.valid = "";

            Izvjestaj.push(izvjestaj);

            // RECORD

            record.partner = izvjestaj.partner;
            record.pid = izvjestaj.pid;
            record.ime = izvjestaj.ime;
            record.prezime = izvjestaj.prezime;
            record.godiste = izvjestaj.godiste;
            record.nodiscount = izvjestaj.nodiscount;
            record.discount = izvjestaj.discount;
            record.total = izvjestaj.total.toString();

            record.datum = izvjestaj.datum;
            record.updated_by = "";

            Data.push(record);

            // VIRMAN

            izvjestaj = {};
            record = {};

            izvjestaj._id = "";
            izvjestaj.partner = "";
            izvjestaj.pid = "";
            izvjestaj.ime = "";
            izvjestaj.prezime = "";
            izvjestaj.godiste = "";
            izvjestaj.nodiscount = "";
            izvjestaj.created_at = new Date(
              new Date().getTime() - new Date().getTimezoneOffset() * 60000
            );
            izvjestaj.datum = "VIRMAN";
            izvjestaj.discount = "";
            izvjestaj.total = VIRMAN;
            izvjestaj.valid = "";

            Izvjestaj.push(izvjestaj);

            // RECORD

            record.partner = izvjestaj.partner;
            record.pid = izvjestaj.pid;
            record.ime = izvjestaj.ime;
            record.prezime = izvjestaj.prezime;
            record.godiste = izvjestaj.godiste;
            record.nodiscount = izvjestaj.nodiscount;
            record.discount = izvjestaj.discount;
            record.total = izvjestaj.total.toString();

            record.datum = izvjestaj.datum;
            record.updated_by = "";

            Data.push(record);

            // TOTAL

            izvjestaj = {};
            record = {};

            izvjestaj._id = "";
            izvjestaj.partner = "";
            izvjestaj.pid = "";
            izvjestaj.ime = "";
            izvjestaj.prezime = "";
            izvjestaj.godiste = "";
            izvjestaj.nodiscount = "";
            izvjestaj.created_at = new Date(
              new Date().getTime() - new Date().getTimezoneOffset() * 60000
            );
            izvjestaj.datum = "TOTAL";
            izvjestaj.discount = "";
            izvjestaj.total = TOTAL;
            izvjestaj.valid = "";

            Izvjestaj.push(izvjestaj);

            // RECORD

            record.partner = izvjestaj.partner;
            record.pid = izvjestaj.pid;
            record.ime = izvjestaj.ime;
            record.prezime = izvjestaj.prezime;
            record.godiste = izvjestaj.godiste;
            record.nodiscount = izvjestaj.nodiscount;
            record.discount = izvjestaj.discount;
            record.total = izvjestaj.total.toString();

            record.datum = izvjestaj.datum;
            record.updated_by = "";

            Data.push(record);

            // Require library
            var xl = require("excel4node");

            const wb = new xl.Workbook();
            const ws = wb.addWorksheet("Worksheet Name");

            var headingColumnNames = [
              "PARTNER",
              "ID",
              "IME",
              "PREZIME",
              "GODIŠTE",
              "UKUPNO",
              "% POPUST",
              "ZA PLATITI",
              "DATUM",
              "UPDATED",
            ];
            // ws.column(1).setWidth(20);
            // ws.column(2).setWidth(50);
            // ws.column(3).setWidth(30);
            // ws.column(4).setWidth(40);

            let headingColumnIndex = 1;
            headingColumnNames.forEach((heading) => {
              ws.cell(1, headingColumnIndex++).string(heading);
            });

            let rowIndex = 2;
            Data.forEach((record) => {
              let columnIndex = 1;
              Object.keys(record).forEach((columnName) => {
                ws.cell(rowIndex, columnIndex++).string(record[columnName]);
              });
              rowIndex++;
            });

            const excel_file_path =
              config.report_path + "excel/" + req.body.timestamp + ".xlsx";

            wb.write(excel_file_path, function (err) {
              if (err) {
                console.error(err);
              } else {
                res.json({
                  success: true,
                  message: "Računi.",
                  racuni: Izvjestaj,
                  total: TOTAL,
                  cash: CASH,
                  virman: VIRMAN,
                });
              }
            });
          } else {
            res.json({
              success: true,
              message: "Nema pronađenih rezultata.",
              racuni: [],
              total: "0",
              cash: "0",
              virman: "0",
            });
          }
        }
      });
  }
};

racuniController.Download = function (req, res) {
  const excel_file_path =
    config.report_path + "excel/" + req.query.filename + ".xlsx";

  res.setHeader("Content-Type", "writeTheType");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + req.query.filename + ".xlsx"
  );
  fs.createReadStream(excel_file_path).pipe(res);

  // res.sendFile(excel_file_path);
};

racuniController.Delete = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Racuni.remove(
      {
        _id: mongoose.Types.ObjectId(req.body.racun._id),
      },
      function (err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          var count = 0;
          req.body.racun.samples.forEach((uzorak) => {
            Samples.findOne({
              id: uzorak,
            }).exec(function (err, sample) {
              if (sample) {
                sample.nodiscount = null;
                sample.discount = null;
                sample.total = null;

                // sample.updated_by = req.body.decoded.user;
                // sample.updated_at = new Date(
                //   new Date().getTime() -
                //     new Date().getTimezoneOffset() * 60000
                // );

                sample.save(function (err) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err,
                    });
                  } else {
                    count++;
                    // console.log(sample.id)

                    if (req.body.racun.samples.length === count) {
                      res.json({
                        success: true,
                        message: "Brisanje uspješno obavljeno.",
                      });
                    }
                  }
                });
              } else {
                res.json({
                  success: true,
                  message: "Nema pronađenih rezultata.",
                });
              }
            });
          });
        }
      }
    );
  }
};

module.exports = racuniController;
