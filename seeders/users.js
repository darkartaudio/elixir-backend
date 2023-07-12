require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { createRandomUser } = require('../utils');

// User.deleteMany({})
// .then(result => console.log(result));

for (let i = 0; i < 49; i++) {
    const newUser = new User(createRandomUser());

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
                    console.log(createdUser);
                }
            })
            .catch(err => console.log(err.message));
        });
    });
}