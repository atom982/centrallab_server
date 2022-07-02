const { image } = require("pdfkit");
const QRCode = require("qrcode");

module.exports = {
  create_report: function (
    report,
    config,
    data,
    legenda,
    sekcijeniz,
    napomena,
    res,
    specificni,
    type,
    naziv,
    lokacija,
    site,
    site_data,
    uzorakBris
  ) {
    var Analiza = "";
    var Rezultat = "";
    var EN = false;
    var DE = false;

    if (sekcijeniz.length === 1) {
      sekcijeniz.forEach((element) => {
        Rezultat = element[0].rezultat[1].rezultat;
        element.forEach((test) => {
          if (!test.hasOwnProperty("multi")) {
            switch (test.rezultat[0].slice(3).trim()) {
              case "Antigen SARS-CoV-2":
                Analiza = "Antigen SARS-CoV-2";

                Napomena = "";
                Note = "";

                switch (code) {
                  case "A": // Avaz BC
                    break;

                  case "B": // Skenderija
                    break;

                  default:
                    break;
                }

                break;

              default:
                break;
            }
          } else {
          }
        });
      });
    }

    var replace = napomena.trim();

    if(data.roditelj.trim() != ""){
      data.prezime = data.prezime + " (" + data.roditelj + ")"
    }

    var qrcodeText =
      data.prezime +
      " " +
      data.ime +
      ", " +
      data.godiste +
      "\n" +
      data.datum +
      " " +
      data.vrijeme.substring(0, 5) +
      "\n" +
      data.protokol +
      "\n" +
      Rezultat;

    QRCode.toFile(
      config.QRCodes + report._id + ".png",
      qrcodeText,
      {
        width: 90,
        height: 90,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      function (err) {
        let code = site_data.sifra;
        let adresa_x = 0;
        let adresa = "";
        let logoX = 50;
        let logoY = 20;

        // console.log(data)

        if (data.posiljaoc != null) {
          // console.log(data.posiljaoc)
        }

        var micro = false;

        if (Analiza != "") {
          if (Rezultat === "negative" || Rezultat === "positive") {
            // console.log("Kreirati nalaz na Engleskom jeziku.")
            // console.log(Analiza + ": " + Rezultat)
            EN = true;
            DE = false;
          } else if (Rezultat === "Negativ" || Rezultat === "Positiv") {
            // console.log("Kreirati nalaz na Njemačkom jeziku.")
            // console.log(Analiza + ": " + Rezultat)
            EN = false;
            DE = true;
          } else {
            // console.log("Kreirati nalaz na Bosanskom jeziku.")
            // console.log(Analiza + ": " + Rezultat)
            EN = false;
            DE = false;
          }
        } else {
        }

        switch (site_data.sifra) {
          case "A":
            logoY = 13;
            break;
          case "B":
            logoY = 13;
            break;
          case "G":
            logoY = 13;
            break;

          default:
            adresa_x = 162.5;

            adresa =
              "Nalaz je izdat u elektronskoj formi i validan je bez pečata i potpisa.";
            break;
        }

        var fs = require("fs");
        PDFDocument = require("pdfkit");
        const PDFDocumentWithTables = require("./pdf_class");
        var rowsno = "Rezultati laboratorijskih analiza";

        if (EN == true) {
          rowsno = "Results of Laboratory Analysis";
        } else if (DE == true) {
          rowsno = "Ergebnisse von Laboranalysen";
        } else {
          rowsno = "Rezultati laboratorijskih analiza";
        }

        var rows = [];
        var temp = [];

        var pid = report.pid;

        var datRodjenja =
          data.jmbg.substring(0, 2) + "." + data.jmbg.substring(2, 4) + ".";

        if (type != undefined && naziv != undefined && type === "single") {
          var nalazPath = config.nalaz_path + "/samples/";
          var imeFile = naziv;
        } else if (
          type != undefined &&
          naziv != undefined &&
          type === "multi"
        ) {
          var nalazPath = config.nalaz_path;
          var imeFile = naziv;
        } else if (
          type != undefined &&
          naziv != undefined &&
          type === "partial"
        ) {
          var nalazPath = config.nalaz_path + "/partials/";
          var imeFile = naziv;
        } else {
          var nalazPath = config.nalaz_path;
          var imeFile = report._id;
        }

        const doc = new PDFDocumentWithTables({
          bufferPages: true,
          margins: { top: 80, bottom: 50, left: 50, right: 50 },
        });
        doc.pipe(
          fs
            .createWriteStream(nalazPath + imeFile + ".pdf")
            .on("finish", function () {
              res.json({
                success: true,
                message: "Nalaz uspješno kreiran.",
                id: report._id,
                lokacija: lokacija,
                memo: memo,
              });
            })
        );

        var memo = 0;
        var nvisina = 100;
        var adjust = nvisina - 70;
        var nalazMemorandum = true;

        if (nalazMemorandum) {
          doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
          doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
        }

        doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
        doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
        doc.image(config.nalaz_logo + code + ".jpg", logoX, logoY - 9, {
          width: 280,
          keepAspectRatio: true,
        });

        switch (code) {
          case "B": // Skenderija
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Ul. Josipa Šibera 3. 76250 Gradačac, BiH", 340, 20 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Tel: +387 35 81 63 17", 340, 32.5 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Mob: +387 62 73 73 03 i +387 61 23 47 05", 340, 45 - 3 - 12.5)
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("E-mail: clgradacac@gmail.com i", 340, 57.5 - 3 - 12.5);
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("             biohemija@bih.net.ba", 340, 70 - 3 - 12.5)
            
            doc
              .font("PTSansRegular")
              .fontSize(10.5)
              .fillColor("black")
              .text("Facebook: facebook.com/CentralLabGradacac", 340, 70 - 3); // Facebook
            // .fillColor("#0000EE")
            // .text("facebook.com/CentralLabGradacac", 414, 70);

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

        if (
          data.telefon === "NEPOZNATO" ||
          data.telefon === "Nema podataka" ||
          data.telefon.trim() === "" ||
          data.telefon.length < 9
        ) {
          // doc
          //   .font("PTSansRegular")
          //   .fontSize(11)
          //   .fillColor("#7B8186")
          //   .text("RIQAS certificirana eksterna kontrola kvaliteta", 340, 150);
        } else {
          // doc
          //   .font("PTSansRegular")
          //   .fontSize(11)
          //   .fillColor("#7B8186")
          //   .text("RIQAS certificirana eksterna kontrola kvaliteta", 340, 160);
        }

        if (EN == true) {
          if (data.posiljaoc != null) {
            // console.log(data.posiljaoc)
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("For: " + data.posiljaoc.opis, 390, 95);
          }

          // doc.font("PTSansRegular").fontSize(13).fillColor("#7B8186").text("RIQAS certificirana eksterna kontrola kvaliteta", 308, 40);
          doc
            .font("PTSansRegular")
            .fontSize(12)
            .fillColor("black")
            .text("Surname and name: ", 50, nvisina);
          doc
            .font("PTSansBold")
            .fontSize(14)
            .text(
              " " + data.prezime.toUpperCase() + " " + data.ime.toUpperCase(),
              155,
              nvisina - 2
            );

          if (datRodjenja.includes("01.01") && data.godiste == "1920") {
            var pacijent =
              data.prezime.toUpperCase() + " " + data.ime.toUpperCase();
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Date and year of birth:", 50, nvisina + 16)
              .text("Nema podataka", 168, nvisina + 16);
          } else if (!datRodjenja.includes("00.00")) {
            var pacijent =
              data.prezime.toUpperCase() +
              " " +
              data.ime.toUpperCase() // +
              // " (" +
              // data.godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Date and year of birth:", 50, nvisina + 16)
              .text(datRodjenja + data.godiste + ".", 168, nvisina + 16);
          } else {
            var pacijent =
              data.prezime.toUpperCase() +
              " " +
              data.ime.toUpperCase() // +
              // " (" +
              // data.godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Year of birth:", 50, nvisina + 16)
              .text(data.godiste + ".", 120, nvisina + 16);
          }

          var Spol = "Nema podataka";

          if (
            data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase() ===
            "Muški"
          ) {
            Spol = "Male";
          }

          // console.log(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase())

          if (
            data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase() ===
            "Ženski"
          ) {
            Spol = "Female";
          }

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("Gender:", 50, nvisina + 32)
            .text(Spol, 96 - 3, nvisina + 32);

          // .text("Datum: ", 445 + 10, nvisina - 2).text(data.datum, 490 + 6, nvisina - 2);

          if (
            data.telefon === "NEPOZNATO" ||
            data.telefon === "Nema podataka" ||
            data.telefon.trim() === "" ||
            data.telefon.length < 9
          ) {
            data.telefon = "";
            // nvisina = nvisina - 12;
          } else {
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Contact:", 50, nvisina + 48)
              .text(data.telefon, 150 - 54, nvisina + 48);
          }

          var uzorkovan = JSON.stringify(report.uzorkovano)
            .substring(1, 11)
            .split("-");

          // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(11).text("Broj protokola:", 341, nvisina + 240);
          // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(11).text(data.protokol, 414, nvisina + 240);

          // Date and time of reporting
          // Date and time of sampling
          doc
            .font("PTSansRegular")
            .fontSize(10)
            .text("Date and time of reporting:", 390, nvisina + 3 + 15 + 3);
          doc
            .font("PTSansBold")
            .text(
              data.datum + " " + data.vrijeme.substring(0, 5),
              390,
              nvisina + 18 + 15 + 3
            );

          doc
            .font("PTSansRegular", config.nalaz_ptsansbold)
            .fontSize(10)
            .text("Date and time of sampling:", 390, nvisina + 18 + 30 + 3);
          doc
            .font("PTSansRegular", config.nalaz_ptsansbold)
            .fontSize(10)
            .text(
              uzorkovan[2] +
                "." +
                uzorkovan[1] +
                "." +
                uzorkovan[0] +
                " " +
                data.uzorkovano_t,
              390,
              nvisina + 18 + 45 + 3
            );
          // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text("Broj protokola: ", 333, nvisina + 50);
          // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(10).text(data.protokol, 390 + 10, nvisina + 50);
          doc
            .font("PTSansBold")
            .fontSize(12)
            .text(rowsno, 50, nvisina + 70);
          doc.moveDown(0.6);
        } else if (DE == true) {
          // Njemački jezik - Antigen
          // Antigen test COVID-19 / SARS-CoV-2

          if (data.posiljaoc != null) {
            // console.log(data.posiljaoc)
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("Vür: " + data.posiljaoc.opis, 390, 95);
          }

          // doc.font("PTSansRegular").fontSize(13).fillColor("#7B8186").text("RIQAS certificirana eksterna kontrola kvaliteta", 308, 40);
          doc
            .font("PTSansRegular")
            .fontSize(12)
            .fillColor("black")
            .text("Vor- und Nachname: ", 50, nvisina);
          doc
            .font("PTSansBold")
            .fontSize(14)
            .text(
              " " + data.ime.toUpperCase() + " " + data.prezime.toUpperCase(),
              153,
              nvisina - 2
            );

          if (datRodjenja.includes("01.01") && data.godiste == "1920") {
            var pacijent =
              data.prezime.toUpperCase() + " " + data.ime.toUpperCase();
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Geburtsdatum:", 50, nvisina + 16)
              .text("Nema podataka", 130, nvisina + 16);
          } else if (!datRodjenja.includes("00.00")) {
            var pacijent =
              data.prezime.toUpperCase() +
              " " +
              data.ime.toUpperCase() // +
              // " (" +
              // data.godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Geburtsdatum:", 50, nvisina + 16)
              .text(datRodjenja + data.godiste + ".", 130, nvisina + 16);
          } else {
            var pacijent =
              data.prezime.toUpperCase() +
              " " +
              data.ime.toUpperCase() // +
              // " (" +
              // data.godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Geburtsjahr:", 50, nvisina + 16)
              .text(data.godiste + ".", 118, nvisina + 16);
          }

          // doc.font("PTSansRegular").fontSize(12).text("Geschlecht:", 50, nvisina + 32).text(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase(), 96 - 17, nvisina + 32).text("Datum: ", 445 + 10, nvisina - 2).text(data.datum, 498, nvisina - 2);

          var Spol = "Nema podataka";

          if (
            data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase() ===
            "Muški"
          ) {
            Spol = "Männlich";
          }

          // console.log(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase())

          if (
            data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase() ===
            "Ženski"
          ) {
            Spol = "Weiblich";
          }

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("Geschlecht:", 50, nvisina + 32)
            .text(Spol, 115, nvisina + 32);

          if (
            data.telefon === "NEPOZNATO" ||
            data.telefon === "Nema podataka" ||
            data.telefon.trim() === "" ||
            data.telefon.length < 9
          ) {
            data.telefon = "";
            // nvisina = nvisina - 12;
          } else {
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Contact:", 50, nvisina + 48)
              .text(data.telefon, 150 - 54, nvisina + 48);
          }

          var uzorkovan = JSON.stringify(report.uzorkovano)
            .substring(1, 11)
            .split("-");

          // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(11).text("Broj protokola:", 341, nvisina + 240);
          // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(11).text(data.protokol, 414, nvisina + 240);

          // Date and time of reporting
          // Date and time of sampling
          doc
            .font("PTSansRegular")
            .fontSize(10)
            .text(
              "Datum und Uhrzeit der Berichterstattung:",
              390,
              nvisina + 3 + 15 + 3
            );
          doc
            .font("PTSansBold")
            .text(
              data.datum + " " + data.vrijeme.substring(0, 5),
              470,
              nvisina + 18 + 13 + 3
            );

          doc
            .font("PTSansRegular", config.nalaz_ptsansbold)
            .fontSize(10)
            .text(
              "Datum und Uhrzeit der Probenahme:",
              390,
              nvisina + 18 + 30 + 3
            );
          doc
            .font("PTSansRegular", config.nalaz_ptsansbold)
            .fontSize(10)
            .text(
              uzorkovan[2] +
                "." +
                uzorkovan[1] +
                "." +
                uzorkovan[0] +
                " " +
                data.uzorkovano_t,
              390,
              nvisina + 18 + 45 + 3
            );
          // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text("Broj protokola: ", 333, nvisina + 50);
          // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(10).text(data.protokol, 390 + 10, nvisina + 50);
          doc
            .font("PTSansBold")
            .fontSize(12)
            .text(rowsno, 50, nvisina + 70);
          doc.moveDown(0.6);
        } else {
          if (data.posiljaoc != null) {
            // console.log(data.posiljaoc)
            doc
              .font("PTSansRegular")
              .fontSize(10)
              .fillColor("#7B8186")
              .text("Za: " + data.posiljaoc.opis, 390, 95);
          }

          // doc.font("PTSansRegular").fontSize(13).fillColor("#7B8186").text("RIQAS certificirana eksterna kontrola kvaliteta", 308, 40);
          doc
            .font("PTSansRegular")
            .fontSize(12)
            .fillColor("black")
            .text("Prezime i ime: ", 50, nvisina);
          doc
            .font("PTSansBold")
            .fontSize(14)
            .text(
              " " + data.prezime.toUpperCase() + " " + data.ime.toUpperCase(),
              142 - 17,
              nvisina - 2
            );

          if (datRodjenja.includes("01.01") && data.godiste == "1920") {
            var pacijent =
              data.prezime.toUpperCase() + " " + data.ime.toUpperCase();
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Datum rođenja:", 50, nvisina + 16)
              .text("Nema podataka", 150 - 17, nvisina + 16);
          } else if (!datRodjenja.includes("00.00")) {
            var pacijent =
              data.prezime.toUpperCase() +
              " " +
              data.ime.toUpperCase() // +
              // " (" +
              // data.godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Datum rođenja:", 50, nvisina + 16)
              .text(datRodjenja + data.godiste + ".", 150 - 17, nvisina + 16);
          } else {
            var pacijent =
              data.prezime.toUpperCase() +
              " " +
              data.ime.toUpperCase() // +
              // " (" +
              // data.godiste +
              // ")";
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Godište:", 50, nvisina + 16)
              .text(data.godiste + ".", 150 - 56, nvisina + 16);
          }

          doc
            .font("PTSansRegular")
            .fontSize(12)
            .text("Spol:", 50, nvisina + 32)
            .text(
              data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase(),
              96 - 17,
              nvisina + 32
            );

          // .text("Datum: ", 445 + 10, nvisina - 2).text(data.datum, 490 + 6, nvisina - 2);

          if (
            data.telefon === "NEPOZNATO" ||
            data.telefon === "Nema podataka" ||
            data.telefon.trim() === "" ||
            data.telefon.length < 9
          ) {
            data.telefon = "";
            // nvisina = nvisina - 12;
          } else {
            doc
              .font("PTSansRegular")
              .fontSize(12)
              .text("Kontakt:", 50, nvisina + 48)
              .text(data.telefon, 150 - 54, nvisina + 48);
          }

          var uzorkovan = JSON.stringify(report.uzorkovano)
            .substring(1, 11)
            .split("-");

          // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(11).text("Broj protokola:", 341, nvisina + 240);
          // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(11).text(data.protokol, 414, nvisina + 240);

          doc
            .font("PTSansRegular")
            .fontSize(10)
            .text("Izdavanje nalaza:", 390, nvisina + 3 + 15 + 3)
            .font("PTSansBold")
            .text(
              data.datum + " " + data.vrijeme.substring(0, 5),
              468,
              nvisina + 3 + 15 + 3
            );
          doc
            .font("PTSansRegular", config.nalaz_ptsansbold)
            .fontSize(10)
            .text("Vrijeme uzorkovanja:", 390, nvisina + 18 + 15 + 3);
          doc
            .font("PTSansRegular", config.nalaz_ptsansbold)
            .fontSize(10)
            .text(
              uzorkovan[2] +
                "." +
                uzorkovan[1] +
                "." +
                uzorkovan[0] +
                " " +
                data.uzorkovano_t,
              482,
              nvisina + 33 + 3
            );
          doc
            .font("PTSansRegular", config.nalaz_ptsansbold)
            .fontSize(12)
            .text("Broj protokola: ", 333 + 57, nvisina + 50 + 10);
          doc
            .font("PTSansBold", config.nalaz_ptsansbold)
            .fontSize(12)
            .text(data.protokol, 390 + 23 + 57, nvisina + 50 + 10);
          doc
            .font("PTSansBold")
            .fontSize(12)
            .text(rowsno, 50, nvisina + 70);
          doc.moveDown(0.6);
        }

        // if (uzorakBris != "") {
        //   console.log(uzorakBris)
        //   doc.image(config.barcode_path + uzorakBris + ".png", 260, 130, {
        //     width: 100,
        //     keepAspectRatio: true,
        //     align: "center",
        //     valign: "center",
        //   });
        // }

        doc.image(config.QRCodes + report._id + ".png", 305, 115, { width: 80, keepAspectRatio: true });
      

        var i = 0;
        var rows = [];
        var analit = true;
        var reset = 0;

        var cov2Ag = "";
        var cov2IgM = "";
        var cov2IgG = "";
        var Spike = "";

        var ngDNK = "";

        var SARS = "";
        var Influenza = "";
        var nazofarings = false;

        var enap = false;

        sekcijeniz.forEach((element) => {
          element.forEach((niz) => {
            // console.log(niz.order)
          });

          if (!element[0].mikrobiologija) {
            i++;
            analit = true;
            rows = [];
            multi = [];

            if (doc.y > 630) {
              doc.addPage();
            }

            if (element[0].multi === undefined) {
              if (element[0].sekcija.trim() === "Mikrobiologija") {
                micro = true;
              }

              doc
                .fontSize(12)
                .opacity(0.25)
                .rect(50, doc.y, 511.5, 15)
                .fill("#7B8186")
                .fillColor("black")
                .opacity(1)
                .text(element[0].sekcija, 50);
            }

            element.forEach((test) => {
              if (test.hasOwnProperty("multi")) {
                analit = false;
                multi.push({
                  naslov: test.test,
                  headers: report.headersa,
                  rows: test.rezultat,
                });
              } else {
                // console.log(test.rezultat[1].kontrola)

                if (test.rezultat[0].includes("COVID-19 RT-PCR Test")) {
                  nazofarings = true;
                }

                if (test.rezultat[0].includes("Antigen SARS-CoV-2")) {
                  nazofarings = true;
                  switch (test.rezultat[1].kontrola) {
                    case "Green":
                      cov2Ag = "negativan";
                      break;

                    case "Yellow":
                      // cov2Ag = "graničan"
                      cov2Ag = "";
                      break;

                    case "No Class":
                      cov2Ag = "";
                      break;

                    case "Red":
                      cov2Ag = "pozitivan";
                      break;

                    default:
                      cov2Ag = "";
                      break;
                  }
                }

                if (test.rezultat[0].includes("Covid 19 IgM")) {
                  switch (test.rezultat[1].kontrola) {
                    case "Green":
                      cov2IgM = "negativan";
                      break;

                    case "Yellow":
                      cov2IgM = "";
                      break;

                    case "No Class":
                      cov2IgM = "";
                      break;

                    case "Red":
                      cov2IgM = "pozitivan";
                      break;

                    default:
                      cov2IgM = "";
                      break;
                  }
                }

                // ngDNK = "";

                if (test.rezultat[0].includes("Neisseria gonorrhea DNK")) {
                  switch (test.rezultat[1].kontrola) {
                    case "Green":
                      ngDNK = "negativan";
                      break;

                    case "Yellow":
                      ngDNK = "";
                      break;

                    case "No Class":
                      ngDNK = "";
                      break;

                    case "Red":
                      ngDNK = "pozitivan";
                      break;

                    default:
                      ngDNK = "";
                      break;
                  }
                }

                if (test.rezultat[0].includes("Covid 19 IgG")) {
                  switch (test.rezultat[1].kontrola) {
                    case "Green":
                      cov2IgG = "negativan";
                      break;

                    case "Yellow":
                      cov2IgG = "";
                      break;

                    case "No Class":
                      cov2IgG = "";
                      break;

                    case "Red":
                      cov2IgG = "pozitivan";
                      break;

                    default:
                      cov2IgG = "";
                      break;
                  }
                }

                if (test.rezultat[0].includes("IgG spike")) {
                  switch (test.rezultat[1].kontrola) {
                    case "Green":
                      Spike = "negativan";
                      break;

                    case "Yellow":
                      Spike = "";
                      break;

                    case "No Class":
                      Spike = "";
                      break;

                    case "Red":
                      Spike = "pozitivan";
                      break;

                    default:
                      Spike = "";
                      break;
                  }
                }

                rows.push(test.rezultat);
                analit = true;
              }
            });

            if (analit || rows.length) {
              // HEX #7B8186

              if (EN === true) {
                doc.table_default_antigen(
                  { headers: report.headers, rows: rows },
                  {
                    prepareHeader: () => doc.fontSize(8),
                    prepareRow: (row, i) => doc.fontSize(10),
                  }
                );
              } else if (DE === true) {
                doc.table_default_DE(
                  { headers: report.headers, rows: rows },
                  {
                    prepareHeader: () => doc.fontSize(8),
                    prepareRow: (row, i) => doc.fontSize(10),
                  }
                );
              } else {
                doc.table_default(
                  { headers: report.headers, rows: rows },
                  {
                    prepareHeader: () => doc.fontSize(8),
                    prepareRow: (row, i) => doc.fontSize(10),
                  }
                );
              }

              multi.forEach((mul) => {
                // doc.fontSize(12).text(mul.naslov, 50);
                doc
                  .fontSize(12)
                  .opacity(0.25)
                  .rect(50, doc.y, 511.5, 15)
                  .fill("#7B8186")
                  .fillColor("black")
                  .opacity(1)
                  .fontSize(8)
                  .fillColor("red")
                  .text(mul.naslov.slice(1, 2), 50)
                  .fontSize(12)
                  .fillColor("black")
                  .text(mul.naslov.slice(4), 57, doc.y - 11);
                // HEX #7B8186
                if (EN === true) {
                  doc.table_default_antigen(
                    { headers: report.headers, rows: rows },
                    {
                      prepareHeader: () => doc.fontSize(8),
                      prepareRow: (row, i) => doc.fontSize(10),
                    }
                  );
                } else if (DE === true) {
                  doc.table_default_DE(
                    { headers: report.headers, rows: rows },
                    {
                      prepareHeader: () => doc.fontSize(8),
                      prepareRow: (row, i) => doc.fontSize(10),
                    }
                  );
                } else {
                  doc.table_default(
                    { headers: report.headers, rows: rows },
                    {
                      prepareHeader: () => doc.fontSize(8),
                      prepareRow: (row, i) => doc.fontSize(10),
                    }
                  );
                }
              });
              multi = [];
            } else {
              if (multi.length) {
                multi.forEach((mul) => {
                  if (doc.y > 650) {
                    doc.addPage();
                  }

                  // Antigen SARS-CoV-2 / Influenza A i B

                  SARS = "";
                  Influenza = "";

                  if (mul.naslov.includes("COVID-19 RT-PCR Test")) {
                    nazofarings = true;
                  }

                  if (
                    mul.naslov.includes("Antigen SARS-CoV-2 / Influenza A i B")
                  ) {
                    nazofarings = true;

                    mul.rows.forEach((element) => {
                      // console.log(element[0] + ": " + element[1].rezultat+ " - " + element[1].kontrola)

                      // Antigen SARS-CoV-2

                      if (element[0] == "Antigen SARS-CoV-2") {
                        switch (element[1].kontrola) {
                          case "Green":
                            SARS = "negativan";
                            break;

                          case "Yellow":
                            SARS = "";
                            break;

                          case "No Class":
                            SARS = "";
                            break;

                          case "Red":
                            SARS = "pozitivan";
                            break;

                          default:
                            SARS = "";
                            break;
                        }
                      }

                      // Influenza A i B

                      if (element[0] == "Influenza A i B") {
                        switch (element[1].kontrola) {
                          case "Green":
                            Influenza = "negativan";
                            break;

                          case "Yellow":
                            Influenza = "pozitivan";
                            break;

                          case "No Class":
                            Influenza = "";
                            break;

                          case "Red":
                            Influenza = "pozitivan";
                            break;

                          default:
                            Influenza = "";
                            break;
                        }
                      }
                    });
                  }

                  // console.log(mul.naslov)
                  // console.log(mul.rows)

                  // if (mul.naslov.slice(4).includes("ENA PROFIL")) {
                  //   enap = true;
                  // }

                  if (
                    mul.naslov.slice(4).trim() === "Sediment urina" ||
                    mul.naslov
                      .slice(4)
                      .trim()
                      .includes("Pregled sedimenta urina")
                  ) {
                    mul.rows.forEach((red) => {
                      if (red[1].rezultat.includes(";")) {
                        reset = reset + 3;
                      }
                    });
                    doc
                      .fontSize(12)
                      .opacity(0.25)
                      .rect(50, doc.y, 511.5, 15)
                      .fill("#7B8186")
                      .fillColor("black")
                      .opacity(1)
                      .fontSize(8)
                      .fillColor("red")
                      .text(mul.naslov.slice(1, 2), 50)
                      .fontSize(12)
                      .fillColor("black")
                      .text(mul.naslov.slice(4), 57, doc.y - 11);
                    // HEX #7B8186
                    doc.table_sediment(
                      { headers: mul.headers, rows: mul.rows },
                      {
                        prepareHeader: () => doc.fontSize(8),
                        prepareRow: (row, i) => doc.fontSize(10),
                      }
                    );
                  } else if (mul.naslov.slice(4).trim() === "Spermiogram") {
                    mul.rows.forEach((red) => {
                      if (red[1].rezultat.includes(";")) {
                        reset = reset + 3;
                      }
                    });
                    doc
                      .fontSize(12)
                      .opacity(0.25)
                      .rect(50, doc.y, 511.5, 15)
                      .fill("#7B8186")
                      .fillColor("black")
                      .opacity(1)
                      .fontSize(8)
                      .fillColor("red")
                      .text(mul.naslov.slice(1, 2), 50)
                      .fontSize(12)
                      .fillColor("black")
                      .text(mul.naslov.slice(4), 57, doc.y - 11);
                    // HEX #7B8186
                    if (EN === true) {
                      doc.table_default_antigen(
                        { headers: report.headers, rows: rows },
                        {
                          prepareHeader: () => doc.fontSize(8),
                          prepareRow: (row, i) => doc.fontSize(10),
                        }
                      );
                    } else if (DE === true) {
                      doc.table_default_DE(
                        { headers: report.headers, rows: rows },
                        {
                          prepareHeader: () => doc.fontSize(8),
                          prepareRow: (row, i) => doc.fontSize(10),
                        }
                      );
                    } else {
                      doc.table_default(
                        { headers: mul.headers, rows: mul.rows },
                        {
                          prepareHeader: () => doc.fontSize(8),
                          prepareRow: (row, i) => doc.fontSize(10),
                        }
                      );
                    }
                  } else {
                    doc
                      .fontSize(12)
                      .opacity(0.25)
                      .rect(50, doc.y, 511.5, 15)
                      .fill("#7B8186")
                      .fillColor("black")
                      .opacity(1)
                      .fontSize(8)
                      .fillColor("red")
                      .text(mul.naslov.slice(1, 2), 50)
                      .fontSize(12)
                      .fillColor("black")
                      .text(mul.naslov.slice(4), 57, doc.y - 11);
                    // HEX #7B8186
                    if (EN === true) {
                      doc.table_default_antigen(
                        { headers: report.headers, rows: rows },
                        {
                          prepareHeader: () => doc.fontSize(8),
                          prepareRow: (row, i) => doc.fontSize(10),
                        }
                      );
                    } else if (DE === true) {
                      doc.table_default_DE(
                        { headers: report.headers, rows: rows },
                        {
                          prepareHeader: () => doc.fontSize(8),
                          prepareRow: (row, i) => doc.fontSize(10),
                        }
                      );
                    } else {
                      doc.table_default(
                        { headers: mul.headers, rows: mul.rows },
                        {
                          prepareHeader: () => doc.fontSize(8),
                          prepareRow: (row, i) => doc.fontSize(10),
                        }
                      );
                    }
                  }
                });
                doc.moveDown(0.4);
              }
            }
          }
        });

        // Mikrobiologija

        sekcijeniz.forEach((element) => {
          if (element[0].mikrobiologija) {
            i++;
            analit = true;
            rows = [];
            multi = [];

            if (doc.y > 630) {
              doc.addPage();
            }

            if (element[0].multi === undefined) {
              if (element[0].sekcija.trim() === "Mikrobiologija") {
                micro = true;
              }

              doc
                .fontSize(12)
                .opacity(0.25)
                .rect(50, doc.y, 511.5, 15)
                .fill("#7B8186")
                .fillColor("black")
                .opacity(1)
                .text(element[0].sekcija, 50);
            }

            element.forEach((test) => {
              rows.push(test.rezultat);
              analit = true;

              if (test.hasOwnProperty("data") && test.data.length > 1) {
                var obj = {};
                var ant = [];
                var Bakterije = [];
                const bheader = ["Antibiotik", "Rezultat", ""];
                let bnaslov = "Antibiogram za bakteriju: ";

                test.data.forEach((bactery) => {
                  if (bactery.bakterija) {
                    obj.bakterija_naziv = bactery.naziv;
                    obj.bakterija_opis = bactery.opis;
                    obj.antibiogram_naziv = bactery.antibiogram.naziv;
                    obj.antibiogram_opis = bactery.antibiogram.opis;
                    obj.antibiotici = [];

                    bactery.antibiogram.antibiotici.forEach((antibiotik) => {
                      if (antibiotik.rezultat != "") {
                        ant.push(antibiotik.opis);

                        ant.naziv = antibiotik.naziv;
                        ant.opis = antibiotik.opis;
                        switch (antibiotik.rezultat) {
                          case "S":
                            ant.push({
                              rezultat: "Senzitivan",
                              kontrola: "No Class",
                            });
                            break;

                          case "I":
                            ant.push({
                              rezultat: "Intermedijaran",
                              kontrola: "No Class",
                            });
                            break;
                          case "R":
                            ant.push({
                              rezultat: "Rezistentan",
                              kontrola: "No Class",
                            });
                            break;

                          default:
                            break;
                        }

                        ant.push("");
                        ant.push({
                          reference: "/",
                          extend: "",
                        });

                        obj.antibiotici.push(ant);
                      }
                      ant = [];
                    });
                    Bakterije.push(obj);
                    obj = {};
                  }
                });

                Bakterije.forEach((Bakt) => {
                  analit = false;
                  multi.push({
                    naslov: bnaslov + Bakt.bakterija_opis,
                    headers: bheader,
                    rows: Bakt.antibiotici,
                    /* [
                  [ 'Eritrociti', { rezultat: 'uu', kontrola: 'No Class'}, 'x10^12/L', { reference: '4.4 - 5.8', extend: '' }],
                  [ 'Hematokrit', { rezultat: 'uu', kontrola: 'No Class'}, '%', { reference: '42 - 52', extend: '' } ],
                  [ 'Volumen Erc (MCV)', { rezultat: 'uu', kontrola: 'No Class'}, 'fL', { reference: '80 - 94', extend: '' } ] 
                ] */
                  });
                });
              }
            });

            if (analit || rows.length) {
              // HEX #7B8186
              doc.table_mikrobiologija(
                { headers: report.headers, rows: rows },
                {
                  prepareHeader: () => doc.fontSize(8),
                  prepareRow: (row, i) => doc.fontSize(10),
                }
              );
              multi.forEach((mul) => {
                if (doc.y > 630) {
                  doc.addPage();
                }
                doc
                  .fontSize(11)
                  .fillColor("#7B8186")
                  .text(mul.naslov.slice(0, 25), 50)
                  .fontSize(12)
                  .fillColor("black")
                  .text(mul.naslov.slice(25), 170, doc.y - 15);
                doc.fillColor("black");
                doc.moveDown(0.2);
                // HEX #7B8186
                doc.table_antibiotici(
                  { headers: mul.headers, rows: mul.rows },
                  {
                    prepareHeader: () => doc.fontSize(8),
                    prepareRow: (row, i) => doc.fontSize(10),
                  }
                );
                doc.moveDown(0.5);
              });
              multi = [];
            }

            /* if (multi.length) {
          multi.forEach(mul => {
            if (doc.y > 650) {
              doc.addPage();
            }
            doc.fontSize(12).opacity(0.25).rect(50, doc.y, 511.5, 15).fill("#7B8186").fillColor("black").opacity(1).fontSize(8).fillColor("red").text(mul.naslov.slice(1, 2), 50).fontSize(12).fillColor("black").text(mul.naslov.slice(4), 57, doc.y - 11);
            // HEX #7B8186
            doc.table_antibiotici({ headers: mul.headers, rows: mul.rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
          });
        } */
          }
        });

        var leg = "";

        legenda.forEach((element) => {
          switch (element) {
            case "S":
              leg += element + "-" + "Serum, ";
              break;
            case "K":
              leg += element + "-" + "Puna Krv, ";
              break;
            case "k":
              leg += element + "-" + "kapilarna krv, ";
              break;
            case "P":
              leg += element + "-" + "Plazma, ";
              break;
            case "U":
              leg += element + "-" + "Urin, ";
              break;
            case "F":
              leg += element + "-" + "Feces, ";
              break;
            case "B":
              if (nazofarings) {
                if (EN === true) {
                  leg += element + "-" + "Nasopharyngeal swab, ";
                } else if (DE === true) {
                  leg += element + "-" + "Abstrich aus Nasopharynx, ";
                } else {
                  leg += element + "-" + "Bris nazofarinksa, ";
                }
              } else {
                leg += element + "-" + "Bris, ";
              }

              break;
            case "E":
              leg += element + "-" + "Ejakulat, ";
              break;
            default:
              break;
          }
        });

        leg = leg.substring(0, leg.length - 2);

        doc.font("PTSansBold").fontSize(8);
        if (legenda.length) {
          // doc.fontSize(8).text("Legenda: " + leg, 50, doc.y + reset);
          doc
            .fontSize(8)
            .text("Legenda: L - nizak, H - visok\n" + leg, 50, doc.y + reset);
        }

        if (specificni != undefined && specificni.length) {
          var ref = "";

          specificni = specificni.sort(function (a, b) {
            return a.fussnote.localeCompare(b.fussnote, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });

          var hormoni = false;
          var roma = false;

          specificni.forEach((element) => {
            // if (element.extend.includes("Hormones")) {
            //   hormoni = true;
            // }

            // if (element.extend.includes("ROMAindex")) {
            //   roma = true;
            // }

            ref = element.extend;
            // console.log(element.fussnote)
            doc.fontSize(7).text(element.fussnote + " " + ref, 50);
          });
        }

        doc.font("PTSansBold").fontSize(12);

        if (doc.y > 680) {
          doc.addPage();
        }

        if (hormoni) {
          // console.log("Spolni hormoni")

          doc.image(config.nalaz_references + "Hormones.png", 50, doc.y + 15, {
            width: 510,
            keepAspectRatio: true,
            lineBreak: false,
          });
          doc.moveDown(10);
        }

        if (enap === true) {
          // console.log("ENA Profil")

          var tmpENA = 0;

          doc.image(config.nalaz_references + "ENAP.png", 50, doc.y + 15, {
            width: 510,
            keepAspectRatio: true,
            lineBreak: false,
          });
          doc.moveDown(7);
        } else {
          tmpENA = 0;
        }

        if (roma) {
          console.log("ROMA index");
          // doc.image(config.nalaz_references + "ROMAindex.png", 50, doc.y + 15, { width: 510, keepAspectRatio: true, lineBreak: false });
          // doc.moveDown(9);
        }

        // var cov2Ag = "";
        // var cov2IgM = "";
        // var cov2IgG = "";
        // var Spike = "";

        // Covid 19 IgM & Covid 19 IgG

        // KOMENTARI
        let comment = napomena;
        // Antigen SARS-CoV-2
        var COV2AgNapomena = "";
        // Antigen SARS-CoV-2 / Influenza A i B
        var COMBoNapomena = "";
        // Covid 19 IgM & Covid 19 IgG
        var SEROLOGIJANapomena = "";
        // COVID-19 RT-PCR Test
        var RTPCRNapomena = "";
        // Neisseria gonorrhea DNK;
        var ngDNKNapomena = "";
        var SpikeNapomena = "";

        if (ngDNK === "negativan") {
          ngDNKNapomena = "";
        } else if (ngDNK === "pozitivan") {
          ngDNKNapomena = "";
        } else {
          ngDNKNapomena = "";
        }

        if (
          (cov2IgM === "negativan" && cov2IgG === "") ||
          (cov2IgM === "pozitivan" && cov2IgG === "")
        ) {
          SEROLOGIJANapomena = "";
        } else if (cov2IgM === "" && cov2IgG === "negativan") {
          SEROLOGIJANapomena = "";
        } else if (cov2IgM === "" && cov2IgG === "pozitivan") {
          SEROLOGIJANapomena = "";
        } else if (cov2IgM === "negativan" && cov2IgG === "negativan") {
          // console.log("negativan/negativan")
          SEROLOGIJANapomena = "";
        } else if (cov2IgM === "negativan" && cov2IgG === "pozitivan") {
          // console.log("negativan/pozitivan")
          SEROLOGIJANapomena = "";
        } else if (cov2IgM === "pozitivan" && cov2IgG === "negativan") {
          // console.log("pozitivan/negativan")
          SEROLOGIJANapomena = "";
        } else if (cov2IgM === "pozitivan" && cov2IgG === "pozitivan") {
          // console.log("pozitivan/pozitivan")
          SEROLOGIJANapomena = "";
        }

        // Antigen SARS-CoV-2

        if (cov2Ag === "pozitivan") {
          // console.log("pozitivan")
          COV2AgNapomena = "";
        } else if (cov2Ag === "negativan") {
          // console.log("negativan")
          COV2AgNapomena = "";
        }

        // SARS-CoV-2 IgG spike RBD

        if (Spike === "pozitivan") {
          // console.log("pozitivan")
          SpikeNapomena = "";
        } else if (Spike === "negativan") {
          // console.log("negativan")
          SpikeNapomena = "";
        }

        // Antigen SARS-CoV-2 / Influenza A i B

        if (SARS === "negativan" && Influenza === "negativan") {
          // console.log("negativan/negativan")
          COMBoNapomena = "";
        } else if (SARS === "negativan" && Influenza === "pozitivan") {
          // console.log("negativan/pozitivan")
          COMBoNapomena = "";
        } else if (SARS === "pozitivan" && Influenza === "negativan") {
          // console.log("pozitivan/negativan")
          COMBoNapomena = "";
        } else if (SARS === "pozitivan" && Influenza === "pozitivan") {
          // console.log("pozitivan/pozitivan")
          COMBoNapomena = "";
        }

        // KOMENTARI
        // COV2AgNapomena
        // COMBoNapomena
        // SEROLOGIJANapomena
        // RTPCRNapomena

        // console.log(comment)
        // console.log(COV2AgNapomena)
        // console.log(COMBoNapomena)
        // console.log(SEROLOGIJANapomena)
        // console.log(RTPCRNapomena)

        napomena =
          COV2AgNapomena +
          COMBoNapomena +
          SEROLOGIJANapomena +
          RTPCRNapomena +
          ngDNKNapomena +
          SpikeNapomena;

        // console.log(napomena)

        if (EN === true) {
          napomena = "";

          if (Rezultat === "negative") {
            napomena = "";
          }

          if (Rezultat === "positive") {
            napomena = "";
          }

          if (napomena.trim().length) {
            doc.moveDown(0.5);

            doc.font("PTSansRegular");
            eachLineNapomena = napomena.split("\n");

            for (var i = 0, l = eachLineNapomena.length; i < l; i++) {
              if (
                eachLineNapomena[i].includes("Analysis: Antigen SARS-CoV-2")
              ) {
                doc
                  .font("PTSansBold")
                  .text(eachLineNapomena[i], { width: 465, align: "justify" });
                if (eachLineNapomena[i].length === 0) {
                  doc.moveDown(0.5);
                }
              } else {
                doc
                  .font("PTSansRegular")
                  .text(eachLineNapomena[i], { width: 465, align: "justify" });
                if (eachLineNapomena[i].length === 0) {
                  doc.moveDown(0.5);
                }
              }
            }
          }
        } else if (DE === true) {
          napomena = "";

          if (Rezultat === "Negativ") {
            napomena = "";
          }

          if (Rezultat === "Positiv") {
            napomena = "";
          }

          if (napomena.trim().length) {
            doc.moveDown(0.5);

            doc.font("PTSansRegular");
            eachLineNapomena = napomena.split("\n");

            for (var i = 0, l = eachLineNapomena.length; i < l; i++) {
              if (eachLineNapomena[i].includes("Analyse: Antigen SARS-CoV-2")) {
                doc
                  .font("PTSansBold")
                  .text(eachLineNapomena[i], { width: 465, align: "justify" });
                if (eachLineNapomena[i].length === 0) {
                  doc.moveDown(0.5);
                }
              } else {
                doc
                  .font("PTSansRegular")
                  .text(eachLineNapomena[i], { width: 465, align: "justify" });
                if (eachLineNapomena[i].length === 0) {
                  doc.moveDown(0.5);
                }
              }
            }
          }
        } else {
          if (comment.trim().length) {
            doc.moveDown(0.5);
            doc.fontSize(12).text("Komentar:", 50);

            doc.font("PTSansRegular");
            eachLineComment = comment.split("\n");

            for (var i = 0, l = eachLineComment.length; i < l; i++) {
              doc.text(eachLineComment[i], {
                width: 465,
                align: "justify",
              });
              if (eachLineComment[i].length === 0) {
                // doc.moveDown(1);
              }
            }
          }

          if (napomena.trim().length || ngDNKNapomena.length) {
            doc.moveDown(0.5);

            doc.font("PTSansRegular");
            eachLineNapomena = napomena.split("\n");

            for (var i = 0, l = eachLineNapomena.length; i < l; i++) {
              if (
                eachLineNapomena[i].includes("KOMENTAR:") ||
                eachLineNapomena[i].includes(
                  "Serološki nema dokaza aktivne niti pasivne COVID-19 infekcije!"
                ) ||
                eachLineNapomena[i].includes(
                  "Serološki nema dokaza aktivne COVID-19 infekcije!"
                ) ||
                eachLineNapomena[i].includes(
                  "Povišena IgG antitijela - Prebolovana COVID-19 infekcija."
                ) ||
                eachLineNapomena[i].includes(
                  "Povišena IgM antitijela - Moguća infekcija u toku."
                ) ||
                eachLineNapomena[i].includes(
                  "Povišena IgM i IgG antitijela. Moguća infekcija u razvoju."
                ) ||
                eachLineNapomena[i].includes("Pretraga: Antigen SARS-CoV-2") ||
                eachLineNapomena[i].includes(
                  "Pretraga: Antigen SARS-CoV-2 / Influenza A i B"
                ) ||
                eachLineNapomena[i].includes("Pretraga: Covid 19 IgM") ||
                eachLineNapomena[i].includes("Pretraga: Covid 19 IgG") ||
                eachLineNapomena[i].includes(
                  "Pretrage: Covid 19 IgM i Covid 19 IgG"
                )
              ) {
                doc
                  .font("PTSansBold")
                  .text(eachLineNapomena[i], { width: 465, align: "justify" });
                if (eachLineNapomena[i].length === 0) {
                  doc.moveDown(0.5);
                }
              } else {
                doc
                  .font("PTSansRegular")
                  .text(eachLineNapomena[i], { width: 465, align: "justify" });
                if (eachLineNapomena[i].length === 0) {
                  doc.moveDown(0.5);
                }
              }
            }
          }
        }

        memo = doc.y - tmpENA;

        // console.log(doc.y)
        // doc.font("PTSansRegular").fontSize(10).text("_______________________________", 390).text("       Voditelj laboratorija");

        if (EN == true) {
          doc.image(
            config.nalaz_signature + code + "-" + "EN-Antigen" + ".png",
            372,
            doc.y - 10,
            { width: 150, keepAspectRatio: true }
          );
        } else if (DE == true) {
          doc.image(
            config.nalaz_signature + code + "-" + "DE-Antigen" + ".png",
            372,
            doc.y - 10,
            { width: 150, keepAspectRatio: true }
          );
        } else {
          if (micro === true) {
            doc.image(
              config.nalaz_signature + "Mikrobiologija.png",
              372,
              doc.y - 10,
              { width: 150, keepAspectRatio: true }
            );
          } else {
            // doc.image(
            //   config.nalaz_signature + code + "-" + config.user + ".png",
            //   372,
            //   doc.y - 10,
            //   { width: 150, keepAspectRatio: true }
            // );

            doc.moveDown(2);

           /*  doc.image(
              config.nalaz_signature + code + "-" + "centrallab" + ".png",
              372,
              doc.y - 40,
              { width: 150, keepAspectRatio: true }
            );

            doc.image(
              config.nalaz_signature + code + "-" + "Stamp" + ".png",
              190,
              doc.y - 20,
              { width: 120, keepAspectRatio: true }
            ); */

            doc.font("PTSansRegular").fontSize(10).text("_______________________________", 390).text("       Voditelj laboratorija");

          }
        }

        const range = doc.bufferedPageRange();

        /*  for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(9).fillColor("#7B8186").moveTo(0, 754)                      
      .lineTo(650, 754)
      .fillAndStroke("#7B8186", "#7B8186")
      doc.font("PTSansRegular").fontSize(8).fillColor("#7B8186").text(report._id, 60, 760, { lineBreak: false });
    
      doc.font("PTSansBold").fontSize(8).fillColor("#7B8186").text("ATOM Laboratory Software", 460, 760, { lineBreak: false });
      doc.font("PTSansRegular").fontSize(8).fillColor("#7B8186").text("by", 460, 770, { lineBreak: false });   
      doc.font("PTSansBold").fontSize(8).fillColor("#7B8186").text("iLab d.o.o. Sarajevo", 470, 770, { lineBreak: false });
    
    } */

        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          doc
            .font("PTSansRegular")
            .fontSize(10)
            .fillColor("#7B8186")
            .text(adresa, 50, 740, { lineBreak: false });
          doc
            .fontSize(9)
            .fillColor("#7B8186")
            .moveTo(0, 756)
            .lineTo(650, 756)
            .lineWidth(0.7)
            .opacity(0.5)
            .fillAndStroke("#7B8186", "#7B8186")
            .opacity(1);

          if (EN == true) {
            doc
              .font("PTSansRegular")
              .fontSize(9)
              .fillColor("black")
              .text("Patient: " + pacijent, 50, 760, { lineBreak: false });
          } else if (DE == true) {
            doc
              .font("PTSansRegular")
              .fontSize(9)
              .fillColor("black")
              .text("Patient: " + pacijent, 50, 760, { lineBreak: false });
          } else {
            doc
              .font("PTSansRegular")
              .fontSize(9)
              .fillColor("black")
              .text("Pacijent: " + pacijent, 50, 760, { lineBreak: false });
          }

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

          if (EN == true) {
            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("black")
              .text(
                `Page ${i + 1} of ${range.count}`,
                doc.page.width / 2 - 25,
                doc.page.height - 18,
                { lineBreak: false }
              );
          } else if (DE == true) {
            doc
              .font("PTSansRegular")
              .fontSize(8)
              .fillColor("black")
              .text(
                `Seite ${i + 1} von ${range.count}`,
                doc.page.width / 2 - 25,
                doc.page.height - 18,
                { lineBreak: false }
              );
          } else {
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
        }
        doc.end();
      }
    );
  },
};
