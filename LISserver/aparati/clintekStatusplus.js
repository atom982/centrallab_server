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
      var temp_rezultati=[]
      var vrijeme_rezultata='';
      var module_sn='';
      var mode = ''
      var unit_type = ''
        console.log("U fajlu za parsanje")
          record.shift()
          record.forEach(function(element) {
              record_type =element.charAt(0);
              switch (record_type) {
                          case 'H':
                                    console.log("header");
                                    temp_rezultati= element.split("|");
                                    var pom= element.split(temp_rezultati[24]);

                                    console.log("_niz tem rezultata")
                                    console.log(pom)


                                    
                                    sid = temp_rezultati[17].replace('/[\[\]^]+/g', '')
                                    console.log("sid:"+sid)

                                    
                                    console.log('Col: '+temp_rezultati[18].split("^")[1])
                                    console.log("Cla: "+temp_rezultati[22])
                                    console.log("GLU: "+temp_rezultati[26])
                                    console.log("BIL: "+temp_rezultati[37])
                                    console.log("KET: "+temp_rezultati[46])
                                    break;

                                    
                                    
                                    console.log("SG: "+result[19])
                                    console.log("BLD: "+result[22])
                                    console.log("pH: "+result[25])
                                    console.log("PRO: "+result[28])
                                    console.log("UBG: "+result[31])
                                    //     
                                    console.log("NIT: "+result[34])
                                    console.log("LEU: "+result[37])
                                
    
                               
                                
                                //     console.log("VC: "+result[1].split(',')[43].trim())


                                    // Opšti pregled urina - fizikalno hemijski pregled
                                    // LabAssay ObjectId("5f76fc20c5294a1764bd7134")



                                    // Boja
                                    var Col = ""
                                        Col = result[7]

                                        if (result[7].includes("Yellow")) {

                                           Col = "žuta"
                                          
                                        }else if (result[7].includes("Orange")){

                                          Col = "narandžasta"
      

                                        }else if (result[7].includes("Brown")){

                                          Col = "smeđa"
      
                                        }else if (result[7].includes("Red")){

                                          Col = "crvena"
      
                                        }else if (result[7].includes("Green")){

                                          Col = "zelena"
      
                                        }else if (result[7].includes("Blue")){

                                          Col = "plava"
      
                                        }else{
                                          Col = "Greška"
                                        }

                                    rezultati.push({
                                        analit:'Col',
                                        analit_rez:Col,
                                        analit_jedinica:"",
                                        analit_status:"",
                                      })  
                                      
                                // Izgled
                                    var Cla = ""
                                    Cla = result[8]

                                    if (result[8].includes("Clear")) {

                                      Cla = "bistar"
                                      
                                  }else if (result[8].includes("Slight")){

                                    Cla = "blago zamućen"

                                  }else if (result[8].includes("Turb")){

                                    Cla = "veoma mutan"
                                    
                                  }else if (result[8].includes("Cloudy")){

                                    Cla = "mutan"
                                    
                                  }else {

                                    
  
                                    Cla = "Greška"

                                  }

                                rezultati.push({
                                  analit:'Cla',
                                  analit_rez:Cla,
                                  analit_jedinica:'',
                                  analit_status:"",
                                })   
                                              // Glukoza

                                      var GLU = ""
                                          GLU = result[10]

                                      if (result[10].includes("Negative")) {

                                          GLU = "negativan"
                                          
                                      }else if (result[10].includes("1+")) {
  
                                        GLU = "pozitivan 1+"
                                          
                                      }else if (result[10].includes("2+")) {
  
                                        GLU = "pozitivan 2+"
                                          
                                      }else if (result[10].includes("3+")) {
  
                                        GLU = "pozitivan 3+"
                                          
                                      }else if (result[10].includes("4+")) {
  
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

                                      var BIL = result[13]
                                    

                                      if (result[13].includes("Negative")) {

                                        BIL = "negativan"
                                        
                                        }else if (result[13].includes("1+")) {

                                        BIL = "pozitivan 1+"
                                            
                                        }else if (result[13].includes("2+")) {

                                        BIL = "pozitivan 2+"
                                            
                                        }else if (result[13].includes("3+")) {

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


                                              // Ketoni

                                      var KET = ""
                                          KET = result[16]

                                          if (result[16].includes("Negative")) {

                                            KET = "negativan"
                                            
                                        }else if (result[16].includes("1+")) {
    
                                          KET = "pozitivan 1+"
                                            
                                        }else if (result[16].includes("2+")) {
    
                                          KET = "pozitivan 2+"
                                            
                                        }else if (result[16].includes("3+")) {
    
                                          KET = "pozitivan 3+"
                                            
                                        }else if (result[16].includes("4+")) {
    
                                          KET = "pozitivan 4+"
                                            
                                        }else if (result[16].includes("5+")) {
    
                                          KET = "pozitivan 5+"
                                            
                                        }else {
    
                                          KET = "Greška"
    
                                        }

                                      rezultati.push({
                                        analit:'KET',
                                        analit_rez:KET,
                                        analit_jedinica:"",
                                        analit_status:"",
                                      }) 


                                           // Specifična težina
                                    var SG = ""
                                        SG = result[19]

                                        if (result[19].includes("<=1.005")) {

                                          SG = "<=1.005"
                                          
                                      }else if (result[19].includes("1.010")) {

                                        SG = "1.010"
                                        
                                    }else if (result[19].includes("1.015")) {

                                      SG = "1.015"
                                        
                                    }else if (result[19].includes("1.020")) {

                                      SG = "1.020"
                                      
                                  }else if (result[19].includes("1.025")) {

                                    SG = "1.025"
                                      
                                  }else if (result[19].includes(">=1.030")) {
  
                                    SG = ">=1.030"
                                          
                                      }else {
  
                                        SG = "Greška"
  
                                      }

                                        rezultati.push({
                                          analit:'SG',
                                          analit_rez:SG,
                                          analit_jedinica:"",
                                          analit_status:"",
                                        })



                                              // Eritrociti (HGB)

                                      var BLD = ""
                                      BLD = result[22]

                                          if (result[22].includes("Negative")) {

                                            BLD = "negativan"
                                            
                                        }else if (result[22].includes("+/- Intact")) {
    
                                          BLD = "+/- netaknut"
                                            
                                        }else if (result[22].includes("+/-")) {
    
                                          BLD = "+/-"
                                            
                                        }else if (result[22].includes("1+")) {
    
                                          BLD = "pozitivan 1+"
                                            
                                        }else if (result[22].includes("2+")) {
    
                                          BLD = "pozitivan 2+"
                                            
                                        }else if (result[22].includes("3+")) {
    
                                          BLD = "pozitivan 3+"
                                            
                                        }else {
    
                                          BLD = "Greška"
    
                                        }

                                      rezultati.push({
                                        analit:'BLD', // BLD
                                        analit_rez:BLD,
                                        analit_jedinica:"",
                                        analit_status:"",
                                      })  


                                    // pH urina
                                    var pH = ""
                                        pH = result[25]

                                        if (result[25].includes("5.0")) {

                                          pH = "5.0"
                                          
                                      }else if (result[25].includes("5.5")) {
  
                                        pH = "5.5"
                                          
                                      }else if (result[25].includes("6.0")) {

                                        pH = "6.0"
                                        
                                    }else if (result[25].includes("6.5")) {

                                      pH = "6.5"
                                        
                                    }else if (result[25].includes("7.0")) {

                                      pH = "7.0"
                                      
                                  }else if (result[25].includes("7.5")) {

                                    pH = "7.5"
                                      
                                  }else if (result[25].includes("8.0")) {
  
                                        pH = "8.0"
                                          
                                      }else if (result[25].includes("8.5")) {
  
                                        pH = "8.5"
                                          
                                      }else if (result[25].includes(">=9.0")) {
  
                                        pH = ">=9.0"
                                          
                                      }else {
  
                                        pH = "Greška"
  
                                      }

                                    rezultati.push({
                                      analit:'pH',
                                      analit_rez:pH,
                                      analit_jedinica:"",
                                      analit_status:"",
                                    })  

                               
                                        
                                    // Proteini

                                    var PRO = ""
                                        PRO = result[28]

                                        if (result[28].includes("Negative")) {

                                          PRO = "negativan"
                                          
                                      }else if (result[28].includes("+/-")) {
  
                                          PRO = "+/-"
                                          
                                      }else if (result[28].includes("1+")) {
  
                                          PRO = "pozitivan 1+"
                                          
                                      }else if (result[28].includes("2+")) {
  
                                          PRO = "pozitivan 2+"
                                          
                                      }else if (result[28].includes("3+")) {
  
                                          PRO = "pozitivan 3+"
                                          
                                      }else {
  
                                          PRO = "Greška"
  
                                      }
  
                                        rezultati.push({
                                          analit:'PRO',
                                          analit_rez:PRO,
                                          analit_jedinica:"",
                                          analit_status:"",
                                        })  



                                               // Urobilinogen

                                      var URO = ""
                                      URO = result[31]

                                      if (result[31].includes("3.2")) {

                                        URO = "3.2"
                                        
                                    }else if (result[31].includes("16")) {

                                        URO = "16"
                                        
                                    }else if (result[31].includes("33")) {

                                        URO = "33"
                                        
                                    }else if (result[31].includes("66")) {

                                        URO = "66"
                                        
                                    }else if (result[31].includes(">=131")) {

                                        URO = ">=131"
                                        
                                    }else {

                                        URO = "Greška"

                                    }
                                    
                                      rezultati.push({
                                        analit:'URO', // UBG         
                                        analit_rez:URO,
                                        analit_jedinica:"µmol/L",
                                        analit_status:"",
                                      })  


                                             // Nitriti

                                             var NIT = ""
                                             NIT = result[34]
       
                                             if (result[34].includes("Negative")) {
       
                                               NIT = "negativan"
                                               
                                           }else if (result[34].includes("Positive")) {
       
                                             NIT = "pozitivan"
                                               
                                           }else {
       
                                             NIT = "Greška"
       
                                           }
       
                                             rezultati.push({
                                               analit:'NIT',
                                               analit_rez:NIT,
                                               analit_jedinica:"",
                                               analit_status:"",
                                             })    



                                                         // Leukociti (HGB)

                                      var LEU = ""
                                      LEU = result[37]

                                          if (result[37].includes("Negative")) {

                                            LEU = "negativan"
                                            
                                        }else if (result[37].includes("1+")) {
    
                                          LEU = "pozitivan 1+"
                                            
                                        }else if (result[37].includes("2+")) {
    
                                          LEU = "pozitivan 2+"
                                            
                                        }else if (result[37].includes("3+")) {
    
                                          LEU = "pozitivan 3+"
                                            
                                        }else if (result[37].includes("4+")) {
    
                                          LEU = "pozitivan 4+"
                                            
                                        }else {
    
                                          LEU = "Greška" 
    
                                        }



                                      rezultati.push({
                                        analit:'LEU',
                                        analit_rez:LEU,
                                        analit_jedinica:"",
                                        analit_status:"",
                                      }) 


                        
                              

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

                                            console.log(k + " / " + rezultati.length)
                                            if(k === rezultati.length +1){
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
  