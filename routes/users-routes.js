const {Router} = require('express');
const {check} = require('express-validator');

const router = Router();

const usersController = require('../controllers/users-controller');

router.get('/', usersController.getUsers);

router.post('/signup',
[
    check('name').notEmpty(),
    check('email').normalizeEmail().isEmail(), // Test@Test.com => test@test.com
    check('password').isLength({min: 6})
],
usersController.signup);

router.post('/login', usersController.login);

module.exports = router;