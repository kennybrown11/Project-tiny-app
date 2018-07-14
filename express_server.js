const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require ('cookie-session'); 
app.set('view engine', 'ejs');
app.use(bodyParser.json({}));

//=====CookieSession=====
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secret-string'],
}));


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

   
  function checkEmail(email) {
    for (var id in users) {
      if (users[id].email === email)
      return true;
    }
    return false;
  };

//===== Get Street=====

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
  if(userId) {
    let templateVars = {
      urls: urlDatabase,
      user: user
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send('Please login or register to view your urls.');
  }
});

//=====let user enter new url=====
app.get("/urls/new", (req, res) => {
  let userId = req.session.user_id;
  let user = users[userId];
  let templateVars = { urls: urlDatabase, user: user};
  res.render("urls_new", templateVars);
});

//=====provides form for updating url=====
app.get("/urls/:id/ ", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.id;
  let templateVars = {urlObj: urlDatabase[req.params.id], user: user};
  urlDatabase[shortURL] = longURL;
  res.render("urls_show", templateVars);

  if (urlDatabase[req.params.id]) {
  res.redirect('/urls');
} else {
  res.status(400);
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

//=====Post Street=====


//=====checks if email is exisiting or present=====
app.post("/register", (req, res) => {
var userID = generateRandomString();
let newUser = {
  id: userID,
  email: req.body.email,
  password: req.body.password }

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