module.exports = {

  parsaj_rezultat: function (record, io,serijski) {

    var mongoose = require("mongoose");

    var Samples = require("../../models/Postavke");
    var Samples = mongoose.model("Samples");

    var AnaAssays = require("../../models/Postavke");
    var AnaAssays = mongoose.model("AnaAssays");

    var Results = require("../../models/Postavke");
    var Results = mongoose.model("Results");

    var ControlSamples = require("../../models/Postavke");
    var ControlSamples = mongoose.model("ControlSamples");

    var Kontrole = require("../../models/Postavke");
    var Kontrole = mongoose.model("Kontrole");

    var calculated = require("../../funkcije/calculated/calculated");
    var starost = require("../../funkcije/shared/starostReferentne")
    var reference = require("../../funkcije/shared/set_references")

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
          sn = sender[2];
          vrijeme_prijenosa = header[13];
          console.log("Vrijeme prenosa: " + vrijeme_prijenosa);
          break;
        case 'P':
          console.log("Patient: ");
          var patient = element.split("|");
          gender = patient[8];
          console.log("Gender: " + gender);
          break;
        case 'O':
          console.log("Order: ");
          var order = element.split("|");
          sid = order[2];
          if (order[11] === 'Q') {
            qc = true
            console.log('Kontrolni uzorak: ')
          }
          console.log("SID: " + sid);
          break;
        case 'R':
          console.log("Rezultat: ");
          var result = element.split("|");
          var chunks = result[2].split("^");
          type_of_r = chunks[10];
          switch (type_of_r) {
            case 'F':
              console.log("Type: " + type_of_r);
              sifra_p = chunks[3];
              dilucija = chunks[5];
              reagens_lot = chunks[7];
              reagens_sn = chunks[8];
              if (!isNaN(result[3])) {
                rezultat_f = parseFloat(result[3]); //.toFixed(2);
              } else {
                rezultat_f = result[3]
              }
              jedinice_f = result[4];
              vrijeme_rezultata = result[12];
              module_sn = result[13];
              console.log("sifra: " + sifra_p);
              console.log("dilucija: " + dilucija);
              console.log("reagens_lot: " + reagens_lot);
              console.log("reagens_sn: " + reagens_sn);
              console.log("rezultat_f: " + rezultat_f);
              console.log("jedinice_f: " + jedinice_f);
              console.log("vrijeme: " + vrijeme_rezultata);
              console.log("module_sn: " + module_sn);
              break;
            case 'P':
              console.log("Type: " + type_of_r);
              var rezultat_p = result[3];
              var jedinice_p = result[4];
              console.log("rezultat_p: " + rezultat_p);
              break;
            case 'I':
              console.log("Type: " + type_of_r);
              var rezultat_i = result[3];
              console.log("rezultat_i: " + rezultat_i);
              break;
            default:
              console.log("Nepozanat tip rezultata!");
          }

          break;
        case 'C':
          console.log("Komentar: ");
          break;
        case 'L':
          console.log("Terminator: ");
          if (qc) {

            Kontrole.find({}).populate('aparat reference.anaassay').exec(function (err, kontrola) {
              if (err) {
                console.log("Greška:", err);
              }
              else {
                if (kontrola.length) {
                  console.log('Checkpoint 1, on line 131: ')

                  kontrola.forEach(element => {

                    if (element.aparat.sn === sn && element.tip === 'POJEDINAČNA') {
                      console.log('Checkpoint 2, on line 136: ')
                      element.reference.forEach(clan => {
                        // console.log(clan)
                        if (clan.anaassay.kod === sifra_p) {
                          AnaAssays.findOne({ kod: sifra_p }).populate('test').lean().exec(function (err, test) {
                            if (err) {
                              console.log("Greška:", err);
                            }
                            else {
                              // console.log(test)
                              if (test) {
                                controlSample = {}
                                controlSample.id = sid
                                controlSample.aparat = element.aparat._id
                                controlSample.kontrola = element._id
                                controlSample.status = 'REALIZOVAN'
                                controlSample.tests = [{
                                  labassay: test.test._id,
                                  anaassay: test._id,
                                  status: 'REALIZOVAN',
                                  rezultat: [{
                                    sn: sn,
                                    vrijeme_prijenosa: vrijeme_prijenosa,
                                    vrijeme_rezultata: vrijeme_rezultata,
                                    dilucija: dilucija,
                                    module_sn: module_sn,
                                    reagens_lot: reagens_lot,
                                    reagens_sn: reagens_sn,
                                    rezultat_f: rezultat_f,
                                    jedinice_f: jedinice_f,
                                    rezultat_p: rezultat_p,
                                    jedinice_p: jedinice_p,
                                    rezultat_i: rezultat_i
                                  }]
                                }]
                                var sample = new ControlSamples(controlSample);
                                sample.save(function (err, sample) {
                                  if (err) {
                                    console.log("Greška:", err);
                                  } else {
                                    console.log("Kontrolni Uzorak uspješno sačuvan!");
                                  }
                                });
                              }
                            }
                          })
                        }
                      })
                    }
                  })
                } else {
                  console.log('Nema definisanih kontrola!')
                }
              }
            })
          } else {
            if (isNaN(sid.charAt(2))) {
              console.log('Najvjerovatnije naš Control Sample!')
              ControlSamples.findOne({ id: sid }).populate('aparat kontrola tests.labassay tests.anaassay').exec(function (err, uzorak) {
                if (err) {
                  console.log("Greška:", err);
                }
                else {
                  if (uzorak) {
                    console.log('Parsanje kontrole...')
                    var rezultat = {}

                    uzorak.tests.forEach(element => {
                      if (element.anaassay.kod === sifra_p) {
                        if (uzorak.kontrola.tip === "POJEDINAČNA") {
                          uzorak.status = "REALIZOVAN"
                        }
                        if (uzorak.kontrola.tip === "MULTI") {
                          uzorak.status = "REALIZOVAN"
                        }
                        element.status = "REALIZOVAN"
                        rezultat = {
                          sn: sn,
                          vrijeme_prijenosa: vrijeme_prijenosa,
                          vrijeme_rezultata: vrijeme_rezultata,
                          dilucija: dilucija,
                          module_sn: module_sn,
                          reagens_lot: reagens_lot,
                          reagens_sn: reagens_sn,
                          rezultat_f: rezultat_f,
                          jedinice_f: jedinice_f,
                          rezultat_p: rezultat_p,
                          jedinice_p: jedinice_p,
                          rezultat_i: rezultat_i
                        }
                        element.rezultat.push(rezultat)

                      }
                    })
                    uzorak.save()
                    console.log('Kontrola sačuvana.')
                  } else {

                    console.log("U LIS-u ne postoji uzorak sa brojem: " + sid);

                  }
                }
              })
            } else {
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
                      console.log('?????????????')
                      console.log(sifra_p)
                      console.log(serijski)
                      AnaAssays.findOne({ kod: sifra_p,aparat:mongoose.Types.ObjectId(serijski) }).populate('test').lean().exec(function (err, test) {
                        if (err) {
                          console.log("Greška:", err);
                        }
                        else {
                           console.log('test1')
                          if (test === null) {
                            console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + ' ni na jednom aparatu' + sn);
                          } else {
                            uzorak.tests.forEach(elementu => {
                              console.log('test2')
                              console.log(elementu.status_t)
                              console.log(test.test.sifra.trim())
                              console.log(elementu.labassay.sifra.trim())
                              if (((elementu.labassay.sifra.trim() === test.test.sifra.trim()) && elementu.status_t === "ZAPRIMLJEN") ||((elementu.labassay.sifra.trim() === test.test.sifra.trim()) && elementu.status_t === "U OBRADI") || ((elementu.labassay.sifra.trim() === test.test.sifra.trim()) && elementu.status_r)) {
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
                                          console.log(':: Dosao test sa ARCHITECT: ' + elementu.labassay.naziv)

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
            }
          } // if not QC
          break;
        default:
          console.log("Nepoznat Type of Frame!");
      }
    });
  },

  parsaj_query: function (record,serijski, callback) {

    var mongoose = require("mongoose");
    var Samples = require("../../models/Postavke");
    var Samples = mongoose.model("Samples");
    var AnaAssays = require("../../models/Postavke");
    var AnaAssays = mongoose.model("AnaAssays");
    var Results = require("../../models/Postavke");
    var Results = mongoose.model("Results");
    var ControlSamples = require("../../models/Postavke");
    var ControlSamples = mongoose.model("ControlSamples");

    var Kontrole = require("../../models/Postavke");
    var Kontrole = mongoose.model("Kontrole");

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
          json.sn = sender[2];
          json.vrijeme_prijenosa = header[13];
          break;
        case 'Q':

          console.log("Query: ");
          var query_arr = element.split("|");
          json.sequence = query_arr[1];
          var patient_arr = query_arr[2].split("^");
          json.pid = patient_arr[0];
          json.sid = patient_arr[1];
          json.endrange = query_arr[3]
          var test_arr = query_arr[4].split("^");
          json.test_id = test_arr[3];
          json.request_type = query_arr[12];
          console.log(json.sid);
          break;
        case 'L':
          console.log("Terminator: ");
          if (json.sid.charAt(2) === '-') {
            console.log('Najvjerovatnije naš Sample!')
            ControlSamples.findOne({ id: json.sid }).populate('tests.labassay tests.anaassay').exec(function (err, uzorak) {
              if (err) {
                console.log("Greška:", err);
              }
              else {
                if (uzorak) {
                  var tests = []
                  var counter = 0
                  uzorak.tests.forEach(element => {
                    counter++;
                    element.status = "U OBRADI"
                    if (counter < uzorak.tests.length) {
                      tests += '^^^' + element.anaassay.kod + '^^' + 'STANDARD^P\\';
                    } else {
                      tests += '^^^' + element.anaassay.kod + '^^' + 'STANDARD^P';
                    }
                  });
                  console.log("Kreiram kontrolni Order Record!");
                  var header = 'H|\\^&||||||||||P|1';
                  recordret.push(header);
                  var patient = 'P|1|' + '2' + '||||||';
                  recordret.push(patient);
                  var order = 'O|1|' + json.sid + '||' + tests + '|||||||N||||||||||||||Q';
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
                          order = 'O|' + j + '|' + json.sid + '||' + tests + "^^^" + test + '|||||||N||||||||||||||Q';
                          tests = "^^^" + test
                          recordret.push(order);
                        } else {

                          tests = tests + "^^^" + test

                        }

                      } else {
                        order = 'O|' + j + '|' + json.sid + '||' + tests + '|||||||N||||||||||||||Q';
                        tests = ""
                        tests = "^^^" + test
                        recordret.push(order);
                        order = ""
                        j++
                      }

                    });
                  } else {
                    recordret.push(order);
                  }
                  var terminator = 'L|1';
                  recordret.push(terminator);
                  uzorak.status = "U OBRADI"
                  uzorak.save()
                  callback(recordret);
                } else {

                  console.log("U LIS-u ne postoji uzorak sa brojem: " + json.sid);
                  var header = 'H|\\^&||||||||||P|1';
                  recordret.push(header);
                  var query = 'Q|1|^' + json.sid + '||^^^ALL||||||||X'
                  recordret.push(query);
                  var terminator = 'L|1';
                  recordret.push(terminator);
                  callback(recordret);
                }
              }
            })
          } else {
            var testovi = [];
            Samples.findOne({ id: json.sid }).populate('tests.labassay').exec(function (err, uzorak) {
              if (err) {
                console.log("Greška:", err);
              }
              else {
                if (uzorak === null) {
                  console.log("U LIS-u ne postoji uzorak sa brojem: " + json.sid);
                  var header = 'H|\\^&||||||||||P|1';
                  recordret.push(header);
                  var query = 'Q|1|^' + json.sid + '||^^^ALL||||||||X'
                  recordret.push(query);
                  var terminator = 'L|1';
                  recordret.push(terminator);
                  callback(recordret);
                } else {
                  var tests = '';
                  var counter = 0;
                  var uzoraklength = uzorak.tests.length;
                  //var serijski='5f5a91f17e0ee10a97c34f49'
                  AnaAssays.find({ aparat: mongoose.Types.ObjectId(serijski)}).populate('aparat test').lean().exec(function (err, anaassays) {
                    uzorak.tests.forEach(function (test) {
                      anaassays.forEach(function (anaassay) {
                        if ((anaassay.test.sifra === test.labassay.sifra) && (anaassay.test.calculated)) {
                          test.status_t = "U OBRADI"
                        }
                        if (( (anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true) ) || ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN"))|| ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "U OBRADI"))) {
                          testovi.push(anaassay.kod)

                          test.status_t = "U OBRADI"
                        }
                      })
                    })
                    testovi.forEach(element => {
                      counter++;
                      if (counter < testovi.length) {
                        if (element === '1048') { dilution = 'STD (1:3)' } else { dilution = 'STANDARD' }
                        if (element === '256' ||element === '385' || element === '386' || element === '270' || element === '133' || element === '432' ||element === '110' || element === '621' || element === '241' || element === '221' || element === '651' || element === '371' || element === '381' || element === '601' || element === '580' || element === '281' || element === '201' || element === '523' || element === '771' || element === '161' || element === '620' || element === '131' || element === '187' || element === '851' || element === '591' || element === '191' || element === '585' || element === '628' || element === '30' || element === '107' || element === '561' || element === '121' || element === '321' || element === '896' || element === '81' || element === '901' || element === '639' || element === '641' || element === '713' || element === '3' || element === '859') { dilution = 'UNDILUTED' }
                        if (element === '211' || element === '341' || element === '61' || element === '41') { dilution = 'SAMP/CNTRL' }
                        if (element === '1036') { dilution = 'STD(1:20)' }
                        if (element === '1096') { dilution = '1:20' }
                        if (element === '234' || element === '235') { dilution = '1:3' }
                        if (element === '1105') { dilution = '' }
                        if (element === '1106') { dilution = 'Std_WB' }
                        tests += '^^^' + element + '^' + '^' + dilution + '^P\\';
                      } else {
                        if (element === '1048') { dilution = 'STD (1:3)' } else { dilution = 'STANDARD' }
                        if (element === '256' ||element === '385' || element === '386' || element === '270' || element === '133' || element === '432' || element === '110' || element === '621' || element === '241' || element === '221' || element === '651' || element === '371' || element === '381' || element === '601' || element === '580' || element === '281' || element === '201' || element === '523' || element === '771' || element === '161' || element === '620' || element === '131' || element === '187' || element === '851' || element === '591' || element === '191' || element === '585' || element === '628' || element === '30' || element === '107' || element === '561' || element === '121' || element === '321' || element === '896' || element === '81' || element === '901' || element === '639' || element === '641' || element === '713' || element === '3' || element === '859') { dilution = 'UNDILUTED' }
                        if (element === '211' || element === '341' || element === '61' || element === '41') { dilution = 'SAMP/CNTRL' }
                        if (element === '1036') { dilution = 'STD(1:20)' }
                        if (element === '1096') { dilution = '1:20' }
                        if (element === '234' || element === '235') { dilution = '1:3' }
                        if (element === '1105') { dilution = '' }
                        if (element === '1106') { dilution = 'Std_WB' }
                        tests += '^^^' + element + '^' + '^' + dilution + '^P';
                      }
                    });
                    Results.findOne({ 'id': uzorak.id }).populate('patient rezultati.labassay').exec(function (err, rezultat) {

                      if (testovi.length < 1) {
                        console.log("Za uzorak :" + json.sid + " ne postoji niti jedan rerun zahtjev!");
                        var header = 'H|\\^&||||||||||P|1';
                        recordret.push(header);
                        var query = 'Q|1|^' + json.sid + '||^^^ALL||||||||X'
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
                        var header = 'H|\\^&||||||||||P|1';
                        recordret.push(header);
                        var prezime = rezultat.patient.prezime
                        var rime = rezultat.patient.ime
                        if(prezime.length > 20){
                          prezime = rezultat.patient.prezime.substring(0,19)
                        }
                        if(rime.length > 20){
                          rime = rezultat.patient.ime.substring(0,19)
                        }
                        ime = prezime+'^'+rime+'^'
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
                        var patient = 'P|1|' + '2' + '||'+rezultat.patient.jmbg+'|'+ime+'|||';
                        recordret.push(patient);
                        var order = 'O|1|' + json.sid + '||' + tests + '|||||||N||||||||||||||Q';
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
                                order = 'O|' + j + '|' + json.sid + '||' + tests + "^^^" + test + '|||||||N||||||||||||||Q';
                                tests = "^^^" + test
                                recordret.push(order);
                              } else {

                                tests = tests + "^^^" + test

                              }

                            } else {
                              order = 'O|' + j + '|' + json.sid + '||' + tests + '|||||||N||||||||||||||Q';
                              tests = ""
                              tests = "^^^" + test
                              recordret.push(order);
                              order = ""
                              if (j === 7) { j = 0 } else {
                                j++
                              }
                            }

                          });
                        } else {
                          recordret.push(order);
                        }
                        var terminator = 'L|1';
                        recordret.push(terminator);

                        callback(recordret);
                      }

                    })
                  })
                } // else if uzorak null

              }
            });
          }
          break;
        default:

          console.log("Nepoznat Type of Frame!");

      }
    });
  },

};
