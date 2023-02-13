const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let found = users.find((user)=>{
    return user.username === username
  });
  if(found){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let found = users.find((user)=>{
    return (user.username === username && user.password === password)
  });
  if(found){
    return true;
  } else {
    return false;
  }}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message: "logging in failure!"});
  }

  if(authenticatedUser(username, password)){
    let token = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60});
    req.session.authorization = { token, username };
    return res.status(200).send("Succesfull login!");  
  } else {
    return res.status(208).send("Invalid login!");  
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const put_review = req.body.review;
  if (!username || !password) {
      return res.status(404).json({message: "logging in failure!"});
  }

  if (authenticatedUser(username,password)) {
    const isbn = req.params.isbn;
    books[isbn]["reviews"][username] = put_review;
    return res.send(JSON.stringify(books[isbn],null,4));
  } else {
    return res.status(208).json({message: "Invalid Login!"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
      const isbn = req.params.isbn;
      let delet_review = books[isbn]["reviews"][username];
      if (delet_review) {
          delete books[isbn]["reviews"][username];
      }
      return res.send(JSON.stringify("The user: "+username+" has deleted his review",null,4));
    } else {  
      return res.status(208).json({message: "Invalid Login!"});
    }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
