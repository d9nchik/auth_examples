const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const privateKey = 'secret';

const SESSION_KEY = 'Authorization';

function sign(data) {
  return jwt.sign(data, privateKey, { expiresIn: '5m' });
}

function verify(token) {
  try {
    return jwt.verify(token, privateKey);
  } catch (e) {
    return null;
  }
}

function verifyAndGetUserName(token) {
  const data = verify(token);
  if (!data) {
    return null;
  }
  const user = users.find(u => u.login == data.login);
  if (!user) {
    return null;
  }
  return user.username;
}

app.use((req, res, next) => {
  const sessionId = req.get(SESSION_KEY);

  req.username = verifyAndGetUserName(sessionId);
  req.sessionId = sessionId;

  next();
});

app.get('/', (req, res) => {
  if (req.username) {
    return res.json({
      username: req.username,
      logout: 'http://localhost:3000/logout',
    });
  }
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
  res.redirect('/');
});

const users = [
  {
    login: 'Login',
    password: 'Password',
    username: 'Username',
  },
  {
    login: 'Login1',
    password: 'Password1',
    username: 'Username1',
  },
  {
    login: 'd9nich',
    password: '123456',
    username: 'Danylo',
  },
];

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  const user = users.find(user => {
    if (user.login == login && user.password == password) {
      return true;
    }
    return false;
  });

  if (user) {
    const token = sign({ login: user.login });
    console.log(token);
    res.json({ token });
  }

  res.status(401).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
