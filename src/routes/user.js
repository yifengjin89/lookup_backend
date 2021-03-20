const express = require('express');
const {check} = require('express-validator');
const User = require('../controllers/user');
const validate = require('../middlewares/validate');

const router = express.Router();

const upload = require('../utils/multer');


//INDEX
router.get('/', User.index);

//STORE
router.post('/', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('username').not().isEmpty().withMessage('You username is required'),
    check('firstName').not().isEmpty().withMessage('You first name is required'),
    check('lastName').not().isEmpty().withMessage('You last name is required')
], validate, User.store);

//SHOW
router.get('/:id',  User.show);

//UPDATE
router.put('/:id', upload.single('profileImage'),  User.update);

//UPDATE GEOPOINT
router.put('/:id/updateGeoPoint', User.updateGeoPoint);

//SEARCH
router.post('/:id/search', User.search);

//SEND FRIEND / TUTOR REQUEST
router.post('/:id/sendRequest', User.sendRequest);

//MESSAGE RESPONSE
router.post('/:id/response', User.response);

//DELETE
router.delete('/:id', User.destroy);

module.exports = router;
