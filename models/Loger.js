const mongoose = require("mongoose");

const SchemaFrizider = mongoose.Schema({
  slave_id: { type: String, required: true, unique: true },
  lokacija: { type: String, required: true },
  opis: { type: String, required: true },
  ime: { type: String, required: true },
  mac: [],
  opseg: {
    refd: { type: String },
    refg: { type: String },
  },
  odgovoran: {
    ime: { type: String },
    prezime: { type: String },
    email: { type: String },
  },
  postavke: {
    hertzcal: { type: String, default: "" },
    tempcal: { type: String, default: "" },
    humcal: { type: String, default: "" },
  },
  alarm: {
    type: mongoose.Schema.ObjectId,
    ref: "Alarm",
  },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
});

const SchemaAlarm = mongoose.Schema({
  lokacija: { type: String, required: true },
  opis: { type: String, required: true },
  ime: { type: String, required: true },
  mac: [],
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
});

const SchemaTempLog = mongoose.Schema({
  frizider: { type: mongoose.Schema.ObjectId, ref: "Frizider" },
  temperatura: { type: String, required: true },
  vlaznost: { type: String, required: true },
  datumVrijeme: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
});
const models = [
  (Frizider = mongoose.model("Frizider", SchemaFrizider)),
  (TempLog = mongoose.model("TempLog", SchemaTempLog)),
  (Alarm = mongoose.model("Alarm", SchemaAlarm)),
];

module.exports = models;
