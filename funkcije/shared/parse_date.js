module.exports = {
  godineStarosti: function(date) {
    // Takes one string parameter -- date in YYYY-MM-DD
    date = date.split("-");
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var yy = parseInt(date[0]);
    var mm = parseInt(date[1]);
    var dd = parseInt(date[2]);
    var years, months, days;
    // months
    months = month - mm;
    if (day < dd) {
      months = months - 1;
    }
    // years
    years = year - yy;
    if (month * 100 + day < mm * 100 + dd) {
      years = years - 1;
      months = months + 12;
    }
    // days
    days = Math.floor(
      (today.getTime() - new Date(yy + years, mm + months - 1, dd).getTime()) /
        (24 * 60 * 60 * 1000)
    );
    //
    return { years: years, months: months, days: days };
  }
};
