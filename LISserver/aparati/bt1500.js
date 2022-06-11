module.exports = {

    parsaj_rezultat: function(record,io){
  
      var mongoose = require("mongoose");
      
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
  
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
  
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");
  

  
      var calculated = require("../../funkcije/calculated/calculated");
      
  
      var sn='';
      var sifra_p='';
      var vrijeme_prijenosa='';
      var gender='';
      var sid = '';
      var qc = false
      var type_of_r='';
      var dilucija='';
      var reagens_lot ='';
      var reagens_sn ='';
      var rezultat_f = '';
      var jedinice_f = '';
      var vrijeme_rezultata='';
      var module_sn='';
  
      var spol='';
      var jmbg=''; 
      var tpsa = "";
      var fe = "";
     
      var result = [];
      var chunks=[];
      var rezultati = []

      console.log('Result Parser: ');
    console.log(record);
          record.forEach(function(element) {
              record_type =element.charAt(0);
              switch (record_type) {
                          case 'H':
                                    console.log("header");
                                   
                                    sn='BTCT';
                                    vrijeme_prijenosa=Date.now();
                                    break;
                          case 'R':
                                    console.log("rezultat");
                                    sid = element.substring(2,17).trim()
                                    console.log('sid')
                                    console.log(sid)
                                    serijski = '5c71b6f5c599d9279717a334'
                                    
                                    var nrReps =element.substring(19,22)
                                    var temp = []
                                    //console.log(sid)
                                    //sid = "S002S90309" //izbrisati
                                    
                                    for (let index = 0; index < parseInt(nrReps); index++) {
                                      temp.push('R|'+sid+"|"+element.substring(22+index*11,22+index*11+11))  
                                    }
                                    var priv = []
                                    var tmpkod = ''
                                    var tmprez = ''
                                    var sign = ''
                                    temp.forEach(element => {//R|S003C90417| HOL5.10000
                                      priv = element.split('|')
                                      tmpkod = priv[2].substring(0,4).trim()
                                      tmprez = priv[2].substring(4,13).trim()
                                      sign = priv[1].substring(0,1)
                                      if(tmpkod ==='AUR'){
                                        tmpkod ='AUR'+sign
                                      }
                                      rezultati.push({kod:tmpkod,rezultat:tmprez})
                                    });
                                    console.log(temp)
                                    console.log(rezultati)
                                    break;

                          case 'L':        
                                    

                                    Samples.findOne({id: sid}).populate('patient tests.labassay').exec(function (err, uzorak) {
                                        if (err) {
                                          console.log("Greška:", err);
                                        }
                                        else {
                                              //-----------------------
                                              if(uzorak===null){
                                                  console.log('U LIS-u ne postoji unesen order za uzorak broj:'+sid);
                                                  io.emit('kompletiran', sid, undefined, undefined, undefined, undefined)  
                                              }else{
                                              var sekc = uzorak.tests[0].labassay.sekcija
                                              console.log(" Uzorak pronadjen");
                                              if (uzorak.status != "OBRAĐEN"){
                                                result = element.split("|");                                           
                                                sifra_p=result[2].substring(0,4).trim();
                                                var rezultat_f = result[2].substring(4,12).replace(/0+$/,'')

                                                // Salko, 16.04.2019

                                                if (!isNaN(rezultat_f)) {
                                                  rezultat_f = parseFloat(rezultat_f).toFixed(2);
                                                } else {
                                                  rezultat_f = rezultat_f
                                                }
                                               rezultati.forEach(instance => {
                                                 
                                               
                                              AnaAssays.findOne({kod:instance.kod}).populate('test').lean().exec(function (err, test) {
                                                if (err) {
                                                  console.log("Greška:", err);
                                                }
                                                else {
                                                      //---------------------------------------
                                                      //console.log(test)
                                                      if(test===null){
                                                        console.log('U LIS-u ne postoji definisan test sa sifrom:'+sifra_p+' ni na jednom aparatu'+sn);
                                                      }else{
                                                      uzorak.tests.forEach(elementu => {   
                                                                                                       
        if((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") || (elementu.labassay.sifra.trim() === test.test.sifra.trim()) && (test.status_r === true)){
                                                          console.log('match pronadjen')
                                                          //console.log(elementu)
                                                          elementu.status_t = "REALIZOVAN"
                                                          elementu.status_r = false
                                                          var rezultat={};
                                                          rezultat.anaassay = test
                                                          rezultat.sn = sn
                                                          rezultat.vrijeme_prijenosa=vrijeme_prijenosa
                                                          rezultat.vrijeme_rezultata=vrijeme_rezultata
                                                          rezultat.dilucija='dilucija'
                                                          rezultat.module_sn=module_sn
                                                          rezultat.reagens_lot='reagens_lot'
                                                          rezultat.reagens_sn='reagens_sn'
                                                          if (!isNaN(instance.rezultat)) {
                                                            rezultat.rezultat_f= parseFloat(instance.rezultat).toFixed(2);
                                                          } else {
                                                            rezultat.rezultat_f= instance.rezultat
                                                          }
                                                          rezultat.jedinice_f=test.test.jedinica
                                                          rezultat.rezultat_p='rezultat_p'
                                                          rezultat.jedinice_p='jedinice_p'
                                                          rezultat.rezultat_i='rezultat_i'
                                                          rezultat.odobren=false
                                                          var json ={};
                                                          json.labassay = test.test
                                                          json.rezultat = []
                                                          json.rezultat.push(rezultat)
                                                          Results.findOne({id: uzorak.id}).populate('rezultati rezultati.labassay patient').exec(function (err, result) {
                                                            if (err) {
                                                              console.log("Greška:", err)
                                                            }
                                                            else {
                                                              if(result.created_at === null){
                                                                result.created_at = Date.now()
                                                              }
                                                              spol = result.patient.spol
                                                              jmbg = result.patient.jmbg
                                                              //console.log(result)
                                                              var counter = 0
                                                              result.rezultati.forEach(element => {
                                                                counter++
                                                                if((element.labassay.sifra ===test.test.sifra) && (element.retest = true)){
                                                                  
                                                                  element.retest = false // ne postavljati ovdje, nego kada dodje rezultat
                                                                  result.updated_at = Date.now()
                                                                  element.rezultat.push(rezultat) 
                                                                  
                                                                  uzorak.status = "U OBRADI"
                                                                  if(element.rezultat.length < 1){
                                                                    element.status = "NIJE ODOBREN"
                                                                  }
                                                                  if(element.status !="ODOBREN"){
                                                                    element.status = "NIJE ODOBREN"                                                             
                                                                    uzorak.save()
                                                                    var received = elementu.labassay.naziv
                                                                    console.log(':: Dosao test sa BT 1500: ' + elementu.labassay.naziv)
     
                                                                    result.save(function(err,novi) {
                                                                      if(err) {
                                                                              console.log("Greška:", err);
                                                                      } else {
                                                                        console.log("Rezultat sacuvan") 
                                                                        var komplet = true
                                                                        var formula = []
                                                                        var tocalculate = ''

                                                                        novi.rezultati.forEach(element => {
                                                                            if(!element.rezultat.length){
                                                                              komplet = false
                                                                            }
                                                                            if((element.retest)){
                                                                              komplet = false
                                                                            }
                                                                            if(element.labassay.calculated){
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
                                                                                    if (rez.labassay.equals(mongoose.Types.ObjectId(required.labassay))){                                                                                      
                                                                                      formula = element.labassay.calculatedFormula
                                                                                      if(rez.rezultat.length > 0){
                                                                                       // arr.forEach((o, i, a) => a[i] = myNewVal) 
                                                                                          formula.forEach((clan,i,array) => {
                                                                                            if(clan.length > 10){
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
                                                                                            
                                                                                            AnaAssays.findOne({test:element.labassay._id}).populate('aparat test').exec(function (err, testap) {
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
                                                                                                  anaassay:testap._id,
                                                                                                  // rezultat_f:eval(final).toFixed(2),
                                                                                                  rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'BT 1500'),
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
                                                                                                uzorak.save()
                                                                                                novi.save()
                                                                                                console.log('izvrsen')
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
                                                                        if(komplet){
                                                                          io.emit('kompletiran', novi.id, uzorak.site, sekc, result, novi)                                                                       
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
                                              });
                                            });   // for each rezultati
                                            }
                                          }
                                        }
                                      });    

  

                                    console.log("terminator");
                             
                                    break;
                          default:
                                    console.log("Nepozanat tip frame-a..");
                            }
          });
    },
  
    parsaj_query: function(record,site,aparat,callback){

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
        case '5c69f68c338fe912f99f833b':
        definisaniTestovi=defsTests.s_bt1500
        lokacija ="Stup"
        break;   
        case '5c6b34d4c6543501079f488b':
        definisaniTestovi=defsTests.t_bt1500
        lokacija ="Travnik"
        break;   
        
      default:
      lokacija ="Nije definisana loakcija"
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
            site: mongoose.Types.ObjectId(site)
          }
            var testovi = [];
            
            //console.log('uslov:'+uslov)
            //.sort({created_at: 1})//--- 1 for asc and -1 for desc
              
            
            Samples.find(uslov).populate('tests.labassay').sort({created_at: 1}).exec(function (err, uzorci) {
              if (err) {
                console.log("Greška:", err);
              }
              else {
                if (!uzorci.length) {
                  console.log("U LIS-u ne postoje uneseni uzorci za "+lokacija);
                } else {
                  uzorci.forEach(uzorak => {
                         
                  AnaAssays.find({aparat:mongoose.Types.ObjectId(aparat)}).populate('aparat test').lean().exec(function (err, anaassays) {
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
                            testovi.push(anaassay.kod)
                            test.status_t = "U OBRADI"
                            test.status_r = false
                          }

                          goesIn = true
                        }
                      })
                    })
                    var tests = '';
                    var sampleType = "S"
                    var cupPosition = ''

                            if(uzorak.id.substring(0,1) ==="U"){
                              sampleType = "U"
                            }else{
                              sampleType = "S"
                            }
                            switch (uzorak.id.substring(0,1)) {
                                  case 'K':
                                          cupPosition = (parseInt(uzorak.id.substring(2,4))+20).toString()
                                          if(cupPosition.length ===1){cupPosition = '0'+cupPosition}
                                    break; 
                                  case 'P':
                                          cupPosition = (parseInt(uzorak.id.substring(2,4))+55).toString()
                                          if(cupPosition.length ===1){cupPosition = '0'+cupPosition}
                                    break; 
                                  case 'U':
                                          cupPosition = (parseInt(uzorak.id.substring(2,4))+40).toString()
                                          if(cupPosition.length ===1){cupPosition = '0'+cupPosition}
                                    break;    
                                  default:
                                          cupPosition = (parseInt(uzorak.id.substring(2,4))).toString()
                                          if(cupPosition.length ===1){cupPosition = '0'+cupPosition}
                                    break;
                                }
                    
                    var nrTests = ''
                    var allTST = ''
                    testovi.forEach(element => {
                      switch (element.length) {
                      case 4: 
                            if(definisaniTestovi.includes(element.trim())){
                            if(element.trim() === 'AURS' || element.trim() === 'AURU'){
                              allTST += ' '+element.substring(0,3)
                                nrTests++
                            }else{
                              allTST += element
                                nrTests++
                              }
                            }  
                        break;
                      case 3: 
                      //console.log('case 3')
                      if(definisaniTestovi.includes(element)){
                        allTST +=  '\u0020'+element
                        nrTests++
                        //console.log('case 3 continued')
                      }
                        break;   
                      case 2: 
                      if(definisaniTestovi.includes(element)){
                        allTST += '\u0020' + '\u0020' +element
                        nrTests++
                      }
                        break;      
                      case 1: 
                      if(definisaniTestovi.includes(element)){
                        allTST += '\u0020' + '\u0020' + '\u0020'+element
                        nrTests++
                      }
                        break;           
                      default:
                        break;
                    }
                      
                    });
                    //console.log('ALL TST:')
                    //console.log(allTST)
                    testovi = []
                   if(nrTests <10){
                    nrTests = '0'+nrTests
                  }else{
                    nrTests = nrTests.toString()
                  }
                  var order = uzorak.id+'     '+'T'+sampleType+'N'+cupPosition
                  order +=nrTests
                  order +=allTST
                    allTST = ''
                    tests = ''
                         var checksum = 0
                        for(var i=0;i<order.length;i++) {
                          checksum += order.charCodeAt(i)
                        }
                        checksum =  checksum % 256

                        if(checksum < 100 && checksum > 9){
                          checksum = ('0'+checksum).toString()
                        }

                        if(checksum < 10){
                          checksum = ('\u0020' + '\u0020' +checksum).toString()
                        }
                        order += checksum
                        if(parseInt(nrTests)){ 
                          
                          recordret.push(order);
                        }
                        
                        order  =''
                        allTST = ''
                        nrTests = 0
                 
                    brojac++
                    uzorak.status = "U OBRADI"
                    uzorak.save()  
                    if(brojac===uzorci.length){
                      if(recordret.length){
                        console.log('Order za slanje na lokaciju:'+lokacija)
                        console.log(recordret)
                        callback(recordret);
                      }
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
  