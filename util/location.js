//const axios = require('axios');

const HttpError = require('../models/http-error');
const API_KEY = process.env.GOOGLE_API_KEY;

async function getCoordsForAddress(address) {
    return {
        lat: 31.5879663,
        lng: 74.3062289
    }

}

module.exports = getCoordsForAddress;

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