let mongoose = require('mongoose');

let likeSchema = mongoose.Schema({
    username:{
      type: String,
      required: true
    },
    article:{
      type: String,
      required: true
    }
});
let Like = module.exports = mongoose.model('Like',likeSchema);
