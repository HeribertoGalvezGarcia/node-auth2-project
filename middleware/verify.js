const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');

module.exports = ({headers: {authorization}}, res, next) => {
  if (authorization) {
    jwt.verify(authorization, secrets.jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({message: 'Invalid Credentials'});
      }

      res.locals.decodedToken = decodedToken;
      next();
    });
  } else {
    res.status(400).json({message: 'No credentials provided'});
  }
};
