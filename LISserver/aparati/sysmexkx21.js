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
                                      sn='kx21';
                                    }
                                    break;
                          case 'O':
                                    console.log("order");
                                    var header= element.split("|");
                                    var order=header[3].split("^");
                                    sid = order[2].trim()
                                    sifra_p='KKS3'
                                    break;
                          case 'R':

                                    console.log("rezultat kx 21");
                                    sifra_p='KKS3'
                                    var datumT = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().substring(0, 10)
                                    //D1U202206180000000000000004000000001291048000130003780078820271203440026100131201060076310017000141009810391001370009400083001380

                                    sid = 'K'+element.substring(25,28)+'B'+ datumT.substring(3, 4) + datumT.substring(5, 7) + datumT.substring(8, 10)
                                    console.log('novi sid')
                                    console.log(element.substring(24,28))
                                    var datum = element.substring(4,12)
                                    var vrijeme = Date.now()
                                    vrijeme_rezultata=datum
                                    var analiti = ['WBC','RBC','HGB','HCT','MCV','MCH','MCHC','PLT','LYM','MIX','NEU','LYM#','MIX#','NEU#','RDW_SD','RDW_CV','PDW','MPV','P-LCR']
                                    var temprez =''
                                    for (let index = 0; index < analiti.length; index++) {
                                        temprez = element.substring((index+7)*5,(index+7)*5+5)

                                        switch (analiti[index]) {
                                            case 'RBC':                                                    
                                              temprez = temprez.substring(1,2)+'.'+temprez.substring(2,4)
                                                break;
                                            case 'HGB':                                                    
                                              temprez = temprez.substring(1,4)
                                              temprez = (parseFloat(temprez)).toFixed(0).toString();
                                            break;   
                                            case 'HCT':                                                    
                                            temprez = temprez.substring(1,3)+'.'+temprez.substring(3,5)
                                            temprez = (parseFloat(temprez)/100).toFixed(3).toString()
                                            break;                                    
                                            case 'PLT':                                                    
                                              temprez = temprez.substring(1,4)
                                              temprez = (parseFloat(temprez)).toFixed(0).toString();
                                            break;  
                                            case 'LYM':                                                    
                                            temprez = temprez.substring(1,3)+'.'+temprez.substring(3,5)
                                            temprez = (parseFloat(temprez)).toFixed(1).toString()
                                            break;
                                            case 'MIX':                                                    
                                            temprez = temprez.substring(1,3)+'.'+temprez.substring(3,5)
                                            temprez = (parseFloat(temprez)).toFixed(1).toString()
                                            break;
                                            case 'NEU':                                                    
                                            temprez = temprez.substring(1,3)+'.'+temprez.substring(3,5)
                                            temprez = (parseFloat(temprez)).toFixed(1).toString()
                                            break;
                                            case 'LYM#':                                                    
                                            temprez = temprez.substring(1,3)+'.'+temprez.substring(3,5)
                                            temprez = (parseFloat(temprez)).toFixed(1).toString()
                                            break;
                                            case 'MIX#':                                                    
                                            temprez = temprez.substring(2,3)+'.'+temprez.substring(3,5)
                                            temprez = (parseFloat(temprez)).toFixed(1).toString()
                                            break;
                                            case 'NEU#':                                                    
                                            temprez = temprez.substring(1,3)+'.'+temprez.substring(3,5)
                                            temprez = (parseFloat(temprez)).toFixed(1).toString()
                                            break;
                                            case 'MCHC':                                                    
                                              temprez = temprez.substring(1,4)
                                              temprez = (parseFloat(temprez)).toFixed(0).toString();
                                            break;
                                            case 'MCV':                                                    
                                            temprez = parseInt(temprez.substring(0,3)).toString()+'.'+temprez.substring(3,5)
                                            temprez = (parseFloat(temprez)).toFixed(1).toString()
                                            break;
                                            case 'RDW_CV':                                                    
                                            temprez =  parseInt(temprez.substring(0,1)).toString()+'.'+temprez.substring(1,5)
                                            temprez = (parseFloat(temprez)*100).toFixed(1).toString()
                                            break;
                                            case 'P-LCR':                                                    
                                            temprez =  parseInt(temprez.substring(0,1)).toString()+'.'+temprez.substring(1,5)
                                            temprez = (parseFloat(temprez)*100).toFixed(1).toString()
                                            break;
                                            default:
                                                    temprez = temprez.substring(1,3)+'.'+temprez.substring(3,5)  
                                                    temprez = temprez.replace(/^0+|0+$/g, "")
                                                break;
                                        }
                                        if(temprez ==='.' || temprez ==='0.00'){temprez = ''}
                                        if(temprez[temprez.length-1] === '.'){temprez += '0'}
                                        rezultati.push({
                                            analit:analiti[index],
                                            analit_rez: temprez,
                                            analit_status:''
                                          })  
                                    }     
                                    //console.log(rezultati)
                                    break;
                          case 'C':
                                    console.log("komentar");
                                    break;
                          case 'L':
                                    console.log("terminator"); 
                                    console.log(sid)
                                    var k = 1
                                    var j = 1
                                    console.log(rezultati)  
                                    Results.findOne({id:sid}).populate('aparat').exec(function (err, rezultat) {
                                      if (err) {
                                        console.log("Greška:", err);
                                      }
                                      else {
                                        if(rezultat){
                                          var temp = {}
                                          if(rezultat.multi.length){

                                            var tempRez = []
                                            rezultat.multi.forEach(instance => { // multi rezultat
                                              instance.forEach(rez => { // rez - analit tj. npr wbc od kks
                                                rez.retest = false
                                                rezultati.forEach(niz => {
                                                  j=1
                                                  //console.log('PROVJERAVAM:='+niz.analit+ "="+rez.rezultat[0].module_sn+"=")
                                                  if(rez.rezultat[0].rezultat_f ==="" && rez.rezultat[0].module_sn ===niz.analit){
                                                    console.log('CHECKPOINT FIRST')
                                                    rez.rezultat[0].vrijeme_prijenosa = Date.now()
                                                    rez.rezultat[0].vrijeme_rezultata = vrijeme_rezultata
                                                    // if(niz.analit ==='HCT'){
                                                      
                                                    //   rez.rezultat[0].rezultat_f = parseInt(niz.analit_rez)*100
                                                    // }else{
                                                      rez.rezultat[0].rezultat_f = niz.analit_rez
                                                    // }
                                                    
                                                    rez.rezultat[0].rezultat_i = niz.analit_status
                                                    k++                                                   
                                                  }else{
                                                      if(rez.rezultat[0].module_sn === niz.analit ){
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
                                                        // if(niz.analit ==='HCT'){
                                                        //   temp.rezultat_f =   parseInt(niz.analit_rez)*100
                                                        // }else{
                                                          temp.rezultat_f = niz.analit_rez
                                                        // }
                                                        
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
                                            
                                            console.log(rezultati.length) // 19
                                            console.log(k) // 21
                                            if(k === rezultati.length+1 || k === rezultati.length+2){
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
                                                                        if(JSON.stringify(rezu.labassay).includes("62a8648258a31ae2ccd23c3f")){
                                                                          console.log("USLOV")
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
  