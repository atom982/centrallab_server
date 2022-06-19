module.exports = {
  None: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "none")
    return [" ", "No Class"];
  },

  Standard: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "A", "ogtt", "insul")
    if (isNaN(rezultat) || rezultat === "" || (dref == "0" && gref == "0")) {
      return [" ", "No Class"];
    } else if (Number(rezultat) < Number(Math.abs(dref))) {
      return ["L", "L"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["H", "H"];
    } else if (
      Number(rezultat) === Number(Math.abs(dref)) ||
      Number(rezultat) === Number(Math.abs(gref))
    ) {
      return [" ", "Yellow"];
    } else {
      return [" ", "Green"];
    }
  },

  Less: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "less")
    if (rezultat.includes("pozitivan") || rezultat.includes("pos")) {
      return ["H", "Red"];
    } else if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) >= Number(Math.abs(gref))) {
      return ["H", "H"];
    } else if (rezultat.includes("pozitivan") || rezultat.includes("pos")) {
      return ["H", "Red"];
    } else {
      return [" ", "Green"];
    }
  },

  LessPlus: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "less")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (isNaN(rezultat)) {
      return ["H", "Red"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["H", "Red"];
    } else if (
      Number(rezultat) <= Number(Math.abs(gref)) &&
      Number(rezultat) >= Number(Math.abs(dref))
    ) {
      return [" ", "Yellow"];
    } else {
      return [" ", "Green"];
    }
  },

  LessEqual: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "grte")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["H", "H"];
    } else if (Number(rezultat) == Number(Math.abs(gref))) {
      return [" ", "Green"];
    } else {
      return [" ", "Green"];
    }
  },

  Greater: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "grt")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) < Number(Math.abs(gref))) {
      return ["L", "L"];
    } else if (Number(rezultat) == Number(Math.abs(gref))) {
      return ["L", "L"];
    } else {
      return [" ", "Green"];
    }
  },

  GreaterNoInterp: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "grt")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) < Number(Math.abs(gref))) {
      return [" ", "No Class"];
    } else if (Number(rezultat) == Number(Math.abs(gref))) {
      return [" ", "No Class"];
    } else {
      return [" ", "No Class"];
    }
  },

  GreaterEqual: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "grte")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) < Number(Math.abs(gref))) {
      return ["L", "L"];
    } else if (Number(rezultat) == Number(Math.abs(gref))) {
      return [" ", "Green"];
    } else {
      return [" ", "Green"];
    }
  },

  Negativan: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "neg")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat.includes("pozitivan") || rezultat.includes("pos")) {
      return ["H", "Red"];
    } else if (rezultat.includes("negativan") || rezultat.includes("neg")) {
      return [" ", "Green"];
    } else if (rezultat.includes("graničan")) {
      return [" ", "Yellow"];
    } else {
      return [" ", "Red"];
    }
  },

  Antigen: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");

    // (Interpretacija: "antigen")

    if (rezultat === "") {
      return [" ", "No Class", "negativan"];
    } else if (rezultat == "pozitivan") {
      return ["H", "Red", "negativan"];
    } else if (rezultat == "positive") {
      return ["H", "Red", "negative"];
    } else if (rezultat == "Positiv") {
      return ["H", "Red", "Negativ"];
    } else if (rezultat == "negativan") {
      return [" ", "Green", "negativan"];
    } else if (rezultat == "negative") {
      return [" ", "Green", "negative"];
    } else if (rezultat == "Negativ") {
      return [" ", "Green", "Negativ"];
    } else if (rezultat == "graničan") {
      return [" ", "Yellow", "negativan"];
    } else {
      return [" ", "No Class", "negativan"];
    }
  },

  Trag: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "neg")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat.includes("pozitivan") || rezultat.includes("pos")) {
      return ["H", "Red"];
    } else if (
      rezultat.includes("negativan") ||
      rezultat.includes("neg") ||
      rezultat.includes("trag")
    ) {
      return [" ", "Green"];
    } else if (rezultat.includes("graničan")) {
      return [" ", "Yellow"];
    } else {
      return [" ", "Red"];
    }
  },

  Reaktivan: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "reakt")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (
      rezultat.toLowerCase().includes("reaktivan") &&
      !rezultat.toLowerCase().includes("nereaktivan")
    ) {
      return ["H", "Red"];
    } else if (rezultat.toLowerCase().includes("nereaktivan")) {
      return [" ", "Green"];
    } else if (rezultat.toLowerCase().includes("siva zona")) {
      return [" ", "Yellow"];
    } else {
      return [" ", "No Class"];
    }
  },

  COV2: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "")
      .replace(/[^\d\.]*/g, "");
    // console.log(rezultat)
    if (rezultat.includes("pozitivan") || rezultat.includes("pos")) {
      return ["H", "Red"];
    } else if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) >= Number(Math.abs(gref))) {
      return ["H", "Red"];
    } else if (rezultat.includes("reaktivan") || rezultat.includes("reakt")) {
      return ["H", "Red"];
    } else {
      return [" ", "Green"];
    }
  },

  Normalan: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "norm")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (
      rezultat.toLowerCase().includes("norm") &&
      !rezultat.toLowerCase().includes("nije")
    ) {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  Uredan: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "ured")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (
      rezultat.toLowerCase().includes("ured") &&
      !rezultat.toLowerCase().includes("nije")
    ) {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  Plus: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "ured")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat.trim() === "+++" || rezultat.trim() === "+ + +") {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  //

  SpermKolicina: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "da")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat.trim() === "da" || rezultat.trim() === "Da") {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  SpermIzgled: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "norm")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (
      rezultat.toLowerCase() === "uredan" ||
      rezultat.toLowerCase() === "uredno"
    ) {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  SpermBoja: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "norm")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat.toLowerCase() === "sivo bijela") {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  SpermLikvefakcija: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "norm")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat.toLowerCase() === "uredna") {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  SpermAglutinacija: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "norm")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat.toLowerCase() === "nije prisutna") {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  //

  Infekcija: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "infekc")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["pasivna infekcija", "Green"]; // pasivna infekcija
    } else if (
      Number(rezultat) <= Number(Math.abs(gref)) &&
      Number(rezultat) >= Number(Math.abs(dref))
    ) {
      return ["siva zona", "Yellow"]; // siva zona
    } else {
      return ["svježa infekcija", "Red"]; // svježa infekcija
    }
  },

  TSH: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "tsh")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["hipotireoza", "Red"];
    } else if (
      Number(rezultat) <= Number(Math.abs(gref)) &&
      Number(rezultat) >= Number(Math.abs(dref))
    ) {
      return ["eutireoza", "Green"];
    } else {
      return ["hipertireoza", "Red"];
    }
  },

  TRG: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "trg")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["visoko", "Red"]; // visoko
    } else if (
      Number(rezultat) <= Number(Math.abs(gref)) &&
      Number(rezultat) >= Number(Math.abs(dref))
    ) {
      return ["granično", "Yellow"]; // granično
    } else {
      return ["idealno", "Green"]; // idealno
    }
  },

  HOL: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "hol")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["visoko", "Red"]; // visoko
    } else if (
      Number(rezultat) <= Number(Math.abs(gref)) &&
      Number(rezultat) >= Number(Math.abs(dref))
    ) {
      return ["granično", "Yellow"]; // granično
    } else {
      return ["idealno", "Green"]; // idealno
    }
  },

  HDL: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "hdl")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["nema rizika", "Green"]; // nema rizika
    } else if (
      Number(rezultat) <= Number(Math.abs(gref)) &&
      Number(rezultat) >= Number(Math.abs(dref))
    ) {
      return ["rizik", "Yellow"]; // rizik
    } else {
      return ["visok rizik", "Red"]; // visok rizik
    }
  },

  LDL: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "ldl")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["visok rizik", "Red"]; // visok rizik
    } else if (
      Number(rezultat) <= Number(Math.abs(gref)) &&
      Number(rezultat) >= Number(Math.abs(dref))
    ) {
      return ["granično", "Yellow"]; // granično
    } else {
      return ["optimalno", "Green"]; // optimalno
    }
  },

  fPSA: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "fpsa")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["benigni proces", "Green"]; // benigni proces
    } else if (
      Number(rezultat) <= Number(Math.abs(gref)) &&
      Number(rezultat) >= Number(Math.abs(dref))
    ) {
      return ["siva zona", "Yellow"]; // siva zona
    } else {
      return ["H", "Red"];
    }
  },

  Sedimentacija: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "sediment")
    if (rezultat.includes("/")) {
      var rez1 = rezultat.split("/")[0].trim();
      var rez2 = rezultat.split("/")[1].trim();
    } else {
      var rez1 = rezultat.trim();
      var rez2 = rezultat.trim();
    }

    if (isNaN(rez1) || rez1 === "" || isNaN(rez2) || rez2 === "") {
      return [" ", "No Class"];
    } else if (Number(rez1) > Number(Math.abs(gref))) {
      // } else if (Number(rez1) > Number(Math.abs(gref)) || Number(rez2) > Number(Math.abs(gref))) {
      return ["H", "Red"];
    } else if (Number(rez1) === Number(Math.abs(gref))) {
      // } else if (Number(rez1) === Number(Math.abs(gref)) || Number(rez2) === Number(Math.abs(gref))) {
      return [" ", "Yellow"];
    } else {
      return [" ", "Green"];
    }
  },

  Bistar: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "bistar")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat === "bistar") {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  Boja: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "boja")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (
      rezultat === "svijetlo žut" ||
      rezultat === "žut" ||
      rezultat === "žuta"
    ) {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  pH: function (result, dref, gref) {
    if (result === ">=9.0" || result.includes(">=")) {
      return ["H", "Red"];
    } else {
      var rezultat = result
        .replace(/,/g, ".")
        .replace(/</g, "")
        .replace(/>/g, "");
      if (isNaN(rezultat) || rezultat === "" || (dref == "0" && gref == "0")) {
        return [" ", "No Class"];
      } else if (Number(rezultat) < Number(Math.abs(dref))) {
        return ["L", "Red"];
      } else if (Number(rezultat) > Number(Math.abs(gref))) {
        return ["H", "Red"];
      } else if (
        Number(rezultat) === Number(Math.abs(dref)) ||
        Number(rezultat) === Number(Math.abs(gref))
      ) {
        return [" ", "Yellow"];
      } else {
        return [" ", "Green"];
      }
    }
  },

  SG: function (result, dref, gref) {
    if (result === ">=1.030" || result.includes(">=")) {
      return ["H", "Red"];
    } else if (result === "<=1.005" || result.includes("<=")) {
      return ["L", "Red"];
    } else {
      var rezultat = result
        .replace(/,/g, ".")
        .replace(/</g, "")
        .replace(/>/g, "");
      if (isNaN(rezultat) || rezultat === "" || (dref == "0" && gref == "0")) {
        return [" ", "No Class"];
      } else if (Number(rezultat) < Number(Math.abs(dref))) {
        return ["L", "Red"];
      } else if (Number(rezultat) > Number(Math.abs(gref))) {
        return ["H", "Red"];
      } else if (
        Number(rezultat) === Number(Math.abs(dref)) ||
        Number(rezultat) === Number(Math.abs(gref))
      ) {
        return [" ", "Yellow"];
      } else {
        return [" ", "Green"];
      }
    }
  },

  URO: function (result, dref, gref) {
    if (result === ">=131" || result.includes(">=")) {
      return ["H", "Red"];
    } else {
      var rezultat = result
        .replace(/,/g, ".")
        .replace(/</g, "")
        .replace(/>/g, "");
      // (Interpretacija: "less")
      if (rezultat.includes("pozitivan") || rezultat.includes("pos")) {
        return ["H", "Red"];
      } else if (isNaN(rezultat) || rezultat === "") {
        return [" ", "No Class"];
      } else if (Number(rezultat) >= Number(Math.abs(gref))) {
        return ["H", "Red"];
      } else if (rezultat.includes("pozitivan") || rezultat.includes("pos")) {
        return ["H", "Red"];
      } else {
        return [" ", "Green"];
      }
    }
  },

  BojaSpermiogram: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "boja")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat === "blijedo žut") {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  Nesto: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "nesto")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (rezultat.includes("masa") || rezultat.includes("dosta")) {
      return ["H", "Red"];
    } else {
      return [" ", "Green"];
    }
  },

  Exists: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "exists")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else {
      return ["H", "Red"];
    }
  },

  Prisutno: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "prisutno")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(gref)) {
      return ["H", "Red"];
    } else {
      return [" ", "Green"];
    }
  },

  Gljivice: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "gljivice")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(gref)) {
      return ["H", "Red"];
    } else if (isNaN(rezultat)) {
      return ["H", "Red"];
    } else {
      return [" ", "Green"];
    }
  },

  LeuEr: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "leuer")
    if (rezultat.toUpperCase().includes("DOSTA")) {
      return ["H", "Red"];
    } else if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(gref)) {
      return ["H", "Red"];
    } else if (Number(rezultat) === Number(gref)) {
      return [" ", "Yellow"];
    } else {
      return [" ", "Green"];
    }
  },

  Nema: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "exists")
    if (rezultat === "") {
      return [" ", "No Class"];
    } else {
      return ["H", "Red"];
    }
  },

  Blasti: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // DKS: Blasti (Interpretacija: "blst")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (Number(rezultat) < Number(Math.abs(dref))) {
      return [" ", "No Class"];
    } else if (Number(rezultat) > Number(Math.abs(gref))) {
      return ["H", "Red"];
    } else if (
      Number(rezultat) === Number(Math.abs(dref)) ||
      Number(rezultat) === Number(Math.abs(gref))
    ) {
      return [" ", "No Class"];
    } else {
      return [" ", "Green"];
    }
  },

  Morf: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // Spermiogram: Uredne morfološke forme (Interpretacija: "morf")
    if (isNaN(rezultat) || rezultat === "") {
      return [" ", "No Class"];
    } else if (
      Number(rezultat) === Number(Math.abs(dref)) ||
      Number(rezultat) === Number(Math.abs(gref))
    ) {
      return [" ", "Green"];
    } else {
      return ["H", "Red"];
    }
  },

  LeuErc: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // Sediment: Leukociti, Eritrociti (Interpretacija: "leu")
    if (rezultat.includes("-")) {
      var rez = rezultat.split("-")[1].trim();
    } else {
      var rez = rezultat.trim();
    }

    if (rez === "") {
      return [" ", "No Class"];
    } else if (isNaN(rez)) {
      return ["H", "Red"];
    } else if (Number(rez) > Number(gref)) {
      return ["H", "Red"];
    } else if (Number(rez) === Number(gref)) {
      return [" ", "Yellow"];
    } else {
      return [" ", "Green"];
    }
  },

  Titar: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "titar")
    if (rezultat.includes(":")) {
      var rez1 = rezultat.split(":")[0].trim();
      var rez2 = rezultat.split(":")[1].trim();
    } else {
      var rez1 = rezultat.trim();
      var rez2 = "";
    }

    if (
      isNaN(rez1) ||
      rez1 === "" ||
      rez1 != "1" ||
      isNaN(rez2) ||
      rez2 === ""
    ) {
      return [" ", "No Class"];
    } else if (Number(rez2) > Number(Math.abs(gref))) {
      return ["H", "Red"];
    } else if (Number(rez2) === Number(Math.abs(gref))) {
      return [" ", "Yellow"];
    } else {
      return [" ", "Green"];
    }
  },

  Specific: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // (Interpretacija: "spec")
    return [" ", "No Class"];
  },

  // Pregled sedimenta urina - mikroskopski pregled

  EpitelneStanice: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    var referenca = "";
    // console.log(rezultat)
    // (Interpretacija: "s01")

    if (rezultat === "") {
      return [" ", "No Class", referenca];
    } else {
      if (rezultat.includes("tranzicijsk")) {
        return ["H", "Red", referenca];
      } else {
        referenca = "rijedak";
        if (
          rezultat.includes("masa") ||
          rezultat.includes("dosta") ||
          rezultat.includes("nešto") ||
          rezultat.includes("malo")
        ) {
          return ["H", "Red", referenca];
        } else {
          return [" ", "Green", referenca];
        }
      }
    }
  },

  Kristali: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    var referenca = "";
    // console.log(rezultat)
    // (Interpretacija: "s02")

    if (rezultat === "") {
      return [" ", "No Class", referenca];
    } else {
      if (rezultat === "rijedak Ca oxalat" || rezultat === "negativan") {
        referenca = "rijedak";
        return [" ", "Green", referenca];
      } else if (
        rezultat === "malo Ca oxalata" ||
        rezultat === "nešto Ca oxalata" ||
        rezultat === "dosta Ca oxalata"
      ) {
        referenca = "rijedak";
        return ["H", "Red", referenca];
      } else {
        return ["H", "Red", referenca];
      }
    }
  },

  Soli: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // console.log(rezultat)
    // (Interpretacija: "s02")

    if (rezultat === "") {
      return [" ", "No Class"];
    } else {
      if (
        rezultat.includes("masa") ||
        rezultat.includes("dosta") ||
        rezultat.includes("nešto") ||
        rezultat.includes("malo")
      ) {
        return ["H", "Red"];
      } else {
        return [" ", "Green"];
      }
    }
  },

  Bakterije: function (result, dref, gref) {
    var rezultat = result
      .replace(/,/g, ".")
      .replace(/</g, "")
      .replace(/>/g, "");
    // console.log(rezultat)
    // (Interpretacija: "u06")

    if (rezultat === "") {
      return [" ", "No Class"];
    } else if (
      rezultat.includes("masa") ||
      rezultat.includes("dosta") ||
      rezultat.includes("nešto")
    ) {
      return ["H", "Red"];
    } else {
      return [" ", "Green"];
    }
  },
};
