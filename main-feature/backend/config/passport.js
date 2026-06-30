const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = (passport) => {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.JWT_SECRET;

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (err) {
            return done(err, false);
        }
    }));
};