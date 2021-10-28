const messageSchema = new require('mongoose').mongoose.Schema({
     senderId: {
          type : String, 
          required : true
     },
     recieverId: {
          type : String,
          required : true,
     },
     content : {
          type :  String,
          required : true
     },
     sendingDate : {
          type : String,
          required :  true,
     }
});
module.exports = mongoose.model('Message',messageSchema);
