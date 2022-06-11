var mongoose = require("mongoose");
const config = require("../config/index");
const fs = require("fs");
const net = require("net");

var dataImportController = {};

dataImportController.fetchTemplate = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    let filePath = "public/excel/xlsx_sample.xlsx";
    let fileName = "xlsx_sample.xlsx";

    switch (req.query.type) {
      case "xlsx_sample":
        filePath = "public/excel/xlsx_sample.xlsx";
        fileName = "xlsx_sample.xlsx";
        break;

      default:
        filePath = "public/excel/xlsx_sample.xlsx";
        fileName = "xlsx_sample.xlsx";
        break;
    }

    try {
      if (fs.existsSync(filePath)) {
        res.download(filePath, fileName);
      } else {
        res.download("public/excel/xlsx_sample.xlsx", "xlsx_sample.xlsx");
      }
    } catch (err) {
      console.error(err);
    }
  }
};

dataImportController.sekcijeImport = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var sekcija = "";

    if (req.body.Sekcije.length) {
      var counter = 0;

      req.body.Sekcije.forEach(element => {
        sekcija = new Sekcija(element);
        sekcija.save();
        counter++;
      });

      if (counter == req.body.Sekcije.length) {
        res.json({ success: true, message: "Data imported successfully." });
      }
    } else {
      res.json({ success: false, message: "No data." });
    }
  }
};

module.exports = dataImportController;
