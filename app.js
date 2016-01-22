var express = require('express');
var http = require('http')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var util = require('util');
var SoundCloudStrategy = require('passport-soundcloud').Strategy;




var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/queueThat');

var db = mongoose.connection;

var routes = require('./routes/index');

var app = express();
var server = http.createServer(app);
//Stuff for Sockets
var io = require('socket.io').listen(server);
//sockets



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//SC
app.use(session({
  secret: 'lmao',
  saveUnintialized: true,
  resave: true
}));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

//Connect to the Socket
io.on('connection', function(socket){
  socket.on('song send', function(song){
      io.emit('song send', song)
      console.log('artist on')
  })
  socket.on('artist send', function(artist){
      console.log('artist on')
      io.emit('artist send', artist)
  })

  //Disconnect
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = (process.env.PORT || 8000); 
server.listen(port, function() {
console.log("Listening on " + port);
});

module.exports = app;
