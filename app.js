const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes); // => /api/places
app.use('/api/users', usersRoutes); // => /api/users

app.use((req, res, next) => {
    throw new HttpError('Could not find this route', 404);
}); // only runs when nothing runs

//express error handling
//only comes atthis if error occurs
app.use((error, req, res, next) => {
    //if somehow responce is sent
    if (res.headerSent) {
        return next(error);
    }

    //allowing developer to handle error
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
    .connect('mongodb+srv://awais_1:donlyawais@cluster0.bkx35.mongodb.net/mern-learn?retryWrites=true&w=majority')
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });

