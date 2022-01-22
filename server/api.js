/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Info = require("./models/profileinfo");


// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

//data for levels
const data = {
  levels: [
    {
      _id: 0,
      function: '2x^2+1x+3',
      hint: 'Hint: 2x^2+1x+3'
    },
    {
      _id: 1,
      function: '4x^2+1x+2',
      hint: 'Hint: 4x^2+1x+2'
    },
    {
      _id: 2,
      function: '2x^2+2x+4',
      hint: 'Hint: 2x^2+2x+4'
    },
    {
      _id: 3,
      function: '-2x^2+1x+-3',
      hint: 'Hint: -2x^2+1x-3'
    },
    {
      _id: 4,
      function: '-1x^2+1x+6',
      hint: 'Hint: -1x^2+1x+6'
    },
  ],
};

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

router.get("/profileinfos", (req, res) => {
  Info.find({}).then((infos) => res.send(infos));
});

router.post("/profileinfo", auth.ensureLoggedIn, (req, res) => {
  const newInfo = new Info({
    creator_id: req.user._id,
    creator_name: req.user.name,
    content: req.body.content,
  });

  newInfo.save().then((info) => res.send(info));
});

router.get("/levels", (req, res) => {
  // send back all of the levels!
  res.send(data.levels);
});

router.post("/setHighestLevel", auth.ensureLoggedIn, (req, res) => {

  console.log('setitng highest level')
  if(req.user) {
    User.findById(req.body.userId).then(
      (user) => {
        
        console.log("highest level set")
        if(req.body.level > user.highestLevel){
          user.highestLevel = req.body.level;
        }
        user.save().then(ans => res.send(ans));
        });
  }
  
});

  router.get("/getHighestLevel", (req, res) => {
    // console.log(req);
    console.log('get highest level')
    if (req.user) {

      User.findById(req.user._id).then(
        (user) => {
          console.log('highest level set')
          res.send({highestLevel: user.highestLevel})
        }
      );
    }
    
  });


// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
