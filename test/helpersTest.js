const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    assert.equal(user, testUsers.userRandomID);
    // Write your assert statement here
  });
  it('should return undefined when looking for email thats not in database', function() {
    const user = getUserByEmail('nothere@bye.com', testUsers);
    assert.equal(user, undefined);
  })
});