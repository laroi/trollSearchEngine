var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    transporter = nodemailer.createTransport(smtpTransport({
            host: 'mobinius.icewarpcloud.in',
            port: 587,
            auth: {
                user: 'akbar.ali@mobinius.com',
                pass: 'welcome123'
            },
            secure:false,
            tls: {rejectUnauthorized: false},
            debug:true
        })
    );
   transporter.verify(function(error, success) {
       if (error) {
            console.log(error);
       } else {
            console.log('Server is ready to take our messages');
       }
    });
var sendMail = function(email, code, callback) {
    transporter.sendMail({
            from: 'akbarali1klr@gmail.com',
            to: email,
            subject: 'Verification code for Troll Search Engine',
            text: 'Here is your verification code for trollsearch engine app : ' + code
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
