module.exports = {

    parsaj_rezultat: function (record, io,objectId) {
  
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
      var header = ''
      var order  =''
      var result  =''
      var chunks  =[]
      var rezultati = []
      var obj = {}
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            header = element.split("|");
            console.log("Aparat: " + header[8]);
            break;

          case 'O':
            console.log("Order: ");
            order = element.split("|");
            sid = order[2];
            console.log("SID: " + sid);
            break;
          case 'R':
            console.log("Rezultat: ");
            //'R|1|^^^PT LS|68.1|%||||||||20181109121149|',
            //'R|2|^^^PT LS|1.31|INR||||||||20181109121149|', ovo
            //'R|3|^^^PT LS|16.0|Sec||||||||20181109121149|', ovo
            //'R|1|^^^FIBRINOGEN|2.6|g/L||||||||20181108134710|', ovo
            // 'R|2|^^^FIBRINOGEN|0.0|No Unit||||||||20181108134710|',
            // 'R|3|^^^FIBRINOGEN|0.0|No Unit||||||||20181108134710|',
            // 'R|1|^^^APTT|64.5|Sec||||||||20181102114450|', ovo
            // 'R|2|^^^APTT|0.0|Ratio||||||||20181102114450|',
            // 'R|3|^^^APTT|0.0|No Unit||||||||20181102114450|',
            // Test
                 
            result = element.split("|");
            chunks = result[2].split("^");
            obj.sifra_p = chunks[3];
            obj.jedinice_f = result[4];
            obj.vrijeme_rezultata = result[12];
            obj.module_sn = 'E0041-11-250716';
            if(obj.sifra_p ==='PT LS'){

                switch (result[4]) {
                    case '%':
                            obj.sifra_p = 'PT%'
                            obj.jedinice_f = '%';
                        break;
                    case 'INR':
                    obj.sifra_p = 'PTINR'
                    obj.jedinice_f = 'INR';
                        break;
                    case 'Sec':
                    obj.sifra_p = 'PTSec'   
                    obj.jedinice_f = 'Sec';   
                        break;               
                    default:
                        break;
                }
            }
            if(obj.jedinice_f === "No Unit" ||  obj.jedinice_f === "Ratio"){
                obj.sifra_p  = 'N/A' 
            }
            
            obj.dilucija = 'dilucija';
            obj.reagens_lot = 'reagent_lot';
            obj.reagens_sn = 'reagens_sn';
            if (!isNaN(result[3])) {
                obj.rezultat_f = parseFloat(result[3]).toFixed(2);
            } else {
                obj.rezultat_f = result[3]
            }

            obj.rezultat_p = 'rezultat_p';
            obj.jedinice_p = 'jedinice_p';
            obj.rezultat_i = 'rezultat_i';
            rezultati.push(obj)
            obj = {}
            break;
          case 'L':
            console.log("Terminator: ");
                console.log(rezultati)
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
                        rezultati.forEach(instance => {
                          AnaAssays.findOne({ kod: instance.sifra_p }).populate('test').lean().exec(function (err, test) {
                            if (err) {
                              console.log("Greška:", err);
                            }
                            else {
                              // console.log(test)
                              if (test === null) {
                                console.log('U LIS-u ne postoji definisan test sa sifrom:' + instance.sifra_p + ' ni na jednom aparatu' + instance.module_sn);
                              } else {
                                uzorak.tests.forEach(elementu => {
    
                                  if ((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "ZAPRIMLJEN") ||(elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") || (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)) {
                                    console.log('Match Found')
                                    // console.log(elementu)
                                    elementu.status_t = "REALIZOVAN"
                                    elementu.status_r = false
                                    var rezultat = {};
                                    rezultat.anaassay = test
                                    rezultat.sn = instance.module_sn
                                    rezultat.vrijeme_prijenosa = Date.now()
                                    rezultat.vrijeme_rezultata =  instance.vrijeme_rezultata
                                    rezultat.dilucija =  instance.dilucija
                                    rezultat.module_sn =  instance.module_sn
                                    rezultat.reagens_lot =  instance.reagens_lot
                                    rezultat.reagens_sn =  instance.reagens_sn
                                    rezultat.rezultat_f =  instance.rezultat_f
                                    rezultat.jedinice_f =  instance.jedinice_f
                                    rezultat.rezultat_p =  instance.rezultat_p
                                    rezultat.jedinice_p =  instance.jedinice_p
                                    rezultat.rezultat_i =  instance.rezultat_i
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
                                                                        rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'Erba ECL 105'),
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
                          ///ččččč
                        });
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

  };
  