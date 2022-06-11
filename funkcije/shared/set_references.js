module.exports = {
  get: function(
    nazivTesta,
    rbmenopauza,
    elgrupa,
    elspol,
    rbspol,
    refd,
    refg,
    interp,
    extend,
    pdijabetes,
    pduhan,
    rbtrudnica,
    rbanticoag,
    rbmenstc,
    starost,
    dDob,
    gDob,
    jmbg
  ) {
    var currentdate = new Date();
    var currenthour = currentdate.getHours();
    var currentminute = currentdate.getMinutes();
    var obj = {};
    var check = true;

    // Potrebno za IGF-I,	Somatomedin-C

    var str = "";
    var tmp = "";
    var jmbgDan = jmbg.slice(0, 2);
    var jmbgMjesec = jmbg.slice(2, 4);
    var jmbgGodina = jmbg.slice(4, 7);

    if (jmbgGodina[0] === "9") {
      str = "1";
      tmp = jmbgGodina;
      jmbgGodina = str.concat(tmp);
    } else if (jmbgGodina[0] === "0") {
      str = "2";
      tmp = jmbgGodina;
      jmbgGodina = str.concat(tmp);
    }

    var date = jmbgGodina + "-" + jmbgMjesec + "-" + jmbgDan;

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

    var jmbgObj = { years: years, months: months, days: days };

    // End of

    if (
      rbtrudnica === "Prvo tromjesečje" &&
      elgrupa === "PRVOTR" &&
      elspol === rbspol
    ) {
      obj.grupa = elgrupa;
      obj.interp = interp;
      obj.extend = extend;
      obj.refd = refd;
      obj.refg = refg;
      check = false;
    } else if (
      rbtrudnica === "Drugo tromjesečje" &&
      elgrupa === "DRUGOTR" &&
      elspol === rbspol
    ) {
      obj.grupa = elgrupa;
      obj.interp = interp;
      obj.extend = extend;
      obj.refd = refd;
      obj.refg = refg;
      check = false;
    } else if (
      rbtrudnica === "Treće tromjesečje" &&
      elgrupa === "TRECETR" &&
      elspol === rbspol
    ) {
      obj.grupa = elgrupa;
      obj.interp = interp;
      obj.extend = extend;
      obj.refd = refd;
      obj.refg = refg;
      check = false;
    }

    if (check) {
      // ROMA ---
      if (
        nazivTesta === "ROMA-Pre" &&
        rbmenopauza === "Premenopauza" &&
        elgrupa === "MPPRED" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "ROMA-Pos" &&
        rbmenopauza === "Postmenopauza" &&
        elgrupa === "MPPOST" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of ROMA ---

      // Kortizol ---
      else if (
        nazivTesta === "Kortizol" &&
        (currenthour < 10 && currenthour > 6) &&
        currentminute < 60 &&
        elgrupa === "AM0710" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "Kortizol" &&
        (currenthour < 20 && currenthour > 15) &&
        currentminute < 60 &&
        elgrupa === "PM1620" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of Kortizol ---

      // Gluk ---
      else if (
        nazivTesta === "Gluk" &&
        pdijabetes === "DA" &&
        elgrupa === "DIJABETES" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of Gluk ---

      // CEA ---
      else if (
        nazivTesta === "CEA" &&
        pduhan === "DA" &&
        elgrupa === "TOBACCO" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of CEA ---

      // CRP ---
      else if (
        nazivTesta === "CRP" &&
        rbtrudnica != "NE" &&
        elgrupa === "TRUDNICA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of CRP

      // PV-INR ---
      else if (
        nazivTesta === "PV-INR" &&
        rbanticoag === "Standardna terapija" &&
        elgrupa === "STDTER" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "PV-INR" &&
        rbanticoag === "Intenzivna terapija" &&
        elgrupa === "INTTER" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of PV-INR

      // INR ---
      else if (
        nazivTesta === "INR" &&
        rbanticoag === "Standardna terapija" &&
        elgrupa === "STDTER" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "INR" &&
        rbanticoag === "Intenzivna terapija" &&
        elgrupa === "INTTER" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of INR

      // PV-Q ---
      else if (
        nazivTesta === "PV-Q" &&
        rbanticoag === "Standardna terapija" &&
        elgrupa === "STDTER" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "PV-Q" &&
        rbanticoag === "Intenzivna terapija" &&
        elgrupa === "INTTER" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of PV-Q

      // E2 ---
      else if (
        nazivTesta === "E2" &&
        rbmenopauza === "Menopauza" &&
        elgrupa === "MPDA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "E2" &&
        rbmenstc === "Folikularana faza" &&
        elgrupa === "MCFOL" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "E2" &&
        rbmenstc === "Ovulaciona faza" &&
        elgrupa === "MCOVL" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "E2" &&
        rbmenstc === "Lutealna faza" &&
        elgrupa === "MCLUT" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of E2 ---

      // FSH ---
      else if (
        nazivTesta === "FSH" &&
        rbmenopauza === "Menopauza" &&
        elgrupa === "MPDA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "FSH" &&
        rbmenstc === "Folikularana faza" &&
        elgrupa === "MCFOL" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "FSH" &&
        rbmenstc === "Ovulaciona faza" &&
        elgrupa === "MCOVL" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "FSH" &&
        rbmenstc === "Lutealna faza" &&
        elgrupa === "MCLUT" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of FSH ---

      // LH ---
      else if (
        nazivTesta === "LH" &&
        rbmenopauza === "Menopauza" &&
        elgrupa === "MPDA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "LH" &&
        rbmenstc === "Folikularana faza" &&
        elgrupa === "MCFOL" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "LH" &&
        rbmenstc === "Ovulaciona faza" &&
        elgrupa === "MCOVL" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "LH" &&
        rbmenstc === "Lutealna faza" &&
        elgrupa === "MCLUT" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of LH ---

      // Prog ---
      else if (
        nazivTesta === "Prog" &&
        rbmenopauza === "Menopauza" &&
        elgrupa === "MPDA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "Prog" &&
        rbmenstc === "Folikularana faza" &&
        elgrupa === "MCFOL" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } else if (
        nazivTesta === "Prog" &&
        rbmenstc === "Lutealna faza" &&
        elgrupa === "MCLUT" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of Prog ---

      // OGTT-60 ---
      else if (
        nazivTesta === "OGTT-60" &&
        rbtrudnica != "NE" &&
        elgrupa === "TRUDNICA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of OGTT-60 ---

      // OGTT-0 ---
      else if (
        nazivTesta === "OGTT-0" &&
        rbtrudnica != "NE" &&
        elgrupa === "TRUDNICA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of OGTT-0 ---

      // OGTT-120 ---
      else if (
        nazivTesta === "OGTT-120" &&
        rbtrudnica != "NE" &&
        elgrupa === "TRUDNICA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of OGTT-120 ---

      // OGTT-180 ---
      else if (
        nazivTesta === "OGTT-180" &&
        rbtrudnica != "NE" &&
        elgrupa === "TRUDNICA" &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of OGTT-180 ---

      // IGF-I,	Somatomedin-C ---
      else if (
        nazivTesta === "IGF-I" &&
        elspol === rbspol &&
        jmbgObj.years.toString() === dDob.toString() &&
        jmbgObj.years.toString() === gDob.toString() &&
        elspol === rbspol
      ) {
        // console.log('JMBG: ' + jmbg);
        // console.log(jmbgObj.years);

        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;

        // console.log(obj);
      } // End of IGF-I,	Somatomedin-C ---

      // Default ---
      else if (
        nazivTesta != "IGF-I" &&
        starost >= parseFloat(dDob) &&
        parseFloat(gDob) >= starost &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of Default
    }

    return obj;
  },

  anaget: function(
    nazivTesta,
    rbmenopauza,
    elgrupa,
    elspol,
    rbspol,
    refd,
    refg,
    interp,
    extend,
    pdijabetes,
    pduhan,
    rbtrudnica,
    rbanticoag,
    rbmenstc,
    starost,
    dDob,
    gDob,
    jmbg
  ) {
    var obj = {};
    var check = true;

    if (
      rbtrudnica === "Prvo tromjesečje" &&
      elgrupa === "PRVOTR" &&
      elspol === rbspol
    ) {
      obj.grupa = elgrupa;
      obj.interp = interp;
      obj.extend = extend;
      obj.refd = refd;
      obj.refg = refg;
      check = false;
    } else if (
      rbtrudnica === "Drugo tromjesečje" &&
      elgrupa === "DRUGOTR" &&
      elspol === rbspol
    ) {
      obj.grupa = elgrupa;
      obj.interp = interp;
      obj.extend = extend;
      obj.refd = refd;
      obj.refg = refg;
      check = false;
    } else if (
      rbtrudnica === "Treće tromjesečje" &&
      elgrupa === "TRECETR" &&
      elspol === rbspol
    ) {
      obj.grupa = elgrupa;
      obj.interp = interp;
      obj.extend = extend;
      obj.refd = refd;
      obj.refg = refg;
      check = false;
    }

    if (check) {
      // Default ---
      if (
        starost >= parseFloat(dDob) &&
        parseFloat(gDob) >= starost &&
        elspol === rbspol
      ) {
        obj.grupa = elgrupa;
        obj.interp = interp;
        obj.extend = extend;
        obj.refd = refd;
        obj.refg = refg;
      } // End of Default
    }

    return obj;
  }
};
