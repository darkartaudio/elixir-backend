const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
    measures: [String],
    instructions: String,
    alcoholic: {type: Boolean, required: true},
    image: String,
    createdBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    glassType: String,
    category: String,
    favoriteCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
},{ timestamps:true })

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;