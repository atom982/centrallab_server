const mongoose = require("mongoose");

var SchemaKontrole = mongoose.Schema({
  maker: { type: String, required: true },
  aparati: [{ type: mongoose.Schema.ObjectId, ref: "Analyser" }],
  sifra: { type: String, required: true },
  multi: { type: Boolean, required: true },
  naziv: { type: String, required: true },
  lot: { type: String, required: true },
  rok: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  analize: [
    {
      labassay: { type: mongoose.Schema.ObjectId, ref: "Labassays" },
    },
  ],
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
});

var SchemaKreference = mongoose.Schema({
  kontrola: { type: mongoose.Schema.ObjectId, ref: "Kontrole" },
  aparat: { type: mongoose.Schema.ObjectId, ref: "Analyser" },
  reference: [
    {
      labassay: { type: mongoose.Schema.ObjectId, ref: "Labassays" },
      anaassay: { type: mongoose.Schema.ObjectId, ref: "AnaAssays" },
      refd: { type: String, required: false },
      refg: { type: String, required: false },
      interpretacija: { type: String, default: "none" },
      jedinica: { type: String, required: false },
    },
  ],
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
});

var SchemaControlSamples = mongoose.Schema({
  id: { type: String, required: true },
  kontrola: { type: mongoose.Schema.ObjectId, ref: "Kontrole" },
  komentar: { type: String, default: "" },
  updated_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_by: { type: String, default: null },
  created_by: { type: String, required: true },
  status: { type: String, required: true, default: "ZAPRIMLJEN" },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  tests: [
    {
      aparat: { type: mongoose.Schema.ObjectId, ref: "Analyser" },
      labassay: { type: mongoose.Schema.ObjectId, ref: "LabAssays" },
      anaassay: { type: mongoose.Schema.ObjectId, ref: "AnaAssays" },
      status: { type: String, required: true, default: "ZAPRIMLJEN" },
      retest: { type: Boolean, default: false },
      rezultat: [
        {
          sn: { type: String },
          vrijeme_prijenosa: { type: String },
          vrijeme_rezultata: { type: String },
          dilucija: { type: String },
          ref_d: { type: String },
          ref_g: { type: String },
          interpretacija: { type: String },
          module_sn: { type: String },
          reagens_lot: { type: String },
          reagens_sn: { type: String },
          rezultat_f: { type: String },
          jedinice_f: { type: String },
          rezultat_p: { type: String },
          jedinice_p: { type: String },
          rezultat_i: { type: String },
        },
      ],
    },
  ],
});

var SchemaControlNalazi = mongoose.Schema({
  kontrola: { type: mongoose.Schema.ObjectId, ref: "Kontrole" },
  id: { type: String, default: "" },
  komentar: { type: String, default: "" },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  aparati: [
    {
      aparat: { type: mongoose.Schema.ObjectId, ref: "Analyser" },
      status: { type: Boolean, default: false },
      headers: { type: Array, default: [] },
      rows: { type: Array, default: [] },
    },
  ],
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  created_by: { type: String, default: null },
  updated_by: { type: String, default: null },
});

const models = [
  (Kontrole = mongoose.model("Kontrole", SchemaKontrole)),
  (ControlSamples = mongoose.model("ControlSamples", SchemaControlSamples)),
  (Kreference = mongoose.model("Kreference", SchemaKreference)),
  (ControlNalazi = mongoose.model("ControlNalazi", SchemaControlNalazi)),
];

module.exports = models;
