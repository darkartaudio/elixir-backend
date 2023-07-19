const express = require('express');
const router = express.Router();
const { Ingredient } = require('../models');

router.get('/', (req, res) => {
    Ingredient.find({}, '_id name')
    .then((ingredients) => {
        return res.json({ ingredients: ingredients });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...'})
    })
});

router.get('/:field/:value', (req, res) => {
    let field = req.params.field;
    let value = req.params.value;
    
    Ingredient.find({ [field]:[value] })
    .then((ingredients) => {
        return res.json({ ingredients: ingredients });
    })
    .catch(error => {
        console.log('error', error);
        res.json({ message: 'There was an issue please try again...' });
    });
});

router.get('/:id', (req, res) => {
    Ingredient.findById(req.params.id)
    .then((ingredient) => {
        return res.json({ ingredient: ingredient});
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
});

router.post('/new', (req, res) => {
    console.log('data from request(ingredient)', req.body);
    Ingredient.create({
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        alcoholic: Boolean(req.body.alcoholic),
    })
    .then((newIngredient) => {
        return res.json({ ingredient: newIngredient });
    })
    .catch((error) => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
})

router.put('/:id', (req, res) => {
    const updateQuery = {};
    // check name
    if (req.body.name) {
        updateQuery.name = req.body.name;
    }
    // check description
    if (req.body.description) {
        updateQuery.description = req.body.description;
    }
    // check type
    if (req.body.type) {
        updateQuery.type = req.body.type;
    }
    // check alcoholic
    if (req.body.alcoholic) {
        updateQuery.alcoholic = req.body.alcoholic;
    }

    Ingredient.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
    .then((ingredient) => {
        return res.json({ message: `${ingredient.name} was updated`, ingredient: ingredient });
    })
    .catch((error) => {
        console.log('error inside PUT /ingredients/:id', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
});

router.delete('/:id', (req, res) => {
    Ingredient.findByIdAndDelete(req.params.id)
        .then((ingredient) => {
            return res.json({ message: `${ingredient.name} was deleted`, ingredient: ingredient });
        })
        .catch((error) => {
            console.log('error inside DELETE /ingredients/:id', error);
            return res.json({ message: 'error occured, please try again.' });
        });
});

module.exports = router;