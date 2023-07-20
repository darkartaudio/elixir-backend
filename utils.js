const { faker } = require('@faker-js/faker')

function firstLettersCapitalized(string) {
    const words = string.split(" ");

    const capitalizedAfterSpaces = words.map((word) => { 
        return word[0].toUpperCase() + word.substring(1); 
    }).join(" ");

    const splitAtHyphens = capitalizedAfterSpaces.split("-");

    return splitAtHyphens.map((word) => {
        return word[0].toUpperCase() + word.substring(1);
    }).join("-");
}

function randIntInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

function createRandomUser() {
    return {
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        username: faker.internet.displayName(),
        birthdate: faker.date.birthdate({ min: 21, max: 99, mode: 'age' }),
        location: faker.location.city(),
        avatar: faker.image.avatar()
    };
}

function createRandomRecipe() {
    return {
        name: firstLettersCapitalized(faker.commerce.productName()),
        instructions: faker.lorem.paragraph(),
        alcoholic: true,
        image: faker.image.urlLoremFlickr({ category: 'food' }),
        glassType: firstLettersCapitalized(faker.lorem.words(2)),
        category: firstLettersCapitalized(faker.lorem.word())
    };
}

function createRandomIngredient() {
    return {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        type: faker.lorem.words(2),
        alcoholic: true
    };
}

function createRandomComment() {
    return {
        title: firstLettersCapitalized(faker.lorem.words(2)),
        body: faker.lorem.paragraph()
    };
}

module.exports = {
    wait,
    firstLettersCapitalized,
    randIntInterval,
    createRandomUser,
    createRandomRecipe,
    createRandomIngredient,
    createRandomComment
};