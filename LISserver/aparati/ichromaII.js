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
       console.log("CHROMA RESULT")
        segments.forEach(function (segment) {
            segment_type = segment.substring(0,3);
            switch (segment_type) {
                 case 'MSH':
                    console.log("MSH: ");
                    Result_Response  += "MSH|^~\\&|atom-lis||||"+makedate(new Date())+"||ACK^R22^ACK|e2703c29-8392-48f5-b085-"+makeid(4)+"-"+makeid(12)+"|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-29^IHE"+"\u000d"
                    console.log(segment)
                    var ack_key = segment.split("|")[9]
                    console.log(ack_key)
                    Result_Response += "MSA|AA|"+ack_key+"\u000d"
                    Result_Response = "\u000b"+Result_Response+"\u001c"+"\u000d"
                    var vrijeme_prijenosa =  segment.split("|")[6]
                    sn = segment.split("|")[5]
                    console.log(vrijeme_prijenosa)
                    break;
                  case 'PID':
                      pid = segment.split("|")[2]
                      console.log("PID: "+pid);
                      sid=pid
                      //sid = "P002M11002"
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
                        console.log(obx);
                        switch (obx[2]) {
                            case "CE":
                              
                              break;
                            case "ST":
                                    
                              break; 
                            case "TX":
                                console.log("TX")

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
                                            switch (sifra_p) {
                                                case 'COVID-19 Ab':
                                                    sifra_p =  obx[5].split(" ")[0]  
                                                    break;
                                                case 'D-Dimer'://ug/mL
                                                    if(obx[6] !="ug/mL"){
                                                      sifra_p = "N-A"
                                                    }else{
                                                      obx[6] = obx[6].replace("u","μ") 
                                                    }   
                                                    if(obx[6] ==="ng/mL"){
                                                      sifra_p = "D-Dimer"
                                                      obx[5] = (parseFloat(obx[5])/ 1000).toFixed(1);
                                                      obx[6] ="ug/mL"
                                                    }                                                 
                                                    break;  
                                                case 'HbA1c'://%
                                                      if(obx[6] !="%"){
                                                        sifra_p = "N-A"
                                                      }
                                                    break;                                           
                                                default:
                                                    break;
                                            }
                                            if(sifra_p ==="IgM" || sifra_p ==="IgG" ){
                                                //sifra_p = sifra_p+ " " + obx[5].split(" ")[0]
                                                obx[5] = obx[5].split(" ")[1]
                                            }
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
                                                console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + '  na aparatu chroma II sn: ' + sn);
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
                                                              console.log(':: Dosao test sa CHROMA II: ' + elementu.labassay.naziv)
                    
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
        callback(Result_Response)
  
    },  
}