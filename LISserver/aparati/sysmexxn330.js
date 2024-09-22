module.exports = {

    parsaj_rezultat: function(record,io,serijski){
  
      var mongoose = require("mongoose");
      
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
  
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
  
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");
  
  
      var sn='';
      var sifra_p='';
      var vrijeme_prijenosa='';
      var datum = ''
      var sid = '';
      var test_type = ""
      var qc = false
      var type_of_r='';
      var analit='';
      var analit_rez = ''
      var rezultati = []
      var vrijeme_rezultata='';
      var module_sn='';
      var mode = ''
      var unit_type = ''
  
          record.forEach(function(element) {
              record_type =element.charAt(0);
              switch (record_type) {
                          case 'H':
                                    console.log("header");
                                    var header= element.split("|");
                                    var sender=header[4].split("^");
                                    if(sender[1]==="CDRuby"){
                                      sn = sender[0].trim()
                                    }else{
                                      sn=sender[5];
                                    }
                                    break;
                          case 'O':
                                    console.log("order");
                                    var header= element.split("|");
                                    var order=header[3].split("^");
                                    if (typeof  order[2] !== 'undefined') {
                                      // the variable is defined
                                      sid = order[2].trim()
                                  }
                                    
                                    test_type = element.split("\\");
                                    console.log('TEST TYPE:'+test_type.length)
                                    //sid = "K002Z00810"
                                    sifra_p='KKS5'
                                    break;
                          case 'R':
                                    var result = element.split("|");
                                    var datum = result[12].substring(0,9)
                                    var vrijeme = result[12].substring(9,9)
                                    vrijeme_rezultata=datum
                                     rezultati.push({
                                      analit:result[2].split("^")[4],
                                      analit_rez: result[3].includes("--") ? "" : result[3].trim(),
                                      analit_status:''
                                    })        
                                   
                                    break;
                          case 'C':
                                    console.log("komentar");
                                    break;
                          case 'L':
                                    console.log("terminator"); 
                                    console.log(sid)
                                    console.log(rezultati)  
                                    console.log(rezultati.length)
                                    var provjera = 15

                                    if(test_type.length > 38){
                                      provjera = 55    
                                    }else{
                                      provjera = 31
                                    }
                                    Results.findOne({id:sid}).populate('aparat').exec(function (err, rezultat) {
                                      if (err) {
                                        console.log("Greška:", err);
                                      }
                                      else {
                                        if(rezultat){
                                          var temp = {}
                                          if(rezultat.multi.length){
                                            var k = 1
                                            var j = 1
                                            var tempRez = []
                                            rezultat.multi.forEach(instance => { // multi rezultat
                                              instance.forEach(rez => { // rez - analit tj. npr wbc od kks
                                                rez.retest = false
                                                rezultati.forEach(niz => {
                                                  j=1
                                                 
                                                  if(rez.rezultat[0].rezultat_f ==="" && rez.rezultat[0].module_sn ===niz.analit){
                                                   
                                                    rez.rezultat[0].vrijeme_prijenosa = Date.now()
                                                    rez.rezultat[0].vrijeme_rezultata = vrijeme_rezultata
                                                    if( niz.analit === 'HGB' || niz.analit === 'MCHC'){
                                                      rez.rezultat[0].rezultat_f = (parseFloat(niz.analit_rez)*10).toFixed(0).toString()
                                                      
                                                    } else if(niz.analit === 'HCT'){
                                                      rez.rezultat[0].rezultat_f = (parseFloat(niz.analit_rez)/100).toFixed(3).toString()
                                                    } else if(niz.analit === 'PCT'){
                                                      rez.rezultat[0].rezultat_f = (parseFloat(niz.analit_rez)/100).toFixed(4).toString()
                                                    } else{
                                                      rez.rezultat[0].rezultat_f= niz.analit_rez
                                                    }
                                                    rez.rezultat[0].rezultat_i = niz.analit_status
                                                    k++                                                   
                                                  }else{
                                                      if(rez.rezultat[0].module_sn === niz.analit){
                                                        temp = {}
                                                        temp.anaassay = rez.labassay
                                                        temp.sn = rez.rezultat[0].sn
                                                        temp.vrijeme_prijenosa = Date.now()
                                                        temp.vrijeme_rezultata = vrijeme_rezultata
                                                        temp.dilucija = rez.rezultat[0].dilucija
                                                        temp.module_sn = rez.rezultat[0].module_sn
                                                        temp.reagens_lot=rez.rezultat[0].reagens_lot
                                                        temp.reagens_sn=rez.rezultat[0].reagens_sn
                                                        if(niz.analit === 'HGB'|| niz.analit === 'MCHC' ){
                                                          temp.rezultat_f =(parseFloat(niz.analit_rez)*10).toFixed(0).toString()
                                                          
                                                        } else if(niz.analit === 'HCT'){
                                                          temp.rezultat_f = (parseFloat(niz.analit_rez)/100).toFixed(3).toString()
                                                        } else if(niz.analit === 'PCT'){
                                                          temp.rezultat_f = (parseFloat(niz.analit_rez)/100).toFixed(4).toString()
                                                        } else{
                                                          temp.rezultat_f = niz.analit_rez
                                                        }
                                                        console.log(niz.analit+' : '+temp.rezultat_f )
                                                        temp.jedinice_f = rez.rezultat[0].jedinice_f
                                                        temp.rezultat_p = rez.rezultat[0].rezultat_p
                                                        temp.jedinice_p = rez.rezultat[0].jedinice_p
                                                        temp.rezultat_i = niz.analit_status
                                                        temp.odobren = false
                                                        temp.created_at = rez.rezultat[0].created_at
                                                        temp.created_by = rez.rezultat[0].created_by
                                                        rez.rezultat.unshift(temp)
                                                        k++
                                                      }   
                                                  }
                                                });
                                              });
                                            });
                                            // rezultati length za KKS 5 = 43
                                            // rezultati length za KKS 3 = 26
                                            console.log('k iteracija')
                                            console.log(k)
                                            if( k>26){
                                              console.log("KKS 5")
                                              rezultat.controlmulti = true
                                              console.log('prije cuvanja')
                                              //console.log(rezultat.multi)
                                              var novi = new Results(rezultat);
                                              novi.save(function(err,novirez) {
                                                if(err) {
                                                  console.log("Greška:", err);
                                                } else {
                                                   console.log("Rezultat uspješno sačuvan.");
                                                   Samples.findOne({id:sid}).populate('tests.labassay').exec(function (err, uzorak) {
                                                    if (err) {
                                                      console.log("Greška:", err);
                                                    }
                                                    else {
                                                      if(uzorak){
                                                        var i = 0
                                                        uzorak.status = "REALIZOVAN"
                                                        var sekc = uzorak.tests[0].labassay.sekcija
                                                        uzorak.tests.forEach(test => {
                                                          i++

                                                          AnaAssays.findOne({test:test.labassay}).populate('test aparat').exec(function (err, anatest) {
                                                            if (err) {
                                                              console.log("Greška:", err);
                                                            }
                                                            else {
                                                                  if(anatest){
                                                                    
                                                                   if(anatest.aparat.sn === sn){
                                                                    test.status_t = 'REALIZOVAN'

                                                                   }
                                                                   if(test.status_t != 'REALIZOVAN' && test.status_t != 'OBRAĐEN' && test.status_t != 'NIJE ODOBREN'){
                                                                    uzorak.status = "U OBRADI"
                                                                  }
                                                                    if(uzorak.tests.length === i){
                                                                      uzorak.save() 
                                                                      if(uzorak.status === "REALIZOVAN"){
                                                                        novirez.status = "NIJE ODOBREN"
                                                                      }else{
                                                                        novirez.status = uzorak.status
                                                                      }
                                                                      novirez.rezultati.forEach(rezu => {
                                                                        if(rezu.labassay.equals(test.labassay._id) && test.labassay.multi){
                                                                          rezu.status = "NIJE ODOBREN"
                                                                          rezu.rezultat[0].rezultat_f = '0' // !!!
                                                                        }
                                                                      });
                                                                      novirez.save()                                                                      
                                                                      io.emit('kompletiran',novirez.id, uzorak.site, sekc) 
                                                                    } 
                                                                  }else{
                                                                    console.log('nije pronadjen anaassay')
                                                                  }
                                                                }
                                                            })
                                                        });
                                                      }
                                                    }
                                                  })
                                                }
                                              })
                                            }
                                            if(provjera === 31 && k>13){
                                              console.log("KKS 3")
                                              rezultat.controlmulti = true
                                              console.log('prije cuvanja')
                                              //console.log(rezultat.multi)
                                              var novi = new Results(rezultat);
                                              novi.save(function(err,novirez) {
                                                if(err) {
                                                  console.log("Greška:", err);
                                                } else {
                                                   console.log("Rezultat uspješno sačuvan.");
                                                   Samples.findOne({id:sid}).populate('tests.labassay').exec(function (err, uzorak) {
                                                    if (err) {
                                                      console.log("Greška:", err);
                                                    }
                                                    else {
                                                      if(uzorak){
                                                        var i = 0
                                                        uzorak.status = "REALIZOVAN"
                                                        var sekc = uzorak.tests[0].labassay.sekcija
                                                        uzorak.tests.forEach(test => {
                                                          i++

                                                          AnaAssays.findOne({test:test.labassay}).populate('test aparat').exec(function (err, anatest) {
                                                            if (err) {
                                                              console.log("Greška:", err);
                                                            }
                                                            else {
                                                                  if(anatest){
                                                                    
                                                                   if(anatest.aparat.sn === sn){
                                                                    test.status_t = 'REALIZOVAN'

                                                                   }
                                                                   if(test.status_t != 'REALIZOVAN' && test.status_t != 'OBRAĐEN' && test.status_t != 'NIJE ODOBREN'){
                                                                    uzorak.status = "U OBRADI"
                                                                  }
                                                                    if(uzorak.tests.length === i){
                                                                      uzorak.save() 
                                                                      if(uzorak.status === "REALIZOVAN"){
                                                                        novirez.status = "NIJE ODOBREN"
                                                                      }else{
                                                                        novirez.status = uzorak.status
                                                                      }
                                                                      novirez.rezultati.forEach(rezu => {
                                                                        if(rezu.labassay.equals(test.labassay._id)){
                                                                          rezu.status = "NIJE ODOBREN"
                                                                          rezu.rezultat[0].rezultat_f = '0' // !!!
                                                                        }
                                                                      });
                                                                      novirez.save()                                                                      
                                                                      io.emit('kompletiran',novirez.id, uzorak.site, sekc) 
                                                                    } 
                                                                  }else{
                                                                    console.log('nije pronadjen anaassay')
                                                                  }
                                                                }
                                                            })
                                                        });
                                                      }
                                                    }
                                                  })
                                                }
                                              })

                                            }
                                          }
                                        }
                                      }
                                    })

                                    break;
                          default:
                                    console.log("Nepozanat tip frame-a..");
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
   
  
   
  
        var record_type='';
        var json = {};
        var testovi=[];
        var recordret =[];
        var dilution = ''
        var stype = ''
        var ime = ''
        var header = ''
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
             pad2(date.getHours() - 2) +
             pad2(date.getMinutes()) +
             pad2(date.getSeconds());
     } 
        record.forEach(function(element) {
            record_type =element.charAt(0);
            switch (record_type) {
                        case 'H':
                                  header= element.split("|");
                                  json.sn='SY15854';
                                  json.vrijeme_prijenosa=header[13];
                                  break;
                        case  'Q':     
                                  var query_arr = element.split("|");
                                  json.sid = query_arr[2].split("^")[2].trim();
                                  json.request=query_arr[2]
                                  console.log('query za sid:'+json.sid);
                                  break;
                        case  'L':
                                  console.log("terminator");
                                  console.log(json);
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
                                                
                                                AnaAssays.find({}).populate('aparat test').lean().exec(function (err, anaassays) {
                                                  uzorak.tests.forEach(function(test) {
                                                    anaassays.forEach(function(anaassay) { 
                                                      if( (anaassay.test.sifra === test.labassay.sifra)  && (anaassay.test.calculated)){
                                                        test.status_t = "U OBRADI"
                                                      }
                      if(( (anaassay.test.sifra === test.labassay.sifra)&&(test.status_r ===true)) ||((anaassay.test.sifra === test.labassay.sifra)&&(test.status_t ==="ZAPRIMLJEN"))||((anaassay.test.sifra === test.labassay.sifra)&&(test.status_t ==="U OBRADI"))){
                                                          testovi.push(anaassay.kod)
                                                          
                                                          test.status_t = "U OBRADI"
                                                       }
                                                    })
                                                  })
                                                  testovi.forEach(element => {
                                                      counter++;
                                                      if(counter<testovi.length){
                                                              tests+= element+'^'+element+'~';
                                                        }else{
                                                              tests+= element+'^'+element;                                                              
                                                        }
                                                  });
                                                  Results.findOne({'id':uzorak.id}).populate('patient rezultati.labassay').exec(function (err, rezultat) { 
  
                                                    if(testovi.length < 1){
                                                      console.log("Za uzorak :"+json.sid+" ne postoji niti jedan rerun zahtjev");
                                                      header='H|`^&|||atom-lis';
                                                      recordret.push(header);
                                                      var query = 'Q|1|^'+json.sid+'||^^^ALL||||||||X'
                                                      recordret.push(query);
                                                      var terminator = 'L|1|N';
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
                                                      //H|\^&|||||||||||E1394-97
                                                      header='H|\^&|||||||||||E1394-97'//+makedate(new Date())
                                                      recordret.push(header);
                                                      //recordret.push(header);replaced = str.replace(/ /g, '+');
                                                      var prezime = rezultat.patient.prezime
                                                      var rime = rezultat.patient.ime
                                                      var spol = rezultat.patient.spol
                                                      var birthdate = makedob(rezultat.patient.jmbg)
                                                      if(spol ==="MUŠKI"){
                                                        spol = "M"
                                                      }else{
                                                        spol = "F"
                                                      }
                                                      if(prezime.length > 20){
                                                        prezime = rezultat.patient.prezime.substring(0,19)
                                                      }
                                                      if(rime.length > 20){
                                                        rime = rezultat.patient.ime.substring(0,19)
                                                      }
                                                      ime = rime +'^'+ prezime
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
                                                    
                                                      var patient ='P|1|||'+uzorak.pid+'|^'+ime+"||"+birthdate+"|"+spol+'|||||^Dr. N||||||||||||^^^DZB'
                                                      //P|1|||100|^Carol^Thomas||20010820|F|||||^Dr. N||||||||||||^^^Eas
                                                      console.log(tests)
                                                      recordret.push(patient);
                                                      if(tests.includes("DIFF")) {
                                                        console.log("TRAZIM DIFERENCIJALNU")
                                                        // host code = "DIFF"
                                                        //tests="WBC~RBC~HGB~HCT~MCV~MCH~PLT~RDW-SD~RDW-CV~PDW~MPV~P-LCR~PCT~NEUT#~LYMPH#~MONO#~EO#~BASO#~NEUT%~LYMPH%~MONO%~EO%~BASO%~IG#~IG%"
                                                        tests='^^^^WBC\\^^^^RBC\\^^^^HGB\\^^^^HCT\\^^^^MCV\\^^^^MCH\\^^^^MCHC\\^^^^PLT\\^^^^RDW-CV\\^^^^PDW\\^^^^MPV\\^^^^P-LCR\\^^^^PCT\\^^^^NEUT#\\^^^^LYMPH#\\^^^^MONO#\\^^^^EO#\\^^^^BASO#\\^^^^NEUT%\\^^^^LYMPH%\\^^^^MONO%\\^^^^EO%\\^^^^BASO%\\^^^^IG#\\^^^^IG%'
                                                        //tests="WBC^~RBC^~HGB^~HCT^~MCV^~MCH^~PLT^~RDW-SD^~RDW-CV^~PDW^~MPV^~P-LCR^~PCT^"
                                                      }else{
                                                        console.log("TRAZIM BEZ DIFERENCIJALA") 
                                                        // host code = "CBC"
                                                        tests="^^^^WBC\\^^^^RBC\\^^^^HGB\\^^^^HCT\\^^^^MCV\\^^^^MCH\\^^^^MCHC\\^^^^PLT\\^^^^RDW-SD\\^^^^RDW-CV\\^^^^PDW\\^^^^MPV\\^^^^P-LCR\\^^^^PCT"
                                                      }                                               
                                                      
                                                      var order = 'O|1|'+json.request+'||'+tests+'||'+makedate(new Date())+'|||||N||||||||||||||Q'
                                                      recordret.push(order);
                                                      // O|1|^^123-4567-890123^C||^^^^WBC\^^^^RBC\····^^^^NEUT#||20010807101000|||||N||||||||||||||Q[CR] 

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
  
                            console.log("Nepoznat tip frame-a");
  
              }
          });
      },
    };
  