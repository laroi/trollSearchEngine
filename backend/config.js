require('custom-env').env('dev');
module.exports = {
    mailHost: process.env.MAIL_HOST,
    mailPort: process.env.MAIL_PORT,
    mailUser: process.env.MAIL_USER,
    mailPass: process.env.MAIL_PASS,
    appPort: process.env.APP_PORT,
    mongoHost:process.env.MONGO_HOST,
    mongoPort:process.env.MONGO_PORT,
    esHost:process.env.ES_HOST,
    esPort:process.env.ES_PORT
}
