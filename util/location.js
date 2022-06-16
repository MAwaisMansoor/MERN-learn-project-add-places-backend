//const axios = require('axios');

const HttpError = require('../models/http-error');
const API_KEY = 'need credit card for key';

async function getCoordsForAddress(address) {
    return {
        lat: 40.7484405,
        lng: -73.9878584
    }

    /* if has credit card and got api key then use this

    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=
        ${encodeURIComponent(address)}
        &key=${API_KEY}`
    );

    const data = response.data;

    if(!data || data.status === 'ZERO_RESULTS'){
        throw new HttpError('Unable to get location for the address', 422);
    }

    const coordinates = data.results[0].geometry.location;

    return coordinates;
    */
}

module.exports = getCoordsForAddress;