const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  image: [{
    url: String,
    filename: String
  }],
  price: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
});



module.exports = mongoose.model('Tutor', tutorSchema);
