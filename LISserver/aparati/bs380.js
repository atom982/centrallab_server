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
        var rezultati = [] 
        var spol = '';
        var jmbg = '';
        var tpsa = "";
        var fe = "";
    
        record.forEach(function (element) {
          record_type = element.charAt(0);
          switch (record_type) {
            case 'H':
            //   console.log("Header: ");
              var header = element.split("|");
              sn = '834000357';
              vrijeme_prijenosa = new Date(header[13].substring(0,4), header[13].substring(4,6), header[13].substring(6,8), header[13].substring(8,10), header[13].substring(10,12), header[13].substring(12,14))
              console.log("Vrijeme prenosa: " + vrijeme_prijenosa);
              break;
            case 'P':
            //   console.log("Patient: ");
              var patient = element.split("|");
              gender = patient[8];
              console.log("Gender: " + gender);
              break;
            case 'O':
            //   console.log("Order: ");
              var order = element.split("|");
              sid = order[3];
              console.log("SID: " + sid);
              
              break;
            case 'R':
            //   console.log("Rezultat: ");
              var result = element.split("|");
              var chunks = result[2].split("^");
              type_of_r = result[8];
              switch (type_of_r) {
                case 'F':
                  console.log("Tip rezultata: " + type_of_r);
                  sifra_p = chunks[0];
                  dilucija = chunks[2];
                  reagens_lot = 'N/A';
                  reagens_sn = 'N/A';
                  if (!isNaN(result[3])) {
                    rezultat_f = parseFloat(result[3].split('^')[0]); //.toFixed(2);
                  } else {
                    rezultat_f = result[3].split('^')[0]
                  }
                  jedinice_f = result[4];
                  vrijeme_rezultata = new Date(result[12].substring(0,4), result[12].substring(4,6), result[12].substring(6,8), result[12].substring(8,10), result[12].substring(10,12), result[12].substring(12,14))
                  module_sn = result[13];
                  if(sifra_p.includes('')){

                  }
                  rezultati.push({
                      sid:sid,
                      sifra_p: sifra_p,
                      rezultat_f:rezultat_f,
                      jedinice_f :jedinice_f,
                      vrijeme_prijenosa: vrijeme_prijenosa,
                      vrijeme_rezultata: result[12],
                  })
                //   console.log("sifra: " + sifra_p);
                //   console.log("dilucija: " + dilucija);
                //   console.log("reagens_lot: " + reagens_lot);
                //   console.log("reagens_sn: " + reagens_sn);
                //   console.log("rezultat_f: " + rezultat_f);
                //   console.log("jedinice_f: " + jedinice_f);
                //   console.log("vrijeme: " + vrijeme_rezultata);
                //   console.log("module_sn: " + module_sn);
                  break;
                case 'C':
                //   console.log("Tip rezultata: " + type_of_r);
                  console.log("Ispravka prezhodno poslanog rezultata");
                  break;
                case 'X':
                //   console.log("Tip rezultata: " + type_of_r);
                  console.log("Narudzba-order ne može biti realizirana");
                  break;
                case 'N':
                //   console.log("Tip rezultata: " + type_of_r);
                //   console.log("this result record contains necessary information to run a new order. This value is the one used when the LIS transmits orders with previous results to the analyzer. ");        
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
              console.log(rezultati)
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

                      var dijabetes = false;
                      var anemija = false;
                      var markeri = false;
                      var reuma = false;

                      uzorak.tests.forEach(test => {

                        //console.log(JSON.stringify(test.labassay._id))
                        
                        switch (JSON.stringify(test.labassay._id).replace("\"", "").replace("\"", "")) {
                          case "60c0671ad23407138c2d954e": // Glukoza, GLU
                            //console.log(test.labassay.naziv)
                            break;
                          case "600e633ef6b7582f58be7ee3": // Glukoza, GLU (Dijabetes)
                            //console.log(test.labassay.naziv)
                            dijabetes = true;
                            break;
                          case "600c863c111f676a86bf9e51": // Željezo, Fe
                            
                            break;
                          case "600e688bf6b7582f58be7f55": // Željezo, Fe (Anemija)
                            anemija = true;
                            break;
                          case "600c8d69111f676a86bf9e8d": // CK, CK
                          
                            break;
                          case "600e829a8eff616e48505a71": // CK, CK (Markeri)
                            markeri = true;
                            break;
                          case "600c8da1111f676a86bf9e8e": // CRP, CRP
                            
                            break;
                          case "6011750277c8c13bc764aaab": // CRP, CRP (Reuma test)
                            reuma = true;      
                            break;
                        
                          default: // 
                            break;
                        }
                        
                      });

                      var sekc = uzorak.tests[0].labassay.sekcija
                      console.log("Uzorak pronađen");

                      // LabAssays

                      // "_id" : ObjectId("600c8b4a111f676a86bf9e71") - alfa Amilaza, serum
                      // "_id" : ObjectId("600c8b6f111f676a86bf9e72") - alfa Amilaza, urin
                      // "_id" : ObjectId("600c26b49a5f145843b930f8") - Mokraćna kiselina, serum
                      // "_id" : ObjectId("600c27a19a5f145843b930f9") - Mokraćna kiselina, urin

                      // AnaAssays

                      // "_id" : ObjectId("600c8bbd111f676a86bf9e82") - alfa Amilaza, serum
                      // "_id" : ObjectId("600c8bc6111f676a86bf9e87") - alfa Amilaza, urin
                      // "_id" : ObjectId("600c27ea9a5f145843b930fa") - Mokraćna kiselina, serum
                      // "_id" : ObjectId("600c27fb9a5f145843b930ff") - Mokraćna kiselina, urin
                      
                      // "_id" : ObjectId("60041a35f5e7ce7d39d4d8fc") - Glukoza, GLU
                      // "_id" : ObjectId("600e636df6b7582f58be7ee4") - Glukoza, GLU (Dijabetes)
                      // "_id" : ObjectId("600c878c111f676a86bf9e5a") - Željezo, Fe
                      // "_id" : ObjectId("600e68acf6b7582f58be7f56") - Željezo, Fe (Anemija)
                      // "_id" : ObjectId("600c8dc0111f676a86bf9e94") - CK, CK 
                      // "_id" : ObjectId("600e83cc8eff616e48505a7f") - CK, CK (Markeri)
                      // "_id" : ObjectId("600c8dcb111f676a86bf9e99") - CRP, CRP
                      // "_id" : ObjectId("6011751e77c8c13bc764aaac") - CRP, CRP (Reuma test)

                      sifra_p = object.sifra_p
                      var uslov = { kod: sifra_p  ,aparat: mongoose.Types.ObjectId(serijski)};
                      console.log(uzorak.id[0]);
                      switch (uzorak.id[0]) {
                       
                        case 'S':
                              if(sifra_p === '41'){
                                uslov = { 
                                  _id: mongoose.Types.ObjectId("600c8bbd111f676a86bf9e82"),
                                  aparat: mongoose.Types.ObjectId(serijski)
                                };                
                              }
                              if(sifra_p === '49'){
                                uslov = { 
                                  _id: mongoose.Types.ObjectId("600c27ea9a5f145843b930fa") 
                                };                
                              }
                              break;

                              case 'U':
                              if(sifra_p === '41'){
                                uslov = { 
                                  _id: mongoose.Types.ObjectId("600c8bc6111f676a86bf9e87") 
                                };                
                              }
                              if(sifra_p === '49'){
                                uslov = { 
                                  _id: mongoose.Types.ObjectId("600c27fb9a5f145843b930ff") 
                                };                
                              }
                              break;
                      
                        default:
                          uslov = { kod: sifra_p ,aparat: mongoose.Types.ObjectId(serijski)};
                          
                          break;
                      }



                      // EXCEPTIONS



                      if(sifra_p === '1' && dijabetes){ // GLU
                        uslov = { 
                          _id: mongoose.Types.ObjectId("600e636df6b7582f58be7ee4") 
                        };   
                      }else if(sifra_p === '1' && !dijabetes){
                        uslov = { 
                          _id: mongoose.Types.ObjectId("60041a35f5e7ce7d39d4d8fc") 
                        }; 
                      }

                      if(sifra_p === '04' && anemija){ // Fe
                        uslov = { 
                          _id: mongoose.Types.ObjectId("600e68acf6b7582f58be7f56") 
                        };   
                      }else if(sifra_p === '04' && !anemija){
                        uslov = { 
                          _id: mongoose.Types.ObjectId("600c878c111f676a86bf9e5a") 
                        }; 
                      }

                      if(sifra_p === '53' && markeri){ // CK
                        uslov = { 
                          _id: mongoose.Types.ObjectId("600e83cc8eff616e48505a7f") 
                        };   
                      }else if(sifra_p === '53' && !markeri){
                        uslov = { 
                          _id: mongoose.Types.ObjectId("600c8dc0111f676a86bf9e94") 
                        }; 
                      }

                      if(sifra_p === '102' && reuma){ // CRP
                        uslov = { 
                          _id: mongoose.Types.ObjectId("6011751e77c8c13bc764aaac") 
                        };   
                      }else if(sifra_p === '102' && !reuma){
                        uslov = { 
                          _id: mongoose.Types.ObjectId("600c8dcb111f676a86bf9e99") 
                        }; 
                      }



                      // End of EXCEPTIONS


                      
                      if (uzorak.status != "OBRAĐEN") {
                        AnaAssays.findOne(
                          uslov
                        ).populate('test').lean().exec(function (err, test) {
                          if (err) {
                            console.log("Greška:", err);
                          } else {
                            // console.log(test)
                            if (test === null) {
                              console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + ' ni na jednom aparatu: ' + sn);
                            } else {
                              uzorak.tests.forEach(elementu => {
      
                                if ((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "ZAPRIMLJEN") ||(elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") || (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)) {
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
                                  if (!isNaN(object.rezultat_f) && (test.float != "")) {
                                      rezultat.rezultat_f = parseFloat(object.rezultat_f).toFixed(parseInt(test.float));
                                     
                                    } else {
                                      rezultat.rezultat_f = object.rezultat_f
  
                                     
                                    }
                                    console.log('kod jedinice')
                                    console.log(object.jedinice_f.charCodeAt(0))
                                    object.jedinice_f.charCodeAt(0);
                                    if(object.jedinice_f.charCodeAt(0) === 65533 ){//&Z03BC& //	&#xfffd
                                      
                                      rezultat.jedinice_f = object.jedinice_f.replace(object.jedinice_f.charAt(0), "µ")
                                    }else{
                                      rezultat.jedinice_f = object.jedinice_f
                                    }
                                  
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
                                            console.log(':: Dosao test sa BS 480: ' + elementu.labassay.naziv)
      
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
      function makedate(date) {
        function pad2(n) {  // always returns a string
          return (n < 10 ? '0' : '') + n;
      }

      return date.getFullYear() +
             pad2(date.getMonth() + 1) + 
             pad2(date.getDate()) +
             pad2(date.getHours()) +
             pad2(date.getMinutes()) +
             pad2(date.getSeconds());
     } 
     function makedob(jmbg) {
        var year = '2000'
    switch (jmbg[5]) {
        case '9':
                year = '1'+jmbg.substring(4,7)
                console.log('devedesete')
            break;
        case '0':
            year = '2'+jmbg.substring(4,7)
            console.log('dvijehiljadite')
            break;  
        default:
            year = '2'+jmbg.substring(4,7)
            console.log('defaultno dvijehiljadite')
            break;
    }
      return year+jmbg.substring(2,4)+jmbg.substring(0,2)

     }    
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
                    var header = 'H|\\^&|||atom^01.03.07.03^123456|||||||SA|1394-97|'+makedate(new Date());
                    recordret.push(header);
                    var terminator = 'L|1|I';
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
                          if (( (anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true) && (!anaassay.test.calculated) ) || ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN") && (!anaassay.test.calculated))|| ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "U OBRADI") && (!anaassay.test.calculated))) {
                            testovi.push({kod:anaassay.kod,ime:test.labassay.naziv})
  
                            test.status_t = "U OBRADI"
                          }
                        })
                      })
                      testovi.forEach(element => {
                        counter++;
                        if (counter < testovi.length) {
                          tests += ''+element.kod+'^' + element.kod + '^' + ''+ '^\\';
                        } else {
                          tests += ''+element.kod+'^' + element.kod + '^' + ''+ '^';
                        }
                      });
                      Results.findOne({ 'id': uzorak.id }).populate('patient rezultati.labassay').exec(function (err, rezultat) {
  
                        if (testovi.length < 1) {
                          console.log("Za uzorak :" + json.sid + " ne postoji niti jedan rerun zahtjev!");
                          var header = 'H|\\^&|||atom^01.03.07.03^123456|||||||SA|1394-97|'+makedate(new Date())
                          recordret.push(header);
                          var terminator = 'L|1|I';
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
                          var header = 'H|\\^&|||atom^01.03.07.03^123456|||||||SA|1394-97|20200910102501';
                          //H|\^&|||atom^01.03.07.03^123456|||||||SA|1394-97|20090910102501
                          recordret.push(header);
                          var prezime = rezultat.patient.prezime
                          var rime = rezultat.patient.ime
                          if(prezime.length > 20){
                            prezime = rezultat.patient.prezime.substring(0,19)
                          }
                          if(rime.length > 20){
                            rime = rezultat.patient.ime.substring(0,19)
                          }
                          ime = prezime+'^'+rime+'^N'
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

                          var stamp = new Date()
                          //var patient = 'P|1||' + uzorak.pid + '||'+ime+'||10012009|M||AMB||||||||DBT|';
                          var spol = rezultat.patient.spol
                          if(spol ==="MUŠKI"){
                            spol = "M"
                          }else{
                            spol = "F"
                          }
                          var patient ='P|1||'+uzorak.pid+'||'+ime+'||'+makedob(rezultat.patient.jmbg)+'|'+spol+'|||A||Dr.Bean|icteru|100012546|||Diagnosis information||0001|||||A1|002||||||||'
                          // var patient ='P|1||PATIENT111||Smith^Tom^J||19600315|M|||A||Dr.Bean|icteru|100012546|||Diagnosis information||0001|||||A1|002||||||||'
                          recordret.push(patient);
                          var tipu = 'serum'
                          if(json.sid[0] === "P"){
                              tipu = "plasma"
                          }
                          if(json.sid[0] === "U"){
                            tipu = "urine"
                        }
                          var order = 'O|1||' + json.sid + '|' + tests + '|R|'+ ''+'|'+ ''+'||||||||'+tipu+'|'+uzorak.created_by+'|ATR|1|LC||||||Q|||||';
                          //recordret.push(order); // case 1
                          
                          var niztest = []                      
                            if (order.length > 240) {
                            console.log('vece od 240') 
                            niztest = tests.split("^^")
                            //  |^^^241^^UNDILUTED^P\\^^^99^^UNDILUTED^P\\^^^110^^UNDILUTED^P|
                            //niztest.splice(0, 1);
                            order = ""
                            tests = ""
                            var firstelement = niztest[0]+"^^"
                            niztest.shift()
                            //niztest.pop()
                            var testtemp = ""
                            var j = 1
                            console.log(niztest)
                            niztest.forEach(test => {
  
                              console.log("Test: " + test)
                              testtemp = tests  + "^^"
                              if (testtemp.length < 118) {
                                if (test.indexOf("\\") === -1) {
                                  if(test === ''){
                                    order = 'O|' + j + '|'+ json.sid + '|' + firstelement +tests    + test  + '|R|'+ makedate(stamp)+'|'+ makedate(stamp)+'||||||||'+tipu+'|'+uzorak.created_by+'|Atrijum|1|lejla||||||Q|||||'; 
                                  }else{
                                    order = 'O|' + j + '|'+ json.sid + '|' + firstelement +tests    + test + "^^" + '|R|'+ makedate(stamp)+'|'+ makedate(stamp)+'||||||||'+tipu+'|'+uzorak.created_by+'|Atrijum|1|lejla||||||Q|||||';
                                  }
                                  //order = 'O|' + j + '|' + json.sid + '||' + tests + "^^" + test + '|||||||N||||||||||||||Q';  
                                  // O|1||S001A10205|66^CRP^^\\1^GLU^^\\03^UREA^^\\02^CREA^^\\33^AST^^\\32^ALT^^\\53^CK^^\\54^LDH^^|R|20210205090132|20210205090132||||||||serum|medinas|Atrijum|1|lejla||||||Q|||||
                                  tests =  test +"^^"
                                  recordret.push(order);
                                } else {
  
                                  tests = tests  + test+ "^^"
  
                                }
  
                              } else {
                                //order = 'O|' + j + '|' + json.sid + '||' + tests + '|||||||N||||||||||||||Q';
                                order = 'O|' + j + '|'+ json.sid + '|' +firstelement+ tests   + '|R|'+ makedate(stamp)+'|'+ makedate(stamp)+'||||||||'+tipu+'|'+uzorak.created_by+'|Atrijum|1|lejla||||||Q|||||';
                                tests = ""
                                tests =   test + "^^"
                                recordret.push(order);
                                order = ""
                                if (j === 7) { j = 0 } else {
                                  j++
                                }
                              }
  
                            });
                          } else {
                            console.log('manje od 240')
                            recordret.push(order);
                          }
                          var terminator = 'L|1|N';
                          //'L|1|I'
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
  