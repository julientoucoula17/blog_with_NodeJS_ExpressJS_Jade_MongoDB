let mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
    name:{
      type: String,
      required: true
    },
    message:{
      type: String,
      required: true
    },
    article_id:{
      type: String,
      required: true
    },

});
let Comment = module.exports = mongoose.model('Comment',commentSchema);
