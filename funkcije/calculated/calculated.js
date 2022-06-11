var egfr = require("./egfr")
var psa_ratio = require("./psa_ratio")
var tf_sat = require("./tf_sat")

const config = require('../../config/index')
var fs = require('fs')

module.exports = {
  rezultat: function (final, spol, jmbg, ime, tpsa, fe, uzorak, source) {

    switch (ime) {

      case 'TEST':
        return egfr.rezultat(final, spol, jmbg, ime, tpsa, fe, uzorak, source)
        break;

      // case 'PSA-ratio':
      //   return psa_ratio.rezultat(final, spol, jmbg, ime, tpsa, fe, uzorak, source)
      //   break;

      // case 'Tf-Sat':
      //   return tf_sat.rezultat(final, spol, jmbg, ime, tpsa, fe, uzorak, source)
      //   break;

      // Default

      default:

        var file = config.logs_path + 'calculated.txt'

        var text = new Date().toUTCString() + '\r\n' + '...calculated.js' + '\r\n' + 'From: ' + source + '\r\n' +
          'Test: ' + ime + '\r\n' + 'Spol: ' + spol + '\r\n' + 'JMBG: ' + jmbg + '\r\n' +
          'Željezo value: ' + fe + '\r\n' + 't-PSA value: ' + tpsa + '\r\n' +
          'Uzorak: ' + uzorak + '\r\n' + 'Formula: ' + final + '\r\n' + 'COMPLETE FORMULA' + '\r\n'

        if (final.includes('<') || final.includes('>') || final.includes('-')) {
          text += 'Rezultat sadrzi nedozvoljeni karakter.' + '\r\n' + '\r\n'
          fs.appendFile(file, text, function (err) { })
          return ''
        } else {

          var greska = false;

          try {
            eval(final);
          } catch (err) {
            greska = true;
          } finally {
            if (!greska) {
              if (eval(final).toString().includes(".")) {
                var calculated = eval(final).toFixed(2);
              } else {
                var calculated = eval(final);
              }

              text += 'Rezultat: ' + eval(final) + '\r\n' + '\r\n'
              fs.appendFile(file, text, function (err) { })

              return calculated

             
            } else {
              return ''
            }
          }
        }

        break;
    }
  }
};
