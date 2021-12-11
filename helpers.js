// to check email exists in database
const getUserByEmail = (email, users) => {
  for (const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}



module.exports = { getUserByEmail }
