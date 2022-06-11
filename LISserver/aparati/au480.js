module.exports = {

    parsaj_rezultat: function (record, io,serijski) {
  
      var mongoose = require("mongoose");
  
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
  
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
  
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");
  
  
  
      var calculated = require("../../funkcije/calculated/calculated");
  
  
      var sn = '';
      var sifra_p = '';
      var vrijeme_prijenosa = '';
      var gender = '';
      var sid = '';
      var qc = false
      var type_of_r = '';
      var dilucija = '';
      var reagens_lot = '';
      var reagens_sn = '';
      var rezultat_f = '';
      var jedinice_f = '';
      var vrijeme_rezultata = '';
      var module_sn = '';
  
      var spol = '';
      var jmbg = '';
      var tpsa = "";
      var fe = "";

        console.log('usao u AU400 fajl')
        console.log(record)
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            sn = sender[2];
            vrijeme_prijenosa = Date.now();
            console.log("Vrijeme prenosa: " + vrijeme_prijenosa);
            break;

          case 'D':
            console.log("Rezultati AU400: ");
            //'D 000501 0036          S014P81028    E86      302br38      0.9r 43       53r ' 
            var tempRezH = element.split("E");
            var tempRezR = tempRezH[1];
            var dRezultati = []
            var fRezultati  =[]
            sid = tempRezH[0].split(' ');
            sid = sid[12]
            console.log('SID:'+sid)
            console.log(tempRezR)
            var duzina = tempRezR.length / 10
            var counter = Math.ceil(duzina) 
            console.log(counter)
                var i;
                for ( i= 1; i <= counter; i++) { 
                    tempRezR.substring(10*(i-1),10*i)
                    dRezultati.push(tempRezR.substring(10*(i-1),10*i))
                }

                dRezultati.forEach(rez => {
                    fRezultati.push({
                                    rezultat_f :rez.substring(2,10).trim().replace("r", "").replace("h", "").replace("l", "").replace("H", "").replace("L", ""),
                                    kod : rez.substring(0,2)
                                    })
                })
                console.log(fRezultati)
            //86      302br38      0.9r 43       53r
            // sifra_p =tempRezR[3];
            // dilucija = tempRezR[5];
            // reagens_lot = tempRezR[7];
            // reagens_sn = tempRezR[8];
            // if (!isNaN(tempRezR[3])) {
            //   rezultat_f = parseFloat(result[3]).toFixed(2);
            // } else {
            //   rezultat_f = tempRezR[3]
            // }
            // jedinice_f = result[4];
            // vrijeme_rezultata = result[12];
            // module_sn = result[13];
                Samples.findOne({ id: sid }).populate('patient tests.labassay').exec(function (err, uzorak) {
                  if (err) {
                    console.log("Greška:", err);
                  }
                  else {                  
                    if (uzorak === null) {
                      console.log('U LIS-u ne postoji definisan order za uzorak broj: ' + sid);
                    } else {
                      var sekc = uzorak.tests[0].labassay.sekcija
                      console.log("Uzorak pronađen");
                      if (uzorak.status != "OBRAĐEN") {
                        fRezultati.forEach(rezRe => {

                      
                        AnaAssays.findOne({ kod: rezRe.kod,aparat:mongoose.Types.ObjectId(serijski) }).populate('test').lean().exec(function (err, test) {
                          if (err) {
                            console.log("Greška:", err);
                          }
                          else {
                            // console.log(test)
                            if (test === null) {
                              console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + ' ni na jednom aparatu' + sn);
                            } else {
                              uzorak.tests.forEach(elementu => {
  
                                if ((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") || (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)) {
                                  console.log('Match Found')
                                  // console.log(elementu)
                                  elementu.status_t = "REALIZOVAN"
                                  elementu.status_r = false
                                  var rezultat = {};
                                  rezultat.anaassay = test
                                  rezultat.sn = sn
                                  rezultat.vrijeme_prijenosa = vrijeme_prijenosa
                                  rezultat.vrijeme_rezultata = Date.now()
                                  rezultat.dilucija = 'dilucija'
                                  rezultat.module_sn = sn
                                  rezultat.reagens_lot = 'reagens_lot'
                                  rezultat.reagens_sn = 'reagens_sn'
                                  var rezF = ''
                                  fRezultati.forEach(temp => {
                                        if(temp.kod ===test.kod){
                                            rezF = temp.rezultat_f
                                        }
                                  })
                                  if(rezF.trim() ===""){
                                    rezF = "-----"
                                  }
                                  rezultat.rezultat_f = rezF.trim()

                                  rezultat.jedinice_f = test.test.jedinica
                                  rezultat.rezultat_p = 'rezultat_p'
                                  rezultat.jedinice_p = 'jedinice_p'
                                  rezultat.rezultat_i = 'rezultat_i'
                                  rezultat.odobren = false
                                  var json = {};
                                  json.labassay = test.test
                                  json.rezultat = []
                                  json.rezultat.push(rezultat)
                                  Results.findOne({ id: uzorak.id }).populate('rezultati rezultati.labassay patient').exec(function (err, result) {
                                    if (err) {
                                      console.log("Greška:", err)
                                    }
                                    else {
                                      if (result.created_at === null) {
                                        result.created_at = Date.now()
                                      }
                                      spol = result.patient.spol
                                      jmbg = result.patient.jmbg
                                      // console.log(result)
                                      var counter = 0
                                      result.rezultati.forEach(element => {
                                        counter++
                                        if ((element.labassay.sifra === test.test.sifra) && (element.retest = true)) {
  
                                          element.retest = false // Ne postavljati ovdje, nego kada dođe rezultat.
                                          result.updated_at = Date.now()
                                          element.rezultat.push(rezultat)
  
                                          uzorak.status = "U OBRADI"
                                          if (element.rezultat.length < 1) {
                                            element.status = "NIJE ODOBREN"
                                          }
                                          if (element.status != "ODOBREN") {
                                            element.status = "NIJE ODOBREN"
                                            uzorak.save()
                                            var received = elementu.labassay.naziv
                                            console.log(':: Dosao test sa AU480: ' + elementu.labassay.naziv)
  
                                            result.save(function (err, novi) {
                                              if (err) {
                                                console.log("Greška:", err);
                                              } else {
                                                console.log("Rezultat sačuvan.")
                                                var komplet = true
                                                var formula = []
                                                var tocalculate = ''
  
                                                novi.rezultati.forEach(element => {
                                                  if (!element.rezultat.length) {
                                                    komplet = false
                                                  }
                                                  if ((element.retest)) {
                                                    komplet = false
                                                  }
                                                  if (element.labassay.calculated) {
                                                    var match = false
                                                    element.labassay.calculatedTests.forEach(required => {
                                                      if (test.test._id.equals(mongoose.Types.ObjectId(required.labassay))) {
                                                        match = true
                                                        console.log(':: Ima kalkulisani test koji zavisi od rezultata testa: ' + received)
                                                        
                                                      }
                                                    })
                                                    if (match) {
                                                      console.log(':: Kalkulisani test: ' + 'not defined here.')
  
  
                                                      element.labassay.calculatedTests.forEach(required => {
                                                        novi.rezultati.forEach(rez => {
                                                          if (rez.labassay.equals(mongoose.Types.ObjectId(required.labassay))) {                                                          
                                                            formula = element.labassay.calculatedFormula
                                                            if (rez.rezultat.length > 0) {
                                                              // arr.forEach((o, i, a) => a[i] = myNewVal) 
                                                              formula.forEach((clan, i, array) => {
                                                                if (clan.length > 10) {
                                                                  if (rez.labassay.equals(mongoose.Types.ObjectId(clan))) {                                                                  
                                                                    array[i] = rez.rezultat[rez.rezultat.length - 1].rezultat_f
                                                                  }
                                                                }
                                                              });
                                                              var calculatedComp = true
                                                              var final = ''
                                                              var j = 0
                                                              
                                                              formula.forEach(broj => {
                                                                j++
                                                                final += broj
                                                                // Izračunavanje, pod uslovom da su pristigli svi testovi
                                                                if (broj.length > 15) {
                                                                  calculatedComp = false
                                                                }
                                                                if (broj.trim() === "") {
                                                                  calculatedComp = false
                                                                }
                                                              })
  
                                                              if (calculatedComp && j === formula.length) {
                                                                
                                                                AnaAssays.findOne({ test: element.labassay._id }).populate('aparat test').exec(function (err, testap) {
                                                                  if (err) {
                                                                    console.log("Greška:", err);
                                                                  }
                                                                  else {
                                                                    console.log(testap.test.naziv)
                                                                    tocalculate = testap.test.naziv
                                                                    console.log('Računam kalkulisani test: ' + tocalculate)
                                                                    console.log('Formula za kalkulisani test: ' + tocalculate)
                                                                    console.log(final)                                                                  
                                                                    element.status = "NIJE ODOBREN"
                                                                    element.rezultat = []
                                                                    element.rezultat.push({
                                                                      anaassay: testap._id,
                                                                      // rezultat_f:eval(final).toFixed(2),
                                                                      rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'Olympus AU400'),
                                                                      jedinice_f: element.labassay.jedinica,
                                                                      vrijeme_prijenosa: Date.now(),
                                                                      vrijeme_rezultata: Date.now(),
                                                                      odobren: false,
                                                                    })
                                                                    uzorak.tests.forEach(elementup => {
                                                                      if (elementup.labassay.equals(element.labassay._id)) {
                                                                        elementup.status_t = "REALIZOVAN"
                                                                      }
                                                                    })
                                                                    uzorak.save()
                                                                    novi.save()
                                                                    console.log('Izvršeno.')
                                                                  }
                                                                })
  
                                                              }
                                                            }
                                                          }
                                                        })
                                                      })
                                                      match = false
                                                    }
                                                  }
                                                });
                                                if (komplet) {
                                                  io.emit('kompletiran', novi.id, uzorak.site, sekc)
                                                }
                                              }
                                            })
                                          }
                                        }
                                      });
                                    }
                                  });
                                }
                              })
                            }
                          }
                        })
                        // for 
                      })
                      }
                    }
                  }
                })
              
          
            break;
          default:
            console.log("Nepoznat Type of Frame!");
        }
      });
    },
  
    parsaj_query: function (record, callback) {
  
      var mongoose = require("mongoose");
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");

  
      var record_type = '';
      var json = {};
      var testovi = [];
      var recordret = [];
      var dilution = ''
      console.log('Ulazak u AU 400.js ');
      console.log(record);
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            json.sn = sender[2];
            json.vrijeme_prijenosa = Date.now();
            break;

          case 'R':
            console.log("Query: ");
            var niz = element.split(' ')
            console.log('dobijeni niz')
            console.log(niz)
            console.log('duzina niza')
            console.log(niz.length)
            json.sid = niz[niz.length-1];
            json.rackicup_no = niz[1];
            json.sample_no = niz[2];
            console.log('SID:'+json.sid)

              var testovi = [];
              Samples.findOne({ id: json.sid }).populate('tests.labassay').exec(function (err, uzorak) {
                if (err) {
                  console.log("Greška:", err);
                }
                else {
                  if (uzorak === null) {
                    console.log("U LIS-u ne postoji uzorak sa brojem: " + json.sid);
                    // var terminator = 'SE';
                    // recordret.push(terminator);
                    // callback(recordret);
                  } else {
                    var tests = '';
                    var counter = 0;
  
                    AnaAssays.find({}).populate('aparat test').lean().exec(function (err, anaassays) {
                      uzorak.tests.forEach(function (test) {
                        anaassays.forEach(function (anaassay) {
                          if ((anaassay.aparat.sn === json.sn) && (anaassay.test.sifra === test.labassay.sifra) && (anaassay.test.calculated)) {
                            test.status_t = "U OBRADI"
                          }
                          if (((anaassay.aparat.sn === json.sn) && (anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true) && (!anaassay.test.manual) && (!anaassay.test.calculated)) || ((anaassay.aparat.sn === json.sn) && (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN") && (!anaassay.test.manual) && (!anaassay.test.calculated))) {
                            testovi.push(anaassay.kod)
  
                            test.status_t = "U OBRADI"
                          }
                        })
                      })
                      testovi.forEach(element => {
                        tests += element 
                      });
                      Results.findOne({ 'id': uzorak.id }).populate('rezultati.labassay').exec(function (err, rezultat) {
  
                        if (testovi.length < 1) {
                          console.log("Za uzorak :" + json.sid + " ne postoji niti jedan rerun zahtjev!");
                        //   var terminator = 'SE';
                        //   recordret.push(terminator);
                        //   callback(recordret);
                        } else {
                          rezultat.status = "U OBRADI"
                          uzorak.status = "U OBRADI"
                          rezultat.save(function (err) {
                            if (err) {
                              console.log("Greška:", err);
  
                            } else {
  
                            }
                          });
                          uzorak.save()
                          console.log("Kreiram Record: ");

                               // D 000101 E001            2 BEHART    E85
                               // D 000503 0009        271055001004    E83
                               // R 000501 0034          S012P81028
                          var order = 'S ' + json.rackicup_no + ' ' +json.sample_no+'          '+json.sid+'    E' + tests; 
                          console.log(order)   
                          recordret.push(order); 
                          callback(recordret);
                        }
  
                      })
                    })
                  } // else if uzorak null
  
                }
              });
            
            break;
          default:
  
            console.log("Nepoznat Type of Frame!");
  
        }
      });
    },
  
  };
  