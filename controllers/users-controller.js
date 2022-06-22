const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password'); //password excluded
    } catch (e) {
        return next(new HttpError('Something went wrong, please try again', 500));
    }

    if (!users || users.length === 0) {
        return next(new HttpError('We feel sad to say that there are no users yet :(', 404));
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

    const { name, email, password, places } = req.body;

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

    let hashedPassword;

    try {

        // 12 is number of solting rounds
        hashedPassword = await bcrypt.hash(password, 12);
    }
    catch (e) {
        const error = new HttpError('Signup failed, please try again', 500);
        return next(error);
    }

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.path,
        places,
    });

    try {
        await newUser.save();
    } catch (e) {
        return next(new HttpError('Signing Up failed, please try again', 500));
    }

    //first argument is payload of token (the info that you want to encode)
    //it can be either string ,  object or buffer
    //second argument is private key that only server knows
    //last argument is optional 

    let token;
    try {
        token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email
            },
            process.env.JWT_KEY,
            {
                expiresIn: '1h'
            }
        );
    }
    catch (e) {
        return next(new HttpError('Signing Up failed, please try again', 500));
    }

    res.status(201).json(
        {
            userId: newUser.id,
            email: newUser.email,
            token: token,
        }
    );
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

    if (!user) {
        //401 means authentication failed
        return next(new HttpError('Could not find user with this email and password', 401));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, user.password);
    } catch (e) {
        const error = new HttpError('Login failed, please try again', 500);
        return next(error);
    }

    if (!isValidPassword) {
        return next(new HttpError('Could not find user with this email and password', 401));
    }

    //please use same private here
    let token;
    try {
        token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_KEY,
            {
                expiresIn: '1h'
            }
        );
    }
    catch (e) {
        return next(new HttpError('Login failed, please try again', 500));
    }

    res.status(201).json(
        {
            userId: user.id,
            email: user.email,
            token: token,
        }
    );
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
