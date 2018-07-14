const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require ('cookie-session'); 
app.set('view engine', 'ejs');
app.use(bodyParser.json({}));

//=====BodyParser=====
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

//=====CookieSession=====
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secret-string'],
}));


//=====Databases======

//=====urlDatabase===== 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
};


//=====Function Street=====
function generateRandomString() {
  let generatedID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 6; i++)
      generatedID += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return generatedID;
  }

//===== Get Street=====

//=====email register===== 
app.get('/register', (req, res) => {
 
  let templateVars = { urls: urlDatabase, username: req.cookies[req.session.user_id] }
  res.render('email_register', templateVars);
  
});

//=====update longURL=====
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let templateVars = {shortURL: shortURL, urls: urlDatabase, username: req.cookies[req.session.user_id] }
  res.render("urls_show", templateVars);
});

//=====provides form for updating url=====
app.get("/urls/:id/update ", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.id;
  let templateVars = {shortURL: shortURL, urls: urlDatabase, username: req.cookies[req.session.user_id] }
  urlDatabase[shortURL] = longURL;
  res.render("urls_show", templateVars);
});  


//=====index of stored urls=====
app.get("/urls", (req, res) => {  
  let templateVars = { urls: urlDatabase, username: req.cookies[req.session.user_id] }
  res.render("urls_index", templateVars);
});

//=====If url is valid, redirect to longURL else 404=====
app.get('/u/:shortURL', (req, res) => { 
  let longURL = 
 urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

//=====let user enter new url=====
app.get("/urls/new", (req, res) => {
  if (res.locals.user_id) {
  let templateVars = { urls: urlDatabase, username: req.cookies[req.session.user_id] }
  res.render("urls_new", templateVars);
  }
});

//=====checks if email is exisiting or present=====
app.post('/register', (req, res) => {
  res.cookie('randomID', req.body.email)
 
    if (!req.body.password || !req.body.email) {
      res.status(400).send("Enter an email and password");
      return;
    } 

//=====loops though users{}, if email is already in {}, nope =====
    let arr = [];
    for (let id in users) {
      arr.push(users[id].email)};

    if  (arr.includes(req.body.email)) {
      res.status(400).send("That email already exists");
      return;
    }
    
//===== adds new user to users object=====
    else {
      const randomID = generateRandomString();
      req.session.user_id = randomID;
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: req.body.password
       };
    req.session.user_id = randomID; 
    res.redirect("/urls");
   }
});  

//=====renders login page=====
app.get("/login", (req, res) =>{
  res.render("login")
});


//=====Post Street=====

//=====login saves cookie=====
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls");
});



//=====generates new short url=====
app.post("/urls", (req, res) => {
  if (res.locals.user_id) {
  let shortURL = generateRandomString();
  let object = {
    shortURL,
    longURL: req.body.longURL };
  urlDatabase[shortURL] = object;
  res.redirect("/urls")

  }
});

//=====logout=====
app.post("/logout", (req, res) => {
  res.clearCookie(req.session.user_id)
  res.redirect("/urls")
});

//=====posts updated url=====
app.post("/urls/:id", (req, res) => {
    let longURL = req.body.longURL;
    shortURL = req.params.id;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
});

//=====Deletes User======
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect("/urls");
  });  

//=====Listen Port=======

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}!`);
});