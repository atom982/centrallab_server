const mongoose = require("mongoose");

const SchemaAntibiotici = mongoose.Schema({
  naziv: { type: String, required: true },
  opis: { type: String, required: true },
  rbr_a: { type: String, required: true, default: "0" },
});

const SchemaAntibiogrami = mongoose.Schema({
  naziv: { type: String, required: true },
  opis: { type: String, required: true },
  antibiotici: [{ type: mongoose.Schema.ObjectId, ref: "Antibiotici" }],
});

const SchemaBakterije = mongoose.Schema({
  naziv: { type: String, required: true },
  opis: { type: String, required: true },
  antibiogram: { type: mongoose.Schema.ObjectId, ref: "Antibiogrami" },
});

const models = [
  (Antibiotici = mongoose.model("Antibiotici", SchemaAntibiotici)),
  (Antibiogrami = mongoose.model("Antibiogrami", SchemaAntibiogrami)),
  (Bakterije = mongoose.model("Bakterije", SchemaBakterije)),
];

module.exports = models;
