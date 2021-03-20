const path = require('path');
const sgMail = require('@sendgrid/mail');
const { resolve } = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendEmail(mailOptions) {
    return new Promise((resolve, reject) => {
        sgMail.send(mailOptions, (error, result) => {
            if (error) return reject(error);
            return resolve(result);
        });
    });
}

// calculate degree to radians
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

// calculate distance between Earth Coordinates
function distanceInMBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;
    
    var dLat = degreesToRadians(lat2-lat1);
    var dLon = degreesToRadians(lon2-lon1);
    
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);
    
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    
    return Math.round(earthRadiusKm * c * 1000);
}

module.exports = { distanceInMBetweenEarthCoordinates, sendEmail };