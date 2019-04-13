require('custom-env').env('dev');
module.exports = {
    mailHost: process.env.MAIL_HOST,
    mailPort: process.env.MAIL_PORT,
    mailUser: process.env.MAIL_USER,
    mailPass: process.env.MAIL_PASS,
    appPort: process.env.APP_PORT
}
