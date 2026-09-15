module.exports = {

    parsaj_rezultat: function(record,io,callback){

      var mongoose = require("mongoose");

      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");

      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");

      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");

      var calculated = require("../../funkcije/calculated/calculated");

      var sn='251025';
      var vrijeme_prijenosa='';
      var gender='';
      var sid = '';
      var module_sn='GRADACAC';
      var tpsa = "";
      var fe = "";

      // R recordi se prvo skupe, a zatim obrađuju jedan po jedan.
      // Paralelna obrada učitava više kopija istog Results/Samples dokumenta
      // i drugi save() pada sa VersionError, pa se sačuva samo jedan test.
      var rRecords = [];

      record.forEach(function(element) {
          var record_type = element.charAt(0);
          switch (record_type) {
                      case 'H':
                                console.log("header");
                                var header= element.split("|");
                                vrijeme_prijenosa=header[13];
                                console.log(vrijeme_prijenosa);
                                break;
                      case 'P':
                                console.log("patient");
                                var patient= element.split("|");
                                gender=patient[8];
                                console.log("gender:"+gender);
                                break;
                      case 'O':
                                var order = element.split("|");
                                sid = order[2];
                                console.log("SID: " + sid);
                                break;
                      case 'R':
                                rRecords.push(element);
                                break;
                      case 'C':
                                console.log("komentar");
                                break;
                      case 'L':
                                console.log("terminator");
                                break;
                      default:
                                console.log("Nepozanat tip frame-a..");
          }
      });

      obradiSljedeci(0);

      function obradiSljedeci(i) {
        if (i >= rRecords.length) {
          return;
        }
        obradiRezultat(rRecords[i], function() {
          obradiSljedeci(i + 1);
        });
      }

      // Obrađuje jedan R record; done() se poziva tek kada su svi save() završeni
      function obradiRezultat(element, done) {
        var polja = element.split("|");
        var chunks = (polja[2] || '').split("^");

        // RLU i COFF recordi se ne čuvaju, samo DOSE
        if (chunks[7] !== "DOSE") {
          return done();
        }

        var sifra_p = chunks[3];
        var rezultat_f = '';
        if (!isNaN(polja[3])) {
          rezultat_f = parseFloat(polja[3]).toFixed(2);
        } else {
          rezultat_f = polja[3];
        }
        if (polja[6] == "<") {
          rezultat_f = "< " + rezultat_f;
        }
        var jedinice_f = polja[4];
        var vrijeme_rezultata = polja[12];

        Samples.findOne({id: sid}).populate('patient tests.labassay').exec(function (err, uzorak) {
          if (err) {
            console.log("Greška:", err);
            return done();
          }
          if (uzorak === null) {
            console.log('U LIS-u ne postoji unesen order za uzorak broj:'+sid);
            return done();
          }
          var sekc = uzorak.tests[0].labassay.sekcija
          console.log(" Uzorak pronadjen");
          if (uzorak.status == "OBRAĐEN") {
            return done();
          }
          console.log("=====Cuvam sifra "+sifra_p+" rezultat "+rezultat_f+" sa jedinicom "+jedinice_f )

          AnaAssays.findOne({kod:sifra_p}).populate('test').lean().exec(function (err, test) {
            if (err) {
              console.log("Greška:", err);
              return done();
            }
            if (test === null) {
              console.log('U LIS-u ne postoji definisan test sa sifrom:'+sifra_p+' ni na jednom aparatu'+sn);
              return done();
            }

            var elementu = uzorak.tests.find(function(t) {
              return t.labassay.sifra.trim() === test.test.sifra.trim() &&
                (t.status_t === "ZAPRIMLJEN" || t.status_t === "U OBRADI" || t.status_r);
            });
            if (!elementu) {
              console.log('Za uzorak '+sid+' ne postoji zahtjev za test '+sifra_p);
              return done();
            }

            console.log('match pronadjen')
            elementu.status_t = "REALIZOVAN"
            elementu.status_r = false
            var rezultat = {};
            rezultat.anaassay = test
            rezultat.sn = sn
            rezultat.vrijeme_prijenosa=vrijeme_prijenosa
            rezultat.vrijeme_rezultata=vrijeme_rezultata
            rezultat.dilucija='dilucija'
            rezultat.module_sn=module_sn
            rezultat.reagens_lot='reagens_lot'
            rezultat.reagens_sn='reagens_sn'
            console.log("Cuvam sifra "+sifra_p+" rezultat "+rezultat_f+" sa jedinicom "+test.test.jedinica )
            rezultat.rezultat_f=rezultat_f
            rezultat.jedinice_f=test.test.jedinica
            rezultat.rezultat_p='rezultat_p'
            rezultat.jedinice_p='jedinice_p'
            rezultat.rezultat_i='rezultat_i'
            rezultat.odobren=false

            Results.findOne({id: uzorak.id}).populate('rezultati rezultati.labassay patient').exec(function (err, result) {
              if (err) {
                console.log("Greška:", err)
                return done();
              }
              if (result === null) {
                console.log('U LIS-u ne postoji nalaz za uzorak broj:'+uzorak.id);
                return done();
              }
              if(result.created_at === null){
                result.created_at = Date.now()
              }
              var spol = result.patient.spol
              var jmbg = result.patient.jmbg

              var element = result.rezultati.find(function(r) {
                return r.labassay.sifra === test.test.sifra;
              });
              if (!element) {
                return done();
              }

              element.retest = false
              result.updated_at = Date.now()
              element.rezultat.push(rezultat)
              uzorak.status = "U OBRADI"

              if (element.status == "ODOBREN") {
                return done();
              }

              element.status = "NIJE ODOBREN"
              var received = elementu.labassay.naziv
              console.log(':: Dosao test sa Centaur CP: ' + received)

              uzorak.save(function(err) {
                if (err) {
                  console.log("Greška:", err);
                }
                result.save(function(err,novi) {
                  if (err) {
                    console.log("Greška:", err);
                    return done();
                  }
                  console.log("Rezultat sacuvan")
                  obradiKalkulisane(novi, uzorak, test, received, spol, jmbg, sekc, done);
                });
              });
            });
          });
        });
      }

      function obradiKalkulisane(novi, uzorak, test, received, spol, jmbg, sekc, done) {
        var komplet = true
        var zadaci = [] // kalkulisani testovi spremni za izračunavanje: {element, final}

        novi.rezultati.forEach(element => {
          if(!element.rezultat.length){
            komplet = false
          }
          if((element.retest)){
            komplet = false
          }
          if(!element.labassay.calculated){
            return
          }
          var match = element.labassay.calculatedTests.some(required => {
            return test.test._id.equals(mongoose.Types.ObjectId(required.labassay))
          })
          if (!match) {
            return
          }
          console.log(':: Ima kalkulisani test koji zavisi od rezultata testa: ' + received)

          var formula = element.labassay.calculatedFormula || []
          element.labassay.calculatedTests.forEach(required => {
            novi.rezultati.forEach(rez => {
              if (rez.labassay.equals(mongoose.Types.ObjectId(required.labassay)) && rez.rezultat.length > 0){
                formula.forEach((clan,i,array) => {
                  if(clan.length > 10){
                    if (rez.labassay.equals(mongoose.Types.ObjectId(clan))) {
                      array[i] = rez.rezultat[rez.rezultat.length - 1].rezultat_f
                    }
                  }
                })
              }
            })
          })

          // Izračunavanje, pod uslovom da su pristigli svi testovi
          var calculatedComp = formula.length > 0
          var final = ''
          formula.forEach(broj => {
            final += broj
            if (broj.length > 15) {
              calculatedComp = false
            }
            if (broj.trim() === "") {
              calculatedComp = false
            }
          })
          if (calculatedComp) {
            zadaci.push({element: element, final: final})
          }
        });

        if(komplet){
          io.emit('kompletiran', novi.id, uzorak.site, sekc)
        }

        izracunajSljedeci(0)

        // Kalkulisani testovi se također računaju redom, pa se uzorak i nalaz snime jednom
        function izracunajSljedeci(k) {
          if (k >= zadaci.length) {
            if (!zadaci.length) {
              return done();
            }
            return uzorak.save(function(err) {
              if (err) {
                console.log("Greška:", err);
              }
              novi.save(function(err) {
                if (err) {
                  console.log("Greška:", err);
                } else {
                  console.log('izvrsen')
                }
                done();
              });
            });
          }

          var element = zadaci[k].element
          var final = zadaci[k].final
          AnaAssays.findOne({test:element.labassay._id}).populate('aparat test').exec(function (err, testap) {
            if (err || testap === null) {
              console.log("Greška:", err || 'Ne postoji AnaAssay za kalkulisani test');
              return izracunajSljedeci(k + 1);
            }
            var tocalculate = testap.test.naziv
            console.log('Računam kalkulisani test: ' + tocalculate)
            console.log(final)
            try {
              element.status = "NIJE ODOBREN"
              element.rezultat = []
              element.rezultat.push({
                anaassay:testap._id,
                rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'Erba XL 200'),
                jedinice_f:element.labassay.jedinica,
                vrijeme_prijenosa:Date.now(),
                vrijeme_rezultata:Date.now(),
                odobren:false,
              })
              uzorak.tests.forEach(elementup => {
                if(elementup.labassay.equals(element.labassay._id)){
                  elementup.status_t = "REALIZOVAN"
                }
              })
            } catch (e) {
              console.log("Greška pri računanju kalkulisanog testa " + tocalculate + ":", e);
            }
            izracunajSljedeci(k + 1);
          })
        }
      }
    },
  
    parsaj_query: function(record,aparat,callback){
      var mongoose = require("mongoose");
  
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");

  

  
        var record_type='';
        var json = {};
        var testovi=[];
        var recordret =[];
        var dilution = ''
        var stype = ''
        var ime = ''
        var header = ''
        console.log('funkcija');
        console.log(record);
        record.forEach(function(element) {
            record_type =element.charAt(0);
            switch (record_type) {
                        case 'H':
                                  header= element.split("|");
                                  json.sn='251025';
                                  json.vrijeme_prijenosa=header[13];
                                  break;
                        case  'Q':     
                                  var query_arr = element.split("|");
                                  json.sequence= query_arr[1];
                                  var sample_arr=query_arr[2].split("^");
                                  json.sid = sample_arr[1];
                                  json.request_type = query_arr[12];
                                  console.log('query za sid:'+json.sid);
                                  break;
                        case  'L':
                                  console.log("terminator");
                                  var testovi = [];
                                  Samples.findOne({id: json.sid}).populate('patient tests.labassay').exec(function (err, uzorak) {
                                    if (err) {
                                      console.log("Greška:", err);
                                    }
                                    else {
                                          if(uzorak===null){
                                            console.log("U LIS-u ne postoji uzorak sa brojem:"+json.sid);
                                            recordret = []
                                            callback(recordret); 
                                          }else{
                                                var tests = '';
                                                var counter =0;
                                                var uzoraklength=uzorak.tests.length;
                                                
                                                AnaAssays.find({aparat: mongoose.Types.ObjectId(aparat)}).populate('aparat test').lean().exec(function (err, anaassays) {
                                                  uzorak.tests.forEach(function(test) {
                                                    anaassays.forEach(function(anaassay) { 
                                                      if((anaassay.aparat.sn === json.sn) && (anaassay.test.sifra === test.labassay.sifra)  && (anaassay.test.calculated)){
                                                        test.status_t = "U OBRADI"
                                                      }
                      if(( (anaassay.test.sifra === test.labassay.sifra)&&(test.status_r ===true) ||( (anaassay.test.sifra === test.labassay.sifra)&&(test.status_t ==="ZAPRIMLJEN"))||( (anaassay.test.sifra === test.labassay.sifra)&&(test.status_t ==="U OBRADI")))){
                                                          testovi.push(anaassay.kod)
                                                          
                                                          test.status_t = "U OBRADI"
                                                       }
                                                    })
                                                  })
                                                  testovi.forEach(element => {
                                                      counter++;
                                                      if(counter<testovi.length){
                                                              tests+= '^^^'+element+'\\';
                                                        }else{
                                                              tests+= '^^^'+element;                                                              
                                                        }
                                                  });
                                                  Results.findOne({'id':uzorak.id}).populate('patient rezultati.labassay').exec(function (err, rezultat) { 
  
                                                    if(testovi.length < 1){
                                                      console.log("Za uzorak :"+json.sid+" ne postoji niti jedan rerun zahtjev");
                                                      // H|\\^&|||ATOM|||||ACCP1||P|1
                                                      //H|\\^&|||CENTAURXPT|||||atom||P||20260915151220'
                                                      header='H|\\^&|||'+"ATOM"+'|||||CENTAURXPT||P|1'//+'\u000D';//\\^&
                                                      recordret.push(header);
                                                      // Q|1|^SID10768||ALL||||||||O
                                                      var query = 'Q|1|^'+json.sid+'||ALL||||||||O'//+'\u000D'
                                                      recordret.push(query);
                                                      //L|1|I<CR>
                                                      var terminator = 'L|1|I'//+'\u000D';
                                                      recordret.push(terminator);
                                                      callback(recordret);
                                                    }else{
                                                      rezultat.status = "U OBRADI"
                                                      uzorak.status = "U OBRADI"
                                                      rezultat.save(function(err) {
                                                        if(err) {
                                                          console.log("Greška:", err);
                                                          
                                                        } else {
                                                          
                                                        }
                                                      });
                                                      uzorak.save()
                                                      console.log("Kreiram record;");
                                                      header='H|\\^&|||'+"ATOM"+'|||||CENTAURXPT||P|1'//+'\u000D';//\\^&
                                                      // H|\\^&|||GRADACAC|Flanders^New^Jersey^07836||973-927-2828|N81|||P|1|20220630112116
                                                      recordret.push(header);
                                                      var prezime = rezultat.patient.prezime
                                                      var rime = rezultat.patient.ime
                                                      if(prezime.length > 20){
                                                        prezime = rezultat.patient.prezime.substring(0,19)
                                                      }
                                                      if(rime.length > 20){
                                                        rime = rezultat.patient.ime.substring(0,19)
                                                      }
                                                      ime = prezime+'^'+rime//+'^'
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
                                                      console.log(ime)
                                                      // P|1|PatID01|||Conti^Biagio^S||19741001|M|||||Martinez|||||||||||WestWing<CR>
                                                      //P|1|20|||Jones^Alan^B||19560519|M|||||Jones^Alan^B|||||||||||General_Ward<CR>

                                                      var patient ='P|1|'+rezultat.patient.jmbg+'|'+'|'+'|'+ime//+'\u000D';
                                                      recordret.push(patient);
                                                      stype = json.sid.substring(0,1)
                                                      console.log(stype)
                                                      var order =''

                                                      order = 'O|1|'+json.sid+'||'+tests+'|R||||||||||||||||||||O\\Q'//+'\u000D';
                                                      recordret.push(order);
                                                      var terminator = 'L|1|F'//'\u000D';
                                                      recordret.push(terminator);
                                                      header = ''
                                                      callback(recordret); 
                                                    }
  
                                                  })                  
                                                })
                                          } // else if uzorak null
  
                                    }
                                  });
                                
                                  break;
                        default:
  
                            console.log("Nepoznat tip frame-a");
  
              }
          });
    },
  
    };
  