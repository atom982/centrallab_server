const mongoose = require("mongoose");

const SchemaAudit_Login = mongoose.Schema({
  user: { type: String, required: true },
  login_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  logout_at: { type: Date, default: null },
  token: { type: String, required: true },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  type: { type: String },
});

const SchemaAudit_Patients = mongoose.Schema({
  jmbg: { type: String, required: true },
  ime: { type: String, required: true },
  prezime: { type: String, required: true },
  spol: { type: String },
  duhan: { type: String, default: "NEPOZNATO" },
  dijabetes: { type: String, default: "NEPOZNATO" },
  lokacija: { type: mongoose.Schema.ObjectId, ref: "Lokacija" },
  telefon: { type: String, default: "NEPOZNATO" },
  email: { type: String, default: "NEPOZNATO" },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_at: { type: Date, default: null },
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

const SchemaAudit_SampleDelete = mongoose.Schema({
  type: { type: String, required: true },
  id: { type: String, required: true },
  datum: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  status: { type: String, default: "n/a" },
  doktor: { type: String, default: "n/a" },
  lokacija: { type: mongoose.Schema.ObjectId, ref: "Lokacija" },
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  trudnica: { type: String, default: "NE" },
  menstc: { type: String, default: "NE" },
  anticoag: { type: String, default: "NE" },
  menopauza: { type: String, default: "NE" },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  prioritet: { type: String, default: "RUTINA" },
  komentar: { type: String, default: "" },
  tests: [
    {
      labassay: { type: mongoose.Schema.ObjectId, ref: "LabAssays" },
      status_r: { type: Boolean, default: false },
      status_t: { type: String, default: "ZAPRIMLJEN" },
    },
  ],
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_at: { type: Date, default: null },
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
  deleted_by: { type: String, default: "" },
  deleted_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
});

const SchemaAudit_ResultDelete = mongoose.Schema({
  id: { type: String, required: true },
  sample: { type: mongoose.Schema.ObjectId, ref: "Samples" },
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  status: { type: String },
  odobren: { type: Boolean, default: false },
  created_at: { type: Date, default: null },
  updated_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  rezultati: [
    {
      labassay: { type: mongoose.Schema.ObjectId, ref: "LabAssays" }, // link na kks
      status: { type: String, default: "U OBRADI" }, // ostaje
      retest: { type: Boolean, default: false }, // retest treba i za analite
      grupa: { type: String, default: null }, // nivo uzorka ostaje
      refd: { type: String, default: null }, // ANALIT
      refg: { type: String, default: null }, // MANUAL ili ANALYSER
      rezultat: [
        {
          anaassay: { type: mongoose.Schema.ObjectId, ref: "AnaAssays" },
          sn: { type: String },
          vrijeme_prijenosa: { type: String },
          vrijeme_rezultata: { type: String },
          dilucija: { type: String },
          module_sn: { type: String },
          reagens_lot: { type: String },
          reagens_sn: { type: String },
          rezultat_f: { type: String },
          jedinice_f: { type: String },
          rezultat_p: { type: String },
          jedinice_p: { type: String },
          rezultat_i: { type: String },
          odobren: { type: Boolean },
        },
      ],
    },
  ],
  multi: { type: Array, default: [] },
  controlmulti: { type: Boolean, default: false },
  deleted_by: { type: String, default: "" },
  deleted_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
});

const SchemaAudit_Sample = mongoose.Schema({
  type: { type: String, required: true },
  id: { type: String, required: true },
  datum: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  status: { type: String, default: "n/a" },
  doktor: { type: String, default: "n/a" },
  lokacija: { type: mongoose.Schema.ObjectId, ref: "Lokacija" },
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  trudnica: { type: String, default: "NE" },
  menstc: { type: String, default: "NE" },
  anticoag: { type: String, default: "NE" },
  menopauza: { type: String, default: "NE" },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  prioritet: { type: String, default: "RUTINA" },
  komentar: { type: String, default: "" },
  tests: [
    {
      labassay: { type: mongoose.Schema.ObjectId, ref: "LabAssays" },
      status_r: { type: Boolean, default: false },
      status_t: { type: String, default: "ZAPRIMLJEN" },
    },
  ],
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_at: { type: Date, default: null },
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

const SchemaAudit_Result = mongoose.Schema({
  id: { type: String, required: true },
  sample: { type: mongoose.Schema.ObjectId, ref: "Samples" },
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  status: { type: String },
  odobren: { type: Boolean, default: false },
  rezultati: [
    {
      labassay: { type: mongoose.Schema.ObjectId, ref: "LabAssays" }, // link na kks
      status: { type: String, default: "U OBRADI" }, // ostaje
      retest: { type: Boolean, default: false }, // retest treba i za analite
      grupa: { type: String, default: null }, // nivo uzorka ostaje
      refd: { type: String, default: null }, // ANALIT
      refg: { type: String, default: null }, // MANUAL ili ANALYSER
      rezultat: [
        {
          anaassay: { type: mongoose.Schema.ObjectId, ref: "AnaAssays" },
          sn: { type: String },
          vrijeme_prijenosa: { type: String },
          vrijeme_rezultata: { type: String },
          dilucija: { type: String },
          module_sn: { type: String },
          reagens_lot: { type: String },
          reagens_sn: { type: String },
          rezultat_f: { type: String },
          jedinice_f: { type: String },
          rezultat_p: { type: String },
          jedinice_p: { type: String },
          rezultat_i: { type: String },
          odobren: { type: Boolean },
        },
      ],
    },
  ],
  multi: { type: Array, default: [] },
  controlmulti: { type: Boolean, default: false },
  created_at: { type: Date, default: null },
  updated_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: null },
});

const SchemaAudit_Rezultati = mongoose.Schema({
  id: { type: String, required: true },
  rezultati: [
    {
      labassay: { type: mongoose.Schema.ObjectId, ref: "LabAssays" }, // link na kks
      status: { type: String, default: "U OBRADI" }, // ostaje
      retest: { type: Boolean, default: false }, // retest treba i za analite
      grupa: { type: String, default: null }, // nivo uzorka ostaje
      refd: { type: String, default: null }, // ANALIT
      refg: { type: String, default: null }, // MANUAL ili ANALYSER
      rezultat: [
        {
          anaassay: { type: mongoose.Schema.ObjectId, ref: "AnaAssays" },
          sn: { type: String },
          vrijeme_prijenosa: { type: String },
          vrijeme_rezultata: { type: String },
          dilucija: { type: String },
          module_sn: { type: String },
          reagens_lot: { type: String },
          reagens_sn: { type: String },
          rezultat_f: { type: String },
          jedinice_f: { type: String },
          rezultat_p: { type: String },
          jedinice_p: { type: String },
          rezultat_i: { type: String },
          odobren: { type: Boolean },
          odobren_by: { type: String, default: "" },
          odobren_at: { type: Date, default: null },
          created_at: {
            type: Date,
            default: new Date(
              new Date().getTime() - new Date().getTimezoneOffset() * 60000
            ),
          },
          updated_at: { type: Date, default: null },
          created_by: { type: String, default: "" },
          updated_by: { type: String, default: null },
        },
      ],
    },
  ],
  multi: { type: Array, default: [] },
});

var SchemaAudit_LabAssays = mongoose.Schema({
  sifra: { type: String, required: true },
  naziv: { type: String, required: true },
  multi: { type: Boolean, default: false },
  multiparam: [
    {
      kod: { type: String, required: true, default: "" },
      naziv: { type: String, required: true, default: "" },
      opis: { type: String, required: true, default: "" },
      jedinica: { type: String, required: true, default: "" },
    },
  ],
  analit: { type: String, required: true },
  sekcija: { type: String, required: true },
  grupa: { type: String, required: true },
  grouporder: { type: String, default: "" },
  jedinica: { type: String, required: true, default: "n/a" },
  manual: { type: Boolean, default: false },
  calculated: { type: Boolean, default: false },
  calculatedTests: [
    {
      labassay: { type: String, required: true, default: "" },
      ime_testa: { type: String, required: true, default: "" },
      analit: { type: String, required: true, default: "" },
      manual: { type: Boolean, required: true, default: false },
    },
  ],
  calculatedFormula: { type: Array, default: [] },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  price: { type: String, default: "0" },
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_at: { type: Date, default: null },
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

var SchemaAudit_AnaAssays = mongoose.Schema({
  aparat: { type: mongoose.Schema.ObjectId, ref: "Analyser" },
  test: { type: mongoose.Schema.ObjectId, ref: "LabAssays" },
  sekcija: { type: String, required: true },
  grupa: { type: String, required: true },
  kod: { type: String, required: true },
  metoda: { type: String, required: true },
  reference: [
    {
      analit: { type: String, default: null },
      grupa: { type: String, default: null },
      spol: { type: String, default: null },
      dDob: { type: String, default: null },
      gDob: { type: String, default: null },
      refd: { type: String, default: null },
      refg: { type: String, default: null },
    },
  ],
  tipoviUzorka: { type: Array, default: [] },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  price: { type: String, default: "0" },
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  updated_at: { type: Date, default: null },
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

const models = [
  (Audit_Login = mongoose.model("Audit_Login", SchemaAudit_Login)),
  (Audit_Patients = mongoose.model("Audit_Patients", SchemaAudit_Patients)),
  (Audit_SampleDelete = mongoose.model(
    "Audit_SampleDelete",
    SchemaAudit_SampleDelete
  )),
  (Audit_ResultDelete = mongoose.model(
    "Audit_ResultDelete",
    SchemaAudit_ResultDelete
  )),
  (Audit_Sample = mongoose.model("Audit_Sample", SchemaAudit_Sample)),
  (Audit_Result = mongoose.model("Audit_Result", SchemaAudit_Result)),
  (Audit_Rezultati = mongoose.model("Audit_Rezultati", SchemaAudit_Rezultati)),
  (Audit_LabAssays = mongoose.model("Audit_LabAssays", SchemaAudit_LabAssays)),
  (Audit_AnaAssays = mongoose.model("Audit_AnaAssays", SchemaAudit_AnaAssays)),
];

module.exports = models;
