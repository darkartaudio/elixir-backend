const { faker } = require('@faker-js/faker')

function parseValue(value) {
    let valueArray = value.toLowerCase().split("+");
    let parsedArray = valueArray.map((word) => {
        let wordArray = word.split("");
        wordArray[0] = " " + wordArray[0].toUpperCase();
        return wordArray.join("");
    });
    let parsedValue = parsedArray.join("").trim();
    return parsedValue;
}

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
        name: faker.commerce.productName(),
        instructions: faker.lorem.paragraph(),
        alcoholic: true,
        image: faker.image.urlLoremFlickr({ category: 'food' }),
        glassType: faker.lorem.words(2),
        category: faker.lorem.word()
    };
}

function createRandomIngredient() {
    return {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        type: faker.lorem.words(2),
        alcoholic: true
    }
}

module.exports = {
    parseValue,
    wait,
    firstLettersCapitalized,
    createRandomUser,
    createRandomRecipe,
    createRandomIngredient
}

