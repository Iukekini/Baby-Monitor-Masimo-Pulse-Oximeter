/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
/*var sass = require('node-sass-middleware');*/

/**
 * Controllers (route handlers).
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var adminController = require('./controllers/admin');
var tagController = require('./controllers/tag');
var prunedController = require('./controllers/pruned');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var settings = require('./config/settings');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db, {server:{auto_reconnect:true}});
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  mongoose.disconnect();
});
mongoose.connection.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    mongoose.connect(secrets.db, {server:{auto_reconnect:true}});
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());

/*
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  debug: true,
  outputStyle: 'expanded'
}));*/

app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon-heart.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
  csrf: true,
  xframe: 'SAMEORIGIN',
  xssProtection: true
}));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.theme = settings.theme;
  next();
});
app.use(function(req, res, next) {
  if (/api/i.test(req.path)) {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/data', homeController.data);
app.get('/sampledata', homeController.sampleData);
app.get('/historicalSPO2Data', passportConf.isAuthenticated, homeController.historicalSPO2Data);
app.get('/SPO2Count', passportConf.isAuthenticated, homeController.SPO2Count);
app.get('/status', passportConf.isAuthenticated, homeController.status);
app.get('/historical', passportConf.isAuthenticated, homeController.historical);
app.get('/tags', passportConf.isAuthenticated, homeController.tags);
app.get('/pruned', passportConf.isAuthenticated, homeController.pruned);
app.get('/pushdeviceadd/:deviceToken', homeController.addDevice)
app.get('/pushnotification/:message', homeController.pushNotification)

/*
Pruned App routs
*/
app.get('/SPO2Data', passportConf.isAuthenticated, prunedController.SPO2Data);


/*
Admin App routs
*/

app.get('/admin',passportConf.isAuthenticated, adminController.accounts);
app.get('/admin/updateRights/:id/:role/:state', passportConf.isAuthenticated, adminController.updateRights);

/*
Tag App routs
*/
app.get('/tag/insertTag/:text', passportConf.isAuthenticated, tagController.insertTag);

/*
Account App Routes
*/
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);



/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
