const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = process.env;
const { Recipe, User, Comment } = require('../models');
const { parseValue } = require('../utils');

router.get('/', (req, res) => {
    Recipe.find({}, '_id name')
    .then((recipes) => {
        return res.json({ recipes: recipes });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...'});
    })
});

router.get('/trending/:num', (req, res) => {
    Recipe.find({})
    .sort({ favoriteCount: -1 })
    .limit(parseInt(req.params.num))
    .populate('ingredients createdBy')
    .then((recipes) => {
        return res.json({ recipes: recipes });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...'});
    });
});

router.get('/random/:num', (req, res) => {
    Recipe.find({})
    .populate('ingredients createdBy')
    .then(allRecipes => {
        let randomRecipes = [];
        let randomIndexes = [];
        for (let i = 0; i < parseInt(req.params.num); i++) {
            while (true) {
                let randomIndex = Math.floor(Math.random() * allRecipes.length);
                if (!randomIndexes.includes(randomIndex)) {
                    randomIndexes.push(randomIndex);
                    randomRecipes.push(allRecipes[randomIndex]);
                    break;
                }
            }
        }
        return res.json({ recipes: randomRecipes });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...'});
    });
});

router.get('/my', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log(req.user.id);
    Recipe.find({ createdBy: req.user.id})
    .populate('ingredients createdBy')
    .then((recipes) => {
        console.log('recipes', recipes);
        return res.json({ recipes: recipes });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...'});
    });
});

router.get('/:field/:value', (req, res) => {
    let field = req.params.field;
    let value = req.params.value;
    // console.log('field', 'value', field, value);
    
    Recipe.find({ [field]:[value] })
    .then((recipes) => {
        // console.log("recipes", recipes);
        return res.json({ recipes: recipes });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
});

router.post('/:id/comment', (req, res) => {
    // let { id, email, username, fullName, birthdate, location, recipesByUser, commentsByUser, following, favorites, avatar } = req.user;
    
    Recipe.findById(req.params.id)
    .then((recipe) =>{
        console.log('recipe', recipe)
        User.findById(req.body.id)
        .then((user) => {
            Comment.create({
                title: req.body.title,
                body: req.body.body,
                createdBy: user
            })
            .then(comment =>{
                console.log('comment', comment)
                user.commentsByUser.push(comment)
                user.save()
                recipe.comments.push(comment)
                recipe.save()
                .then(result => {
                    return res.json({ message: `${user.username} has commented ${comment.title} to ${recipe.name}`, result:result})
                })
                .catch((error) => {
                    console.log('error inside Post /recipes/:id/comment', error);
                    return res.json({ message: `Unable to comment , please try again.` });
                });
            })
            .catch((error) => {
                console.log('error inside Post /recipes/:id/comment', error);
                return res.json({ message: `Unable to find created comment , please try again.` });
            });
        })
        .catch((error) => {
            console.log('error inside Post /recipes/:id/comment', error);
            return res.json({ message: `Unable to find user , please try again.` });
        });
    })
    .catch((error) => {
        console.log('error inside Post /recipes/:id/comment', error);
        return res.json({ message: `Unable to find recipe , please try again.` });
    });
})

router.get('/:id', (req, res) => {
    Recipe.findById(req.params.id)
    .populate('ingredients createdBy')
    .then((recipe) => {
        // console.log('recipe found');
        return res.json({ recipe: recipe});
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
});

router.post('/search', (req, res) => {
    let ingredientIds = req.body.selectedParams.map(ingredient => {
        return ingredient._id;
    });

    Recipe.find({ 'ingredients': { '$all': ingredientIds } })
    .populate('ingredients createdBy')
    .then(recipes => {
        return res.json({ recipes });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
});

router.post('/new', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('data from request(recipe)', req.body);
    let { id, name, email } = req.user; 
    Recipe.create({
        name: req.body.name,
        ingredients: req.body.ingredients,
        measures: req.body.measures,
        instructions: req.body.instructions,
        alcoholic: Boolean(req.body.alcoholic),
        image: req.body.image,
        // comments: req.body.comments,
        createdBy: req.user.id,
        glassType: req.body.glassType,
        category: req.body.category
    })
    .then((newRecipe) => {
        console.log('new recipe created =>', newRecipe);
        return res.json({ recipe: newRecipe });
    })
    .catch((error) => {
        console.log('error', error);
        return res.json({ message: 'error occured, please try again.' });
    });
});

router.put('/:id', (req, res) => {
    const updateQuery = {};
    // check name
    if (req.body.name) {
        updateQuery.name = req.body.name;
    }
    // check ingredients
    if (req.body.ingredients) {
        updateQuery.ingredients = req.body.ingredients;
    }
    // check measures
    if (req.body.measures) {
        updateQuery.measures = req.body.measures;
    }
    // check instructions
    if (req.body.instructions) {
        updateQuery.instructions = req.body.instructions;
    }
    // check alcoholic
    if (req.body.alcoholic) {
        updateQuery.alcoholic = req.body.alcoholic;
    }
    // check image
    if (req.body.image) {
        updateQuery.image = req.body.image;
    }
    // check createdBy
    if (req.body.createdBy) {
        updateQuery.createdBy = req.body.createdBy;
    }
    // check glassType
    if (req.body.glassType) {
        updateQuery.glassType = req.body.glassType;
    }
    // check category
    if (req.body.category) {
        updateQuery.category = req.body.category;
    }
    // check comments
    if (req.body.comments) {
        updateQuery.comments = req.body.comments;
    }


    Recipe.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
    .then((recipe) => {
        return res.json({ message: `${recipe.name} was updated`, recipe: recipe });
    })
    .catch((error) => {
        console.log('error inside PUT /recipes/:id', error);
        return res.json({ message: 'error occured, please try again.' });
    });
});

router.delete('/:id', (req, res) => {
    Recipe.findByIdAndDelete(req.params.id)
    .then((recipe) => {
        return res.json({ message: `${recipe.name} was deleted`, recipe: recipe });
    })
    .catch((error) => {
        console.log('error inside DELETE /users/:id', error);
        return res.json({ message: 'error occured, please try again.' });
    });
});

module.exports = router;
