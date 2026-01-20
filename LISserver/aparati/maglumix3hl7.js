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
        var rack_id=""
        var verification_code=""
        var tube_pos=""

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
       console.log("Snibe maglumi X3 HL7")
        segments.forEach(function (segment) {
            segment_type = segment.substring(0,3);
            switch (segment_type) {
                 case 'MSH':
                    console.log("MSH: ");
                    Result_Response  += 'MSH|^~\\&|||||'+makedate(new Date())+'||ACK^R01|2|P|2.3.1||||0||ASCII|||'+"\u000d"
                    //'MSH|^~\\&|||||'+makedate(new Date())+'||ACK^R01|2|P|2.3.1||||0||ASCII|||'
                    console.log(segment)

                    var ack_key = segment.split("|")[9]
                    console.log(ack_key)
                    Result_Response += "MSA|AA|1|"+"Message accepted"+"|||0|"+"\u000d"
                    Result_Response = "\u000b"+Result_Response+"\u001c"+"\u000d"
                    var vrijeme_prijenosa =  segment.split("|")[6]
                    sn = segment.split("|")[5]
                    console.log(vrijeme_prijenosa)
                    break;
                  case 'SPM':
                      pid = segment.split("|")[5]
                     
                      pid = segment.split("|")[2]
                      sid = pid.split("^")[0]
                      console.log("SID: "+sid);
                        break;
                  case 'OBR':// - Observation request segment
                      console.log("OBR: ");
                      var vrijeme_rezultata = segment.split("|")[7]
                      console.log(vrijeme_rezultata)
                        break;
                  case 'ORC':
                      console.log("ORC: ");
    
                        break;  
                  case 'SPM':          
    
                        console.log("SPM: ");
                        break;   
                  case 'OBX':// Observation/Result            
                          console.log("OBX: ");
                        var obx = segment.split("|")
                        switch (obx[2]) {
                            case "CE":
                              
                              break;
                            case "ST":
                                    
                              break; 
                            case "":
                                console.log("obx empty should be NM")
                                console.log(obx[4])
                                //----------------------------------------------------
                                Samples.findOne({ id: sid }).populate('patient tests.labassay').exec(function (err, uzorak) {
                                    if (err) {
                                      console.log("Greška:", err);
                                    }
                                    else {                  
                                      if (uzorak === null) {
                                        console.log('U LIS-u ne postoji definisan order za uzorak broj: ' + sid);
                                      } else {
                                        
                                        console.log("Uzorak pronađen");
                                        console.log('sifra_p:'+obx[3])
                                        console.log('rezultat:'+obx[5]+'('+obx[7]+')')
                                        if (uzorak.status != "OBRAĐEN") {
                                            var sifra_p = obx[3]
                                            var rezultat_f = obx[5]
                                            var jedinice_f = obx[6]
                                            var rezultat_i = obx[7]
                                          AnaAssays.findOne({ kod: sifra_p,aparat:mongoose.Types.ObjectId(serijski) }).populate('test').lean().exec(function (err, test) {
                                            if (err) {
                                              console.log("Greška:", err);
                                            }
                                            else {
                                              // console.log(test)
                                              if (test === null) {
                                                console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + '  na aparatu MAglumi X3 sn: ' + sn);
                                              } else {
                                                uzorak.tests.forEach(elementu => {
                    
                                                  if ((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") || (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "ZAPRIMLJEN") ||(elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)) {
                                                    console.log('Match Found')
                                                    // console.log(elementu)
                                                    elementu.status_t = "REALIZOVAN"
                                                    elementu.status_r = false
                                                    var rezultat = {};
                                                    rezultat.anaassay = test
                                                    rezultat.sn = sn
                                                    rezultat.vrijeme_prijenosa = vrijeme_prijenosa
                                                    rezultat.vrijeme_rezultata = vrijeme_rezultata
                                                    rezultat.dilucija = 'dilucija'
                                                    rezultat.module_sn = 'module_sn'
                                                    rezultat.reagens_lot = 'reagens_lot'
                                                    rezultat.reagens_sn = 'reagens_sn'
                                                    rezultat.rezultat_f = rezultat_f
                                                    rezultat.jedinice_f = jedinice_f
                                                    rezultat.rezultat_p = 'rezultat_p'
                                                    rezultat.jedinice_p = 'jedinice_p'
                                                    rezultat.rezultat_i = rezultat_i
                                                    rezultat.odobren = false
                                                    var json = {};
                                                    json.labassay = test.test
                                                    json.rezultat = []
                                                    json.rezultat.push(rezultat)
                                                    Results.findOne({ id: uzorak.id }).populate('rezultati rezultati.labassay patient').exec(function (err, result) {
                                                      if (err) {
                                                        console.log("Greška:", err)
                                                      }
                                                      else {
                                                        if (result.created_at === null) {
                                                          result.created_at = Date.now()
                                                        }
                                                        spol = result.patient.spol
                                                        jmbg = result.patient.jmbg
                                                        // console.log(result)
                                                        var counter = 0
                                                        result.rezultati.forEach(element => {
                                                          counter++
                                                          if ((element.labassay.sifra === test.test.sifra) && (element.retest = true)) {
                        //******************************************************** */
        let set = {}
        var age = starost.get(result.patient.jmbg)
        test.reference = test.reference.sort(function (a, b) {
          return a.dDob.localeCompare(b.dDob, undefined, {
            numeric: true,
            sensitivity: 'base'
          })
        })
        test.reference.forEach(ref => {
          set = reference.get(
            test.test.naziv, 
            "", 
            ref.grupa, 
            ref.spol,
            result.patient.spol,
            ref.refd, 
            ref.refg, 
            ref.interp,
            ref.extend,
            "", 
            "",
            "",
            "", 
            "", 
            age, 
            ref.dDob,
            ref.gDob,
            result.patient.jmbg                           
          )
  
          if (set.hasOwnProperty('grupa')) {
            element.interp = set.interp
            element.extend = set.extend
            element.refd = set.refd
            element.refg  = set.refg
          }
        })
    //******************************************************** */
                                                            element.retest = false // Ne postavljati ovdje, nego kada dođe rezultat.
                                                            result.updated_at = Date.now()
                                                            element.rezultat.push(rezultat)
                    
                                                            uzorak.status = "U OBRADI"
                                                            if (element.rezultat.length < 1) {
                                                              element.status = "NIJE ODOBREN"
                                                            }
                                                            if (element.status != "ODOBREN") {
                                                              element.status = "NIJE ODOBREN"
                                                              uzorak.save()
                                                              var received = elementu.labassay.naziv
                                                              console.log(':: Dosao test sa Maglumi X3: ' + elementu.labassay.naziv)
                    
                                                              result.save(function (err, novi) {
                                                                if (err) {
                                                                  console.log("Greška:", err);
                                                                } else {
                                                                  console.log("Rezultat sačuvan.")
                                                                  var komplet = true
                                                                  var formula = []
                                                                  var tocalculate = ''
                    
                                                                  novi.rezultati.forEach(element => {
                                                                    if (!element.rezultat.length) {
                                                                      komplet = false
                                                                    }
                                                                    if ((element.retest)) {
                                                                      komplet = false
                                                                    }
                                                                    if (element.labassay.calculated) {
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
                                                                            if (rez.labassay.equals(mongoose.Types.ObjectId(required.labassay))) {                                                          
                                                                              formula = element.labassay.calculatedFormula
                                                                              if (rez.rezultat.length > 0) {
                                                                                // arr.forEach((o, i, a) => a[i] = myNewVal) 
                                                                                formula.forEach((clan, i, array) => {
                                                                                  if (clan.length > 10) {
                                                                                    if (rez.labassay.equals(mongoose.Types.ObjectId(clan))) {
                                                                                      if (clan.toString() === "5b26802f3f43090ff16de6bd") {
                                                                                        tpsa = rez.rezultat[rez.rezultat.length - 1].rezultat_f
                                                                                      } // t-PSA, Čarovac Lab, $store.state.site: 5b6caf696a0f4166f4da989b
                                                                                      if (clan.toString() === "5b2649d6bdd64e0d0749e483") {
                                                                                        fe = rez.rezultat[rez.rezultat.length - 1].rezultat_f
                                                                                      } // Željezo, Čarovac Lab, $store.state.site: 5b6caf696a0f4166f4da989b
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
                                                                                  
                                                                                  AnaAssays.findOne({ test: element.labassay._id }).populate('aparat test').exec(function (err, testap) {
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
                                                                                        anaassay: testap._id,
                                                                                        // rezultat_f:eval(final).toFixed(2),
                                                                                        rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'ARCHITECT'),
                                                                                        jedinice_f: element.labassay.jedinica,
                                                                                        vrijeme_prijenosa: Date.now(),
                                                                                        vrijeme_rezultata: Date.now(),
                                                                                        odobren: false,
                                                                                      })
                                                                                      uzorak.tests.forEach(elementup => {
                                                                                        if (elementup.labassay.equals(element.labassay._id)) {
                                                                                          elementup.status_t = "REALIZOVAN"
                                                                                        }
                                                                                      })
                                                                                      uzorak.save()
                                                                                      novi.save()
                                                                                      console.log('Izvršeno.')
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
                                                                  if (komplet) {
                                                                    //io.emit('kompletiran', novi.id, uzorak.site, "sekc")
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
                                          })
                                        }
                                      }
                                    }
                                  })
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
        //callback(Result_Response)
  
    }, 
    order_query: function (record, serijski,callback) {
        var mongoose = require("mongoose");
        var starost = require("../../funkcije/shared/starostReferentne")
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
                    Order_Response  += 'MSH|^~\\&|||||'+ makedate(stamp)+"||QCK^QO2|"+ack_key+"|P|2.3.1||||||ASCII|||"+"\u000d"
                    // 'MSH|^~\\&|||||'+makedate(new Date())+'||ACK^R01|2|P|2.3.1||||0||ASCII|||'+"\u000d"
                    Order_Response += "MSA|AA|"+ack_key+"|"+"Message accepted"+"|||0|"+"\u000d"
                    Order_Response  += "ERR|0|"+"\u000d"
                    Order_Response  += "QAK|SR|OK|"+"\u000d" 
                    Order_Response = "\u000b"+Order_Response+"\u001c"+"\u000d"
                    break;
                  case 'SPM':
                    console.log("SPM: o");
                    console.log(segment);
                    Order_Response += "QAK|"+segment.split("|")[2]+"|OK|WOS^Work Order Step^IHELAW"+"\u000d"
                    sample_id = segment.split("|")[2]
                    var sid = sample_id.split("^")[0]
                    
                    console.log(segment.split("|")[2])
                    Order_Response  +=segment+"\u000d"
                    console.log(sample_id)
                    console.log(sid)
                    break;
                    case 'QRF':
                        break;
                 case 'QPD':
                        //console.log("QRD ");
                        //console.log(segment)
                        
                        sample_id = segment.split("|")[3]
                        rack_id = sample_id.split("^")[2]
                        tube_pos = sample_id.split("^")[3]
                        sample_id = sample_id.split("^")[0]
                       
                        Samples.findOne({ id: sample_id }).populate('tests.labassay').exec(function (err, uzorak) {
                          if (err) {
                            console.log("Greška:", err);
                          }
                          else {
                            if (uzorak === null) {
                              console.log("U LIS-u ne postoji uzorak sa brojem: " + sample_id);
                              Order_Response = "\u000b"+Order_Response+"\u001c"+"\u000d"
                             
                              console.log(ack_key)
                              Order_Download  += 'MSH|^~\\&|||||'+ makedate(stamp)+"||QCK^QO2|"+ack_key+"|P|2.3.1||||||ASCII|||"+"\u000d"

                              Order_Download  += "MSA|AA|"+ack_key+"|"+"Message accepted"+"|||0|"+"\u000d"
                              Order_Download  += "ERR|0|"+"\u000d"
                              Order_Download  += "QAK|SR|NF|"+"\u000d"
                              Order_Download = "\u000b"+Order_Download+"\u001c"+"\u000d"
                              var negquery= Order_Download
                              callback(Order_Download);
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
                                    Order_Download  += 'MSH|^~\\&|Atom||||'+ makedate(stamp)+"||OML^O33|2|P|2.5|||NE|NE||UTF-8"+"\u000d"
                                    //                  MSH|^~\\&|       |    |       |       |20210124143307      ||QRY^Q02|7|P|2.3.1||||||ASCII|||
                                    Order_Download  += "MSA|AA|"+ack_key+"|"+"Message accepted"+"|||0|"+"\u000d"
                                    Order_Download  += "ERR|0|"+"\u000d"
                                    Order_Download  += "QAK|SR|NF|"+"\u000d"
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
                                    
                                    //MSH|^~\\&|Maglumi X3||Lis||20240227134826||OML^O33|2|P|2.5|||NE|NE||UTF-8
                                    //Order_Download += 'MSH|^~\\&|||||'+ makedate(stamp)+"||DSR^QO3|"+ack_key+"|P|2.3.1||||||ASCII|||"+"\u000d"
                                    Order_Download += 'MSH|^~\\&|Atom||Maglumi X3||'+ makedate(stamp)+"||OML^O33|"+ack_key+"|P|2.5|||NE|NE||UTF-8"+"\u000d"


                                    var prezime = rezultat.patient.prezime
                                    var rime = rezultat.patient.ime
                                    var ime = prezime+' '+rime
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
                                      spol = "1"
                                    }else{
                                      spol = "2"
                                    }
                                    var godiste = rezultat.patient.jmbg.slice(4, 7);
                                    var age = starost.get(rezultat.patient.jmbg)
                                    if (godiste[0] === "9") {
                                            godiste = "1" + godiste;
                                          }
                                    if (godiste[0] === "0") {
                                            godiste = "2" + godiste;
                                          }
                                    var dob = godiste+ rezultat.patient.jmbg.slice(2, 4)+rezultat.patient.jmbg.slice(0, 2)
                                    //PID|1||34||elmir^gasal||19820721||Male
                                    Order_Download  += "PID|1||"+uzorak.pid+"||"+ime+"||"+dob+"|"+spol+"||||||||||||||||||||||||||||||"+age+"^1"+"\u000d"//Patient Name
                                    //SPM|1|S014M40227^^^NA003^1||0|||||||P||||||||

                                    Order_Download  += "SPM|1|"+rezultat.id+"^^^"+rack_id+"^"+tube_pos+"||0|||||||P"+"\u000d"//Birthday
                                    //ORC|NW||||||0||20240227034936|||
                                    Order_Download  += "ORC|NW||||||0||"+makedate(stamp)+"|||"+"\u000d"
                                   
                                    //OBR|1|||FT3^
                                    ///OBR|2|||FT4^
                                    //-----------------
                                    console.log('testovi:'+testovi.length)
                                    console.log(testovi)
                                    cnt = 0
                                    testovi.forEach(element => {     
                                        cnt++      
                                        Order_Download += "OBR|"+cnt+"|||"+element.kod+""+"\u000d"
                                    });
                                    //Order_Download  += "NTE|1"+"\u000d"
                                    //-----------------
                                    console.log(JSON.stringify(Order_Download))
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