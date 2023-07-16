const express = require('express')
const router = express.Router();
const { Comment } = require('../models')
const { parseValue } = require('../utils');

router.get('/', (req, res) => {
    Comment.find({})
    .then((comments) => {
        return res.json({ comments: comments });
    })
    .catch(error => {
        console.log('error', error);
        res.json({ message: 'There was an issue please try again...'})
    })
})

router.get('/:field/:value', (req, res) => {
    let field = req.params.field
    let value = req.params.value
    console.log('field', 'value', field, value)
    // let query = {}
    // query[field]=value
    
    Comment.find({ [field]:[value] })
    .then((comments) => {
        console.log("comments", comments)
        return res.json({ comments: comments })
    })
    .catch(error => {
        console.log('error', error);
        res.json({ message: 'There was an issue please try again...' });
    });
})

router.get('/:id', (req, res) => {
    Comment.findById(req.params.id)
    .then((comment) => {
        console.log('comment found')
        return res.json({ comment: comment})
    })
    .catch(error => {
        console.log('error', error);
        res.json({ message: 'There was an issue please try again...' });
    });
})

router.post('/search', (req, res) => {
    Comment.find({ _id: { $in: req.body.commentIds } })
    .populate('createdBy')
    .then(comments => {
        console.log(comments);
        return res.json({ comments });
    })
    .catch(error => {
        console.log('error', error);
        res.json({ message: 'There was an issue please try again...' });
    });
})

router.post('/new', (req, res) => {
    console.log('data from request(comment)', req.body);
    Comment.create({
        title: req.body.title,
        body: req.body.body,
        createdBy: req.body.createdBy,
    })
    .then((newComment) => {
        console.log('new comment created =>', newComment);
        return res.json({ comment: newComment });
    })
    .catch((error) => {
        console.log('error', error);
        return res.json({ message: 'error occured, please try again.' });
    });
})

router.put('/:id', (req, res) => {
    const updateQuery = {};
    // check title
    if (req.body.title) {
        updateQuery.title = req.body.title;
    }
    // check body
    if (req.body.body) {
        updateQuery.body = req.body.body;
    }
    // check createdBy
    if (req.body.createdBy) {
        updateQuery.createdBy = req.body.createdBy;
    }

    Comment.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
        .then((comment) => {
            return res.json({ message: `${comment._id} was updated`, comment: comment });
        })
        .catch((error) => {
            console.log('error inside PUT /ingredients/:id', error);
            return res.json({ message: 'error occured, please try again.' });
        });
});

router.delete('/:id', (req, res) => {
    Comment.findByIdAndDelete(req.params.id)
        .then((comment) => {
            return res.json({ message: `${comment._id} was deleted`, comment: comment });
        })
        .catch((error) => {
            console.log('error inside DELETE /comments/:id', error);
            return res.json({ message: 'error occured, please try again.' });
        });
});

module.exports = router