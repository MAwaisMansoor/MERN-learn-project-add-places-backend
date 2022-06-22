const { Router } = require('express');
const { check } = require('express-validator');

const router = Router();

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

router.get('/', usersController.getUsers);

router.post('/signup',
    fileUpload.single('image'),
    [
        check('name').notEmpty(),
        check('email').normalizeEmail().isEmail(), // Test@Test.com => test@test.com
        check('password').isLength({ min: 6 })
    ],
    usersController.signup);

router.post('/login', usersController.login);

module.exports = router;