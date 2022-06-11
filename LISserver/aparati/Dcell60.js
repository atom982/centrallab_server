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
      var datum = ''
      var sid = '';
      var qc = false
      var type_of_r='';
      var analit='';
      var analit_rez = ''
      var rezultati = []
      var vrijeme_rezultata='';
      var module_sn='';
      var mode = ''
      var unit_type = ''
            console.log(record)
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

                          case 'R':

                                    console.log("rezultat");
                                    sid = element.substring(14,24).toUpperCase()
                                    console.log('SID: '+sid)
                                    console.log('WBC:'+element.substring(37,41))
                                    rezultati.push({
                                        analit:'WBC',
                                        analit_rez:parseFloat(element.substring(37,40)+'.'+element.substring(40,41)).toFixed(1),
                                        analit_status:''
                                    })  
                                    rezultati.push({
                                        analit:'LYM',
                                        analit_rez:parseFloat(element.substring(41,44)+'.'+element.substring(44,45)).toFixed(1),
                                        analit_status:''
                                        })    
                                    rezultati.push({
                                        analit:'MID',
                                        analit_rez:parseFloat(element.substring(45,48)+'.'+element.substring(48,49)).toFixed(1),
                                        analit_status:''
                                        })  
                                    rezultati.push({
                                        analit:'GRA',
                                        analit_rez:parseFloat(element.substring(49,52)+'.'+element.substring(52,53)).toFixed(1),
                                        analit_status:''
                                        })
                                    rezultati.push({
                                        analit:'LYM%',
                                        analit_rez:parseFloat(element.substring(53,55)+'.'+element.substring(55,56)).toFixed(1),
                                        analit_status:''
                                        })
                                    rezultati.push({
                                        analit:'MID%',
                                        analit_rez:parseFloat(element.substring(56,58)+'.'+element.substring(58,59)).toFixed(1),
                                        analit_status:''
                                        })
                                    rezultati.push({
                                        analit:'GRA%',
                                        analit_rez:parseFloat(element.substring(59,61)+'.'+element.substring(61,62)).toFixed(1),
                                        analit_status:''
                                    })
                                    rezultati.push({
                                        analit:'RBC',
                                        analit_rez:parseFloat(element.substring(62,63)+'.'+element.substring(63,65)).toFixed(2),
                                        analit_status:''
                                    })
                                    rezultati.push({
                                        analit:'HGB',
                                        analit_rez:parseFloat(element.substring(65,68)).toFixed(0),
                                        analit_status:''
                                    })
                                    rezultati.push({
                                        analit:'MCHC',
                                        analit_rez:parseFloat(element.substring(68,72)).toFixed(0),
                                        analit_status:''
                                    })                                    
                                    rezultati.push({
                                        analit:'MCV',
                                        analit_rez:parseFloat(element.substring(72,75)+'.'+element.substring(75,76)).toFixed(1),
                                        analit_status:''
                                    })
                                    rezultati.push({
                                        analit:'MCH',
                                        analit_rez:parseFloat(element.substring(76,79)+'.'+element.substring(79,80)).toFixed(1),
                                        analit_status:''
                                    }) 
                                    rezultati.push({
                                        analit:'RDW',
                                        analit_rez:parseFloat(element.substring(80,82)+'.'+element.substring(82,83)).toFixed(1),
                                        analit_status:''
                                    }) 
                                    rezultati.push({
                                        analit:'HCT',
                                        analit_rez:parseFloat('0.'+element.substring(83,86)).toFixed(3) ,
                                        analit_status:''
                                    })
                                    rezultati.push({
                                        analit:'PLT',
                                        analit_rez:parseFloat(element.substring(86,90)).toFixed(0),
                                        analit_status:''
                                    })  
                                    rezultati.push({
                                        analit:'MPV',
                                        analit_rez:parseFloat(element.substring(90,92)+'.'+element.substring(92,93)).toFixed(1),
                                        analit_status:''
                                    }) 
                                    // rezultati.push({
                                    //     analit:'PDW',
                                    //     analit_rez:element.substring(93,95)+'.'+element.substring(95,96),
                                    //     analit_status:''
                                    // }) 
                                    // rezultati.push({
                                    //     analit:'PCT',
                                    //     analit_rez:'0.'+element.substring(96,99),
                                    //     analit_status:''
                                    // }) 
                                    // rezultati.push({
                                    //     analit:'RDW-SD',
                                    //     analit_rez:element.substring(99,102)+'.'+element.substring(102,103),
                                    //     analit_status:''
                                    // }) 
                                    rezultati.forEach(element => {
                                        element.analit_rez =element.analit_rez.replace(/^0+/, '')
                                        if(element.analit_rez.substring(0, 1) == "."){
                                            element.analit_rez ='0'+element.analit_rez
                                        }
                                    });
                                    console.log(rezultati)
                                    console.log("terminator"); 
                                    console.log(rezultati.length)  
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

                                            //parseFloat("123.456").toFixed(2)
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
                                            console.log('k')
                                            console.log(k)
                                            if(k >= rezultati.length){
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
    };
  