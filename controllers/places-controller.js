const fs = require('fs');

const { v4: uuid } = require('uuid');

const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

const getCoordsForAddress = require('../util/location');

const Place = require('../models/place');

const User = require('../models/user');
const mongoose = require('mongoose');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    //mongodb's findbyid method dosenot returns promise 
    //but mongoose make it return promise
    //its a static function
    let place
    try {
        place = await Place.findById(placeId);
    } catch (e) {
        const error = new HttpError('Something went wrong, please try again', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for the provided id', 404);
        return next(error);
    }

    res.json({
        place: place.toObject({ getters: true }) //converting into js object
    });
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    //let places
    let userWithPlaces;
    try {
        // places = await Place.find({ creator: userId });   
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (e) {
        return next(new HttpError('Something went wrong, please try again', 500));
    }
    //if (!places || places.length === 0) 
    if (!userWithPlaces || userWithPlaces.places.length === 0){
        return next(new HttpError('Places not found for this user provided!', 404));
    }

    res.json({
        places: userWithPlaces.places.map(place => place.toObject({ getters: true }))
    });
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { title, description, address } = req.body;

    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);
    } catch (e) {
        return next(e);
    }

    const createdPlace = new Place({
        title, 
        description,
        image: req.file.path,
        address,
        location: coordinates,
        creator: req.userData.userId
    });

    let user;

    try {
        user = await User.findById(req.userData.userId);
    } catch (e) {
        return next(new HttpError('Creating place failed, please try again', 500));
    }

    if (!user) {

        return next(new HttpError('User not exist for provided id.', 404));
    }

    try {

        const session = await mongoose.startSession();
        session.startTransaction();
        await createdPlace.save({ session: session });
        user.places.push(createdPlace);
        await user.save({ session: session });
        await session.commitTransaction();

    } catch (e) {
        return next(new HttpError('Creating place failed, please try again', 500));
    }

    //201 if creation of something new is success
    res.status(201).json({
        place: createdPlace
    });
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { title, description } = req.body;

    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (e) {
        return next(new HttpError('Something went wrong, please try again', 500));
    }

    if (!place) {
        throw new HttpError('Could not find place for the provided id', 404);
    }

    if (place.creator.toString() !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this place', 403));
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (e) {
        const error = new HttpError('Something went wrong, please try again', 500);
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });

}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        //populate allows to refer a document into other collection and work with 
        //the data in there. Populate will work only if connection is established
        place = await Place.findById(placeId).populate('creator');
    } catch (e) {
        const error = new HttpError('Something went wrong, please try again', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for the provided id', 404);
        return next(error);
    }

    if (place.creator.id !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this place', 403));
    }

    const imagePath = place.image;

    try {
 
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.remove({ session: session });
        place.creator.places.pull(place);
        await place.creator.save({ session: session });
        await session.commitTransaction();

    } catch (e) {
        const error = new HttpError('Something went wrong, please try again', 500);
        return next(error);
    }

    fs.unlink(imagePath, (err) => {
        console.log(err);
    }); 

    res.status(200).json({ message: 'Deleted!' });
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;