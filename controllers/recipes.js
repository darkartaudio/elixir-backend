const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = process.env;
const { Recipe, Ingredient, User, Comment } = require('../models');
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
    // console.log(req.user.id);
    Recipe.find({ createdBy: req.user.id})
    .populate('ingredients createdBy')
    .then((recipes) => {
        // console.log('recipes', recipes);
        return res.json({ recipes: recipes });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...'});
    });
});

router.get('/favorite', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let user = await User.findById(req.user.id).populate('favorites');
    let favoriteIds = user.favorites.map(favorite => {
        return favorite._id;
    })
    Recipe.find({ _id : { '$in': favoriteIds } })
    .populate('ingredients createdBy')
    .then((recipes) => {
        // console.log('recipes', recipes);
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

router.post('/:id/comment', passport.authenticate('jwt', { session: false }), (req, res) => {    
    Recipe.findById(req.params.id)
    .then((recipe) =>{
        User.findById(req.user.id)
        .then((user) => {
            Comment.create({
                body: req.body.body,
                createdBy: user
            })
            .then(comment =>{
                Comment.findById(comment._id)
                .populate('createdBy')
                .then(populatedComment => {
                    user.commentsByUser.push(populatedComment);
                    user.save()
                    .then(savedUser => {
                        recipe.comments.push(populatedComment);
                        recipe.save()
                        .then(savedRecipe => {
                            return res.json({ message: `${savedUser.username} has commented ${populatedComment.body} to ${savedRecipe.name}`, recipe: savedRecipe, comment: populatedComment })
                        })
                        .catch((error) => {
                            console.log('error inside Post /recipes/:id/comment', error);
                            return res.json({ message: `Unable to comment , please try again.` });
                        });
                    });
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

router.post('/new', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let measures, ingredients, user;
    
    if (!req.user.id) {
        return res.json({ message: 'Please log in to create a recipe.' });
    }
    
    if (req.body.measures) {
        measures = req.body.measures.filter(measure => {
            return measure !== '';
        });
    }

    if (req.body.ingredients) ingredients = await Ingredient.find({ _id: { $in: req.body.ingredients } });
    
    user = await User.findById(req.user.id);
    
    let newRecipe = await Recipe.create({
        name: req.body.name,
        instructions: req.body.instructions,
        alcoholic: Boolean(req.body.alcoholic),
        image: req.body.image,
        glassType: req.body.glassType,
        category: req.body.category,
        measures,
        ingredients,
        createdBy: user
    });

    user.recipesByUser.push(newRecipe);
    let savedUser = await user.save();

    return res.json({ recipe: newRecipe });
});

router.post('/:id/favorite', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        let recipe = await Recipe.findById(req.params.id);

        if (user.favorites.includes(recipe._id)) {
            return res.json({ message: 'You have already favorited this recipe.' });
        }
        
        user.favorites.push(recipe);
        let savedUser = await user.save();
        recipe.favoriteCount++;
        let savedRecipe = await recipe.save();

        return res.json({ message: `${savedUser.username} has favorited ${savedRecipe.name}`, user: savedUser, recipe: savedRecipe });
    } catch (error) {
        console.log('error inside Post /recipes/:id/favorite', error);
        return res.json({ message: `Unable to favorite , please try again.` });
    }   
});

router.post('/:id/unfavorite', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        let recipe = await Recipe.findById(req.params.id);

        if (!user.favorites.includes(recipe._id)) {
            return res.json({ message: 'You have not favorited this recipe.' });
        }
        
        user.favorites = user.favorites.filter(favorite => favorite.toString() !== req.params.id);
        let savedUser = await user.save();
        recipe.favoriteCount--;
        let savedRecipe = await recipe.save();

        return res.json({ message: `${savedUser.username} has unfavorited ${savedRecipe.name}`, user: savedUser, recipe: savedRecipe });
    } catch (error) {
        console.log('error inside Post /recipes/:id/favorite', error);
        return res.json({ message: `Unable to unfavorite , please try again.` });
    }   
});

router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let measures, ingredients;

    if(!req.user.id || req.user.id !== req.body.createdBy) {
        return res.json({ message: `Only the recipe's creator may edit it.` });
    }
    
    if (req.body.measures) {
        measures = req.body.measures.filter(measure => {
            return measure !== '';
        });
    }

    if (req.body.ingredients) ingredients = await Ingredient.find({ _id: { $in: req.body.ingredients } });
    
    const updateQuery = {};
    // check name
    if (req.body.name) {
        updateQuery.name = req.body.name;
    }
    // check ingredients
    if (req.body.ingredients) {
        updateQuery.ingredients = ingredients;
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
        updateQuery.alcoholic = Boolean(req.body.alcoholic);
    }
    // check image
    updateQuery.image = req.body.image;

    // check glassType
    if (req.body.glassType) {
        updateQuery.glassType = req.body.glassType;
    }
    // check category
    if (req.body.category) {
        updateQuery.category = req.body.category;
    }

    Recipe.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
    .then((recipe) => {
        // console.log('updated recipe', recipe);
        return res.json({ message: `${recipe.name} was updated`, recipe: recipe });
    })
    .catch((error) => {
        console.log('error inside PUT /recipes/:id', error);
        return res.json({ message: 'error occured, please try again.' });
    });
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let recipeToDelete = await Recipe.findById(req.params.id);

    if(!req.user.id || req.user.id !== recipeToDelete.createdBy[0]._id.toString()) {
        return res.json({ message: `Only the recipe's creator may delete it.` });
    }

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
