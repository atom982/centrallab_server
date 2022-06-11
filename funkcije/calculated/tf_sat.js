const config = require('../../config/index')
var fs = require('fs')

module.exports = {
  rezultat: function (final, spol, jmbg, ime, tpsa, fe, uzorak, source) {

    var file = config.logs_path + 'calculated.txt'

    var text = new Date().toUTCString() + '\r\n' + '...tf_sat.js' + '\r\n' + 'From: ' + source + '\r\n' +
      'Test: ' + ime + '\r\n' + 'Spol: ' + spol + '\r\n' + 'JMBG: ' + jmbg + '\r\n' +
      'Željezo value: ' + fe + '\r\n' + 't-PSA value: ' + tpsa + '\r\n' +
      'Uzorak: ' + uzorak + '\r\n' + 'Formula: ' + final + '\r\n' + 'FORMULA NOT COMPLETE' + '\r\n'

    if (final.includes('<') || final.includes('>') || final.includes('-----')) {
      text += 'Rezultat sadrzi nedozvoljeni karakter.' + '\r\n' + '\r\n'
      fs.appendFile(file, text, function (err) { })
      return '-----'
    } else {

      var tfsat = eval(final + '*' + fe)

      text += 'Rezultat: ' + eval(tfsat) + '\r\n' + '\r\n'
      fs.appendFile(file, text, function (err) { })
      return eval(tfsat).toFixed(2)
    }
  }
};
