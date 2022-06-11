module.exports = {
  test: function (test, site) {
    // console.log(test)
    if (test === "Starost" || test === "Vađenje krvi" || test === "Kućna posjeta") {
      return false;
    } else {
      return true;
    }
  },
};
