const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  shift : {
     type : String,
     required : true
  },
  typeEmployee : {
     type : String,
     required : true
  },
  message:[
    {
      type: Schema.Types.ObjectId,
      ref : 'Message'
    }
  ]
});

module.exports = mongoose.model('Employee', employeeSchema);
