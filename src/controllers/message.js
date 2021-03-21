const User = require('../models/user');
const Message = require('../models/message');

// @route post api/user/{id}/sendFriendRequst
// desc Send friend request
// @access Public
exports.sendRequest = async function (req, res) {
  try {
      // message from id
      const from_userId = req.params.id;

      // message to id
      const to_userId = req.body.to_userId;

      const request = req.body.request;

      if (request == 'friend') {
          // if the user(a) already sent a friend request to the user(b), and status is: 'Pending',
          // return message: 'Already sent Friend Request, Please wait for the response' and exit function.
          const exist_request = await Message.find({'from_userId': from_userId, 'to_userId': to_userId, 'msgType': request, 'status': 'Pending'});

          console.log('exist', exist_request)
          console.log('length', exist_request.length);
         
          if (exist_request.length != 0) return res.status(200).json({message: 'Already sent Friend Request, Please wait for the response'});

          // otherwise, find user info
          const user = await User.findById(from_userId).select('username profileImage');
      
          const message = {
              from_userId: from_userId,
              to_userId: to_userId,
              from_username: user.username, 
              msgType: request,
              from_profileImage: user.profileImage,
          }

          // if requested user id not in 'send friend request', create friend request to database
          const reqMessage = await Message.create(message);

          const update = await User.findByIdAndUpdate(to_userId, {$push:{'messages': reqMessage._id}});

          console.log('reqMessage ==========');
          console.log(reqMessage);

          console.log('update================');
          console.log(update);

          // const user = await User.findById(id);
          return res.status(200).json({reqMessage, message: 'Friend Request has been sent !'});
      }

      // if request == 'tutorial' ...

  } catch (error) {
      res.status(500).json({message: error.message});
  }
};

// @route POST api/user/{id}/response
// @desc response message from other users
// @access Public
exports.response = async function (req, res) {
  try {
      const id = req.params.id;
      const msgType = req.body.type;
      const response = req.body.response;
      const requestId = req.body.requestId;

      const message = await User.findOne({'message._id': requestId}).select('message');
      console.log('message==============', message);

      return res.status(200).json({message: 'Receive'});
      if (msgType == 'friendRequest' && response == 'Approve') {


      }

      if (msgType == 'friendRequest' && response == 'Reject') {

      }


  } catch (error) {
      res.status(500).json({message: error.message});
  }
}