const User = require('../models/user');
const { distanceInMBetweenEarthCoordinates, sendEmail} = require('../utils/index');
const upload = require('../utils/multer');
const cloudinary = require('../config/cloudinary');

// @route GET admin/user
// @desc Returns all users
// @access Public
exports.index = async function (req, res) {
    const users = await User.find({});
    res.status(200).json({users});
};

// @route POST api/user
// @desc Add a new user
// @access Public
exports.store = async (req, res) => {
    try {
        const {email} = req.body;

        // Make sure this account doesn't already exist
        const user = await User.findOne({email});

        if (user) return res.status(401).json({message: 'The email address you have entered is already associated with another account. You can change this users role instead.'});

        const password = '_' + Math.random().toString(36).substr(2, 9); //generate a random password
        const newUser = new User({...req.body, password});

        const user_ = await newUser.save();

        //Generate and set password reset token
        user_.generatePasswordReset();

        // Save the updated user object
        await user_.save();

        //Get mail options
        let domain = "https://" + req.headers.host;
        let subject = "New Account Created";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link = "https://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}<p><br><p>A new account has been created for you on ${domain}. Please click on the following <a href="${link}">link</a> to set your password and login.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`

        await sendEmail({to, from, subject, html});

        res.status(200).json({message: 'An email has been sent to ' + user.email + '.'});

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};

// @route GET api/user/{id}
// @desc Returns a specific user
// @access Public
exports.show = async function (req, res) {
    try {
        const id = req.params.id;

        const user = await User.findById(id);

        if (!user) return res.status(401).json({message: 'User does not exist'});

        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// @route PUT api/user/{id}/updateGeoPoint
// desc Update user GeoPoint
// @access Public
exports.updateGeoPoint = async function (req, res) {
    try {
        const id = req.params.id;
        const geoPoint = req.body
        
        const user = await User.findByIdAndUpdate(id, {$set: geoPoint}, {new: true});
        
        return res.status(200).json({user, message: 'User has been updated'});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


// @route PUT api/user/{id}
// @desc Update user details
// @access Public
exports.update = async function (req, res) {
    try {
        const update = req.body;
        const id = req.params.id;
        const userId = req.user._id;
        let skills = [];
    
        //Make sure the passed id is that of the logged in user
        if (userId.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to update this data."});
        
        // replace the skills and rank into update data
        if (req.body.skills) {
            let skill = JSON.parse(req.body.skills);
            let ranking = JSON.parse(req.body.rank);
            
            for (let i = 0; i < JSON.parse(req.body.skills).length; i++) {
                skills.push({
                    name: skill[i],
                    rank: Number(ranking[i])
                });
            }
            delete update.skills;
            delete update.rank;
            update['skills'] = skills
        }
        
        const user = await User.findByIdAndUpdate(id, {$set: update}, {new: true});
        
        // if there is no image, return success message
        if (!req.file) return res.status(200).json({user, message: 'User has been updated'});
       
        // upload profileImage to cloudinary

        // if exist profileImage, destroy and upload new
        if (user.cloudinary_id) {
            await cloudinary.uploader.destroy(user.cloudinary_id);
        }

        // upload and get response
        const result = await cloudinary.uploader.upload(req.file.path);
        update['profileImage'] = result.secure_url || user.profileImage;
        update['cloudinary_id'] = result.public_id || user.cloudinary_id;

        // update datebase
        const user_ = await User.findByIdAndUpdate(id, {$set: update}, {new: true});

        return res.status(200).json({user: user_, message: 'User has been updated'});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

exports.search = async function (req, res) {
    try {
        const keyword = req.body.keyword;
        const method = req.body.method;
        const user_id = req.params.id
        
        // total 3 skills per user have
        const skills_length = 3;
        // {$regex: keyword, $options:'$i'}
        const all_results = await User.find({'skills.name':{$regex: new RegExp(`^${keyword}$`), $options:'$i'}}).select ('_id username profileImage skills.name skills.rank geoPoint').lean();

        // distance display in meters
        // results filter user self
        const results = all_results.filter(item => item._id != user_id);

        if(results.length === 0) return res.status(400).json({message: 'Not Matched'});
        
        // return results by ranking desc order
        if (method == 'ranking') {
            let ranking = [];
            let results_by_ranking = [];
            for (let i = 0; i < results.length; i++) {
                for (let j = 0; j < skills_length; j++) {
                    if (results[i].skills[j].name.toLowerCase() == keyword.toLowerCase()) {
                        ranking.push(results[i].skills[j].rank)
                    }
                }  
            }
            results.map(((item, index) => {
                results_by_ranking.push(Object.assign({}, item, {ranking: ranking[index]}))
            }))

            results_by_ranking.sort((a, b) => {
                return b.ranking - a.ranking;
            })

            console.log('results_by_ranking', results_by_ranking)
            return res.status(200).json({results: results_by_ranking, message: 'Results by ranking'});

        // return results by distance in meters asc order
        } else {
            const user_geoPoint = await User.findById(user_id).select('geoPoint');
            console.log('user_geoPoint', user_geoPoint)
            
            if (user_geoPoint.geoPoint.length == 0) return res.status(400).json({message: 'Please Allow Location Service'});

            let user_lat = Number(user_geoPoint.geoPoint[0]);
            let user_lon = Number(user_geoPoint.geoPoint[1]);
            let distance = [];
            let results_by_distance = [];

            // calculate distance between current user and other users
            for (let i = 0; i < results.length; i++) {
                let other_user_lat = Number(results[i].geoPoint[0])
                let other_user_lon = Number(results[i].geoPoint[1])
                distance.push(distanceInMBetweenEarthCoordinates(user_lat, user_lon, other_user_lat, other_user_lon))
            }
            
            results.map(((item, index) => {
                results_by_distance.push(Object.assign({}, item, {distance: distance[index]}))
            }))
            console.log('before sort results_by_distance', results_by_distance);
        
            results_by_distance.sort((a, b) => {
                return a.distance - b.distance;
            });

            console.log('after sort results_by_distance', results_by_distance);
            return res.status(200).json({results: results_by_distance, message: 'Results by distance'});
        }

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// @route Display PROFILE api/user/{id}/profile
// @desc Display SEARCHED USER PROFILE
// @access Public
exports.profile = async function (req, res) {
    try {
        const id = req.body.userId;
    
        const user = await User.findById(id);

        return res.status(200).json({user})

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}


// @route DELETE FRIEND api/user/{id}/deleteFriend
// @desc Delete Friend
// @access Public
exports.deleteFriend = async function (req, res) {
    try {
        const id = req.params.id;
        const other_useId = req.body.other_userId;

        let curr_user = await User.findById(id).select('username profileImage');
        let other_user = await User.findById(other_useId).select('username profileImage');

        const update = await User.findByIdAndUpdate(id, {$pull: {'friends': other_user}});
        const update_other_user = await User.findByIdAndUpdate(other_useId, {$pull: {'friends': curr_user}});
        //  test to refresh page -- user
        const user = await User.findById(id);

        return res.status(200).json({user, update, update_other_user, message: 'Delete Friend Success'})

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// @route DESTROY api/user/{id}
// @desc Delete User
// @access Public
exports.destroy = async function (req, res) {
    try {
        const id = req.params.id;
        const user_id = req.user._id;

        //Make sure the passed id is that of the logged in user
        if (user_id.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to delete this data."});

        await User.findByIdAndDelete(id);
        res.status(200).json({message: 'User has been deleted'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};