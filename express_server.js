const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "user1ID": {
    id: "user1ID", 
    email: "user@test.com", 
    password: "pink-cat"
  },
 "user2ID": {
    id: "user2ID", 
    email: "user2@test.com", 
    password: "brown-dog"
  }
}


app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

function generateRandomString() {
  let result = '';
  characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

app.get("/", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 })


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
  user:users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase,
  user:users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.get("/register", (req, res) => {
   if (req.cookies.users_id) {
   res.redirect('/urls');
 } else {
   res.render("urls_registration", { user: null });
 }  
});

app.get("/login", (req, res) => {
  if (req.cookies.users_id) {
  res.redirect('/urls');
} else {
  res.render("urls_login", { user: null });
}  
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});



app.post("/register", (req, res) => {

   let newId = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
   res.send("<html><body>ERROR 400</body></html>\n");
 } else {
   for (const index of Object.keys(users)) {
     if (req.body.email === users[index].email) {
       res.send("<html><body>ERROR 400</body></html>\n");
     }
   }
   users[newId] = {
     id: newId,
     email: req.body.email,
     password: req.body.password
   };
   res.cookie("user_id", newId);
   res.redirect("/urls");
 } 

 console.log(req.body);
});


app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


 app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL 
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});  

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
   const newLongURL = req.body.longURL;
   urlDatabase[shortURL] = newLongURL;
    res.redirect("/urls");
});  

app.post('/login', (req, res) => {
  console.log(req.body);
  for (const index of Object.keys(users)) {
    
    if ((req.body.email === users[index].email) && (req.body.password === users[index].password)) {

      res.status(200).cookie("user_id", users[index].id)
      res.redirect('/urls')
      
    } else {
      res.send("<html><body>ERROR 400</body></html>\n");
    }
  } 

 

})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});