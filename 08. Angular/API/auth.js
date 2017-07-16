function setupAuth(User, app) {
    var passport = require('passport');
    var FacebookStrategy = require('passport-facebook').Strategy;
    
    // high level serialize de-serialize configuration for passport
    passport.serializeUser(function(User, done) {
        done(null, User._id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.
            findOne({_id: id}).
            exec(done);
    });
    
    // Fecebook-specific
    passport.use(new FacebookStrategy(
        {
            clientID: '458736677823897',
            clientSecret: '8799af3cddb9f32a45ecadaad2138ec7',
            callbackURL: 'http://localhost:3000/auth/facebook/callback'
        },
        function(accessToken, refreshToken, profile, done) {
            if (!profile.id) {
                return done('This account has no id');
            }
            
            User.findOneAndUpdate(
                { 'data.oauth': profile.id},
                {
                    $set: {
                        'profile.username': profile.id,
                        'profile.picture': 'http://graph.facebook.com/' + profile.id.toString() + '/picture?type=large'
                    }
                },
                {'new': true, upsert: true, runValidators: true},
                function(error, user) {
                    done(error, user);
                }
            );
        }
    ));
    
    //Express middlewares
    app.use(require('express-session')({
        secret: 'This is secret'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.get('/auth/facebook',
        passport.authenticate('facebook', {scope: ['email']}));
    
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {failureRedirect: '/fail' }),
        function(req, res) {
            res.send('Welcome, ' + req.user.profile.username);
        }
    );
}

module.exports = setupAuth;
