const getUserByEmail = (email, data) => {
  for (let user in data){
    if(data[user].email === email){
      return data[user];
    }
  }
  return undefined;
}

module.exports = {getUserByEmail};