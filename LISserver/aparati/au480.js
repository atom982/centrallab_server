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

      console.log('usao u AU480 fajl')
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
          console.log("Rezultati AU480: ");
          //'D 000501 0036          S014P81028    E86      302br38      0.9r 43       53r ' 
          var tempRezH = element.split("E");
              tempRezH = element.substring(0, 74);//dodato na dz bihac
          var tempRezR = tempRezH[1];
              tempRezR = element.substring(74, element.length);//dodato na dz bihac
          var dRezultati = []
          var fRezultati  =[]
          var imenew= tempRezH.substring(54, 74)
          var prezimenew = tempRezH.substring(34, 54)
          var yearnew = tempRezH.substring(29, 32)
          var monthnew = tempRezH.substring(32, 34)
          var spolnew = tempRezH.substring(28, 29)
          sid = tempRezH.substring(13, 23).trim()
          console.log('SID:'+sid)
          console.log('spol:'+spolnew)
          console.log('ime:'+imenew)
          console.log('prezime:'+prezimenew)
          console.log("age(years,month):"+yearnew+monthnew)
          console.log(tempRezR)
          var duzina = tempRezR.length / 11
          var counter = Math.ceil(duzina) 
          console.log(counter)
              var i;
              for ( i= 1; i <= counter; i++) { 
                  tempRezR.substring(11*(i-1),11*i)
                  dRezultati.push(tempRezR.substring(11*(i-1),11*i))
              }

              dRezultati.forEach(rez => {
                  fRezultati.push({
                                  //rezultat_f :rez.substring(3,11).trim().replace("r", "").replace("h", "").replace("l", "").replace("H", "").replace("L", ""),
                                  rezultat_f :rez.substring(3,11).trim().replace("r", "").replace("h", "").replace("l", "").replace("H", "").replace("L", ""),
                                  //kod : rez.substring(0,2)
                                  kod : rez.substring(0,3)
                                  })
              })
              console.log(fRezultati)
              var rezhba1 = ""// %hba1c kod 054
              fRezultati.forEach(element => {
                  if(element.kod ==="054"){
                    rezhba1  = element.rezultat_f
                    console.log('pridruzio rezultaat:'+rezhba1)
                  }
              });
              fRezultati.forEach(element => {
                if(element.kod ==="055"){
                  element.rezultat_f  = rezhba1
                }
            });            
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

                              if ((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") ||(elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "ZAPRIMLJEN")  ||(elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)) {
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

  parsaj_query: function (record, aparat,callback) {

    var mongoose = require("mongoose");
    var Samples = require("../../models/Postavke");
    var Samples = mongoose.model("Samples");
    var AnaAssays = require("../../models/Postavke");
    var AnaAssays = mongoose.model("AnaAssays");
    var Results = require("../../models/Postavke");
    var Results = mongoose.model("Results");

    function makedob(jmbg) {
      var year = '2000'
  switch (jmbg[4]) {
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
          switch (element.substring(0,2)) {
            case "R ":
              console.log('Normal sample (Routine/Emergency/STAT) request')
              json.sid = element.substring(13,23)//sample ID length configured to 10 digits
              json.rackicup_no = element.substring(2,8)//rack no digits configured to 4
              json.sample_no = element.substring(9,13)// sample no 4 digits 
              console.log('rackicup_no:'+json.rackicup_no+":")
              console.log('sample_no:'+json.sample_no+":")
              console.log('SID:'+json.sid+":")
              break;
            case "RB":
              console.log('Sample information request start')
              break;  
            case "RH":
              console.log('Repeat run sample{Routine/Emergency/STAT} request')
              break;   
            case "Rh":
              console.log('Automatic repeat run sample{Routine/Emergency/STAT} request')
              break;  
            case "RE":
              console.log('Sample information request end')
              break;     
            default:
              break;
          }
          // console.log("Query: ");
          // var niz = element.split(' ')
          // console.log('dobijeni niz')
          // console.log(niz)
          // console.log('duzina niza')
          // console.log(niz.length)
          // json.sid = niz[niz.length-1].substring(4,niz[niz.length-1].length);
          // json.rackicup_no = niz[1];
          // json.sample_no = niz[2].substring(0,4)
          // console.log('SID:'+json.sid)

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

                  AnaAssays.find({aparat: mongoose.Types.ObjectId(aparat)}).populate('aparat test').lean().exec(function (err, anaassays) {
                    uzorak.tests.forEach(function (test) {
                      anaassays.forEach(function (anaassay) {
                        if ((anaassay.aparat.sn === json.sn) && (anaassay.test.sifra === test.labassay.sifra) && (anaassay.test.calculated)) {
                          test.status_t = "U OBRADI"
                        }
                        if (((anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true)) || ((anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN"))|| ((anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "U OBRADI"))) {
                          testovi.push(anaassay.kod)

                          test.status_t = "U OBRADI"
                        }
                      })
                    })
                    testovi.forEach(element => {
                      tests += element 
                    });
                    Results.findOne({ 'id': uzorak.id }).populate('patient rezultati.labassay').exec(function (err, rezultat) {

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
                        console.log("Parametri response-a: ");

                             // D 000101 E001            2 BEHART    E85
                             // D 000503 0009        271055001004    E83
                             // R 000501 0034          S012P81028
                             //D 000801 0071                  5C    EF     BASANOVIC           JASMINA 1975    
                             var prezime = rezultat.patient.prezime
                             var rime = rezultat.patient.ime
                             var spol = rezultat.patient.spol
                             var starostyr = parseInt(makedate(new Date()).substring(0,4)) - parseInt(makedob(rezultat.patient.jmbg).substring(0,4))
                             starostyr = starostyr.toString()
                             switch (starostyr.length) {
                               case 1:
                                      starostyr ="00"+starostyr
                                 break;
                                case 2:
                                  starostyr ="0"+starostyr
                             break;                            
                               default:
                                 break;
                             }
                             var starostmo="01"
                             
                             if(spol ==="MUŠKI"){
                               spol = "M"
                             }else{
                               spol = "F"
                             }
                             console.log("spol pacijenta(length 1 digit):"+spol)
                             console.log("starost pacijenta godina (length 3 digit):"+starostyr)
                             console.log("starost pacijenta mjeseci default 01(length 2 digit):"+starostmo)
                             if(prezime.length > 20){
                               prezime = rezultat.patient.prezime.substring(0,19)
                             }
                             if(rime.length > 20){
                               rime = rezultat.patient.ime.substring(0,19)
                             }
                             if(prezime.length < 20){
                               var diff = 20 - prezime.length
                              for (let index = 0; index < diff; index++) {
                                prezime +=" "     
                              }
                             }
                             if(rime.length < 20){
                              var diffi = 20 - rime.length
                             for (let index = 0; index < diffi; index++) {
                               rime +=" "     
                             }
                            }
                            
                            rime = rime.replace(/Ć/g,'C')
                            rime = rime.replace(/Č/g,'C')
                            rime = rime.replace(/Š/g,'S')
                            rime = rime.replace(/Đ/g,'D')
                            rime = rime.replace(/Ž/g,'Z')
                            rime = rime.replace(/č/g,'c')
                            rime = rime.replace(/ć/g,'c')
                            rime = rime.replace(/š/g,'s')
                            rime = rime.replace(/đ/g,'d')
                            rime = rime.replace(/ž/g,'z')
                            prezime = prezime.replace(/Ć/g,'C')
                            prezime = prezime.replace(/Č/g,'C')
                            prezime = prezime.replace(/Š/g,'S')
                            prezime = prezime.replace(/Đ/g,'D')
                            prezime = prezime.replace(/Ž/g,'Z')
                            prezime = prezime.replace(/č/g,'c')
                            prezime = prezime.replace(/ć/g,'c')
                            prezime = prezime.replace(/š/g,'s')
                            prezime = prezime.replace(/đ/g,'d')
                            prezime = prezime.replace(/ž/g,'z')
                            var temp = ""
                            console.log("prezime pacijenta (length "+ prezime.length +" digit):"+prezime)
                            console.log("ime pacijenta (length "+ rime.length +" digit):"+rime)
                            var datanew = spol+starostyr+starostmo+prezime+rime+temp
                            var sample_type =" "
                            switch (json.sid.charAt(0)) {
                              case "S":
                                      sample_type =" "
                                break;
                              case "U":
                                      sample_type ="U"
                                break;   
                              case "K":
                                      sample_type =" "
                                      tests += "055056"
                                break;                         
                              default:
                                      sample_type ="N"
                                break;
                            }
                          console.log("tip uzorka: "+sample_type+": (gdje je W-puna krv, prazno serum,U-urin,N-nepoznato)")
                          console.log("SID (length "+ json.sid.length +" digit):"+json.sid+" (provjeri postavke za SID length)")
                          console.log("POSLIJE SID-a idu 4 prazna mjesta, a zatim ide E ako je posljednja poruka u bloku")
                          console.log("FORMAT PORUKE:S (rackicupno)(sample_type)(original_sample_no)(SID-10digit)(    )E(spol-1digit)(age-5digit)(patient info 1 - 20 digit)(patient info 2-20 digit)(tests- 2 or 3 digits)")
                        var order = 'S ' + json.rackicup_no + sample_type +json.sample_no+json.sid+'    E'+datanew+ tests; 
                        console.log(order)   
                        recordret.push(order); 
                        callback(recordret);
                      }

                    })
                  })
                } // else if uzorak null

              }
            })
          break;
        default:
          console.log("Nepoznat Type of Frame!");
      }
    })
  },

};