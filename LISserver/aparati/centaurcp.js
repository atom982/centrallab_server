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

  
          record.forEach(function(element) {
              record_type =element.charAt(0);
              switch (record_type) {
                          case 'H':
                                    console.log("header");
                                    var header= element.split("|");
                                    var sender=header[4].split("^");
                                    sn='251025';
                                    vrijeme_prijenosa=header[13];
                                    console.log(vrijeme_prijenosa);
                                    break;
                          case 'P':
                                    console.log("patient");
                                    var patient= element.split("|");
                                    gender=patient[8];
                                    //sid = patient[2];
                                    console.log("gender:"+gender);
                                    break;
                          case 'O':
                            var order = element.split("|");
                            sid = order[2];
                            console.log("SID: " + sid);
                                    break;
                          case 'R':
                                    

                                    Samples.findOne({id: sid}).populate('patient tests.labassay').exec(function (err, uzorak) {
                                        if (err) {
                                          console.log("Greška:", err);
                                        }
                                        else {
                                              //-----------------------
                                              if(uzorak===null){
                                                  console.log('U LIS-u ne postoji unesen order za uzorak broj:'+sid);
                                              }else{
                                              var sekc = uzorak.tests[0].labassay.sekcija
                                              console.log(" Uzorak pronadjen");
                                              if (uzorak.status != "OBRAĐEN"){
                                                result = element.split("|");
                                                chunks=result[2].split("^");
                                                if(chunks[7]==="DOSE"){
                                                    sifra_p=chunks[3];
                                                }else{
                                                    sifra_p="N/A RLU "+result[3];
                                                }
                                                
                                                if(!isNaN(result[3])){
                                                       var rezultat_f = parseFloat(result[3]).toFixed(2);

                                                       if(result[6] == "<"){
                                                        rezultat_f = "< " + parseFloat(result[3]).toFixed(2)
                                                       }

                                                    }else{
                                                         var rezultat_f = result[3]

                                                         if(result[6] == "<"){
                                                          rezultat_f = "< " + result[3]
                                                         }

                                                         }

                                                jedinice_f = result[4];
                                                vrijeme_rezultata=result[12];
                                                module_sn='GRADACAC';
                                                chunks=[]
                                                console.log("=====Cuvam sifra "+sifra_p+" rezultat "+rezultat_f+" sa jedinicom "+jedinice_f )
                                                console.log("=====Cuvam sifra "+sifra_p+" rezultat "+result[3]+" sa jedinicom "+result[4] )
                                              AnaAssays.findOne({kod:sifra_p}).populate('test').lean().exec(function (err, test) {
                                                if (err) {
                                                  console.log("Greška:", err);
                                                }
                                                else {
                                                      //---------------------------------------
                                                      //console.log(test)
                                                      var nova_jedinica = jedinice_f

                                                      if(test===null){
                                                        console.log('U LIS-u ne postoji definisan test sa sifrom:'+sifra_p+' ni na jednom aparatu'+sn);
                                                      }else{
                                                      uzorak.tests.forEach(elementu => {   
                                                                                                       
        if((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "ZAPRIMLJEN")|| (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI")|| (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)){//elementu.status_r)){
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
                                                          console.log("Cuvam sifra "+sifra_p+" rezultat "+rezultat_f+" sa jedinicom "+nova_jedinica )
                                                          console.log("Cuvam sifra "+sifra_p+" rezultat "+result[3]+" sa jedinicom "+result[4] )
                                                          rezultat.rezultat_f=rezultat_f
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
                                                                    console.log(':: Dosao test sa Centaur CP: ' + elementu.labassay.naziv)
     
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
                                              });
                                            }
                                          }
                                        }
                                      });    

  
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
    },
  
    parsaj_query: function(record,serijski,callback){
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
        var sids  =[]
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
                                  sids  =json.sid.split("\\")
                                  console.log(sids)
                                  //'Q|1|^S032B40715\\S033B40715^|^^|ALL^^^||||||||O'
                                  json.request_type = query_arr[12];
                                  console.log('query za sid:'+json.sid);
                                  break;
                        case  'L':
                                  console.log("terminator");
                                  var testovi = [];
                                  var i = 1
                                  header='H|\\^&|||'+"ATOM"+'|||||ACCP1||P|1'//+'\u000D';//\\^&
                                  // H|\\^&|||GRADACAC|Flanders^New^Jersey^07836||973-927-2828|N81|||P|1|20220630112116
                                  recordret.push(header);
                                  sids.forEach(querysid => {
                                    console.log("Prolaz "+querysid)
                                  
                                  Samples.findOne({id: querysid}).populate('patient tests.labassay').exec(function (err, uzorak) {
                                    if (err) {
                                      console.log("Greška:", err);
                                    }
                                    else {
                                          if(uzorak===null){
                                            console.log("U LIS-u ne postoji uzorak sa brojem:"+querysid);
                                            recordret = []
                                            callback(recordret); 
                                          }else{
                                                var tests = '';
                                                var counter =0;
                                                var uzoraklength=uzorak.tests.length;
                                                console.log("Pronasao uzorak "+uzorak.id)
                                                AnaAssays.find({}).populate('aparat test').lean().exec(function (err, anaassays) {
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
                                                      console.log("Za uzorak :"+querysid+" ne postoji niti jedan rerun zahtjev");
                                                      // H|\\^&|||ATOM|||||ACCP1||P|1
                                                      header='H|\\^&|||'+"ATOM"+'|||||ACCP1||P|1'+'\u000D';//\\^&
                                                      recordret.push(header);
                                                      // Q|1|^SID10768||ALL||||||||O
                                                      var query = 'Q|1|^'+querysid+'||ALL||||||||O'+'\u000D'
                                                      recordret.push(query);
                                                      //L|1|I<CR>
                                                      var terminator = 'L|1|I'+'\u000D';
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
                                                      var patient ='P|'+i+'|'+rezultat.patient.jmbg+'|'+'|'+'|'+ime//+'\u000D';
                                                      recordret.push(patient);
                                                      stype = querysid.substring(0,1)
                                                      console.log(stype)
                                                      var order =''
                                                      switch (stype) {
                                                        case 'K':
                                                          order = 'O|'+i+'|'+querysid+'^01||'+tests//+'\u000D';
                                                                console.log('WHOLE BLOOD')
                                                          break;
                                                        case 'U':
                                                          order = 'O|'+i+'|'+querysid+'||'+tests//+'\u000D';
                                                          break; 
                                                        case 'P':
                                                          order = 'O|'+i+'|'+querysid+'||'+tests//+'\u000D';
                                                          break;                                                    
                                                        default:
                                                            //     O|1|REQ1241||^^^T3\^^^T4\^^^TSH|R||||||||||||||||||||O\Q 

                                                          order = 'O|'+i+'|'+querysid+'||'+tests//+'\u000D';
                                                                console.log('DEFAULT SERUM')
                                                          break;
                                                      }
                                                      recordret.push("Dodajem pacijenta "+ ime +":"+order);
                                                      recordret.push(order);
                                                      i++
                                                    }
  
                                                  })                  
                                                })
                                          } // else if uzorak null
  
                                    }
                                  });
                                  console.log("petlja "+i)
                                  console.log("petlja sids "+sids.length)
                                  console.log(recordret)
                                  if(sids.length = i){
                                    var terminator = 'L|1|F'//'\u000D';
                                    recordret.push(terminator);
                                    header = ''
                                    callback(recordret);
                                  }
                                   
                                });
                                  break;
                        default:
  
                            console.log("Nepoznat tip frame-a");
  
              }
          });
    },
  
    };
  