module.exports = {

  parsaj_rezultat: function(record,io){

    var mongoose = require("mongoose");
    
    var Samples = require("../../models/Postavke");
    var Samples = mongoose.model("Samples");

    var AnaAssays = require("../../models/Postavke");
    var AnaAssays = mongoose.model("AnaAssays");

    var Results = require("../../models/Postavke");
    var Results = mongoose.model("Results");

 


    var calculated = require("../../funkcije/calculated/calculated");
    

    var sn='';
    var sifra_p='';
    var vrijeme_prijenosa='';
    var gender='';
    var sid = '';
    var qc = false
    var type_of_r='';
    var dilucija='';
    var reagens_lot ='';
    var reagens_sn ='';
    var rezultat_f = '';
    var jedinice_f = '';
    var vrijeme_rezultata='';
    var module_sn='';

    var spol='';
    var jmbg=''; 
    var tpsa = "";
    var fe = "";
   
    var result = [];
    var chunks=[];


        record.forEach(function(element) {
            record_type =element.charAt(0);
            switch (record_type) {
                        case 'H':
                                  console.log("header");
                                  var header= element.split("|");
                                  var sender=header[4].split("^");
                                  sn='111283';
                                  vrijeme_prijenosa=header[13];
                                  console.log(vrijeme_prijenosa);
                                  break;
                        case 'P':
                                  console.log("patient");
                                  var patient= element.split("|");
                                  gender=patient[8];
                                  console.log("gender:"+gender);
                                  break;
                        case 'O':
                                  console.log("order");
                                  var order = element.split("|");
                                  var pomSID = order[2].split("^");
                                  sid = pomSID[0];
                                  sid = sid.replace(/^0+/, '');
                                  if(order[11] ==='Q'){
                                    qc = true
                                    console.log('kontrolni uzorak')
                                  }
                                  var broj =sid.length
                                  var param = ''
                                  switch (broj) {
                                    case 1:
                                            param = "00"
                                      break;
                                      case 2:
                                        param = "0"
                                  break;
                                    default:
                                      break;
                                  } 
                                  sid="S"+param+sid+"B"+"00828"
                                  console.log("sid:"+sid);
                                  break;
                        case 'R':
                                  console.log("rezultat");

                                  Samples.findOne({id: sid}).populate('patient tests.labassay').exec(function (err, uzorak) {
                                      if (err) {
                                        console.log("Greška:", err);
                                      }
                                      else {
                                            //-----------------------
                                            if(uzorak===null){
                                                console.log('U LIS-u ne postoji unesen order za uzorak broj:'+sid);
                                            }else{
                                            var sekc = uzorak.tests[0].labassay.sekcija
                                            console.log(" Uzorak pronadjen");
                                            if (uzorak.status != "OBRAĐEN"){
                                              result = element.split("|");
                                              chunks=result[2].split("^");
                                              sifra_p=chunks[3];
                                              if(!isNaN(result[3])){
                                                     var rezultat_f = parseFloat(result[3]).toFixed(2);
                                                  }else{
                                                       var rezultat_f = result[3]
                                                       }
                                              var jedinice_f = result[4];
                                              vrijeme_rezultata=result[12];
                                              module_sn='251714';
                                            AnaAssays.findOne({kod:sifra_p}).populate('test').lean().exec(function (err, test) {
                                              if (err) {
                                                console.log("Greška:", err);
                                              }
                                              else {
                                                    //---------------------------------------
                                                    //console.log(test)
                                                    if(test===null){
                                                      console.log('U LIS-u ne postoji definisan test sa sifrom:'+sifra_p+' ni na jednom aparatu'+sn);
                                                    }else{
                                                    uzorak.tests.forEach(elementu => {   
                                                                                               
      if((elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "REALIZOVAN") ||(elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "ZAPRIMLJEN") ||(elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_t === "U OBRADI") || (elementu.labassay.sifra.trim() === test.test.sifra.trim() && elementu.status_r)){//elementu.status_r)){
                                                        console.log('match pronadjen')
                                                        //console.log(elementu)
                                                        elementu.status_t = "REALIZOVAN"
                                                        elementu.status_r = false
                                                        var rezultat={};
                                                        rezultat.anaassay = test
                                                        rezultat.sn = sn
                                                        rezultat.vrijeme_prijenosa=vrijeme_prijenosa
                                                        rezultat.vrijeme_rezultata=vrijeme_rezultata
                                                        rezultat.dilucija='dilucija'
                                                        rezultat.module_sn=module_sn
                                                        rezultat.reagens_lot='reagens_lot'
                                                        rezultat.reagens_sn='reagens_sn'
                                                        rezultat.rezultat_f=rezultat_f
                                                        rezultat.jedinice_f=jedinice_f
                                                        rezultat.rezultat_p='rezultat_p'
                                                        rezultat.jedinice_p='jedinice_p'
                                                        rezultat.rezultat_i='rezultat_i'
                                                        rezultat.odobren=false
                                                        var json ={};
                                                        json.labassay = test.test
                                                        json.rezultat = []
                                                        json.rezultat.push(rezultat)
                                                        console.log(elementu.labassay.naziv+" "+rezultat_f+"="+jedinice_f)
                                                        Results.findOne({id: uzorak.id}).populate('rezultati rezultati.labassay patient').exec(function (err, result) {
                                                          if (err) {
                                                            console.log("Greška:", err)
                                                          }
                                                          else {
                                                            if(result.created_at === null){
                                                              result.created_at = Date.now()
                                                            }
                                                            spol = result.patient.spol
                                                            jmbg = result.patient.jmbg
                                                            //console.log(result)
                                                            var counter = 0
                                                            result.rezultati.forEach(element => {
                                                              counter++
                                                              if((element.labassay.sifra ===test.test.sifra) && (element.retest = true)){
                                                                
                                                                element.retest = false // ne postavljati ovdje, nego kada dodje rezultat
                                                                result.updated_at = Date.now()
                                                                element.rezultat.push(rezultat) 
                                                                
                                                                uzorak.status = "U OBRADI"
                                                                if(element.rezultat.length < 1){
                                                                  element.status = "NIJE ODOBREN"
                                                                }
                                                                if(element.status !="ODOBREN"){
                                                                  element.status = "NIJE ODOBREN"                                                             
                                                                  uzorak.save()
                                                                  var received = elementu.labassay.naziv
                                                                  console.log(':: Dosao test sa Erba XL 200: ' + elementu.labassay.naziv)
   
                                                                  result.save(function(err,novi) {
                                                                    if(err) {
                                                                            console.log("Greška:", err);
                                                                    } else {
                                                                      console.log("Rezultat sacuvan") 
                                                                      var komplet = true
                                                                      var formula = []
                                                                      var tocalculate = ''

                                                                      novi.rezultati.forEach(element => {
                                                                          if(!element.rezultat.length){
                                                                            komplet = false
                                                                          }
                                                                          if((element.retest)){
                                                                            komplet = false
                                                                          }
                                                                          if(element.labassay.calculated){
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
                                                                                  if (rez.labassay.equals(mongoose.Types.ObjectId(required.labassay))){                                                                                      
                                                                                    formula = element.labassay.calculatedFormula
                                                                                    if(rez.rezultat.length > 0){
                                                                                     // arr.forEach((o, i, a) => a[i] = myNewVal) 
                                                                                        formula.forEach((clan,i,array) => {
                                                                                          if(clan.length > 10){
                                                                                            if (rez.labassay.equals(mongoose.Types.ObjectId(clan))) {                                                                                                
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
                                                                                          
                                                                                          AnaAssays.findOne({test:element.labassay._id}).populate('aparat test').exec(function (err, testap) {
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
                                                                                                anaassay:testap._id,
                                                                                                // rezultat_f:eval(final).toFixed(2),
                                                                                                rezultat_f: calculated.rezultat(final, spol, jmbg, tocalculate, tpsa, fe, uzorak.id, 'Erba XL 200'),
                                                                                                jedinice_f:element.labassay.jedinica,
                                                                                                vrijeme_prijenosa:Date.now(),
                                                                                                vrijeme_rezultata:Date.now(),
                                                                                                odobren:false,
                                                                                              })
                                                                                              uzorak.tests.forEach(elementup => {
                                                                                                if(elementup.labassay.equals(element.labassay._id)){
                                                                                                  elementup.status_t = "REALIZOVAN"
                                                                                                }
                                                                                              }) 
                                                                                              uzorak.save()
                                                                                              novi.save()
                                                                                              console.log('izvrsen')
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
                                                                      if(komplet){
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
                                            });
                                          }
                                        }
                                      }
                                    });    


                                  break;
                        case 'C':
                                  console.log("komentar");
                                  break;
                        case 'L':
                                  console.log("terminator");
                           
                                  break;
                        default:
                                  console.log("Nepozanat tip frame-a..");
                          }
        });
  },

  };
