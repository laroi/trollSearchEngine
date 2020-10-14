var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    transporter = nodemailer.createTransport(smtpTransport({
            host: 'mail.thememefinder.com',
            port: 25,
            auth: {
                user: 'admin@mail.thememefinder.com',
                pass: 'Welkom01$'
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
var sendMail = function(email, code, callback) {
    transporter.sendMail({
            from: 'admin@mail.thememefinder.com',
            to: email,
            subject: 'Verification code for Memefinder',
            html: 'Hey user, <br> Here is your <a href="#">verification</a> code for trollsearch engine app : ' + code
        }, function(error, response) {
            console.log(JSON.stringify(error), JSON.stringify(response))
           if (error) {
           callback(error)
           } else {
           callback()
           }
        });

}

sendMail('akbarali1klr@gmail.com', '1256', function(err, data){console.log(err, data)});
