const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
require("dotenv").config({path: '../.env'});

module.exports = new JwtStrategy({
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : process.env.key
}, (jwt_payload, done) => {
    if (jwt_payload.username === process.env.appuser) {
        return done(null, true)
    }
    return done(null, false)
})