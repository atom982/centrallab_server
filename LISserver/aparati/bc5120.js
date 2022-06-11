module.exports = {

    specimen_result: function (record,serijski, callback) {
        var mongoose = require("mongoose");
  
        var Samples = require("../../models/Postavke");
        var Samples = mongoose.model("Samples");
    
        var AnaAssays = require("../../models/Postavke");
        var AnaAssays = mongoose.model("AnaAssays");
    
        var Results = require("../../models/Postavke");
        var Results = mongoose.model("Results");
        var reference = require("../../funkcije/shared/set_references")
        var starost = require("../../funkcije/shared/starostReferentne")
    
        var Result_Response = ""
        var segments = record.split("\r")
        var sid = ""
        var pid = ""
        var sn =""
        var rezultati = []

        function makeid(length) {
          var result           = '';
          var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
          var charactersLength = characters.length;
          for ( var i = 0; i < length; i++ ) {
             result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }
          return result;
       }
        function makedate(date) {
          function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }
  
        return date.getFullYear() +
               pad2(date.getMonth() + 1) + 
               pad2(date.getDate()) +
               pad2(date.getHours()) +
               pad2(date.getMinutes()) +
               pad2(date.getSeconds());
       } 
       function makedob(jmbg) {
        var year = '2000'
    switch (jmbg[5]) {
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
       console.log("MINDRAY BC 5120 RESULT")
        segments.forEach(function (segment) {
            segment_type = segment.substring(0,3);
            switch (segment_type) {
                 case 'MSH':
                    console.log("MSH: ");
                    var ack_key = segment.split("|")[9]
                    Result_Response  += 'MSH|^~\\&|atom||||'+makedate(new Date())+'||ACK^R01|'+ack_key+'|P|2.3.1||||||UNICODE'+"\u000d"
                    //'MSH|^~\\&|||||'+makedate(new Date())+'||ACK^R01|2|P|2.3.1||||0||ASCII|||'
                    console.log(segment)
                    // MSA|AA|1
                    
                    console.log(ack_key)
                    Result_Response += "MSA|AA|"+ack_key+"\u000d"
                    Result_Response = "\u000b"+Result_Response+"\u001c"+"\u000d"
                    var vrijeme_prijenosa =  segment.split("|")[6]
                    sn = segment.split("|")[5]
                    sn = 'ST-99002774'
                    console.log(vrijeme_prijenosa)
                    break;
                  case 'PID':
                      pid = segment.split("|")[5]

                        break;
                  case 'OBR':// - Observation request segment
                      console.log("OBR: ");
                      var vrijeme_rezultata = segment.split("|")[7]
                      console.log(vrijeme_rezultata)
                      console.log("SID: "+segment.split("|")[3]);
                      sid=segment.split("|")[3]
                        break;
                  case 'ORC':
                      console.log("ORC: ");
    
                        break;  
                  case 'SPM':          
    
                        console.log("SPM: ");
                        break;   
                  case 'OBX':// Observation/Result            
                          console.log("OBX: ");
                        var obx = segment.split("|")//OBX|5|NM|6690-2^WBC^LN||8.30|10*9/L|4.00-10.00|N|||F
                        switch (obx[2]) {
                            case "CE":
                              
                              break;
                            case "ST":
                                    
                              break; 
                            case "NM":
                                console.log("NM")
                                console.log("param:"+obx[3].split("^")[1]+"  result:"+obx[5]+" unit:"+obx[6])
                                if( parseFloat(obx[1]) < 33){
                                    console.log("segment:"+obx[1])
                                    console.log(parseFloat(obx[1]))

                                    rezultati.push({
                                        analit:obx[3].split("^")[1],
                                        analit_rez:obx[5],
                                        analit_status:''
                                    })  
                                }

                                //----------------------------------------------------

                                
                                if( parseFloat(obx[1]) === 29){
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
                                              switch (rez.rezultat[0].module_sn) {
                                                case "MID%":
                                                    if(niz.analit ==="MON%"){
                                                        niz.analit = 'MID%'
                                                    }
                                                    break;
                                                case "GRA%":
                                                    if(niz.analit ==='NEU%'){
                                                        niz.analit = 'GRA%'
                                                    }
                                                    break; 
                                                case "LYM":
                                                    if(niz.analit ==='LYM#'){
                                                        niz.analit = 'LYM'
                                                    }
                                                    break;
                                                case "GRA":
                                                    if(niz.analit ==='NEU#'){
                                                        niz.analit = 'GRA'
                                                    }
                                                    break;  
                                                case "MID":
                                                    if(niz.analit ==='MON#'){
                                                        niz.analit = 'MID'
                                                    }
                                                    break;                                
                                                default:
                                                    break;
                                            }
                                              if(rez.rezultat[0].rezultat_f ==="" && rez.rezultat[0].module_sn ===niz.analit){
                                                console.log('CHECKPOINT FIRST')
                                                rez.rezultat[0].vrijeme_prijenosa = Date.now()
                                                rez.rezultat[0].vrijeme_rezultata = vrijeme_rezultata
                                                if(niz.analit === 'RDW-CV'|| niz.analit === 'LYM%' || niz.analit === 'NEU%'|| niz.analit === 'BAS%'|| niz.analit === 'EOS%'|| niz.analit === 'MON%'|| niz.analit === 'PLCR'|| niz.analit === 'MID%'|| niz.analit === 'GRA%'){
                                                    rez.rezultat[0].rezultat_f = (parseFloat(niz.analit_rez)*100).toFixed(2).toString()
                                                    
                                                  } else{
                                                    if(rezultat.rezultati[0].labassay.equals(mongoose.Types.ObjectId('5f76f346c5294a1764bd7108'))){
                                                        //stavka.produkt.equals(mongoose.Types.ObjectId(ulaz.produkt)
                                                        if(niz.analit === 'HCT'){
                                                            rez.rezultat[0].rezultat_f = (parseFloat(niz.analit_rez)*100).toFixed(2).toString()
                                                        }else if(niz.analit === 'PCT'){
                                                            rez.rezultat[0].rezultat_f = (parseFloat(niz.analit_rez)/100).toFixed(2).toString()
                                                          } else{
                                                            rez.rezultat[0].rezultat_f= niz.analit_rez  
                                                        }
                                                    }else{
                                                        console.log("KKS 5555")
                                                        rez.rezultat[0].rezultat_f= niz.analit_rez
                                                    }  
                                                    
                                                  }
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
                                                    if(niz.analit === 'RDW-CV'|| niz.analit === 'LYM%' || niz.analit === 'NEU%'|| niz.analit === 'BAS%'|| niz.analit === 'EOS%'|| niz.analit === 'MON%'|| niz.analit === 'PLCR'|| niz.analit === 'MID%'|| niz.analit === 'GRA%'){
                                                        temp.rezultat_f = (parseFloat(niz.analit_rez)*100).toFixed(2).toString()
                                                        
                                                      }else{
                                                        if(rezultat.rezultati[0].labassay.equals(mongoose.Types.ObjectId('5f76f346c5294a1764bd7108'))){
                                                            console.log("KKS3")
                                                            if(niz.analit === 'HCT'){
                                                                temp.rezultat_f = (parseFloat(niz.analit_rez)*100).toFixed(2).toString()
                                                            }else if(niz.analit === 'PCT'){
                                                                temp.rezultat_f = (parseFloat(niz.analit_rez)/100).toFixed(2).toString()
                                                              }else{
                                                                temp.rezultat_f = niz.analit_rez 
                                                            }
                                                        }else{
                                                            console.log("KKS 5555")
                                                            temp.rezultat_f = niz.analit_rez
                                                        }  
                                                        
                                                      }
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
                                                                  //io.emit('kompletiran',novirez.id, uzorak.site, sekc) 
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
                                })
                               }
                                //----------------------------------------------------
                                break;
                            case "EI":  
                                break;                   
                        }
                           
                        break; 
                  case 'TCD':
                          console.log("TCD: ");
                
                        break;  
                  case 'NTE':
                          console.log("NTE: ");
                
                        break;                
                  default:
                    console.log("Nepozanat HL7 segment !");
            }
        })
        console.log('RESULT RESPONSE')
        console.log(JSON.stringify(Result_Response))
        callback(Result_Response)
  
    }, 
    order_query: function (record, serijski,callback) {
        var mongoose = require("mongoose");
        var Order_Response = ""
        var Order_Download = ""
        var sample_id = ""
        var testovi  =[]
        var segments = record.split("\r")
        var ack_key = '1'

        function makeid(length) {
          var result           = '';
          var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
          var charactersLength = characters.length;
          for ( var i = 0; i < length; i++ ) {
             result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }
          return result;
       }
        function makedate(date) {
          function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }

        return date.getFullYear() +
               pad2(date.getMonth() + 1) + 
               pad2(date.getDate()) +
               pad2(date.getHours()) +
               pad2(date.getMinutes()) +
               pad2(date.getSeconds());
       } 
       function makedob(jmbg) {
        var year = '2000'
    switch (jmbg[5]) {
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
//    Query
// '  MSH|^~\\&|||||20200131143528||QRY^Q02|3|P|2.3.1||||||ASCII|||
// '  QRD|20200131143528|R|D|1|||RD|S004A10123|OTH|||T|
// '  QRF||||||RCT|COR|ALL||

// Reply if sample exists
// ' MSH|^~\\&|atom-lis|ilabdoo|atom||20200801015944||RSP^K11^RSP_K11|e2703c29-8392-48f5-b085-9664475fcfba|P|2.5.1|||NE|AL||UNICODE UTF-8|||
var stamp = new Date()
        segments.forEach(function (segment) {
            segment_type = segment.substring(0,3);
            switch (segment_type) {
                 case 'MSH':
                    ack_key = segment.split("|")[9]
                    Order_Response  += 'MSH|^~\\&|atom||||'+ makedate(stamp)+"||ORR^O02|"+ack_key+"|P|2.3.1||||||UNICODE"+"\u000d"
                    // 'MSH|^~\\&|||||'+makedate(new Date())+'||ACK^R01|2|P|2.3.1||||0||ASCII|||'+"\u000d"
                    Order_Response += "MSA|AA|"+ack_key+"\u000d"
                    //Order_Response = "\u000b"+Order_Response+"\u001c"+"\u000d"
                    break;
                  case 'QPD':
                    console.log("QPD: ");
                    Order_Response += "QAK|"+segment.split("|")[2]+"|OK|WOS^Work Order Step^IHELAW"+"\u000d"
                    sample_id = segment.split("|")[3]
                    Order_Response  +=segment+"\u000d"
                    //console.log(sample_id)
                    break;
                    case 'QRF':
                        break;
                 case 'ORC':
                        //console.log("QRD ");
                        //console.log(segment)
                        sample_id = segment.split("|")[3]
                        Samples.findOne({ id: sample_id }).populate('tests.labassay').exec(function (err, uzorak) {
                          if (err) {
                            console.log("Greška:", err);
                          }
                          else {
                            if (uzorak === null) {
                              console.log("U LIS-u ne postoji uzorak sa brojem: " + sample_id);
                              Order_Response = "\u000b"+Order_Response+"\u001c"+"\u000d"
                             
                              console.log(ack_key)
                              Order_Download  += 'MSH|^~\\&|atom||||'+ makedate(stamp)+"||ORR^O02|"+ack_key+"|P|2.3.1||||||UNICODE"+"\u000d"

                              Order_Download  += "MSA|AR|"+ack_key+"\u000d"
                              Order_Download = "\u000b"+Order_Download+"\u001c"+"\u000d"
                              // MSH|^~\&|LIS||||20081120175238||ORR^O02|1|P|2.3.1||||||UNICODE
                              // MSA|AR|9
                              var negquery= Order_Download
                              callback(negquery);
                            } else { 
                              AnaAssays.find({aparat:mongoose.Types.ObjectId(serijski)}).populate('aparat test').lean().exec(function (err, anaassays) {
                                uzorak.tests.forEach(function (test) {
                                  anaassays.forEach(function (anaassay) {
                                    if ((anaassay.test.sifra === test.labassay.sifra) && (anaassay.test.calculated)) {
                                      test.status_t = "U OBRADI"
                                    }
                                    if (((anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true) ) || ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN") )|| ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "U OBRADI") )) {
                                      testovi.push({ordernr:uzorak.pid,kod:anaassay.kod, ime:anaassay.test.naziv})
            
                                      test.status_t = "U OBRADI"
                                      test.status_r  =false
                                    }
                                  })
                                })

                                Results.findOne({ 'id': uzorak.id }).populate('patient rezultati.labassay').exec(function (err, rezultat) {
                                  var stamp = new Date()
                                  if (testovi.length < 1) {
                                    console.log("Za uzorak :" + sample_id + " ne postoji niti jedan test ili rerun!");
                                    Order_Response = "\u000b"+Order_Response+"\u001c"+"\u000d"
                                    Order_Download  += 'MSH|^~\\&|atom||||'+ makedate(stamp)+"||ORR^O02|"+ack_key+"|P|2.3.1||||||UNICODE"+"\u000d"
                                    //                  MSH|^~\\&|       |    |       |       |20210124143307      ||QRY^Q02|7|P|2.3.1||||||ASCII|||
                                    Order_Download  += "MSA|AR|"+ack_key+"\u000d"
                                    // MSH|^~\&|LIS||||20081120175238||ORR^O02|1|P|2.3.1||||||UNICODE
                                    // MSA|AR|9
                                    Order_Download = "\u000b"+Order_Download+"\u001c"+"\u000d"
                                    var negquery= Order_Download
                                    callback(negquery);
                                  } else {

                                    rezultat.status = "U OBRADI"
                                    uzorak.status = "U OBRADI"
                                    uzorak.save()
                                    rezultat.save(function (err) {
                                      if (err) {
                                        console.log("Greška:", err);
            
                                      } else {
            
                                      }
                                    });
                                   

                                    console.log("Kreiram Record: ");
                                    
                                    //MSH|^~\&|||Company|Product|20070301193232||DSR^Q03|1|P|2.3.1||||||ASCII|||<CR>
                                    Order_Download += 'MSH|^~\\&|atom||||'+ makedate(stamp)+"||ORR^O02|"+ack_key+"|P|2.3.1||||||UNICODE"+"\u000d"
                                    //MSA|AA|1|Message accepted|||0|<CR>
                                    Order_Download  +=  "MSA|AA|"+ack_key+"\u000d"

                                    var prezime = rezultat.patient.prezime
                                    var rime = rezultat.patient.ime
                                    var ime = prezime+'^'+rime
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

                                    var spol = rezultat.patient.spol
                                    if(spol ==="MUŠKI"){
                                      spol = "Male"
                                    }else{
                                      spol = "Female"
                                    }
                                    //PID|1||ChartNo^^^^MR||^FName||19810506|NT
                                    Order_Download  += "PID|1||Atrijum^^^^MR||"+ime+"||"+makedob( rezultat.patient.jmbg)+"|"+spol+"\u000d"
                                    //PV1|1|Outpatient|Medicine^^BN1|||||||||||||||||MedicalInsurance
                                    Order_Download  += "PV1|1|Vanjski Pacijent|Atrijum^^Bn4|||||||||||||||||Pregled"+"\u000d" 
                                    //ORC|AF|SampleID1|||                         
                                    Order_Download  += "ORC|AF|"+rezultat.id+"|||"+"\u000d"
                                    //OBR|1|SampleID1|00001^AutomatedCount^99MRC||20101006084439|20101009091515|||Li|||Cold|20101007084458||||||||||HM||||||||admin
                                    Order_Download  += "OBR|1|"+rezultat.id+"|"+"00001^AutomatedCount^99MRC"+"|"+makedate(rezultat.created_at)+"|"+makedate(stamp)+"|||Li|||Cold|"+makedate(stamp)+"||||||||||HM||||||||admin|"+"\u000d"
                                    // OBX|1|IS|08001^Take Mode^99MRC||A||||||F
                                    Order_Download  += "OBX|1|IS|08001^Take Mode^99MRC||A||||||F"+"\u000d"//
                                    // OBX|2|IS|08002^Blood Mode^99MRC||W||||||F
                                    Order_Download  += "OBX|2|IS|08002^Blood Mode^99MRC||W||||||F"+"\u000d"//
                                    // OBX|3|IS|08003^Test Mode^99MRC||CBC||||||F
                                    Order_Download  += "OBX|3|IS|08003^Test Mode^99MRC||CBC+DIFF||||||F"+"\u000d"//                                   
                                    // OBX|4|IS|01002^Ref Group^99MRC||XXXX||||||F
                                    Order_Download  += "OBX|4|IS|01002^Ref Group^99MRC||XXXX||||||F"+"\u000d"//
                                    // OBX|5|NM|30525-0^Age^LN||1|hr|||||F
                                    Order_Download  += "OBX|5|NM|30525-0^Age^LN||1|hr|||||F"+"\u000d"//
                                    // OBX|6|ST|01001^Remark^99MRC||remark content....||||||F
                                    Order_Download  += "OBX|6|ST|01001^Remark^99MRC||remark content....||||||F"+"\u000d"//
                                    Order_Download = "\u000b"+Order_Download+"\u001c"+"\u000d"
                                    callback(Order_Download)
                                  }
            
                                })
                              })
                            } // else if uzorak null
                          }
                        });
                        break;
                  default:
                    console.log("Nepozanat HL7 segment !");
            }
        })
    },
}