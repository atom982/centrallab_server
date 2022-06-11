const jwt = require("jsonwebtoken"),
  config = require("../config/index");

var mongoose = require("mongoose");
var User = require("../models/User");
var Audit = require("../models/Audit");
var fs = require("fs");
var User = mongoose.model("User");
var Audit = mongoose.model("Audit_Login");
var prijem = require("../controllers/SampleController.js");

var IntegrationController = {};
IntegrationController.apiUrlPregled = function(req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: err
    });
  } else {
    var parametar = req.query.sort.slice(0, req.query.sort.indexOf("|")).trim();
    var order = req.query.sort
      .slice(req.query.sort.indexOf("|") + 1, req.query.sort.length)
      .trim();

    var limit = 50000;

    if (!req.query.filter) {
      req.query.filter = "";
      limit = 100;
    }

    if (req.query.filter === "") {
      req.query.filter = "";
      limit = 100;
    } else {
      limit = 50000;
    }
   
    var uslov = { site: mongoose.Types.ObjectId(req.query.site) };

    switch (parametar) {
      case "ime":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          pime: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };
        break;

      case "prezime":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          pprez: {
            $regex: ".*" + req.query.filter.toUpperCase() + ".*"
          }
        };

        break;

      case "jmbg":
        uslov = {
          site: mongoose.Types.ObjectId(req.query.site),
          jmbg7: { $regex: ".*" + req.query.filter.toUpperCase() + ".*" }
        };

        break;

      default:
        var imeiprezime = req.query.filter.toLowerCase().split(" ");
        if (imeiprezime.length === 2) {
          var name = imeiprezime[0];
          var surname = imeiprezime[1];
          uslov = {
            site: mongoose.Types.ObjectId(req.query.site),
            pime: {
              $regex: ".*" + name.toUpperCase() + ".*"
            },
            pprez: {
              $regex: ".*" + surname.toUpperCase() + ".*"
            }
          };
        }

        if (imeiprezime.length === 1) {
          var name = imeiprezime[0];
          uslov = {
            site: mongoose.Types.ObjectId(req.query.site),

            $or: [
              {
                pime: { $regex: ".*" + name.toUpperCase() + ".*" }
              },
              {
                pprez: { $regex: ".*" + name.toUpperCase() + ".*" }
              }
            ]
          };
        }

        break;
    }
    IntegrationRaw.find(uslov)
      .sort({ _id: -1 })
      .limit(limit)
      .exec(function(err, results) {
        if (err) {
          console.log("Greška:", err);
        } else {
          switch (parametar) {
            case "ime":
              results = results.filter(function(result) {
                return result.pime
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "prezime":
              results = results.filter(function(result) {
                return result.pprez
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            case "jmbg":
              results = results.filter(function(result) {
                return result.jmbg7
                  .toLowerCase()
                  .includes(req.query.filter.toLowerCase());
              });
              break;
            default:
              var pacijent = req.query.filter.toLowerCase().split(" ");
              if (pacijent.length === 2) {
                var name = pacijent[0];
                var surname = pacijent[1];
                results = results.filter(function(result) {
                  return (
                    (result.pime.toLowerCase().includes(name) &&
                      result.pprez.toLowerCase().includes(surname)) ||
                    (result.pime.toLowerCase().includes(surname) &&
                      result.pprez.toLowerCase().includes(name))
                  );
                });
              }
              if (pacijent.length === 1) {
                var name = pacijent[0];
                results = results.filter(function(result) {
                  return (
                    result.pime.toLowerCase().includes(name) ||
                    result.pprez.toLowerCase().includes(name)
                  );
                });
              }
              break;
          }

          var json = {};
          json.total = results.length;
          json.per_page = req.query.per_page;
          json.current_page = req.query.page;
          json.last_page = Math.ceil(json.total / json.per_page);
          json.next_page_url =
            config.baseURL +
            "prijem/pacijenti?sort=" +
            req.query.sort +
            "&page=" +
            (req.query.page + 1) +
            "&per_page=" +
            req.query.per_page;
          var prev_page = null;
          if (json.current_page - 1 !== 0) {
            prev_page = json.current_page - 1;
          }
          json.prev_page_url =
            config.baseURL +
            "prijem/pacijenti?sort=" +
            req.query.sort +
            "&page=" +
            prev_page +
            "&per_page=" +
            req.query.per_page;
          json.from = (json.current_page - 1) * 10 + 1;
          json.to = (json.current_page - 1) * 10 + 10;
          json.data = [];

          switch (parametar) {
            case "ime":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.pime == b.pime ? 0 : +(a.pime > b.pime) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.pime == b.pime ? 0 : +(a.pime < b.pime) || -1;
                });
              }
              break;
            case "prezime":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.prezime == b.pprez
                    ? 0
                    : +(a.prezime > b.pprez) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.pprez == b.pprez
                    ? 0
                    : +(a.pprez < b.pprez) || -1;
                });
              }
              break;
            case "jmbg":
              if (order === "asc") {
                results.sort(function(a, b) {
                  return a.jmbg7 == b.jmbg7 ? 0 : +(a.jmbg7 > b.jmbg7) || -1;
                });
              }
              if (order === "desc") {
                results.sort(function(a, b) {
                  return a.jmbg7 == b.jmbg7 ? 0 : +(a.jmbg7 < b.jmbg7) || -1;
                });
              }
              break;
            default:
              results.sort(function(a, b) {
                return Date.parse(a.created_at) == Date.parse(b.created_at)
                  ? 0
                  : +(Date.parse(a.created_at) < Date.parse(b.created_at)) ||
                      -1;
              });
              break;
          }

          var niz = results.slice(json.from - 1, json.to);

          niz.forEach(patient => {
            switch (patient.spol) {
              case "MUŠKI":
                var icon =
                  '<span style="font-size: 12px; color:#4ab2e3;" class="fa fa-mars"></span>';
                break;
              case "ŽENSKI":
                var icon =
                  '<span style="font-size: 12px; color:#db76df;" class="fa fa-venus"></span>';
                break;
              default:
                var icon =
                  '<span style="font-size: 12px; color:#f7cc36;" class="fa fa-genderless"></span>';
                break;
            }

            var prijem =
              "<button style='white-space: nowrap;' title='' id='" +
              patient.jmbg7 +
              "' style='font-size: 11px;' class='btn btn-secondary-info btn-micro'><span id='" +
              patient.jmbg7 +
              "' style='font-size: 12px;' class='fa fa-flask'></span> <span style='text-transform: none; font-size: 12px;'>Prijem</span></button>";

            var jmbg = "<span>" + patient.jmbg7 + "</span>";

            if (patient.jmbg7.includes("P")) {
              jmbg =
                "<span>" +
                patient.jmbg7.slice(0, -1) +
                "<span style='color: #e34a4a;'>" +
                patient.jmbg7.slice(-1) +
                "</span></span>";
            }

            var detalji =
              "<button style='white-space: nowrap;' title='' id='" +
              patient._id +
              "' style='text-transform: none; font-size: 12px;' class='btn btn-primary btn-micro'><span id='" +
              patient._id +
              "' class='fa fa-edit'></span> Ponovi</button>";

            json.data.push({
              protokol: patient.protokol,
              integracija: detalji,
              ime: patient.pime,
              prezime: patient.pprez,
              jmbg: jmbg,
              izmjena: patient._id,
              id: patient._id
            });
          });
          res.json(json);
        }
      });
  }
};
// AuthController.js
IntegrationController.Bind = function(req, res) {
    console.log(req.body.integration)
    var integration = new Integration(req.body.integration);
    integration.save(function(err,bond) {
        if (err) {
          console.log("Greška:", err);
        } else {
          res.json({
            success: true,
            message: "Analiza uspješno uvezana",
            bond: bond
          });
        }
      });
},
IntegrationController.List = function(req, res) {
  console.log('Lista route')
  var lista = ''
  Integration.find({}).populate('local_id').exec(function (err, lista) {
    res.json({
      success: true,
      message: "Lista integracijskih kodova",
      list: lista
    })
    lista.forEach(test => {
      
    });
  })

},
IntegrationController.Post = function(req, res) {
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) throw error;
    if (!user)
                res.json({
                  success: false,
                  message: "Greška 1"
                });
    else {
      user.comparePassword(req.body.password, (error, matches) => {
        if (matches && !error) {
          //---------------------------------

  IntegrationRaw.findOne({ protokol: req.body.protokol }, (error, slog) => {
    if (error) throw error;
    if (!slog){
        req.body.site = user.site
        req.body.pime = req.body.pime.toUpperCase()
        req.body.pprez =  req.body.pprez.toUpperCase()
        var protokol = new IntegrationRaw(req.body)
        protokol.save(function (err, protokol) {
          if (err) {
            res.json({ success: false, message: 'Greška 2s:'+err })
          } else {
            req.body.created_at = Date.now()
            req.body.created_by = req.body.email
            req.body.duhan='NEPOZNATO'
            req.body.dijabetes='NEPOZNATO'
            req.body.telefon= 'NEPOZNATO'
            req.body.email='NEPOZNATO'
            req.body.adresa='NEPOZNATO'  
            req.body.ime= req.body.pime.toUpperCase()
            req.body.prezime= req.body.pprez.toUpperCase()
            req.body.jmbg=req.body.jmbg7.trim()+String(Math.random()*100000).substring(0,5)+'P'
            req.body.ime_oca= req.body.imeo.toUpperCase()
            req.body.spol = req.body.spol.toUpperCase()
            req.body.site= user.site
            var pacijent = new Patients(req.body)
            pacijent.save(function (err, pacijent) {
                if (err) {
                  res.json({ success: false, message: 'Greška 3s:'+err })
                } else {
                  console.log(req.body.analize)
                  var order={}
                  order.site=user.site
                  order.timestamp= Date.now()
                  order.siteCode= 'S'
                  
                  order.uzorci=[ {tip: 'Serum 1',testovi:[]}, {tip: 'Serum 2',testovi:[]}, {tip: 'Serum 3',testovi:[]},{tip: 'Serum 4',testovi:[]},{tip: 'kapilarna krv',testovi:[]},{tip: 'Krv 1',testovi:[]},{tip: 'Krv 2',testovi:[]},{tip: 'Krv EDTA',testovi:[]},{tip: 'Plazma 1',testovi:[]},{tip: 'Plazma ABO',testovi:[]},{tip: 'Plazma EDTA',testovi:[]},{tip: 'Plazma Citrat',testovi:[]},{tip: 'Plazma Heparin',testovi:[]}, {tip: 'Plazma NaF',testovi:[]},{tip: 'Urin 1',testovi:[]},{tip: 'Urin 24h',testovi:[]},{tip: 'Feces 1',testovi:[]},{tip: 'Bris 1',testovi:[]},{tip: 'Ejakulat',testovi:[]}]
                  order.lokacija ='5c713f63cfe109792dfbdc9b'
                  order.drstanje = 'NE'
                  order.anticoag = 'NE'
                  order.protokol = req.body.protokol
                  var counter = 0
                  var temp =""
                  req.body.analize.forEach(remote => {
                    console.log(remote)
                    temp = remote.toString().trim()
                    Integration.findOne({remote_id:temp}).populate('local_id').exec(function (err, local) {
                      counter++
                      if(local){

                      order.uzorci.forEach(uzorak => {
                         if(uzorak.tip === local.local_id.tip){
                           uzorak.ime=uzorak.tip.split(' ')[0]
                           uzorak.code = []
                           uzorak.patient = pacijent
                          if(!uzorak.testovi.filter(e => e._id.equals(local.local_id._id)).length > 0){
                            uzorak.testovi.push({itemName: local.local_id.naziv,opis:local.local_id.analit,uzorak:local.local_id.tip,cijena:local.local_id.price,klasa:"primary",_id:local.local_id._id})
                          }
                         
                           uzorak.hitno= false
                           uzorak.time=new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, -8).replace("T", " ")
                           uzorak.komentar=''
                          }
                      });
                    }else{
                      console.log('analiza nije pronadjena')
                    }
                    if(req.body.analize.length === counter){
                      var complete = []
                      order.uzorci.forEach(uzorak => {
                        if(uzorak.testovi.length){
                          complete.push(uzorak)
                        }
                      });
                      order.uzorci=complete
                      order.decoded={user:req.body.email}
                      req.body=order
                      req.body.complete=[]
                      
                      if(order.uzorci.length){
                        prijem.sacuvajUzorke(req,res)
                      }else{
                       res.json({ success: true, message: 'Sifre testova nisu definisane u LIS-u', protokol:req.body.protokol })
                      }
                    }
                    })
                  });    
                }
              })
              }
            })   
      }  
      else {
        res.json({ success: true, message: 'Protokol vec unesen', data:slog.protokol })
      }
    });
          //---------------------------------
        } else {
          res.json({
            success: false,
            message: "Greška 2"
          });
        }
      });
    }
  }); 

};
IntegrationController.Get = function(req, res) {
  console.log('UPIT za podatke')
  console.log(req.body)
  User.findOne({ email: req.body.email }, (error, user) => {
    if (error) throw error;
    if (!user)
                res.json({
                  success: false,
                  message: "Greška 1"
                });
    else {
      user.comparePassword(req.body.password, (error, matches) => {
        if (matches && !error) {
          //---------------------------------
          Integration.find({  }, (error, intanalize) => {
          IntegrationRaw.findOne({ protokol: req.body.protokol }, (error, slog) => {
            if (error) throw error;
            if(slog){
              var temp = []
              intanalize.forEach(intanaliza => {
                slog.analize.forEach(element => {
                  if(element ===intanaliza.remote_id){
                    temp.push({remote_id:intanaliza.remote_id,local_id:intanaliza.local_id,multi:intanaliza.multiparam.type,multi_id:intanaliza.multiparam.id})
                  }
                });
              });  
              Results.find({protokol:slog.protokol}).populate('patient').exec(function (err, results) {
              if(results.length){
                console.log('Broj uzoraka:'+results.length)
                results.forEach(result => {
                  temp.forEach(element => {
                    if(!element.multi){
                  result.rezultati.forEach(rezultat => {
                      if(rezultat.labassay.equals(mongoose.Types.ObjectId(element.local_id))){//
                        if(result.verificiran && rezultat.rezultat[rezultat.rezultat.length-1].rezultat_f!=""){
                          element.rezultat=rezultat.rezultat[rezultat.rezultat.length-1].rezultat_f
                          element.refd=rezultat.refd
                          element.refg=rezultat.refg
                          element.jedinica=rezultat.rezultat[rezultat.rezultat.length-1].jedinice_f
                        }
                      }   
                    });
                   }else{
                    result.multi.forEach(multi => {
                       multi.forEach(analit => {                 
                         if(analit.rezultat[0].anaassay.equals(element.multi_id)){
                          if(result.verificiran && analit.rezultat[0].rezultat_f!=""){
                            element.rezultat=analit.rezultat[0].rezultat_f
                            element.refd=analit.refd
                            element.refg=analit.refg
                            element.jedinica=analit.rezultat[0].jedinice_f
                          }
                         }
                       });
                     });
                   }
                  });
                });
                res.json({
                  success: true,
                  message: "Rezultati za protokol:"+slog.protokol,
                  rezultati:temp
                });              
              }else{
                res.json({
                  success: true,
                  message: "Rezultati za protokol nisu pronadjeni"
                });
              }   
            })
            }else{
              res.json({
                success: false,
                message: "Traženi protokol nije unesen!"
              });
            }
          })
        })
          //---------------------------------
        } else {
          res.json({
            success: false,
            message: "Greška 2"
          });
        }
      });
    }
  });
};
IntegrationController.Retry = function(req, res) {
 

  IntegrationRaw.findOne({ _id:mongoose.Types.ObjectId(req.body.id)  }, (error, slog) => {
    if (error) throw error;
    if(slog){
      Results.find({protokol:slog.protokol}).populate('patient').exec(function (err, results) {
        if(results.length){
          console.log( "Sample and Result su za protokol:"+slog.protokol+"  vec kreirani")
          res.json({
            success: true,
            message: "Sample and Result su za protokol:"+slog.protokol+"  vec kreirani",
          });              
        }else{
          console.log('Iniciraj kreiranje uzoraka za protokol:'+slog.protokol)
          Patients.findOne({ime:slog.pime,prezime:slog.pprez}).exec(function (err, patient) {
            if (error) throw error;
            if(patient){
          //---------------------------------
          var order={}
          order.site=slog.site
          order.timestamp= Date.now()
          order.siteCode= 'S'        
          order.uzorci=[ {tip: 'Serum 1',testovi:[]}, {tip: 'Serum 2',testovi:[]}, {tip: 'Serum 3',testovi:[]},{tip: 'Serum 4',testovi:[]},{tip: 'kapilarna krv',testovi:[]},{tip: 'Krv 1',testovi:[]},{tip: 'Krv 2',testovi:[]},{tip: 'Krv EDTA',testovi:[]},{tip: 'Plazma 1',testovi:[]},{tip: 'Plazma ABO',testovi:[]},{tip: 'Plazma EDTA',testovi:[]},{tip: 'Plazma Citrat',testovi:[]},{tip: 'Plazma Heparin',testovi:[]}, {tip: 'Plazma NaF',testovi:[]},{tip: 'Urin 1',testovi:[]},{tip: 'Urin 24h',testovi:[]},{tip: 'Feces 1',testovi:[]},{tip: 'Bris 1',testovi:[]},{tip: 'Ejakulat',testovi:[]}]
          order.lokacija ='5c713f63cfe109792dfbdc9b'
          order.drstanje = 'NE'
          order.anticoag = 'NE'
          order.protokol = slog.protokol
          var counter = 0
          var temp =""
          slog.analize.forEach(remote => {
            console.log(remote)
            temp = remote.toString().trim()
            Integration.findOne({remote_id:temp}).populate('local_id').exec(function (err, local) {
              counter++
              if(local){

              order.uzorci.forEach(uzorak => {
                 if(uzorak.tip === local.local_id.tip){
                   uzorak.ime=uzorak.tip.split(' ')[0]
                   uzorak.code = []
                   uzorak.patient = patient
                  if(!uzorak.testovi.filter(e => e._id.equals(local.local_id._id)).length > 0){
                    uzorak.testovi.push({itemName: local.local_id.naziv,opis:local.local_id.analit,uzorak:local.local_id.tip,cijena:local.local_id.price,klasa:"primary",_id:local.local_id._id})
                  }
                 
                   uzorak.hitno= false
                   uzorak.time=new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, -8).replace("T", " ")
                   uzorak.komentar=''
                  }
              });
            }else{
              console.log('analiza nije pronadjena')
            }
            if(slog.analize.length === counter){
              var complete = []
              order.uzorci.forEach(uzorak => {
                if(uzorak.testovi.length){
                  complete.push(uzorak)
                }
              });
              order.uzorci=complete
              order.decoded={user:req.body.email}
              req.body=order
              req.body.complete=[]
              
              if(order.uzorci.length){
                prijem.sacuvajUzorke(req,res)
              }else{
               res.json({ success: true, message: 'Sifre testova nisu definisane u LIS-u', protokol:req.body.protokol })
              }
            }
            })
          }); 
           }else{
             console.log('pacijent nije pronadjen')
           }
          //----------------------------------
         })
        }   
      })
    }
  })
},
module.exports = IntegrationController;
