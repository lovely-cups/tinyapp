//import modules

const express = require('express');
const app = express();
const PORT = 8080; 
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');


//middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['secrect-stuff'],
}));

const {getUserByEmail} = require('./helpers');


const urlDatabase = {};


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



//Urls page for user generated short and long URLs
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[userID] };
  
  if (!userID) {
    res.statusCode = 401;
  }
  
  res.render('urls_index', templateVars);
});

//refactored post for new shortURLs
app.post('/urls', (req, res) => {
  if(req.session.user_id) {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
  } else {
    res.statusCode = 401;
    res.send('<h3> Must log in first </h3>')
  }
});

//New short URL from long URL
app.get('/urls/new', (req, res) => {
  const userObj = users[req.session.user_id];
  if(userObj) {
    let templateVars = {user: userObj};
    res.render('urls_new', templateVars);
  } else {
  res.redirect('/login');
  }
  
});

//Page for editing long URLs
app.get('/urls/:shortURL', (req, res) => {
  const ID = req.session.user_id;
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: userUrls, user: users[ID], shortURL: req.params.shortURL };

  if(urlDatabase[req.params.shortURL]) {
  res.render('urls_show', templateVars);
  } else {
    res.send("Page Not Found");
  }
});


app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if(req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.statusCode = 401;
    res.send("<h3> No access to update URL <h3>")
  }
});

//directs to if the delte button is pressed
app.post('/urls/:shortURL/delete', (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortURL].userID) {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  } else {
    res.statusCode = 401;
    res.send("<h3> No access to delete URL <h3>");
  }
});


app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
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

//route for login checking for matching information
app.post('/login', (req, res) => {
  const password = req.body.password
  const user = getUserByEmail(req.body.email, users) 
  if (!user && !password === users.password) {
    res.statusCode = 403;
    res.send('<h3> Wrong information entered </h3>');
      
      } else {
        req.session.user_id = user.userID;
        res.redirect('/urls');
      
}
});


//clear cookie and log out route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
})

//registration page
app.get('/register', (req, res) => {
  const templateVars = {user: null};
  res.render('urls_registration', templateVars);
})


app.post('/register', (req, res) => {
  const userID = generateRandomString();
  if(!req.body.email || !req.body.password)  { //if nothing is entered
    res.statusCode = 400;
    res.send ('<h3> Nothing input into registration </h3>')
  } else if (getUserByEmail(req.body.email, users)){
    res.statusCode = 400;
    res.send ('<h3> Account details already registered </h3>')
   } else {
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    }
  req.session.user_id = userID;
  res.redirect('/urls');
  } 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
