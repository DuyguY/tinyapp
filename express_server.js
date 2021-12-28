const { generateRandomString, urlsForUser}
= require("./helpers");
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(bodyParser.urlencoded({ extended: true }));

//user database
const users = {
  "user1ID": {
    id: "user1ID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2ID": {
    id: "user2ID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.set("view engine", "ejs");

// url database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//to use url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//to user is logged in 
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//user is logged in to delete, edit and create a new short link
app.get("/urls", (req, res) => {

  if (req.session.user_id) {
    const usersURL = urlsForUser(req.session.user_id, urlDatabase);
    const templateVars = {
      urls: usersURL,
      user: users[req.session["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/register");
  }
});

// returns html with a text input field for the original (long) URL
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  const templateVars = {
    user: users[userID]
  };
  if (userID) {
    res.render("urls_new", templateVars);
  } else {
    
    res.send("<html><body> Please login!</body></html>\n");
    
  }
});

// return user's url
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.send("<html><body> Please login!</body></html>\n");
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    }
    res.render("urls_show", templateVars);
  } 
}); 

//to redirect shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send("<html><body> ERROR shortURL does not exist!</body></html>\n");
  }
  if (longURL.startsWith('https://') || longURL.startsWith('http://')) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.send("<html><body> Invalid URL! Please begin with http:// or https:// </body></html>\n");
  }
});

//if the user is logged in, it will allow the user to create a tinyurl
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    urlDatabase[generateRandomString()] = {
      longURL: req.body.longURL,
      userID: userId
    };
    res.redirect("/urls");
  } else {
    res.send("<html><body>Please fill in the correct </body></html>\n");
  }
});

//if the user is logged in and owns the tinyurl they can delete the tinyurl,
//if the user is not logged in or doesnt own the url an error is thrown
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  urlDatabase[shortURL].userID = userID;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const URLobject = urlDatabase[shortURL];
  if (!URLobject) {
    return res.status(403).send("<html><body>URL not found!</body></html>\n");
  }

  if (URLobject.userID !== userID) {
    return res.status(403).send("<html><body> Permission denied! ShortURL belongs to different user</body></html>\n");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// if user login redirects to /urls
// if user is not login returns /login
app.get("/login", (req, res) => {

  if (req.session.users_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_login", { user: null });
  }
});

// if user login redirects to /urls
// if user is not login returns /register
app.get("/register", (req, res) => {
  if (req.session.users_id !== undefined) {
    res.redirect('/urls');
  } else {
    res.render("urls_registration", { user: null });

  }
});

//if email and password params match an existing user
// redirects to /urls 
app.post('/login', (req, res) => {
  for (const index of Object.keys(users)) {

    const user = users[index];

    if ((user.email === req.body.email) && (bcrypt.compareSync(req.body.password, user.password))) {

      req.session.user_id = user.id;
      return res.redirect('/urls');
    }
  }
  res.send("<html><body>Your email/password is wrong!</body></html>\n");
})

// Fill in the email-password information, create a new account and log in to the user
app.post("/register", (req, res) => {

  let newId = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.send("<html><body>Please fill in the blanks!</body></html>\n");
  } else {
    for (const index of Object.keys(users)) {
      if (req.body.email === users[index].email) {
        return res.send("<html><body>This email already exist! Please login!</body></html>\n");
      }
    }
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newId;
    res.redirect("/urls");
  }
});

//logs out of the app 
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


