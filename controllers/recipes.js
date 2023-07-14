const express = require('express');
const router = express.Router();
const { Recipe } = require('../models');
const { parseValue } = require('../utils');

router.get('/', (req, res) => {
    Recipe.find({}).populate('ingredients')
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
    .populate('ingredients')
    .then((recipes) => {
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
    .then(recipes => {
        return res.json({ recipes });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
});

router.post('/new', (req, res) => {
    console.log('data from request(recipe)', req.body);
    Recipe.create({
        name: req.body.name,
        ingredients: req.body.ingredients,
        measures: req.body.measures,
        instructions: req.body.instructions,
        alcoholic: Boolean(req.body.alcoholic),
        image: req.body.image,
        // comments: req.body.comments,
        createdBy: req.body.createdBy,
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
