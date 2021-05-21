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
      const exist_request = await Message.findOne({'from_userId': from_userId, 'to_userId':to_userId, 'request': request});

      if (exist_request) return res.status(400).json({message: 'Already sent the Request, Please wait for the response'});

      // otherwise, find user info
      const user = await User.findById(from_userId).select('username profileImage');
      
      const message = {
          from_userId: from_userId,
          to_userId: to_userId,
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
        
        // update other_user's info
        const other_user = await User.findByIdAndUpdate(to_userId, {$push: {'messages': reqMessage._id}}, {new: true});

        return res.status(200).json({other_user: other_user, message: 'Friend Request has been sent !'});
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
        const is_existed = await User.findOne({'_id':userId, 'friends._id': message.from_userId});
       
        if (is_existed) return res.status(400).json({message: 'This user has already in your friend list !'});

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
        await User.findByIdAndUpdate(userId, {$pull: {'messages': message_id}});

        // return user with all messages
        const user = await User.findOne({'_id':userId}).populate({path:'messages'});
        
        return res.status(200).json({user, message: 'Friend has been added !'});
      }

      if (response == 'Ignore') {
        // remove message
        await Message.findByIdAndDelete(message_id);

        // remove messages ref
        await User.findByIdAndUpdate(userId, {$pull: {'messages': message_id}});
        
        // return user with all messages
        const user = await User.findOne({'_id':userId}).populate({path:'messages'});

        return res.status(200).json({user, message: 'Ignored request message'});
      }
      // skill or rating request
      if (request != 'friend' && response == 'Accept') { 

        let skill_rank = ''
        // rating: 'rating/html/9'
        let request_ = request.split("/")

        // get skill name and rank if send by rating request
        if (request_[0] == 'rating') {
          request = request_[1]
          skill_rank = Number(request_[2])
        }
        else {
          let user_1 = await User.findById(userId)

          // get skill rank if send by skill request
          for (let i = 0; i < user_1.skills.length; i++) {
            if (user_1.skills[i].name == request) {
                skill_rank = user_1.skills[i].rank
              }
          }
        }
        
        // remove message
        await Message.findByIdAndDelete(message_id);

        // remove messages ref
        await User.findByIdAndUpdate(userId, {$pull: {'messages': message_id}});
        
        // return user with all messages
        const user_ = await User.findOne({'_id':userId}).populate({path:'messages'});

        return res.status(200).json({user: user_, user_id: userId, other_user_id:message.from_userId, request: request, rank: skill_rank, message: 'Skill request accepted'});
    }

  } catch (error) {
      res.status(500).json({message: error.message});
  }
}

