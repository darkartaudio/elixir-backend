require('dotenv').config();
const axios = require('axios');
const { Recipe, Ingredient } = require('../models');
const { wait, firstLettersCapitalized } = require('../utils');

// Recipe.deleteMany({})
// .then(result => console.log(result));

// Get list of all alcoholic drink IDs from API
axios.get(`${process.env.API}/filter.php?a=Alcoholic`)
.then(response => {
    let drinkIds = [];
    let drinks = response.data.drinks;
    let numDrinks = drinks.length;
    for (let i = 0; i < numDrinks; i++) {
        drinkIds.push(drinks[i].idDrink);
    }

    // Get list of all non-alcoholic drink IDs from API
    axios.get(`${process.env.API}/filter.php?a=Non_Alcoholic`)
    .then(async response => {
        let drinks = response.data.drinks;
        let numDrinks = drinks.length;
        for (let i = 0; i < numDrinks; i++) {
            drinkIds.push(drinks[i].idDrink);
        }

        // For each drink ID
        for (let i = 0; i < drinkIds.length; i++) {
            // Get full drink details from API
            axios.get(`${process.env.API}/lookup.php?i=${drinkIds[i]}`)
            .then(response => {
                let drink = response.data.drinks[0];
                // Construct drink object
                let newDrink = {
                    name: firstLettersCapitalized(drink.strDrink),
                    alcoholic: drink.strAlcoholic === 'Alcoholic' ? true: false,
                    image: drink.strDrinkThumb,
                    glassType: drink.strGlass,
                    category: drink.strCategory
                }
                // Seed database with drink object
                Recipe.create(newDrink)
                .then(async createdDrink => {
                    // For each potential ingredient
                    for (let i = 1; i <= 15; i++) {
                        let ingredient = drink[`strIngredient${i}`];
                        // If not null (some are null in API data)
                        if (ingredient) {
                            // Given name, get ingredient from mongoose
                            await Ingredient.findOne({ name: firstLettersCapitalized(drink[`strIngredient${i}`])})
                            .then(ingredient => {
                                // Add ingredient reference and measure to Recipe
                                createdDrink.ingredients.push(ingredient);
                                createdDrink.measures.push(drink[`strMeasure${i}`]);
                            })
                            .catch(err => console.log(err.message));
                        }
                    }
                    // Save changes to database
                    createdDrink.save()
                    .then(savedDrink => console.log(savedDrink.name))
                    .catch(err => console.log(err.message));
                })
            })
            .catch(err => console.log(err.message));

            // Wait half a second to avoid API throttling
            await wait(500);
        }
    })
    .catch(err => console.log(err.message));
})
.catch(err => console.log(err.message));