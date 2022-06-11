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
  
      var spol = '';
      var jmbg = '';
      var tpsa = "";
      var fe = "";
  
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            sn = '503075';
            vrijeme_prijenosa = Date.now();
            //console.log("Vrijeme prenosa: " + vrijeme_prijenosa);
            break;
          case 'P':
            // console.log("Patient: ");
            // var patient = element.split("|");
            // gender = patient[8];
            // console.log("Gender: " + gender);
            break;
          case 'O':
            console.log("Order: ");
            var order = element.split("|");
            sid = order[2].trim(); // 'S001C90406'
            sid = sid.toUpperCase()
            console.log("SID: " + sid);
            break;
          case 'R':
            
            var result = element.split("|");
            var chunks = result[2].split("^");
            var sifra_p = chunks[3].split('/')[0]
            console.log("Kod: "+sifra_p);
            var type_of_r = chunks[10];
            var rezultat_f = parseFloat(result[3]);
            var rezultat_p = "";
            var dilucija = "";
            var reagens_lot = "";
            var reagens_sn = "";
            var rezultat_i = "";
            var jedinice_p = "";
            var jedinice_f = result[4];

            var vrijeme_rezultata = Date.now();
               
            var module_sn = "503075";

            console.log("Rezultat: "+rezultat_f + " " + jedinice_f);

  
            //break;
        //   case 'C':
        //     console.log("Komentar: ");
        //     break;
          //case 'L':
            //console.log("Terminator: ");

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
                        // console.log("-" + sifra_p + "-");
                        // console.log("-" + serijski + "-");
                        AnaAssays.findOne({ kod: sifra_p,aparat:mongoose.Types.ObjectId(serijski) })
                        .populate('test').lean()
                        .exec(function (err, test) {
                          if (err) {
                            console.log("Greška:", err);
                          }
                          else {
                            
                             
                            if (test === null) {
                              console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + '  na aparatu Access 2');
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
                                  rezultat.vrijeme_rezultata = vrijeme_rezultata
                                  rezultat.dilucija = dilucija
                                  rezultat.module_sn = module_sn
                                  rezultat.reagens_lot = reagens_lot
                                  rezultat.reagens_sn = reagens_sn
                                  rezultat.rezultat_f = rezultat_f
                                  rezultat.jedinice_f = jedinice_f
                                  rezultat.rezultat_p = rezultat_p
                                  rezultat.jedinice_p = jedinice_p
                                  rezultat.rezultat_i = rezultat_i
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

                                          // UPDATE REFERENCE*****************************
                                          //var reference = require("../../funkcije/shared/set_references")
                                         // var starost = require("../../funkcije/shared/starostReferentne")

                                          //************************************************** */
                                          let set = {}
                                          var age = starost.get(result.patient.jmbg)
                                          console.log('age: ' + age)
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
                                            console.log('update set: ' + test.kod)
                                            console.log(set)

                                            if (set.hasOwnProperty('grupa')) {
                                              element.interp = set.interp
                                              element.extend = set.extend
                                              element.refd = set.refd
                                              element.refg  = set.refg
                                            }
                                          })
                                          //************************************************** */
                                          
                                          
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
                                            console.log(':: Dosao test sa MODULAR E170: ' + elementu.labassay.naziv)
  
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
                                                                    if (clan.toString() === "5b26802f3f43090ff16de6bd") {
                                                                      tpsa = rez.rezultat[rez.rezultat.length - 1].rezultat_f
                                                                    } // t-PSA, Čarovac Lab, $store.state.site: 5b6caf696a0f4166f4da989b
                                                                    if (clan.toString() === "5b2649d6bdd64e0d0749e483") {
                                                                      fe = rez.rezultat[rez.rezultat.length - 1].rezultat_f
                                                                    } // Željezo, Čarovac Lab, $store.state.site: 5b6caf696a0f4166f4da989b
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
                                                                      rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'ARCHITECT'),
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
      var defsTests = require("../data/assays");

  
      var defsTests = require("../data/assays");
      var definisaniTestovi = defsTests.c_e170
      var record_type = '';
      var json = {};
      var testovi = [];
      var recordret = [];
      var dilution = ''
      var ime = ''+'^'+''
      console.log('Funkcija: ');
      console.log(record);
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            json.sn = sender[1];
            json.vrijeme_prijenosa = Date.now();
            break;
          case 'P':

            break;
          case 'Q':
  
            console.log("Query: ");
            var query_arr = element.split("|");
            json.sequence = query_arr[2];
            var niz = query_arr[2].split("^");
            json.sid = niz[1]
            console.log(json.sid);
            break;
          case 'L':
            console.log("Terminator: ");
              var testovi = [];
              Samples.findOne({ id: json.sid }).populate('tests.labassay').exec(function (err, uzorak) {
                if (err) {
                  console.log("Greška:", err);
                }
                else {
                  if (uzorak === null) {
                    console.log("U LIS-u ne postoji uzorak sa brojem: " + json.sid);
                    // var header = 'H|\\^&||||||||||P|1';
                    // recordret.push(header);
                    // var query = 'O|1|'+ json.sid +'||'  +  '^^^'         +'|R||||||N||||||||||||||F'
                    
                    // recordret.push(query);
                    // var terminator = 'L|1';
                    // recordret.push(terminator);
                    // callback(recordret);
                  } else {
                    var tests = '';
                    var counter = 0;
                    var uzoraklength = uzorak.tests.length;
                    var serijski = '5f0b71a96cf682961981a73e'
                    AnaAssays.find({aparat:mongoose.Types.ObjectId(serijski)}).populate('aparat test').lean().exec(function (err, anaassays) {
                      uzorak.tests.forEach(function (test) {
                        anaassays.forEach(function (anaassay) {
                          if ((anaassay.aparat.sn === json.sn) && (anaassay.test.sifra === test.labassay.sifra) && (anaassay.test.calculated)) {
                            test.status_t = "U OBRADI"
                          }
                          if (((anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true)) || ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN") )|| ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "U OBRADI") )) {
                            testovi.push(anaassay.kod)
                            test.status_t = "U OBRADI"
                          }
                        })
                      })
                      testovi.forEach(element => {
                        counter++;
                        if (counter < testovi.length) {
                          if (element === '1048') { dilution = '' } else { dilution = '' }
                          
                          tests += '^^^' + element + '^'  + dilution + '\\';
                          
                        } else {
                          if (element === '1048') { dilution = '' } else { dilution = '' }
                         
                          tests += '^^^' + element + '^'  + dilution;
                          
                        }
                      });
                      Results.findOne({ 'id': uzorak.id }).populate('patient rezultati.labassay').exec(function (err, rezultat) {
  
                        if (testovi.length < 1) {
                          console.log("Za uzorak :" + json.sid + " ne postoji niti jedan rerun zahtjev!");
                          var header = 'H|\\^&||||||||||P|1';
                          recordret.push(header);
                          var query = 'O|1|'+ json.sid +'||'  +  '^^^'         +'|R||||||N||||||||||||||F'
                          recordret.push(query);
                          var terminator = 'L|1';
                          recordret.push(terminator);
                          callback(recordret);
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
                            // H|\^&|||LIS|||||||P|1|20001010080000<CR>
                            // P|1|0987656789|||Smith^Tom^A^Jr.^Mr.||19631124|M|||||Jones
                            // O|1|Samp45||^^^TSH|R||||||A||||Serum<CR>
                            // L|1|F<CR>
                            function getFormattedDate() {
                                var date = new Date();
                            
                                var month = date.getMonth() + 1;
                                var day = date.getDate();
                                var hour = date.getHours();
                                var min = date.getMinutes();
                                var sec = date.getSeconds();
                            
                                month = (month < 10 ? "0" : "") + month;
                                day = (day < 10 ? "0" : "") + day;
                                hour = (hour < 10 ? "0" : "") + hour;
                                min = (min < 10 ? "0" : "") + min;
                                sec = (sec < 10 ? "0" : "") + sec;
                            
                                var str = date.getFullYear()+ month  + day +  hour  + min  + sec;
                            
                                /*alert(str);*/
                            
                                return str;
                            }
                          var header = 'H|\\^&|||atom|||||||P|1|'+getFormattedDate()
                          
                          recordret.push(header);
                          var prezime = rezultat.patient.prezime
                          var rime = rezultat.patient.ime
                          if(prezime.length > 20){
                            prezime = rezultat.patient.prezime.substring(0,19)
                          }
                          if(rime.length > 20){
                            rime = rezultat.patient.ime.substring(0,19)
                          }
                          ime = prezime+'-'+rime
                          ime = ime.replace(/Ć/g,'C')
                          ime = ime.replace(/Č/g,'C')
                          ime = ime.replace(/Š/g,'S')
                          ime = ime.replace(/Đ/g,'D')
                          ime = ime.replace(/Ž/g,'Z')
                          ime = ime.replace(/č/g,'c')
                          ime = ime.replace(/ć/g,'c')
                          ime = ime.replace(/š/g,'s')
                          ime = ime.replace(/đ/g,'d')
                          ime = ime.replace(/ž/g,'z')
                          var spol = rezultat.patient.spol

                          if(spol === "ŽENSKI"){
                            spol = "F"
                          }else{
                            spol = "M"
                          }
                          var patient = 'P|1|'+ime+'|||'+rezultat.patient.jmbg+'||19631124|'+spol+'|'
                          recordret.push(patient);
                          var order = 'O|1|'+json.sid+'||'+tests+'|R||||||A||||Serum';
                          //           // O|1|Samp45||^^^TSH|R||||||A||||Serum<CR>
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
                                  order = 'O|' + j + '|' + '            '+json.sid + '||' + tests + "^^^" + test + '|||||||N||||||||||||||Q';
                                  tests = "^^^" + test
                                  recordret.push(order);
                                } else {
  
                                  tests = tests + "^^^" + test

                                 
  
                                }
  
                              } else {
                                order = 'O|' + j + '|' + '           '+json.sid + '||' + tests + '|||||||N||||||||||||||Q';
                                tests = ""
                                tests = "^^^" + test
                                
                                recordret.push(order);
                                order = ""
                                if (j === 7) { j = 0 } else {
                                  j++
                                }
                              }

                              console.log(":::::::::::::::::::::::::::::::::::")
                              console.log(sid)
                              console.log(tests)
  
                            });
                          } else {
                            recordret.push(order);
                          }
                          var terminator = 'L|1|N';
                          recordret.push(terminator);
                          console.log(recordret)
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
  