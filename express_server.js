var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// stores key and value of shortURL and longURL
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


app.set('view engine', 'ejs');

//  index of stored urls
app.get("/urls", (req, res) => {
  res.render("urls_index", { urls: urlDatabase });
});

// 
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params.longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    res.render("urls_show", { shortURL: shortURL, urlDatabase: urlDatabase } );
  });

// deletes url from database
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect(`/urls/`);
  });  

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.end("hello");
});

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}!`);
});