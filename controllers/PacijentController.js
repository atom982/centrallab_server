var mongoose = require("mongoose")
var Patients = require("../models/Postavke")
var Audit_Patients = require("../models/Audit")
var Patients = mongoose.model("Patients")
var Audit_Patients = mongoose.model("Audit_Patients")
var Nalazi = mongoose.model("Nalazi")

const config = require('../config/index')

var pacijentController = {}

// PacijentController.js

pacijentController.PatientFind = function (req, res) {
  Patients.findOne({ jmbg: req.body.jmbg, site: req.body.site }).exec(function (err, pacijent) {
    if (err) {
      console.log("Greška:", err)
      res.json({ success: false, message: 'Greška prilikom pretraživanja baze' })
    }
    else {
      if (pacijent) {
        res.json({ success: true, message: 'Pacijent postoji', pacijent })
      } else {
        res.json({ success: false, message: 'Pacijent ne postoji' })
      }
    }
  })
}

pacijentController.PatientFindID = function (req, res) {
  Patients.findOne({ _id: req.body.id, site: req.body.site }).exec(function (err, pacijent) {
    if (err) {
      console.log("Greška:", err)
      res.json({ success: false, message: 'Greška prilikom pretraživanja baze' })
    }
    else {
      if (pacijent) {
        res.json({ success: true, message: 'Pacijent postoji', pacijent })
      } else {
        res.json({ success: false, message: 'Pacijent ne postoji' })
      }
    }
  })
}

pacijentController.PatientSave = function (req, res) {
  req.body.created_at = Date.now()
  req.body.created_by = req.body.decoded.user
  var pacijent = new Patients(req.body)
  if (mongoose.connection.readyState != 1) {
    res.json({ success: false, message: 'Greška prilikom konekcije na MongoDB.' })
  } else {
    pacijent.save(function (err, pacijent) {
      if (err) {
        console.log("Greška:", err)
        res.json({ success: false, message: err })
      } else {
        res.json({ success: true, message: 'Pacijent uspješno sačuvan.', pacijent })
      }
    })
  }
}

pacijentController.DetaljanPregled = function (req, res) {
  Patients.findOne({ _id: req.params.id }).exec(function (err, pacijent) {
    if (err) {
      console.log("Greška:", err)
      res.json({ success: false, message: 'Greška prilikom pretraživanja baze' })
    }
    else {
      if (pacijent) {
        res.json({ success: true, message: 'Pacijent postoji', pacijent })
      } else {
        res.json({ success: false, message: 'Pacijent ne postoji' })
      }
    }
  })
}

pacijentController.PacijentUpdate = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({ success: false, message: 'Greška prilikom konekcije na MongoDB.' })
  } else {

    /* Patients.find({}).exec(function (err, pacijents) {
      if (err) {
        console.log("Greška:", err)
      }
      else {

        pacijents.forEach(element => {          
          element.adresa = 'NEPOZNATO'            
          element.save()
        })

        res.json({ success: true, message: 'Pacijent izmjenjen' })
      }
    }) */

    Patients.findOne({ _id: req.params.id }).exec(function (err, pacijent) {
      if (err) {
        console.log("Greška:", err)
      }
      else {
        if (pacijent) {
          if (typeof req.body.jmbg !== 'undefined' && req.body.jmbg) {

            var audit_body = {}
            audit_body.jmbg = pacijent.jmbg
            audit_body.ime = pacijent.ime
            audit_body.prezime = pacijent.prezime
            audit_body.spol = pacijent.spol
            audit_body.adresa = pacijent.adresa
            audit_body.duhan = pacijent.duhan
            audit_body.dijabetes = pacijent.dijabetes
            audit_body.passport = pacijent.passport
            audit_body.roditelj = pacijent.roditelj
            audit_body.telefon = pacijent.telefon
            audit_body.email = pacijent.email
            audit_body.created_by = pacijent.created_by
            audit_body.created_at = pacijent.created_at
            audit_body.updated_by = pacijent.updated_by
            audit_body.updated_at = pacijent.updated_at
            var audit_pacijent = new Audit_Patients(audit_body)
            audit_pacijent.save()

            pacijent.jmbg = req.body.jmbg
            pacijent.ime = req.body.ime
            pacijent.prezime = req.body.prezime
            pacijent.spol = req.body.spol
            pacijent.adresa = req.body.adresa
            pacijent.duhan = req.body.duhan
            pacijent.dijabetes = req.body.dijabetes
            pacijent.passport = req.body.passport
            pacijent.roditelj = req.body.roditelj
            pacijent.telefon = req.body.telefon
            pacijent.email = req.body.email
            pacijent.updated_by = req.body.decoded.user
            pacijent.updated_at = Date.now()
            pacijent.save()
            res.json({ success: true, message: 'Pacijent izmjenjen' })
          } else {
            pacijent.email = req.body.email
            pacijent.save()
            res.json({ success: true, message: 'Pacijent izmjenjen' })
          }
        } else {
          res.json({ success: false, message: 'Pacijent nije pronadjen' })
        }
      }
    })
  }
}

module.exports = pacijentController