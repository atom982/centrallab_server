module.exports = {

    parsaj_rezultat: function(record,io){
  
      var mongoose = require("mongoose");
      
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
  
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
  
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");
  
 

      var LabAssays = require("../../models/Postavke");
      var LabAssays = mongoose.model("LabAssays");
      
  
      var sn='';
      var sifra_p='';
      var vrijeme_prijenosa='';
      var sid = '';
      var qc = false
      var type_of_r='';
      var analit='';
      var analit_rez = ''
      var rezultati = []
      var vrijeme_rezultata='';
      var module_sn='';
  
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
                                      sn=sender[2];
                                    }
                                    break;
                          case 'P':
                                    console.log("patient");
                                    var patient= element.split("|");
                                    
                                    console.log("patient sequence number:"+patient[1]);
                                    break;
                          case 'O':
                                    console.log("order");
                                    var order = element.split("|");
                                    sid = order[2];
                                    console.log("sid:"+sid);
                                    break;
                          case 'R':
                                    console.log("rezultat");
                                    var result = element.split("|");
                                    var chunks=result[2].split("^^^");
                                    type_of_r=result[8];
                                    console.log("type:"+type_of_r);
                                    switch (type_of_r) {
                                                   case 'F':
                                                            sifra_p=chunks[1];
                                                            vrijeme_rezultata=result[11];
                                                            module_sn=result[13].trim();

                                                            analit=chunks[2];
                                                            if(result[3].charAt(0) === '.'){
                                                              analit_rez = '0'+result[3];
                                                            }else{
                                                              analit_rez = result[3];
                                                            }
                                                            rezultati.push({
                                                              analit:analit,
                                                              analit_rez:analit_rez,
                                                              analit_status:'F'
                                                            })
                                                            break;
                                                   case 'W':
                                                            //console.log("type:"+type_of_r);
                                                            sifra_p=chunks[1];
                                                            vrijeme_rezultata=result[11];
                                                            module_sn=result[13].trim();

                                                            analit=chunks[2];
                                                            if(result[3].charAt(0) === '.'){
                                                              analit_rez = '0'+result[3];
                                                            }else{
                                                              analit_rez = result[3];
                                                            }
                                                            rezultati.push({
                                                              analit:analit,
                                                              analit_rez:analit_rez,
                                                              analit_status:'W'
                                                            })
                                                            break;
                                                   case 'X':
                                                            //console.log("type:"+type_of_r);
                                                            console.log("type:"+type_of_r);
                                                            sifra_p=chunks[1];
                                                            vrijeme_rezultata=result[11];
                                                            module_sn=result[13].trim();

                                                            analit=chunks[2];
                                                            if(result[3].charAt(0) === '.'){
                                                              analit_rez = '0'+result[3];
                                                            }else{
                                                              analit_rez = result[3];
                                                            }
                                                            rezultati.push({
                                                              analit:analit,
                                                              analit_rez:analit_rez,
                                                              analit_status:'X'
                                                            })
                                                            break;
                                                            break;
                                                  default:
                                                            console.log("Nepozanat tip rezultata..");
                                    }
  
                                    break;
                          case 'C':
                                    console.log("komentar");
                                    break;
                          case 'L':
                                    console.log("terminator"); 
                                    //console.log(rezultati)  
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
                                                    console.log('CHECKPOINT FIRST')
                                                    rez.rezultat[0].vrijeme_prijenosa = Date.now()
                                                    rez.rezultat[0].vrijeme_rezultata = vrijeme_rezultata
                                                    rez.rezultat[0].rezultat_f = niz.analit_rez
                                                    rez.rezultat[0].rezultat_i = niz.analit_status
                                                    k++                                                   
                                                  }else{
                                                      if(rez.rezultat[0].module_sn === niz.analit){
                                                        console.log('CHECKPOINT NEXT')
                                                        temp = {}
                                                        temp.anaassay = rez.labassay
                                                        temp.sn = rez.rezultat[0].sn
                                                        temp.vrijeme_prijenosa = Date.now()
                                                        temp.vrijeme_rezultata = vrijeme_rezultata
                                                        temp.dilucija = rez.rezultat[0].dilucija
                                                        temp.module_sn = rez.rezultat[0].module_sn
                                                        temp.reagens_lot=rez.rezultat[0].reagens_lot
                                                        temp.reagens_sn=rez.rezultat[0].reagens_sn
                                                        temp.rezultat_f = niz.analit_rez
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
                                            if(k === rezultati.length+1){
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
  
    parsaj_query: function(record,callback){
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
        console.log('funkcija');
        console.log(record);
        record.forEach(function(element) {
            record_type =element.charAt(0);
            switch (record_type) {
                        case 'H':
                                  console.log("header");
                                  var header= element.split("|");
                                  var sender=header[4].split("^");
                                  json.sn=sender[0].trim();
                                  break;
                        case  'Q':
  
                                  console.log("query");
                                  var query_arr = element.split("|");
                                  json.sequence= query_arr[1];
                                  var range_arr=query_arr[2].split("^");                                
                                  json.sid = range_arr[1];
                                  console.log(json.sid);
                                  break;
                        case  'L':
                                  console.log("terminator");
                                  
                                  if(json.sid ==="ALL"){
                                    Samples.find({status: 'ZAPRIMLJEN'}).populate('tests.labassay').exec(function (err, uzorci) {
                                      if (err) {
                                        console.log("Greška:", err);
                                      }
                                      else {
                                            if(uzorci.length){
                                              var header='H|\\^&||||||||||P|1';
                                              recordret.push(header);
                                              var patient ='P|1|||||||';
                                              recordret.push(patient);
                                              var order = ''
                                              var i = 0
                                              uzorci.forEach(uzorak => {
                                                console.log('nadjen uzorak:')
                                                i=0
                                                uzorak.tests.forEach(test => {
                                                  i++
                                                  test.status_t = 'U OBRADI'
                                                  AnaAssays.findOne({test:test.labassay}).populate('test aparat').exec(function (err, anatest) {
                                                    if (err) {
                                                      console.log("Greška:", err);
                                                    }
                                                    else {
                                                          if(anatest){
                                                            console.log('pronadjen anaassay')
                                                           if(anatest.aparat.sn === json.sn){
                                                            uzorak.status = "U OBRADI"
                                                            order = 'O|1|'+uzorak.id+'||^^^CBC^5^0|||||||N||||||||||||||';
                                                            recordret.push(order); 
                                                            test.status_t = 'U OBRADI'
                                                            test.status_r = false
                                                            console.log('test za cd ruby')
                                                           }
                                                            if(uzorak.tests.length === i){
                                                              var terminator = 'L|1|N';
                                                              recordret.push(terminator);
                                                              uzorak.save() 
                                                              callback(recordret);  
                                                            } 
                                                          }else{
                                                            console.log('nije pronadjen anaassay')
                                                          }
                                                        }
                                                    })
                                                }); 
                                              }); 
                                            }else{
                                              console.log("nema nijedan uzorak sa statusom ZAPRIMLJEN");
                                            }
                                          }
                                        })
                                  }else{
                                    Samples.findOne({id:json.sid}).populate('tests.labassay').exec(function (err, uzorak) {
                                      if (err) {
                                        console.log("Greška:", err);
                                      }
                                      else {
                                            var i = 0
                                            var header = ''
                                            var patient = ''
                                            var order = ''  
                                            var terminator = ''
                                            if(uzorak){
                                              console.log('nadjen uzorak:')
                                              uzorak.status = "U OBRADI"
                                              uzorak.tests.forEach(test => {
                                                i++
                                                AnaAssays.findOne({test:test.labassay}).populate('test aparat').exec(function (err, anatest) {
                                                  if (err) {
                                                    console.log("Greška:", err);
                                                  }
                                                  else {
                                                        if(anatest){
                                                          console.log('pronadjen anaassay')
                                                         if(anatest.aparat.sn === json.sn){
                                                          header='H|\\^&||||||||||P|1';
                                                          recordret.push(header);
                                                          patient ='P|1|||||||';
                                                          recordret.push(patient);
                                                          order = 'O|1|'+json.sid+'||^^^CBC^5^0|||||||N||||||||||||||';
                                                          recordret.push(order); 
                                                          terminator = 'L|1|N';
                                                          recordret.push(terminator);
                                                          test.status_t = 'U OBRADI'
                                                          test.status_r = false
                                                          console.log('test za cd ruby')
                                                         }else{

                                                         }
                                                          if(uzorak.tests.length === i){
                                                            uzorak.save() 
                                                            callback(recordret);  
                                                          } 
                                                        }else{
                                                          console.log('nije pronadjen anaassay')
                                                        }
                                                      }
                                                  })
                                                
                                              });     
                                            }else{
                                              console.log('nije nadjen uzorak:')
                                              console.log("U LIS-u ne postoji uzorak sa brojem:"+json.sid);
                                              var header='H|\\^&||||||||||P|1';
                                              recordret.push(header);
                                              var query = 'Q|1|^'+json.sid+'||^^^ALL||||||||X'
                                              recordret.push(query);
                                              var terminator = 'L|1|N';
                                              recordret.push(terminator);
                                              callback(recordret);
                                            }
                                          }
                                        })
                                  }
                                  break;
                        default:
  
                            console.log("Nepoznat tip frame-a");
  
              }
          });
    },
  
    };
  