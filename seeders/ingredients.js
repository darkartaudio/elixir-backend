require('dotenv').config();
const axios = require('axios');
const { Ingredient } = require('../models');
const { wait, firstLettersCapitalized } = require('../utils');

// Ingredient.deleteMany({})
// .then(result => console.log(result));

// Get list of all ingredients names from API
axios.get(`${process.env.API}/list.php?i=list`)
.then(async response => {
    let numIngredients = response.data.drinks.length;

    // For each ingredient name
    for(let i = 0; i < numIngredients; i++) {
        // Get full ingredient details from API
        axios.get(`${process.env.API}/search.php?i=${response.data.drinks[i].strIngredient1}`)
        .then(response2 => {
            let ingredient = response2.data.ingredients[0];
            // Construct ingredient object
            let newIngredient = {
                name: firstLettersCapitalized(ingredient.strIngredient),
                description: ingredient.strDescription,
                type: ingredient.strType,
                alcoholic: ingredient.strAlcohol === 'Yes' ? true : false
            };
            // Seed database with ingredient object
            Ingredient.create(newIngredient)
            .then(ingredient => console.log(ingredient.name))
            .catch(err => console.log(err.message));
        })
        .catch(err => console.log(err.message));
        
        // Wait half a second to avoid API throttling
        await wait(500);
    }
})
.catch(err => console.log(err.message));