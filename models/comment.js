const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    title: String,
    body: {type: String, required: true},
    createdBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},{ timestamps:true })

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;