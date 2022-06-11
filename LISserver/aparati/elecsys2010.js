module.exports = {

    parsaj_rezultat: function (record, io, serijski) {
  
      var mongoose = require("mongoose");
  
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
  
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
  
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");
  
  
  
      var calculated = require("../../funkcije/calculated/calculated");
      var reference = require("../../funkcije/shared/set_references")
      var starost = require("../../funkcije/shared/starostReferentne")
  
  
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
      var imeip  =''
      var rezultati = []
      var spol = '';
      var jmbg = '';
      var tpsa = "";
      var fe = "";
  console.log('PARSAJ REZULTAT LIASON')
      // var tmp  = []
      // tmp = record
      // record = []
      // record.push(tmp[0])
      // record.push(tmp[1])
      // record.push(tmp[2])
      // record.push(tmp[3])
      // record.push(tmp[4])
      // record.push(tmp[5])
      // record.push(tmp[6])
      // record.push(tmp[7])
      // record.push(tmp[8])
      // record.push('L|1|N')
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            //console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            sn = header[9];
            vrijeme_prijenosa = header[13];
            //console.log("Vrijeme prenosa: " + vrijeme_prijenosa);
            break;
          case 'P':
            //console.log("Patient: ");
            var patient = element.split("|");
            gender = patient[8];
            imeip = patient[5];
            //console.log("Patient: " + imeip);
            break;
          case 'O':
            //console.log("Order: ");
            var order = element.split("|");
            sid = order[2];
            
            console.log("SID: " + sid);
            break;
          case 'R':
            console.log("Rezultat: ");
            //R|1|^^^FSH|6.67|mIU/mL||N||F||||20190304092044|Liaison
            var result = element.split("|");
            var chunks = result[2].split("^");
            type_of_r = chunks[10];
           
            //
            rezultati.push({
            sid:sid,
            sifra_p:chunks[3],
            rezultat_f:result[3],
            jedinica_f:result[4],
            vrijeme_prijenosa:vrijeme_prijenosa,
            vrijeme_rezultata:result[12],
            })
            //
  
            break;
          case 'C':
            console.log("Komentar: ");
            break;
          case 'L':
            console.log("Terminator: ");
            rezultati.forEach(object => {
              Samples.findOne({
                id: object.sid
              }).populate('patient tests.labassay').exec(function (err, uzorak) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  if (uzorak === null) {
                    console.log('U LIS-u ne postoji definisan order za uzorak broj: ' + object.sid);
                  } else {
                    var sekc = uzorak.tests[0].labassay.sekcija
                    console.log("Uzorak pronađen");
                    sifra_p = object.sifra_p
                    if (uzorak.status != "OBRAĐEN") {
                      AnaAssays.findOne({
                        kod: sifra_p,
                        aparat: mongoose.Types.ObjectId(serijski)
                      }).populate('test').lean().exec(function (err, test) {
                        if (err) {
                          console.log("Greška:", err);
                        } else {
                          // console.log(test)
                          if (test === null) {
                            console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + ' ni na jednom aparatu: ' + sn);
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
                                rezultat.vrijeme_prijenosa = object.vrijeme_prijenosa
                                rezultat.vrijeme_rezultata = object.vrijeme_rezultata
                                rezultat.dilucija = 'dilucija'
                                rezultat.module_sn = sn
                                rezultat.reagens_lot ='reagens_lot'
                                rezultat.reagens_sn = 'reagens_sn'
                                rezultat.rezultat_f = object.rezultat_f
                                rezultat.jedinice_f = object.jedinice_f
                                rezultat.rezultat_p = 'rezultat_p'
                                rezultat.jedinice_p = 'jedinice_p'
                                rezultat.rezultat_i = 'rezultat_i'
                                rezultat.odobren = false
                                var json = {};
                                json.labassay = test.test
                                json.rezultat = []
                                json.rezultat.push(rezultat)
                                Results.findOne({
                                  id: uzorak.id
                                }).populate('rezultati rezultati.labassay patient').exec(function (err, result) {
                                  if (err) {
                                    console.log("Greška:", err)
                                  } else {
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
    //******************************************************** */
        let set = {}
        var age = starost.get(result.patient.jmbg)
        test.reference = test.reference.sort(function (a, b) {
          return a.dDob.localeCompare(b.dDob, undefined, {
            numeric: true,
            sensitivity: 'base'
          })
        })
        test.reference.forEach(ref => {
          set = reference.get(
            test.test.naziv, 
            "", 
            ref.grupa, 
            ref.spol,
            result.patient.spol,
            ref.refd, 
            ref.refg, 
            ref.interp,
            ref.extend,
            "", 
            "",
            "",
            "", 
            "", 
            age, 
            ref.dDob,
            ref.gDob,
            result.patient.jmbg                           
          )
  
          if (set.hasOwnProperty('grupa')) {
            element.interp = set.interp
            element.extend = set.extend
            element.refd = set.refd
            element.refg  = set.refg
          }
        })
    //******************************************************** */
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
                                          console.log(':: Dosao test sa LIAISON: ' + elementu.labassay.naziv)
    
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
                                                            })
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
    
                                                              AnaAssays.findOne({
                                                                test: element.labassay._id
                                                              }).populate('aparat test').exec(function (err, testap) {
                                                                if (err) {
                                                                  console.log("Greška:", err);
                                                                } else {
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
                                                                    rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'LIAISON'),
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
                    }
                  }
                }
              }) 
            });
  
            break;
          default:
            console.log("Nepoznat Type of Frame!");
        }
      });
    },
  
    parsaj_query: function (record,aparat, callback) {
  
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
      var allrecordret = [];
      var dilution = ''
      var ime = '' + '^' + ''
      var brojac = 0;
      var sidovi = []
      console.log('Funkcija: ');
      console.log(record);
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            recordret.push('H|\\^&|Liaison||Stup||||||||1|');
            //H|\^&|||Host|||||Liaison||P||20040528173336
            json.sn = header[9];
            json.vrijeme_prijenosa = header[13];
           
            break;
          case 'Q':
  
            console.log("Query: ");
            var query_arr = element.split("|");
            json.sequence = query_arr[1];
            json.sid = query_arr[2];
            console.log(json.sid)
  
            sidovi.push(json.sid)
  
  
  
            //--------------------rtrr
            break;
          case 'L':
            console.log("Terminator: ");
            console.log('testirani sidovi:')
            console.log(sidovi)
            sidovi.forEach(sid => {
              var counter = 0;
  
              Samples.findOne({
                id: sid
              }).populate('patient tests.labassay').exec(function (err, uzorak) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  if (uzorak === null) {
                    console.log("U LIS-u ne postoji uzorak sa brojem: " + sid);
                    // var header = 'H|\\^&||||||||||P|1';
                    // recordret.push(header);
                    // var query = 'Q|1|ALL||ALL||||||||O'
                    // //Q|1|ALL||ALL||||||||O
                    // recordret.push(query);
                    // var terminator = 'L|1';
                    // recordret.push(terminator);
                    callback([]);
                  } else {
  
                    AnaAssays.find({aparat:mongoose.Types.ObjectId(aparat)}).populate('aparat test').lean().exec(function (err, anaassays) {
                      var testovi = [];
                     
                      uzorak.tests.forEach(function (test) {
                        anaassays.forEach(function (anaassay) {
                          if ((anaassay.test.sifra === test.labassay.sifra) ) {
                            testovi.push(anaassay.kod)
                            test.status_t = "U OBRADI"
                          }
                          if (((anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true)) || ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "U OBRADI"))) {
                            //testovi.push(anaassay.kod)
                            //test.status_t = "U OBRADI"
                          }
                        })
                      })
                      var tests = '';
                      testovi.forEach(element => {
                        if(element ===""){}
                        counter++;
                        if (counter < testovi.length) {
                          dilution = ''
                          tests += '^^^' + element + '\\';
                        } else {
                          dilution = ''
                          tests += '^^^' + element;
                        }
                      });
                      //+++++++++++
                      if (testovi.length < 1) {
                        // console.log("Za uzorak :" + sid + " ne postoji niti jedan rerun zahtjev!");
  
                        // var query = 'Q|1|^' + sid + '||^^^ALL||||||||X'
                        // recordret.push(query);
                        // var terminator = 'L|1';
                        // recordret.push(terminator);
                        // callback(recordret);
                      } else {
                        uzorak.status = "U OBRADI"
                        uzorak.save()
                        console.log("Kreiram Record: ");
  
                        var prezime = uzorak.patient.prezime
                        var rime = uzorak.patient.ime
                        if (prezime.length > 20) {
                          prezime = uzorak.patient.prezime.substring(0, 19)
                        }
                        if (rime.length > 20) {
                          rime = uzorak.patient.ime.substring(0, 19)
                        }
                        ime = prezime + '_' + rime + '^'
                        ime = ime.replace(/Ć/g, 'C')
                        ime = ime.replace(/Č/g, 'C')
                        ime = ime.replace(/Š/g, 'S')
                        ime = ime.replace(/Đ/g, 'D')
                        ime = ime.replace(/Ž/g, 'Z')
                        ime = ime.replace(/č/g, 'c')
                        ime = ime.replace(/ć/g, 'c')
                        ime = ime.replace(/š/g, 's')
                        ime = ime.replace(/đ/g, 'd')
                        ime = ime.replace(/ž/g, 'z')
                        var patient = 'P|1|' + '2' + '||' + uzorak.patient.jmbg + '|' + ime + '|||';
                        recordret.push(patient);
                        var order = 'O|1|' + sid + '||' + tests + '|N||||||||||S||||||||||O|';
                        var niztest = []
  
                        if (order.length > 240) {
                          niztest = tests.split("^^^")
                          niztest.splice(0, 1);
                          order = ""
                          tests = ""
                          var testtemp = ""
                          var j = 1
                          niztest.forEach(test => {
  
                            console.log("Test: " + test)
                            testtemp = tests + "^^^" + test
                            if (testtemp.length < 200) {
                              if (test.indexOf("\\") === -1) {
                                order = 'O|' + j + '|' + sid + '||' + tests + "^^^" + test + '|N||||||||||S||||||||||O|';
                                tests = "^^^" + test
                                recordret.push(order);
                                brojac++
                              } else {
  
                                tests = tests + "^^^" + test
  
                              }
  
                            } else {
                              order = 'O|' + j + '|' + sid + '||' + tests + '|N||||||||||S||||||||||O|';
                              tests = ""
                              tests = "^^^" + test
                              recordret.push(order);
                              brojac++
                              order = ""
                              if (j === 7) {
                                j = 0
                              } else {
                                j++
                              }
                            }
  
                          });
                          tests = ""
  
                        } else {
                          recordret.push(order);
                          brojac++
                          tests = ""
  
                        }
                        console.log(brojac)
                        console.log(sidovi.length)
                        console.log("recordret")
                        console.log(recordret)
                        
                        if (brojac === (sidovi.length)) {
                          var terminator = 'L|1|N';
                          recordret.push(terminator);
                          callback(recordret);
                        }
                      }
  
                    })
                  } // else if uzorak null
  
                }
              });
  
            });
  
            break;
          default:
  
            console.log("Nepoznat Type of Frame!");
  
        }
      });
    },
  
  };