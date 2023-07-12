const axios = require('axios');
require('dotenv').config();
const { firstLettersCapitalized } = require('./utils');

// axios.get(`${process.env.API}/search.php?s=151`)
// .then(result => console.log(result.data));

console.log(firstLettersCapitalized('malt liquor'));