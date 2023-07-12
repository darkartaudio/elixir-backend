const { Recipe, User } = require('../models');
const { randIntInterval } = require('../utils');

async function seedFavorites() {
    let allUsers = await User.find({});
    let allRecipes = await Recipe.find({});

    // For each user
    for (let i = 0; i < allUsers.length; i++) {
        let thisUser = allUsers[i];

        // Add a random number of favorite recipes
        let numFavorites = randIntInterval(1, 5);
        for (let j = 0; j < numFavorites; j++) {
            let randomRecipe = allRecipes[randIntInterval(0, allRecipes.length - 1)];

            thisUser.favorites.push(randomRecipe);
        }
        let savedUser = await thisUser.save();
        console.log(savedUser);
    }
}

seedFavorites();