const express = require('express');
const app = express();
const PORT = 8080; 

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

const emailFinder = (email, data) => {
  for (let user in data){
    if(data[user].email === email){
      return data[user];
    }
  }
  return false;
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
  res.send('Hello!');
});
app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
});
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


app.get('/urls', (req, res) => {
  const userObj = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user: userObj};
  res.render('urls_index', templateVars);
});
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  res.send('Ok');
})
app.get('/urls/new', (req, res) => {
  const userObj = users[req.cookies["user_id"]];
  let templateVars = {user: userObj};
  res.render('urls_new', templateVars);
});
app.get('/urls/:shortURL', (req, res) => {
  const userObj = users[req.cookies["user_id"]];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: userObj };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const userObj = users[req.cookies["user_id"]];
  let templateVars = {user: userObj};
  res.render('urls_registration', templateVars);
})

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  if(!req.body.email || !req.body.password)  {
    res.statusCode = 400;
    res.send ('<h3> Nothing input into registration </h3>')
  }
   else if(emailFinder(req.body.email, users)){
    res.statusCode = 400;
    res.send ('<h3> Account details already registered </h3>')
   } else {
    users[userID] = {
      userID,
      email: req.body.email,
      password: req.body.password
   }
  res.cookie("user_id", userID);
  res.redirect('/urls');
  } 
  

});
app.post('/urls/:id', (req, res) =>{
  const longURL = req.body.longURL;
  const urlID = req.params.id;

  urlDatabase[urlID] = longURL;

  res.redirect('/urls');
})

app.get('/login', (req, res) => {
  const userObj = users[req.cookies["user_id"]];
  let templateVars = {user: userObj};
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
  if (emailFinder(req.body.email, users)) {
    if(req.body.password === user.password){
      res.cookie('user_id", user.userID');
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h3>Wrong password entered </h3>');
    } 
  } else {
    res.statusCode = 403; 
    res.send('<h3> Email not registered with TinyApp</h3>');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})


app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.get('/u/:shortUrl', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL]);
  }else {
    res.statusCode = 404;
    res.send('<h3> 404 Aint find it </h3>')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
