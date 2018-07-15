const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require ('cookie-session'); 
const bcrypt = require('bcrypt');
app.set('view engine', 'ejs');
app.use(bodyParser.json({}));


//=====CookieSession=====//
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secret-string'],
}));


//=====BodyParser=====//
app.use(bodyParser.urlencoded({extended: true}));

//=====Globl User=====
app.use((req, res, next) => {
  res.locals = {
    userDB: users,
    urlDB: urlDatabase
  }
  res.locals.user = users[req.session.user_id];
  next();
});

//=====Databases======

//=====urlDatabase===== 
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", shortURL: "b2xVn2", userID: "a@a"},

  "9sm5xK": { longURL:"http://www.google.com", shortURL: "9sm5xK", userID: "a@a"}
};

//=====users database=====
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user2RandomID", 
    email: "a@a", 
    password: "x"
  }  
};


//=====Functions=====
function generateRandomString() {
  let generatedID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++)
    generatedID += possible.charAt(Math.floor(Math.random() * possible.length));

    return generatedID;
  }

   
function checkEmail(email) {
  for (var id in users) {
    if (users[id].email === email)
    return true;
  }
  return false;
};

//===== Email and password correct and correspond =====
function loginUser(email, password){
  let accepted = false;
  let userId;
  for(let key in users){
    if((users[key].email===email) && (bcrypt.compareSync(password, users[key].password))){
      accepted = true;
      userId = key;
      break;
    }
  }
  return userId;
};

//===== Identifies if user can edit by ID =====
function checkUserID(userID, shortURL) {
  for (var id in urlDatabase) {
    if ((urlDatabase[id].userID === userID) && (urlDatabase[id].shortURL === shortURL)) return true;
  }
  return false;
};

//====== Shows user their specific index of URLS =====
function urlsforuserID(id) {
  let list = {};
  for ( let item in urlDatabase){
    if (id === urlDatabase[item].userid) {
      list[item] = urlDatabase[item].url;
    }
  }
  return list;
}

//========== Get ==========

//=====Renders Login Page=====
app.get("/login", (req, res) => {
  let userId = req.session.user_id;
  if(userId){
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

//=====Email Register===== 
app.get("/register", (req, res) => {
  let userId = req.session.user_id;
  if(userId){
    res.redirect('/urls');
  } else {
    res.render("email_register");
  }
});

//=====index of stored urls=====
app.get("/urls", (req, res) => {
  let userId = req.session.user_id;
  let user = users[userId];
  if (userId) {
      let templateVars = {
        userId: req.session.user_id,
        urls: urlDatabase,
        user: user
      };
    res.render("urls_index", templateVars);
  
  } else {
    res.redirect('/login');
  }  
});



//=====let user enter new url=====
app.get("/urls/new", (req, res) => {
  let userId = req.session.user_id;
  let user = users[userId];
  if (userId){
  let templateVars = { urls: urlDatabase, user: user};
  res.render("urls_new", templateVars);
  } else {
    res.render("login");
  }
});

//=====provides form for updating url=====
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let userId = req.session.user_id;
  let user = users[userId];
  if (checkUserID(userId, shortURL)) {
    let templateVars = {
      urls: urlDatabase,
      shortURL: req.params.id,
      urlObj: urlDatabase[req.params.id],
      user: user
    }
    res.render("urls_show", templateVars);
  }  else {
    res.status(400).send('You can only update your own urls');
  }
});  
//======== ShortURL Page =========
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send('URL submitted is incorrect.');
  } else {
    res.redirect(urlDatabase[req.params.id].longURL);
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//===== Redirect to the login=====
app.get("/", (req, res) => {
  let userId = req.session.user_id;
  if(userId){
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//=====Posts=====


//=====checks if email is exisiting or present=====
app.post("/register", (req, res) => {
var userID = generateRandomString();
const password = req.body.password;
const hashedPassword = bcrypt.hashSync(password, 10);
let newUser = {
  id: userID,
  email: req.body.email,
  password: hashedPassword }

  if (!newUser.password || !newUser.email) {
    res.status(400).send("Enter an email and password");
  } 

//=====loops though users{}, if email is already in {}, nope =====
  else if (checkEmail(newUser.email)) {
    res.status(400).send('A user with this email already exists.');
  } else {
    users[userID] = newUser;
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});
    

//===== Login =====
app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Enter both an email and a password");
    return;
  }
    let email = req.body.email;
    let password = req.body.password;
    let result = loginUser(email, password);
    if(result){  
      //user is and password matched
      req.session.user_id = result;
      res.redirect('/urls');
    } else {  
      //user id and password didnt match
      res.status(403).send('Password or email address wrong');
    }
  });



//=====generates new short url=====
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let userId = req.session.user_id;
  if (userId) { urlDatabase[shortURL] = { shortURL: shortURL, 
    longURL: longURL, userID: userId };

    res.redirect('/urls/' + shortURL);
  } else {
    res.status(400).send('Login to access your urls');
  }
});


//=====posts updated url=====
app.post("/urls/:id", (req, res) => {
  let userId = req.session.user_id;
  if(userId){
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(400).send('Login to update URLs');
  }
});

//=====Deletes URL======
app.post("/urls/:id/delete", (req, res) => {  
  const UrlObj = urlDatabase[req.params.id];
  if(UrlObj.userID === req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(403).send('You may only delete your own urls.');
  }
});
//=====logout=====
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login")
});
  
//=====Listen Port=======

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});