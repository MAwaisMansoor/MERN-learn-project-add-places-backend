const HttpError = require('../models/http-error');

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    //browser sends options request before any request except GET
    //so we just pass this here
    if (req.method === 'OPTIONS') {
        return next();
    }

    //headers automatically provide by react
    //if there is no token in headers, it will return null
    //Authorization: 'Bearer token'
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'

        if (!token) {
            throw new Error('Authentication failed!');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY);

        req.userData = { userId: decodedToken.userId };

        next();

    } catch (err) {
        const error = new HttpError('Authentication failed!', 401);

        return next(error);
    }

}