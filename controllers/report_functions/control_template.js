module.exports = {
  create_report: function (
    report,
    config,
    aparat,
    res,
    rezultat,
    headers,
    rows
  ) {
    var fs = require("fs");
    PDFDocument = require("pdfkit");
    const PDFDocumentWithTables = require("./pdf_class");
    var title = "Rezultati kontrolnih uzoraka";

    var path = config.nalaz_path + "/kontrole/";
    var nalaz = report.id + "_" + aparat._id;
    var code = rezultat.site.sifra;

    const doc = new PDFDocumentWithTables({
      bufferPages: true,
      margins: { top: 80, bottom: 50, left: 50, right: 50 },
    });
    doc.pipe(
      fs.createWriteStream(path + nalaz + ".pdf").on("finish", function () {
        res.json({
          success: true,
          message: "Nalaz uspješno kreiran.",
        });
      })
    );

    var memo = 0;
    var nvisina = 90;
    var adjust = nvisina - 70;
    var nalazMemorandum = true;

    if (nalazMemorandum) {
      doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
      doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
    }

    doc.registerFont("PTSansRegular", config.nalaz_ptsansregular);
    doc.registerFont("PTSansBold", config.nalaz_ptsansbold);
    doc.image(config.nalaz_logo + code + ".jpg", 28, 10, {
      fit: [240, 80],
      align: "center",
      valign: "center",
    });

    doc
      .font("PTSansRegular")
      .fontSize(12)
      .fillColor("black")
      .text("Naziv kontrole: ", 50, nvisina);

    doc.moveDown(1);

    var i = 0;

    for (let step = 0; step < 1; step++) {
      i++;

      if (doc.y > 630) {
        doc.addPage();
      }

      doc
        .fontSize(12)
        .opacity(0.2)
        .rect(50, doc.y, 511.5, 15)
        .fill("#7B8186")
        .fillColor("black")
        .opacity(1)
        .text("Analizator: " + aparat.ime + ", " + aparat.make, 50);

      doc.moveDown(1);

      doc.table_default(
        { headers: headers, rows: rows },
        {
          prepareHeader: () => doc.fontSize(8),
          prepareRow: (row, i) => doc.fontSize(10),
        }
      );
    }
    doc.font("PTSansBold").fontSize(12);

    if (doc.y > 650) {
      doc.addPage();
    }

    if (report.komentar.length) {
      doc.moveDown(0.3);
      doc.fontSize(12).text("Komentar:", 50);
    }
    doc.font("PTSansRegular");
    var eachLine = report.komentar.split("\n");

    for (var i = 0, l = eachLine.length; i < l; i++) {
      doc.text(eachLine[i], { width: 465, align: "justify" });
      if (eachLine[i].length === 0) {
        doc.moveDown(1);
      }
    }
    memo = doc.y;

    doc
      .font("PTSansRegular")
      .fontSize(10)
      .text("_______________________________", 390)
      .text("   Kontrolni nalaz verifikovao");

    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .font("PTSansRegular")
        .fontSize(10)
        .fillColor("#7B8186")
        .text("", 30, 760, { lineBreak: false })
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
  },
};
