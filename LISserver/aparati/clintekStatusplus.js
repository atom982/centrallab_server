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
                                    if(element.length<200){
                                        console.log("Check header nije rezultat")
                                    }else{
                                        console.log("Ovo je real rezultat")
                                        temp_rezultati= element.split("|");
                                        sid = temp_rezultati[17].split("^")[0]
                                        console.log("sid:"+sid)
                                        console.log('Col: '+temp_rezultati[18].split("^")[1])
                                        console.log("Cla: "+temp_rezultati[18].split("^")[2])
    
                                        var pom= element.split(temp_rezultati[24]);
    
                                        console.log("_niz tem rezultata")
                                        console.log(pom)
                                                   
                                        console.log("GLU: "+pom[1].split("|")[2])
                                        console.log("BIL: "+pom[2].split("|")[2])
                                        console.log("KET: "+pom[3].split("|")[2])
                                        console.log("SG: "+pom[4].split("|")[2])
                                        console.log("BLD: "+pom[5].split("|")[2])
                                        console.log("pH: "+pom[6].split("|")[2])
                                        console.log("PRO: "+pom[7].split("|")[2])
                                        console.log("UBG: "+pom[8].split("|")[2])
                                        console.log("NIT: "+pom[9].split("|")[2])
                                        console.log("LEU: "+pom[10].split("|")[2])
                                 

                                    // Opšti pregled urina - fizikalno hemijski pregled
                                    // LabAssay ObjectId("5f76fc20c5294a1764bd7134")



                                    // Boja
                                    var Col = ""
                                        Col = temp_rezultati[18].split("^")[1]

                                        if (temp_rezultati[18].split("^")[1].includes("Yellow")) {

                                           Col = "žuta"
                                          
                                        }else if (temp_rezultati[18].split("^")[1].includes("Orange")){

                                          Col = "narandžasta"
      

                                        }else if (temp_rezultati[18].split("^")[1].includes("Brown")){

                                          Col = "smeđa"
      
                                        }else if (temp_rezultati[18].split("^")[1].includes("Red")){

                                          Col = "crvena"
      
                                        }else if (temp_rezultati[18].split("^")[1].includes("Green")){

                                          Col = "zelena"
      
                                        }else if (temp_rezultati[18].split("^")[1].includes("Blue")){

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
                                    Cla = temp_rezultati[18].split("^")[2]

                                    if (temp_rezultati[18].split("^")[2].includes("Clear")) {

                                      Cla = "bistar"
                                      
                                  }else if (temp_rezultati[18].split("^")[2].includes("Slight")){

                                    Cla = "blago zamućen"

                                  }else if (temp_rezultati[18].split("^")[2].split("^")[1].includes("Turb")){

                                    Cla = "veoma mutan"
                                    
                                  }else if (temp_rezultati[18].split("^")[2].includes("Cloudy")){

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
                                          GLU = pom[1].split("|")[2]

                                      if (pom[1].split("|")[2].includes("Negative")) {

                                          GLU = "negativan"
                                          
                                      }else if (pom[1].split("|")[2].includes("100")) {
  
                                        GLU = "pozitivan 1+"
                                          
                                      }else if (pom[1].split("|")[2].includes("250")) {
  
                                        GLU = "pozitivan 2+"
                                          
                                      }else if (pom[1].split("|")[2].includes("500")) {
  
                                        GLU = "pozitivan 3+"
                                          
                                      }else if (pom[1].split("|")[2].includes("1000")) {
  
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

                                      var BIL =pom[2].split("|")[2]
                                    

                                      if (pom[2].split("|")[2].includes("Negative")) {

                                        BIL = "negativan"
                                        
                                        }else if (pom[2].split("|")[2].includes("Small")) {

                                        BIL = "pozitivan 1+"
                                            
                                        }else if (pom[2].split("|")[2].includes("Moderate")) {

                                        BIL = "pozitivan 2+"
                                            
                                        }else if (pom[2].split("|")[2].includes("Large")) {

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
                                          KET = pom[3].split("|")[2]

                                          if (pom[3].split("|")[2].includes("Negative")) {

                                            KET = "negativan"
                                            
                                        }else if (pom[3].split("|")[2].includes("Trace")) {
    
                                          KET = "pozitivan 1+"
                                            
                                        }else if (pom[3].split("|")[2].includes("15")) {
    
                                          KET = "pozitivan 2+"
                                            
                                        }else if (pom[3].split("|")[2].includes("40")) {
    
                                          KET = "pozitivan 3+"
                                            
                                        }else if (pom[3].split("|")[2].includes("80")) {
    
                                          KET = "pozitivan 4+"
                                            
                                        }else if (pom[3].split("|")[2].includes("160")) {
    
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
                                        SG = pom[4].split("|")[2]

                                        if (pom[4].split("|")[2].includes("<=1.005")) {

                                          SG = "<=1.005"
                                          
                                      }else if (pom[4].split("|")[2].includes("1.010")) {

                                        SG = "1.010"
                                        
                                    }else if (pom[4].split("|")[2].includes("1.015")) {

                                      SG = "1.015"
                                        
                                    }else if (pom[4].split("|")[2].includes("1.020")) {

                                      SG = "1.020"
                                      
                                  }else if (pom[4].split("|")[2].includes("1.025")) {

                                    SG = "1.025"
                                      
                                  }else if (pom[4].split("|")[2].includes(">=1.030")) {
  
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
                                      BLD = pom[5].split("|")[2]

                                          if (pom[5].split("|")[2].includes("Negative")) {

                                            BLD = "negativan"
                                            
                                        }else if (pom[5].split("|")[2].includes("Trace-lysed")) {
    
                                          BLD = "+/- netaknut"
                                            
                                        }else if (pom[5].split("|")[2].includes("Trace-intact")) {
    
                                          BLD = "+/-"
                                            
                                        }else if (pom[5].split("|")[2].includes("Small")) {
    
                                          BLD = "pozitivan 1+"
                                            
                                        }else if (pom[5].split("|")[2].includes("Moderate")) {
    
                                          BLD = "pozitivan 2+"
                                            
                                        }else if (pom[5].split("|")[2].includes("Large")) {
    
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
                                        pH = pom[6].split("|")[2]

                                        if (pom[6].split("|")[2].includes("5.0")) {

                                          pH = "5.0"
                                          
                                      }else if (pom[6].split("|")[2].includes("5.5")) {
  
                                        pH = "5.5"
                                          
                                      }else if (pom[6].split("|")[2].includes("6.0")) {

                                        pH = "6.0"
                                        
                                    }else if (pom[6].split("|")[2].includes("6.5")) {

                                      pH = "6.5"
                                        
                                    }else if (pom[6].split("|")[2].includes("7.0")) {

                                      pH = "7.0"
                                      
                                  }else if (pom[6].split("|")[2].includes("7.5")) {

                                    pH = "7.5"
                                      
                                  }else if (pom[6].split("|")[2].includes("8.0")) {
  
                                        pH = "8.0"
                                          
                                      }else if (pom[6].split("|")[2].includes("8.5")) {
  
                                        pH = "8.5"
                                          
                                      }else if (pom[6].split("|")[2].includes(">=9.0")) {
  
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
                                        PRO =pom[7].split("|")[2]

                                        if (pom[7].split("|")[2].includes("Negative")) {

                                          PRO = "negativan"
                                          
                                      }else if (pom[7].split("|")[2].includes("Trace")) {
  
                                          PRO = "+/-"
                                          
                                      }else if (pom[7].split("|")[2].includes("30")) {
  
                                          PRO = "pozitivan 1+"
                                          
                                      }else if (pom[7].split("|")[2].includes("100")) {
  
                                          PRO = "pozitivan 2+"
                                          
                                      }else if (pom[7].split("|")[2].includes("300")) {
  
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
                                      URO = pom[8].split("|")[2]

                                      if (pom[8].split("|")[2].includes("0.2")) {

                                        URO = "3.2"
                                        
                                    }else if (pom[8].split("|")[2].includes("1.0")) {

                                        URO = "16"
                                        
                                    }else if (pom[8].split("|")[2].includes("2.0")) {

                                        URO = "33"
                                        
                                    }else if (pom[8].split("|")[2].includes("4.0")) {

                                        URO = "66"
                                        
                                    }else if (pom[8].split("|")[2].includes("8.0")) {

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
                                             NIT = pom[9].split("|")[2]
       
                                             if (pom[9].split("|")[2].includes("Negative")) {
       
                                               NIT = "negativan"
                                               
                                           }else if (pom[9].split("|")[2].includes("Positive")) {
       
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
                                      LEU = pom[10].split("|")[2]

                                          if (pom[10].split("|")[2].includes("Negative")) {

                                            LEU = "negativan"
                                            
                                        }else if (pom[10].split("|")[2].includes("Trace")) {
    
                                          LEU = "pozitivan 1+"
                                            
                                        }else if (pom[10].split("|")[2].includes("Small")) {
    
                                          LEU = "pozitivan 2+"
                                            
                                        }else if (pom[10].split("|")[2].includes("Moderate")) {
    
                                          LEU = "pozitivan 3+"
                                            
                                        }else if (pom[10].split("|")[2].includes("Large")) {
    
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
                                    }

  



                                    break;
                          default:
                                    console.log("Nepozanat tip frame-a..");
                            }
          });
    },
    };
  