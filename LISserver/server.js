
'use strict';
const net = require('net');
const Client = require('./client'); // importing Client class
const config = require('../config/index')
const {
  StringDecoder
} = require('string_decoder');
var funkcija = require('./funkcije');


const { crc16modbus } = require('crc');



class lisServer {
  constructor(port, address) {
    //this.port = process.env.lisPORT;
    this.address = '127.0.0.1';
    // Holds our currently connected clients
    this.clients = [];
    this.poruka = [];
    this.message = [];
    this.query = {};
    this.sendmessage = [];
    this.counter = 0;
    this.frameCounter = 0
    this.nakcounter = 0;
    this.timer = setTimeout(function () {}, 15000);
    this.stxsent1 =false
    this.stxsent2 =false
    this.bt1message =[]
    this.bt2message =[] 
  }
  /*
   * Starting the server
   * The callback argument is executed when the server finally inits
   */
  broadcast(message, clientSender) {
    this.clients.forEach((client) => {
      if (client === clientSender) {
        client.sendMessage(message);
        //console.log('broadcasting direct....adress:'+client.address+ " port:"+client.port)
        //console.log(JSON.stringify(message))
        //console.log('Šaljem na adresu: ' + client.address + ', port: ' + client.port);
        //console.log(JSON.stringify(message))
      }
    });

  }
  broadcasthl7(message, clientSender) {
    this.clients.forEach((client) => {
      if (client.address === clientSender.address ) {
        console.log('broadcasting hl7....adress:'+client.address+ " port:"+client.port)
        //console.log(JSON.stringify(message))
        client.sendMessage(message);
      }
    });

  }
  broadcast_to_analyser(message, analyser_ip) {
    this.clients.forEach((client) => {
      if (client.address.includes(analyser_ip)) {
        //console.log('saljem na analizator:'+client.address)
        client.sendMessage(message);
      }
    });
  }
  start(io,port,aparat, callback) {
    let lisserver = this; // we'll use 'this' inside the callback belo
    this.port = port
    lisserver.connection = net.createServer((socket) => {
      socket.setEncoding('utf8');
      socket.setNoDelay(false);
      let client = new Client(socket);
      console.log(aparat+` konektovan -> adresa: ${client.address}, port: ${port}`);

      // Storing client for later usage
      lisserver.clients.push(client);
      
      var frame = '';
      var HL7data = ""
      var frames = '';
      var frame_number = 1;
      var incom_frame_nr = '';
      var emerald = ''
      var eliteframe = ''
      //--------------------------------------------CLIENT
  //     var retrying = false;

  //     function makeConnection () {
  //         klijent.connect(50020, '192.168.1.107');
  //       }
  //     function closeEventHandler () {
  //           if (!retrying) {
  //               retrying = true;
  //               console.log('Rekonektujem se ...');
  //               setTimeout(makeConnection, 2000);
  //           }
            
  //       }
  //   function connectEventHandler() {
  //         console.log('klijent konektovan');
  //     }
  //     function errorEventHandler() {
  //       console.log('Greška prilikom spajanja na REmote Application');
  //       retrying = true;
  //   }
  //   function sendData(data) {

  //     console.log('ORDER DOWNLOAD XDX send DATA')
  //     console.log(JSON.stringify(data))
  //     klijent.write(data)
  // }
  //   var klijent = new net.Socket();
  //   klijent.on('connect', connectEventHandler);
  //   klijent.on('close',   closeEventHandler);
  //   klijent.on('error',   errorEventHandler);
  //     makeConnection()

      //-------------------------------------------- CLIENT
      socket.on('data', (data) => {
        console.log(JSON.stringify(data))
        //---------------------Emerald blok
        // HL7
        if (!data.includes('\u001c')) {// Check if HL7? // "\u001c" === 28 // "\r"  "\u000b"
          HL7data += data
          if (HL7data.includes('|RA032')|| HL7data.includes('HORMON MARKER')  ) { //HORMON MARKER
           console.log('HL7 data received:')
           //console.log(JSON.stringify(data))
           //HL7data = HL7data.substring(HL7data.indexOf("\u000b") + 1, HL7data.indexOf("\u001c") - 1)  
           funkcija.parsaj_hl7(HL7data, function (poruka) {
             var orders = poruka.split("\u000f")
             // console.log('ORDER RESPONSE XDX')
             // console.log(JSON.stringify(orders[0]))
             lisserver.broadcast(orders[0], client)
             if(orders.length > 1){           
               lisserver.broadcasthl7(orders[1], client)
             }         
             lisserver.poruka = [] 
             lisserver.counter = 0;
           });
           HL7data = ""
         }
       }else{
         HL7data += data
         if (HL7data.includes('\u000b') || HL7data.includes('|RA032') || HL7data.includes('HORMON MARKER')) { 
           console.log('HL7 data received:')
           HL7data = HL7data.substring(HL7data.indexOf("\u000b") + 1, HL7data.indexOf("\u001c") - 1)  
           funkcija.parsaj_hl7(HL7data, function (poruka) {
             var orders = poruka.split("\u000f")
             // console.log('ORDER RESPONSE XDX')
             // console.log(JSON.stringify(orders[0]))
             lisserver.broadcast(orders[0], client)
             if(orders.length > 1){           
               lisserver.broadcasthl7(orders[1], client)
             }         
             lisserver.poruka = [] 
             lisserver.counter = 0;
           });
           HL7data = ""
         }
       }
        // HL7
        // Erbalyte block
        if(JSON.stringify(data).includes('  00000000000000') ){//&& JSON.stringify(data).includes('\r\n')
          var niz = JSON.stringify(data).split(" ");
          console.log('Rezultat sa Erbalyte-a')
          console.log(niz)
          
          var temp_rec = []
          temp_rec.push("H|\\^&|||ErbalytePlus^1.00^RJ-1C110261^H1R1L1|||||||P|1|")
          temp_rec.push("O|1|"+niz[2].trim('"')+"|||||||||||||SERUM")
          temp_rec.push("R|1|^^^K|"+niz[5]+"|mmol/l|^DEFAULT|H|N|F||||20200819163255")
          temp_rec.push("R|1|^^^Na|"+niz[6]+"|mmol/l|^DEFAULT|H|N|F||||20200819163255")
          temp_rec.push("R|1|^^^Cl|"+niz[7]+"|mmol/l|^DEFAULT|H|N|F||||20200819163255")
          temp_rec.push("L|1|N")
          console.log(temp_rec)
          funkcija.parsaj_rezultat(temp_rec, io);
        }  
         // Erbalyte block


   //----------------------MYTHIC 18 blok
   if (JSON.stringify(data).includes('MYTHIC')) {
    emerald += data
    if(JSON.stringify(data).includes('CONNECT')){
      socket.write('ACK_CONNECT;7\r'); 
      emerald = ''
      console.log('Konekcija prihvaćena')
    }
    if(JSON.stringify(data).includes('RESULT_READY')){
      var niz = JSON.stringify(emerald).split(";");
      console.log('Aparat serijskog broja:'+niz[0]+" šalje zahtjev za prihvat rezultata.")
      socket.write('ACK_RESULT_READY\r'); 
      emerald = ''
      console.log('Zahtjev prihvaćen. Čekam rezultat ....')
    }  
  }
  if (JSON.stringify(data).includes('END_RESULT')) {
    emerald += data
    socket.write('ACK_RESULT;OK\r');  
    for (i = 0; i < emerald.length; i++) {
      if (emerald.charCodeAt(i) === 95) {
        if (emerald.charCodeAt(i - 1) === 68) {
          var crc = emerald.slice(i+8,emerald.length-1).toString()
          if(parseInt(crc) === parseInt(crc16modbus(emerald.slice(0, i - 3).toString()))){
            
            var ulaz = emerald.slice(0, i - 3).toString()
            var niz = ulaz.split("\r")
            var temp_rec = []
            
            var he= 'H||||'+niz[0]
            temp_rec.push(he.split(";")[0]+'|'+niz[1]+'|'+niz[2]+'|'+niz[6])
            for (let index = 12; index < 30; index++) {
              temp_rec.push('R|'+niz[index])    
            }
            temp_rec.push('L|1')
            console.log( temp_rec)
            funkcija.parsaj_rezultat(temp_rec, io);
            temp_rec = [];
          }else{
            var he= 'H||||'+emerald.slice(0,8).toString()
            
            console.log('CRC provjera nije OK za aparat MYTHIC SN:',he )
          }
        }
      }
    }
    emerald = ''
  }
//------------- End of Mythic 18 blok

        if (data.charCodeAt(data.length - 1) !== 10) { //podaci od aparata
          frame += data; //dodaj u buffer \u001a

          //console.log(frame.toString())
          //console.log(JSON.stringify(data))
         
         //BC-3200 MINDRAY BLOCK
         if (data.includes('\u001a')) { //ENQ primljen
          lisserver.poruka.push("H|\\^&|||BC-3200^1.00^RM-02101641^H1R1L1|||||||P|1|")
          lisserver.poruka.push("R|"+frame)
          funkcija.parsaj_rezultat(lisserver.poruka, io);
          frame = ''
          lisserver.poruka = [] 
        }
         //BC-3200 MINDRAY BLOCK END
          
          if (data.charCodeAt(data.length - 1) === 3 ) {
            // AU 400 START
            if(frame.indexOf("\u0002") >= 0 && !frame.includes('|')){
              console.log('ulazak jer STX postoji')
              if(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003"))==='RE' ){
                frame = ''
                data = ''
                lisserver.poruka = []   
              }
              if(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003"))==='DE' ){
                frame = ''
                data = ''
                lisserver.poruka = []   
              }
              if(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003"))==='DB' ){
                frame = ''
                data = ''
                lisserver.poruka = []   
              }
              console.log(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")))
              if(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003"))==='RB' || frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003"))==='DB'){
                lisserver.poruka.push(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")));
                frame = ''
                data = ''
              }
              else if(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")+1).includes('R ')){
                lisserver.poruka.push(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")));
                frame = ''
                data = ''
                console.log('Query');
                lisserver.poruka.unshift("H|\\^&|||AU400^1.00^0055487^H1R1L1|||||||P|1|");
                funkcija.parsaj_query(lisserver.poruka, function (poruka) {
                  socket.write('\u0002'+poruka+'\u0003'); 
                  console.log('Poruka za slanje: ');
                  console.log(poruka);
                  lisserver.counter = 0;
                  lisserver.poruka = [] 
                });
              
                if(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003"))==='RE' ){
                  console.log(lisserver.poruka)
                  lisserver.poruka = []   
                }
              }else if(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")+1).includes('D ')){
                lisserver.poruka.push(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")));
                frame = ''
                data = ''
                console.log('Result');
                lisserver.poruka.unshift("H|\\^&|||AU400^1.00^0055487^H1R1L1|||||||P|1|");
                funkcija.parsaj_rezultat(lisserver.poruka, io);
                lisserver.poruka = []  
                // AU400 END
              }else if(frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")+1).includes('D1U')){
                lisserver.poruka.unshift("H|\\^&|||KX21^1.00^3012321^H1R1L1|||||||P|1|");
                lisserver.poruka.push('R'+frame.substring(frame.indexOf("\u0002")+1,frame.indexOf("\u0003")));
                lisserver.poruka.push('L|1');
                frame = ''
                funkcija.parsaj_rezultat(lisserver.poruka, io);
                
                lisserver.poruka = [] 
            }
            }
            
          }
    
          
        } else {
          console.log('ELMIR - frame analysis checkpoint')
          frame = frame + data;

              //   JSON.stringify(frame).forEach(element => {
              //     console.log(element)
              // });
            for (var i = frame.length - 1; i >= 0; i--) {
              if (frame[i] === "\u0005") {
                frame = frame.substring(i, frame.length);
                var FR =  JSON.stringify(frame)
                console.log(FR)
              }
            }
  
            if (frame.indexOf("\u0002") >= 0) { //ako postoji STX
                incom_frame_nr = frame.substring(frame.indexOf("\u0002") + 1, frame.indexOf("\u0002") + 2); //F# se nalazi iza STX tj njegov index je index stx+1                
                if (frame_number == incom_frame_nr) { //ako su F# jednaki provjeravaj checksum
                  if (funkcija.checksum(frame)) {
                    lisserver.poruka.push(frame); // dodaj frame u globalni niz poruka (server variable)
                    socket.write('\u0006'); //ACK //pošalji ACK
                  } else {
                    socket.write('\u0021'); //NAK //pošalji NAK
                    frame_number -= 1;
                    console.log('checksum NOT OK')
                  }
                } else {
                  socket.write('\u0021'); //NAK
                  console.log("Brojevi frame -ova se ne slažu, šaljem NAK...");
                }
              
              if (frame_number === 7) { // na broju 7 resetuj frame na nulu
                frame_number = 0;
              } else {
                frame_number += 1; //inkrementiraj frame
              }
    
              frame = ''
              } 
        }

        if (data.includes('\u0005')) { //ENQ primljen
          console.log("ENQ primljen: ");
          socket.write('\u0006'); //šalji ACK
          frame_number = 1;
        }
        if (data.includes('\u0006')) { //ACK primljen
          console.log("ACK primljen: ");
        }   
 
        if (data.includes('\u0004')) {
          //console.log("EOT primljen: ");
          
          frame_number = 1;

          ///lisserver.broadcast('\u0006', client);
          lisserver.message = funkcija.uredi_ETB(lisserver.poruka);

          var record_type = '';
          var temp_rec = [];
          var message_type = '';


          //console.log("Primljena poruka:")

          var temp = lisserver.message[0]
          if (temp != undefined) {
            if (temp.includes("\r")) {
              lisserver.message = temp.split("\r")
              if(lisserver.message[lisserver.message.length-1].includes('C|')){
                //console.log('nepravilan terminator')
                lisserver.message.push('L|1|N')
                
              }else{
                //console.log('pravilan terminator')
              }
            }
          }
          console.log(lisserver.message);
          lisserver.message.forEach(function (element) {
            record_type = element.charAt(0)
            switch (record_type) {
              case 'H':
                var header = element.split("|");
                var sender = header[4].split("^");
                //console.log("header u serveru")
                if (sender[1] === "CDRuby") {
                  client.sn = sender[0].trim()

                } else {
                  client.sn = sender[2];
                }
                if(element.includes('E 1394-97')){
                  client.sn='251025'
                }
                temp_rec.push(element);
                //console.log(client.sn)
                //console.log(temp_rec)
                break;
              case 'P':
                temp_rec.push(element);
                break;
              case 'O':
                temp_rec.push(element);
                break;
              case 'C':
                //temp_rec.push(element);
                var comment = element.split('|')
                //message_type = 'komentar'
                break;
              case 'R':
                temp_rec.push(element);
                message_type = 'rezultat';
                break;
              case 'Q':
                temp_rec.push(element);
                message_type = 'query';
                break;
              case 'L':

                if (message_type === 'komentar') {
                  lisserver.broadcast('\u0006', client);
                }
                if (message_type === 'rezultat') {
                  temp_rec.push(element);
                  message_type = '';
                  funkcija.parsaj_rezultat(temp_rec, io);
                }
                if (message_type === 'query') {
                  //console.log('Query');
                  temp_rec.push(element);
                  funkcija.parsaj_query(temp_rec, function (poruka) {
                    lisserver.sendmessage = poruka;
                    lisserver.broadcast('\u0005', client);
                    console.log("Saljem ENQ za slanje ordera...");
                    lisserver.counter = 0;
                  });
                  message_type = '';
                }
                temp_rec = [];
                break;
              default:
                console.log("Nepozanat tip frame -a.");

            }

          });
          lisserver.poruka = [];
          lisserver.message = [];
        }

        if (data.charCodeAt(0) === 6){// || data.charCodeAt(0) === 4) { //ACK primljen
          
          clearTimeout(lisserver.timer);
          frame_number = 1;
          var cs = require('./funkcije');
          var stx = '\u0002';
          var etx = '\u0003';
          var cr = '\u000D';
          var lf = '\u000A';
          var eot = '\u0004';
          var enq = '\u0005';
          if (lisserver.frameCounter === lisserver.sendmessage.length) {
            console.log(lisserver.sendmessage.length)
            if(lisserver.sendmessage.length){
              lisserver.broadcast(eot, client);
            }
            lisserver.counter = 0;
            lisserver.frameCounter = 0
            lisserver.sendmessage = []
          }
          if (lisserver.frameCounter < lisserver.sendmessage.length) {
            var text = lisserver.sendmessage[lisserver.frameCounter];

            if (lisserver.frameCounter === lisserver.sendmessage.length - 1) {

              frames = '\u0002';
              frames += String(lisserver.counter + 1);
              frames += lisserver.sendmessage[lisserver.frameCounter];
              frames += cr
              frames += etx
              var checksum = cs.kreiraj_checksum(String(lisserver.counter + 1) + text + '\u000D' + '\u0003');
              frames += checksum;
              frames += cr
              frames += lf
              console.log('saljem frame '+lisserver.frameCounter)
              console.log(JSON.stringify(frames))
              lisserver.broadcast(frames, client);
              if(lisserver.counter+1 === 7){
                lisserver.counter = -1;
              }else{
                lisserver.counter += 1;
              }
              lisserver.frameCounter += 1;
              clearTimeout(lisserver.timer);
            } else {
              frames = '\u0002';
              frames += String(lisserver.counter + 1);
              frames += lisserver.sendmessage[lisserver.frameCounter];
              frames += cr
              frames += etx
              var checksum = cs.kreiraj_checksum(String(lisserver.counter + 1) + text + '\u000D' + '\u0003');
              frames += checksum;
              frames += cr
              frames += lf
              lisserver.broadcast(frames, client);
              if(lisserver.counter+1 === 7){
                lisserver.counter = -1;
              }else{
                lisserver.counter += 1;
              }
              lisserver.frameCounter += 1;
              lisserver.timer = setTimeout(function () {
                lisserver.broadcast(eot, client);
              }, 15000);
            }
          }
        }
        if (data.charCodeAt(0) === 21) { //NAK primljen
          console.log("NAK...");
          io.emit('kompletiran', 'NAK', undefined, undefined, undefined, undefined)  
          // lisserver.nakcounter++;
          // if (lisserver.nakcounter < 2) {
          //   setTimeout(function () {

          //     if (lisserver.counter >= 1) {

          //       lisserver.counter -= 1;
          //       const enq = Buffer.from('\u0005');
          //       lisserver.broadcast('\u0005', client);
          //       console.log("Šaljem ENQ...");

          //     }

          //   }, 20000);
          // } else {
          //   console.log("NAK primljen 6 puta, prenos terminiran. Provjeriti frame koji je LIS slao ka klijent -u.");
          // }

        }


      });

      // Triggered when this client disconnects
      socket.on('end', () => {
        // Removing the client from the list
        lisserver.clients.splice(lisserver.clients.indexOf(client), 1);
        console.log(`${client.name} Disconnected.`);

      });

      socket.on('error', (error) => {

        if (error.code == 'ECONNRESET') {
          console.log('Konekcija resetovana.');
          lisserver.clients.splice(lisserver.clients.indexOf(client), 1);
          console.log(`${client.name} Diskonektovan.`);
        }

      });
    });
    // starting the server
    this.connection.listen(port);
   
    // setuping the callback of the start function
    this.connection.on('listening', function () {
      console.log('ATOM | lis server running || PORT: %j', port);
    });


  }

}
module.exports = lisServer;