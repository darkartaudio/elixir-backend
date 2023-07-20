// environment variables 
require('dotenv').config();
const mongoose = require('mongoose');
const { createRandomUser, createRandomRecipe, createRandomIngredient } = require('./utils')

// models for testing
const { User, Recipe, Ingredient, Comment } = require('./models');

// connect to the database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// create connection object
const db = mongoose.connection;

// once the database opens
db.once('open', ()=> {
    console.log('Connected to MongoDB Database: Elixir API at HOST: ', db.host, 'PORT: ', db.port)
});

// if there is a database error
db.on('error', (err)=> {
    console.log(`Database error: `, err)
});


// Create a user and save to DB
User.create(createRandomUser())
.then((user) => {
    console.log('created user', user);
})
.catch(error => {
    console.log('error', error);
});

// Create a recipe and add a user to it 
Recipe.create(createRandomRecipe())
.then(recipe => {
    console.log('new recipe', recipe);
    //push user to recipe
    recipe.createdBy.push('64acb3dbc98ab40079a81009');
    // save the recipe
    recipe.save()
    .then(updatedRecipe => {
        console.log('recipe updated', updatedRecipe);
        // print the User inside recie
        updatedRecipe.populate('createdBy')
        .then(result => {
            console.log('recipe with User', result);
        })
        .catch (error => console.log('error', error));
    })
    .catch (error => console.log('error', error));
})
.catch (error => console.log('error', error));

// Create then add ingredient to Recipe
Ingredient.create(createRandomIngredient())
.then(ingredient => {
    console.log('new ingredient', ingredient);
    Recipe.findById('64acb816ea2c0f589054066f')
    .then(recipe => {
        recipe.ingredients.push(ingredient);
        recipe.save()
        .then(updatedRecipe => {
            updatedRecipe.populate('ingredients')
            .then(result => {
                console.log('recipe with ingredient', result);
            })
            .catch (error => console.log('error', error));
        })
        .catch (error => console.log('error', error));
    })
    .catch (error => console.log('error', error));
})
.catch (error => console.log('error', error));

Ingredient.find({})
.then(ingredients => {
    ingredients.forEach(ingredient => {
        console.log(`${ingredient._id} => ${ingredient.name}`);
    });
});

Recipe.findOne({})
.then(result => console.log(result));

try {        
    const { userId } = req.params.id;
    const { followUserId } = req.body.following;

    // Find the user who wants to follow
    const user = await User.findById(userId);
    console.log('user', user);

    // Find the user to be followed
    const followUser = await User.findById(followUserId);
    console.log('user to be followed', followUser);

    // Add the followUser to the user's following list
    user.following.push(followUser._id);
    user.save();

    // Add the user to the followUser's followers list
    followUser.followers.push(user._id);
        followUser.save();

    res.status(200).json({ message: 'Successfully followed user.' });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while following the user.' });
}