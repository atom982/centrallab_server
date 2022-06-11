var parse_date = require('../shared/parse_date.js')

const config = require('../../config/index')
var fs = require('fs')

module.exports = {
  rezultat: function (final, spol, jmbg, ime, tpsa, fe, uzorak, source) {

    var file = config.logs_path + 'calculated.txt'
    

    var text = new Date().toUTCString() + '\r\n' + '...egfr.js' + '\r\n' + 'From: ' + source + '\r\n' +
      'Test: ' + ime + '\r\n' + 'Spol: ' + spol + '\r\n' + 'JMBG: ' + jmbg + '\r\n' +
      'Željezo value: ' + fe + '\r\n' + 't-PSA value: ' + tpsa + '\r\n' +
      'Uzorak: ' + uzorak + '\r\n' + 'Formula: ' + final + '\r\n' + 'FORMULA NOT COMPLETE' + '\r\n'   

    if (final.includes('<') || final.includes('>') || final.includes('-----')) {
      text += 'Rezultat sadrzi nedozvoljeni karakter.' + '\r\n' + '\r\n'
      fs.appendFile(file, text, function (err) { })
      return '-----'
    } else {

      var str = ''
      var tmp = ''
      var jmbgDan = jmbg.slice(0, 2)
      var jmbgMjesec = jmbg.slice(2, 4)
      var jmbgGodina = jmbg.slice(4, 7)

      if (jmbgGodina[0] === '9') {
        str = '1'
        tmp = jmbgGodina
        jmbgGodina = str.concat(tmp)
      } else if (jmbgGodina[0] === '0') {
        str = '2'
        tmp = jmbgGodina
        jmbgGodina = str.concat(tmp)
      } else {
        // console.log("Invalid year...")
      }

      var date = jmbgGodina + '-' + jmbgMjesec + '-' + jmbgDan
      jmbgObj = parse_date.godineStarosti(date)
      var zGodina = jmbgObj.years + 1

      if (zGodina > 18) {
        if (spol === 'ŽENSKI') {
          var z_egfr = final + '*' + Math.pow(eval(zGodina), eval(-0.203)) + '*' + 0.742          
          text += 'Godina: ' + zGodina + '\r\n' + 'Spol: ' + spol + '\r\n' + 'Rezultat: ' + eval(z_egfr) + '\r\n' + '\r\n'
          fs.appendFile(file, text, function (err) { })
          return eval(z_egfr).toFixed(2)
        } else {
          var z_egfr = final + '*' + Math.pow(eval(zGodina), eval(-0.203))          
          text += 'Godina: ' + zGodina + '\r\n' + 'Spol: ' + spol + '\r\n' + 'Rezultat: ' + eval(z_egfr) + '\r\n' + '\r\n'
          fs.appendFile(file, text, function (err) { })
          return eval(z_egfr).toFixed(2)
        }
      } else {
        text += 'Godina: ' + zGodina + '\r\n' + 'Spol: ' + spol + '\r\n' + 'Rezultat: -----' + '\r\n' + '\r\n'
        fs.appendFile(file, text, function (err) { })
        return '-----'
      }
    }
  }
};
