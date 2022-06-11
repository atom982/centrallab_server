'use strict';
const net = require('net');
const Client = require('./client'); // importing Client class
//require('log-timestamp');
var crc=require('crc')
var mongoose = require("mongoose");

var Loger = require("../models/Loger");

var Frizider = mongoose.model("Frizider");
var TempLog = mongoose.model("TempLog");

class loggerServer {
  constructor(port, address) {
    this.port = process.env.logPORT;
    this.address = '127.0.0.1';
    // Holds our currently connected clients
    this.clients = [];
    this.poruka = [];
    this.calobj={}

  }
/*   The equivalent request to this Modbus RTU example

                 
                 01 04 0001 0001 CRCR

in Modbus TCP is:

  0001 0000 0006 11 03 006B 0003

0001: Transaction Identifier
0000: Protocol Identifier
0006: Message Length (6 bytes to follow)
11: The Unit Identifier  (17 = 11 hex)
03: The Function Code (read Analog Output Holding Registers)
006B: The Data Address of the first register requested. (40108-40001 = 107 =6B hex)
0003: The total number of registers requested. (read 3 registers 40108 to 40110) */
  createFixedPacket(slave, func, param, param2) {
    return (new BufferPut())
        .word8be(slave)
        .word8be(func)
        .word16be(param)
        .word16be(param2)
        .buffer();
  }
   addCrc(buf) {
    return (new BufferPut())
        .put(buf)
        .word16le(crc.crc16modbus(buf))
        .buffer();
}
  /*
   * Starting the server
   * The callback argument is executed when the server finally inits
   */
  broadcast(message, clientSender) {
    this.clients.forEach((client) => {
      if (client === clientSender) {
        client.sendMessage(message);
        //console.log('Šaljem na adresu: ' + client.address + ', port: ' + client.port);
        //console.log(message)
       
      }
    })
  }

  start( io,callback) {
    let loggerServer = this; 
    

    loggerServer.connection = net.createServer((socket) => {
      socket.setEncoding('utf8');
      socket.setNoDelay(false);
      let client = new Client(socket);
      loggerServer.clients.push(client);
      console.log(`Senzor konektovan -> adresa: ${client.address}, port: ${client.port}`);
      var arr = [0x55,0x56,0x00,0x00,0x00,0x00,0x00,0xAB] //read status
      //var arr = [0x55,0x56,0x00,0x00,0x00,0x01,0x04,0xB0]// disconnect momentarily (radi)
      
      
      const alarm = Buffer.from(arr);
      setInterval(() => {
        var i = 1
                for (let index = 0; index < this.clients.length; index++) {
                  loggerServer.broadcast('AUTO', this.clients[index]);
                  //loggerServer.broadcast(alarm, this.clients[index]);
        }      
      }, 50000);
     
      // Storing client for later usage

      io.sockets.on("connection", function(socket) {
        socket.on('calibrate', (data) => {
          loggerServer.calobj = data
        })

      });
      var frame = '';
      socket.on('data', (data) => {
        //console.log(JSON.stringify(data))
        //console.log( new Buffer(data))

        var MAC = new Buffer(data).slice(6,10);
        //console.log(MAC)
        var DATA = new Buffer(data).slice(10,new Buffer(data).length);
        //console.log(DATA.toString('utf8'))
        //console.log(DATA.length)
        Frizider.find({}).exec(function(err, devices) {
          if(!devices.length){
                    console.log('Nije definisan niti jedan senzor')
          }else{
            devices.forEach(device => {
              
              if(MAC.equals(Buffer.from(device.mac))){
                //console.log('frizider pronadjen id:'+device.slave_id)
                if(loggerServer.calobj.hasOwnProperty('slave_id')){
                  if( loggerServer.calobj.tempcal.length  && (loggerServer.calobj.slave_id==device.slave_id)){
                    loggerServer.broadcast('TC:'+loggerServer.calobj.tempcal, client);
                    console.log('pokušaj kalibracije temperature '+device.ime+' TC:'+loggerServer.calobj.tempcal+ " za senzor:"+client.address+' : '+client.port)
                 
                  }
                  if( loggerServer.calobj.humcal.length  && (loggerServer.calobj.slave_id==device.slave_id)){
                    loggerServer.broadcast('HC:'+loggerServer.calobj.humcal, client);
                    console.log('pokušaj kalibracije vlažnosti '+device.ime+' TC:'+loggerServer.calobj.humcal+ " za senzor:"+client.address+' : '+client.port)
                   
                  } 
                  if( loggerServer.calobj.hertzcal.length  && (loggerServer.calobj.slave_id==device.slave_id)){
                    loggerServer.broadcast('HZ:'+loggerServer.calobj.hertzcal, client);
                    console.log('pokušaj kalibracije frekvencije očitanja '+device.ime+' TC:'+loggerServer.calobj.hertzcal+ " za senzor:"+client.address+' : '+client.port)
                   
                  } 
                  loggerServer.calobj={}
                }
                //console.log(DATA.toString('utf8'))
                if(DATA.toString('utf8').indexOf('T:') !== -1){
                  var temp =DATA.toString('utf8').substring(2,7)
                  var hum = DATA.toString('utf8').substring(11,16)
                }else{
                  var temp =DATA.toString('utf8').substring(0,DATA.toString('utf8').indexOf(',')-2)
                  var hum = DATA.toString('utf8').substring(DATA.toString('utf8').indexOf(',')+1,DATA.toString('utf8').length-3)
                }
                if(DATA.toString('utf8').indexOf('DOWN') !== -1){
                  console.log('-------------KALIBRACIJA '+device.ime+' USPJEŠNA-------------')
                  io.emit('calibarted', true)
                }else{
                   
                  io.emit('temperatura', device, temp, hum,Date.now())  
                }

                var rec = {
                  frizider:device._id,
                  temperatura:temp.trim(),
                  vlaznost:hum.trim(),
                  datumVrijeme:Date.now(),
                  site:device.site,
                  ime:device.ime
                }
               
               
 
                TempLog.find({frizider:rec.frizider}).sort({"datumVrijeme": -1}).limit(1).exec(function(err, results) {
                  if (err) {
                    console.log(err) 
                  }else{
                    if(results.length){
                      //console.log(rec)
                      if(results[0].temperatura===rec.temperatura || (Math.abs(results[0].temperatura-rec.temperatura) < 0.2)|| (Math.abs(results[0].temperatura-rec.temperatura) > 2)){
                        //console.log('ne upisujem temp:'+rec.temperatura+'  vlaznost:'+rec.vlaznost)
                        //console.log(DATA.length)
                      }else{
                        var regex = /^[0-9.\-]+$/
                        //console.log('uprovjera:'+rec.temperatura+'  vlaznost:'+rec.vlaznost)
                        if(regex.test(rec.temperatura.trim()) && regex.test(rec.vlaznost.trim()) ){
                          //console.log('regex prosao')
                          var log = new TempLog(rec)
                          log.save(function(err, log) {
                            if (err) {
                              console.log("Greška:", err);
                            } else {
                              console.log(rec.ime+'=>  temp='+rec.temperatura+" hum ="+rec.vlaznost) 
                              if(rec.temperatura < device.opseg.refd || rec.temperatura > device.opseg.refg ){
                                console.log('alarm')
                                //var arr = [0x55,0x56,0x00,0x00,0x00,0x00,0x00,0xAB] //read status
                                var arr = [0x55,0x56,0x00,0x00,0x00,0x01,0x04,0xB0]// disconnect momentarily (radi)
                                const alarm = Buffer.from(arr);
                                  var i = 1
                                          for (let index = 0; index < loggerServer.clients.length; index++) {
                                            if(loggerServer.clients[index].address===client.address){
                                              console.log('aktiviram alarm:'+loggerServer.clients[index].address)
                                            //loggerServer.broadcast(alarm, loggerServer.clients[index]);
                                            }
                                            
                                  }      
                             
                              }else{
                                console.log('sve OK. no alarm')
                              }
                            }
                          }); 
                        }
                      }
                      
                    }else{
                      //console.log(rec)
                      var regex = /^[0-9.\-]+$/
                      if(regex.test(rec.temperatura) && regex.test(rec.vlaznost) ){
                        var log = new TempLog(rec)
                        log.save(function(err, log) {
                          if (err) {
                            console.log("Greška:", err);
                          } else {
                            console.log(rec.ime+'=>  temp='+rec.temperatura+" hum ="+rec.vlaznost) 
                          }
                        }); 
                      }
                    }
                  }
                 
              });

              }
            });
          }
        })
        //console.log(DATA.toString('utf8'))


        if (data.includes('\u0005')) { //ENQ primljen
          //console.log("ENQ primljen: ");
        }



      });

      // Triggered when this client disconnect
      socket.on('end', () => {
        // Removing the client from the list
        loggerServer.clients.splice(loggerServer.clients.indexOf(client), 1);
        console.log(`${client.name} Disconnected.`);

      });

      socket.on('error', (error) => {
        if (error.code == 'ECONNRESET') {
          console.log('Konekcija resetovana.');
          loggerServer.clients.splice(loggerServer.clients.indexOf(client), 1);
          console.log(`${client.name} Diskonektovan.`);
        }
      });
    });
    // starting the server
    this.connection.listen(this.port);
    // setuping the callback of the start function
    this.connection.on('listening', function () {
      console.log('ATOM | logger server running || PORT: %j', loggerServer.port);
    });

  }
}
module.exports = loggerServer;