const config = require('../config.js');
console.log(config)
var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    transporter = nodemailer.createTransport({
            service:'Yandex',
            auth: {
                user: config.mailUser,
                pass: config.mailPass
            },
        });
   /*transporter.verify(function(error, success) {
       if (error) {
            console.log(error);
       } else {
            console.log('Server is ready to take our messages');
       }
    });*/
var sendMail = function(email, code, name, callback) {
    transporter.sendMail({
            from: 'admin@hypermemia.link',
            to: email,
            subject: 'Verification code for Hypermemia',
            html: 'Hey <b>' + name + '</b>,<br> Click <a href = "https://hypermemia.link/api/user/verification?email=' + email + '&code=' + code + '"> here </a> to verify your account in Hypermemia '
        }, function(error, response) {
            console.log(JSON.stringify(error), JSON.stringify(response))
           if (error) {
           callback(error)
           } else {
           callback()
           }
        });

}

module.exports = sendMail
