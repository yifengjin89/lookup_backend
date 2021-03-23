const User = require('../models/user');
const Message = require('../models/message');
const message = require('../models/message');

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
        const exist_request = await Message.find({'from_userId': from_userId,  'msgType': request, 'status': 'Pending'});

        const exist_friend = await User.findOne({'_id': from_userId, 'friends.user_id':to_userId});

        console.log('exist', exist_request)
        console.log('length', exist_request.length);
    
        if (exist_request.length != 0) return res.status(200).json({message: 'Already sent Friend Request, Please wait for the response'});

        if (exist_friend) return res.status(200).json({message: 'This user has already in your friend list !'});

        // otherwise, find user info
        const user = await User.findById(from_userId).select('username profileImage');
      
        const message = {
            from_userId: from_userId,
            from_username: user.username, 
            msgType: request,
            from_profileImage: user.profileImage,
        }

        // if requested user id not in 'send friend request', create friend request to database
        const reqMessage = await Message.create(message);

        const update = await User.findByIdAndUpdate(to_userId, {$push: {'messages': reqMessage._id}});

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
      const userId = req.params.id;
      const msgType = req.body.type;
      const response = req.body.response;
      const message_id = req.body.message_id;

      const message = await Message.findById(message_id);
      console.log('message==============', message);
      const friend = {
          user_id: message.from_userId,
          username: message.from_username,
          profileImage: message.from_profileImage,
      }
      console.log(friend)
      
      if (msgType == 'friend' && response == 'Accept') {
        const is_existed = await User.findById(userId, {'friends.user_id': message.from_userId});
        
        console.log('exist==========')
        console.log(is_existed.friends);
        if (is_existed.friends.length != 0) return res.status(200).json({message: 'This user has already in your friend list !'});

        // add to my friend list
        const update = await User.findByIdAndUpdate(userId, {$push: {'friends': friend}});

        console.log('update===============');
        console.log(update)

        const user_info = {
            user_id: update._id,
            username: update.username,
            profileImage: update.profileImage,
        }

        // add to requested user's friend list
        await User.findByIdAndUpdate(message.from_userId, {$push: {'friends': user_info}});

        // remove message
        await Message.findByIdAndDelete(message_id);

        // remove messages ref
        await User.findByIdAndUpdate(userId, {$pull: {'messages': message_id}});
        
        return res.status(200).json({update, message: 'Friend has been added !'});

      }

      if (msgType == 'friend' && response == 'Ignore') {
        // remove message
        await Message.findByIdAndDelete(message_id);

        // remove messages ref
        await User.findByIdAndUpdate(userId, {$pull: {'messages': message_id}});
        
        const update = User.findById(userId);

        return res.status(200).json({update, message: 'Ignored friend request message'});
      }

  } catch (error) {
      res.status(500).json({message: error.message});
  }
}