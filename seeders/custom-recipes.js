const { Recipe, Ingredient, User } = require('../models');
const { createRandomRecipe, randIntInterval } = require('../utils');

async function seedCustomRecipes() {
    let allUsers = await User.find({});
    let allIngredients = await Ingredient.find({});
    let possibleMeasures = ['1/4 oz ', '1/2 oz ', '1 oz '];

    // For each user
    for (let i = 0; i < allUsers.length; i++) {
        let thisUser = allUsers[i];
        let numRecipes = randIntInterval(3, 6);
        for (let j = 0; j < numRecipes; j++) {
            let newRecipe = new Recipe(createRandomRecipe());
            newRecipe.createdBy.push(thisUser);
            
            let numIngredients = randIntInterval(2, 6);
            for (let k = 0; k < numIngredients; k++) {
                newRecipe.ingredients.push(allIngredients[randIntInterval(0, allIngredients.length - 1)]);
                newRecipe.measures.push(possibleMeasures[randIntInterval(0, possibleMeasures.length - 1)]);
            }
            let savedRecipe = await newRecipe.save();
            thisUser.recipesByUser.push(savedRecipe);
            console.log(savedRecipe);
        }
        let savedUser = await thisUser.save();
        console.log(savedUser);
    }
}

seedCustomRecipes();