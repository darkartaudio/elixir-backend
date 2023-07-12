// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = process.env;

// import the User model
const { User } = require('../models');

// GET make a users route to get all users
router.get('/', (req, res) => {
    User.find({})
        .then((users) => {
            console.log('users', users);
            res.header("Access-Control-Allow-Origin", "*");
            res.json({ users: users });
        })
        .catch((error) => {
            console.log('error', error);
            res.header("Access-Control-Allow-Origin", "*");
            res.json({ message: 'There was an issue, please try again...' });
        });
});

// private
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('====> inside /profile');
    console.log(req.body);
    console.log('====> user')
    console.log(req.user);
    const { id, firstName, lastName, email, address, jobTitle, birthdate, number } = req.user; // object with user object inside
    res.json({ id, firstName, lastName, email, address, jobTitle, birthdate, number });
});

// other routes below
// GET make a route that queries users by [email domain] [zipCode] [state]
router.get('/:field/:value', (req, res) => {
    if (req.params.field === 'zipcode' || req.params.field === 'zipCode') {
        let zipCode = parseInt(req.params.value);
        // find all users based on zipCode
        User.find({ "address.zipCode": zipCode })
            .then((users) => {
                console.log('users', users);
                res.header("Access-Control-Allow-Origin", "*");
                return res.json({ users: users });
            })
            .catch((error) => {
                console.log('error', error);
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ message: 'There was an issue, please try again...' });
            });
    } else if (req.params.field === 'email' || req.params.field === 'Email') {
        User.find({ email: req.params.value })
            .then((user) => {
                console.log('user', user);
                res.header("Access-Control-Allow-Origin", "*");
                return res.json({ user: user });
            })
            .catch((error) => {
                console.log('error', error);
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ message: 'There was an issue, please try again...' });
            });
    }
});

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
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                jobTitle: req.body.jobTitle,
                birthdate: new Date(),
                "address.streetAddress": req.body.streetAddress,
                "address.city": req.body.city,
                "address.state": req.body.state,
                "address.zipCode": req.body.zipCode,
                number: req.body.number,
                password: req.body.password
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
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                address: foundUser.address,
                birthdate: foundUser.birthdate,
                jobTitle: foundUser.jobTitle,
                number: foundUser.number
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

// POST route /users/new - create a new user
router.post('/new', (req, res) => {
    // read the req.body - data for the new user coming in at
    console.log('data from request (user)', req.body); // object
    // Find a user
    User.findOne({ email: req.body.email })
        .then((user) => {
            // check to see if user exist in database
            if (user) {
                // return a message saying user exist
                res.header("Access-Control-Allow-Origin", "*");
                res.json({ message: `${user.email} already exists. Please try again` });
            } else {
                // create a user
                User.create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    jobTitle: req.body.jobTitle,
                    birthdate: new Date(),
                    "address.streetAddress": req.body.streetAddress,
                    "address.city": req.body.city,
                    "address.state": req.body.state,
                    "address.zipCode": req.body.zipCode,
                    number: req.body.number,
                    password: req.body.password
                })
                    .then((newUser) => {
                        console.log('new user created ->', newUser);
                        res.header("Access-Control-Allow-Origin", "*");
                        return res.json({ user: newUser });
                    })
                    .catch((error) => {
                        console.log('error', error);
                        res.header("Access-Control-Allow-Origin", "*");
                        return res.json({ message: 'error occured, please try again.' });
                    });
            }
        })
        .catch((error) => {
            console.log('error', error);
            res.header("Access-Control-Allow-Origin", "*");
            return res.json({ message: 'error occured, please try again.' });
        });
});

router.put('/:id', (req, res) => {
    const updateQuery = {}
    // check firstName
    if (req.body.firstName) {
        updateQuery.firstName = req.body.firstName
    }
    // check lastName
    if (req.body.lastName) {
        updateQuery.lastName = req.body.lastName
    }
    // check email
    if (req.body.email) {
        updateQuery.email = req.body.email
    }
    // check jobTitle
    if (req.body.jobTitle) {
        updateQuery.jobTitle = req.body.jobTitle
    }
    // check bithdate
    if (req.body.bithdate) {
        updateQuery.bithdate = req.body.bithdate
    }
    // check streetAddress
    if (req.body.streetAddress) {
        updateQuery["address.streetAddress"] = req.body.streetAddress
    }
    // check city
    if (req.body.city) {
        updateQuery["address.city"] = req.body.city
    }
    // check state
    if (req.body.state) {
        updateQuery["address.state"] = req.body.state
    }
    // check zipCode
    if (req.body.zipCode) {
        updateQuery["address.zipCode"]  = req.body.zipCode
    }
    // check number
    if (req.body.number) {
        updateQuery.number = req.body.number
    }

    User.findByIdAndUpdate(req.params.id, {$set: updateQuery }, {new: true})
    .then((user) => {
        return res.json({ message: `${user.email} was updated`, user: user});
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
        return res.json({ message: `user at ${req.params.id} was delete`});
    })
    .catch((error) => {
        console.log('error inside DELETE /users/:id', error);
        return res.json({ message: 'error occured, please try again.' });
    });
});

module.exports = router;

// const express = require('express')
// const router = express.Router();
// const { User } = require('../models')
// const moment = require('moment')
// const { parseValue } = require('../utils')

// router.get('/', (req, res) => {
//     User.find({})
//     .then((users) => {
//         return res.json({ users: users });
//     })
//     .catch(error => {
//         console.log('error', error);
//         res.json({ message: 'There was an issue please try again...'})
//     })
// })

// router.get('/:field/:value', (req, res) => {
//     let field = req.params.field
//     let value = req.params.value
//     console.log('field', 'value', field, value)
//     // let query = {}
//     // query[field]=value
    
//     User.find({ [field]:[value] })
//     .then((user) => {
//         console.log("user", user)
//         return res.json({ user: user })
//     })
//     .catch(error => {
//         console.log('error', error);
//         res.json({ message: 'There was an issue please try again...' });
//     });
// })

// router.get('/:id', (req, res) => {
//     User.findById(req.params.id)
//     .then((user) => {
//         console.log('user found')
//         return res.json({ user: user})
//     })
//     .catch(error => {
//         console.log('error', error);
//         res.json({ message: 'There was an issue please try again...' });
//     });
// })

// router.get('/:email', (req, res) => {
//         User.find({ email: req.params.value })
//             .then((users) => {
//                 console.log('user', user);
//                 res.json({ user: user });
//             })
//             .catch(error => {
//                 console.log('error', error);
//                 res.json({ message: 'There was an issue please try again...' });
//             });
    
// });

// router.post('/new', (req, res) => {
//     console.log('data from request(user)', req.body);
//     User.findOne({ email: req.body.email })
//     .then((user) => {
//         if (user) {
//             res.json({ message: `${user.email} already exists. Please try again`})
//         } else {
//             User.create({
//                 email: req.body.email,
//                 username: req.body.username,
//                 fullName: req.body.fullName,
//                 // birthdate: new Date(),
//                 birthdate: moment(req.body.birthdate).format('YYYY-MM-DD'),
//                 location: req.body.location,
//                 recipesByUser: req.body.recipesByUser,
//                 commentsByUser: req.body.commentsByUser,
//                 following: req.body.following,
//                 favorites: req.body.favorites,
//                 avatar: req.body.avatar
//             })
//             .then((newUser) => {
//                 console.log('new user created =>', newUser);
//                 return res.json({ user: newUser });
//             })
//             .catch((error) => {
//                 console.log('error', error);
//                 return res.json({ message: 'error occured, please try again.' });
//             });
//         }
//     })
//     .catch((error) => {
//         console.log('error', error);
//         return res.json({ message: 'error occured, please try again.' });
//     });
// })

// router.put('/:id', (req, res) => {
//     const updateQuery = {};
//     // check fullName
//     if (req.body.fullName) {
//         updateQuery.fullName = req.body.fullName;
//     }
//     // check username
//     if (req.body.username) {
//         updateQuery.username = req.body.username;
//     }
//     // check email
//     if (req.body.email) {
//         updateQuery.email = req.body.email;
//     }
//     // check recipesByUser
//     if (req.body.recipesByUser) {
//         updateQuery.recipesByUser = req.body.recipesByUser;
//     }
//     // check birthdate
//     if (req.body.birthdate) {
//         updateQuery.birthdate = req.body.birthdate;
//     }
//     // check location
//     if (req.body.location) {
//         updateQuery.location = req.body.location;
//     }
//     // check avatar
//     if (req.body.avatar) {
//         updateQuery.avatar = req.body.avatar;
//     }
//     // check commentsByUser
//     if (req.body.commentsByUser) {
//         updateQuery.commentsByUser = req.body.commentsByUser;
//     }
//     // check following
//     if (req.body.following) {
//         updateQuery.following = req.body.following;
//     }
//     // check favorites
//     if (req.body.favorites) {
//         updateQuery.favorites = req.body.favorites;
//     }


//     User.findByIdAndUpdate(req.params.id, { $set: updateQuery }, { new: true })
//         .then((user) => {
//             return res.json({ message: `${user.email} was updated`, user: user });
//         })
//         .catch((error) => {
//             console.log('error inside PUT /users/:id', error);
//             return res.json({ message: 'error occured, please try again.' });
//         });
// });

// router.delete('/:id', (req, res) => {
//     User.findByIdAndDelete(req.params.id)
//         .then((user) => {
//             return res.json({ message: `${user.email} was deleted`, user: user });
//         })
//         .catch((error) => {
//             console.log('error inside DELETE /users/:id', error);
//             return res.json({ message: 'error occured, please try again.' });
//         });
// });

// module.exports = router