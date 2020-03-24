const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./data/dbConfig');
const secrets = require('./config/secrets');
const verify = require('./middleware/verify');

const server = express();
server.use(express.json());

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    department: user.department
  };

  const options = {
    expiresIn: '1d'
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}

server.post('/api/register', ({body: {username, password, department}}, res) => {
  const encryptedPassword = bcrypt.hashSync(password, 14);

  db('users')
    .insert({username, password: encryptedPassword, department})
    .then(() => res.status(201).json({message: 'User Created!'}))
    .catch(() => res.status(500).json({message: 'Error creating user'}));
});

server.post('/api/login', (req, res) => {
  const {username, password} = req.body;

  db('users')
    .where({username})
    .select()
    .first()
    .then(user => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({message: 'You shall not pass!'});
      }

      const token = generateToken(user);

      res.json({message: 'Logged in!', token});
    })
    .catch(e => {
      console.log(e);
      res.status(500).json({message: 'Error logging in'})
    });
});

server.get('/api/users', verify, (req, res) => {
  db('users')
    .where({department: res.locals.decodedToken.department})
    .then(users => res.json(users))
    .catch(() => res.status(500).json({message: 'Error getting users'}));
});

module.exports = server;
