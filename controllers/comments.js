const express = require('express')
const router = express.Router();
const passport = require('passport');
const { Comment, User, Recipe } = require('../models')

router.get('/', (req, res) => {
    Comment.find({})
    .then((comments) => {
        return res.json({ comments: comments });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...'});
    })
})

router.get('/:field/:value', (req, res) => {
    let field = req.params.field;
    let value = req.params.value;
    
    Comment.find({ [field]:[value] })
    .then((comments) => {
        return res.json({ comments: comments });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
})

router.get('/:id', (req, res) => {
    Comment.findById(req.params.id)
    .then((comment) => {
        return res.json({ comment: comment });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
})

router.post('/search', (req, res) => {
    Comment.find({ _id: { $in: req.body.commentIds } })
    .populate('createdBy')
    .then(comments => {
        return res.json({ comments });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
})

router.post('/new', (req, res) => {
    Comment.create({
        title: req.body.title,
        body: req.body.body,
        createdBy: req.body.createdBy
    })
    .then((newComment) => {
        return res.json({ comment: newComment });
    })
    .catch((error) => {
        console.log('error', error);
        res.json({ message: 'There was an issue please try again...' });
    });
})

router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let comment = await Comment.findById(req.params.id).populate('createdBy');
    if(!req.user.id || req.user.id !== comment.createdBy[0]._id.toString()) {
        return res.json({ message: `Only the comment's creator may edit it.` });
    }

    const updateQuery = {};
    if (req.body.body) {
        updateQuery.body = req.body.body;
    }

    Comment.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
        .then((comment) => {
            return res.json({ message: `${comment._id} was updated`, comment: comment });
        })
        .catch((error) => {
            console.log('error inside PUT /ingredients/:id', error);
            return res.json({ message: 'There was an issue please try again...'});
        });
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let comment = await Comment.findById(req.params.id).populate('createdBy');
        if(!req.user.id || req.user.id !== comment.createdBy[0]._id.toString()) {
            return res.json({ message: `Only the comment's creator may delete it.` });
        }

        let user = await User.findById(req.user.id);
        let userComments = user.commentsByUser;
        let newUserComments = userComments.filter(comment => {
            return comment._id.toString() !== req.params.id;
        });
        user.commentsByUser = newUserComments;

        await user.save();

        let recipe = await Recipe.findOne({ comments: req.params.id });
        let recipeComments = recipe.comments;
        let newRecipeComments = recipeComments.filter(comment => {
            return comment._id.toString() !== req.params.id;
        });
        recipe.comments = newRecipeComments;

        await recipe.save();

        let deleteResponse = await Comment.findByIdAndDelete(req.params.id);

        if (deleteResponse) {
            return res.json({ message: `Deleted comment ${req.params.id}` });
        }
    } catch (error) {
        console.log('error inside DELETE /comments/:id', error);
        return res.json({ message: 'There was an issue please try again...'});
    }
});

module.exports = router;