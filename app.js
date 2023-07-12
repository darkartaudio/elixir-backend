require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('./config/passport')(passport);

// create app
const app = express();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.get('/', (req, res) => {
    axios.get(`http://www.thecocktaildb.com/api/json/v2/${process.env.API_KEY}//search.php?i=Gin`)
    // axios.get(`http://www.thecocktaildb.com/api/json/v2/${process.env.API_KEY}/search.php?f=a`) // USE THIS to seed all drinks
    .then(function(response) {
        console.log("Api data here", response.data)
        res.json(response.data)
    })
    .catch(error => {
        console.log(error.message)
    })
    // return res.json({ message: 'Welcome to our Elixir API' });
});

app.use('/users', require('./controllers/users'));
app.use('/ingredients', require('./controllers/ingredients'));
app.use('/recipes', require('./controllers/recipes'));
app.use('/comments', require('./controllers/comments'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server connected to PORT: ${PORT}`);
});

module.exports = app;