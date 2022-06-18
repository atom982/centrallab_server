module.exports = {

    parsaj_rezultat: function(record,io,serijski){
  
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
  
          record.forEach(function(element) {
              record_type =element.charAt(0);
              switch (record_type) {
                          case 'H':
                                    console.log("header");
                                    var header= element.split("|");
                                    var sender=header[4].split("^");
                                    if(sender[0]==="URI2P"){
                                        sn = sender[1].trim()
                                      }
                                    break;
                          case 'O':
                                    console.log("order");
                                    var order= element.split("|");
                                    sid = order[2]
                                    console.log(sid)
                                    break;
                          case 'R':
                                    console.log("rezultat");
                                    //'R|5|5^^^Glu|norm|mg/dl||||||autologin|20190208112929|20190208113034',
                                    //O|1|K001M90208|^^^^SAMPLE||R||||||X|||20190209055710'
                                    var result = element.split("|")[3].split(",")

                                    console.log(result)
                                    
                                    sid = result[5]
                                    console.log(sid)

                                    
                                console.log('Col: '+result[10])
                                console.log("Cla: "+result[11])
                                console.log("GLU: "+result[13])
                                console.log("BIL: "+result[16])
                                //     console.log("LEU: "+result[1].split(',')[13].trim())
                                //     console.log("NIT: "+result[1].split(',')[16].trim())
                                //     console.log("UBG: "+result[1].split(',')[19].trim())
                                //     console.log("PRO: "+result[1].split(',')[22].trim())
                                //     console.log("pH: "+result[1].split(',')[25].trim())
                                //     console.log("BLD: "+result[1].split(',')[28].trim())
                                //     console.log("SG: "+result[1].split(',')[31].trim())
                                //     console.log("KET: "+result[1].split(',')[34].trim())
                               
                                
                                //     console.log("VC: "+result[1].split(',')[43].trim())


                                    // Opšti pregled urina - fizikalno hemijski pregled
                                    // LabAssay ObjectId("5f76fc20c5294a1764bd7134")



                                    // Boja
                                    var Col = ""
                                        Col = result[10]

                                        if (result[10].includes("Yellow")) {

                                           Col = "žuta"
                                          
                                        }

                                    rezultati.push({
                                        analit:'Col',
                                        analit_rez:Col,
                                        analit_jedinica:"",
                                        analit_status:"",
                                      })  
                                      
                                // Izgled
                                    var Cla = ""
                                    Cla = result[11]

                                    if (result[11].includes("Clear")) {

                                      Cla = "bistar"
                                      
                                  }

                                rezultati.push({
                                  analit:'Cla',
                                  analit_rez:Cla,
                                  analit_jedinica:'',
                                  analit_status:"",
                                })   
                                              // Glukoza

                                      var GLU = ""
                                          GLU = result[13]

                                      if (result[13].includes("Negative")) {

                                          GLU = "negativan"
                                          
                                      }else if (result[13].includes("1+")) {
  
                                        GLU = "pozitivan 1+"
                                          
                                      }else if (result[13].includes("2+")) {
  
                                        GLU = "pozitivan 2+"
                                          
                                      }else if (result[13].includes("3+")) {
  
                                        GLU = "pozitivan 3+"
                                          
                                      }else if (result[13].includes("4+")) {
  
                                        GLU = "pozitivan 4+"
                                          
                                      }else {
  
                                        GLU = "Greška"
  
                                      }


                                      rezultati.push({
                                        analit:'GLU',
                                        analit_rez:GLU,
                                        analit_jedinica:"",
                                        analit_status:"",
                                      })  
                                      // Bilirubin

                                      var BIL = result[16]
                                    

                                      if (result[16].includes("Negative")) {

                                        BIL = "negativan"
                                        
                                        }else if (result[16].includes("1+")) {

                                        BIL = "pozitivan 1+"
                                            
                                        }else if (result[16].includes("2+")) {

                                        BIL = "pozitivan 2+"
                                            
                                        }else if (result[16].includes("3+")) {

                                        BIL = "pozitivan 3+"
                                            
                                        }else {

                                        BIL = "Greška"

                                        }   
                                      rezultati.push({
                                        analit:'BIL',
                                        analit_rez:BIL,
                                        analit_jedinica:"",
                                        analit_status:"",
                                      })  

                                //     // pH urina
                                //     var pH = ""
                                //         pH = result[1].split(',')[25].trim()

                                //         if (result[1].split(',')[25].trim().includes("5.0")) {

                                //           pH = "5.0"
                                          
                                //       }else if (result[1].split(',')[25].trim().includes("5.5")) {
  
                                //         pH = "5.5"
                                          
                                //       }else if (result[1].split(',')[25].trim().includes("6.0")) {

                                //         pH = "6.0"
                                        
                                //     }else if (result[1].split(',')[25].trim().includes("6.5")) {

                                //       pH = "6.5"
                                        
                                //     }else if (result[1].split(',')[25].trim().includes("7.0")) {

                                //       pH = "7.0"
                                      
                                //   }else if (result[1].split(',')[25].trim().includes("7.5")) {

                                //     pH = "7.5"
                                      
                                //   }else if (result[1].split(',')[25].trim().includes("8.0")) {
  
                                //         pH = "8.0"
                                          
                                //       }else if (result[1].split(',')[25].trim().includes("8.5")) {
  
                                //         pH = "8.5"
                                          
                                //       }else if (result[1].split(',')[25].trim().includes("9.0")) {
  
                                //         pH = "9.0"
                                          
                                //       }else {
  
                                //         pH = "Error"
  
                                //       }

                                //     rezultati.push({
                                //       analit:'pH',
                                //       analit_rez:pH,
                                //       analit_jedinica:"",
                                //       analit_status:"",
                                //     })  

                                //     // Specifična težina
                                //     var SG = ""
                                //         SG = result[1].split(',')[31].trim()

                                //         if (result[1].split(',')[31].trim().includes("1.000")) {

                                //           SG = "1.000"
                                          
                                //       }else if (result[1].split(',')[31].trim().includes("1.005")) {
  
                                //         SG = "1.005"
                                          
                                //       }else if (result[1].split(',')[31].trim().includes("1.010")) {

                                //         SG = "1.010"
                                        
                                //     }else if (result[1].split(',')[31].trim().includes("1.015")) {

                                //       SG = "1.015"
                                        
                                //     }else if (result[1].split(',')[31].trim().includes("1.020")) {

                                //       SG = "1.020"
                                      
                                //   }else if (result[1].split(',')[31].trim().includes("1.025")) {

                                //     SG = "1.025"
                                      
                                //   }else if (result[1].split(',')[31].trim().includes("1.030")) {
  
                                //     SG = "1.030"
                                          
                                //       }else {
  
                                //         SG = "Error"
  
                                //       }

                                //         rezultati.push({
                                //           analit:'SG',
                                //           analit_rez:SG,
                                //           analit_jedinica:"",
                                //           analit_status:"",
                                //         })
                                        
                                //     // Proteini
                                //     var PRO = ""
                                //         PRO = result[1].split(',')[22].trim()

                                //         if (result[1].split(',')[22].trim().includes("Neg")) {

                                //           PRO = "negativan"
                                          
                                //       }else if (result[1].split(',')[22].trim().includes("0.15")) {
  
                                //           PRO = "0.15"
                                          
                                //       }else if (result[1].split(',')[22].trim().includes("0.3")) {
  
                                //           PRO = "0.3"
                                          
                                //       }else if (result[1].split(',')[22].trim().includes("1.0")) {
  
                                //           PRO = "1.0"
                                          
                                //       }else if (result[1].split(',')[22].trim().includes("3.0")) {
  
                                //           PRO = "3.0"
                                          
                                //       }else {
  
                                //           PRO = "Error"
  
                                //       }
  
                                //         rezultati.push({
                                //           analit:'PRO',
                                //           analit_rez:PRO,
                                //           analit_jedinica:"g/L",
                                //           analit_status:"",
                                //         })  


                        
                                //       // Ketoni

                                //       var KET = ""
                                //           KET = result[1].split(',')[34].trim()

                                //           if (result[1].split(',')[34].trim().includes("Neg")) {

                                //             KET = "negativan"
                                            
                                //         }else if (result[1].split(',')[34].trim().includes("0.5")) {
    
                                //           KET = "0.5"
                                            
                                //         }else if (result[1].split(',')[34].trim().includes("1.5")) {
    
                                //           KET = "1.5"
                                            
                                //         }else if (result[1].split(',')[34].trim().includes("4.0")) {
    
                                //           KET = "4.0"
                                            
                                //         }else if (result[1].split(',')[34].trim().includes("8.0")) {
    
                                //           KET = "8.0"
                                            
                                //         }else {
    
                                //           KET = "Error"
    
                                //         }

                                //       rezultati.push({
                                //         analit:'KET',
                                //         analit_rez:KET,
                                //         analit_jedinica:"mmol/L",
                                //         analit_status:"",
                                //       }) 

                                //       // Askorbinska kiselina

                                //       var ASC = ""
                                //       ASC = result[1].split(',')[43].trim()


                                //     if (result[1].split(',')[43].trim().includes("Neg")) {

                                //       ASC = "negativan"
                                      
                                //   }else if (result[1].split(',')[43].trim().includes("0.56")) {

                                //     ASC = "0.56"
                                      
                                //   }else if (result[1].split(',')[43].trim().includes("1.14")) {

                                //     ASC = "1.14"
                                      
                                //   }else if (result[1].split(',')[43].trim().includes("2.28")) {

                                //     ASC = "2.28"
                                      
                                //   }else {

                                //     ASC = "Error"

                                //   }

                                //       rezultati.push({
                                //         analit:'ASC', // VC
                                //         analit_rez:ASC,
                                //         analit_jedinica:"mmol/L",
                                //         analit_status:"",
                                //       })     

                                //       // Eritrociti (HGB)

                                //       var BLO = ""
                                //       BLO = result[1].split(',')[28].trim()

                                //           if (result[1].split(',')[28].trim().includes("Neg")) {

                                //             BLO = "negativan"
                                            
                                //         }else if (result[1].split(',')[28].trim().includes("10")) {
    
                                //           BLO = "10"
                                            
                                //         }else if (result[1].split(',')[28].trim().includes("25")) {
    
                                //           BLO = "25"
                                            
                                //         }else if (result[1].split(',')[28].trim().includes("80")) {
    
                                //           BLO = "80"
                                            
                                //         }else if (result[1].split(',')[28].trim().includes("200")) {
    
                                //           BLO = "200"
                                            
                                //         }else {
    
                                //           BLO = "Error"
    
                                //         }

                                //       rezultati.push({
                                //         analit:'BLO', // BLD
                                //         analit_rez:BLO,
                                //         analit_jedinica:"Erc/µL",
                                //         analit_status:"",
                                //       })  
                                      
                                //       // Leukociti (HGB)

                                //       var LEU = ""
                                //       LEU = result[1].split(',')[13].trim()

                                //           if (result[1].split(',')[13].trim().includes("Neg")) {

                                //             LEU = "negativan"
                                            
                                //         }else if (result[1].split(',')[13].trim().includes("15")) {
    
                                //           LEU = "15"
                                            
                                //         }else if (result[1].split(',')[13].trim().includes("70")) {
    
                                //           LEU = "70"
                                            
                                //         }else if (result[1].split(',')[13].trim().includes("125")) {
    
                                //           LEU = "125"
                                            
                                //         }else if (result[1].split(',')[13].trim().includes("500")) {
    
                                //           LEU = "500"
                                            
                                //         }else {
    
                                //           LEU = "Error"
    
                                //         }



                                //       rezultati.push({
                                //         analit:'LEU',
                                //         analit_rez:LEU,
                                //         analit_jedinica:"Leu/µL",
                                //         analit_status:"",
                                //       }) 

                                //       // Nitriti

                                //       var NIT = ""
                                //       NIT = result[1].split(',')[16].trim()

                                //       if (result[1].split(',')[16].trim().includes("Neg")) {

                                //         NIT = "negativan"
                                        
                                //     }else if (result[1].split(',')[16].trim().includes("Pos")) {

                                //       NIT = "pozitivan"
                                        
                                //     }else {

                                //       NIT = "Error"

                                //     }

                                //       rezultati.push({
                                //         analit:'NIT',
                                //         analit_rez:NIT,
                                //         analit_jedinica:"",
                                //         analit_status:"",
                                //       })    

                                //       // Urobilinogen

                                //       var URO = ""
                                //       URO = result[1].split(',')[19].trim()

                                //       if (result[1].split(',')[19].trim().includes("3.5")) {

                                //         URO = "3.5"
                                        
                                //     }else if (result[1].split(',')[19].trim().includes("17")) {

                                //         URO = "17"
                                        
                                //     }else if (result[1].split(',')[19].trim().includes("35")) {

                                //         URO = "35"
                                        
                                //     }else if (result[1].split(',')[19].trim().includes("70")) {

                                //         URO = "70"
                                        
                                //     }else if (result[1].split(',')[19].trim().includes("140")) {

                                //         URO = "140"
                                        
                                //     }else {

                                //         URO = "Error"

                                //     }
                                    
                                //       rezultati.push({
                                //         analit:'URO', // UBG         
                                //         analit_rez:URO,
                                //         analit_jedinica:"µmol/L",
                                //         analit_status:"",
                                //       })  
                                      

                                      
                                                                 
                                //     // for (let index = 6; index < result.length; index++) {
                                //     //     rezultati.push({
                                //     //         analit:result[index].split(' ')[0],
                                //     //         analit_rez:result[index].split(' ')[1],
                                //     //         analit_jedinica:result[4],
                                //     //         analit_status:result[5],
                                //     //       })   
                                        
                                //     // }
 
                                    
                                    break;
                          case 'C':
                                    console.log("komentar");
                                    break;
                          case 'L':
                                    console.log("terminator"); 
                                    // rezultati.push({
                                    //     analit:'Izg',
                                    //     analit_rez:'',
                                    //     analit_jedinica:'',
                                    //     analit_status:'',
                                    //   })  
                                    //   rezultati.push({
                                    //     analit:'Col',
                                    //     analit_rez:'',
                                    //     analit_jedinica:'',
                                    //     analit_status:'',
                                    //   }) 
                                    console.log(rezultati)  
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
                                                                        console.log("uzorak.tests.length === i")
                                                                      uzorak.save() 
                                                                      if(uzorak.status === "REALIZOVAN"){
                                                                        novirez.status = "NIJE ODOBREN"
                                                                      }else{
                                                                        novirez.status = uzorak.status
                                                                      }
                                                                      novirez.rezultati.forEach(rezu => {
                                                                        // if(rezu.labassay.equals(test.labassay._id)){
                                                                        // if(JSON.stringify(rezu.labassay) === JSON.stringify(test.labassay._id)){
                                                                        if(JSON.stringify(rezu.labassay).includes("5f76fc20c5294a1764bd7134")){
                                                                            console.log("USLOV")
                                                                          rezu.status = "NIJE ODOBREN"
                                                                          rezu.rezultat[0].rezultat_f = '0' // !!!
                                                                        }
                                                                      });
                                                                      novirez.save()                                                                      
                                                                      io.emit('kompletiran',novirez.id, uzorak.site, sekc) 
                                                                    } 
                                                                  }else{
                                                                    
                                                                    console.log('nije pronadjen anaassay')
                                                                    console.log(anatest)
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
  