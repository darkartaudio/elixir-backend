const { Recipe, User, Comment } = require('../models');
const { createRandomComment, randIntInterval } = require('../utils');

async function seedRandomComments() {
    let allUsers = await User.find({});
    let allRecipes = await Recipe.find({});

    // For each recipe
    for (let i = 0; i < allRecipes.length; i++) {
        let thisRecipe = allRecipes[i];

        // Add a random number of comments between 1 and 6
        let numComments = randIntInterval(1, 6);
        for (let j = 0; j < numComments; j++) {
            let newComment = new Comment(createRandomComment());

            let commentAuthor = allUsers[randIntInterval(0, allUsers.length - 1)];
            newComment.createdBy.push(commentAuthor);
            let savedComment = await newComment.save();

            commentAuthor.commentsByUser.push(savedComment);
            let savedAuthor = await commentAuthor.save();

            thisRecipe.comments.push(savedComment);
        }

        let savedRecipe = await thisRecipe.save();
        console.log(savedRecipe);
    }
}

seedRandomComments();