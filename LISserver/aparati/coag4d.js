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
      var sid = '';
      var obj={};
      var result = []
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
                                    sn=sender[2];
                                    break;
                          case 'R':
                                    var d = new Date()
                                    var mjesec = d.getMonth() + 1
                                    if(mjesec < 10){
                                      mjesec = '0' + mjesec
                                    }

                                    var dan = d.getUTCDate()
                                    if(dan < 10){
                                      dan = '0'+dan
                                    }

                                    var  god = d.getFullYear().toString()

                                    var datum = god+mjesec+dan
                                    console.log("rezultat");
                                    result = element.split("|");
                                    if(result.length === 10){
                                      var field = result[8].split(";");
                                      obj.sid  = result[1]
                                      obj.date = datum
                                      obj.time = d.getHours().toString()+d.getMinutes().toString()+d.getSeconds().toString()
                                      obj.code = result[4]
                                      obj.rep1 = result[5].replace(",", ".")
                                      obj.rep2 = result[6].replace(",", ".")
                                      obj.avg  = result[7].replace(",", ".")
                                      if(result[4].trim() ==="PT" || result[4].trim() ==="FIB"){
                                        obj.perce= field[0].replace(",", ".")
                                        obj.ratio= field[1].replace(",", ".")
                                        obj.inr=  field[2].replace(",", ".")
                                        obj.ugml= field[3].replace(",", ".")
                                        obj.gl=   field[4].replace(",", ".")
                                      }
                                    }else{
                                      obj.sid  = result[1]
                                      obj.date = datum
                                      obj.time = d.getHours().toString()+d.getMinutes().toString()+d.getSeconds().toString()
                                      obj.code = result[4]
                                      obj.rep1 = '-----'
                                      obj.rep2 = '-----'
                                      obj.avg  = '-----'
                                      obj.perce= '-----'
                                      obj.ratio= '-----'
                                      obj.inr=  '-----'
                                      obj.ugml= '-----'
                                      obj.gl=   '-----'
                                    }

                                    //obj.err=  result[9].substring(0, 3)
                                    rezultati.push(obj)
                                    obj = {}
                                    break;
                          case 'L':
                                    console.log("terminator"); 
                                 
                                    console.log(rezultati); 
                                    rezultati.forEach(element => {
                                      Results.findOne({id:element.sid}).populate('sample rezultati.labassay').exec(function (err, rezultat) {
                                        if (err) {
                                          console.log("Greška:", err);
                                        }
                                        else {
                                          if(rezultat){
                                            var sekc = rezultat.rezultati[0].labassay.sekcija
                                            rezultat.rezultati.forEach(clan => {
                                              AnaAssays.findOne({kod:element.code.trim()}).populate('test').lean().exec(function (err, an_assay) {
                                                if (err) {
                                                  console.log("Greška:", err);
                                                }
                                                else {
                                                      if(an_assay){
                                                        if((an_assay.test._id.equals(clan.labassay._id) && !clan.rezultat.length) ||(an_assay.test._id.equals(clan.labassay._id) && clan.retest)){
                                                          clan.status = "NIJE ODOBREN"
                                                          var finalni_rezultat = ''
                                                          clan.retest = false
                                                          if(element.code.trim() === "PT"){
                                                            finalni_rezultat = element.inr 
                                                          }else if(element.code.trim() === "FIB"){
                                                            finalni_rezultat = element.gl 
                                                          }else{
                                                            finalni_rezultat = element.avg 
                                                          }
                                                          

                                                          clan.rezultat.push({
                                                         
                                                            anaassay: an_assay._id,
                                                            sn: sn,
                                                            vrijeme_prijenosa:element.date+element.time,
                                                            vrijeme_rezultata:element.date+element.time,
                                                            dilucija:'',
                                                            module_sn:element.sn,
                                                            reagens_lot:'',
                                                            reagens_sn:'',
                                                            rezultat_f:finalni_rezultat,
                                                            jedinice_f:an_assay.test.jedinica,
                                                            rezultat_p:'',
                                                            jedinice_p:'',
                                                            rezultat_i:'',
                                                            odobren:false
                                                          })

                                                          
                                                          rezultat.save(function(err,sacuvan) {
                                                            if(err) {
                                                                    console.log("Greška:", err);
                                                            } else {
                                                              Samples.findOne({id: sacuvan.id}).populate('patient tests.labassay').exec(function (err, uzorak) {
                                                                if (err) {
                                                                  console.log("Greška:", err);
                                                                }
                                                                else {
                                                                      if(uzorak){
                                                                        var status_control = true
                                                                        uzorak.tests.forEach(eluzo => {
                                                                          sacuvan.rezultati.forEach(elrez => {
                                                                            if(eluzo.labassay.equals(elrez.labassay)){
                                                                              eluzo.status_t = elrez.status
                                                                              if(elrez.status != "NIJE ODOBREN"){
                                                                                status_control = false
                                                                              }
                                                                            }
                                                                          });
                                                                        });
                                                                        if(status_control){
                                                                          uzorak.status = 'REALIZOVAN'
                                                                          sacuvan.status = 'REALIZOVAN'                                                                          
                                                                          io.emit('kompletiran',sacuvan.id, uzorak.site, sekc) 
                                                                        }
                                                                        uzorak.save()
                                                                        sacuvan.save()
                                                                      }
                                                                    }
                                                              })
                                                            }
                                                          })

                                                        }else{
                                                          console.log('test analizatora nije proandjen')
                                                        }
                                                      } 
                                                    } 
                                                  })
                                            });
                                          }else{
                                            console.log('sid nije pronadjen')
                                          }
                                        }
                                      })
                                    });


                                    break;
                          default:
                                    console.log("Nepozanat tip frame-a..");
                            }
          });
    },
    };
  