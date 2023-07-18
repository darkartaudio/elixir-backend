const axios = require('axios');
require('dotenv').config();

axios.get(`${process.env.API}/search.php?s=151`)
.then(result => console.log(result.data));