var mongoose = require("mongoose");

var Partneri = require("../models/Postavke");

var Partneri = mongoose.model("Partneri");

var fs = require("fs");
const config = require("../config/index");

var partneriController = {};

// Partneri - Pošiljaoc, Naručioc i Izvršioc

partneriController.PartneriAllGet = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    // res.json({
    //   success: true,
    //   message: "The server successfully processed the request, but is not returning any content."
    // });

    Partneri.find({}).exec(function (err, partneri) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        res.json({
          success: true,
          message: "The server successfully processed the request.",
          partneri: partneri,
        });
      }
    });
  }
};

partneriController.PartneriSingleGet = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    res.json({
      success: true,
      message:
        "The server successfully processed the request, but is not returning any content.",
    });
  }
};

partneriController.PartneriNewInsert = function (req, res) {
  var element = new Partneri(req.body);
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    element.save(function (err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        Partneri.find({}).exec(function (err, partneri) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err,
            });
          } else {
            res.json({
              success: true,
              message: "The server successfully processed the request.",
              partneri: partneri,
            });
          }
        });
      }
    });
  }
};

partneriController.PartneriSingleEdit = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    Partneri.replaceOne(
      { _id: mongoose.Types.ObjectId(req.body.partner._id) },

      {
        naziv: req.body.partner.naziv,
        opis: req.body.partner.opis,
        jib: req.body.partner.jib,
        adresa: req.body.partner.adresa,
        odgovornoLice: req.body.partner.odgovornoLice,
        telefon: req.body.partner.telefon,
        lokal: req.body.partner.lokal,
        email: req.body.partner.email,
        web: req.body.partner.web,
        postavke: req.body.partner.postavke,
        popust: req.body.partner.popust,
        created_at: req.body.partner.created_at,
        updated_at: req.body.partner.updated_at,
        created_by: req.body.partner.created_by,
        updated_by: req.body.partner.updated_by,
        __v: req.body.partner.__v,
      },

      { upsert: false }
    ).exec(function (err) {
      if (err) {
        console.log("Greška:", err);
        res.json({
          success: false,
          message: err,
        });
      } else {
        Partneri.find({}).exec(function (err, partneri) {
          if (err) {
            console.log("Greška:", err);
            res.json({
              success: false,
              message: err,
            });
          } else {
            res.json({
              success: true,
              message: "The server successfully processed the request.",
              partneri: partneri,
            });
          }
        });
      }
    });
  }
};

partneriController.PartneriSingleRemove = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    res.json({
      success: true,
      message:
        "The server successfully processed the request, but is not returning any content.",
    });
  }
};

partneriController.PartneriAllRemove = function (req, res) {
  if (mongoose.connection.readyState != 1) {
    res.json({
      success: false,
      message: "Greška prilikom konekcije na MongoDB.",
    });
  } else {
    res.json({
      success: true,
      message:
        "The server successfully processed the request, but is not returning any content.",
    });
  }
};

module.exports = partneriController;
