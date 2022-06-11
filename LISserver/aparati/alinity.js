module.exports = {

    parsaj_rezultat: function (record, io,serijski) {
  
      var mongoose = require("mongoose");
  
      var Samples = require("../../models/Postavke");
      var Samples = mongoose.model("Samples");
  
      var AnaAssays = require("../../models/Postavke");
      var AnaAssays = mongoose.model("AnaAssays");
  
      var Results = require("../../models/Postavke");
      var Results = mongoose.model("Results");
  
  
      var calculated = require("../../funkcije/calculated/calculated");
  
  
      var sn = '';
      var sifra_p = '';
      var vrijeme_prijenosa = '';
      var gender = '';
      var sid = '';
      var qc = false
      var type_of_r = '';
      var dilucija = '';
      var reagens_lot = '';
      var reagens_sn = '';
      var rezultat_f = '';
      var jedinice_f = '';
      var vrijeme_rezultata = '';
      var module_sn = '';
  
      var spol = '';
      var jmbg = '';
      var tpsa = "";
      var fe = "";
  
      record.forEach(function (element) {
        record_type = element.charAt(0);
        switch (record_type) {
          case 'H':
            console.log("Header: ");
            var header = element.split("|");
            var sender = header[4].split("^");
            sn = sender[2];
            vrijeme_prijenosa = header[13];
            console.log("Vrijeme prenosa: " + vrijeme_prijenosa);
            break;
          case 'P':
            console.log("Patient: ");
            var patient = element.split("|");
            gender = patient[8];
            console.log("Gender: " + gender);
            break;
          case 'O':
            console.log("Order: ");
            var order = element.split("|");
            sid = order[2];
            if (order[11] === 'Q') {
              qc = true
              console.log('Kontrolni uzorak: ')
            }
            console.log("SID: " + sid);
            break;
          case 'R':
            console.log("Rezultat: ");
            var result = element.split("|");
            var chunks = result[2].split("^");
            type_of_r = chunks[10];
            switch (type_of_r) {
              case 'F':
                console.log("Type: " + type_of_r);
                sifra_p = chunks[3];
                dilucija = chunks[5];
                reagens_lot = chunks[7];
                reagens_sn = chunks[8];
                if (!isNaN(result[3])) {
                  rezultat_f = parseFloat(result[3]); //.toFixed(2);
                } else {
                  rezultat_f = result[3]
                }
                jedinice_f = result[4];
                vrijeme_rezultata = result[12];
                module_sn = result[13];
                console.log("sifra: " + sifra_p);
                console.log("dilucija: " + dilucija);
                console.log("reagens_lot: " + reagens_lot);
                console.log("reagens_sn: " + reagens_sn);
                console.log("rezultat_f: " + rezultat_f);
                console.log("jedinice_f: " + jedinice_f);
                console.log("vrijeme: " + vrijeme_rezultata);
                console.log("module_sn: " + module_sn);
                break;
              case 'P':
                console.log("Type: " + type_of_r);
                var rezultat_p = result[3];
                var jedinice_p = result[4];
                console.log("rezultat_p: " + rezultat_p);
                break;
              case 'I':
                console.log("Type: " + type_of_r);
                var rezultat_i = result[3];
                console.log("rezultat_i: " + rezultat_i);
                break;
              default:
                console.log("Nepozanat tip rezultata!");
            }
  
            break;
          case 'C':
            console.log("Komentar: ");
            break;
          case 'L':
            console.log("Terminator: ");
            if (qc) {
  
              Kontrole.find({}).populate('aparat reference.anaassay').exec(function (err, kontrola) {
                if (err) {
                  console.log("Greška:", err);
                }
                else {
                  if (kontrola.length) {
                    console.log('Checkpoint 1, on line 131: ')
  
                    kontrola.forEach(element => {
  
                      if (element.aparat.sn === sn && element.tip === 'POJEDINAČNA') {
                        console.log('Checkpoint 2, on line 136: ')
                        element.reference.forEach(clan => {
                          // console.log(clan)
                          if (clan.anaassay.kod === sifra_p) {
                            AnaAssays.findOne({ kod: sifra_p }).populate('test').lean().exec(function (err, test) {
                              if (err) {
                                console.log("Greška:", err);
                              }
                              else {
                                // console.log(test)
                                if (test) {
                                  controlSample = {}
                                  controlSample.id = sid
                                  controlSample.aparat = element.aparat._id
                                  controlSample.kontrola = element._id
                                  controlSample.status = 'REALIZOVAN'
                                  controlSample.tests = [{
                                    labassay: test.test._id,
                                    anaassay: test._id,
                                    status: 'REALIZOVAN',
                                    rezultat: [{
                                      sn: sn,
                                      vrijeme_prijenosa: vrijeme_prijenosa,
                                      vrijeme_rezultata: vrijeme_rezultata,
                                      dilucija: dilucija,
                                      module_sn: module_sn,
                                      reagens_lot: reagens_lot,
                                      reagens_sn: reagens_sn,
                                      rezultat_f: rezultat_f,
                                      jedinice_f: jedinice_f,
                                      rezultat_p: rezultat_p,
                                      jedinice_p: jedinice_p,
                                      rezultat_i: rezultat_i
                                    }]
                                  }]
                                  var sample = new ControlSamples(controlSample);
                                  sample.save(function (err, sample) {
                                    if (err) {
                                      console.log("Greška:", err);
                                    } else {
                                      console.log("Kontrolni Uzorak uspješno sačuvan!");
                                    }
                                  });
                                }
                              }
                            })
                          }
                        })
                      }
                    })
                  } else {
                    console.log('Nema definisanih kontrola!')
                  }
                }
              })
            } else {
              if (isNaN(sid.charAt(2))) {
                console.log('Najvjerovatnije naš Control Sample!')
                ControlSamples.findOne({ id: sid }).populate('aparat kontrola tests.labassay tests.anaassay').exec(function (err, uzorak) {
                  if (err) {
                    console.log("Greška:", err);
                  }
                  else {
                    if (uzorak) {
                      console.log('Parsanje kontrole...')
                      var rezultat = {}
  
                      uzorak.tests.forEach(element => {
                        if (element.anaassay.kod === sifra_p) {
                          if (uzorak.kontrola.tip === "POJEDINAČNA") {
                            uzorak.status = "REALIZOVAN"
                          }
                          if (uzorak.kontrola.tip === "MULTI") {
                            uzorak.status = "REALIZOVAN"
                          }
                          element.status = "REALIZOVAN"
                          rezultat = {
                            sn: sn,
                            vrijeme_prijenosa: vrijeme_prijenosa,
                            vrijeme_rezultata: vrijeme_rezultata,
                            dilucija: dilucija,
                            module_sn: module_sn,
                            reagens_lot: reagens_lot,
                            reagens_sn: reagens_sn,
                            rezultat_f: rezultat_f,
                            jedinice_f: jedinice_f,
                            rezultat_p: rezultat_p,
                            jedinice_p: jedinice_p,
                            rezultat_i: rezultat_i
                          }
                          element.rezultat.push(rezultat)
  
                        }
                      })
                      uzorak.save()
                      console.log('Kontrola sačuvana.')
                    } else {
  
                      console.log("U LIS-u ne postoji uzorak sa brojem: " + sid);
  
                    }
                  }
                })
              } else {
                Samples.findOne({ id: sid }).populate('patient tests.labassay').exec(function (err, uzorak) {
                  if (err) {
                    console.log("Greška:", err);
                  }
                  else {                  
                    if (uzorak === null) {
                      console.log('U LIS-u ne postoji definisan order za uzorak broj: ' + sid);
                    } else {
                      var sekc = uzorak.tests[0].labassay.sekcija
                      console.log("Uzorak pronađen");
                      if (uzorak.status != "OBRAĐEN") {
                        AnaAssays.findOne({ kod: sifra_p,aparat:mongoose.Types.ObjectId(serijski) }).populate('test').lean().exec(function (err, test) {
                          if (err) {
                            console.log("Greška:", err);
                          }
                          else {
                            // console.log(test)
                            if (test === null) {
                              console.log('U LIS-u ne postoji definisan test sa sifrom:' + sifra_p + ' ni na jednom aparatu' + sn);
                            } else {
                              uzorak.tests.forEach(elementu => {
  
                                if ((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") || (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)) {
                                  console.log('Match Found')
                                  // console.log(elementu)
                                  elementu.status_t = "REALIZOVAN"
                                  elementu.status_r = false
                                  var rezultat = {};
                                  rezultat.anaassay = test
                                  rezultat.sn = sn
                                  rezultat.vrijeme_prijenosa = vrijeme_prijenosa
                                  rezultat.vrijeme_rezultata = vrijeme_rezultata
                                  rezultat.dilucija = dilucija
                                  rezultat.module_sn = module_sn
                                  rezultat.reagens_lot = reagens_lot
                                  rezultat.reagens_sn = reagens_sn
                                  rezultat.rezultat_f = rezultat_f
                                  rezultat.jedinice_f = jedinice_f
                                  rezultat.rezultat_p = rezultat_p
                                  rezultat.jedinice_p = jedinice_p
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
                                            console.log(':: Dosao test sa ARCHITECT: ' + elementu.labassay.naziv)
  
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
                                                  io.emit('kompletiran', novi.id, uzorak.site, sekc)
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
              }
            } // if not QC
            break;
          default:
            console.log("Nepoznat Type of Frame!");
        }
      });
    },
    connection_test: function (record, callback) {
        console.log('Connection TEST sucecessful')
        var Parts = record.split("|");
        var hostData = "MSH|^~\\&|atom-lis|MainLab|Alinity ci|Lab2|20160801021528||ACK^N02^ACK|45bd3540-39d1-4500-b3d5-bd668f752dd3|P|2.5.1||||||UNICODE UTF-8"+"\u000d"
        hostData +=  "MSA|AA|"+Parts[9]+"\u000d"
        hostData = "\u000b" +hostData +"\u001c"+"\u000d"
        console.log(JSON.stringify(hostData))
        callback(hostData);

    },
    order_query: function (record, callback) {
        var mongoose = require("mongoose");
        var Order_Response = ""
        var Order_Download = ""
        var sample_id = ""
        var testovi  =[]
        var segments = record.split("\r")

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
        segments.forEach(function (segment) {
            segment_type = segment.substring(0,3);
            switch (segment_type) {
                 case 'MSH':
                    console.log("MSH: ");
                    Order_Response  += "MSH|^~\\&|atom-lis||||20200801015944||RSP^K11^RSP_K11|e2703c29-8392-48f5-b085-9664475fcfba|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-27^IHE"+"\u000d"
                    console.log(segment)
                    var ack_key = segment.split("|")[9]
                    console.log(ack_key)
                    Order_Response += "MSA|AA|"+ack_key+"\u000d"
                    break;
                  case 'QPD':
                    console.log("QPD: ");
                    Order_Response += "QAK|"+segment.split("|")[2]+"|OK|WOS^Work Order Step^IHELAW"+"\u000d"
                    console.log(segment)
                    sample_id = segment.split("|")[3]
                    Order_Response  +=segment+"\u000d"
                    console.log(sample_id)
                    break;
                 case 'RCP':
                        console.log("RCP ");
                        console.log(segment)
                        Samples.findOne({ id: sample_id }).populate('tests.labassay').exec(function (err, uzorak) {
                          if (err) {
                            console.log("Greška:", err);
                          }
                          else {
                            if (uzorak === null) {
                              console.log("U LIS-u ne postoji uzorak sa brojem: " + sample_id);
                              Order_Response = "\u000b"+Order_Response+"\u001c"+"\u000d"
                              Order_Download  += "MSH|^~\\&|atom-lis||||20200801015944||OML^O33^OML_O33|e2703c29-8392-48f5-b085-9664475fcfba|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-28^IHE"+"\u000d"
                              Order_Download  += "SPM|1|||''|||||||U^Unknown^HL70369"+"\u000d"
                              Order_Download  += "SAC|||02231522041700"+"\u000d"
                              Order_Download  += "ORC|DC||||||||20160725022110"+"\u000d"
                              Order_Download = "\u000b"+Order_Download+"\u001c"+"\u000d"
                              var negquery= Order_Response+"\u000f"+Order_Download
                              callback(negquery);
                            } else {   
                              

                              Order_Response = "\u000b"+Order_Response+"\u001c"+"\u000d"

                              AnaAssays.find({site:mongoose.Types.ObjectId("5c69f68c338fe912f99f833b")}).populate('aparat test').lean().exec(function (err, anaassays) {
                                uzorak.tests.forEach(function (test) {
                                  anaassays.forEach(function (anaassay) {
                                    if ((anaassay.test.sifra === test.labassay.sifra) && (anaassay.test.calculated)) {
                                      test.status_t = "U OBRADI"
                                    }
                                    if (((anaassay.test.sifra === test.labassay.sifra) && (test.status_r === true) ) || ( (anaassay.test.sifra === test.labassay.sifra) && (test.status_t === "ZAPRIMLJEN") )) {
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
                                    Order_Download  += "MSH|^~\\&|atom-lis||||"+ makedate(stamp)+"||OML^O33^OML_O33|e2703c29-8392-48f5-b085-"+makeid(4)+"-"+makeid(12)+"|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-28^IHE"+"\u000d"
                                    Order_Download  += "SPM|1|||''|||||||U^Unknown^HL70369"+"\u000d"
                                    Order_Download  += "SAC|||"+uzorak.id+"\u000d"
                                    Order_Download  += "ORC|DC||||||||"+ makedate(stamp)+"\u000d"
                                    Order_Download = "\u000b"+Order_Download+"\u001c"+"\u000d"
                                    var negquery= Order_Response+"\u000f"+Order_Download
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
                                    
                                    Order_Download += "MSH|^~\\&|atom-lis||||"+ makedate(stamp)+"||OML^O33^OML_O33|e2703c29-1362-48f5-"+makeid(4)+"-"+makeid(12)+"|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-28^IHE"+"\u000d"
                                                        

                                    
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
                                      spol = "M"
                                    }else{
                                      spol = "F"
                                    }
                                    var godiste = rezultat.patient.jmbg.slice(4, 7);

                                    if (godiste[0] === "9") {
                                            godiste = "1" + godiste;
                                          }
                                    if (godiste[0] === "0") {
                                            godiste = "2" + godiste;
                                          }
                                    var starost = godiste+ rezultat.patient.jmbg.slice(2, 4)+rezultat.patient.jmbg.slice(0, 2)
                                    Order_Download += "PID|||"+rezultat.patient.jmbg+"||"+ime+"^^^^^L||"+starost+"|"+spol+"\u000d"
                                    Order_Download += "PV1||N|^ER 2"+"\u000d"
                                    Order_Download += "SPM|1|||''|||||||P^Patient^HL70369"+"\u000d"
                                    Order_Download += "SAC|||"+uzorak.id+"\u000d"
                                    
                                    //-----------------
                                    console.log('testovi:'+testovi.length)
                                    console.log(testovi)
                                    testovi.forEach(element => {           
                                        dilution = ''
                                        Order_Download += "ORC|NW||||||||"+makedate(stamp)+"\u000d"
                                        Order_Download += "TQ1|1||||||||R^Routine^HL70485"+"\u000d" //S^STAT^HL70485
                                        Order_Download += "OBR||"+element.ordernr+"||"+element.kod.replace(/^0+/, '')+"^"+element.ime+"^99ABT|||||||A"+"\u000d"
                                        Order_Download += "NTE|0||Order comment"+"\u000d"
                                      
                                    });
                                    //-----------------
            
                                  // console.log('ORDER RESPONSE')
                                  //   console.log(JSON.stringify(Order_Response))
                                  //    console.log('ORDER DOWNLOAD')
                                  //   console.log(JSON.stringify(Order_Download))
                                    Order_Download = "\u000b"+Order_Download+"\u001c"+"\u000d"
                                    var resp = Order_Response+"\u000f"+Order_Download
                                    callback(resp)
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
    order_query_resp: function (record, callback) {
      console.log('Query response')
      console.log(JSON.stringify(record))
  },
    specimen_result: function (record, callback) {
      var Result_Response = ""
      var segments = record.split("\r")
var sid = ""
var pid = ""
var result = ""
var assay = ""
var unit = ""
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
                  break;
                case 'PID':
                    pid = segment.split("|")[3]
                    console.log("PID: "+pid);

                      break;
                case 'PV1':
                    console.log("PV1: ");
  
                      break;
                case 'SPM':
                    console.log("SPM: ");
  
                      break;  
                case 'SAC':          
                      sid = segment.split("|")[3]
                      console.log("SAC: "+sid);
                      break;   
                case 'OBR':
                        console.log("OBR: ");
      
                      break; 
                case 'ORC':
                          console.log("ORC: ");
        
                      break; 
                case 'TQ1':
                          console.log("TQ1: ");
          
                      break; 
                case 'OBX':
                      var obx = segment.split("|")
                      switch (obx[2]) {
                          case "CE":
                            
                            break;
                          case "ST":
                                var comp = obx[3].split("^")
                                if(!comp[0].includes('.')){
                                    result = obx[5]
                                    assay = comp[0]
                                    unit = obx[6].split("^")[0]
                                    console.log("OBX: NUMERICAL" + result +" "+ assay + " "+ unit);
                                  }else{
                                    result = obx[5]
                                    assay = comp[0]
                                    unit = obx[6].split("^")[0]
                                    console.log("OBX: INTERPRETATION" + result +"RLU  "+ assay + " "+ unit);
                                  }
                                  
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
  };
  