const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const HttpError = require('../models/http-error');


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password'); //password excluded
    } catch (e) {
        return next(new HttpError('Something went wrong, please try again', 500));
    }

    if(!users || users.length === 0) {
        return next(new HttpError('Users not found', 404));
    }

    res.json({
        users: users.map(user => user.toObject({ getters: true })),
    });
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check you data.', 422));
    }

    const { name, email, password, places} = req.body;

    let hasUser;
    try {
        hasUser = await User.findOne({ email: email });
    } catch (e) {
        const error = new HttpError('Signup failed, please try again', 500);
        return next(error);
    }

    if (hasUser) {
        const error = new HttpError('User already exists, please login instead.', 422);
        return next(error);
    }

    const newUser = new User({
        name,
        email,
        password,
        image: 'https://www.pexels.com/photo/woman-in-black-and-white-floral-long-sleeve-shirt-12467948/',
        places,
    });

    try {
        await newUser.save();
    } catch (e) {
        return next(new HttpError('Signing Up failed, please try again', 500));
    }

    res.status(201).json({ user: newUser.toObject({ getters: true }) });
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let user;
    try {
        user = await User.findOne({ email: email });
    } catch (e) {
        const error = new HttpError('Login failed, please try again', 500);
        return next(error);
    }

    if (!user || user.password !== password) {
        //401 means authentication failed
        return next(new HttpError('Could not find user with this email and password', 401));
    }

    res.status(200).json({ message: 'Logged in successfully' });
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
