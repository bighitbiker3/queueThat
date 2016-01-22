var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var passport = require('passport');
var SoundCloudStrategy = require('passport-soundcloud').Strategy;
var User = require('../models/user');

var SOUNDCLOUD_CLIENT_ID = '819c776ce6c1d80e0b0f7c04f19ffdb5'
var SOUNDCLOUD_CLIENT_SECRET = '8810c79a556f417bf050ba8c1472a108';

//SC Try

router.get('/', function(req, res){
  res.render('index', { user: req.user });
});


router.get('/user', ensureAuthenticated, function(req, res){
  res.json(req.user);
});


router.get('/like', ensureAuthenticated, function(req, res){
  res.redirect('https://api.soundcloud.com/me?oauth_token=' + req.user.token)
})

router.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

function getToken(req, res, next){
  if(req.isAuthenticated){
  return req.user.token
  } else{
    res.redirect('/login');
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/soundcloud')
}


// GET /auth/soundcloud
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in SoundCloud authentication will involve
//   redirecting the user to soundcloud.com.  After authorization, SoundCloud
//   will redirect the user back to this application at
//   /auth/soundcloud/callback
router.get('/auth/soundcloud',
  passport.authenticate('soundcloud'),
  function(req, res){
    // The request will be redirected to SoundCloud for authentication, so this
    // function will not be called.
  });

// GET /auth/soundcloud/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/soundcloud/callback', 
  passport.authenticate('soundcloud', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/after-auth.html');
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({'id' : id }, function(err, user) {
      done(err, user);
    });
  });


passport.use(new SoundCloudStrategy({
    clientID: SOUNDCLOUD_CLIENT_ID,
    clientSecret: SOUNDCLOUD_CLIENT_SECRET,
    callbackURL: "http://www.queuethat.com/auth/soundcloud/callback"
  },
  function(accessToken, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    user.token = accessToken;

                    user.save(function(err){
                      if (err){
                        return err;
                      }
                    });
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var user            = new User();

                    // set all of the facebook information in our user model
                    user.id    = profile.id; // set the users facebook id                   
                    user.token = accessToken; // we will save the token that facebook provides to the user                    
                    user.created  = Date.now(); // look at the passport user profile to see how names are returned
                    user.rToken = refreshToken;
                    user.displayName = profile.displayName;
                    user.permalink = profile.permalink;
                    
                    // save our user to the database
                    user.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, user);
                    });
                }

            });
        });
    }

));




/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/api', function (req, res) {
  res.send('Song API is running');
});
router.get('/api/songsqueued', function (req, res) {
  return Song.find(function(err, songs){
  	if(err){return err;}

  	else {res.send(songs)}
  }).sort({lastQueued: -1})
});

router.get('/api/songsqueued/top10', function (req, res) {
  return Song.find(function(err, songs){
  	if(err){return err;}

  	else {res.send(songs)}
  }).sort({queueTimes: -1}).limit(10)
});

router.post('/api/songsqueued', function(req, res){
    Song.findOneAndUpdate({songId: req.body.songId}, { $inc:{queueTimes: 1}, $currentDate:{lastQueued: true} },
    	function(err, song){
        if (err) {
            return console.log("Error: " + err)
        }
        if(song){
            song.queueTimes += 1;

            song.save(function(err){
            	if(err){
            		console.log(err)
            	} else {
            		console.log("updated fam")
            	}
            });
        } else {

	        var song = new Song();

	        song.artistName = req.body.artistName;
	        song.titleName = req.body.titleName;
	        song.songId = req.body.songId;
	        song.songImg = req.body.songImg;


	        song.save(function(err) {
	          if (err) {
	            console.log("Error: " + err)
	          } else {
	            console.log("created fam")
	          }
	        })

	        console.log(song);
	        return res.json({message: "SongCreated"}) 
	    }
	    return res.json({message: "Done"}) 
    })
})

exports.index = function(req, res){
  res.render('index', { title: 'ejs' });
};

module.exports = router;
