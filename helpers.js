//generate random string for shortURL
function generateRandomString() {
  let result = '';
  characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};


//returns a object of filtered URLs based on the userID that is currently logged in
const urlsForUser = (id, urlDatabase) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};




module.exports = { generateRandomString, urlsForUser}
