const { Router } = require('express');
const { check } = require('express-validator');

const router = Router();

const placesController = require('../controllers/places-controller');

const fileUpload = require('../middleware/file-upload');

const checkAuth = require('../middleware/check-auth');

router.get('/:pid', placesController.getPlaceById);

router.get('/user/:uid', placesController.getPlacesByUserId);
 
router.use(checkAuth);

//execute from left to right
router.post(
    '/',
    fileUpload.single('image'),
    [
        check('title').notEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').notEmpty()
    ],
    placesController.createPlace);

router.patch('/:pid',
    [
        check('title').notEmpty(),
        check('description').isLength({ min: 5 })
    ],
    placesController.updatePlace);

router.delete('/:pid', placesController.deletePlace);

module.exports = router;