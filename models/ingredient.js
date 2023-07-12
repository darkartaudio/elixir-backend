const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: String,
    type: String,
    alcoholic: {type: Boolean, required: true},
},{ timestamps:true })

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;