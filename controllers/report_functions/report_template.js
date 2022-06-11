const { image } = require("pdfkit");

module.exports = {
  create_report: function (report, config, data, legenda, sekcijeniz, napomena,
    res, specificni, type, naziv, lokacija, site, site_data, uzorakBris) {

    let code = site_data.sifra;
    let adresa_x = 0;
    let adresa = "";
    let logoX = 50;
    let logoY = 20;

    // console.log(data)

    if(data.posiljaoc != null){
      // console.log(data.posiljaoc)
    }

    var Analiza = "";
    var Rezultat = "";
    var EN = false;
    var DE = false;

    var micro = false

    if(sekcijeniz.length === 1){
      sekcijeniz.forEach(element => {
        Rezultat = element[0].rezultat[1].rezultat;
        element.forEach(test => {
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

    if(Analiza != ""){
      if(Rezultat === "negative" || Rezultat === "positive"){
        // console.log("Kreirati nalaz na Engleskom jeziku.")
        // console.log(Analiza + ": " + Rezultat)
        EN = true
        DE = false
      } else if(Rezultat === "Negativ" || Rezultat === "Positiv"){
        // console.log("Kreirati nalaz na Njemačkom jeziku.")
        // console.log(Analiza + ": " + Rezultat)
        EN = false
        DE = true
      } else{
        // console.log("Kreirati nalaz na Bosanskom jeziku.")
        // console.log(Analiza + ": " + Rezultat)
        EN = false
        DE = false
      }  
    }else{
      
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
        
        adresa = "Nalaz je izdat u elektronskoj formi i validan je bez pečata i potpisa."
        break;
    }
    
    var fs = require("fs");
    PDFDocument = require("pdfkit");
    const PDFDocumentWithTables = require("./pdf_class");
    var rowsno = "Rezultati laboratorijskih pretraga";

    if(EN == true){
      rowsno = "Results of Laboratory Analysis";
    } else if(DE == true){
      rowsno = "Ergebnisse von Laboranalysen";
    }else{
      rowsno = "Rezultati laboratorijskih pretraga";
    }

    var rows = [];
    var temp = [];

    var pid = report.pid

    var datRodjenja = data.jmbg.substring(0, 2) + "." + data.jmbg.substring(2, 4) + ".";

    if (type != undefined && naziv != undefined && type === "single") {
      var nalazPath = config.nalaz_path + "/samples/";
      var imeFile = naziv;
    } else if (type != undefined && naziv != undefined && type === "multi") {
      var nalazPath = config.nalaz_path;
      var imeFile = naziv;
    } else if (type != undefined && naziv != undefined && type === "partial") {
      var nalazPath = config.nalaz_path + "/partials/";
      var imeFile = naziv;
    } else {
      var nalazPath = config.nalaz_path;
      var imeFile = report._id;
    }

    const doc = new PDFDocumentWithTables({ bufferPages: true, margins: { top: 80, bottom: 50, left: 50, right: 50 } });
    doc.pipe(fs.createWriteStream(nalazPath + imeFile + ".pdf").on("finish", function () {
      res.json({
        success: true,
        message: "Nalaz uspješno kreiran.",
        id: report._id,
        lokacija: lokacija,
        memo: memo
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
    doc.image(config.nalaz_logo + code + ".jpg", logoX, logoY, { width: 280, keepAspectRatio: true });

    switch (code) {

      case "A": // Avaz BC

      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Skenderija 5", 388, 20);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("71000 Sarajevo, Bosna i Hercegovina", 388, 32.5);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Telefon:", 388, 45).text("+387 (0)33 922-152", 427.6, 45);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Mobitel: +387 (0)61 071-181", 388, 57.5);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Web:", 388, 70).fillColor("#0000EE").text("www.poliklinika-atrijum.ba", 414, 70);
        
        break;

      case "B": // Skenderija

      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Skenderija 5", 388, 20);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("71000 Sarajevo, Bosna i Hercegovina", 388, 32.5);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Telefon:", 388, 45).text("+387 (0)33 922-152", 427.6, 45);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Mobitel: +387 (0)61 071-181", 388, 57.5);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Web:", 388, 70).fillColor("#0000EE").text("www.poliklinika-atrijum.ba", 414, 70);
        
        break;

      case "G": // Goražde

      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("43. drinske brigade 20", 388, 20);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("73000 Goražde, Bosna i Hercegovina", 388, 32.5);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Telefon:", 388, 45).text("+387 (0)38 941-845", 427.6, 45);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Mobitel: +387 (0)61 316-607", 388, 57.5);
      doc.font("PTSansRegular").fontSize(10.5).fillColor("black").text("Web:", 388, 70).fillColor("#0000EE").text("www.poliklinika-atrijum.ba", 414, 70);
        
        break;
    
      default:
        break;
    }

    doc.fontSize(9).fillColor("#7B8186").moveTo(0, 90)                      
   .lineTo(650, 90)
   .lineWidth(0.7)
   .opacity(0.5)
   .fillAndStroke("#7B8186", "#7B8186")
   .opacity(1);

   

   if (data.telefon === "NEPOZNATO" || data.telefon === "Nema podataka" || data.telefon.trim() === "" || data.telefon.length < 9) {
    doc.font("PTSansRegular").fontSize(11).fillColor("#7B8186").text("RIQAS certificirana eksterna kontrola kvaliteta", 340, 150);
  } else {
    doc.font("PTSansRegular").fontSize(11).fillColor("#7B8186").text("RIQAS certificirana eksterna kontrola kvaliteta", 340, 160);
  }

    

    if(EN == true) {























































      if(data.posiljaoc != null){
        // console.log(data.posiljaoc)
        doc.font("PTSansRegular").fontSize(10).fillColor("#7B8186").text("For: " + data.posiljaoc.opis, 390, 95);
      }
  
      // doc.font("PTSansRegular").fontSize(13).fillColor("#7B8186").text("RIQAS certificirana eksterna kontrola kvaliteta", 308, 40);
      doc.font("PTSansRegular").fontSize(12).fillColor("black").text("Surname and name: ", 50, nvisina);
      doc.font("PTSansBold").fontSize(14).text(" " + data.prezime.toUpperCase() + " " + data.ime.toUpperCase(), 155, nvisina - 2);
  
      if (datRodjenja.includes("01.01") && data.godiste == "1920") {
        var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase()
        doc.font("PTSansRegular").fontSize(12).text("Date and year of birth:", 50, nvisina + 16).text("Nema podataka", 168, nvisina + 16);
      } else if (!datRodjenja.includes("00.00")) {
        var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase() + " (" + data.godiste + ")"
        doc.font("PTSansRegular").fontSize(12).text("Date and year of birth:", 50, nvisina + 16).text(datRodjenja + data.godiste + ".", 168, nvisina + 16);
      } else {
        var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase() + " (" + data.godiste + ")"
        doc.font("PTSansRegular").fontSize(12).text("Year of birth:", 50, nvisina + 16).text(data.godiste + ".", 120, nvisina + 16);
      }

      var Spol = "Nema podataka"

      if(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase() === "Muški"){
        Spol = "Male"
      }

      // console.log(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase())

      if(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase() === "Ženski"){
        Spol = "Female"
      }
  
      doc.font("PTSansRegular").fontSize(12).text("Gender:", 50, nvisina + 32).text(Spol, 96 - 3, nvisina + 32)
      
      // .text("Datum: ", 445 + 10, nvisina - 2).text(data.datum, 490 + 6, nvisina - 2);
  
      if (data.telefon === "NEPOZNATO" || data.telefon === "Nema podataka" || data.telefon.trim() === "" || data.telefon.length < 9) {
        data.telefon = "";
        nvisina = nvisina - 12
      } else {
        doc.font("PTSansRegular").fontSize(12).text("Contact:", 50, nvisina + 48).text(data.telefon, 150 - 54, nvisina + 48);
      }
  
      var uzorkovan = JSON.stringify(report.uzorkovano).substring(1, 11).split("-");
  
      // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(11).text("Broj protokola:", 341, nvisina + 240);
      // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(11).text(data.protokol, 414, nvisina + 240);
      
      // Date and time of reporting
      // Date and time of sampling
      doc.font("PTSansRegular").fontSize(10).text("Date and time of reporting:", 390, nvisina + 3 + 15 + 3)
      doc.font("PTSansBold").text(data.datum + " " + data.vrijeme.substring(0, 5), 390, nvisina + 18 + 15 + 3);
     
      
      
      doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text("Date and time of sampling:", 390, nvisina + 18 + 30 + 3);
      doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text(uzorkovan[2] + "." + uzorkovan[1] + "." + uzorkovan[0] + " " + data.uzorkovano_t, 390, nvisina+ 18 + 45 + 3);
      // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text("Broj protokola: ", 333, nvisina + 50);
      // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(10).text(data.protokol, 390 + 10, nvisina + 50);
      doc.font("PTSansBold").fontSize(12).text(rowsno, 50, nvisina + 70);
      doc.moveDown(0.6);














































    } else if (DE == true) {





















































      // Njemački jezik - Antigen
      // Antigen test COVID-19 / SARS-CoV-2

      if(data.posiljaoc != null){
        // console.log(data.posiljaoc)
        doc.font("PTSansRegular").fontSize(10).fillColor("#7B8186").text("Vür: " + data.posiljaoc.opis, 390, 95);
      }
  
      // doc.font("PTSansRegular").fontSize(13).fillColor("#7B8186").text("RIQAS certificirana eksterna kontrola kvaliteta", 308, 40);
      doc.font("PTSansRegular").fontSize(12).fillColor("black").text("Vor- und Nachname: ", 50, nvisina);
        doc.font("PTSansBold").fontSize(14).text(" " + data.ime.toUpperCase() + " " + data.prezime.toUpperCase(), 153, nvisina - 2);
    
        if (datRodjenja.includes("01.01") && data.godiste == "1920") {
          var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase()
          doc.font("PTSansRegular").fontSize(12).text("Geburtsdatum:", 50, nvisina + 16).text("Nema podataka", 130, nvisina + 16);
        } else if (!datRodjenja.includes("00.00")) {
          var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase() + " (" + data.godiste + ")"
          doc.font("PTSansRegular").fontSize(12).text("Geburtsdatum:", 50, nvisina + 16).text(datRodjenja + data.godiste + ".", 130, nvisina + 16);
        } else {
          var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase() + " (" + data.godiste + ")"
          doc.font("PTSansRegular").fontSize(12).text("Geburtsjahr:", 50, nvisina + 16).text(data.godiste + ".", 118, nvisina + 16);
        }
    
        // doc.font("PTSansRegular").fontSize(12).text("Geschlecht:", 50, nvisina + 32).text(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase(), 96 - 17, nvisina + 32).text("Datum: ", 445 + 10, nvisina - 2).text(data.datum, 498, nvisina - 2);
    
        var Spol = "Nema podataka"

        if(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase() === "Muški"){
          Spol = "Männlich"
        }
  
        // console.log(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase())
  
        if(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase() === "Ženski"){
          Spol = "Weiblich"
        }
      
          doc.font("PTSansRegular").fontSize(12).text("Geschlecht:", 50, nvisina + 32).text(Spol, 115, nvisina + 32);
      
          if (data.telefon === "NEPOZNATO") {
            data.telefon = "";
          } else {
            doc.font("PTSansRegular").fontSize(12).text("Kontakt:", 50, nvisina + 48).text(data.telefon, 150 - 54, nvisina + 48);
          }
    
  
      var uzorkovan = JSON.stringify(report.uzorkovano).substring(1, 11).split("-");
  
      // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(11).text("Broj protokola:", 341, nvisina + 240);
      // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(11).text(data.protokol, 414, nvisina + 240);
      
      // Date and time of reporting
      // Date and time of sampling
      doc.font("PTSansRegular").fontSize(10).text("Datum und Uhrzeit der Berichterstattung:", 390, nvisina + 3 + 15 + 3)
      doc.font("PTSansBold").text(data.datum + " " + data.vrijeme.substring(0, 5), 470, nvisina + 18 + 13 + 3);
     
      
      
      doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text("Datum und Uhrzeit der Probenahme:", 390, nvisina + 18 + 30 + 3);
      doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text(uzorkovan[2] + "." + uzorkovan[1] + "." + uzorkovan[0] + " " + data.uzorkovano_t, 390, nvisina+ 18 + 45 + 3);
      // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text("Broj protokola: ", 333, nvisina + 50);
      // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(10).text(data.protokol, 390 + 10, nvisina + 50);
      doc.font("PTSansBold").fontSize(12).text(rowsno, 50, nvisina + 70);
      doc.moveDown(0.6);














































    } else {










      if(data.posiljaoc != null){
        // console.log(data.posiljaoc)
        doc.font("PTSansRegular").fontSize(10).fillColor("#7B8186").text("Za: " + data.posiljaoc.opis, 390, 95);
      }
  
      // doc.font("PTSansRegular").fontSize(13).fillColor("#7B8186").text("RIQAS certificirana eksterna kontrola kvaliteta", 308, 40);
      doc.font("PTSansRegular").fontSize(12).fillColor("black").text("Prezime i ime: ", 50, nvisina);
      doc.font("PTSansBold").fontSize(14).text(" " + data.prezime.toUpperCase() + " " + data.ime.toUpperCase(), 142 - 17, nvisina - 2);
  
      if (datRodjenja.includes("01.01") && data.godiste == "1920") {
        var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase()
        doc.font("PTSansRegular").fontSize(12).text("Datum rođenja:", 50, nvisina + 16).text("Nema podataka", 150 - 17, nvisina + 16);
      } else if (!datRodjenja.includes("00.00")) {
        var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase() + " (" + data.godiste + ")"
        doc.font("PTSansRegular").fontSize(12).text("Datum rođenja:", 50, nvisina + 16).text(datRodjenja + data.godiste + ".", 150 - 17, nvisina + 16);
      } else {
        var pacijent = data.prezime.toUpperCase() + " " + data.ime.toUpperCase() + " (" + data.godiste + ")"
        doc.font("PTSansRegular").fontSize(12).text("Godište:", 50, nvisina + 16).text(data.godiste + ".", 150 - 56, nvisina + 16);
      }
  
      doc.font("PTSansRegular").fontSize(12).text("Spol:", 50, nvisina + 32).text(data.spol[0].toUpperCase() + data.spol.slice(1).toLowerCase(), 96 - 17, nvisina + 32)
      
      // .text("Datum: ", 445 + 10, nvisina - 2).text(data.datum, 490 + 6, nvisina - 2);
  
      if (data.telefon === "NEPOZNATO" || data.telefon === "Nema podataka" || data.telefon.trim() === "" || data.telefon.length < 9) {
        data.telefon = "";
        nvisina = nvisina - 12
      } else {
        doc.font("PTSansRegular").fontSize(12).text("Kontakt:", 50, nvisina + 48).text(data.telefon, 150 - 54, nvisina + 48);
      }
  
      var uzorkovan = JSON.stringify(report.uzorkovano).substring(1, 11).split("-");
  
      // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(11).text("Broj protokola:", 341, nvisina + 240);
      // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(11).text(data.protokol, 414, nvisina + 240);
  
      doc.font("PTSansRegular").fontSize(10).text("Izdavanje nalaza:", 390, nvisina + 3 + 15 + 3).font("PTSansBold").text(data.datum + " " + data.vrijeme.substring(0, 5), 468, nvisina + 3 + 15 + 3);
      doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text("Vrijeme uzorkovanja:", 390, nvisina + 18 + 15 + 3);
      doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text(uzorkovan[2] + "." + uzorkovan[1] + "." + uzorkovan[0] + " " + data.uzorkovano_t, 482, nvisina + 33 + 3);
      // doc.font("PTSansRegular", config.nalaz_ptsansbold).fontSize(10).text("Broj protokola: ", 333, nvisina + 50);
      // doc.font("PTSansBold", config.nalaz_ptsansbold).fontSize(10).text(data.protokol, 390 + 10, nvisina + 50);
      doc.font("PTSansBold").fontSize(12).text(rowsno, 50, nvisina + 70);
      doc.moveDown(0.6);





    }

    if(uzorakBris != ""){
      // console.log(uzorakBris)
      doc.image(config.barcode_path + uzorakBris + ".png", 260, 130, { width: 100, keepAspectRatio: true, align: "center", valign: "center" });
    } 

    var i = 0;
    var rows = [];
    var analit = true;
    var reset = 0;

    var cov2Ag = "";
    var cov2IgM = "";
    var cov2IgG = "";  
    var Spike = "";

    var ngDNK = "";
    
    var SARS = ""
    var Influenza = ""
    var nazofarings = false;

    var enap = false;

    sekcijeniz.forEach(element => {

      element.forEach(niz => {
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

          if(element[0].sekcija.trim() === "Mikrobiologija"){
            micro = true
          }

          doc.fontSize(12).opacity(0.4).rect(50, doc.y, 511.5, 15).fill("#60c3ae").fillColor("black").opacity(1).text(element[0].sekcija, 50);

        }

        element.forEach(test => {
          if (test.hasOwnProperty("multi")) {
            analit = false;
            multi.push({
              naslov: test.test,
              headers: report.headersa,
              rows: test.rezultat
            });
          } else {

            // console.log(test.rezultat[1].kontrola)

            if(test.rezultat[0].includes("COVID-19 RT-PCR Test")){
              nazofarings = true;
            }

            if(test.rezultat[0].includes("Antigen SARS-CoV-2")){
              nazofarings = true;
              switch (test.rezultat[1].kontrola) {
                case "Green":
                  cov2Ag = "negativan"                  
                  break;

                case "Yellow":
                  // cov2Ag = "graničan"   
                  cov2Ag = ""               
                  break;

                case "No Class":
                  cov2Ag = ""                  
                  break;

                case "Red":
                  cov2Ag = "pozitivan"                  
                  break;
              
                default:
                  cov2Ag = ""
                  break;
              }
            } 

            if(test.rezultat[0].includes("Covid 19 IgM")){
              switch (test.rezultat[1].kontrola) {
                case "Green":
                  cov2IgM = "negativan"                  
                  break;

                case "Yellow":
                  cov2IgM = ""                  
                  break;
                
                case "No Class":
                    cov2IgM = ""                  
                    break;

                case "Red":
                  cov2IgM = "pozitivan"                  
                  break;
              
                default:
                  cov2IgM = ""
                  break;
              }   
            } 

            // ngDNK = "";

            if(test.rezultat[0].includes("Neisseria gonorrhea DNK")){
              switch (test.rezultat[1].kontrola) {
                case "Green":
                  ngDNK = "negativan"                  
                  break;

                case "Yellow":
                  ngDNK = ""                  
                  break;
                
                case "No Class":
                  ngDNK = ""                  
                    break;

                case "Red":
                  ngDNK = "pozitivan"                  
                  break;
              
                default:
                  ngDNK = ""
                  break;
              }   
            } 

            if(test.rezultat[0].includes("Covid 19 IgG")){
              switch (test.rezultat[1].kontrola) {
                case "Green":
                  cov2IgG = "negativan"                  
                  break;

                case "Yellow":
                  cov2IgG = ""                  
                  break;

                case "No Class":
                  cov2IgG = ""                  
                  break;

                case "Red":
                  cov2IgG = "pozitivan"                  
                  break;
              
                default:
                  cov2IgG = ""
                  break;
              } 
            } 

            if(test.rezultat[0].includes("IgG spike")){
              switch (test.rezultat[1].kontrola) {
                case "Green":
                  Spike = "negativan"                  
                  break;

                case "Yellow":
                  Spike = ""                  
                  break;

                case "No Class":
                  Spike = ""                  
                  break;

                case "Red":
                  Spike = "pozitivan"                  
                  break;
              
                default:
                  Spike = ""
                  break;
              } 
            } 

            rows.push(test.rezultat);
            analit = true;
          }
        });

        if (analit || rows.length) {
          // HEX #60c3ae
          
          if (EN === true) {
            doc.table_default_antigen({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
          
          } else if (DE === true) {
            doc.table_default_DE({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
          
          } else {
            doc.table_default({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
          
          }

          multi.forEach(mul => {

            
            // doc.fontSize(12).text(mul.naslov, 50);
            doc.fontSize(12).opacity(0.4).rect(50, doc.y, 511.5, 15).fill("#60c3ae").fillColor("black").opacity(1).fontSize(8).fillColor("red").text(mul.naslov.slice(1, 2), 50).fontSize(12).fillColor("black").text(mul.naslov.slice(4), 57, doc.y - 11);
            // HEX #60c3ae    
            if (EN === true) {
              doc.table_default_antigen({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
            
            } else if (DE === true) {
              doc.table_default_DE({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
            
            } else {
              doc.table_default({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
            
            }
            
          });
          multi = [];
        } else {
          if (multi.length) {
            multi.forEach(mul => {
              if (doc.y > 650) {
                doc.addPage();
              }

              // Antigen SARS-CoV-2 / Influenza A i B

              SARS = ""
              Influenza = ""

              if(mul.naslov.includes("COVID-19 RT-PCR Test")){
                nazofarings = true;
              }

              if(mul.naslov.includes("Antigen SARS-CoV-2 / Influenza A i B")){
                nazofarings = true;

                mul.rows.forEach(element => {
                  // console.log(element[0] + ": " + element[1].rezultat+ " - " + element[1].kontrola)

                  // Antigen SARS-CoV-2

                  if(element[0] == "Antigen SARS-CoV-2"){
                    switch (element[1].kontrola) {
                      case "Green":
                        SARS = "negativan"                  
                        break;
      
                      case "Yellow":
                        SARS = ""                  
                        break;
      
                      case "No Class":
                        SARS = ""                  
                        break;
      
                      case "Red":
                        SARS = "pozitivan"                  
                        break;
                    
                      default:
                        SARS = ""
                        break;
                    } 
                  } 

                  // Influenza A i B

                  if(element[0] == "Influenza A i B"){
                    switch (element[1].kontrola) {
                      case "Green":
                        Influenza = "negativan"                  
                        break;
      
                      case "Yellow":
                        Influenza = "pozitivan"                  
                        break;
      
                      case "No Class":
                        Influenza = ""                  
                        break;
      
                      case "Red":
                        Influenza = "pozitivan"                  
                        break;
                    
                      default:
                        Influenza = ""
                        break;
                    } 
                  } 
                  
                  
                });

              }

              // console.log(mul.naslov)
              // console.log(mul.rows)

              if (mul.naslov.slice(4).includes("ENA PROFIL")) {
                enap = true;
              } 

              if (mul.naslov.slice(4).trim() === "Sediment urina" || mul.naslov.slice(4).trim().includes("Pregled sedimenta urina")) {
                mul.rows.forEach(red => {
                  if (red[1].rezultat.includes(";")) {
                    reset = reset + 3;
                  }
                });
                doc.fontSize(12).opacity(0.4).rect(50, doc.y, 511.5, 15).fill("#60c3ae").fillColor("black").opacity(1).fontSize(8).fillColor("red").text(mul.naslov.slice(1, 2), 50).fontSize(12).fillColor("black").text(mul.naslov.slice(4), 57, doc.y - 11);
                // HEX #60c3ae
                doc.table_sediment({ headers: mul.headers, rows: mul.rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
              } else if (mul.naslov.slice(4).trim() === "Spermiogram") {
                mul.rows.forEach(red => {
                  if (red[1].rezultat.includes(";")) {
                    reset = reset + 3;
                  }
                });
                doc.fontSize(12).opacity(0.4).rect(50, doc.y, 511.5, 15).fill("#60c3ae").fillColor("black").opacity(1).fontSize(8).fillColor("red").text(mul.naslov.slice(1, 2), 50).fontSize(12).fillColor("black").text(mul.naslov.slice(4), 57, doc.y - 11);
                // HEX #60c3ae
                if (EN === true) {
                  doc.table_default_antigen({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
                
                } else if (DE === true) {
                  doc.table_default_DE({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
                
                } else {
                  doc.table_default({ headers: mul.headers, rows: mul.rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
                
                }
                
              } else {
                doc.fontSize(12).opacity(0.4).rect(50, doc.y, 511.5, 15).fill("#60c3ae").fillColor("black").opacity(1).fontSize(8).fillColor("red").text(mul.naslov.slice(1, 2), 50).fontSize(12).fillColor("black").text(mul.naslov.slice(4), 57, doc.y - 11);
                // HEX #60c3ae
                if (EN === true) {
                  doc.table_default_antigen({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
                
                } else if (DE === true) {
                  doc.table_default_DE({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
                
                } else {
                  doc.table_default({ headers: mul.headers, rows: mul.rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
                
                }
              }
            });
            doc.moveDown(0.4);
          }
        }
      }
    });

    // Mikrobiologija

    sekcijeniz.forEach(element => {
      if (element[0].mikrobiologija) {
        i++;
        analit = true;
        rows = [];
        multi = [];

        if (doc.y > 630) {
          doc.addPage();
        }

        if (element[0].multi === undefined) {

          if(element[0].sekcija.trim() === "Mikrobiologija"){
            micro = true
          }

          doc.fontSize(12).opacity(0.4).rect(50, doc.y, 511.5, 15).fill("#60c3ae").fillColor("black").opacity(1).text(element[0].sekcija, 50);

        }

        element.forEach(test => {

          rows.push(test.rezultat);
          analit = true;

          if (test.hasOwnProperty("data") && test.data.length > 1) {

            var obj = {}
            var ant = []
            var Bakterije = []
            const bheader = ["Antibiotik", "Rezultat", ""]
            let bnaslov = "Antibiogram za bakteriju: "

            test.data.forEach(bactery => {
              if (bactery.bakterija) {
                obj.bakterija_naziv = bactery.naziv;
                obj.bakterija_opis = bactery.opis;
                obj.antibiogram_naziv = bactery.antibiogram.naziv;
                obj.antibiogram_opis = bactery.antibiogram.opis;
                obj.antibiotici = []

                bactery.antibiogram.antibiotici.forEach(antibiotik => {
                  if (antibiotik.rezultat != "") {

                    ant.push(antibiotik.opis)

                    ant.naziv = antibiotik.naziv;
                    ant.opis = antibiotik.opis;
                    switch (antibiotik.rezultat) {
                      case "S":
                        ant.push({
                          rezultat: 'Senzitivan',
                          kontrola: 'No Class'
                        })
                        break;

                      case "I":
                        ant.push({
                          rezultat: 'Intermedijaran',
                          kontrola: 'No Class'
                        })
                        break;
                      case "R":
                        ant.push({
                          rezultat: 'Rezistentan',
                          kontrola: 'No Class'
                        })
                        break;

                      default:
                        break;
                    }

                    ant.push("")
                    ant.push({
                      reference: '/',
                      extend: ''
                    })

                    obj.antibiotici.push(ant)
                  }
                  ant = []
                });
                Bakterije.push(obj)
                obj = {}
              }
            });

            Bakterije.forEach(Bakt => {
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
          // HEX #60c3ae
          doc.table_mikrobiologija({ headers: report.headers, rows: rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) }
          );
          multi.forEach(mul => {
            if (doc.y > 630) {
              doc.addPage();
            }
            doc.fontSize(11).fillColor("#7B8186").text(mul.naslov.slice(0, 25), 50).fontSize(12).fillColor("black").text(mul.naslov.slice(25), 170, doc.y - 15);
            doc.fillColor("black")
            doc.moveDown(0.2);
            // HEX #60c3ae
            doc.table_antibiotici({ headers: mul.headers, rows: mul.rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
            doc.moveDown(0.5);
          });
          multi = [];
        }

        /* if (multi.length) {
          multi.forEach(mul => {
            if (doc.y > 650) {
              doc.addPage();
            }
            doc.fontSize(12).opacity(0.4).rect(50, doc.y, 511.5, 15).fill("#60c3ae").fillColor("black").opacity(1).fontSize(8).fillColor("red").text(mul.naslov.slice(1, 2), 50).fontSize(12).fillColor("black").text(mul.naslov.slice(4), 57, doc.y - 11);
            // HEX #60c3ae
            doc.table_antibiotici({ headers: mul.headers, rows: mul.rows }, { prepareHeader: () => doc.fontSize(8), prepareRow: (row, i) => doc.fontSize(10) });
          });
        } */
      }
    });

    var leg = "";

    legenda.forEach(element => {
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

        if(nazofarings){

          if (EN === true) {
            leg += element + "-" + "Nasopharyngeal swab, ";
          } else if (DE === true) {
            leg += element + "-" + "Abstrich aus Nasopharynx, ";
          } else {
            leg += element + "-" + "Bris nazofarinksa, ";
          }
          

        }else{
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
      doc.fontSize(8).text("Legenda: L - nizak, H - visok\n" + leg, 50, doc.y + reset);
    }

    if (specificni != undefined && specificni.length) {
      var ref = "";

      specificni = specificni.sort(function (a, b) {
        return a.fussnote.localeCompare(b.fussnote, undefined, {
          numeric: true,
          sensitivity: "base"
        });
      });

      var hormoni = false;
      var roma = false;

      

      specificni.forEach(element => {

        if(element.extend.includes("Hormones")){
          hormoni = true;
        }

        if(element.extend.includes("ROMAindex")){
          roma = true;
        }

        ref = element.extend;
        // console.log(element.fussnote)
        // doc.fontSize(7).text(element.fussnote + " " + ref, 50);
      });
    }

    doc.font("PTSansBold").fontSize(12);

    if (doc.y > 680) {
      doc.addPage();
    }

    if(hormoni){
      // console.log("Spolni hormoni")
      
      doc.image(config.nalaz_references + "Hormones.png", 50, doc.y + 15, { width: 510, keepAspectRatio: true, lineBreak: false });
      doc.moveDown(10);
    }

    if(enap === true){
      // console.log("Alergije")

      var tmpENA = 0;
      
      doc.image(config.nalaz_references + "ENAP.png", 50, doc.y + 15, { width: 510, keepAspectRatio: true, lineBreak: false });
      doc.moveDown(7);
    }else{

      tmpENA = 0;

    }

    if(roma){
      console.log("ROMA index")
      // doc.image(config.nalaz_references + "ROMAindex.png", 50, doc.y + 15, { width: 510, keepAspectRatio: true, lineBreak: false });
      // doc.moveDown(9);
    }


    // var cov2Ag = "";
    // var cov2IgM = "";
    // var cov2IgG = "";
    // var Spike = "";  

    // Covid 19 IgM & Covid 19 IgG

    // KOMENTARI
    let comment = napomena
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

    if(ngDNK === "negativan"){
      ngDNKNapomena = "KOMENTAR:\n\nNije detektovana DNK Neisseria gonorrhea.\n\nMETODA: DNK je izolirana iz dobijenog biološkog uzorka pomoću kolonica sa silikatnom gel membranom (Bosphore® Bacterial DNA Extraction Spin Kit, IVD). Analiza ciljanog patogena je rađena putem Real-Time PCR metode (Unima 96, Bosphore®) upotrebom specifičnih prajmera i fluorescentnih proba koji se vezuju za ciljanu DNK sekvencu (Bosphore® STDs Panel Kit v5, IVD-CE).\n\nUPOZORENJE: Rezultate testiranja treba tumačiti u kontekstu sa kliničkim nalazom, uzorkovanjem biološkog materijala, i drugim laboratorijskim podacima. Ako se dobijeni rezultati ne podudaraju sa rezultatima drugih kliničkih i laboratorijskih nalaza, molimo da kontaktirate stručno osoblje Atrijum Laboratorije za moguće ponovno tumačenje.\n\n";
    }else if(ngDNK === "pozitivan"){
      ngDNKNapomena = "KOMENTAR:\n\nDetektovana je DNK Neisseria gonorrhea.\n\nMETODA: DNK je izolirana iz dobijenog biološkog uzorka pomoću kolonica sa silikatnom gel membranom (Bosphore® Bacterial DNA Extraction Spin Kit, IVD). Analiza ciljanog patogena je rađena putem Real-Time PCR metode (Unima 96, Bosphore®) upotrebom specifičnih prajmera i fluorescentnih proba koji se vezuju za ciljanu DNK sekvencu (Bosphore® STDs Panel Kit v5, IVD-CE).\n\nUPOZORENJE: Rezultate testiranja treba tumačiti u kontekstu sa kliničkim nalazom, uzorkovanjem biološkog materijala, i drugim laboratorijskim podacima. Ako se dobijeni rezultati ne podudaraju sa rezultatima drugih kliničkih i laboratorijskih nalaza, molimo da kontaktirate stručno osoblje Atrijum Laboratorije za moguće ponovno tumačenje.\n\n";
    }else{
      ngDNKNapomena = "";
    }
    
    if((cov2IgM === "negativan" && cov2IgG === "") || (cov2IgM === "pozitivan" && cov2IgG === "")){

      SEROLOGIJANapomena = "Pretraga: Covid 19 IgM\n- Pozitivna IgM antitijela - osoba trenutno ima infekciju (bez obzira na prisustvo ili odsustvo simptoma), razvija imunitet,ali je zarazna. Potvrda akutne infekcije - putem PCR testiranja. U slučaju pozitivnog PCR testa, neophodna je samoizolacija i kontrola testa nakon 14 dana.\n\n- Pozitivna IgG antitijela - osoba je bila inficirana, razvila je imunitet, nije zarazna.\n\n- Pozitivnai IgG i IgM antitijela - osoba još uvijek ima prisutnu infekciju i postepeno razvija trajni imunitet. U skladu sa uputama Epidemiološke službe neophodna je samoizolacija i kontrola testa nakon 14 dana.\n\n- Ukoliko su negativna oba antitijela - IgG i IgM osoba nema znakova imuniteta na COVID-19, ali se ne isključuje da infekcija postoji u ranoj fazi. Ako postoji sumnja na kontakt ili su prisutni simptomi ponoviti test za 3-7 dana.\n\n* Vrijednosti u zoni retestiranja potvrditi putem PCR testiranja.\n\n";




    }else if(cov2IgM === "" && cov2IgG === "negativan") {

      SEROLOGIJANapomena = "Opis (SARS-CoV-2 IgG):\nKvantitativni test (CLIA METODA), koji se koristi za praćenje stepena imunizacije nastale bilo prirodnim ili vakcinom indukovanim odgovorom.\n\n" + 
      "Napomena:\nTest SARS-CoV-2 IgGSARS-CoV-2 IgG antitijela se ne korisiti za postavljane dijagnoze COVID-19!\n\n" +
      "Zaključak:\nNisu detektovana povišena SARS-CoV-2 IgG antitijela. Nema seroloških znakova postojanja imunog odgovora nakon prebolovane Covid-19 infekcije ili nakon " +
      "sprovedene imunizacije - vakcinacije protiv SARS-CoV-2. Ukoliko je pacijent imao dokazanu Covid 19 infekciju, preporuka je testiranje sprovesti najmanje mjesec dana nakon pozitivnog PCR testa. Ukoliko je " +
      "sprovedena imunizacija (vakcinom indukovani odgovor), preporučuje se testiranje uraditi 2-4 sedmice nakon primljene druge doze vakcine (mRNA - Pfizer,Moderna; vektorske vakcine: AstraZeneca) ili 3-6 sedmica nakon " +
      "primljene druge doze inaktivirane vakcine - Sinofarm uz obavezno testiranje na SARS-CoV-2 IgG Spike RBD antitijela.\n\n";
    
    }else if(cov2IgM === "" && cov2IgG === "pozitivan") {

      SEROLOGIJANapomena = "Opis (SARS-CoV-2 IgG):\nKvantitativni test (CLIA METODA), koji se koristi za praćenje stepena imunizacije nastale bilo prirodnim ili vakcinom indukovanim odgovorom.\n\n" + 
      "Napomena:\nTest SARS-CoV-2 IgG antitijela se ne koristi za postavljane dijagnoze COVID-19!\n\n" +
      "Zaključak:\nPovišena SARS-CoV-2 IgG antitijela. Razvijen imuni odgovor nakon prebolovane Covid-19 infekcije ili nakon sprovedene imunizacije - vakcinacije protiv SARSCoV-2.\n\n";
    
    }
    
    
    
    
    
    
    else if(cov2IgM === "negativan" && cov2IgG === "negativan") {

      // console.log("negativan/negativan")
      SEROLOGIJANapomena = "Pretrage: Covid 19 IgM i Covid 19 IgG\nMetoda: Test se bazira na principu imunohemijske CLIA metode, odnosno detekcije COVID-19 specifičnih IgG i IgM/IgA antitijela u uzorcima ljudskog seruma.\n\nSerološki nema dokaza aktivne niti pasivne COVID-19 infekcije!\n\nUkoliko su negativna oba antitijela - IgG i IgM osoba nema znakova imuniteta na COVID-19, ali se ne isključuje da infekcija postoji u ranoj fazi. U slučaju klinički i anamnestički osnovane sumnje na COVID-19 virusnu infekciju preporučuje se kontrola ovog nalaza za 5-7 dana, i utvrđivanje uzročnika metodom PCR.\n\n";

    }else if(cov2IgM === "negativan" && cov2IgG === "pozitivan") {

      // console.log("negativan/pozitivan")
      SEROLOGIJANapomena = "Pretrage: Covid 19 IgM i Covid 19 IgG\nMetoda: Test se bazira na principu imunohemijske CLIA metode, odnosno detekcije COVID-19 specifičnih IgG i IgM/IgA antitijela u uzorcima ljudskog seruma.\n\nSerološki nema dokaza aktivne COVID-19 infekcije!\nPovišena IgG antitijela - Prebolovana COVID-19 infekcija.\n\n";

    }else if(cov2IgM === "pozitivan" && cov2IgG === "negativan") {

      // console.log("pozitivan/negativan")
      SEROLOGIJANapomena = "Pretrage: Covid 19 IgM i Covid 19 IgG\nMetoda: Test se bazira na principu imunohemijske CLIA metode, odnosno detekcije COVID-19 specifčnih IgG i IgM antitijela u uzorcima ljudskog seruma.\n\nPovišena IgM antitijela - Moguća infekcija u toku.\n\nMoguć kontakt s virusom. Za sigurnu potvrdu aktivne infekcije preporučuje se dokazivanje uzročnika metodom PCR. Obavezno se javiti ljekaru porodične medicine i nadležnoj epidemiološkoj službi.\n\n";

    }else if(cov2IgM === "pozitivan" && cov2IgG === "pozitivan") {

      // console.log("pozitivan/pozitivan")
      SEROLOGIJANapomena = "Pretrage: Covid 19 IgM i Covid 19 IgG\nMetoda: Test se bazira na principu imunohemijske CLIA metode, odnosno detekcije COVID-19 specifčnih IgG i IgM antitijela u uzorcima ljudskog seruma.\n\nPovišena IgM i IgG antitijela. Moguća infekcija u razvoju.\n\nObavezno se konsultovati s ljekarom porodične medicine i nadležnom epidemiološkom službomu vezi daljih preporuka!\n\nPosebna napomena: Ukoliko je prošao duži vremenski period (više od mjesec dana) nakon prvog pozitivnog PCR testa, smatra se da je pacijent u fazi rekonvalescencije (oporavka), te kao takav ne podliježe daljoj dijagnostičkoj obradi u smislu izrade PCR testa kao pokazatelja aktivne infekcije (osim po indikaciji ljekara u zavisnosti od kliničke slike).\n\n";

    }
    




      // Antigen SARS-CoV-2

      if(cov2Ag === "pozitivan") {

        // console.log("pozitivan")
        COV2AgNapomena = "Pretraga: Antigen SARS-CoV-2\nMetoda: Hromatografski imunološki test (Nal von minden GmbH, NADAL® COVID-19 AG Test) za kvalitativno otkrivanje specifičnih antigena SARS-CoV-2 prisutnih u nazofarinksu (specifičnost 99.9 %, senzitivnost 97.6 %)\n\nU uzorku detektovan Antigen SARS-CoV-2.\nMoguća aktivna COVID 19 virusna infekcija. Za sigurnu potvrdu aktivne infekcije preporučuje se dokazivanje uzročnika metodom PCR. Obavezno se javiti ljekaru porodične medicine i nadležnoj epidemiološkoj službi za dalje upute!\n\n";
  
      }else if(cov2Ag === "negativan") {

        // console.log("negativan")
        COV2AgNapomena = "Pretraga: Antigen SARS-CoV-2\nMetoda: Hromatografski imunološki test (Nal von minden GmbH, NADAL® COVID-19 AG Test) za kvalitativno otkrivanje specifičnih antigena SARS-CoV-2 prisutnih u nazofarinksu (specifičnost 99.9 %, senzitivnost 97.6 %)\n\nU uzorku nije detektovan Antigen SARS-CoV-2.\nU slučaju klinički i anamnestički osnovane sumnje na COVID-19 virusnu infekciju preporučuje se dalje provođenje dijagnostike metodom PCR.\n\n";
  
      }


      // SARS-CoV-2 IgG spike RBD

      if(Spike === "pozitivan") {

        // console.log("pozitivan")
        SpikeNapomena = "Opis (IgG spike):\nKvantitativni test (CLIA METODA), koji se koristi za praćenje stepena imunizacije nastale bilo prirodnim ili vakcinom indukovanim odgovorom.\n\n" +
        "Napomena:\nTest SARS-CoV-2 IgG antitijela na Spike protein se ne koristi za postavljane dijagnoze COVID-19! Razlika između serološkog testa na IgG antitijela i IgG testa na Spike protein je u " +
        "tipu antitijela. Serološki test na IgG antitijela mjeri antitijela na nukleokapsid virusa, koja najbrže nastaju, ali najbrže i nestaju iz cirkulacije, dok SARS-CoV-2 " +
        "IgG antitijela na Spike protein nastaju nešto kasnije, ali su duže prisutna i specifičnija su za postojanje imuniteta na SARS-CoV2 virus iza prebolijevanja ili vakcinacije.\n\n" +
        "Zaključak:\nPovišena SARS-CoV-2 IgG Spike RBD antitijela. Razvijen imuni odgovor nakon prebolovane Covid-19 infekcije ili nakon sprovedene imunizacije - vakcinacije protiv SARS-CoV-2.\n\n";
  
      }else if(Spike === "negativan") {

        // console.log("negativan")
        SpikeNapomena = "Opis (IgG spike):\nKvantitativni test (CLIA METODA), koji se koristi za praćenje stepena imunizacije nastale bilo prirodnim ili vakcinom indukovanim odgovorom.\n\n" +
        "Napomena:\nTest SARS-CoV-2 IgG antitijela na Spike protein se ne koristi za postavljane dijagnoze COVID-19! Razlika između serološkog testa na IgG antitijela i IgG testa na Spike protein je u " +
        "tipu antitijela. Serološki test na IgG antitijela mjeri antitijela na nukleokapsid virusa, koja najbrže nastaju, ali najbrže i nestaju iz cirkulacije, dok SARS-CoV-2 IgG antitijela na Spike protein nastaju nešto kasnije, ali su duže prisutna i " +
        "specifičnija su za postojanje imuniteta na SARS-CoV2 virus iza prebolijevanja ili vakcinacije.\n\n" +
        "Zaključak:\nNisu detektovana povišena SARS-CoV-2 IgG Spike RBD antitijela. Nema seroloških znakova postojanja imunog odgovora nakon prebolovane Covid-19 " +
        "infekcije ili nakon sprovedene imunizacije - vakcinacije protiv SARS-CoV-2. Ukoliko je pacijent imao dokazanu Covid 19 infekciju, preporuka je testiranje" +
        "sprovesti najmanje mjesec dana nakon pozitivnog PCR testa. Ukoliko je sprovedena imunizacija (vakcinom indukovani odgovor), preporučuje se testiranje uraditi 2-4 sedmice nakon primljene druge doze vakcine (mRNA - Pfizer, Moderna; vektorske vakcine: AstraZeneca) ili 3-6 sedmica nakon " +
        " primljene druge doze inaktivirane vakcine - Sinofarm.\n\n";
  
      }
      




  
        // Antigen SARS-CoV-2 / Influenza A i B
        
        if(SARS === "negativan" && Influenza === "negativan") {

          // console.log("negativan/negativan")
          COMBoNapomena = "Pretraga: Antigen SARS-CoV-2 / Influenza A i B\nMetoda: Antigen SARS-CoV-2 i Influenza A+B kombinirani hromatografski imunoesej za kvalitativnu detekciju antigena SARS-CoV-2, Influenza A i Influenza B prisutnim u humanom materijalu (bris nazofarinksa).\n\nU uzorku nije detektovan Antigen SARS-CoV-2 niti antigen Influenza A/B. U slučaju klinički i anamnestički osnovane sumnje na COVID-19 virusnu infekciju preporučuje se dalje provođenje dijagnostike metodom PCR.\n\n";
    
        }else if(SARS === "negativan" && Influenza === "pozitivan") {

          // console.log("negativan/pozitivan")
          COMBoNapomena = "Pretraga: Antigen SARS-CoV-2 / Influenza A i B\nMetoda: Antigen SARS-CoV-2 i Influenza A+B kombinirani hromatografski imunoesej za kvalitativnu detekciju antigena SARS-CoV-2, Influenza A i Influenza B prisutnim u humanom materijalu (bris nazofarinksa).\n\nU uzorku detektovan antigen Influenza A/B. Obavezno se javiti ljekaru porodične medicine za dalje upute!\n\n";
    
        }else if(SARS === "pozitivan" && Influenza === "negativan") {

          // console.log("pozitivan/negativan")
          COMBoNapomena = "Pretraga: Antigen SARS-CoV-2 / Influenza A i B\nMetoda: Antigen SARS-CoV-2 i Influenza A+B kombinirani hromatografski imunoesej za kvalitativnu detekciju antigena SARS-CoV-2, Influenza A i Influenza B prisutnim u humanom materijalu (bris nazofarinksa).\n\nV.a. aktivna COVID-19 virusna infekcija. Za sigurnu potvrdu aktivne infekcije preporučuje se dokazivanje uzročnika metodom PCR. Obavezno se javiti ljekaru porodične medicine i nadležnoj epidemiološkoj službi za dalje upute!\n\n";
    
        }else if(SARS === "pozitivan" && Influenza === "pozitivan") {

          // console.log("pozitivan/pozitivan")
          COMBoNapomena = "Pretraga: Antigen SARS-CoV-2 / Influenza A i B\nMetoda: Antigen SARS-CoV-2 i Influenza A+B kombinirani hromatografski imunoesej za kvalitativnu detekciju antigena SARS-CoV-2, Influenza A i Influenza B prisutnim u humanom materijalu (bris nazofarinksa).\n\nU uzorku detektovan antigen Influenza A/B i antigen SARS-CoV-2. Molimo ponoviti testiranje i u slučaju pozitivnog nalaza obavezno se javiti ljekaru porodične medicine za dalje upute!\n\n";
    
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

        napomena = COV2AgNapomena + COMBoNapomena + SEROLOGIJANapomena + RTPCRNapomena  + ngDNKNapomena + SpikeNapomena

        // console.log(napomena)
  
      

    if(EN === true){

      napomena = ""
      

      if(Rezultat === "negative"){

        napomena = "Analysis: Antigen SARS-CoV-2\nMethod: Chromatographic immunoassay (Nal von minden GmbH, NADAL® COVID-19 AG Test) for the qualitative detection of specific antigens of SARS-CoV-2 present in the human nasopharynx (sensivity 97.6 % specificity 99.9 %).\n\nNo SARS-Cov-2 antigen was detected in the nasopharyngeal swab.\nIf the Antigen SARS-Cov-2 is negative the person shows no signs of infection to COVID-19, but it is not excluded that the infection exists at an early stage. If contact is suspected or symptoms are present repeat the test in 2-3 days.\n\n"

      }

      if(Rezultat === "positive"){

        napomena = "Analysis: Antigen SARS-CoV-2\nMethod: Chromatographic immunoassay (Nal von minden GmbH, NADAL® COVID-19 AG Test) for the qualitative detection of specific antigens of SARS-CoV-2 present in the human nasopharynx (sensivity 97.6 % specificity 99.9 %).\n\nSARS-Cov-2 antigen was detected in the nasopharyngeal swab.\nPatient currently has an infection (regardless of the presence or absence of symptoms). Self-isolation and control of the test after 14 days is necessary. Confirm the result by PCR testing.\n\n"

        
      }

















      if (napomena.trim().length) {
        doc.moveDown(0.5);
    
        doc.font("PTSansRegular");
      eachLineNapomena = napomena.split("\n");
    
      for (var i = 0, l = eachLineNapomena.length; i < l; i++) {
    
        if(
          
          eachLineNapomena[i].includes("Analysis: Antigen SARS-CoV-2") 
         
          ){
    
          doc.font("PTSansBold").text(eachLineNapomena[i], { width: 465, align: "justify" });
        if (eachLineNapomena[i].length === 0) {
          doc.moveDown(0.5);
        }
    
        }else{
          doc.font("PTSansRegular").text(eachLineNapomena[i], { width: 465, align: "justify" });
        if (eachLineNapomena[i].length === 0) {
          doc.moveDown(0.5);
        }
    
        }
        
      }
    
      }









    } else if (DE === true) {

      napomena = ""
      

      if(Rezultat === "Negativ"){

        napomena = "Analyse: Antigen SARS-CoV-2\nMethode: Chromatographischer Immunoassay (Nal von minden GmbH, NADAL® COVID-19 AG Test) zum qualitativen Nachweis von spezifischen Antigenen von SARS-CoV-2 im menschlichen Nasopharynx (Sensitivität 97.6 %, Spezifität 99.9 %).\n\nIm Nasopharyngealabstrich wurde kein SARS-Cov-2-Antigen nachgewiesen.\nWenn das Antigen SARS-Cov-2 negativ ist, zeigt die Person keine Anzeichen einer Infektion mit COVID-19, aber es ist nicht ausgeschlossen, dass die Infektion in einem frühen Stadium besteht. Wenn Kontakt vermutet wird oder Symptome vorhanden sind, wiederholen Sie den Test in 2-3 Tagen.\n\n"

      }

      if(Rezultat === "Positiv"){

        napomena = "Analyse: Antigen SARS-CoV-2\nMethode: Chromatographischer Immunoassay (Nal von minden GmbH, NADAL® COVID-19 AG Test) zum qualitativen Nachweis von spezifischen Antigenen von SARS-CoV-2 im menschlichen Nasopharynx (Sensitivität 97.6 %, Spezifität 99.9 %).\n\nDas SARS-Cov-2-Antigen wurde im Nasopharyngealabstrich nachgewiesen.\nDer Patient hat derzeit  hat eine Infektion (unabhängig von der Anwesenheit oder Abwesenheit von Symptomen). Selbst-Isolierung und Kontrolle des Tests nach 14 Tagen ist erforderlich. Bestätigen Sie das Ergebnis durch PCR-Test.\n\n"

        
      }

















      if (napomena.trim().length) {
        doc.moveDown(0.5);
    
        doc.font("PTSansRegular");
      eachLineNapomena = napomena.split("\n");
    
      for (var i = 0, l = eachLineNapomena.length; i < l; i++) {
    
        if(
          
          eachLineNapomena[i].includes("Analyse: Antigen SARS-CoV-2") 
         
          ){
    
          doc.font("PTSansBold").text(eachLineNapomena[i], { width: 465, align: "justify" });
        if (eachLineNapomena[i].length === 0) {
          doc.moveDown(0.5);
        }
    
        }else{
          doc.font("PTSansRegular").text(eachLineNapomena[i], { width: 465, align: "justify" });
        if (eachLineNapomena[i].length === 0) {
          doc.moveDown(0.5);
        }
    
        }
        
      }
    
      }









    }else{



      if (comment.trim().length) {
        doc.moveDown(0.5);
        doc.fontSize(12).text("Komentar:", 50);


        doc.font("PTSansRegular");
      eachLineComment = comment.split("\n");
  
      for (var i = 0, l = eachLineComment.length; i < l; i++) {
        doc.text(eachLineComment[i], {
          width: 465,
          align: "justify"
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

    if(

      eachLineNapomena[i].includes("KOMENTAR:") ||

      eachLineNapomena[i].includes("Serološki nema dokaza aktivne niti pasivne COVID-19 infekcije!") || 
      eachLineNapomena[i].includes("Serološki nema dokaza aktivne COVID-19 infekcije!") || 
      eachLineNapomena[i].includes("Povišena IgG antitijela - Prebolovana COVID-19 infekcija.") || 
      eachLineNapomena[i].includes("Povišena IgM antitijela - Moguća infekcija u toku.") ||
      eachLineNapomena[i].includes("Povišena IgM i IgG antitijela. Moguća infekcija u razvoju.") ||
      eachLineNapomena[i].includes("Pretraga: Antigen SARS-CoV-2") ||
      eachLineNapomena[i].includes("Pretraga: Antigen SARS-CoV-2 / Influenza A i B") ||
      eachLineNapomena[i].includes("Pretraga: Covid 19 IgM") ||
      eachLineNapomena[i].includes("Pretraga: Covid 19 IgG") ||
      eachLineNapomena[i].includes("Pretrage: Covid 19 IgM i Covid 19 IgG")
      ){

      doc.font("PTSansBold").text(eachLineNapomena[i], { width: 465, align: "justify" });
    if (eachLineNapomena[i].length === 0) {
      doc.moveDown(0.5);
    }

    }else{
      doc.font("PTSansRegular").text(eachLineNapomena[i], { width: 465, align: "justify" });
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
      doc.image(config.nalaz_signature + code + "-" + "EN-Antigen" + ".png", 372, doc.y - 10, { width: 150, keepAspectRatio: true });
    } else if (DE == true) {
      doc.image(config.nalaz_signature + code + "-" + "DE-Antigen" + ".png", 372, doc.y - 10, { width: 150, keepAspectRatio: true });
    }else{

      if(micro === true){

        doc.image(config.nalaz_signature + "Mikrobiologija.png", 372, doc.y - 10, { width: 150, keepAspectRatio: true });
       
      }else{

        doc.image(config.nalaz_signature + code + "-" + config.user + ".png", 372, doc.y - 10, { width: 150, keepAspectRatio: true });

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
      doc.font("PTSansRegular").fontSize(10).fillColor("#7B8186").text(adresa, 50, 740, { lineBreak: false });
      doc.fontSize(9).fillColor("#7B8186").moveTo(0, 756)                      
      .lineTo(650, 756)
      .lineWidth(0.7)
   .opacity(0.5)
   .fillAndStroke("#7B8186", "#7B8186")
   .opacity(1);

   if (EN == true) {
    doc.font("PTSansRegular").fontSize(9).fillColor("black").text("Patient: " + pacijent, 50, 760, { lineBreak: false });
   }else if (DE == true) {
    doc.font("PTSansRegular").fontSize(9).fillColor("black").text("Patient: " + pacijent, 50, 760, { lineBreak: false });
   } else{
    doc.font("PTSansRegular").fontSize(9).fillColor("black").text("Pacijent: " + pacijent, 50, 760, { lineBreak: false });
   }

   
   doc.font("PTSansBold").fontSize(8).fillColor("#7B8186").text("ATOM Laboratory Software", 470, 760, { lineBreak: false });
   doc.font("PTSansRegular").fontSize(8).fillColor("#7B8186").text("by", 470, 770, { lineBreak: false });   
   doc.font("PTSansBold").fontSize(8).fillColor("#7B8186").text("iLab d.o.o. Sarajevo", 480, 770, { lineBreak: false });

   if (EN == true) {
    doc.font("PTSansRegular").fontSize(8).fillColor("black").text(`Page ${i + 1} of ${range.count}`, doc.page.width / 2 - 25, doc.page.height - 18, { lineBreak: false });
   } else if (DE == true) {
    doc.font("PTSansRegular").fontSize(8).fillColor("black").text(`Seite ${i + 1} von ${range.count}`, doc.page.width / 2 - 25, doc.page.height - 18, { lineBreak: false });
   } else {
    doc.font("PTSansRegular").fontSize(8).fillColor("black").text(`Stranica ${i + 1} od ${range.count}`, doc.page.width / 2 - 25, doc.page.height - 18, { lineBreak: false });
   }
 

      
    }
    doc.end();
  }
};
