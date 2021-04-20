const User = require('../models/user');
const Message = require('../models/message');

// @route post api/user/{id}/sendFriendRequst
// @desc Send friend request
// @access Public
exports.sendRequest = async function (req, res) {
  try {
      // message from id
      const from_userId = req.params.id;

      // message to id
      const to_userId = req.body.to_userId;

      const request = req.body.request;

      // check the request is in the requested user's message box or not
      const exist_request = await Message.find({'from_userId': from_userId,  'request': request, 'status': 'Pending'});

      if (exist_request.length != 0) return res.status(400).json({message: 'Already sent the Request, Please wait for the response'});

      // otherwise, find user info
      const user = await User.findById(from_userId).select('username profileImage');
      
      const message = {
          from_userId: from_userId,
          from_username: user.username, 
          request: request,
          from_profileImage: user.profileImage,
      }

      if (request == 'friend') {
        // check the requested user is in the friend list or not;  
        const exist_friend = await User.findOne({'_id': from_userId, 'friends._id':to_userId});

        if (exist_friend) return res.status(400).json({message: 'This user has already in your friend list !'});

        //  create friend request to database
        const reqMessage = await Message.create(message);

        const update = await User.findByIdAndUpdate(to_userId, {$push: {'messages': reqMessage._id}});

        // const user = await User.findById(id);
        return res.status(200).json({reqMessage, message: 'Friend Request has been sent !'});
      }

      // if request == 'skill.name' ...
      const reqMessage = await Message.create(message);

      const update = await User.findByIdAndUpdate(to_userId, {$push: {'messages': reqMessage._id}});

      return res.status(200).json({reqMessage, message: `${request} Tutorial Request has been sent !`});

  } catch (error) {
      res.status(500).json({message: error.message});
  }
};

// @route POST api/user/{id}/response
// @desc response message from other users
// @access Public
exports.response = async function (req, res) {
  try {
      const userId = req.params.id;
      const request = req.body.request;
      const response = req.body.response;
      const message_id = req.body.message_id;

      // get message
      const message = await Message.findById(message_id);

      const friend = {
          _id: message.from_userId,
          username: message.from_username,
          profileImage: message.from_profileImage,
      }
      
      if (request == 'friend' && response == 'Accept') {
        const is_existed = await User.findById(userId, {'friends._id': message.from_userId});
      
        if (is_existed.friends.length != 0) return res.status(400).json({message: 'This user has already in your friend list !'});

        // add to friend list
        const update = await User.findByIdAndUpdate(userId, {$push: {'friends': friend}});

        const user_info = {
            _id: update._id,
            username: update.username,
            profileImage: update.profileImage,
        }

        // add to another user's friend list
        await User.findByIdAndUpdate(message.from_userId, {$push: {'friends': user_info}});

        // remove message
        await Message.findByIdAndDelete(message_id);

        // remove messages ref
        const user = await User.findByIdAndUpdate(userId, {$pull: {'messages': message_id}});
        
        return res.status(200).json({user, message: 'Friend has been added !'});
      }

      if (request == 'friend' && response == 'Ignore') {
        // remove message
        await Message.findByIdAndDelete(message_id);

        // remove messages ref
        const user = await User.findByIdAndUpdate(userId, {$pull: {'messages': message_id}});
        
        // const user = User.findById(userId);

        return res.status(200).json({user, message: 'Ignored friend request message'});
      }

      // if request != 'friend' && response == 'Accept'

  } catch (error) {
      res.status(500).json({message: error.message});
  }
}

