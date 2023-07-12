const { User } = require('../models');
const { randIntInterval } = require('../utils');

async function seedRandomFollows() {
    let allUsers = await User.find({});

    for (let i = 0; i < allUsers.length; i++) {
        let thisUser = allUsers[i];

        let numFollows = randIntInterval(1, 5);
        for (let j = 0; j < numFollows; j++) {
            let randomUser = allUsers[randIntInterval(0, allUsers.length - 1)];
            if (!(thisUser._id === randomUser._id)) {
                thisUser.following.push(randomUser);
            }
        }

        let savedUser = await thisUser.save();
        console.log(savedUser.following);
    }
}

seedRandomFollows();