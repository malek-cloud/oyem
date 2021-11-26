const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const phone = req.body.phone;
  const password = req.body.password;
  bcrypt
    .hash(password, 12) //hash the pw with a string of 12
    .then(hashedPw => {
      const user = new User({
        email: email,
        password: hashedPw,
        nom: nom,
        prenom: prenom,
        phone: phone
      });
      return user.save();
      
    })
    .then(result => {
      const token = jwt.sign(
        {
          email: email,
          userId: result._id.toString()
        },
        process.env.JWT_TOKEN,
        { expiresIn: '1h' }
      );
      res.status(201).json({ message: 'User created!', userId: result._id, token : token, expiryDate : '1' });
      
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err); //throw err
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        process.env.JWT_TOKEN,
        { expiresIn: '1h' }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString(), expiryDate: '1', });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
