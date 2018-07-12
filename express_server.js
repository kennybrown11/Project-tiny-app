var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())
var PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// urlDatabase 
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generates a random six digit alphanumerical string represent shortURL
function generateRandomString() {
let text = "";
var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls");
});


//  index of stored urls
app.get("/urls", (req, res) => {  
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] }
  res.render("urls_index", templateVars);
});

// let user enter new url
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
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

app.get("/urls/:id/update ", (req, res) => {
    let longURL = req.body.longURL;
    let shortURL = req.params.id;
    let templateVars = {shortURL: shortURL, urls: urlDatabase, username: req.cookies["username"] }
    urlDatabase[shortURL] = longURL;
    res.render("urls_show", templateVars);
});  

app.post("/urls/:id/update ", (req, res) => {
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect("urls_index");
});

// deletes url from database
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.render("urls_index",{ urls: urlDatabase });
  });  


app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}!`);
});