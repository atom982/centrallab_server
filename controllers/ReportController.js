const barcode = require("bwip-js");
const path = require("path");
const config = require("../config");

var mongoose = require("mongoose");
var tipAparata = require("../models/Postavke");
var appDir = path.dirname(require.main.filename);
var fs = require("fs");
var PdfTable = require("voilab-pdf-table");
var ipp = require("ipp");
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
var Patients = mongoose.model("Patients");
var Samples = mongoose.model("Samples");
var Results = mongoose.model("Results");
var Nalazi = mongoose.model("Nalazi");

PDFDocument = require("pdfkit");

var reportController = {};

// ReportController.js

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
        this.text(header, startX - 160 + i * columnContainerWidth, startY, {
          width: columnWidth + 160,
          align: "left",
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
      var pageAdded = false;
      // Switch to next page if we cannot go any further because the space is ove
      // For safety, consider 3 rows margin instead of just one
      if (startY + 3 * rowHeight < maxY) {
        startY = rowBottomY + rowSpacing;
      } else {
        this.addPage();
        pageAdded = true;
      }
      // Allow the user to override style for rows
      prepareRow(row, i);
      // Print all cells of the current row
      row.forEach((cell, i) => {
        if (i === 0) {
          this.text(cell, startX + i * columnContainerWidth, startY, {
            width: columnWidth + 40,
            align: "left",
          });
        }
        if (i === 1) {
          this.text(cell, startX - 160 + i * columnContainerWidth, startY, {
            width: columnWidth + 160,
            align: "left",
          });
          startY = this.y;
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

reportController.KProtokol = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var range = req.body.range.split("do");
    if (range.length === 2) {
      to = range[1].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    } else {
      to = range[0].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    }

    var tmpTime = "";
    if (req.body.range.length > 20) {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4) +
        " do " +
        req.body.range.slice(22, 24) +
        "." +
        req.body.range.slice(19, 21) +
        "." +
        req.body.range.slice(14, 18);
    } else {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4);
    }

    // console.log("KNJIGA PROTOKOLA");
    // console.log(req.body.izbor.naziv);
    // console.log(req.body.izbor._id);

    var uslov = {};

    if (req.body.izbor.naziv === "Kompletan izvještaj") {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
        status: true,
      };
    } else {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
        site: mongoose.Types.ObjectId(req.body.izbor._id),
        status: true,
      };
    }

    Nalazi.find(uslov)
      .populate("patient site")
      .exec(function (err, nalazi) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (nalazi.length) {
            const doc = new PDFDocumentWithTables({
              layout: "landscape",
              bufferPages: true,
            });

            doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
            doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
            // doc.image(config.nalaz_logo + nalazi[0].site.sifra + '.jpg', 67, 15, {
            //     fit: [150, 57],
            //     align: 'center',
            //     valign: 'center'
            // })
            // doc.image(config.nalaz_footer + nalazi[0].site.sifra + '.jpg', 0, 711, {
            //     fit: [615, 114],
            //     align: 'center',
            //     valign: 'center'
            // })
            doc
              .font("PTSansRegular")
              .fontSize(20)
              .fillColor("#black")
              .text("Knjiga protokola: " + tmpTime, 0, 50, { align: "center" });
            doc.moveDown();

            var headers = ["Pacijent", "Analize"];
            var rows = [];
            var linerow = [];
            nalazi.forEach((nalaz) => {
              var godiste = nalaz.patient.jmbg.substring(4, 7);
              switch (godiste[0]) {
                case "9":
                  godiste = "1" + godiste + ".";
                  break;
                case "0":
                  godiste = "2" + godiste + ".";
                  break;
                default:
                  break;
              }

              linerow = [];
              analize = "| ";

              if (!nalaz.patient.prezime.includes("-")) {
                if (
                  (
                    nalaz.patient.ime +
                    " " +
                    nalaz.patient.prezime +
                    " | Godište: " +
                    godiste
                  ).trim().length < 33
                ) {
                  var ime =
                    nalaz.patient.ime.trim() +
                    " " +
                    nalaz.patient.prezime.trim() +
                    " | Godište: " +
                    godiste;
                } else {
                  var ime =
                    nalaz.patient.ime.trim() +
                    " " +
                    nalaz.patient.prezime.trim() +
                    "\n" +
                    "Godište: " +
                    godiste;
                }
              } else {
                var ime =
                  nalaz.patient.ime.trim() +
                  " " +
                  nalaz.patient.prezime.split("-")[0].trim() +
                  " -\n" +
                  nalaz.patient.prezime.split("-")[1].trim() +
                  " | Godište: " +
                  godiste;
              }

              linerow.push(ime);
              nalaz.rows.forEach((sekc) => {
                sekc.forEach((test) => {
                  if (test.hasOwnProperty("multi")) {
                    analize += test.test + " (";
                    test.rezultat.forEach((analit) => {
                      analize +=
                        analit[0].trim() +
                        "=" +
                        analit[1].rezultat.trim() +
                        "; ";
                    });
                    analize += ") |";
                  } else {
                    analize +=
                      test.rezultat[0].trim() +
                      "=" +
                      test.rezultat[1].rezultat.trim() +
                      " | ";
                  }
                });
              });
              linerow.push(analize);
              rows.push(linerow);
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

            const range = doc.bufferedPageRange();

            for (let i = range.start; i < range.start + range.count; i++) {
              doc.switchToPage(i);
              doc
                .font("PTSansRegular")
                .fontSize(13)
                .fillColor("#7B8186")
                .text(req.body.izbor.naziv, 70, 25);
              doc
                .font("PTSansRegular")
                .fontSize(8)
                .fillColor("#black")
                .text(
                  `Stranica ${i + 1} od ${range.count}`,
                  doc.page.width / 2 - 25,
                  doc.page.height - 30,
                  { lineBreak: false }
                );
            }
            doc.end();
            doc.pipe(
              fs
                .createWriteStream(
                  config.report_path + "protokol/" + req.body.timestamp + ".pdf"
                )
                .on("finish", function () {
                  res.json({
                    success: true,
                    message: "Izvještaj uspjesno kreiran",
                    id: req.body.range,
                  });
                })
            );
          } else {
            res.json({
              success: true,
              message: "Nema dostupnih podataka.",
              id: req.body.range,
            });
          }
        }
      });
  }
};

class PDFDocumentWithTablesFinansijski extends PDFDocument {
  constructor(options) {
    super(options);
  }

  table(table, arg0, arg1, arg2) {
    let startX = this.page.margins.left,
      startY = this.y;
    let options = {};
    let sifra = "";

    if (typeof arg1 === "string") {
      sifra = arg1;
    }
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
      if (i === 2) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth - 52,
          align: "center",
        });
      }
      if (i === 3) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 4) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
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
      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      if (startY + 3 * rowHeight < maxY) {
        startY = rowBottomY + rowSpacing;
      } else {
        this.addPage();
      }
      // Allow the user to override style for rows
      prepareRow(row, i);
      var tempcell0 = "";
      var tempcell1 = "";
      // Print all cells of the current row
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
        if (i === 2) {
          if (cell === "L" || cell === "H" || cell === "Poz.") {
            this.font("PTSansBold")
              .rect(72, this.y, 468, -14)
              .fill("#cccccc")
              .fillColor("black")
              .text(tempcell0, startX + 0 * columnContainerWidth, startY, {
                width: columnWidth + 40,
                align: "left",
              })
              .text(tempcell1, startX + 40 + 1 * columnContainerWidth, startY, {
                width: columnWidth - 40,
                align: "center",
              })
              .text(cell, startX + i * columnContainerWidth, startY, {
                width: columnWidth - 52,
                align: "center",
              });
          } else {
            this.text(cell, startX + i * columnContainerWidth, startY, {
              width: columnWidth - 52,
              align: "center",
            });
          }
        }
        if (i === 3) {
          this.text(cell, startX + i * columnContainerWidth, startY, {
            width: columnWidth,
            align: "center",
          });
        }
        if (i === 4) {
          this.text(cell, startX + i * columnContainerWidth, startY, {
            width: columnWidth,
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

reportController.FPodanu = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var range = req.body.range.split("do");
    if (range.length === 2) {
      to = range[1].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    } else {
      to = range[0].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    }

    var tmpTime = "";
    if (req.body.range.length > 20) {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4) +
        " do " +
        req.body.range.slice(22, 24) +
        "." +
        req.body.range.slice(19, 21) +
        "." +
        req.body.range.slice(14, 18);
    } else {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4);
    }

    // console.log("Finansijski izvještaj (po danu)");
    // console.log(req.body.izbor.naziv);
    // console.log(req.body.izbor._id);

    var uslov = {};

    if (req.body.izbor.naziv === "Kompletan izvještaj") {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
      };
    } else {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
        site: mongoose.Types.ObjectId(req.body.izbor._id),
      };
    }

    Results.find(uslov)
      .populate("patient site rezultati.labassay")
      .exec(function (err, rezultati) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (rezultati.length) {
            const doc = new PDFDocumentWithTablesFinansijski({
              layout: "landscape",
              bufferPages: true,
            });

            doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
            doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
            // doc.image(config.nalaz_logo + rezultati[0].site.sifra + '.jpg', 67, 15, {
            //     fit: [150, 57],
            //     align: 'center',
            //     valign: 'center'
            // })
            // doc.image(config.nalaz_footer + rezultati[0].site.sifra + '.jpg', 0, 711, {
            //     fit: [615, 114],
            //     align: 'center',
            //     valign: 'center'
            // })

            if (tmpTime.length > 15) {
              doc
                .font("PTSansRegular")
                .fontSize(18)
                .fillColor("#black")
                .text("Finansijski izvještaj | Po danu: " + tmpTime, 0, 50, {
                  align: "center",
                });
            } else {
              doc
                .font("PTSansRegular")
                .fontSize(20)
                .fillColor("#black")
                .text("Finansijski izvještaj | Po danu: " + tmpTime, 0, 50, {
                  align: "center",
                });
            }
            doc.moveDown();
            rezultati.sort(function (a, b) {
              return a.id.substring(5, 10) == b.id.substring(5, 10)
                ? 0
                : +(a.id.substring(5, 10) > b.id.substring(5, 10)) || -1;
            });
            var headers = [
              "Datum",
              "Pacijenata",
              "Uzoraka",
              "Testova",
              "Promet",
            ];
            var rows = [];
            var linerow = [];
            var tempDatum = [];
            var tempPatients = [];
            var tempUzoraka = [];
            var tempTestova = 0;
            var tempPromet = 0;
            var totp = 0;
            var totu = 0;
            var tott = 0;
            var tots = 0;
            var god = "";
            for (let i = 0; i < rezultati.length; i++) {
              if (i === 0) {
                if (
                  !tempDatum.filter(
                    (datum) => datum === rezultati[0].id.substring(5, 10)
                  ).length > 0
                ) {
                  tempDatum.push(rezultati[0].id.substring(5, 10));
                }
                if (
                  !tempPatients.filter(
                    (patient) => patient === rezultati[0].patient._id
                  ).length > 0
                ) {
                  tempPatients.push(rezultati[0].patient._id);
                }
                if (
                  !tempUzoraka.filter((uzorak) => uzorak === rezultati[0].id)
                    .length > 0
                ) {
                  tempUzoraka.push(rezultati[0].id);
                }

                tempTestova += rezultati[0].rezultati.length;

                rezultati[0].rezultati.forEach((rezultat) => {
                  tempPromet += parseInt(rezultat.labassay.price);
                });
              } else {
                if (
                  rezultati[i].id.substring(5, 10) ===
                  rezultati[i - 1].id.substring(5, 10)
                ) {
                  if (
                    !tempDatum.filter(
                      (datum) => datum === rezultati[i].id.substring(5, 10)
                    ).length > 0
                  ) {
                    tempDatum.push(rezultati[i].id.substring(5, 10));
                  }
                  if (
                    !tempPatients.filter(
                      (patient) => patient === rezultati[i].patient._id
                    ).length > 0
                  ) {
                    tempPatients.push(rezultati[i].patient._id);
                  }
                  if (
                    !tempUzoraka.filter((uzorak) => uzorak === rezultati[i].id)
                      .length > 0
                  ) {
                    tempUzoraka.push(rezultati[i].id);
                  }

                  tempTestova += rezultati[i].rezultati.length;

                  rezultati[i].rezultati.forEach((rezultat) => {
                    tempPromet += parseInt(rezultat.labassay.price);
                  });
                  if (i === rezultati.length - 1) {
                    if (
                      rezultati[i - 1].id.substring(5, 10).substring(0, 1) ===
                      "8"
                    ) {
                      god = "2018";
                    } else if (
                      rezultati[i - 1].id.substring(5, 10).substring(0, 1) ===
                      "9"
                    ) {
                      god = "2019";
                    } else if (
                      rezultati[i - 1].id.substring(5, 10).substring(0, 1) ===
                      "0"
                    ) {
                      god = "2020";
                    } else {
                      god =
                        "202" +
                        rezultati[i - 1].id.substring(5, 10).substring(0, 1);
                    }
                    linerow.push(
                      rezultati[i - 1].id.substring(5, 10).substring(3, 5) +
                        "." +
                        rezultati[i - 1].id.substring(5, 10).substring(1, 3) +
                        "." +
                        god
                    );
                    linerow.push(tempPatients.length);
                    totp += tempPatients.length;
                    linerow.push(tempUzoraka.length);
                    totu += tempUzoraka.length;
                    linerow.push(tempTestova);
                    tott += tempTestova;
                    linerow.push(tempPromet);
                    tots += tempPromet;
                    rows.push(linerow);

                    linerow = [];
                    linerow.push("UKUPNO");
                    linerow.push(totp);
                    linerow.push(totu);
                    linerow.push(tott);
                    linerow.push(tots);
                    rows.push(linerow);
                    // console.log(rows)
                  }
                } else {
                  // Promjena datuma
                  if (
                    rezultati[i - 1].id.substring(5, 10).substring(0, 1) === "8"
                  ) {
                    god = "2018";
                  } else if (
                    rezultati[i - 1].id.substring(5, 10).substring(0, 1) === "9"
                  ) {
                    god = "2019";
                  } else if (
                    rezultati[i - 1].id.substring(5, 10).substring(0, 1) === "0"
                  ) {
                    god = "2020";
                  } else {
                    god =
                      "202" +
                      rezultati[i - 1].id.substring(5, 10).substring(0, 1);
                  }
                  linerow.push(
                    rezultati[i - 1].id.substring(5, 10).substring(3, 5) +
                      "." +
                      rezultati[i - 1].id.substring(5, 10).substring(1, 3) +
                      "." +
                      god
                  );
                  linerow.push(tempPatients.length);
                  totp += tempPatients.length;
                  linerow.push(tempUzoraka.length);
                  totu += tempUzoraka.length;
                  linerow.push(tempTestova);
                  tott += tempTestova;
                  linerow.push(tempPromet);
                  tots += tempPromet;
                  rows.push(linerow);
                  linerow = [];
                  if (i === rezultati.length - 1) {
                    linerow.push("UKUPNO");
                    linerow.push(totp);
                    linerow.push(totu);
                    linerow.push(tott);
                    linerow.push(tots);
                    rows.push(linerow);
                  }
                  tempPatients = [];
                  tempUzoraka = [];
                  tempTestova = 0;
                  tempPromet = 0;
                  if (
                    !tempDatum.filter(
                      (datum) => datum === rezultati[i].id.substring(5, 10)
                    ).length > 0
                  ) {
                    tempDatum.push(rezultati[i].id.substring(5, 10));
                  }
                  if (
                    !tempPatients.filter(
                      (patient) => patient === rezultati[i].patient._id
                    ).length > 0
                  ) {
                    tempPatients.push(rezultati[i].patient._id);
                  }
                  if (
                    !tempUzoraka.filter((uzorak) => uzorak === rezultati[i].id)
                      .length > 0
                  ) {
                    tempUzoraka.push(rezultati[i].id);
                  }

                  tempTestova += rezultati[i].rezultati.length;

                  rezultati[i].rezultati.forEach((rezultat) => {
                    tempPromet += parseInt(rezultat.labassay.price);
                  });
                }
              }
            }

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

            const range = doc.bufferedPageRange();

            for (let i = range.start; i < range.start + range.count; i++) {
              doc.switchToPage(i);
              doc
                .font("PTSansRegular")
                .fontSize(13)
                .fillColor("#7B8186")
                .text(req.body.izbor.naziv, 70, 25);
              doc
                .font("PTSansRegular")
                .fontSize(8)
                .fillColor("#black")
                .text(
                  `Stranica ${i + 1} od ${range.count}`,
                  doc.page.width / 2 - 25,
                  doc.page.height - 30,
                  { lineBreak: false }
                );
            }
            doc.end();
            doc.pipe(
              fs
                .createWriteStream(
                  config.report_path + "fpodanu/" + req.body.timestamp + ".pdf"
                )
                .on("finish", function () {
                  res.json({
                    success: true,
                    message: "Izvještaj uspjesno kreiran",
                    id: req.body.range,
                  });
                })
            );
          } else {
            res.json({
              success: true,
              message: "Nema dostupnih podataka.",
              id: req.body.range,
            });
          }
        }
      });
  }
};

reportController.PPodanu = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var range = req.body.range.split("do");
    if (range.length === 2) {
      to = range[1].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    } else {
      to = range[0].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    }

    var tmpTime = "";
    if (req.body.range.length > 20) {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4) +
        " do " +
        req.body.range.slice(22, 24) +
        "." +
        req.body.range.slice(19, 21) +
        "." +
        req.body.range.slice(14, 18);
    } else {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4);
    }

    // console.log("Broj urađenih analiza");
    // console.log(req.body.izbor.naziv);
    // console.log(req.body.izbor._id);

    var uslov = {};

    if (req.body.izbor.naziv === "Kompletan izvještaj") {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
      };
    } else {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
        site: mongoose.Types.ObjectId(req.body.izbor._id),
      };
    }

    Results.find(uslov)
      .populate("patient site rezultati.labassay")
      .exec(function (err, rezultati) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (rezultati.length) {
            const doc = new PDFDocumentWithTablesFinansijski({
              layout: "landscape",
              bufferPages: true,
            });

            doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
            doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
            // doc.image(config.nalaz_logo + rezultati[0].site.sifra + '.jpg', 67, 15, {
            //     fit: [150, 57],
            //     align: 'center',
            //     valign: 'center'
            // })
            // doc.image(config.nalaz_footer + rezultati[0].site.sifra + '.jpg', 0, 711, {
            //     fit: [615, 114],
            //     align: 'center',
            //     valign: 'center'
            // })

            if (tmpTime.length > 15) {
              doc
                .font("PTSansRegular")
                .fontSize(18)
                .fillColor("#black")
                .text("Broj urađenih analiza: " + tmpTime, 0, 50, {
                  align: "center",
                });
            } else {
              doc
                .font("PTSansRegular")
                .fontSize(20)
                .fillColor("#black")
                .text("Broj urađenih analiza: " + tmpTime, 0, 50, {
                  align: "center",
                });
            }
            doc.moveDown();
            var testovi = [];
            rezultati.forEach((rezultat) => {
              rezultat.rezultati.forEach((element) => {
                if (element.labassay != null) {
                  if (
                    !testovi.filter(
                      (test) => test.ime === element.labassay.analit
                    ).length > 0
                  ) {
                    testovi.push({ ime: element.labassay.analit, count: 0 });
                  }
                  if (
                    testovi.filter(
                      (test) => test.ime === element.labassay.analit
                    ).length > 0
                  ) {
                    testovi.forEach((t) => {
                      if (t.ime === element.labassay.analit) {
                        t.count = parseInt(t.count) + 1;
                      }
                    });
                  }
                }
              });
            });

            testovi.sort(function (a, b) {
              return a.count == b.count ? 0 : +(a.count < b.count) || -1;
            });
            var exists = false;
            LabAssays.find().exec(function (err, LabTsts) {
              LabTsts.forEach((tsts) => {
                exists = false;
                testovi.forEach((test) => {
                  if (tsts.analit === test.ime) {
                    exists = true;
                  }
                });
                if (!exists) {
                  if (!tsts.bundledTests.length) {
                    testovi.push({ ime: tsts.analit, count: 0 });
                  }
                }
              });
              var headers = ["Rank", "Naziv Testa", "Broj"];
              var rows = [];
              var linerow = [];
              var i = 0;
              var total = 0;
              testovi.forEach((element) => {
                i++;
                linerow = [];
                linerow.push(i);
                linerow.push(element.ime);
                linerow.push(element.count);
                total += element.count;
                rows.push(linerow);
                if (i === testovi.length) {
                  linerow = [];
                  linerow.push("-");
                  linerow.push("UKUPNO");
                  linerow.push(total);
                  rows.push(linerow);
                }
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

              const range = doc.bufferedPageRange();

              for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc
                  .font("PTSansRegular")
                  .fontSize(13)
                  .fillColor("#7B8186")
                  .text(req.body.izbor.naziv, 70, 25);
                doc
                  .font("PTSansRegular")
                  .fontSize(8)
                  .fillColor("#black")
                  .text(
                    `Stranica ${i + 1} od ${range.count}`,
                    doc.page.width / 2 - 25,
                    doc.page.height - 30,
                    { lineBreak: false }
                  );
              }
              doc.end();
              doc.pipe(
                fs
                  .createWriteStream(
                    config.report_path +
                      "ppodanu/" +
                      req.body.timestamp +
                      ".pdf"
                  )
                  .on("finish", function () {
                    res.json({
                      success: true,
                      message: "Izvještaj uspjesno kreiran",
                      id: req.body.range,
                    });
                  })
              );
            });
          } else {
            res.json({
              success: true,
              message: "Nema dostupnih podataka.",
              id: req.body.range,
            });
          }
        }
      });
  }
};

reportController.PPomjestu = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var range = req.body.range.split("do");
    if (range.length === 2) {
      to = range[1].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    } else {
      to = range[0].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    }

    var tmpTime = "";
    if (req.body.range.length > 20) {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4) +
        " do " +
        req.body.range.slice(22, 24) +
        "." +
        req.body.range.slice(19, 21) +
        "." +
        req.body.range.slice(14, 18);
    } else {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4);
    }

    // console.log("PACIJENTI PO MJESTU");
    // console.log(req.body.izbor.naziv);
    // console.log(req.body.izbor._id);

    var uslov = {};

    if (req.body.izbor.naziv === "Kompletan izvještaj") {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
      };
    } else {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
        site: mongoose.Types.ObjectId(req.body.izbor._id),
      };
    }

    Results.find(uslov)
      .populate("patient site")
      .exec(function (err, rezultati) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (rezultati.length) {
            const doc = new PDFDocumentWithTablesFinansijski({
              layout: "landscape",
              bufferPages: true,
            });

            doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
            doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
            // doc.image(config.nalaz_logo + rezultati[0].site.sifra + '.jpg', 67, 15, {
            //     fit: [150, 57],
            //     align: 'center',
            //     valign: 'center'
            // })
            // doc.image(config.nalaz_footer + rezultati[0].site.sifra + '.jpg', 0, 711, {
            //     fit: [615, 114],
            //     align: 'center',
            //     valign: 'center'
            // })

            if (tmpTime.length > 15) {
              doc
                .font("PTSansRegular")
                .fontSize(18)
                .fillColor("#black")
                .text("Pacijenti po mjestu: " + tmpTime, 0, 50, {
                  align: "center",
                });
            } else {
              doc
                .font("PTSansRegular")
                .fontSize(20)
                .fillColor("#black")
                .text("Pacijenti po mjestu: " + tmpTime, 0, 50, {
                  align: "center",
                });
            }
            doc.moveDown();
            var pacijenti = [];
            rezultati.forEach((element) => {
              if (
                !pacijenti.filter(
                  (pacijent) => pacijent._id === element.patient._id
                ).length > 0
              ) {
                pacijenti.push(element.patient);
              }
            });

            var mjesta = [];
            pacijenti.forEach((pacijent) => {
              if (
                !mjesta.filter((mjesto) => mjesto.mjesto === pacijent.adresa)
                  .length > 0
              ) {
                mjesta.push({ mjesto: pacijent.adresa, count: 1 });
              } else {
                mjesta.forEach((element) => {
                  if (element.mjesto === pacijent.adresa) {
                    element.count++;
                  }
                });
              }
            });

            mjesta.sort(function (a, b) {
              return a.count == b.count ? 0 : +(a.count < b.count) || -1;
            });
            // console.log(mjesta);

            var headers = ["Rank", "Mjesto", "Broj"];
            var rows = [];
            var linerow = [];
            var i = 0;
            var total = 0;
            mjesta.forEach((element) => {
              i++;
              linerow = [];
              linerow.push(i);
              linerow.push(element.mjesto);
              linerow.push(element.count);
              total += element.count;
              rows.push(linerow);
              if (i === mjesta.length) {
                linerow = [];
                linerow.push("-");
                linerow.push("UKUPNO PACIJENATA");
                linerow.push(total);
                rows.push(linerow);
              }
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

            const range = doc.bufferedPageRange();

            for (let i = range.start; i < range.start + range.count; i++) {
              doc.switchToPage(i);
              doc
                .font("PTSansRegular")
                .fontSize(13)
                .fillColor("#7B8186")
                .text(req.body.izbor.naziv, 70, 25);
              doc
                .font("PTSansRegular")
                .fontSize(8)
                .fillColor("#black")
                .text(
                  `Stranica ${i + 1} od ${range.count}`,
                  doc.page.width / 2 - 25,
                  doc.page.height - 30,
                  { lineBreak: false }
                );
            }
            doc.end();
            doc.pipe(
              fs
                .createWriteStream(
                  config.report_path +
                    "ppomjestu/" +
                    req.body.timestamp +
                    ".pdf"
                )
                .on("finish", function () {
                  res.json({
                    success: true,
                    message: "Izvještaj uspješno kreiran",
                    id: req.body.range,
                  });
                })
            );
          } else {
            res.json({
              success: true,
              message: "Nema dostupnih podataka.",
              id: req.body.range,
            });
          }
        }
      });
  }
};

reportController.FPodanuGraph = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var range = req.body.range.split("do");
    if (range.length === 2) {
      to = range[1].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    } else {
      to = range[0].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    }

    // console.log("Finansijski izvještaj | Grafički prikaz");
    // console.log(req.body.izbor.naziv);
    // console.log(req.body.izbor._id);

    var uslov = {};

    if (req.body.izbor.naziv === "Kompletan izvještaj") {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
      };
    } else {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
        site: mongoose.Types.ObjectId(req.body.izbor._id),
      };
    }

    var tmpTime = "";
    if (req.body.range.length > 20) {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4) +
        " do " +
        req.body.range.slice(22, 24) +
        "." +
        req.body.range.slice(19, 21) +
        "." +
        req.body.range.slice(14, 18);
    } else {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4);
    }
    Results.find(uslov)
      .populate("patient site rezultati.labassay")
      .exec(function (err, rezultati) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (rezultati.length) {
            rezultati.sort(function (a, b) {
              return a.id.substring(5, 10) == b.id.substring(5, 10)
                ? 0
                : +(a.id.substring(5, 10) > b.id.substring(5, 10)) || -1;
            });

            var headers = [
              "Datum",
              "Pacijenata",
              "Uzoraka",
              "Testova",
              "Promet",
            ];
            var rows = [];
            var linerow = [];
            var tempDatum = [];
            var tempPatients = [];
            var tempUzoraka = [];
            var tempTestova = 0;
            var tempPromet = 0;
            var totp = 0;
            var totu = 0;
            var tott = 0;
            var tots = 0;
            var god = "";
            for (let i = 0; i < rezultati.length; i++) {
              if (i === 0) {
                if (
                  !tempDatum.filter(
                    (datum) => datum === rezultati[0].id.substring(5, 10)
                  ).length > 0
                ) {
                  tempDatum.push(rezultati[0].id.substring(5, 10));
                }
                if (
                  !tempPatients.filter(
                    (patient) => patient === rezultati[0].patient._id
                  ).length > 0
                ) {
                  tempPatients.push(rezultati[0].patient._id);
                }
                if (
                  !tempUzoraka.filter((uzorak) => uzorak === rezultati[0].id)
                    .length > 0
                ) {
                  tempUzoraka.push(rezultati[0].id);
                }

                tempTestova += rezultati[0].rezultati.length;

                rezultati[0].rezultati.forEach((rezultat) => {
                  tempPromet += parseInt(rezultat.labassay.price);
                });
              } else {
                if (
                  rezultati[i].id.substring(5, 10) ===
                  rezultati[i - 1].id.substring(5, 10)
                ) {
                  if (
                    !tempDatum.filter(
                      (datum) => datum === rezultati[i].id.substring(5, 10)
                    ).length > 0
                  ) {
                    tempDatum.push(rezultati[i].id.substring(5, 10));
                  }
                  if (
                    !tempPatients.filter(
                      (patient) => patient === rezultati[i].patient._id
                    ).length > 0
                  ) {
                    tempPatients.push(rezultati[i].patient._id);
                  }
                  if (
                    !tempUzoraka.filter((uzorak) => uzorak === rezultati[i].id)
                      .length > 0
                  ) {
                    tempUzoraka.push(rezultati[i].id);
                  }

                  tempTestova += rezultati[i].rezultati.length;

                  rezultati[i].rezultati.forEach((rezultat) => {
                    tempPromet += parseInt(rezultat.labassay.price);
                  });
                  if (i === rezultati.length - 1) {
                    if (
                      rezultati[i - 1].id.substring(5, 10).substring(0, 1) ===
                      "8"
                    ) {
                      god = "2018";
                    } else if (
                      rezultati[i - 1].id.substring(5, 10).substring(0, 1) ===
                      "9"
                    ) {
                      god = "2019";
                    } else if (
                      rezultati[i - 1].id.substring(5, 10).substring(0, 1) ===
                      "0"
                    ) {
                      god = "2020";
                    } else {
                      god =
                        "202" +
                        rezultati[i - 1].id.substring(5, 10).substring(0, 1);
                    }
                    linerow.push(
                      rezultati[i - 1].id.substring(5, 10).substring(3, 5) +
                        "." +
                        rezultati[i - 1].id.substring(5, 10).substring(1, 3) +
                        "." +
                        god
                    );
                    linerow.push(tempPatients.length);
                    totp += tempPatients.length;
                    linerow.push(tempUzoraka.length);
                    totu += tempUzoraka.length;
                    linerow.push(tempTestova);
                    tott += tempTestova;
                    linerow.push(tempPromet);
                    tots += tempPromet;
                    rows.push(linerow);

                    linerow = [];
                    linerow.push("UKUPNO");
                    linerow.push(totp);
                    linerow.push(totu);
                    linerow.push(tott);
                    linerow.push(tots);
                    rows.push(linerow);
                    // console.log(rows)
                  }
                } else {
                  // Promjena datuma
                  if (
                    rezultati[i - 1].id.substring(5, 10).substring(0, 1) === "8"
                  ) {
                    god = "2018";
                  } else if (
                    rezultati[i - 1].id.substring(5, 10).substring(0, 1) === "9"
                  ) {
                    god = "2019";
                  } else if (
                    rezultati[i - 1].id.substring(5, 10).substring(0, 1) === "0"
                  ) {
                    god = "2020";
                  } else {
                    god =
                      "202" +
                      rezultati[i - 1].id.substring(5, 10).substring(0, 1);
                  }
                  linerow.push(
                    rezultati[i - 1].id.substring(5, 10).substring(3, 5) +
                      "." +
                      rezultati[i - 1].id.substring(5, 10).substring(1, 3) +
                      "." +
                      god
                  );
                  linerow.push(tempPatients.length);
                  totp += tempPatients.length;
                  linerow.push(tempUzoraka.length);
                  totu += tempUzoraka.length;
                  linerow.push(tempTestova);
                  tott += tempTestova;
                  linerow.push(tempPromet);
                  tots += tempPromet;
                  rows.push(linerow);
                  linerow = [];
                  if (i === rezultati.length - 1) {
                    linerow.push("UKUPNO");
                    linerow.push(totp);
                    linerow.push(totu);
                    linerow.push(tott);
                    linerow.push(tots);
                    rows.push(linerow);
                  }
                  tempPatients = [];
                  tempUzoraka = [];
                  tempTestova = 0;
                  tempPromet = 0;
                  if (
                    !tempDatum.filter(
                      (datum) => datum === rezultati[i].id.substring(5, 10)
                    ).length > 0
                  ) {
                    tempDatum.push(rezultati[i].id.substring(5, 10));
                  }
                  if (
                    !tempPatients.filter(
                      (patient) => patient === rezultati[i].patient._id
                    ).length > 0
                  ) {
                    tempPatients.push(rezultati[i].patient._id);
                  }
                  if (
                    !tempUzoraka.filter((uzorak) => uzorak === rezultati[i].id)
                      .length > 0
                  ) {
                    tempUzoraka.push(rezultati[i].id);
                  }

                  tempTestova += rezultati[i].rezultati.length;

                  rezultati[i].rezultati.forEach((rezultat) => {
                    tempPromet += parseInt(rezultat.labassay.price);
                  });
                }
              }
            }

            res.json({
              success: true,
              message: "Rezultati u prilogu.",
              headers: headers,
              rows: rows,
            });
          } else {
            res.json({
              success: false,
              message: "Nema dostupnih podataka.",
              id: req.body.range,
            });
          }
        }
      });
  }
};

// Pacijenti po lokaciji, PDFDocument

class PDFDocumentWithTablesPPoLokaciji extends PDFDocument {
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
          width: columnWidth,
          align: "left",
        });
      }
      if (i === 1) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth + 100,
          align: "left",
        });
      }
      if (i === 2) {
        this.text(header, startX + 100 + i * columnContainerWidth, startY, {
          width: columnWidth - 100,
          align: "left",
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
      var pageAdded = false;
      var correction = 0;
      // Switch to next page if we cannot go any further because the space is ove
      // For safety, consider 3 rows margin instead of just one
      if (startY + 3 * rowHeight < maxY) {
        startY = rowBottomY + rowSpacing;
      } else {
        this.addPage();
        pageAdded = true;
      }
      // Allow the user to override style for rows
      prepareRow(row, i);
      // Print all cells of the current row
      row.forEach((cell, i) => {
        if (i === 0) {
          var Niz = cell.split("\n");

          Niz.forEach((element) => {
            if (element.includes("Godište:")) {
              this.fontSize(8);
              this.text(
                element,
                startX + i * columnContainerWidth,
                startY + 12,
                {
                  width: columnWidth,
                  align: "left",
                }
              );
            } else if (element.includes("Nalaz izdan:")) {
              this.fontSize(8);
              this.text(
                element,
                startX + i * columnContainerWidth,
                startY + 22,
                {
                  width: columnWidth,
                  align: "left",
                }
              );
            } else {
              this.fontSize(9);
              this.text(element, startX + i * columnContainerWidth, startY, {
                width: columnWidth,
                align: "left",
              });
            }
          });
        }
        if (i === 1) {
          this.fontSize(10);
          var Arr = cell.split("\n");

          // console.log(Arr.length);
          if (Arr.length === 2) {
            correction = 12;
          } else {
            correction = 0;
          }

          Arr.forEach((element) => {
            this.text(element, startX + i * columnContainerWidth, startY, {
              width: columnWidth + 100,
              align: "left",
              underline: false,
            });
            startY = this.y;

            if (element.length) {
              this.moveTo(this.x, this.y)
                .lineTo(this.x + 230, this.y)
                .lineWidth(0.5)
                .opacity(0.7)
                .stroke()
                .opacity(1); // Reset opacity after drawing the line

              this.moveTo(484, this.y)
                .lineTo(535, this.y)
                .lineWidth(0.5)
                .opacity(0.7)
                .stroke()
                .opacity(1); // Reset opacity after drawing the line
            }
          });
        }
      });
      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY) + correction;
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

// Radna lista, PDFDocument

class PDFDocumentWithTablesWorkList extends PDFDocument {
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
          width: columnWidth,
          align: "left",
        });
      }
      if (i === 1) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth + 100,
          align: "left",
        });
      }
      if (i === 2) {
        this.text(header, startX + 100 + i * columnContainerWidth, startY, {
          width: columnWidth - 100,
          align: "left",
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
      var pageAdded = false;
      var correction = 0;
      // Switch to next page if we cannot go any further because the space is ove
      // For safety, consider 3 rows margin instead of just one
      if (startY + 3 * rowHeight < maxY) {
        startY = rowBottomY + rowSpacing;
      } else {
        this.addPage();
        pageAdded = true;
      }
      // Allow the user to override style for rows
      prepareRow(row, i);
      // Print all cells of the current row
      row.forEach((cell, i) => {
        if (i === 0) {
          var Niz = cell.split("\n");

          Niz.forEach((element) => {
            if (element.includes("Godište:")) {
              this.fontSize(8);
              this.text(
                element,
                startX + i * columnContainerWidth,
                startY + 12,
                {
                  width: columnWidth,
                  align: "left",
                }
              );
            } else if (element.includes("Redni broj pacijenta:")) {
              this.fontSize(8);
              this.text(
                element,
                startX + i * columnContainerWidth,
                startY + 22,
                {
                  width: columnWidth,
                  align: "left",
                }
              );
            } else {
              this.fontSize(9);
              this.text(element, startX + i * columnContainerWidth, startY, {
                width: columnWidth,
                align: "left",
              });
            }
          });
        }
        if (i === 1) {
          this.fontSize(10);
          var Arr = cell.split("\n");

          // console.log(Arr.length);
          if (Arr.length === 2) {
            correction = 12;
          } else {
            correction = 0;
          }

          Arr.forEach((element) => {
            if (element.includes("Uzorak: ")) {
              // console.log(element)

              this.font("PTSansBold", config.nalaz_ptsansbold);

              this.text(element, startX + i * columnContainerWidth, startY, {
                width: columnWidth + 100,
                align: "left",
                underline: false,
              });
            } else {
              this.font("PTSansRegular", config.nalaz_ptsansregular);

              this.text(element, startX + i * columnContainerWidth, startY, {
                width: columnWidth + 100,
                align: "left",
                underline: false,
              });
            }

            startY = this.y;

            if (element.length) {
              this.moveTo(this.x, this.y)
                .lineTo(this.x + 230, this.y)
                .lineWidth(0.5)
                .opacity(0.7)
                .stroke()
                .opacity(1); // Reset opacity after drawing the line

              this.moveTo(484, this.y)
                .lineTo(535, this.y)
                .lineWidth(0.5)
                .opacity(0.7)
                .stroke()
                .opacity(1); // Reset opacity after drawing the line
            }
          });
        }
      });
      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY) + correction;
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

// Radna lista, Controller

reportController.WorkList = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    // console.log("Radna lista, Controller")

    var range = req.body.range.split("do");
    if (range.length === 2) {
      to = range[1].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[1].trim() + "T00:00:00";
      from = new Date(from + "Z");
    } else {
      to = range[0].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    }

    var tmpTime = "";
    if (req.body.range.length > 20) {
      tmpTime =
        /*  req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4) +
        " do " + */
        req.body.range.slice(22, 24) +
        "." +
        req.body.range.slice(19, 21) +
        "." +
        req.body.range.slice(14, 18);
    } else {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4);
    }

    var uslov = {};

    uslov = {
      created_at: {
        $gt: from,
        $lt: to,
      },
      site: mongoose.Types.ObjectId(req.body.izbor._id),
    };

    // console.log(uslov)

    Samples.find(uslov)
      .populate("patient site tests.labassay")
      .exec(function (err, samples) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (samples.length) {
            const doc = new PDFDocumentWithTablesWorkList({
              bufferPages: true,
            });

            doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
            doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
            doc
              .font("PTSansRegular")
              .fontSize(16)
              .fillColor("#black")
              .text("Radna lista", 70, 50, {
                align: "left",
              });

            doc.moveDown();

            var headers = ["Pacijent", "Analize", "Check"];
            var rows = [];
            var linerow = [];

            let pids = [];

            samples = samples.sort(function (a, b) {
              return a.pid.localeCompare(b.pid, undefined, {
                numeric: true,
                sensitivity: "base",
              });
            });

            if (req.body.high == "" || isNaN(req.body.high)) {
              req.body.high = samples[samples.length - 1].pid;
            }

            if (req.body.low == "" || isNaN(req.body.low)) {
              req.body.low = samples[0].pid;
            }

            samples.forEach((element) => {
              if (
                parseInt(element.pid) >= parseInt(req.body.low) &&
                parseInt(element.pid) <= parseInt(req.body.high)
              ) {
                pids.push(element.pid);
              }
            });

            let uniquePids = [...new Set(pids)];

            var Obj = [];
            var data = {};

            uniquePids.forEach((pid) => {
              data = {};
              var Samples = [];

              data.pid = pid;

              samples.forEach((sample) => {
                if (sample.pid === pid) {
                  Samples.push(sample);
                }
              });

              Samples = Samples.sort(function (a, b) {
                return a.id.localeCompare(b.id, undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              });

              data.samples = Samples;

              Obj.push(data);
            });

            Obj.forEach((objekat) => {
              // console.log(objekat);

              var godiste = objekat.samples[0].patient.jmbg.substring(4, 7);
              switch (godiste[0]) {
                case "9":
                  godiste = "1" + godiste + ".";
                  break;
                case "0":
                  godiste = "2" + godiste + ".";
                  break;
                default:
                  break;
              }

              linerow = [];
              analize = "";

              if (godiste == "1920.") {
                var ime =
                  objekat.samples[0].patient.ime.trim() +
                  " " +
                  objekat.samples[0].patient.prezime.trim() +
                  "\n" +
                  "Godište: Nema podataka." +
                  "\n" +
                  "Redni broj pacijenta: " +
                  objekat.pid +
                  "\n";
              } else {
                var ime =
                  objekat.samples[0].patient.ime.trim() +
                  " " +
                  objekat.samples[0].patient.prezime.trim() +
                  "\n" +
                  "Godište: " +
                  godiste +
                  "\n" +
                  "Redni broj pacijenta: " +
                  objekat.pid +
                  "\n";
              }

              linerow.push(ime);

              objekat.samples.forEach((sekc) => {
                analize += "Uzorak: " + sekc.id.trim() + "\n";

                sekc.tests.forEach((test) => {
                  analize += test.labassay.analit.trim() + "\n";
                });
              });

              linerow.push(analize);

              rows.push(linerow);

              // console.log(linerow);

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

              if (analize.split("\n").length === 2) {
                doc.moveDown();
              } else {
              }

              rows = [];

              doc.moveDown();
            });

            const range = doc.bufferedPageRange();

            for (let i = range.start; i < range.start + range.count; i++) {
              doc.switchToPage(i);
              doc
                .font("PTSansRegular")
                .fontSize(13)
                .fillColor("#7B8186")
                .text(tmpTime, 70, 25);
              doc
                .font("PTSansRegular")
                .fontSize(8)
                .fillColor("#black")
                .text(
                  `Stranica ${i + 1} od ${range.count}`,
                  doc.page.width / 2 - 25,
                  doc.page.height - 30,
                  { lineBreak: false }
                );
            }
            doc.end();
            doc.pipe(
              fs
                .createWriteStream(
                  config.report_path +
                    "worklists/" +
                    req.body.timestamp +
                    ".pdf"
                )
                .on("finish", function () {
                  res.json({
                    success: true,
                    message: "Izvještaj uspjesno kreiran",
                    id: req.body.range,
                    Obj: Obj,
                  });
                })
            );
          } else {
            res.json({
              success: true,
              message: "Nema dostupnih podataka.",
              id: req.body.range,
            });
          }
        }
      });
  }
};

// Pacijenti po lokaciji, Controller

reportController.PPoLokaciji = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var range = req.body.range.split("do");
    if (range.length === 2) {
      to = range[1].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    } else {
      to = range[0].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    }

    var tmpTime = "";
    if (req.body.range.length > 20) {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4) +
        " do " +
        req.body.range.slice(22, 24) +
        "." +
        req.body.range.slice(19, 21) +
        "." +
        req.body.range.slice(14, 18);
    } else {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4);
    }

    var uslov = {};

    uslov = {
      created_at: {
        $gt: from,
        $lt: to,
      },
      lokacija: mongoose.Types.ObjectId(req.body.lokacija._id),
      status: true,
    };

    Nalazi.find(uslov)
      .populate("patient site lokacija")
      .exec(function (err, nalazi) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (nalazi.length) {
            const doc = new PDFDocumentWithTablesPPoLokaciji({
              bufferPages: true,
            });

            doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
            doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
            doc
              .font("PTSansRegular")
              .fontSize(16)
              .fillColor("#black")
              .text("Pošiljatelj: " + req.body.lokacija.lokacija, 70, 50, {
                align: "left",
              });

            doc.moveDown();

            var headers = ["Pacijent", "Analiza", "Cijena"];
            var rows = [];
            var linerow = [];

            nalazi.forEach((nalaz) => {
              var tmp_time = new Date(
                new Date(nalaz.created_at).getTime() -
                  new Date(nalaz.created_at).getTimezoneOffset() * 60000
              ).toISOString();

              var akcija =
                JSON.stringify(nalaz.created_at).slice(9, 11) +
                "." +
                JSON.stringify(nalaz.created_at).slice(6, 8) +
                "." +
                JSON.stringify(nalaz.created_at).slice(1, 5);
              var time = JSON.stringify(tmp_time).substring(12, 17);

              // console.log(akcija);
              // console.log(time);

              var godiste = nalaz.patient.jmbg.substring(4, 7);
              switch (godiste[0]) {
                case "9":
                  godiste = "1" + godiste + ".";
                  break;
                case "0":
                  godiste = "2" + godiste + ".";
                  break;
                default:
                  break;
              }

              linerow = [];
              analize = "";

              if (godiste == "1920.") {
                var ime =
                  nalaz.patient.ime.trim() +
                  " " +
                  nalaz.patient.prezime.trim() +
                  "\n" +
                  "Godište: Nema podataka." +
                  "\n" +
                  "Nalaz izdan: " +
                  akcija +
                  ". godine";
              } else {
                var ime =
                  nalaz.patient.ime.trim() +
                  " " +
                  nalaz.patient.prezime.trim() +
                  "\n" +
                  "Godište: " +
                  godiste +
                  "\n" +
                  "Nalaz izdan: " +
                  akcija +
                  ". godine";
              }

              linerow.push(ime);

              nalaz.rows.forEach((sekc) => {
                sekc.forEach((test) => {
                  if (test.hasOwnProperty("multi")) {
                    if (test.test.includes("[")) {
                      analize += test.test.substring(4).trim() + "\n";
                    } else {
                      analize += test.test.trim() + "\n";
                    }
                  } else {
                    if (test.rezultat[0].includes("[")) {
                      analize += test.rezultat[0].substring(4).trim() + "\n";
                    } else {
                      analize += test.rezultat[0].trim() + "\n";
                    }
                  }
                });
              });

              linerow.push(analize);

              rows.push(linerow);

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

              if (analize.split("\n").length === 2) {
                doc.moveDown();
              } else {
              }

              rows = [];

              doc.moveDown();
            });
            const range = doc.bufferedPageRange();

            for (let i = range.start; i < range.start + range.count; i++) {
              doc.switchToPage(i);
              doc
                .font("PTSansRegular")
                .fontSize(13)
                .fillColor("#7B8186")
                .text(tmpTime, 70, 25);
              doc
                .font("PTSansRegular")
                .fontSize(8)
                .fillColor("#black")
                .text(
                  `Stranica ${i + 1} od ${range.count}`,
                  doc.page.width / 2 - 25,
                  doc.page.height - 30,
                  { lineBreak: false }
                );
            }
            doc.end();
            doc.pipe(
              fs
                .createWriteStream(
                  config.report_path +
                    "ppolokaciji/" +
                    req.body.timestamp +
                    ".pdf"
                )
                .on("finish", function () {
                  res.json({
                    success: true,
                    message: "Izvještaj uspjesno kreiran",
                    id: req.body.range,
                  });
                })
            );
          } else {
            res.json({
              success: true,
              message: "Nema dostupnih podataka.",
              id: req.body.range,
            });
          }
        }
      });
  }
};
reportController.TATpopacijentu = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var range = req.body.range.split("do");
    if (range.length === 2) {
      to = range[1].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    } else {
      to = range[0].trim() + "T21:59:59";
      to = new Date(to + "Z");
      from = range[0].trim() + "T00:00:00";
      from = new Date(from + "Z");
    }

    var tmpTime = "";
    if (req.body.range.length > 20) {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4) +
        " do " +
        req.body.range.slice(22, 24) +
        "." +
        req.body.range.slice(19, 21) +
        "." +
        req.body.range.slice(14, 18);
    } else {
      tmpTime =
        req.body.range.slice(8, 10) +
        "." +
        req.body.range.slice(5, 7) +
        "." +
        req.body.range.slice(0, 4);
    }

    var uslov = {};

    if (req.body.izbor.naziv === "Kompletan izvještaj") {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
      };
    } else {
      uslov = {
        created_at: {
          $gt: from,
          $lt: to,
        },
        site: mongoose.Types.ObjectId(req.body.izbor._id),
      };
    }
    console.log("uslov:");
    console.log(uslov);

    Nalazi.find(uslov)
      .populate("patient site")
      .exec(function (err, nalazi) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (nalazi.length) {
            const doc = new PDFDocumentWithTablesFinansijski({
              layout: "landscape",
              bufferPages: true,
            });

            doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
            doc.registerFont("PTSansBold", config.nalaz_ptsansbold);

            if (tmpTime.length > 15) {
              doc
                .font("PTSansRegular")
                .fontSize(18)
                .fillColor("#black")
                .text("TAT po pacijentu: " + tmpTime, 0, 50, {
                  align: "center",
                });
            } else {
              doc
                .font("PTSansRegular")
                .fontSize(20)
                .fillColor("#black")
                .text("TAT po pacijentu: " + tmpTime, 0, 50, {
                  align: "center",
                });
            }
            doc.moveDown();
            var pacijenti = [];
            var counter = 0;
            var difff = 0;
            console.log("broj nalaza:" + nalazi.length);
            nalazi.forEach((nalaz) => {
              if (nalaz.location === "/" && nalaz.status) {
                counter++;
                difff =
                  Math.floor(new Date(nalaz.created_at).getTime() / 60000) -
                  Math.floor(nalaz.timestamp / 60000);
                pacijenti.push({
                  rank: counter,
                  imeip: nalaz.patient.ime + " " + nalaz.patient.prezime,
                  tat: difff,
                });
              }
            });

            pacijenti.sort(function (a, b) {
              return a.rank == b.rank ? 0 : +(a.rank > b.rank) || -1;
            });
            // console.log(mjesta);

            var headers = ["Rank", "Ime i prezime", "TAT(min)"];
            var rows = [];
            var linerow = [];
            var total = 0;
            pacijenti.forEach((element) => {
              linerow = [];
              linerow.push(element.rank);
              linerow.push(element.imeip);
              linerow.push(element.tat);
              total += element.tat;
              rows.push(linerow);
              if (element.rank === pacijenti.length) {
                linerow = [];
                linerow.push("-");
                linerow.push("Prosječan TAT");
                linerow.push((total / pacijenti.length).toFixed());
                rows.push(linerow);
              }
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

            const range = doc.bufferedPageRange();

            for (let i = range.start; i < range.start + range.count; i++) {
              doc.switchToPage(i);
              doc
                .font("PTSansRegular")
                .fontSize(13)
                .fillColor("#7B8186")
                .text(req.body.izbor.naziv, 70, 25);
              doc
                .font("PTSansRegular")
                .fontSize(8)
                .fillColor("#black")
                .text(
                  `Stranica ${i + 1} od ${range.count}`,
                  doc.page.width / 2 - 25,
                  doc.page.height - 30,
                  { lineBreak: false }
                );
            }
            doc.end();
            doc.pipe(
              fs
                .createWriteStream(
                  config.report_path +
                    "ppomjestu/" +
                    req.body.timestamp +
                    ".pdf"
                )
                .on("finish", function () {
                  res.json({
                    success: true,
                    message: "Izvještaj uspješno kreiran",
                    id: req.body.range,
                  });
                })
            );
          } else {
            res.json({
              success: true,
              message: "Nema dostupnih podataka.",
              id: req.body.range,
            });
          }
        }
      });
  }
};
module.exports = reportController;
