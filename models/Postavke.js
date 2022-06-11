const mongoose = require("mongoose");

var SchemaTip = mongoose.Schema({
  tipAparata: { type: String, required: true },
});

var SchemaTehno = mongoose.Schema({
  tehnologijaAparata: { type: String, required: true },
});

var SchemaTipUzorka = mongoose.Schema({
  tip: { type: String, required: true },
});

var SchemaProtokol = mongoose.Schema({
  protokol: { type: Array, default: [] },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
});

var SchemaLokacija = mongoose.Schema({
  lokacija: { type: String, required: true },
  email: { type: String, required: true, default: "" },
  sendEmail: { type: Boolean, required: true, default: false },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
});

var SchemaCustomers = mongoose.Schema({
  naziv: { type: String, required: true },
  opis: { type: String, required: true },
  telefon: { type: String, required: true },
  email: { type: String, required: true },
  adresa: { type: String, required: true },
});

var SchemaDoktor = mongoose.Schema({
  doktorIme: { type: String, required: true },
  doktorPrezime: { type: String, required: true },
  lokacija: { type: String, required: true },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
});

var SchemaSekcija = mongoose.Schema({
  sekcija: { type: String, required: true },
  order: { type: String, default: "0" },
});

var SchemaGrupaTesta = mongoose.Schema({
  grupa: { type: String, required: true },
  sekcija: { type: mongoose.Schema.ObjectId, ref: "Sekcija" },
});

var SchemaReferentneGrupe = mongoose.Schema({
  grupa: { type: String, required: true },
});

var SchemaJedinice = mongoose.Schema({
  jedinica: { type: String, required: true },
});

var SchemaAnalyser = mongoose.Schema({
  ime: { type: String, required: true },
  sn: { type: String, unique: true, required: true },
  make: { type: String, required: true },
  tip: { type: String, required: true },
  manual: { type: Boolean, required: false, default: false },
  tehnologija: [{ type: String, required: true }],
  sekcija: { type: String, required: true },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
});

var SchemaLabAssays = mongoose.Schema({
  sifra: { type: String, required: false },
  naziv: { type: String, required: false },
  multi: { type: Boolean, default: false },
  multiparam: [
    {
      kod: { type: String, required: false, default: "" },
      naziv: { type: String, required: false, default: "" },
      opis: { type: String, required: false, default: "" },
      jedinica: { type: String, required: false, default: "" },
      interpretacija: {
        opis: { type: String, default: "Nema podataka." },
        poviseno: {
          type: Object,
          default: { text: "Nema podataka.", dijagnoza: [] },
        },
        snizeno: {
          type: Object,
          default: { text: "Nema podataka.", dijagnoza: [] },
        },
        vrijeme: { type: String, default: "Nema podataka." },
        priprema: { type: String, default: "Nema podataka." },
        napomena: { type: String, default: "Nema podataka." },
      },
      izbornik: { type: Array, default: [] },
    },
  ],
  analit: { type: String, required: false },
  sekcija: { type: String, required: false },
  grupa: { type: String, required: false },
  grouporder: { type: String, default: "" },
  entryorder: { type: String, default: "A" },
  analyser: { type: String, default: "Nema podataka" },
  specific: { type: Boolean, required: false, default: false },
  sites: { type: Array, default: ["S", "C", "D", "T"] },
  jedinica: { type: String, required: false, default: "n/a" },
  tip: { type: String, required: false, default: "Serum 1" },
  code: { type: String, default: "" },
  bundle: { type: Boolean, required: false, default: false },
  bundledTests: [
    {
      labassay: { type: String, required: false, default: "" },
      itemName: { type: String, required: false, default: "" },
      opis: { type: String, required: false, default: "" },
      manual: { type: Boolean, required: false, default: false },
      uzorak: { type: String, required: false, default: "" },
      cijena: { type: String, required: false, default: "0" },
      code: { type: String, required: false, default: "" },
      izabran: { type: Boolean, required: false, default: false },
      klasa: { type: String, required: false, default: "warning" },
    },
  ],
  kategorija: { type: String, required: false, default: "" },
  test_type: { type: String, required: false, default: "default" },
  neg_description: { type: Array, default: [""] }, // { type: String, required: false, default: "" },
  pos_description: { type: Array, default: [""] }, // { type: String, required: false, default: "" },
  bakterije: [{ type: mongoose.Schema.ObjectId, ref: "Bakterije" }],
  interpretacija: {
    opis: { type: String, default: "Nema podataka." },
    poviseno: {
      type: Object,
      default: { text: "Nema podataka.", dijagnoza: [] },
    },
    snizeno: {
      type: Object,
      default: { text: "Nema podataka.", dijagnoza: [] },
    },
    vrijeme: { type: String, default: "Nema podataka." },
    priprema: { type: String, default: "Nema podataka." },
    napomena: { type: String, default: "Nema podataka." },
  },
  orderbyusage: { type: Number, min: 0, max: 650, default: "0" },
  manual: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  calculated: { type: Boolean, default: false },
  calculatedTests: [
    {
      labassay: { type: String, required: false, default: "" },
      ime_testa: { type: String, required: false, default: "" },
      analit: { type: String, required: false, default: "" },
      manual: { type: Boolean, required: false, default: false },
      itemName: { type: String, required: false, default: "" },
      opis: { type: String, required: false, default: "" },
      uzorak: { type: String, required: false, default: "" },
      cijena: { type: String, required: false, default: "0" },
      code: { type: String, required: false, default: "" },
      izabran: { type: Boolean, required: false, default: false },
      klasa: { type: String, required: false, default: "warning" },
    },
  ],
  calculatedFormula: { type: Array, default: [] },
  price: { type: String, default: "0" },
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
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

var SchemaAnaAssays = mongoose.Schema({
  aparat: { type: mongoose.Schema.ObjectId, ref: "Analyser" },
  test: { type: mongoose.Schema.ObjectId, ref: "LabAssays" },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  sekcija: { type: String, required: true },
  grupa: { type: String, required: true },
  kod: { type: String, required: true },
  float: { type: String, default: "" },
  metoda: { type: String, required: true },
  reference: [
    {
      analit: { type: String, default: null },
      interp: { type: String, default: "none" },
      extend: { type: String, default: "" },
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
  updated_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

var SchemaPatients = mongoose.Schema({
  jmbg: { type: String, required: true },
  ime: { type: String, required: true },
  prezime: { type: String, required: true },
  spol: { type: String },
  duhan: { type: String, default: "Nema podataka" },
  dijabetes: { type: String, default: "Nema podataka" },
  lokacija: { type: mongoose.Schema.ObjectId, ref: "Lokacija" },
  passport: { type: String, default: "" },
  telefon: { type: String, default: "" },
  email: { type: String, default: "" },
  adresa: { type: String, default: "" },
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
  created_by: { type: String, default: null },
  updated_by: { type: String, default: null },
});

var SchemaSamples = mongoose.Schema({
  type: { type: String, required: true },
  tip: { type: String, default: "" }, // Serum 2, Plazma Citrat
  timestamp: { type: String },
  protokol: { type: String, default: null },
  id: { type: String, required: true, unique: true },
  migrated: { type: Boolean, default: false },
  pid: { type: String, default: "NaN" },
  rejected: {
    type: Object,
    default: {
      status: false,
      reason: null,
      datum: new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, -8)
        .replace("T", " "),
      by: null,
    },
  },

  datum: {
    type: String,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, -8)
      .replace("T", " "),
  },
  status: { type: String, default: "n/a" },
  doktor: { type: String, default: "n/a" },
  lokacija: { type: mongoose.Schema.ObjectId, ref: "Lokacija" },

  // Partneri - Pošiljaoc, Naručioc i Izvršioc
  posiljaoc: { type: mongoose.Schema.ObjectId, ref: "Partneri", default: null },
  narucioc: { type: mongoose.Schema.ObjectId, ref: "Partneri", default: null },

  // Cjenovnik, Paketi laboratorijskih pretraga
  panel: {
    naziv: { type: mongoose.Schema.ObjectId, ref: "LabAssays", default: null },
    cijena: { type: String, default: "0" },
  },
  
  nodiscount: { type: String, default: null },
  discount: { type: String, default: null },
  total: { type: String, default: null },

  customer: { type: mongoose.Schema.ObjectId, ref: "Customers", default: null },
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  trudnica: { type: String, default: "NE" },
  menstc: { type: String, default: "NE" },
  code: { type: String, default: "" },
  anticoag: { type: String, default: "NE" },
  menopauza: { type: String, default: "NE" },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  prioritet: { type: String, default: "NORMALAN" },
  komentar: { type: String, default: "" },
  tests: [
    {
      // Partneri - Pošiljaoc, Naručioc i Izvršioc
      izvrsioc: {
        type: mongoose.Schema.ObjectId,
        ref: "Partneri",
        default: null,
      },
      cijena: { type: String, default: "0" },

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
  updated_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

// Računi

var SchemaRacuni = mongoose.Schema({
  nodiscount: { type: String, default: null },
  discount: { type: String, default: null },
  total: { type: String, default: null },
  assays: { type: Array, default: [] },  
  samples: { type: Array, default: [] },
  timestamp: { type: String , default: "" },
  valid: { type: Boolean, default: true },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  posiljaoc: { type: mongoose.Schema.ObjectId, ref: "Partneri", default: null },
  narucioc: { type: mongoose.Schema.ObjectId, ref: "Partneri", default: null },
  sampled_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },  
  pid: { type: String , default: "" },
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
  created_by: { type: String, default: "Nema podataka" },
  updated_by: { type: String, default: "Nema podataka" },
});

// End of Računi

var SchemaResults = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  migrated: { type: Boolean, default: false },
  timestamp: { type: String },
  protokol: { type: String, default: null },

  // Partneri - Pošiljaoc, Naručioc i Izvršioc
  posiljaoc: { type: mongoose.Schema.ObjectId, ref: "Partneri", default: null },
  narucioc: { type: mongoose.Schema.ObjectId, ref: "Partneri", default: null },

  // Cjenovnik, Paketi laboratorijskih pretraga
  panel: {
    naziv: { type: mongoose.Schema.ObjectId, ref: "LabAssays", default: null },
    cijena: { type: String, default: "0" },
  },

  nodiscount: { type: String, default: null },
  discount: { type: String, default: null },
  total: { type: String, default: null },

  verificiran: { type: Boolean, default: false },
  sample: { type: mongoose.Schema.ObjectId, ref: "Samples" },
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  customer: { type: mongoose.Schema.ObjectId, ref: "Customers", default: null },
  status: { type: String },
  odobren: { type: Boolean, default: false },
  isPrinted: { type: Boolean, default: false },
  protokol: { type: String, default: "" },
  rezultati: [
    {
      // Partneri - Pošiljaoc, Naručioc i Izvršioc
      izvrsioc: {
        type: mongoose.Schema.ObjectId,
        ref: "Partneri",
        default: null,
      },
      cijena: { type: String, default: "0" },

      labassay: { type: mongoose.Schema.ObjectId, ref: "LabAssays" }, // link na kks
      status: { type: String, default: "U OBRADI" }, // ostaje
      retest: { type: Boolean, default: false }, // retest treba i za analite
      interp: { type: String, default: null },
      extend: { type: String, default: "" },
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
          rezultat_m: { type: Array, default: [] },
          jedinice_f: { type: String },
          rezultat_p: { type: String },
          jedinice_p: { type: String },
          rezultat_i: { type: String },
          odobren: { type: Boolean },
          odobren_by: { type: String, default: "" },
          odobren_at: {
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
          updated_at: {
            type: Date,
            default: new Date(
              new Date().getTime() - new Date().getTimezoneOffset() * 60000
            ),
          },
          created_by: { type: String, default: "" },
          updated_by: { type: String, default: null },
        },
      ],
    },
  ],
  multi: { type: Array, default: [] },
  controlmulti: { type: Boolean, default: false },
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
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

var SchemaNalazi = mongoose.Schema({
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  migrated: { type: Boolean, default: false },
  uzorci: { type: Array, default: [] },
  timestamp: { type: String, default: "" },
  location: { type: String, default: "" },
  customer: { type: mongoose.Schema.ObjectId, ref: "Customers", default: null },

  // Partneri - Pošiljaoc, Naručioc i Izvršioc
  posiljaoc: { type: mongoose.Schema.ObjectId, ref: "Partneri", default: null },
  narucioc: { type: mongoose.Schema.ObjectId, ref: "Partneri", default: null },

  naziv: { type: String, default: "" },
  height: { type: String, default: "0" },
  komentar: { type: String, default: "" },
  protokol: { type: String, default: null },
  languages: { type: Array, default: ["BA"] }, // EN, DE
  status: { type: Boolean, default: false },
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
  created_by: { type: String, default: "" },
  headers: { type: Array, default: [] },
  headersa: { type: Array, default: [] },
  rows: { type: Array, default: [] },
  legenda: { type: Array, default: [] },
  specificni: { type: Array, default: [] },
  uzorkovano: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  pid: { type: String, default: "1" },
});

var SchemaPaneli = mongoose.Schema({
  sifra: { type: String, default: "" },
  naziv: { type: String, default: "" },
  opis: { type: String, default: "" },
  price: { type: String, default: "0" },
  sekcija: { type: String, default: "" },
  testovi: [
    {
      labassay: { type: String, required: true },
      ime_testa: { type: String, required: true },
      analit: { type: String, default: "" },
      cijena: { type: String, default: "0" },
      manual: { type: Boolean, default: false },
      calculated: { type: Boolean, default: false },
      calculatedTests: { type: Array, default: [] },
    },
  ],
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
});

var SchemaSite = mongoose.Schema({
  sifra: { type: String, required: true, unique: true },
  naziv: { type: String, required: true, unique: true },
  opis: { type: String, required: true, default: "" },
  adresa: { type: String, required: true, default: "" },
  odgovornoLice: { type: String, required: true, default: "" },
  telefon: { type: String, required: true, default: "" },
  mobitel: { type: String, required: true, default: "" },
  lokal: { type: String, required: true, default: "Nema podataka" },
  email: { type: String, default: "" },
  mjesta: { type: Array, default: ["NEPOZNATO"] },
  mikrobioloski: { type: Boolean, default: false },
  sidebar: { type: Array, default: [] },
  web: { type: String, default: "" },
  postavke: {
    nalazLegenda: { type: Boolean, default: false },
    Interpretacija: { type: Boolean, default: false },
    nalazMemorandum: { type: Boolean, default: false },
    mailToLokacija: { type: Boolean, default: false },
  },
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
  created_by: { type: String, default: "" },
  updated_by: { type: String, default: "" },
});

var SchemaOutbox = mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  naziv: { type: String, required: true },
  nalaz: { type: mongoose.Schema.ObjectId, ref: "Nalazi" },
  language: { type: String, default: "BA" },
  patient: { type: mongoose.Schema.ObjectId, ref: "Patients" },
  migrated: { type: Boolean, default: false },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  created_by: { type: String, default: "" },
});

var SchemaSettings = mongoose.Schema({
  lokacije: { type: Array, default: [] },
  doktori: { type: Array, default: [] },
  mjesta: { type: Array, default: [] },
  sekcije: { type: Array, default: [] },
  grupe: { type: Array, default: [] },
  ref_grupe: { type: Array, default: [] },
  jedinice: { type: Array, default: [] },
  analyser_tehnologije: { type: Array, default: [] },
  analyser_tipovi: { type: Array, default: [] },
  ana_tipovi: { type: Array, default: [] },
  lab_tipovi: { type: Array, default: [] },
  kategorije: { type: Array, default: [] },
  entryorders: { type: Array, default: [] },
});

var SchemaUzorci = mongoose.Schema({
  ime: { type: String, default: "" },
  code: { type: Array, default: [] },
  tip: { type: String, default: "" },
  patient: { type: Object, default: {} },
  testovi: { type: Array, default: [] },
  testoviTag: { type: Array, default: [] },
  hitno: { type: Boolean, default: false },
  time: { type: Date, default: null },
  komentar: { type: String, default: "" },
});

var SchemaIntegrationRaw = mongoose.Schema({
  protokol: { type: String, unique: true, required: true },
  pime: { type: String, required: true },
  pprez: { type: String, required: true },
  imeo: { type: String, required: true },
  jmbg7: { type: String, required: true },
  spol: { type: String },
  analize: { type: Array, default: [] },
  created_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
});

var SchemaIntegration = mongoose.Schema({
  remote_id: { type: String, unique: true, required: true },
  local_id: { type: mongoose.Schema.ObjectId, ref: "LabAssays" },
  multiparam: {
    type: { Boolean, required: true, default: false },
    id: { type: mongoose.Schema.ObjectId },
  },
});

// Partneri - Pošiljaoc, Naručioc i Izvršioc

var SchemaPartneri = mongoose.Schema({
  naziv: { type: String, default: "Nema podataka" },
  opis: { type: String, default: "Nema podataka" },
  jib: { type: String, default: "Nema podataka" },
  adresa: { type: String, default: "Nema podataka" },
  odgovornoLice: { type: String, default: "Nema podataka" },
  telefon: { type: String, default: "Nema podataka" },
  lokal: { type: String, default: "Nema podataka" },
  email: { type: String, default: "Nema podataka" },
  web: { type: String, default: "Nema podataka" },
  popust: { type: String, default: "0" },
  postavke: {
    type: Object,
    default: { posiljaoc: false, narucioc: false, izvrsioc: false },
  },

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
  created_by: { type: String, default: "Nema podataka" },
  updated_by: { type: String, default: "Nema podataka" },
});

const models = [
  (tipAparata = mongoose.model("tipAparata", SchemaTip)),
  (tehnologijaAparata = mongoose.model("tehnologijaAparata", SchemaTehno)),
  (tipUzorka = mongoose.model("tipUzorka", SchemaTipUzorka)),
  (Lokacija = mongoose.model("Lokacija", SchemaLokacija)),
  (Partneri = mongoose.model("Partneri", SchemaPartneri)), // Partneri - Pošiljaoc, Naručioc i Izvršioc
  (Racuni = mongoose.model("Racuni", SchemaRacuni)), // Računi
  (Customers = mongoose.model("Customers", SchemaCustomers)),
  (Doktor = mongoose.model("Doktor", SchemaDoktor)),
  (Sekcija = mongoose.model("Sekcija", SchemaSekcija)),
  (grupaTesta = mongoose.model("grupaTesta", SchemaGrupaTesta)),
  (Analyser = mongoose.model("Analyser", SchemaAnalyser)),
  (LabAssays = mongoose.model("LabAssays", SchemaLabAssays)),
  (AnaAssays = mongoose.model("AnaAssays", SchemaAnaAssays)),
  (ReferentneGrupe = mongoose.model("ReferentneGrupe", SchemaReferentneGrupe)),
  (Jedinice = mongoose.model("Jedinice", SchemaJedinice)),
  (Patients = mongoose.model("Patients", SchemaPatients)),
  (Samples = mongoose.model("Samples", SchemaSamples)),
  (Results = mongoose.model("Results", SchemaResults)),
  (Protokol = mongoose.model("Protokol", SchemaProtokol)),
  (Nalazi = mongoose.model("Nalazi", SchemaNalazi)),
  (Paneli = mongoose.model("Paneli", SchemaPaneli)),
  (Site = mongoose.model("Site", SchemaSite)),
  (Outbox = mongoose.model("Outbox", SchemaOutbox)),
  (Settings = mongoose.model("Settings", SchemaSettings)),
  (Uzorci = mongoose.model("Uzorci", SchemaUzorci)),
  (IntegrationRaw = mongoose.model("IntegrationRaw", SchemaIntegrationRaw)),
  (Integration = mongoose.model("Integration", SchemaIntegration)),
];

module.exports = models;
