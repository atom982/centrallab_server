
// ========
module.exports = {
  checksum: function (frame) {//provjera checksum-a dolazeceg frame-a
    var incoming_checksum='';
    var suma_prep='';
      if(frame.indexOf("\u0003")>0){
         incoming_checksum=frame.substring(frame.indexOf("\u0003")+1,frame.indexOf("\u0003")+3);
         suma_prep = frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")+1);
         //console.log('pripremni frame:')
         //console.log(JSON.stringify(suma_prep))
      }
      if(frame.indexOf("\u0017")>0){
        incoming_checksum=frame.substring(frame.indexOf("\u0017")+1,frame.indexOf("\u0017")+3);
        suma_prep = frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0017")+1);
      }

      var hex = [];

      	for(var i=0;i<suma_prep.length;i++) {
          
          switch (suma_prep.charCodeAt(i)) {
            case 181:
            hex.push(parseInt('375').toString(16)); 
              break;
            case 65533:
            hex.push(parseInt('181').toString(16)); 
           
            break;
            default:
            hex.push(suma_prep.charCodeAt(i).toString(16));
              break;
          }
          
      	}

        var suma_dec = 0;
        hex.forEach(function(element) {
            suma_dec += hextoDec(element);

        });
        var suma_dec_to_hex = suma_dec.toString(16).toUpperCase();
 
        var checksum = suma_dec_to_hex.substring(suma_dec_to_hex.length-2,suma_dec_to_hex.length);
        if(incoming_checksum == checksum){
          return true;
        }
        else{
          return false;
        }

    //------------------------------------
    function hextoDec(hex) {
        var num = 0;

        for(var x=0;x<hex.length;x++) {
            var hexdigit = parseInt(hex[x],16);
            num = (num << 4) | hexdigit;
        }
        return num;
    }
    //-------------------------------------
  },
  uredi_ETB: function (niz_poruka) {//izbaci ETB frame-ove iz dolazne poruke
    var tempmessage='';
    var niz_message =[];
    niz_poruka.forEach(function(frame){

                        if(frame.indexOf("\u0003")>0){
                          frame=tempmessage+frame.substring(frame.indexOf("\u0002")+2,frame.indexOf("\u0003")-1);
                          niz_message.push(frame);
                          tempmessage='';
                        }
                        if(frame.indexOf("\u0017")>0){

                            tempmessage+=frame.substring(frame.indexOf("\u0002")+2,frame.indexOf("\u0017")-1);
                        }

    });

    return niz_message;

},

  kreiraj_checksum: function(frame){//racunanje checksum-a za slanje

                            function hextoDec(hex) {
                                var num = 0;

                                for(var x=0;x<hex.length;x++) {
                                    var hexdigit = parseInt(hex[x],16);
                                    num = (num << 4) | hexdigit;
                                }
                                return num;
                            }

    if(frame.indexOf("\u0003")>0){

                var hex = [];
                for(var i=0;i<frame.length;i++) {
                  hex.push(frame.charCodeAt(i).toString(16));
                }

                var suma_dec = 0;
                hex.forEach(function(element) {
                    suma_dec += hextoDec(element);

                });
        suma_dec_to_hex = suma_dec.toString(16).toUpperCase();
        var checksum = suma_dec_to_hex.substring(suma_dec_to_hex.length-2,suma_dec_to_hex.length);
        return checksum;
    }

    if(frame.indexOf("\u0017")>0){
      var hex = [];
        for(var i=0;i<frame.length;i++) {
          hex.push(frame.charCodeAt(i).toString(16));
        }

        var suma_dec = 0;
        hex.forEach(function(element) {
            suma_dec += hextoDec(element);

        });

        suma_dec_to_hex = suma_dec.toString(16).toUpperCase();
        var checksum = suma_dec_to_hex.substring(suma_dec_to_hex.length-2,suma_dec_to_hex.length);
        return checksum;
    }

  },

kreiraj_poruku:function(data,callback){//slanje poruke za order iz frontend-a
  var mongoose = require("mongoose") 
  var Lokacija = require("../models/Postavke")
  var AnaAssays = mongoose.model("AnaAssays")
  var tmpAna = ''
  var ordeTosend = ''
console.log('funkcija kreiraj poruku')

switch (data.site) {
  case '5c69f68c338fe912f99f833b':
         tmpAna = '5c71b6f5c599d9279717a334'
    break;
  case '5c6b3386c6543501079f4889':
         tmpAna = '5c9fa69fa98ac9917fa9c2a2'
    break;
  default:
    break;
}

                                 
AnaAssays.find({
  aparat: mongoose.Types.ObjectId(tmpAna)
}).lean().exec(function (err, assays) {

  ordeTosend += '\u0018'  + data.site+'/'
  var count = 0
  data.uzorci.forEach(element => {

    ordeTosend += data.samples[count].sid + '^'
    //console.log(element)
    element.testovi.forEach(test => {
      assays.forEach(anaassay => {
        if (anaassay.kod === test.itemName.split('-')[0]) {

          ordeTosend += test.itemName + '^'
        } 
      });
    });

    ordeTosend += '|'
    count++
  });

  ordeTosend += '\u0009'
  callback(ordeTosend)
  //var io = req.app.get('socketio')
  //io.emit('BT1500', req.body.site)
  // var client = new net.Socket();
  // client.connect({
  //   port: process.env.lisPORT
  // });
  // client.write(ordeTosend)

  // client.end()
})

  
},


parsaj_rezultat: function (record, io) {
  // MedLAB: 5bc71402bf21a379083d6e07
  // Analysers
  // Erba ELite 3: "5bc85683048ce379ac50a0d6", Serijski broj: "960855"
  // Erba XL 200: "5bc8592c048ce379ac50a0f0", Serijski broj: "251025"
  // TOSOH AIA-360: "5bc859e9048ce379ac50a0f8", Serijski broj: "27026012"
  // Urilyzer 100 Pro: "5bc85a93048ce379ac50a105", Serijski broj: "6101157"
  // Erba ECL 105: "5bcb72b2717d866cf6c12f57", Serijski broj: "E0041-11-250716"

  var mythic18 = require("./aparati/mythic18");
  var ErbaXL200 = require("./aparati/erbaxl200");
  var erbalyteplus = require("./aparati/erbalyteplus");
  var Access2 = require("./aparati/access2");
  var ecl105 = require("./aparati/ecl105");
  var dxh500 = require("./aparati/dxh500");
  var au400 = require('./aparati/au480');
  var kx21 = require('./aparati/sysmexkx21');
  var clintekStatus = require('./aparati/clintekStatus');
  var cl900i= require('./aparati/cl900i');
  var bs380 = require('./aparati/bs380');

  console.log("Parsanje rezultata...");
  //console.log(record)
  var header = record[0].split("|");
  var sender = header[4].split("^");
  var _id = "";
  var sn = "";

  if (sender[0] === "MYTHIC 1") {
    sn = sender[0].trim();
  } else {
    sn = sender[2]; // Mythic
  }

  if (record[0].includes("KX21")) {
    sn = "A5303"; // Access 2ACCESS^572794
  }
  if (record[0].includes("clintekStatus")) {
    sn = "6721"; // Access 2ACCESS^572794
  }
  if (record[0].includes("BS-380")) {
    sn = "WS-68002729"; // Access 2ACCESS^572794
  }
console.log(sn)
  switch (sn) {
      case 'RM-02101641':  // ATRIJUM BC3200
      console.log('parsaj BC3200')
      bc3200.parsaj_rezultat(record,io);
      break; 
      case "6721":
      console.log("ClintekStatus ");
      console.log(record);
      var serijski = '600408e5f5e7ce7d39d4c203'
      clintekStatus.parsaj_rezultat(record, io,serijski);
      break;
      case 'A5303': // ATRIJUM BS 480
      console.log("sysmex kx 21");
      serijski = '600408ddf5e7ce7d39d4c1f3' // - done
      kx21.parsaj_rezultat(record,io,serijski);
      break;
      case 'WS-68002729': // ATRIJUM GORAZDE BS 380
      console.log("mindray BS-380");
      serijski = '61a14d0941f211dbeae32dbb' // - done
      bs380.parsaj_rezultat(record,io,serijski);
      break;
    default:
      console.log("Nije definisan aparat sa serijskim brojem: " + sn);
      break;

  }
},

parsaj_query: function (record, callback) {
  // MedLAB: 5bc71402bf21a379083d6e07
  // Analysers
  // Erba ELite 3: "5bc85683048ce379ac50a0d6", Serijski broj: "960855"
  // Erba XL 200: "5bc8592c048ce379ac50a0f0", Serijski broj: "251025"
  // TOSOH AIA-360: "5bc859e9048ce379ac50a0f8", Serijski broj: "27026012"
  // Urilyzer 100 Pro: "5bc85a93048ce379ac50a105", Serijski broj: "6101157"
  // Erba ECL 105: "5bcb72b2717d866cf6c12f57", Serijski broj: "E0041-11-250716"

  var ErbaELite3 = require("./aparati/elite3");
  var ErbaXL200 = require("./aparati/erbaxl200");
  var TOSOHAIA360 = require("./aparati/aia360");
  var Urilyzer100Pro = require("./aparati/urilyzer100pro");
  var ErbaECL105 = require("./aparati/ecl105");
  var Access2 = require("./aparati/access2");
  var au400 = require('./aparati/au480');
  var bs480 = require('./aparati/bs480');
  var cl900i= require('./aparati/cl900i');
  //console.log(record)

  var header = record[0].split("|");
  var sender = header[4].split("^");
  var sn = "";

  if (sender[1] === "CDRuby") {
    sn = sender[0].trim();
  } else {
    sn = sender[2];
  }
  if (record[0].includes("E 1394-97")) {
    sn = "251025"; // Erba XL 200
  }
  if (record[0].includes("ACCESS")) {
    sn = "572794"; // Access 2ACCESS^572794
  }
  if (record[0].includes("Mindry")) {
    sn = "YM-94001518"; // Access 2ACCESS^572794
  }
  if (record[0].includes("Mindray")) {
    sn = "BB1-96000515"; // Access 2ACCESS^572794
  }
  //Mindry
  switch (sn) {
    case "BB1-96000515": // Mindray bs 480
      console.log("Query Parsing: mindray cl900i");
      var serijski = '600408e5f5e7ce7d39d4c203'
      cl900i.parsaj_query(record,serijski, function (poruka) {
        console.log(poruka)
        callback(poruka);
      });
      break;
      case "YM-94001518": // Mindray bs 480
      console.log("Query Parsing: Mindray bs 480");
      var serijski = '600408ddf5e7ce7d39d4c1f3'
      bs480.parsaj_query(record,serijski, function (poruka) {
        console.log(poruka)
        callback(poruka);
      });
      break;
    default:
      console.log("Nije definisan aparat sa serijskim brojem: " + sn);
      break;
  }
},

parsaj_hl7: function(record,callback){

  //-------definicija protocola za aparat
  var alinity = require('./aparati/alinity')
  var bs480hl7= require('./aparati/bs480hl7')
  var bs380hl7= require('./aparati/bs380hl7')
  var cl900ihl7= require('./aparati/cl900ihl7')
  var bc5390= require('./aparati/bc5390')
  var bc5120= require('./aparati/bc5120')
  var ichroma =  require('./aparati/ichromaII');
  const net = require('net');
  //-------------------------------------//
  var Parts = record.split("|");
  var Type = Parts[8].split("^")
  var Segments = record.split("\r")
  var sn = ""
  console.log(Segments)
  if(record.includes('2.3.1')){
    sn = "CL-900i"
  }else{
    sn = Type[0]
  }
  //
if(Segments[0].includes('ORM')){
  sn = "ST-99002774"
}
if(Segments[0].includes('ORU')){
  sn = "ST-99002774"
}
if(Segments[0].includes('avaz')){
  sn = "TQ-78000089"
}
if(Segments[0].includes('gora')){
  sn = "TQ-88000089"
}
if(Segments[0].includes('BS-380')){
  sn = "WS-68002729"
}
if (Segments[0].includes("ichroma2")) {
  sn = "CHRM"; // Access 2ACCESS^572794
}
  // • Order Query
  // • Results Upload
  // • Test Status Update
  // • Sample Status Update
  // • Connection Test
  // • Assay Availability
  switch(sn){

    case 'TQ-78000089':  // BC5120
                          var serijski = "61ea64c7d772949f59ff2ee8"
                          console.log('Mindray BC5120 AVAZ')
                          //order_query
                          if(Type[0]==="ORU"){
                            bc5120.specimen_result(record,serijski,function(poruka){
                              callback(poruka);
                              });
                          }
                          if(Type[0]==="ORM"){
                            bc5120.order_query(record,serijski,function(poruka){
                              console.log('order created')
                              var tmp = poruka.split('\u000d')
                              console.log(tmp)
                              callback(poruka);
                              });
                          }
                              break;
    case 'TQ-88000089':  // BC5120
                              var serijski = "61a14c9b41f211dbeae32360"
                              console.log('Mindray BC5120 GORAZDE')
                              //order_query
                              if(Type[0]==="ORU"){
                                bc5120.specimen_result(record,serijski,function(poruka){
                                  callback(poruka);
                                  });
                              }
                              if(Type[0]==="ORM"){
                                bc5120.order_query(record,serijski,function(poruka){
                                  console.log('order created')
                                  var tmp = poruka.split('\u000d')
                                  console.log(tmp)
                                  callback(poruka);
                                  });
                              }
                            break;
    case 'CL-900i':  // CL 900 HL7
                          var serijski = "600408e5f5e7ce7d39d4c203"
                          console.log(Type[0])
                          //order_query
                          if(Type[0]==="ORU"){
                            cl900ihl7.specimen_result(record,serijski,function(poruka){
                              callback(poruka);
                              });
                          }
                          if(Type[0]==="QRY"){
                            cl900ihl7.order_query(record,serijski,function(poruka){
                              console.log('order created')
                              var tmp = poruka.split('\u000d')
                              console.log(tmp)
                              callback(poruka);
                              });
                          }
                              break; 
    case 'ST-99002774':  // BC 5390 Mindray HL7
                              var serijski = "60040923f5e7ce7d39d4c24d"
                              console.log(Type[0])
                              //order_query
                              if(Type[0]==="ORU"){
                                bc5390.specimen_result(record,serijski,function(poruka){
                                  callback(poruka);
                                  });
                              }
                              if(Type[0]==="ORM"){
                                bc5390.order_query(record,serijski,function(poruka){
                                  console.log('order created')
                                  var tmp = poruka.split('\u000d')
                                  console.log(tmp)
                                  callback(poruka);
                                  });
                              }
                                  break;
      case 'WS-68002729':  // CL 900 HL7
                                  var serijski = "61a14d0941f211dbeae32dbb"
                                  console.log(Type[0])
                                  //order_query
                                  if(Type[0]==="ORU"){
                                    bs380hl7.specimen_result(record,serijski,function(poruka){
                                      callback(poruka);
                                      });
                                  }
                                  if(Type[0]==="QRY"){
                                    bs380hl7.order_query(record,serijski,function(poruka){
                                      console.log('order created')
                                      var tmp = poruka.split('\u000d')
                                      console.log(tmp)
                                      callback(poruka);
                                      });
                                  }
                                      break; 
        case 'CHRM': // Medjugorje ichromaII
                                      console.log("iCHROMA Gorazde");
                                      serijski = '621a1e625dede7886303fb5f' // - done
                                      //ichroma.specimen_result(record,serijski);
                                      ichroma.specimen_result(record,serijski,function(poruka){
                                        callback(poruka);
                                        });
                                      break;
                        default:
            console.log("U LIS -u nije definisan aparat, sa serijskim brojem: "+sn);
            break; 
  }

},

};
