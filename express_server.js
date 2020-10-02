const express = require('express');
const app = express();
const PORT = 8080; 
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['secrect-stuff'],
}));

const {getUserByEmail} = require('./helpers');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

const urlsForUser = (id) => {
  urls = {};

  for(let shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
}

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};



app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
});


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


app.get('/urls', (req, res) => {
  const userObj = users[req.session.user_id];
  const urls = urlsForUser(userObj, urlDatabase); 
  
  let templateVars = { urls: urls, user: userObj};
  
  res.render('urls_index', templateVars);
});


app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);
  res.send('Ok');
})


app.get('/urls/new', (req, res) => {
  const userObj = users[req.session.user_id];
  if(userObj) {
    let templateVars = {user: userObj};
    res.render('urls_new', templateVars);
  } else {
  res.redirect('/login');
  }
  
});


app.get('/urls/:shortURL', (req, res) => {
  const ID = req.session.user_id;
  const userUrls = urlsForUser(req.session.user_id);
  let templateVars = { urls: userUrls, user: users[ID], shortURL: req.params.shortURL };
  res.render('urls_show', templateVars);
});


app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if(req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }
  res.redirect(`/urls/${shortURL}`);
});


app.post('/urls/:shortURL/delete', (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {
  delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls`);
});


app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.statusCode = 404;
    res.send('<h3> 404 Aint find it </h3>')
  }
});


app.get('/login', (req, res) => {
  const userObj = users[req.session.user_id];
  let templateVars = {user: userObj};
  res.render('urls_login', templateVars);
});


app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users)
  console.log('this is users! :>> ', users); 
  console.log('this is user! :>> ', user);  
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.userID;
        console.log("req sessions", req.session);
        res.redirect('/urls');
      
      } else {
      res.statusCode = 403;
      res.send('<h3> Wrong information entered </h3>');
}
});


app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/urls');
})


app.get('/register', (req, res) => {
  const userObj = users[req.session.user_id];;
  let templateVars = {user: userObj};
  res.render('urls_registration', templateVars);
})


app.post('/register', (req, res) => {
  const userID = generateRandomString();
  if(!req.body.email || !req.body.password)  {
    res.statusCode = 400;
    res.send ('<h3> Nothing input into registration </h3>')
  } else if (getUserByEmail(req.body.email, users)){
    res.statusCode = 400;
    res.send ('<h3> Account details already registered </h3>')
   } else {
    bcrypt.hash(req.body.password, 10,function(err, hashedPassword) {
      users[userID] = {
        userID,
        email: req.body.email,
        password: hashedPassword
    }
  })
  req.session.user_id = userID;
  res.redirect('/urls');
  } 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
