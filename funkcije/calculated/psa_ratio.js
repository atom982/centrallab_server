const config = require('../../config/index')
var fs = require('fs')

module.exports = {
  rezultat: function (final, spol, jmbg, ime, tpsa, fe, uzorak, source) {

    var file = config.logs_path + 'calculated.txt'

    var text = new Date().toUTCString() + '\r\n' + '...psa_ratio.js' + '\r\n' + 'From: ' + source + '\r\n' +
      'Test: ' + ime + '\r\n' + 'Spol: ' + spol + '\r\n' + 'JMBG: ' + jmbg + '\r\n' +
      'Željezo value: ' + fe + '\r\n' + 't-PSA value: ' + tpsa + '\r\n' +
      'Uzorak: ' + uzorak + '\r\n' + 'Formula: ' + final + '\r\n' + 'COMPLETE FORMULA' + '\r\n'

    if (final.includes('<') || final.includes('>') || final.includes('-----')) {
      text += 'Rezultat sadrzi nedozvoljeni karakter.' + '\r\n' + '\r\n'
      fs.appendFile(file, text, function (err) { })
      return '-----'
    } else {

      if (Number(tpsa) >= 10) {
        text += 't-PSA je veci ili jednak 10...' + '\r\n' + '\r\n'
        fs.appendFile(file, text, function (err) { })
        return '-----'
      } else {
        text += 'Rezultat: ' + eval(final) + '\r\n' + '\r\n'
        fs.appendFile(file, text, function (err) { })
        return eval(final).toFixed(2)
      }
    }
  }
};
