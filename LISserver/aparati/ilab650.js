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

      console.log('result parser:')
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

        case 'R':
          console.log("Rezultati iLab650: ");

          dRezultati = element.substring(element.indexOf("\u0002") + 1, element.indexOf("\u0003"))
          
          //var dRezultati = element.split("\u001c");
          var fRezultati  =[]
          var nrTests = 0
          sid = dRezultati.substring(6,18).trim()
          nrTests =dRezultati.substring(23,25)

          // 11 pozicija broj testova dRezultati[10]
          for (let index = 0; index < nrTests; index++) {
              fRezultati.push({
                  test:dRezultati.substring(26+index*22,26+index*22+3),
                  rezultat_f:dRezultati.substring(26+index*22+5,26+index*22+13),
                  errorcode:dRezultati.substring(26+index*22+13,26+index*22+21)
              })
          }      
          fRezultati.forEach(element => {
            element.rezultat_f =parseInt(element.rezultat_f.substring(0,5),10).toString()+'.'+ element.rezultat_f.substring(5,7)
          });
          // element.analit_rez =element.analit_rez.replace(/^0+/, '')
          // if(element.analit_rez.substring(0, 1) == "."){
          //     element.analit_rez ='0'+element.analit_rez
          // }
          //console.log('SID:'+sid)
          //console.log(fRezultati)
          //console.log('broj testova:'+nrTests)

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
                    if (uzorak.status != "REALIZOVAN") {
                      fRezultati.forEach(rezRe => {

                    
                      AnaAssays.findOne({ kod: rezRe.test}).populate('test').lean().exec(function (err, test) {
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
                                      if(temp.test ===test.kod){
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
                                          console.log(':: Dosao test sa iLab 650: ' + elementu.labassay.naziv)

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

  parsaj_query: function(record,site,callback){

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
    var ime = ''+'^'+''
    var defsTests = require("../data/assays");
    var tmpAna = ''
    var lokacija = ''
    var poruka = []
    var definisaniTestovi = []
    switch (site) {
        case '5c6b3386c6543501079f4889':
        definisaniTestovi=defsTests.c_bt1500
        lokacija ="Centar"
        break;
        case '5c6b34d4c6543501079f488b':
        definisaniTestovi=defsTests.t_bt1500
        lokacija ="Travnik"
        break;   
        
      default:
      lokacija ="Extralab"
      definisaniTestovi=defsTests.e_ilab650
        break;
    }
    var brojac = 0
    //console.log('Query Parser: ');
    //console.log(record);
    record.forEach(function (element) {
      record_type = element.charAt(0);
      switch (record_type) {
        case 'H':
          //console.log("Header: ");
          var header = element.split("|");
          var sender = header[4].split("^");
          json.sn = sender[0];
          json.vrijeme_prijenosa = Date.now();
          break;
        case 'P':

          break;
        case 'Q':

          //console.log("Query: ");

          break;
        case 'L':
          //console.log("Terminator: ");
          var datum = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().substring(0, 10)
          var to = new Date(datum + "T23:59:59")
          var from = new Date(datum + "T00:00:00")
          var uslov = {}
          var cupPos = 0
          var goesIn = false
          var btNiz = [] 
          uslov = {
            created_at: {
              $gt: from,
              $lt: to
            },
            status:'n/a'
            //site: mongoose.Types.ObjectId(site)
          }
            var testovi = [];
            
            Samples.find(uslov).populate('tests.labassay patient').sort({created_at: -1}).exec(function (err, uzorci) {
              if (err) {
                console.log("Greška:", err);
              }
              else {
                if (!uzorci.length) {
                  //console.log("U LIS-u ne postoje uneseni uzorci za "+lokacija);
                  
                  recordret.push('\u0002E18\u0003')
                  callback(recordret);
                } else {
                  uzorci.forEach(uzorak => {
                  
                  AnaAssays.find({}).populate('aparat test').lean().exec(function (err, anaassays) {
                    goesIn = false
                    uzorak.tests.forEach(function (test) {
                      anaassays.forEach(function (anaassay) {
                        if ( (anaassay.test.sifra === test.labassay.sifra) && (anaassay.test.calculated)) {
                          if(definisaniTestovi.includes(anaassay.kod)){
                          test.status_t = "U OBRADI"
                          }
                          goesIn = true
                        }
                        if ( (anaassay.test.sifra === test.labassay.sifra) ) {
                          goesIn = true
                        }
                      
                        if (( (anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true)) || ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN") )) {
                          if(definisaniTestovi.includes(anaassay.kod)){
                            testovi.push('1'+anaassay.kod)
                            test.status_t = "U OBRADI"
                            test.status_r = false
                          }

                          goesIn = true
                        }
                      })
                    })
                    var tests = '';
                    //console.log(uzorak.id)
                    var sampleType = uzorak.id.substring(0,1)
                    var stype = 1
                    var cupPosition = uzorak.id.substring(2,4)
                    var sex = uzorak.patient.spol

                    switch (sampleType) {
                      case "U":
                          stype = 2
                          //cupPosition = parseInt(cupPosition)+70
                        break;
                        case "K":
                          stype = 3
                          cupPosition = parseInt(cupPosition)+25
                          break;                   
                      default:
                          stype = 1
                        break;
                    }
                     if(uzorak.patient.spol ==="MUŠKI") {
                       sex = 1
                     }else{
                      sex = 2
                     }
                    var ime = uzorak.patient.ime+ ' '+uzorak.patient.prezime
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
                    //console.log('PODACI IME')
                    //console.log('ime length before:'+ime.length)
                    if(ime.length >= 18){
                      ime=ime.substring(0,18)
                    }else{
                      var duzina = ime.length
                      for (let index = 0; index < (18-duzina); index++) {
                        ime+=' '    
                      }
                    }
                    //console.log('ime length after:'+ime.length)
                    //console.log('sifre testova:'+testovi)
                    
                    var nrTests = testovi.length
                    var allTST = ''

                    //console.log('broj testova:'+nrTests)
                    testovi.forEach(element => {
                      allTST +=  element  
                    });
                   
                  if(nrTests <10){
                    nrTests = '00'+nrTests
                  }
                  if(nrTests  >= 10 ){
                    nrTests = '0'+nrTests
                  }
                  var dstamp = new Date()
                  dstamp=JSON.stringify(dstamp)
                  dstamp=dstamp.substring(3,5)+dstamp.substring(6,8)+dstamp.substring(9,11)+dstamp.substring(12,14)+dstamp.substring(15,17) 
                  var sendRec = '\u0002W10000'+uzorak.id+'    '+'0'+ime+dstamp+   '1'      +cupPosition+   stype   + sex+     '1' +     '001'   +  '0'+    '0'+   '001'+nrTests
                  var limit = testovi.length
                  testovi.forEach(element => {
                    //buffer2 = Buffer.concat([buffer2,Buffer.from(element)]);  
                    sendRec +=element
                  });
                  sendRec +='\u0003'
                  //buffer2 = Buffer.concat([buffer2,Buffer.from('\u0003')]);

                  testovi = []
                  // W (Request code)
                  // 1 (Instrument No)
                  // 0000       (Request No) 
                  // S003S91006__  (Sample ID) total 14
                  // 0 (Request Type 0 routine)  0 routine, 1 stat
                  // S003S91006______ (Sample Barcode ) total 18
                  // 191006 (Request Date )
                  // 1130 (Request Time )
                  // 1 (Sample Disk No. )  1
                  // 50 (Sample Position No.)  01 do 75
                  // 1 (Sample Type) --- 1 serum, 2 urin, 3 other
                  // 1 (sex)  --- 1 male , 2 female , 3 other
                  // 1 (cup type)
                              //Standard Cup :         “1”
                              //Micro Cup :            “2”
                              //Tube :                 “3”
                              //Standard Cup in Tube : “4”
                              //Micro Cup in Tube :    “5”
                  // 001 (dilution) od 001 do 999
                  // 0 (automatic rerun) 0 off, 1 on
                  // 0 (reflex) 0 off, 1 on
                  // 001 (doctor code) 001 do 100
                  // 001 (nr TESTS)  001 do 100
                  // REPEAT
                  // 1 (test type ) 1 - biochemistry, 2 - ise, 3- calculated, 4 -serum index
                  // Test NO
                 
       
                                                                                          //yymmdd   time    diskno         scpos      stype   sex     cuptype     dil   rerun   reflex   doctor    nrTests   (testtype+testno)
                  //var order ='\u0002'+ 'W10000'+uzorak.id+'    '+'0'+"                  "+'191006'+ '1130'+   '1'      +cupPosition+   '1'   + sex+     '1' +     '001'+ '0'+    '0'+   '001'+   nrTests+     + allTST+'\u0003'
                  //var order ='\u0002W10000'+uzorak.id+'    '+'0'+ime+ dstamp+   '1'      +cupPosition+   stype   + sex+     '1' +     '001'+ '0'+    '0'+   '001'+   nrTests.toString()+     + allTST.toLocaleString('fullwide', {useGrouping:false})+'\u0003'
                  //                                     Request Type 0 routine    Sample Disk No.                             cup type   (dilution) (rerun)  (reflex) (doctor code)
                  //var buffer1 = Buffer.from('\u0002W10000'+uzorak.id+'    '+'0'+ime+dstamp+   '1'      +cupPosition+   stype   + sex+     '1' +     '001'   +  '0'+    '0'+   '001');
                  //var buffer3 = Buffer.concat([Buffer.from('\u0002W10000'+uzorak.id+'    '+'0'+ime+dstamp+   '1'      +cupPosition+   stype   + sex+     '1' +     '001'   +  '0'+    '0'+   '001'),buffer2]); 
                  //console.log('Order za slanje na lokaciju:'+lokacija) 
                  //console.log(JSON.stringify(order))
                  //console.log(JSON.stringify(buffer3))
                  if(limit){
                    recordret.unshift(sendRec);
                  }else{
                  
                    recordret.push('\u0002E18\u0003');
                  }
                    
                    brojac++
                    uzorak.status = "U OBRADI"
                    uzorak.save()  
                    //console.log(recordret)
                    if(brojac===uzorci.length){
                     
                        //  if(recordret[0].includes('E18')){
                        //   callback(recordret.slice(0, 1));
                        //   recordret = []
                        //  }else{
                        //   if(recordret[1].includes('E18')){
                        //     callback(recordret.slice(0, 1));
                        //     recordret = []
                        //   }else{
                        //     if(recordret[2].includes('E18')){
                        //       callback(recordret.slice(0, 2));
                        //       recordret = []
                        //     }else{
                        //       if(recordret[3].includes('E18')){
                        //         callback(recordret.slice(0, 3));
                        //         recordret = []
                        //       }
                        //     }
                        //   }
                        //  }
                        callback(recordret);
                     
                    }
                    Results.findOne({ 'id': uzorak.id }).populate('patient rezultati.labassay').exec(function (err, rezultat) {

                      if (testovi.length < 1) {
                        //console.log("Za uzorak :" + rezultat.id + " ne postoji niti jedan rerun zahtjev!");

                      } else {
                        rezultat.status = "U OBRADI"
                        rezultat.save(function (err) {
                          if (err) {
                            console.log("Greška:", err);

                          } else {

                          }
                        });
                        
                        console.log("Kreiram Record: ");   
                      }

                    })
                  })// uzorak end
                });
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
