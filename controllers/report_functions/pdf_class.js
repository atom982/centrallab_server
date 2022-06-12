class PDFDocumentWithTables extends PDFDocument {
  constructor(options) {
    super(options);
  }

  table_default(table, arg0, arg1, arg2) {
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
          width: columnWidth,
          align: "left",
        });
      }
      if (i === 1) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 2) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 3) {
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
      .lineWidth(0.7)
      .opacity(0.5)
      .stroke()
      .opacity(1); // Reset opacity after drawing the line

    table.rows.forEach((row, i) => {
      let rowHeight = 15;
      let shadow = 0;
      let res = [];

      // Switch to next page if we cannot go any further because the space is ove
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
          this.fillColor("black");
          tempcell0 = cell;

          if (cell.includes("[")) {
            this.fontSize(7);
            this.fillColor("red");
            this.text(
              cell.slice(1, 2),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );

            if (cell.trim().length >= 30) {
              this.fontSize(9);
              this.fillColor("black");
            } else {
              this.fontSize(10);
              this.fillColor("black");
            }

            this.text(
              cell.slice(3).trim(),
              startX + 5 + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );
          } else {
            if (cell.trim().length >= 30) {
              this.fontSize(9);
            } else {
              this.fontSize(10);
            }

            this.text(cell, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "left",
            });
          }
        }

        if (i === 1) {
          if (
            cell.rezultat.trim().length >= 20 &&
            cell.rezultat.trim().length < 27
          ) {
            this.fontSize(9);
          } else if (cell.rezultat.trim().length >= 27) {
            this.fontSize(7.5);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          tempcell1 = cell;

          if (
            cell.kontrola === "Red" ||
            cell.kontrola === "L" ||
            cell.kontrola === "H"
          ) {
            this.font("PTSansBold")
              .rect(
                this.x + columnContainerWidth,
                this.y - 0.2,
                columnContainerWidth,
                -12
              )
              .opacity(0.25)
              .fill("#7B8186")
              .fillColor("black")
              .opacity(1);
          } else {
          }

          if (cell.kontrola === "L" || cell.kontrola === "H") {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );

            this.text(
              cell.kontrola,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "right",
              }
            );
          } else {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
        }

        if (i === 2) {
          if (cell === undefined) {
            cell = "";
          }

          if (cell.trim().length >= 10) {
            this.fontSize(9);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          this.text(cell.trim(), startX + i * columnContainerWidth, startY, {
            width: columnWidth,
            align: "center",
          });
        }

        if (i === 3) {
          // console.log(cell)
          if (cell.reference.includes("*")) {
            this.fillColor("red");
          } else {
            this.fillColor("black");
          }

          if (cell.extend.trim() != "" && !cell.reference.includes("*")) {
            if (cell.extend.includes(";")) {
              res = cell.extend.split(";");

              if (res.length != undefined && res.length > 1) {
                rowHeight = rowHeight + 12.5 * (res.length - 1);
                shadow = 12.5 * (res.length - 1);
              }

              if (res.length) {
                cell.extend = "";

                res.forEach((element) => {
                  cell.extend = cell.extend + element.trim() + "\n";
                });
              }

              cell.extend = cell.extend.replace(/,/g, "\n");
            } else {
              if (
                cell.extend.trim().length >= 55 &&
                cell.extend.trim().length <= 60
              ) {
                this.fontSize(9);
              } else if (
                cell.extend.trim().length >= 60 &&
                cell.extend.trim().length <= 65
              ) {
                this.fontSize(8);
              } else if (cell.extend.trim().length >= 65) {
                this.fontSize(7);
              } else {
                this.fontSize(10);
              }
            }

            this.text(cell.extend, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "center",
            });
          } else {
            this.fontSize(10);
            this.text(
              cell.reference,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
          this.fillColor("black");
        }
      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(0.5)
        .opacity(1)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });

    this.x = startX;
    this.moveDown();
    return this;
  }

  table_default_antigen(table, arg0, arg1, arg2) {
    table.headers = ["Analysis", "Result", "Unit", "Reference range"];

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
          width: columnWidth,
          align: "left",
        });
      }
      if (i === 1) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 2) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 3) {
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
      .lineWidth(0.7)
      .opacity(0.5)
      .stroke()
      .opacity(1); // Reset opacity after drawing the line

    table.rows.forEach((row, i) => {
      let rowHeight = 15;
      let shadow = 0;
      let res = [];

      // Switch to next page if we cannot go any further because the space is ove
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
          this.fillColor("black");
          tempcell0 = cell;

          if (cell.includes("[")) {
            this.fontSize(7);
            this.fillColor("red");
            this.text(
              cell.slice(1, 2),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );

            if (cell.trim().length >= 30) {
              this.fontSize(9);
              this.fillColor("black");
            } else {
              this.fontSize(10);
              this.fillColor("black");
            }

            this.text(
              cell.slice(3).trim(),
              startX + 5 + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );
          } else {
            if (cell.trim().length >= 30) {
              this.fontSize(9);
            } else {
              this.fontSize(10);
            }

            this.text(cell, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "left",
            });
          }
        }

        if (i === 1) {
          if (
            cell.rezultat.trim().length >= 20 &&
            cell.rezultat.trim().length < 27
          ) {
            this.fontSize(9);
          } else if (cell.rezultat.trim().length >= 27) {
            this.fontSize(7.5);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          tempcell1 = cell;

          if (
            cell.kontrola === "Red" ||
            cell.kontrola === "L" ||
            cell.kontrola === "H"
          ) {
            this.font("PTSansBold")
              .rect(
                this.x + columnContainerWidth,
                this.y - 0.2,
                columnContainerWidth,
                -12
              )
              .opacity(0.25)
              .fill("#7B8186")
              .fillColor("black")
              .opacity(1);
          } else {
          }

          if (cell.kontrola === "L" || cell.kontrola === "H") {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );

            this.text(
              cell.kontrola,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "right",
              }
            );
          } else {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
        }

        if (i === 2) {
          if (cell === undefined) {
            cell = "";
          }

          if (cell.trim().length >= 10) {
            this.fontSize(9);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          this.text(cell.trim(), startX + i * columnContainerWidth, startY, {
            width: columnWidth,
            align: "center",
          });
        }

        if (i === 3) {
          // console.log(cell)
          if (cell.reference.includes("*")) {
            this.fillColor("red");
          } else {
            this.fillColor("black");
          }

          if (cell.extend.trim() != "" && !cell.reference.includes("*")) {
            if (cell.extend.includes(";")) {
              res = cell.extend.split(";");

              if (res.length != undefined && res.length > 1) {
                rowHeight = rowHeight + 12.5 * (res.length - 1);
                shadow = 12.5 * (res.length - 1);
              }

              if (res.length) {
                cell.extend = "";

                res.forEach((element) => {
                  cell.extend = cell.extend + element.trim() + "\n";
                });
              }

              cell.extend = cell.extend.replace(/,/g, "\n");
            } else {
              if (
                cell.extend.trim().length >= 55 &&
                cell.extend.trim().length <= 60
              ) {
                this.fontSize(9);
              } else if (
                cell.extend.trim().length >= 60 &&
                cell.extend.trim().length <= 65
              ) {
                this.fontSize(8);
              } else if (cell.extend.trim().length >= 65) {
                this.fontSize(7);
              } else {
                this.fontSize(10);
              }
            }

            this.text(cell.extend, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "center",
            });
          } else {
            this.fontSize(10);
            this.text(
              cell.reference,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
          this.fillColor("black");
        }
      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(0.5)
        .opacity(1)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });

    this.x = startX;
    this.moveDown();
    return this;
  }

  table_default_DE(table, arg0, arg1, arg2) {
    table.headers = ["Analyse", "Ergebnis", "Einheit", "Referenzbereich"];

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
          width: columnWidth,
          align: "left",
        });
      }
      if (i === 1) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 2) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 3) {
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
      .lineWidth(0.7)
      .opacity(0.5)
      .stroke()
      .opacity(1); // Reset opacity after drawing the line

    table.rows.forEach((row, i) => {
      let rowHeight = 15;
      let shadow = 0;
      let res = [];

      // Switch to next page if we cannot go any further because the space is ove
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
          this.fillColor("black");
          tempcell0 = cell;

          if (cell.includes("[")) {
            this.fontSize(7);
            this.fillColor("red");
            this.text(
              cell.slice(1, 2),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );

            if (cell.trim().length >= 30) {
              this.fontSize(9);
              this.fillColor("black");
            } else {
              this.fontSize(10);
              this.fillColor("black");
            }

            this.text(
              cell.slice(3).trim(),
              startX + 5 + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );
          } else {
            if (cell.trim().length >= 30) {
              this.fontSize(9);
            } else {
              this.fontSize(10);
            }

            this.text(cell, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "left",
            });
          }
        }

        if (i === 1) {
          if (
            cell.rezultat.trim().length >= 20 &&
            cell.rezultat.trim().length < 27
          ) {
            this.fontSize(9);
          } else if (cell.rezultat.trim().length >= 27) {
            this.fontSize(7.5);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          tempcell1 = cell;

          if (
            cell.kontrola === "Red" ||
            cell.kontrola === "L" ||
            cell.kontrola === "H"
          ) {
            this.font("PTSansBold")
              .rect(
                this.x + columnContainerWidth,
                this.y - 0.2,
                columnContainerWidth,
                -12
              )
              .opacity(0.25)
              .fill("#7B8186")
              .fillColor("black")
              .opacity(1);
          } else {
          }

          if (cell.kontrola === "L" || cell.kontrola === "H") {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );

            this.text(
              cell.kontrola,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "right",
              }
            );
          } else {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
        }

        if (i === 2) {
          if (cell === undefined) {
            cell = "";
          }

          if (cell.trim().length >= 10) {
            this.fontSize(9);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          this.text(cell.trim(), startX + i * columnContainerWidth, startY, {
            width: columnWidth,
            align: "center",
          });
        }

        if (i === 3) {
          // console.log(cell)
          if (cell.reference.includes("*")) {
            this.fillColor("red");
          } else {
            this.fillColor("black");
          }

          if (cell.extend.trim() != "" && !cell.reference.includes("*")) {
            if (cell.extend.includes(";")) {
              res = cell.extend.split(";");

              if (res.length != undefined && res.length > 1) {
                rowHeight = rowHeight + 12.5 * (res.length - 1);
                shadow = 12.5 * (res.length - 1);
              }

              if (res.length) {
                cell.extend = "";

                res.forEach((element) => {
                  cell.extend = cell.extend + element.trim() + "\n";
                });
              }

              cell.extend = cell.extend.replace(/,/g, "\n");
            } else {
              if (
                cell.extend.trim().length >= 55 &&
                cell.extend.trim().length <= 60
              ) {
                this.fontSize(9);
              } else if (
                cell.extend.trim().length >= 60 &&
                cell.extend.trim().length <= 65
              ) {
                this.fontSize(8);
              } else if (cell.extend.trim().length >= 65) {
                this.fontSize(7);
              } else {
                this.fontSize(10);
              }
            }

            this.text(cell.extend, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "center",
            });
          } else {
            this.fontSize(10);
            this.text(
              cell.reference,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
          this.fillColor("black");
        }
      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(0.5)
        .opacity(1)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });

    this.x = startX;
    this.moveDown();
    return this;
  }

  // Sediment urina

  table_sediment(table, arg0, arg1, arg2) {
    // Tabela za Sediment urina
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
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 2) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 3) {
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
      .lineWidth(0.7)
      .opacity(0.5)
      .stroke()
      .opacity(1); // Reset opacity after drawing the line

    table.rows.forEach((row, i) => {
      let rowHeight = 15;
      let shadow = 0;
      let res = [];

      // Switch to next page if we cannot go any further because the space is ove
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
          this.fillColor("black");
          tempcell0 = cell;

          if (cell.includes("[")) {
            this.fontSize(7);
            this.fillColor("red");
            this.text(
              cell.slice(1, 2),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );

            if (cell.trim().length > 30) {
              this.fontSize(9);
              this.fillColor("black");
            } else {
              this.fontSize(10);
              this.fillColor("black");
            }

            this.text(
              cell.slice(3).trim(),
              startX + 5 + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );
          } else {
            if (cell.trim().length > 30) {
              this.fontSize(9);
            } else {
              this.fontSize(10);
            }

            this.text(cell, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "left",
            });
          }
        }

        if (i === 1) {
          if (cell.rezultat.includes(";")) {
            res = cell.rezultat.split(";");
          }

          if (res.length != undefined && res.length > 1) {
            rowHeight = rowHeight + 12.5 * (res.length - 1);
            shadow = 12.5 * (res.length - 1);
          }

          if (res.length) {
            cell.rezultat = "";

            res.forEach((element) => {
              cell.rezultat = cell.rezultat + element.trim() + "\n";
            });
          }

          cell.rezultat = cell.rezultat.replace(/,/g, "\n");

          if (false) {
            this.fontSize(9);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          tempcell1 = cell;

          if (
            cell.kontrola === "Red" ||
            cell.kontrola === "L" ||
            cell.kontrola === "H"
          ) {
            this.font("PTSansBold")
              .rect(
                this.x + columnContainerWidth,
                this.y + shadow - 0.2,
                columnContainerWidth,
                -12 - shadow
              )
              .opacity(0.25)
              .fill("#7B8186")
              .fillColor("black")
              .opacity(1);
          } else {
          }

          if (cell.kontrola === "L" || cell.kontrola === "H") {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );

            this.text(
              cell.kontrola,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "right",
              }
            );
          } else {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
        }

        if (i === 2) {
          if (cell === undefined) {
            cell = "";
          }

          if (cell.trim().length > 10) {
            this.fontSize(9);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          this.text(cell.trim(), startX + i * columnContainerWidth, startY, {
            width: columnWidth,
            align: "center",
          });
        }

        if (i === 3) {
          if (cell.reference.includes("*")) {
            this.fillColor("red");
          } else {
            this.fillColor("black");
          }

          if (cell.extend.trim() != "" && !cell.reference.includes("*")) {
            if (
              cell.extend.trim().length > 50 &&
              cell.extend.trim().length <= 60
            ) {
              this.fontSize(9);
            } else if (
              cell.extend.trim().length > 60 &&
              cell.extend.trim().length <= 65
            ) {
              this.fontSize(8);
            } else if (cell.extend.trim().length > 65) {
              this.fontSize(7);
            } else {
              this.fontSize(10);
            }

            this.text(cell.extend, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "center",
            });
          } else {
            this.fontSize(10);
            this.text(
              cell.reference,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
          this.fillColor("black");
        }
      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(0.5)
        .opacity(1)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });

    this.x = startX;
    this.moveDown();
    return this;
  }

  // Mikrobiologija
  // Bakteriološki pregled - Negativan Rezultat
  // Mikološki pregled - Negativan Rezultat
  // Mikološki pregled - Pozitivan Rezultat

  table_mikrobiologija(table, arg0, arg1, arg2) {
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
          width: columnWidth,
          align: "left",
        });
      }
      if (i === 1) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth * 3,
          align: "left",
        });
      }
    });

    // Refresh the y coordinate of the bottom of the headers row
    rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);

    // Separation line between headers and rows
    this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
      .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
      .lineWidth(0.7)
      .opacity(0.5)
      .stroke()
      .opacity(1); // Reset opacity after drawing the line

    table.rows.forEach((row, i) => {
      let rowHeight = 15;
      let shadow = 0;
      let res = [];

      // Switch to next page if we cannot go any further because the space is ove
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
          this.fillColor("black");
          tempcell0 = cell;

          if (cell.includes("[")) {
            this.fontSize(7);
            this.fillColor("red");
            this.text(
              cell.slice(1, 2),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );

            if (cell.trim().length >= 30) {
              this.fontSize(9);
              this.fillColor("black");
            } else {
              this.fontSize(10);
              this.fillColor("black");
            }

            this.text(
              cell.slice(3).trim(),
              startX + 5 + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "left",
              }
            );
          } else {
            if (cell.trim().length >= 30) {
              this.fontSize(9);
            } else {
              this.fontSize(10);
            }

            this.text(cell, startX + i * columnContainerWidth, startY, {
              width: columnWidth,
              align: "left",
            });
          }
        }

        if (i === 1) {
          if (cell.rezultat.includes("\n")) {
            res = cell.rezultat.split("\n");
          }

          if (res.length != undefined && res.length > 1) {
            rowHeight = rowHeight + 12.5 * (res.length - 1);
            shadow = 12.5 * (res.length - 1);
          }

          if (res.length) {
            cell.rezultat = "";

            res.forEach((element) => {
              cell.rezultat = cell.rezultat + element.trim() + "\n";
            });
          }

          // cell.rezultat = cell.rezultat.replace(/,/g, "\n");

          if (false) {
            this.fontSize(9);
          } else {
            this.fontSize(10);
          }

          this.fillColor("black");
          tempcell1 = cell;

          if (
            cell.kontrola === "Red" ||
            cell.kontrola === "L" ||
            cell.kontrola === "H"
          ) {
            this.font("PTSansBold")
              .rect(176.5, this.y + shadow - 0.2, 385.2, -12 - shadow)
              .opacity(0.25)
              .fill("#7B8186")
              .fillColor("black")
              .opacity(1);
          } else {
          }

          if (cell.kontrola === "L" || cell.kontrola === "H") {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );

            this.text(
              cell.kontrola,
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "right",
              }
            );
          } else {
            this.text(
              cell.rezultat.trim(),
              startX + i * columnContainerWidth,
              startY,
              {
                width: columnWidth,
                align: "center",
              }
            );
          }
        }
      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(0.5)
        .opacity(1)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });

    this.x = startX;
    this.moveDown();
    return this;
  }

  // Mikrobiologija
  // Bakteriološki pregled - Pozitivan Rezultat

  table_antibiotici(table, arg0, arg1, arg2) {
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
          width: columnWidth,
          align: "left",
        });
      }
      if (i === 1) {
        this.text(header, startX + i * columnContainerWidth, startY, {
          width: columnWidth,
          align: "center",
        });
      }
      if (i === 2) {
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
      .lineWidth(0.7)
      .opacity(0.5)
      .stroke()
      .opacity(1); // Reset opacity after drawing the line

    table.rows.forEach((row, i) => {
      const rowHeight = 15;

      // Switch to next page if we cannot go any further because the space is ove
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
          this.fillColor("black");
          tempcell0 = cell;

          if (cell != undefined && cell.trim().length >= 30) {
            this.fontSize(9);
          } else {
            this.fontSize(10);
          }

          this.text(cell, startX + i * columnContainerWidth, startY, {
            width: columnWidth,
            align: "left",
          });
        }

        if (i === 1) {
          this.fontSize(10);

          this.text(
            cell.rezultat.trim(),
            startX + i * columnContainerWidth,
            startY,
            {
              width: columnWidth,
              align: "center",
            }
          );
        }

        if (i === 2) {
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
        .lineWidth(0.5)
        .opacity(1)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });

    this.x = startX;
    this.moveDown();
    return this;
  }
}

module.exports = PDFDocumentWithTables;
