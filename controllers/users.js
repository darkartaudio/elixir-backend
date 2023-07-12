// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = process.env;
const moment = require('moment')
const { parseValue } = require('../utils')

// import the User model
const { User } = require('../models');

// GET make a users route to get all users
router.get('/', (req, res) => {
    User.find({})
        .then((users) => {
            console.log('users', users);
            return res.json({ users: users });
        })
        .catch((error) => {
            console.log('error', error);
            return res.json({ message: 'There was an issue, please try again...' });
        });
});

// private
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('====> inside /profile');
    console.log(req.body);
    console.log('====> user')
    console.log(req.user);
    const { id, email, username, fullName, birthdate, location, recipesByUser, commentsByUser, following, favorites, avatar } = req.user; // object with user object inside
    return res.json({ id, email, username, fullName, birthdate, location, recipesByUser, commentsByUser, following, favorites, avatar });
});

router.get('/:field/:value', (req, res) => {
    let field = req.params.field;
    let value = req.params.value;
    console.log('field', 'value', field, value);
    
    User.find({ [field]:[value] })
    .then((user) => {
        console.log("user", user);
        return res.json({ user: user });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
});

router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.params.id)
    .then((user) => {
        console.log('user found');
        return res.json({ user: user });
    })
    .catch(error => {
        console.log('error', error);
        return res.json({ message: 'There was an issue please try again...' });
    });
})

router.post('/signup', (req, res) => {
    // POST - adding the new user to the database
    console.log('===> Inside of /signup');
    console.log('===> /register -> req.body',req.body);

    User.findOne({ email: req.body.email })
    .then(user => {
        // if email already exists, a user will come back
        if (user) {
            // send a 400 response
            return res.status(400).json({ message: 'Email already exists' });
        } else {
            // Create a new user
            const newUser = new User({
                fullName: req.body.fullName,
                username: req.body.username,
                email: req.body.email,
                location: req.body.location,
                birthdate: req.body.birthdate,
                password: req.body.password,
                avatar: req.body.avatar
            });

            // Salt and hash the password - before saving the user
            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw Error;

                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) console.log('==> Error inside of hash', err);
                    // Change the password in newUser to the hash
                    newUser.password = hash;
                    newUser.save()
                    .then(createdUser => {
                        // remove password from being returned inside of response, still in DB
                        if (createdUser.password) {
                            createdUser.password = '...' // hide the password
                            res.json({ user: createdUser });
                        }
                    })
                    .catch(err => {
                        console.log('error with creating new user', err);
                        res.json({ message: 'Error occured... Please try again.'});
                    });
                });
            });
        }
    })
    .catch(err => { 
        console.log('Error finding user', err);
        res.json({ message: 'Error occured... Please try again.'})
    })
});

router.post('/login', async (req, res) => {
    // POST - finding a user and returning the user
    console.log('===> Inside of /login');
    console.log('===> /login -> req.body', req.body);

    const foundUser = await User.findOne({ email: req.body.email });

    if (foundUser) {
        // user is in the DB
        let isMatch = await bcrypt.compareSync(req.body.password, foundUser.password);
        console.log('Does the passwords match?', isMatch);
        if (isMatch) {
            // if user match, then we want to send a JSON Web Token
            // Create a token payload
            // add an expiredToken = Date.now()
            // save the user
            const payload = {
                id: foundUser.id,
                email: foundUser.email,
                username: foundUser.username,
                fullName: foundUser.fullName,
                location: foundUser.location,
                birthdate: foundUser.birthdate,
                recipesByUser: foundUser.recipesByUser,
                commentsByUser: foundUser.commentsByUser,
                following: foundUser.following,
                favorites: foundUser.favorites,
                avatar: foundUser.avatar
            }

            jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) {
                    res.status(400).json({ message: 'Session has endedd, please log in again'});
                }
                const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 });
                console.log('===> legit', legit);
                delete legit.password; // remove before showing response
                res.json({ success: true, token: `Bearer ${token}`, userData: legit });
            });

        } else {
            return res.status(400).json({ message: 'Email or Password is incorrect' });
        }
    } else {
        return res.status(400).json({ message: 'User not found' });
    }
});

router.put('/:id', (req, res) => {
    const updateQuery = {};
    // check fullName
    if (req.body.fullName) {
        updateQuery.fullName = req.body.fullName;
    }
    // check username
    if (req.body.username) {
        updateQuery.username = req.body.username;
    }
    // check email
    if (req.body.email) {
        updateQuery.email = req.body.email;
    }
    // check recipesByUser
    if (req.body.recipesByUser) {
        updateQuery.recipesByUser = req.body.recipesByUser;
    }
    // check birthdate
    if (req.body.birthdate) {
        updateQuery.birthdate = req.body.birthdate;
    }
    // check location
    if (req.body.location) {
        updateQuery.location = req.body.location;
    }
    // check avatar
    if (req.body.avatar) {
        updateQuery.avatar = req.body.avatar;
    }
    // check commentsByUser
    if (req.body.commentsByUser) {
        updateQuery.commentsByUser = req.body.commentsByUser;
    }
    // check following
    if (req.body.following) {
        updateQuery.following = req.body.following;
    }
    // check favorites
    if (req.body.favorites) {
        updateQuery.favorites = req.body.favorites;
    }
    User.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
    .then((user) => {
        return res.json({ message: `${user.email} was updated`, user: user });
    })
    .catch((error) => {
        console.log('error inside PUT /users/:id', error);
        return res.json({ message: 'error occured, please try again.' });
    });
});


// DELETE route for /users/:id
router.delete('/:id', (req, res) => {
    
    User.findByIdAndDelete(req.params.id)
    .then((result) => {
        return res.json({ message: `User ${req.params.id} was deleted.`});
    })
    .catch((error) => {
        console.log('error inside DELETE /users/:id', error);
        return res.json({ message: 'An error occured, please try again.' });
    });
});

module.exports = router;