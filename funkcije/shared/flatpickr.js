function parseInput(data) {
  var godina = data.substring(11, 15);
  var mjesec = data.substring(4, 7);
  var dan = data.substring(8, 10);
  var sat = data.substring(16, 18);
  var min = data.substring(19, 21);

  switch (mjesec) {
    case "Jan":
      mjesec = "01";
      break;
    case "Feb":
      mjesec = "02";
      break;
    case "Mar":
      mjesec = "03";
      break;
    case "Apr":
      mjesec = "04";
      break;
    case "May":
      mjesec = "05";
      break;
    case "Jun":
      mjesec = "06";
      break;
    case "Jul":
      mjesec = "07";
      break;
    case "Aug":
      mjesec = "08";
      break;
    case "Sep":
      mjesec = "09";
      break;
    case "Oct":
      mjesec = "10";
      break;
    case "Nov":
      mjesec = "11";
      break;
    case "Dec":
      mjesec = "12";
      break;
    default:
      mjesec = "00";
      break;
  }
  var datum = dan + "/" + mjesec + "/" + godina;
  var vrijeme = sat + ":" + min;
  var both = dan + "." + mjesec + "." + godina + " " + sat + ":" + min;
  return [datum, vrijeme, both];
}

module.exports = {
  parseDate: function(data) {
    return parseInput(data.toString())[0];
  },
  parseTime: function(data) {
    return parseInput(data.toString())[1];
  },
  parseBoth: function(data) {
    return parseInput(data.toString())[2];
  }
};
