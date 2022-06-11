const barcode = require("bwip-js");
const path = require("path");
const config = require("../config/index");

var mongoose = require("mongoose");
var tipAparata = require("../models/Postavke");
var appDir = path.dirname(require.main.filename);
var fs = require("fs");
var base64Img = require("base64-img");
var tipAparata = mongoose.model("tipAparata");
var tehnologijaAparata = mongoose.model("tehnologijaAparata");
var tipUzorka = mongoose.model("tipUzorka");
var Lokacija = mongoose.model("Lokacija");
var Doktor = mongoose.model("Doktor");
var Sekcija = mongoose.model("Sekcija");
var grupaTesta = mongoose.model("grupaTesta");
var Analyser = mongoose.model("Analyser");
var ReferentneGrupe = mongoose.model("ReferentneGrupe");
var Jedinice = mongoose.model("Jedinice");
var Patients = mongoose.model("Patients");
var Samples = mongoose.model("Samples");
var Results = mongoose.model("Results");

var Kontrole = require("../models/Kontrole");
var Kontrole = mongoose.model("Kontrole");

var Kreference = require("../models/Kontrole");
var Kreference = mongoose.model("Kreference");

var LabAssays = require("../models/Postavke");
var LabAssays = mongoose.model("LabAssays");

var AnaAssays = require("../models/Postavke");
var AnaAssays = mongoose.model("AnaAssays");

var flatpickr = require("../funkcije/shared/flatpickr");
var _ = require("lodash");
var control_template = require("./report_functions/control_template");

var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const HummusRecipe = require("hummus-recipe");

PDFDocument = require("pdfkit");

var kontroleController = {};

// KontroleController.js

// New Code

// SAVE
function barcodefn(text) {
  barcode.toBuffer(
    {
      bcid: "code128", // Barcode type
      text: text, // Text to encode
      scaleX: 2, // 3x scaling factor
      scaleY: 3, // 3x scaling factor
      height: 14, // Bar height, in millimeters
      includetext: true, // Show human-readable text
      textxalign: "center", // Always good to set this
      paddingheight: 10,
      paddingwidth: 10,
      backgroundcolor: "FFFFFF",
    },
    function (err, png) {
      if (err) {
      } else {
        var file = config.controlsample_path + text + ".png";
        fs.writeFile(
          file,
          png.toString("base64"),
          {
            encoding: "base64",
          },
          function (err) {
            if (err) {
              console.log(err);
            } else {
              // console.log("Barcode uspješno sačuvan.");
            }
          }
        );
      }
    }
  );
}

kontroleController.KontroleSave = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    // Query

    var d = new Date();
    var mjesec = d.getMonth() + 1;
    if (mjesec < 10) {
      mjesec = "0" + mjesec;
    }
    var dan = d.getUTCDate();
    if (dan < 10) {
      dan = "0" + dan;
    }
    var god = d.getFullYear().toString();
    var datum = god.substring(3, 4) + mjesec + dan;
    var newSample = {};
    var newsamplecounter = 0;

    ControlSamples.find({
      id: new RegExp(
        "Q" + "[0-9]{3}" + req.body.Kontrole[0].kontrola.site.sifra + datum
      ),
    })
      .populate("kontrola")
      .sort({
        created_at: -1,
      })
      .limit(1)
      .exec(function (err, controlsamples) {
        if (controlsamples.length === 0) {
          // console.log("Nema prethodno unesenih uzoraka.");

          req.body.Kontrole.forEach((element) => {
            newsamplecounter++;
            var cntlsmpl = "00" + newsamplecounter;
            newSample.id =
              "Q" + cntlsmpl + req.body.Kontrole[0].kontrola.site.sifra + datum;
            newSample.kontrola =
              req.body.Kontrole[newsamplecounter - 1].kontrola._id;
            newSample.status = "ZAPRIMLJEN";
            newSample.created_by = req.body.decoded.user;
            newSample.site = req.body.Kontrole[0].kontrola.site._id;
            newSample.tests = req.body.Kontrole[newsamplecounter - 1].tests;

            barcodefn(newSample.id);

            var sample = new ControlSamples(newSample);

            sample.save(function (err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err,
                });
              } else {
                // console.log("Kontrola uspješno sačuvana.");
              }
            });

            if (newsamplecounter === req.body.Kontrole.length) {
              res.json({
                success: true,
                message: "Unos uspješno obavljen.",
              });
            }
          });
        } else {
          // console.log("Postoje prethodno uneseni uzorci.");
          var temp = controlsamples[0].id.slice(1, 4);
          //
          newsamplecounter = parseFloat(temp, 10);
          // console.log(newsamplecounter)
          var i = 0;
          req.body.Kontrole.forEach((element) => {
            newsamplecounter++;
            i++;
            var iduz = String(parseFloat(newsamplecounter, 10));
            switch (iduz.length) {
              case 1:
                iduz = "00" + iduz;
                break;
              case 2:
                iduz = "0" + iduz;
                break;
              default:
                iduz = "" + iduz;
            }
            newSample.id =
              "Q" + iduz + req.body.Kontrole[0].kontrola.site.sifra + datum;
            newSample.kontrola = req.body.Kontrole[i - 1].kontrola._id;
            newSample.status = "ZAPRIMLJEN";
            newSample.created_by = req.body.decoded.user;
            newSample.site = req.body.Kontrole[0].kontrola.site._id;
            newSample.tests = req.body.Kontrole[i - 1].tests;

            barcodefn(newSample.id);

            var sample = new ControlSamples(newSample);

            sample.save(function (err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err,
                });
              } else {
                // console.log("Kontrola uspješno sačuvana.");
              }
            });

            if (i === req.body.Kontrole.length) {
              res.json({
                success: true,
                message: "Unos uspješno obavljen.",
              });
            }
          });
        }
      });
  }
};

kontroleController.KontroleGet = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Kontrole.find({})
      .populate({ path: "aparati site" })
      .populate({ path: "analize.labassay", model: LabAssays })
      .exec(function (err, kontrole) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          res.json({
            success: true,
            message: "Kontrole.",
            kontrole: kontrole,
          });
        }
      });
  }
};

kontroleController.KreferenceGet = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Kreference.find({ kontrola: mongoose.Types.ObjectId(req.body.kontrola) })
      .populate({ path: "kontrola aparat site" })
      .exec(function (err, kreference) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          res.json({
            success: true,
            message: "Kontrole References.",
            kreference: kreference,
          });
        }
      });
  }
};

kontroleController.KontroleDefinicijaSave = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var tmp = {
      maker: req.body.maker,
      aparati: req.body.aparati,
      sifra: req.body.sifra,
      multi: req.body.multi,
      naziv: req.body.naziv,
      lot: req.body.lot,
      rok: new Date(req.body.rok + "T00:00:00Z"),
      analize: req.body.analizeFiltered,
      site: mongoose.Types.ObjectId(req.body.site),
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    var kontrola = new Kontrole(tmp);

    // Kreference

    kontrola.save(function (err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        var counter = 0;

        req.body.aparati.forEach((aparat) => {
          var hasControl = false;
          var refs = [];

          // console.log("Aparat: " + aparat);

          req.body.anaFiltered.forEach((assay) => {
            if (
              JSON.stringify(assay.Assay.aparat._id) == JSON.stringify(aparat)
            ) {
              // console.log(assay.Assay.aparat.ime + " / " + assay.Assay.test.naziv);
              hasControl = true;

              var obj = {
                labassay: mongoose.Types.ObjectId(assay.Assay.test._id),
                anaassay: mongoose.Types.ObjectId(assay.Assay.aparat._id),
                refd: "0",
                refg: "0",
                interpretacija: "none",
                jedinica: assay.Assay.test.jedinica,
              };

              refs.push(obj);
            }
          });

          if (!hasControl) {
            // console.log("NEMA KONTROLNIH ANALIZA");
            var obj = {
              labassay: null,
              anaassay: null,
              refd: "",
              refg: "",
              interpretacija: "none",
              jedinica: "",
            };

            refs.push(obj);
          }

          if (hasControl) {
            var Ref = new Kreference({
              kontrola: kontrola._id,
              aparat: mongoose.Types.ObjectId(aparat),
              reference: refs,
              site: mongoose.Types.ObjectId(req.body.site),
              created_at: Date.now(),
              updated_at: Date.now(),
            });

            Ref.save(function (err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err,
                });
              } else {
                counter++;

                if (counter === req.body.aparati.length) {
                  // console.log(counter + " / " + req.body.aparati.length);
                  res.json({
                    success: true,
                    message: "Definicija kontrole sačuvana.",
                    kontrola: kontrola,
                  });
                }
              }
            });
          } else {
            counter++;

            if (counter === req.body.aparati.length) {
              // console.log(counter + " / " + req.body.aparati.length);
              res.json({
                success: true,
                message: "Definicija kontrole sačuvana.",
                kontrola: kontrola,
              });
            }
          }
        });
      }
    });
  }
};

kontroleController.KontroleDefinicijaDelete = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Kontrole.remove(
      {
        _id: mongoose.Types.ObjectId(req.body._id),
      },
      function (err) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          Kreference.remove(
            {
              kontrola: mongoose.Types.ObjectId(req.body._id),
            },
            function (err) {
              if (err) {
                console.log("Greška:", err);
                res.json({
                  success: false,
                  message: err,
                });
              } else {
                res.json({
                  success: true,
                  message: "Kontrola uspješno izbrisana.",
                });
              }
            }
          );
        }
      }
    );
  }
};

kontroleController.KontroleDefinicijaEdit = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Kontrole.findOne({
      _id: req.body.control._id,
    }).exec(function (err, kontrola) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (kontrola) {
          (kontrola.sifra = req.body.control.sifra),
            (kontrola.maker = req.body.control.maker),
            (kontrola.naziv = req.body.control.naziv),
            (kontrola.lot = req.body.control.lot),
            (kontrola.rok = req.body.control.rok),
            (kontrola.updated_by = req.body.decoded.user);
          kontrola.updated_at = Date.now();

          kontrola.save(function (err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: err,
              });
            } else {
              res.json({
                success: true,
                message: "Success.",
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Greška.",
          });
        }
      }
    });
  }
};

kontroleController.KontroleDefinicijaGet = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Kreference.find({
      kontrola: mongoose.Types.ObjectId(req.body.control._id),
    })

      .populate({ path: "aparat" })
      .populate({ path: "reference.labassay", model: LabAssays })

      .exec(function (err, references) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          var Refs = [];
          references.forEach((element) => {
            Refs.push(element);
          });
          res.json({
            success: true,
            message: "Reference.",
            references: Refs,
          });
        }
      });
  }
};

kontroleController.KontroleDefinicijaRef = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Kreference.find({
      kontrola: mongoose.Types.ObjectId(req.body.control._id),
    }).exec(function (err, references) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        var counter = 0;

        references.forEach((element) => {
          Kreference.findOne({
            kontrola: mongoose.Types.ObjectId(req.body.control._id),
            aparat: mongoose.Types.ObjectId(element.aparat),
          }).exec(function (err, kontrola) {
            if (err) {
              console.log("Greška:", err);
            } else {
              if (kontrola) {
                req.body.reference.forEach((ref) => {
                  kontrola.reference.forEach((contr) => {
                    if (
                      JSON.stringify(ref.labassay) ===
                      JSON.stringify(contr.labassay)
                    ) {
                      // console.log(kontrola.aparat + " / " + ref.naziv);
                      contr.refd = ref.refd;
                      contr.refg = ref.refg;
                      contr.jedinica = ref.jedinica;
                      contr.interpretacija = ref.interpretacija;
                    }
                  });
                });

                kontrola.updated_by = req.body.decoded.user;
                kontrola.updated_at = Date.now();

                kontrola.save(function (err) {
                  if (err) {
                    console.log("Greška:", err);
                    res.json({
                      success: false,
                      message: err,
                    });
                  } else {
                    counter++;

                    if (counter === references.length) {
                      res.json({
                        success: true,
                        message: "Success.",
                      });
                    }
                  }
                });
              } else {
                res.json({
                  success: false,
                  message: "Greška.",
                });
              }
            }
          });
        });
      }
    });
  }
};

// Old Code

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

function isLow(data, d, g) {
  if (Number(data) < Number(d)) {
    return true;
  }
  return false;
}

function isHigh(data, d, g) {
  if (Number(data) > Number(g)) {
    return true;
  }
  return false;
}

kontroleController.ListByAnalyser = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Analyser.findOne({
      ime: req.body.aparat,
      site: mongoose.Types.ObjectId(req.body.site),
    }).exec(function (err, aparat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (aparat) {
          Kontrole.find({ aparat: mongoose.Types.ObjectId(aparat._id) }).exec(
            function (err, kontrole) {
              if (err) {
                console.log("Greška:", err);
              } else {
                if (kontrole.length) {
                  res.json({
                    success: true,
                    message: "Lista kontrola za " + req.body.aparat + " aparat",
                    kontrole,
                  });
                } else {
                  res.json({
                    success: true,
                    message:
                      "Lista kontrola za " +
                      req.body.aparat +
                      " aparat je prazna",
                    kontrole,
                  });
                }
              }
            }
          );
        } else {
          res.json({
            success: true,
            message: "Aparat  " + req.body.aparat + " nije pronadjen",
          });
        }
      }
    });
  }
};

kontroleController.ListByTypeandAnalyser = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Analyser.findOne({ ime: req.body.aparat }).exec(function (err, aparat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (aparat) {
          Kontrole.find({
            aparat: mongoose.Types.ObjectId(aparat._id),
            tip: req.body.tip,
          }).exec(function (err, kontrole) {
            if (err) {
              console.log("Greška:", err);
            } else {
              if (kontrole.length) {
                res.json({
                  success: true,
                  message: "Lista kontrola za " + req.body.aparat + " aparat",
                  kontrole,
                });
              } else {
                res.json({
                  success: true,
                  message:
                    "Lista kontrola za " +
                    req.body.aparat +
                    " aparat je prazna",
                  kontrole,
                });
              }
            }
          });
        } else {
          res.json({
            success: true,
            message: "Aparat  " + req.body.aparat + " nije pronadjen",
          });
        }
      }
    });
  }
};

kontroleController.ListTestsByAnalyser = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Analyser.findOne({ ime: req.body.aparat }).exec(function (err, aparat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (aparat) {
          Kontrole.findOne({ ime: req.body.kontrola, tip: req.body.tip })
            .populate("reference.anaassay")
            .exec(function (err, kontrole) {
              if (err) {
                console.log("Greška:", err);
              } else {
                if (kontrole) {
                  var i = 0;
                  kontrole.reference.forEach((element) => {
                    AnaAssays.findOne({ _id: element.anaassay })
                      .populate("test")
                      .exec(function (err, assay) {
                        if (err) {
                          console.log("Greška:", err);
                        } else {
                          element.anaassay = assay;
                          i++;
                          if (i === kontrole.reference.length) {
                            res.json({
                              success: true,
                              message:
                                "Lista kontrola za " +
                                req.body.aparat +
                                " aparat",
                              kontrole,
                            });
                          }
                        }
                      });
                  });
                } else {
                  res.json({
                    success: true,
                    message:
                      "Lista kontrola za " +
                      req.body.aparat +
                      " aparat je prazna",
                    kontrole,
                  });
                }
              }
            });
        } else {
          res.json({
            success: true,
            message: "Aparat  " + req.body.aparat + " nije pronadjen",
          });
        }
      }
    });
  }
};

kontroleController.KontrolaSave = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var d = new Date();
    var mjesec = d.getMonth() + 1;
    if (mjesec < 10) {
      mjesec = "0" + mjesec;
    }
    var dan = d.getUTCDate();
    if (dan < 10) {
      dan = "0" + dan;
    }
    var god = d.getFullYear().toString();
    var datum = god.substring(2, 4) + mjesec + dan;

    ControlSamples.find({ id: new RegExp(datum) })
      .sort({ created_at: -1 })
      .limit(1)
      .exec(function (err, uzorak) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (uzorak.length) {
            var temp = uzorak[0].id.slice(0, 4);
            var iduz = String(parseInt(temp, 10) + 1);
            switch (iduz.length) {
              case 1:
                iduz = "0" + iduz;
                break;
              default:
                iduz = "" + iduz;
            }
            req.body.id = iduz + req.body.aparat.slice(0, 2) + datum;

            barcode.toBuffer(
              {
                bcid: "code128", // Barcode type
                text: req.body.id, // Text to encode
                scaleX: 2, // 3x scaling factor
                scaleY: 3, // 3x scaling factor
                height: 20, // Bar height, in millimeters
                includetext: true, // Show human-readable text
                textxalign: "center", // Always good to set this
                paddingheight: 10,
                backgroundcolor: "FFFFFF",
              },
              function (err, png) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  var file = config.control_path + req.body.id + ".png";
                  fs.writeFile(
                    file,
                    png.toString("base64"),
                    { encoding: "base64" },
                    function (err) {}
                  );
                }
              }
            );
            Kontrole.findOne({ ime: req.body.kontrola, lot: req.body.lot })
              .populate("aparat")
              .exec(function (err, kontrola) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  if (kontrola) {
                    req.body.kontrola = kontrola._id;
                    req.body.aparat = kontrola.aparat._id;
                    var i = 0;
                    var tests = [];
                    req.body.testovi.forEach((element) => {
                      AnaAssays.findOne({
                        _id: mongoose.Types.ObjectId(element.anaassay),
                      })
                        .populate("test")
                        .exec(function (err, assay) {
                          if (err) {
                            console.log("Greška:", err);
                          } else {
                            tests.push({
                              labassay: assay.test._id,
                              anaassay: assay._id,
                              rezultat: [],
                            });
                            i++;
                            if (i === req.body.testovi.length) {
                              req.body.tests = tests;
                              var sample = new ControlSamples(req.body);
                              sample.save(function (err, sample) {
                                if (err) {
                                  console.log("Greška:", err);
                                  res.json({ success: false, message: err });
                                } else {
                                  var data = {};
                                  data.uzorak = sample;
                                  data.link =
                                    config.baseURL +
                                    "images/barcodes/" +
                                    req.body.id +
                                    ".png";
                                  res.json({
                                    success: true,
                                    message: "Uzorak uspješno sačuvan",
                                    data,
                                  });
                                }
                              });
                            }
                          }
                        });
                    });
                  } else {
                    res.json({
                      success: true,
                      message:
                        "Kontrola " + req.body.kontrola + " nije pronadjena",
                    });
                  }
                }
              });
          } else {
            req.body.id = "01" + req.body.aparat.slice(0, 2) + datum;
            barcode.toBuffer(
              {
                bcid: "code128", // Barcode type
                text: req.body.id, // Text to encode
                scaleX: 2, // 3x scaling factor
                scaleY: 3, // 3x scaling factor
                height: 20, // Bar height, in millimeters
                includetext: true, // Show human-readable text
                textxalign: "center", // Always good to set this
                paddingheight: 10,
                backgroundcolor: "FFFFFF",
              },
              function (err, png) {
                if (err) {
                } else {
                  var file = config.control_path + req.body.id + ".png";
                  fs.writeFile(
                    file,
                    png.toString("base64"),
                    { encoding: "base64" },
                    function (err) {}
                  );
                }
              }
            );

            Kontrole.findOne({ ime: req.body.kontrola })
              .populate("aparat")
              .exec(function (err, kontrola) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  if (kontrola) {
                    req.body.kontrola = kontrola._id;
                    req.body.aparat = kontrola.aparat._id;
                    var i = 0;
                    var tests = [];
                    req.body.testovi.forEach((element) => {
                      AnaAssays.findOne({
                        _id: mongoose.Types.ObjectId(element.anaassay),
                      })
                        .populate("test")
                        .exec(function (err, assay) {
                          if (err) {
                            console.log("Greška:", err);
                          } else {
                            tests.push({
                              labassay: assay.test._id,
                              anaassay: assay._id,
                              rezultat: [],
                            });
                            i++;
                            if (i === req.body.testovi.length) {
                              req.body.tests = tests;
                              var sample = new ControlSamples(req.body);
                              sample.save(function (err, sample) {
                                if (err) {
                                  console.log("Greška:", err);
                                  res.json({ success: false, message: err });
                                } else {
                                  var data = {};
                                  data.uzorak = sample;
                                  data.link =
                                    config.baseURL +
                                    "images/barcodes/" +
                                    req.body.id +
                                    ".png";
                                  res.json({
                                    success: true,
                                    message: "Uzorak uspješno sačuvan",
                                    data,
                                  });
                                }
                              });
                            }
                          }
                        });
                    });
                  } else {
                    res.json({
                      success: true,
                      message:
                        "Kontrola " + req.body.kontrola + " nije pronadjena",
                    });
                  }
                }
              });
          }
        }
      });
  }
};

kontroleController.List = function (req, res) {
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

  if (
    req.query.datum != "ZAPRIMLJEN" &&
    req.query.datum != "U OBRADI" &&
    req.query.datum != "REALIZOVAN"
  ) {
    var from = new Date();
    var to = new Date();
    if (req.query.datum === "Svi Rezultati") {
      var doo = new Date();
      var od = new Date();
      od.setFullYear(od.getFullYear() - 1);
      to = doo;
      from = od;
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
    uslov = { created_at: { $gt: from, $lt: to } };

    if (!req.query.filter) {
      req.query.filter = "";
    }
    ControlSamples.find(uslov)
      .populate("kontrola aparat tests.labassay tests.anaassay")
      .exec(function (err, samples) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              uzorci = samples.filter(function (sample) {
                return sample.kontrola.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "id":
              uzorci = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              uzorci = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
          }

          var json = {};
          json.total = uzorci.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "uzorci?sort=" +
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
            "uzorci?sort=" +
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
                uzorci.sort(function (a, b) {
                  return a.kontrola.ime == b.kontrola.ime
                    ? 0
                    : +(a.kontrola.ime > b.kontrola.ime) || -1;
                });
              }
              if (order === "desc") {
                uzorci.sort(function (a, b) {
                  return a.kontrola.ime == b.kontrola.ime
                    ? 0
                    : +(a.kontrola.ime < b.kontrola.ime) || -1;
                });
              }
              break;
            case "id":
              if (order === "asc") {
                uzorci.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                });
              }
              if (order === "desc") {
                uzorci.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id < b.id) || -1;
                });
              }
              break;
            default:
              uzorci.sort(function (a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = uzorci.slice(json.from - 1, json.to);
          var i = 0;
          niz.forEach((uzorak) => {
            var uslov = 0;
            var nacekanju = 0;
            var realizovan = 0;
            var uobradi = 0;

            uzorak.tests.forEach((element) => {
              if (element.status === "ZAPRIMLJEN") {
                nacekanju++;
              }

              if (element.status === "REALIZOVAN") {
                realizovan++;
              }

              if (element.status === "U OBRADI") {
                uobradi++;
              }

              if ((uslov = uzorak.tests.length)) {
                if (nacekanju > 0 && realizovan < 1 && uobradi < 1) {
                  uzorak.status = "ZAPRIMLJEN";
                } else if (nacekanju > 0 && realizovan > 0 && uobradi > 0) {
                  uzorak.status = "U OBRADI";
                } else if (nacekanju < 1 && uobradi < 1) {
                  uzorak.status = "REALIZOVAN";
                } else {
                  uzorak.status = "U OBRADI";
                }
              }
            });
            var link =
              "<button title='Printanje barkoda' class='btn btn-info btn-micro'  id='" +
              config.baseURL +
              "images/barcodes/" +
              uzorak.id +
              ".png'><span id='" +
              config.baseURL +
              "images/barcodes/" +
              uzorak.id +
              ".png' class='fa fa-barcode'></span> Printaj</button>";
            var detalji =
              "<button title='Detaljan pregled kontrole' id='" +
              uzorak._id +
              "' class='btn btn-primary btn-micro'><span id='" +
              uzorak._id +
              "' class='glyphicon glyphicon-search'></span> pregled</button>";
            var izbrisi =
              "<button title='Brisanje zapisa' uzorka' id='" +
              uzorak._id +
              "' class='btn btn-danger btn-micro'><span id='" +
              uzorak._id +
              "' class='fa fa-trash-o'></span> IZBRIŠI</button>";
            json.data.push({
              id: uzorak.id,
              aparat: uzorak.aparat.ime,
              ime: uzorak.kontrola.ime,
              detaljiKontrole: detalji,
              barkod: link,
              izbrisiKontrolu: izbrisi,
              status: uzorak.status,
            });
          });
          res.json(json);
        }
      });
  } else if (req.query.datum === "ZAPRIMLJEN") {
    var from = new Date();
    var to = new Date();

    to = danasnjiDatum + "T23:59:59";
    to = new Date(to + "Z");
    from = danasnjiDatum + "T00:00:00";
    from = new Date(from + "Z");

    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var uslov = {};
    uslov = { created_at: { $gt: from, $lt: to } };

    if (!req.query.filter) {
      req.query.filter = "";
    }
    ControlSamples.find(uslov)
      .populate("kontrola aparat tests.labassay tests.anaassay")
      .exec(function (err, samples) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              uzorci = samples.filter(function (sample) {
                return sample.kontrola.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "id":
              uzorci = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              uzorci = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
          }

          var json = {};
          json.total = uzorci.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "uzorci?sort=" +
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
            "uzorci?sort=" +
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
                uzorci.sort(function (a, b) {
                  return a.kontrola.ime == b.kontrola.ime
                    ? 0
                    : +(a.kontrola.ime > b.kontrola.ime) || -1;
                });
              }
              if (order === "desc") {
                uzorci.sort(function (a, b) {
                  return a.kontrola.ime == b.kontrola.ime
                    ? 0
                    : +(a.kontrola.ime < b.kontrola.ime) || -1;
                });
              }
              break;
            case "id":
              if (order === "asc") {
                uzorci.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                });
              }
              if (order === "desc") {
                uzorci.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id < b.id) || -1;
                });
              }
              break;
            default:
              uzorci.sort(function (a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = uzorci.slice(json.from - 1, json.to);
          var i = 0;
          niz.forEach((uzorak) => {
            var uslov = 0;
            var nacekanju = 0;
            var realizovan = 0;
            var uobradi = 0;

            uzorak.tests.forEach((element) => {
              if (element.status === "ZAPRIMLJEN") {
                nacekanju++;
              }
              if (element.status === "REALIZOVAN") {
                realizovan++;
              }
              if (element.status === "U OBRADI") {
                uobradi++;
              }
              if ((uslov = uzorak.tests.length)) {
                if (nacekanju > 0 && realizovan < 1 && uobradi < 1) {
                  uzorak.status = "ZAPRIMLJEN";
                } else if (nacekanju > 0 && realizovan > 0 && uobradi > 0) {
                  uzorak.status = "U OBRADI";
                } else if (nacekanju < 1 && uobradi < 1) {
                  uzorak.status = "REALIZOVAN";
                } else {
                  uzorak.status = "U OBRADI";
                }
              }
            });
            var link =
              "<button title='Printanje barkoda' class='btn btn-info btn-micro'  id='" +
              config.baseURL +
              "images/barcodes/" +
              uzorak.id +
              ".png'><span id='" +
              config.baseURL +
              "images/barcodes/" +
              uzorak.id +
              ".png' class='fa fa-barcode'></span> Printaj</button>";
            var detalji =
              "<button title='Detaljan pregled kontrole' id='" +
              uzorak._id +
              "' class='btn btn-primary btn-micro'><span id='" +
              uzorak._id +
              "' class='glyphicon glyphicon-search'></span> pregled</button>";
            var izbrisi =
              "<button title='Brisanje zapisa' uzorka' id='" +
              uzorak._id +
              "' class='btn btn-danger btn-micro'><span id='" +
              uzorak._id +
              "' class='fa fa-trash-o'></span> IZBRIŠI</button>";

            if (uzorak.status === "ZAPRIMLJEN") {
              json.data.push({
                id: uzorak.id,
                aparat: uzorak.aparat.ime,
                ime: uzorak.kontrola.ime,
                detaljiKontrole: detalji,
                barkod: link,
                izbrisiKontrolu: izbrisi,
                status: uzorak.status,
              });
            }
          });
          res.json(json);
        }
      });
  } else if (req.query.datum === "U OBRADI") {
    var from = new Date();
    var to = new Date();

    to = danasnjiDatum + "T23:59:59";
    to = new Date(to + "Z");
    from = danasnjiDatum + "T00:00:00";
    from = new Date(from + "Z");

    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();
    var uslov = {};
    uslov = { created_at: { $gt: from, $lt: to } };

    if (!req.query.filter) {
      req.query.filter = "";
    }
    ControlSamples.find(uslov)
      .populate("kontrola aparat tests.labassay tests.anaassay")
      .exec(function (err, samples) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              uzorci = samples.filter(function (sample) {
                return sample.kontrola.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "id":
              uzorci = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              uzorci = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
          }

          var json = {};
          json.total = uzorci.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "uzorci?sort=" +
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
            "uzorci?sort=" +
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
                uzorci.sort(function (a, b) {
                  return a.kontrola.ime == b.kontrola.ime
                    ? 0
                    : +(a.kontrola.ime > b.kontrola.ime) || -1;
                });
              }
              if (order === "desc") {
                uzorci.sort(function (a, b) {
                  return a.kontrola.ime == b.kontrola.ime
                    ? 0
                    : +(a.kontrola.ime < b.kontrola.ime) || -1;
                });
              }
              break;
            case "id":
              if (order === "asc") {
                uzorci.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                });
              }
              if (order === "desc") {
                uzorci.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id < b.id) || -1;
                });
              }
              break;
            default:
              uzorci.sort(function (a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = uzorci.slice(json.from - 1, json.to);
          var i = 0;
          niz.forEach((uzorak) => {
            var uslov = 0;
            var nacekanju = 0;
            var realizovan = 0;
            var uobradi = 0;

            uzorak.tests.forEach((element) => {
              if (element.status === "ZAPRIMLJEN") {
                nacekanju++;
              }
              if (element.status === "REALIZOVAN") {
                realizovan++;
              }
              if (element.status === "U OBRADI") {
                uobradi++;
              }

              if ((uslov = uzorak.tests.length)) {
                if (nacekanju > 0 && realizovan < 1 && uobradi < 1) {
                  uzorak.status = "ZAPRIMLJEN";
                } else if (nacekanju > 0 && realizovan > 0 && uobradi > 0) {
                  uzorak.status = "U OBRADI";
                } else if (nacekanju < 1 && uobradi < 1) {
                  uzorak.status = "REALIZOVAN";
                } else {
                  uzorak.status = "U OBRADI";
                }
              }
            });

            var link =
              "<button title='Printanje barkoda' class='btn btn-info btn-micro'  id='" +
              config.baseURL +
              "images/barcodes/" +
              uzorak.id +
              ".png'><span id='" +
              config.baseURL +
              "images/barcodes/" +
              uzorak.id +
              ".png' class='fa fa-barcode'></span> Printaj</button>";
            var detalji =
              "<button title='Detaljan pregled kontrole' id='" +
              uzorak._id +
              "' class='btn btn-primary btn-micro'><span id='" +
              uzorak._id +
              "' class='glyphicon glyphicon-search'></span> pregled</button>";
            var izbrisi =
              "<button title='Brisanje zapisa' uzorka' id='" +
              uzorak._id +
              "' class='btn btn-danger btn-micro'><span id='" +
              uzorak._id +
              "' class='fa fa-trash-o'></span> IZBRIŠI</button>";
            if (uzorak.status === "U OBRADI") {
              json.data.push({
                id: uzorak.id,
                aparat: uzorak.aparat.ime,
                ime: uzorak.kontrola.ime,
                detaljiKontrole: detalji,
                barkod: link,
                izbrisiKontrolu: izbrisi,
                status: uzorak.status,
              });
            }
          });
          res.json(json);
        }
      });
  } else if (req.query.datum === "REALIZOVAN") {
    var from = new Date();
    var to = new Date();

    to = danasnjiDatum + "T23:59:59";
    to = new Date(to + "Z");
    from = danasnjiDatum + "T00:00:00";
    from = new Date(from + "Z");

    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();
    var uslov = {};
    uslov = { created_at: { $gt: from, $lt: to } };

    if (!req.query.filter) {
      req.query.filter = "";
    }
    ControlSamples.find(uslov)
      .populate("kontrola aparat tests.labassay tests.anaassay")
      .exec(function (err, samples) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              uzorci = samples.filter(function (sample) {
                return sample.kontrola.ime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "id":
              uzorci = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              uzorci = samples.filter(function (sample) {
                return sample.id
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
          }

          var json = {};
          json.total = uzorci.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "uzorci?sort=" +
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
            "uzorci?sort=" +
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
                uzorci.sort(function (a, b) {
                  return a.kontrola.ime == b.kontrola.ime
                    ? 0
                    : +(a.kontrola.ime > b.kontrola.ime) || -1;
                });
              }
              if (order === "desc") {
                uzorci.sort(function (a, b) {
                  return a.kontrola.ime == b.kontrola.ime
                    ? 0
                    : +(a.kontrola.ime < b.kontrola.ime) || -1;
                });
              }
              break;
            case "id":
              if (order === "asc") {
                uzorci.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id > b.id) || -1;
                });
              }
              if (order === "desc") {
                uzorci.sort(function (a, b) {
                  return a.id == b.id ? 0 : +(a.id < b.id) || -1;
                });
              }
              break;
            default:
              uzorci.sort(function (a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = uzorci.slice(json.from - 1, json.to);
          var i = 0;
          niz.forEach((uzorak) => {
            var uslov = 0;
            var nacekanju = 0;
            var realizovan = 0;
            var uobradi = 0;

            uzorak.tests.forEach((element) => {
              if (element.status === "ZAPRIMLJEN") {
                nacekanju++;
              }
              if (element.status === "REALIZOVAN") {
                realizovan++;
              }
              if (element.status === "U OBRADI") {
                uobradi++;
              }

              if ((uslov = uzorak.tests.length)) {
                if (nacekanju > 0 && realizovan < 1 && uobradi < 1) {
                  uzorak.status = "ZAPRIMLJEN";
                } else if (nacekanju > 0 && realizovan > 0 && uobradi > 0) {
                  uzorak.status = "U OBRADI";
                } else if (nacekanju < 1 && uobradi < 1) {
                  uzorak.status = "REALIZOVAN";
                } else {
                  uzorak.status = "U OBRADI";
                }
              }
            });
            var link =
              "<button title='Printanje barkoda' class='btn btn-info btn-micro'  id='" +
              config.baseURL +
              "images/barcodes/" +
              uzorak.id +
              ".png'><span id='" +
              config.baseURL +
              "images/barcodes/" +
              uzorak.id +
              ".png' class='fa fa-barcode'></span> Printaj</button>";
            var detalji =
              "<button title='Detaljan pregled kontrole' id='" +
              uzorak._id +
              "' class='btn btn-primary btn-micro'><span id='" +
              uzorak._id +
              "' class='glyphicon glyphicon-search'></span> pregled</button>";
            var izbrisi =
              "<button title='Brisanje zapisa' uzorka' id='" +
              uzorak._id +
              "' class='btn btn-danger btn-micro'><span id='" +
              uzorak._id +
              "' class='fa fa-trash-o'></span> IZBRIŠI</button>";

            if (uzorak.status === "REALIZOVAN") {
              json.data.push({
                id: uzorak.id,
                aparat: uzorak.aparat.ime,
                ime: uzorak.kontrola.ime,
                detaljiKontrole: detalji,
                barkod: link,
                izbrisiKontrolu: izbrisi,
                status: uzorak.status,
              });
            }
          });
          res.json(json);
        }
      });
  }
};

kontroleController.KontrolaDelete = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Kontrole.findOne({ _id: req.body._id }).exec(function (err, kontrola) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (!kontrola) {
          res.json({
            success: false,
            message: "Ne pronadjena kontrola za brisanje",
          });
        } else {
          Kontrole.remove({ _id: req.body._id }, function (err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: "Ne mogu izbrisati kontrolu",
              });
            } else {
              res.json({
                success: true,
                message: "kontrola izbrisana",
                kontrola,
              });
            }
          });
        }
      }
    });
  }
};

kontroleController.KontrolaPregledDelete = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({ _id: req.body._id }).exec(function (
      err,
      kontrola
    ) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (!kontrola) {
          res.json({
            success: false,
            message: "Ne pronadjena kontrola za brisanje",
          });
        } else {
          ControlSamples.remove({ _id: req.body._id }, function (err) {
            if (err) {
              console.log("Greška:", err);
              res.json({
                success: false,
                message: "Ne mogu izbrisati kontrolu",
              });
            } else {
              res.json({
                success: true,
                message: "kontrola izbrisana",
                kontrola,
              });
            }
          });
        }
      }
    });
  }
};

kontroleController.KontrolaLevey = function (req, res) {
  var pocetak = "";
  var kraj = "";
  var inputYear = req.body.godina;
  var inputMjesec = req.body.mjesec;
  var inputDan = req.body.dan;

  switch (inputMjesec) {
    case "JANUAR":
      inputMjesec = "01";
      break;
    case "FEBRUAR":
      inputMjesec = "02";
      break;
    case "MART":
      inputMjesec = "03";
      break;
    case "APRIL":
      inputMjesec = "04";
      break;
    case "MAJ":
      inputMjesec = "05";
      break;
    case "JUNI":
      inputMjesec = "06";
      break;
    case "JULI":
      inputMjesec = "07";
      break;
    case "AVGUST":
      inputMjesec = "08";
      break;
    case "SEPTEMBAR":
      inputMjesec = "09";
      break;
    case "OKTOBAR":
      inputMjesec = "10";
      break;
    case "NOVEMBAR":
      inputMjesec = "11";
      break;
    case "DECEMBAR":
      inputMjesec = "12";
      break;
  }

  pocetak = inputYear + "-" + inputMjesec + "-" + "01" + "T00:00:00";
  kraj = inputYear + "-" + inputMjesec + "-" + inputDan + "T23:59:59";

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
  var datum = god + "-" + mjesec + "-" + dan;
  to = datum + "T23:59:59";
  to = new Date(to + "Z");

  var mj = d.getMonth();
  if (mj < 10) {
    mj = "0" + mj;
  }
  var datum1 = god + "-" + mj + "-" + dan;
  from = datum1 + "T00:00:00";
  from = new Date(from + "Z");

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.find({ created_at: { $gt: pocetak, $lt: kraj } })
      .populate("aparat kontrola tests.labassay tests.anaassay")
      .exec(function (err, samples) {
        if (err) {
          console.log("Greška:", err);
        } else {
          var tests = [];
          if (samples.length) {
            samples.forEach((sample) => {
              if (sample.kontrola.lot === req.body.lot) {
                sample.tests.forEach((test) => {
                  if (
                    test.anaassay._id.equals(
                      mongoose.Types.ObjectId(req.body.anaassay)
                    )
                  ) {
                    tests.push(sample);
                  }
                });
              }
            });
            res.json({ success: true, message: "BubbleChart data", tests });
          } else {
            res.json({ success: true, message: "No data found", tests });
          }
        }
      });
  }
};

kontroleController.KontrolaLotovi = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Kontrole.find({
      "reference.anaassay": mongoose.Types.ObjectId(req.body.anaassay),
    })
      .populate("aparat reference.anaassay")
      .exec(function (err, kontrole) {
        if (err) {
          console.log("Greška:", err);
        } else {
          res.json({ success: true, message: "Lotovi", kontrole });
        }
      });
  }
};

kontroleController.Show = function (req, res) {
  var appRoot = process.cwd();
  var path = config.control_path + req.params.id + ".png";
  var base64 = base64Img.base64Sync(path);

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    var headers = [
      "Test",
      "Rezultat",
      "Upozorenje",
      "Jedinica",
      "Referentni interval",
    ];
    var rows = [];

    ControlSamples.findOne({ id: req.params.id })
      .populate("aparat site kontrola tests.anaassay tests.labassay")
      .exec(function (err, kontrola) {
        if (err) {
          console.log("Greška:", err);
        } else {
          kontrola.tests.forEach((element) => {
            var red = [];
            var refd = "";
            var refg = "";
            var unit = "";

            kontrola.kontrola.reference.forEach((ref) => {
              if (
                JSON.stringify(ref.anaassay) ===
                JSON.stringify(element.anaassay._id)
              ) {
                refd = ref.refd;
                refg = ref.refg;
                unit = ref.jedinica;
              }
            });

            red.push(element.labassay.naziv); // Test

            if (element.rezultat.length) {
              // Rezultat
              red.push(
                element.rezultat[element.rezultat.length - 1].rezultat_f
              );
            } else {
              red.push("NaN");
            }

            if (element.rezultat.length) {
              // Upozorenje
              if (
                isHigh(
                  element.rezultat[element.rezultat.length - 1].rezultat_f,
                  refd,
                  refg
                )
              ) {
                red.push("H");
              } else if (
                isLow(
                  element.rezultat[element.rezultat.length - 1].rezultat_f,
                  refd,
                  refg
                )
              ) {
                red.push("L");
              } else {
                red.push(" ");
              }
            } else {
              red.push(" ");
            }

            if (element.rezultat.length) {
              // Jedinica
              red.push(
                element.rezultat[element.rezultat.length - 1].jedinice_f
              );
            } else {
              red.push(unit);
            }

            red.push(refd + " - " + refg); // Referentni interval

            rows.push(red); // Final
          });

          var datumKreiranja = kontrola.created_at.toString();

          var napomena = req.body.napomena;

          if (kontrola.tests.length > 1) {
            var naslov = "Rezultati";
          } else {
            var naslov = "Rezultat";
          }

          const doc = new PDFDocumentWithTables({ bufferPages: true });

          doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
          doc.registerFont("PTSansBold", config.nalaz_ptsansbold);

          doc.image(config.nalaz_logo + kontrola.site.sifra + ".jpg", 67, 45, {
            fit: [150, 57],
            align: "center",
            valign: "center",
          });
          doc.image(
            config.nalaz_footer + kontrola.site.sifra + ".jpg",
            0,
            711,
            {
              fit: [615, 114],
              align: "center",
              valign: "center",
            }
          );

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("Kontrolni uzorak: ", 67, 132);
          doc
            .font("PTSansBold")
            .fontSize(14)
            .text(" " + kontrola.id, 157, 130);
          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("Tip kontrole:", 67, 164)
            .text(kontrola.kontrola.tip, 136, 164)
            .text("Lot broj:", 67, 180)
            .text(kontrola.kontrola.lot, 114, 180)
            .text("Aparat:", 67, 148)
            .text(kontrola.aparat.ime, 108, 148)
            .text("Datum: ", 424, 130)
            .text(
              flatpickr
                .parseDate(datumKreiranja.toString())
                .replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "."),
              474,
              130
            )
            .text("Vrijeme:", 425, 146)
            .text(
              flatpickr.parseTime(datumKreiranja.toString()) + ":00",
              485,
              146
            );

          doc.font("PTSansBold").fontSize(12).text(naslov, 67, 210);
          doc.moveDown(2);

          // Rezultati kontrole
          // TABELA

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

          if (napomena.trim() != "") {
            if (doc.y > 645) {
              doc.moveDown(5);
            }
            doc.moveDown(1);
            doc.fontSize(12).text("Napomena:", 75);
            doc.moveDown(1);
            doc.font("PTSansRegular");
            eachLine = napomena.split("\n");
            for (var i = 0, l = eachLine.length; i < l; i++) {
              doc.text(eachLine[i], {
                width: 465,
                align: "justify",
              });
              if (eachLine[i].length === 0) {
                doc.moveDown(1);
              }
            }
          } else {
            doc.moveDown(1);
          }

          doc.moveDown(1);
          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("______________________________", 390)
            .text("     Potpis ovlaštene osobe");

          const range = doc.bufferedPageRange();

          for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc
              .font("PTSansRegular")
              .fontSize(8)
              .text(
                `Stranica ${i + 1} od ${range.count}`,
                doc.page.width / 2 - 25,
                doc.page.height - 13,
                { lineBreak: false }
              );
          }

          doc.end();

          doc.pipe(
            fs
              .createWriteStream(
                config.kontrole_path + req.body.timestamp + ".pdf"
              )
              .on("finish", function () {
                res.json({
                  success: true,
                  message: "Kontrola uspjesno kreirana.",
                  kontrola,
                  datumKreiranja: datumKreiranja,
                  base64,
                });
              })
          );
        }
      });
  }
};

kontroleController.ManualCreate = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({ id: req.params.id })
      .populate("aparat kontrola tests.anaassay tests.labassay")
      .exec(function (err, kontrola) {
        if (err) {
          console.log("Greška:", err);
        } else {
          kontrola.tests.forEach((element) => {
            if (element._id.equals(mongoose.Types.ObjectId(req.body.id))) {
              if (!element.rezultat.length) {
                var obj = {};
                obj.sn = "manual";
                obj.vrijeme_prijenosa = Date.now();
                obj.vrijeme_rezultata = Date.now();
                obj.dilucija = "";
                obj.module_sn = "manual";
                obj.reagens_lot = "manual";
                obj.reagens_sn = "manual";
                obj.rezultat_f = req.body.result;
                (obj.rezultat_m = []),
                  (obj.jedinice_f = element.labassay.jedinica);
                element.rezultat.push(obj);
                element.status = "REALIZOVAN";
              } else {
                element.rezultat[element.rezultat.length - 1].rezultat_f =
                  req.body.result;
              }
            }
          });
          kontrola.save();
          res.json({ success: true, message: "Kontrola izmjena", kontrola });
        }
      });
  }
};

kontroleController.RezultatUpdate = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({ id: req.params.id })
      .populate("aparat kontrola tests.anaassay tests.labassay")
      .exec(function (err, kontrola) {
        if (err) {
          console.log("Greška:", err);
        } else {
          kontrola.tests.forEach((element) => {
            if (element._id.equals(mongoose.Types.ObjectId(req.body.id))) {
              element.rezultat[element.rezultat.length - 1].rezultat_f =
                req.body.result;
            }
          });
          kontrola.save();
          res.json({ success: true, message: "Kontrola izmjena", kontrola });
        }
      });
  }
};

// Obrada Kontrolnih uzoraka

kontroleController.ControlSampleGet = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      _id: mongoose.Types.ObjectId(req.body.kontrola),
    })

      .populate("kontrola site tests.labassay tests.aparat")

      .exec(function (err, kontrola) {
        if (err) {
          console.log("Greška:", err);
          res.json({
            success: false,
            message: err,
          });
        } else {
          res.json({
            success: true,
            message: "Kontrola.",
            kontrola: kontrola,
          });
        }
      });
  }
};

kontroleController.ControlSampleDelete = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          var Aparati = [];

          rezultat.tests.forEach((test) => {
            Aparati.push(JSON.stringify(test.aparat));
          });

          var uniq = [...new Set(Aparati)];

          if (uniq.length < 2) {
            ControlSamples.remove(
              {
                id: req.body.id,
              },
              function (err) {
                if (err) {
                  console.log("Greška:", err);
                  res.json({
                    success: false,
                    message: err,
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Kontrolni uzorak uspješno izbrisan.",
                    rezultat: null,
                  });
                }
              }
            );
          } else {
            var testovi = [];

            rezultat.tests.forEach((test) => {
              if (
                JSON.stringify(req.body.aparat._id) ===
                JSON.stringify(test.aparat)
              ) {
              } else {
                testovi.push(test);
              }
            });

            rezultat.tests = testovi;

            var zaprimljen = 0;
            var obrada = 0;
            var realizovan = 0;
            var odobren = 0;
            var verificiran = 0;

            rezultat.tests.forEach((test) => {
              switch (test.status) {
                case "ZAPRIMLJEN":
                  zaprimljen++;
                  break;
                case "U OBRADI":
                  obrada++;
                  break;
                case "REALIZOVAN":
                  realizovan++;
                  break;
                case "ODOBREN":
                  odobren++;
                  break;
                case "VERIFICIRAN":
                  verificiran++;
                  break;

                default:
                  break;
              }
            });

            if (verificiran == rezultat.tests.length) {
              rezultat.status = "VERIFICIRAN";
            } else if (odobren == rezultat.tests.length) {
              rezultat.status = "ODOBREN";
            } else if (zaprimljen == rezultat.tests.length) {
              rezultat.status = "ZAPRIMLJEN";
            } else if (realizovan == rezultat.tests.length) {
              rezultat.status = "REALIZOVAN";
            } else {
              rezultat.status = "U OBRADI";
            }

            rezultat.save(function (err, rez) {
              if (err) {
                console.log("Greška:", err);
              } else {
                res.json({
                  success: true,
                  message: "Kontrolni uzorak uspješno izbrisan.",
                  rez,
                });
              }
            });
          }
        } else {
          res.json({
            success: false,
            message: "Kontrolni uzorak nije pronađen.",
          });
        }
      }
    });
  }
};

kontroleController.ControlCommentGet = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, result) {
      if (result) {
        res.json({
          success: true,
          message: "Komentar uspješno dohvaćen.",
          komentar: result.komentar,
        });
      } else {
        res.json({
          success: true,
          message: "Nema pronadjenih rezultata.",
          result: [],
        });
      }
    });
  }
};

kontroleController.ControlCommentSet = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, result) {
      if (result) {
        result.komentar = req.body.komentar;
        result.save();
        res.json({
          success: true,
          message: "Komentar uspješno sačuvan",
          komentar: req.body.komentar,
        });
      } else {
        res.json({
          success: true,
          message: "Nema pronadjenih rezultata",
          result: [],
        });
      }
    });
  }
};

kontroleController.ControlResultsSave = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          rezultat.tests.forEach((test) => {
            req.body.rezultati.forEach((rez) => {
              if (
                JSON.stringify(rez.labassay_id) ===
                JSON.stringify(test.labassay)
              ) {
                test.rezultat[test.rezultat.length - 1].rezultat_f =
                  rez.rezultat;

                if (rez.rezultat.trim() == "") {
                  test.status = "ZAPRIMLJEN";
                } else {
                  test.status = "REALIZOVAN";
                }
              } else {
              }
            });
          });

          var zaprimljen = 0;
          var obrada = 0;
          var realizovan = 0;
          var odobren = 0;
          var verificiran = 0;

          rezultat.tests.forEach((test) => {
            switch (test.status) {
              case "ZAPRIMLJEN":
                zaprimljen++;
                break;
              case "U OBRADI":
                obrada++;
                break;
              case "REALIZOVAN":
                realizovan++;
                break;
              case "ODOBREN":
                odobren++;
                break;
              case "VERIFICIRAN":
                verificiran++;
                break;

              default:
                break;
            }
          });

          if (verificiran == rezultat.tests.length) {
            rezultat.status = "VERIFICIRAN";
          } else if (odobren == rezultat.tests.length) {
            rezultat.status = "ODOBREN";
          } else if (zaprimljen == rezultat.tests.length) {
            rezultat.status = "ZAPRIMLJEN";
          } else if (realizovan == rezultat.tests.length) {
            rezultat.status = "REALIZOVAN";
          } else {
            rezultat.status = "U OBRADI";
          }

          rezultat.save(function (err, rez) {
            if (err) {
              console.log("Greška:", err);
            } else {
              res.json({
                success: true,
                message: "Rezultati uspješno sačuvani.",
                rez,
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Kontrolni uzorak nije pronađen.",
          });
        }
      }
    });
  }
};

kontroleController.ControlRetestEnable = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          var testovi = [];

          rezultat.tests.forEach((test) => {
            if (
              JSON.stringify(req.body.labassay) ===
              JSON.stringify(test.labassay)
            ) {
              test.retest = true;
            } else {
            }
          });

          rezultat.save(function (err, rez) {
            if (err) {
              console.log("Greška:", err);
            } else {
              res.json({
                success: true,
                message: "Rezultati uspješno sačuvani.",
                rez,
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Kontrolni uzorak nije pronađen.",
          });
        }
      }
    });
  }
};

kontroleController.ControlRetestDisable = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          var testovi = [];

          rezultat.tests.forEach((test) => {
            if (
              JSON.stringify(req.body.labassay) ===
              JSON.stringify(test.labassay)
            ) {
              test.retest = false;
            } else {
            }
          });

          rezultat.save(function (err, rez) {
            if (err) {
              console.log("Greška:", err);
            } else {
              res.json({
                success: true,
                message: "Rezultati uspješno sačuvani.",
                rez,
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Kontrolni uzorak nije pronađen.",
          });
        }
      }
    });
  }
};

kontroleController.ControlResultsApprove = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          rezultat.tests.forEach((test) => {
            req.body.rezultati.forEach((rez) => {
              if (
                JSON.stringify(rez.labassay_id) ===
                JSON.stringify(test.labassay)
              ) {
                test.rezultat[test.rezultat.length - 1].rezultat_f =
                  rez.rezultat;

                if (rez.rezultat.trim() == "") {
                  test.status = "ODOBREN";
                  test.retest = false;
                } else {
                  test.status = "ODOBREN";
                  test.retest = false;
                }
              } else {
              }
            });
          });

          var zaprimljen = 0;
          var obrada = 0;
          var realizovan = 0;
          var odobren = 0;
          var verificiran = 0;

          rezultat.tests.forEach((test) => {
            switch (test.status) {
              case "ZAPRIMLJEN":
                zaprimljen++;
                break;
              case "U OBRADI":
                obrada++;
                break;
              case "REALIZOVAN":
                realizovan++;
                break;
              case "ODOBREN":
                odobren++;
                break;
              case "VERIFICIRAN":
                verificiran++;
                break;

              default:
                break;
            }
          });

          if (verificiran == rezultat.tests.length) {
            rezultat.status = "VERIFICIRAN";
          } else if (odobren == rezultat.tests.length) {
            rezultat.status = "ODOBREN";
          } else if (zaprimljen == rezultat.tests.length) {
            rezultat.status = "ZAPRIMLJEN";
          } else if (realizovan == rezultat.tests.length) {
            rezultat.status = "REALIZOVAN";
          } else {
            rezultat.status = "U OBRADI";
          }

          rezultat.save(function (err, rez) {
            if (err) {
              console.log("Greška:", err);
            } else {
              res.json({
                success: true,
                message: "Rezultati uspješno odobreni.",
                rez,
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Kontrolni uzorak nije pronađen.",
          });
        }
      }
    });
  }
};

kontroleController.ControlResultsDisapprove = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          rezultat.tests.forEach((test) => {
            req.body.rezultati.forEach((rez) => {
              if (
                JSON.stringify(rez.labassay_id) ===
                JSON.stringify(test.labassay)
              ) {
                test.rezultat[test.rezultat.length - 1].rezultat_f =
                  rez.rezultat;

                if (rez.rezultat.trim() == "") {
                  test.status = "ZAPRIMLJEN";
                } else {
                  test.status = "REALIZOVAN";
                }
              } else {
              }
            });
          });

          var zaprimljen = 0;
          var obrada = 0;
          var realizovan = 0;
          var odobren = 0;
          var verificiran = 0;

          rezultat.tests.forEach((test) => {
            switch (test.status) {
              case "ZAPRIMLJEN":
                zaprimljen++;
                break;
              case "U OBRADI":
                obrada++;
                break;
              case "REALIZOVAN":
                realizovan++;
                break;
              case "ODOBREN":
                odobren++;
                break;
              case "VERIFICIRAN":
                verificiran++;
                break;

              default:
                break;
            }
          });

          if (verificiran == rezultat.tests.length) {
            rezultat.status = "VERIFICIRAN";
          } else if (odobren == rezultat.tests.length) {
            rezultat.status = "ODOBREN";
          } else if (zaprimljen == rezultat.tests.length) {
            rezultat.status = "ZAPRIMLJEN";
          } else if (realizovan == rezultat.tests.length) {
            rezultat.status = "REALIZOVAN";
          } else {
            rezultat.status = "U OBRADI";
          }

          rezultat.save(function (err, rez) {
            if (err) {
              console.log("Greška:", err);
            } else {
              res.json({
                success: true,
                message: "Rezultati vraćeni u obradu.",
                rez,
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Kontrolni uzorak nije pronađen.",
          });
        }
      }
    });
  }
};

kontroleController.ControlResultsVerify = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          rezultat.tests.forEach((test) => {
            req.body.rezultati.forEach((rez) => {
              if (
                JSON.stringify(rez.labassay_id) ===
                JSON.stringify(test.labassay)
              ) {
                test.status = "VERIFICIRAN";
                test.retest = false;
              } else {
              }
            });
          });

          var zaprimljen = 0;
          var obrada = 0;
          var realizovan = 0;
          var odobren = 0;
          var verificiran = 0;

          rezultat.tests.forEach((test) => {
            switch (test.status) {
              case "ZAPRIMLJEN":
                zaprimljen++;
                break;
              case "U OBRADI":
                obrada++;
                break;
              case "REALIZOVAN":
                realizovan++;
                break;
              case "ODOBREN":
                odobren++;
                break;
              case "VERIFICIRAN":
                verificiran++;
                break;

              default:
                break;
            }
          });

          if (verificiran == rezultat.tests.length) {
            rezultat.status = "VERIFICIRAN";
          } else if (odobren == rezultat.tests.length) {
            rezultat.status = "ODOBREN";
          } else if (zaprimljen == rezultat.tests.length) {
            rezultat.status = "ZAPRIMLJEN";
          } else if (realizovan == rezultat.tests.length) {
            rezultat.status = "REALIZOVAN";
          } else {
            rezultat.status = "U OBRADI";
          }

          rezultat.save(function (err, rez) {
            if (err) {
              console.log("Greška:", err);
            } else {
              ControlNalazi.findOne({
                id: req.body.id,
              })
                .populate("kontrola site")
                .exec(function (err, nalaz) {
                  if (err) {
                    console.log("Greška:", err);
                  } else {
                    if (!nalaz) {
                      //
                    } else {
                      nalaz.aparati.forEach((element) => {
                        if (
                          JSON.stringify(element.aparat) ===
                          JSON.stringify(req.body.aparat._id)
                        ) {
                          element.status = true;
                        } else {
                        }
                      });

                      nalaz.updated_at = Date.now();
                      nalaz.updated_by = req.body.decoded.user;

                      nalaz.save(function (err, report) {
                        if (err) {
                          console.log("Greška:", err);
                          res.json({
                            success: false,
                            message: err,
                          });
                        } else {
                          res.json({
                            success: true,
                            message: "Rezultati uspješno verificirani.",
                            rez,
                          });
                        }
                      });
                    }
                  }
                });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Kontrolni uzorak nije pronađen.",
          });
        }
      }
    });
  }
};

kontroleController.ControlResultsUnverify = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    }).exec(function (err, rezultat) {
      if (err) {
        console.log("Greška:", err);
      } else {
        if (rezultat) {
          rezultat.tests.forEach((test) => {
            req.body.rezultati.forEach((rez) => {
              if (
                JSON.stringify(rez.labassay_id) ===
                JSON.stringify(test.labassay)
              ) {
                test.status = "ODOBREN";
                test.retest = false;
              } else {
              }
            });
          });

          var zaprimljen = 0;
          var obrada = 0;
          var realizovan = 0;
          var odobren = 0;
          var verificiran = 0;

          rezultat.tests.forEach((test) => {
            switch (test.status) {
              case "ZAPRIMLJEN":
                zaprimljen++;
                break;
              case "U OBRADI":
                obrada++;
                break;
              case "REALIZOVAN":
                realizovan++;
                break;
              case "ODOBREN":
                odobren++;
                break;
              case "VERIFICIRAN":
                verificiran++;
                break;

              default:
                break;
            }
          });

          if (verificiran == rezultat.tests.length) {
            rezultat.status = "VERIFICIRAN";
          } else if (odobren == rezultat.tests.length) {
            rezultat.status = "ODOBREN";
          } else if (zaprimljen == rezultat.tests.length) {
            rezultat.status = "ZAPRIMLJEN";
          } else if (realizovan == rezultat.tests.length) {
            rezultat.status = "REALIZOVAN";
          } else {
            rezultat.status = "U OBRADI";
          }

          rezultat.save(function (err, rez) {
            if (err) {
              console.log("Greška:", err);
            } else {
              ControlNalazi.findOne({
                id: req.body.id,
              })
                .populate("kontrola site")
                .exec(function (err, nalaz) {
                  if (err) {
                    console.log("Greška:", err);
                  } else {
                    if (!nalaz) {
                      //
                    } else {
                      nalaz.aparati.forEach((element) => {
                        if (
                          JSON.stringify(element.aparat) ===
                          JSON.stringify(req.body.aparat._id)
                        ) {
                          element.status = false;
                        } else {
                        }
                      });

                      nalaz.updated_at = Date.now();
                      nalaz.updated_by = req.body.decoded.user;

                      nalaz.save(function (err, report) {
                        if (err) {
                          console.log("Greška:", err);
                          res.json({
                            success: false,
                            message: err,
                          });
                        } else {
                          res.json({
                            success: true,
                            message: "Rezultati vraćeni u status ODOBREN.",
                            rez,
                          });
                        }
                      });
                    }
                  }
                });
            }
          });
        } else {
          res.json({
            success: false,
            message: "Kontrolni uzorak nije pronađen.",
          });
        }
      }
    });
  }
};

kontroleController.ControlNalaziCreate = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    ControlSamples.findOne({
      id: req.body.id,
    })
      .populate("kontrola site tests.labassay")
      .exec(function (err, rezultat) {
        if (err) {
          console.log("Greška:", err);
        } else {
          if (rezultat) {
            var headers = [
              "Naziv pretrage",
              "Rezultat",
              "Jedinica",
              "Referentni interval",
            ];
            var rows = [];
            var obj1 = {};
            var obj2 = {};
            var dataArray = [];

            rezultat.tests.forEach((test) => {
              if (
                JSON.stringify(req.body.aparat._id) ===
                JSON.stringify(test.aparat)
              ) {
                if (
                  test.rezultat[test.rezultat.length - 1].rezultat_f.trim() !=
                  ""
                ) {
                  // Interpretacija

                  dataArray = [];

                  obj1 = {
                    rezultat: test.rezultat[
                      test.rezultat.length - 1
                    ].rezultat_f.trim(),
                    kontrola: "",
                  };

                  switch (
                    test.rezultat[test.rezultat.length - 1].interpretacija
                  ) {
                    case "-":
                      obj2 = {
                        reference:
                          test.rezultat[test.rezultat.length - 1].ref_d +
                          " - " +
                          test.rezultat[test.rezultat.length - 1].ref_g,
                        extend: "",
                      };
                      break;
                    case "<":
                      obj2 = {
                        reference:
                          "< " + test.rezultat[test.rezultat.length - 1].ref_g,
                        extend: "",
                      };
                      break;
                    case "≤":
                      obj2 = {
                        reference:
                          "≤ " + test.rezultat[test.rezultat.length - 1].ref_g,
                        extend: "",
                      };

                      break;
                    case ">":
                      obj2 = {
                        reference:
                          "> " + test.rezultat[test.rezultat.length - 1].ref_g,
                        extend: "",
                      };

                      break;
                    case "≥":
                      obj2 = {
                        reference:
                          "≥ " + test.rezultat[test.rezultat.length - 1].ref_g,
                        extend: "",
                      };

                      break;
                    case "none":
                      obj2 = {
                        reference: "/",
                        extend: "",
                      };

                      break;
                    case "neg":
                      obj2 = {
                        reference: "negativan",
                        extend: "",
                      };

                      break;

                    default:
                      break;
                  }

                  dataArray.push(
                    test.labassay.analit,
                    obj1,
                    test.rezultat[test.rezultat.length - 1].jedinice_f,
                    obj2
                  );

                  rows.push(dataArray);

                  /* console.log(
                    test.labassay.analit +
                      ": " +
                      test.rezultat[test.rezultat.length - 1].rezultat_f +
                      " " +
                      test.rezultat[test.rezultat.length - 1].jedinice_f
                  ); */
                }
              } else {
              }
            });

            ControlNalazi.findOne({
              id: req.body.id,
            })
              .populate("kontrola site")
              .exec(function (err, nalaz) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  if (!nalaz) {
                    var data = {};

                    data.kontrola = mongoose.Types.ObjectId(
                      rezultat.kontrola._id
                    );
                    data.komentar = rezultat.komentar;
                    data.id = rezultat.id;
                    data.site = mongoose.Types.ObjectId(rezultat.site._id);

                    data.aparati = [
                      {
                        aparat: mongoose.Types.ObjectId(req.body.aparat._id),
                        status: false,
                        headers: headers,
                        rows: rows,
                      },
                    ];
                    data.created_at = Date.now();
                    data.updated_at = null;
                    data.created_by = req.body.decoded.user;
                    data.updated_by = null;

                    var novi = new ControlNalazi(data);

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
                        baseConfig.nalaz_ptsansregular =
                          config.nalaz_ptsansregular;
                        baseConfig.nalaz_ptsansbold = config.nalaz_ptsansbold;
                        baseConfig.nalaz_logo = config.nalaz_logo;
                        baseConfig.nalaz_footer = config.nalaz_footer;

                        control_template.create_report(
                          report,
                          baseConfig,
                          req.body.aparat,
                          res,
                          rezultat,
                          headers,
                          rows
                        );
                      }
                    });
                  } else {
                    var exists = false;

                    nalaz.aparati.forEach((element) => {
                      if (
                        JSON.stringify(element.aparat) ===
                        JSON.stringify(req.body.aparat._id)
                      ) {
                        exists = true;
                        element.headers = headers;
                        element.rows = rows;
                      } else {
                      }
                    });

                    if (exists) {
                      //
                    } else {
                      nalaz.aparati.push({
                        aparat: mongoose.Types.ObjectId(req.body.aparat._id),
                        status: false,
                        headers: headers,
                        rows: rows,
                      });
                    }

                    nalaz.updated_at = Date.now();
                    nalaz.updated_by = req.body.decoded.user;

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
                        baseConfig.nalaz_ptsansregular =
                          config.nalaz_ptsansregular;
                        baseConfig.nalaz_ptsansbold = config.nalaz_ptsansbold;
                        baseConfig.nalaz_logo = config.nalaz_logo;
                        baseConfig.nalaz_footer = config.nalaz_footer;

                        control_template.create_report(
                          report,
                          baseConfig,
                          req.body.aparat,
                          res,
                          rezultat,
                          headers,
                          rows
                        );
                      }
                    });
                  }
                }
              });
          } else {
            res.json({
              success: false,
              message: "Kontrolni uzorak nije pronađen.",
            });
          }
        }
      });
  }
};

kontroleController.ControlNalaziMail = function (req, res) {
  var input = config.nalaz_path + req.body.input + req.body.doc;
  var output = config.nalaz_path + req.body.output + req.body.doc;

  const pdfDoc = new HummusRecipe(input, output);

  var page = pdfDoc.metadata.pages;

  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    console.log("Input Folder: " + input);
    console.log("Output Folder: " + output);

    res.json({
      success: true,
      message: "Mail uspješno poslan.",
    });
  }
};

// Exports

module.exports = kontroleController;
