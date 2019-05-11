const config = require('../config.js');
var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    transporter = nodemailer.createTransport(smtpTransport({
            host: config.mailHost,
            port: config.mailPort,
            auth: {
                user: config.mailUser,
                pass: config.mailPass
            },
            secure:false,
            tls: {rejectUnauthorized: false},
            debug:true
        })
    );
   /*transporter.verify(function(error, success) {
       if (error) {
            console.log(error);
       } else {
            console.log('Server is ready to take our messages');
       }
    });*/
var sendMail = function(email, code, name, callback) {
    transporter.sendMail({
            from: 'admin@mail.thememefinder.com',
            to: email,
            subject: 'Verification code for Memefinder',
            html: 'Hey <b>' + name + '</b>,<br> Click <a href = "https://thememefinder.com/api/user/verification?email=' + email + '&code=' + code + '"> here </a> to verify your account in Thememefinder '
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
