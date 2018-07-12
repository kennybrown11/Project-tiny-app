const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(bodyParser.json({}));

// urlDatabase 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generates a random six digit alphanumerical string represent shortURL
function generateRandomString() {
let shortURL = "";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    shortURL += possible.charAt(Math.floor(Math.random() * possible.length));

  return shortURL;
}


//login saves cookie
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls");
});


//  index of stored urls
app.get("/urls", (req, res) => {  
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] }
  res.render("urls_index", templateVars);
});

  // If url is valid, redirect to longURL else 404
app.get('/u/:shortURL', (req, res) => { 
  let longURL = 
 urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

// let user enter new url
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

// generates new short url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let object = {
    shortURL,
    longURL: req.body.longURL };
  urlDatabase[shortURL] = object;

  res.status(201).json(object);
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls")
});

//update longURL
app.get("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    let templateVars = {shortURL: shortURL, urls: urlDatabase, username: req.cookies["username"] }
    res.render("urls_show", templateVars);
  });

// provides form for updating url
app.get("/urls/:id/update ", (req, res) => {
    let longURL = req.body.longURL;
    let shortURL = req.params.id;
    let templateVars = {shortURL: shortURL, urls: urlDatabase, username: req.cookies["username"] }
    urlDatabase[shortURL] = longURL;
    res.render("urls_show", templateVars);
});  

// posts updated url
app.post("/urls/:id", (req, res) => {
    let longURL = req.body.longURL;
    shortURL = req.params.id;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
});

// deletes url from database
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect("/urls");
  });  


app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}!`);
});