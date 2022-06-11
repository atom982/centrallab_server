var jmbgObjGet = require("../shared/parse_date");

module.exports = {
  get: function(jmbg) {
    var age = null;
    var current = null;
    var g = new Date();

    current = g.getFullYear().toString();
    if (jmbg.substring(4, 7).charAt(0) === "9") {
      age = "1" + jmbg.substring(4, 7);
    } else {
      age = "2" + jmbg.substring(4, 7);
    }

    var date = age + "-" + jmbg.slice(2, 4) + "-" + jmbg.slice(0, 2);
    var jmbgObj = jmbgObjGet.godineStarosti(date);

    if (jmbgObj.years < 1 && jmbgObj.months < 1) {
      console.log("Dana starosti: " + jmbgObj.days);

      switch (jmbgObj.days.toString()) {
        case "0": // 0.00 – 0.04
          return 0.0;
          break;
        case "1":
          return 0.0001;
          break;
        case "2":
          return 0.0002;
          break;
        case "3":
          return 0.0003;
          break;
        case "4":
          return 0.0004;
          break;
        case "5":
          return 0.0005;
          break;
        case "6":
          return 0.0006;
          break;
        case "7":
          return 0.0007;
          break;
        case "8":
          return 0.0008;
          break;
        case "9":
          return 0.0009;
          break;
        case "10":
          return 0.001;
          break;
        case "11":
          return 0.0011;
          break;
        case "12":
          return 0.0012;
          break;
        case "13":
          return 0.0013;
          break;
        case "14":
          return 0.0014;
          break;
        case "15": // 0.05 – 0.08
          return 0.0515;
          break;
        case "16":
          return 0.0516;
          break;
        case "17":
          return 0.0517;
          break;
        case "18":
          return 0.0518;
          break;
        case "19":
          return 0.0519;
          break;
        case "20":
          return 0.052;
          break;
        case "21":
          return 0.0521;
          break;
        case "22":
          return 0.0522;
          break;
        case "23":
          return 0.0523;
          break;
        case "24":
          return 0.0524;
          break;
        case "25":
          return 0.0525;
          break;
        case "26":
          return 0.0526;
          break;
        case "27":
          return 0.0527;
          break;
        case "28":
          return 0.0528;
          break;
        case "29":
          return 0.0529;
          break;
        case "30":
          return 0.053;
          break;

        default:
          return 0.0531;
          break;
      }

      // if (jmbgObj.days < 15) {
      //   return  0.02
      // } else {
      //   return  0.06
      // }
    } else if (jmbgObj.years < 1) {
      if (jmbgObj.months > 10 && jmbgObj.months < 12) {
        return 0.95;
      } else if (jmbgObj.months > 9 && jmbgObj.months < 11) {
        return 0.87;
      } else if (jmbgObj.months > 8 && jmbgObj.months < 10) {
        return 0.8;
      } else if (jmbgObj.months > 7 && jmbgObj.months < 9) {
        return 0.7;
      } else if (jmbgObj.months > 6 && jmbgObj.months < 8) {
        return 0.63;
      } else if (jmbgObj.months > 5 && jmbgObj.months < 7) {
        return 0.55;
      } else if (jmbgObj.months > 4 && jmbgObj.months < 6) {
        return 0.45;
      } else if (jmbgObj.months > 3 && jmbgObj.months < 5) {
        return 0.37;
      } else if (jmbgObj.months > 2 && jmbgObj.months < 4) {
        return 0.3;
      } else if (jmbgObj.months > 1 && jmbgObj.months < 3) {
        return 0.22;
      } else if (jmbgObj.months > 0 && jmbgObj.months < 2) {
        return 0.1;
      }
    } else {
      return parseFloat(current) - parseFloat(age);
    }
  }
};
