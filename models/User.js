const mongoose = require("mongoose"),
  bcrypt = require("bcrypt");

const Schema = mongoose.Schema({
  ime: { type: String, default: "John" },
  prezime: { type: String, default: "Doe" },
  email: { type: String, unique: true, required: true },
  active: { type: Boolean, default: true },
  password: { type: String, required: true },
  changed_at: {
    type: Date,
    default: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    ),
  },
  token: { type: String, required: true },
  role: { type: String, required: true },
  site: { type: mongoose.Schema.ObjectId, ref: "Site" },
  sites: [{ type: mongoose.Schema.ObjectId, ref: "Site" }],
  sidebar: { type: Array, default: [] },
  postavke: {
    default_route: { type: String, default: "/statistika" },
    card_view: { type: Boolean, default: false },
    customer: { type: Boolean, default: false },
    pid_bcode: { type: Boolean, default: false },
    language: { type: String, default: "ba" },
    idleTime: { type: Number, default: 28800000 },
    access: { type: Object, default: { level: 1, verify: false } },
    display: {
      type: Object,
      default: { list: "15", show: "20", columns: "7", rows: "1" },
    },
    reports: {
      type: Object,
      default: {
        fpodanu: true,
        ppodanu: true,
        ppomjestu: true,
        ppolokaciji: true,
        protokol: true,
        tatpopacijentu: true,
        worklists: true,
      },
    },
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

Schema.pre("save", function (next) {
  const user = this;

  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) return next(error);

      bcrypt.hash(user.password, salt, (error, hash) => {
        if (error) return next(error);

        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

Schema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (error, matches) => {
    if (error) return callback(error);
    callback(null, matches);
  });
};

const models = [(User = mongoose.model("User", Schema))];

module.exports = models;
