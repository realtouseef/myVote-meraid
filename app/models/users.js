'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  userId: { type: Number, required: true },
  //   email: String,
  //   hashed_password: String,
  //   salt: String,
  name: String,
  polls: { type: [String] },
});

module.exports = mongoose.model('User', User);
