const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
symbol: String,
data: Object,
//   createdAt: { type: Date, default: Date.now }
}); // <- allow unstructured nested data

const Equity = mongoose.model('Equity', userSchema, 'equities');
module.exports = Equity;
