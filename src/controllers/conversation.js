const User = require('../models/user');
const Conversation = require('../models/conversation');


exports.createConversation = async function (req, res) {
    try {
        await User.findOne({ email: req.auth.credentials.email }).populate('conversations').then(
            (user) => {
                if (user) {
                    const isConversationExist = user.conversations.filter(conversation => (
                        conversation.userOneId === req.payload.friendId ||
                        conversation.userTwoId === req.payload.friendId
                    ),
                    ).length > 0;
                    if (isConversationExist) {
                        //reply(Boom.badData('You already have conversation with this user'));
                    } else {
                        User.findById(req.payload.friendId).then(
                            (friend) => {
                                const newConversation = new Conversation({
                                    userOneId: user._id,
                                    userTwoId: friend._id,
                                });
                                newConversation.save().then((conversation) => {
                                    user.conversations.push(conversation);
                                    user.save();
                                    friend.conversations.push(conversation);
                                    friend.save();

                                    res({ id: conversation._id, friendId: friend._id });
                                });
                            },
                        );
                    }
                } else {
                    //res(Boom.notFound('Cannot find user'));
                }
            },
        );
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }

}

exports.loadConversations = async function (req, res) {
    try {
        await User.findOne({ email: req.auth.credentials.email }).populate('conversations').then(
            (user) => {
                if (user) {
                    const conversations = user.conversations.map((conversation) => {
                        const friendId = `${user._id}` === conversation.userOneId ?
                            conversation.userTwoId : conversation.userOneId;
                        return {
                            id: conversation._id,
                            friendId,
                        };
                    });
                    res(conversations);
                } else {
                    //reply(Boom.notFound('Cannot find user'));
                }
            },
        );
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }

}
