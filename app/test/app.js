var request = require('supertest')
var server = request.agent('http://localhost:3000');
var app = require('../app.js');
var User = require('../models/User');
var chai = require('chai');
var should = chai.should();
var cheerio = require('cheerio')

describe('GET /', function () {
    it('should return 200 OK', function (done) {
        request(app)
            .get('/')
            .expect(200, done);
    });
});

describe('Login /login', function () {
    it('should return login page', function (done) {
        request(app)
            .get('/login')
            .expect(200, done);
    });

    it('create user for login', createUser());
    it('Log user into site', loginUser());
    it('should delete a login test user', deleteUser());

});

describe('Live Status /Status', function () {


    it('create user for login', createUser());
    it('Log user into site', loginUser());


    it('Get Status Page', function (done) {
        server
            .get('/status')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done()
            });
    });

    it('should delete a login test user', deleteUser());

});

describe('Live Status /data', function () {


    it('create user for login', createUser());
    it('Log user into site', loginUser());


    it('Get Live Data Json', function (done) {
        server
            .get('/data')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done()
            });
    });

    it('should delete a login test user', deleteUser());

});


describe('Get Historical Page', function () {


    it('create user for login', createUser());
    it('Log user into site', loginUser());


    it('Get Status Page', function (done) {
        server
            .get('/historical')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done()
            });
    });

    it('should delete a login test user', deleteUser());

});

describe('Get Historical Data', function () {


    it('create user for login', createUser());
    it('Log user into site', loginUser());


    it('Get Historical Data Json', function (done) {
        server
            .get('/historicalSPO2Data')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done()
            });
    });

    it('should delete a login test user', deleteUser());

});

function createUser() {
    return function (done) {
        var user = new User({
            email: 'test@user.com',
            password: 'password'
        });
        user.save(function (err) {
            if (err) return done(err);
            done();
        });
    };
};

function deleteUser() {
    return function (done) {
        User.remove({ email: 'test@user.com' }, function (err) {
            if (err) return done(err);
            done();
        });
    };
};
function loginUser() {
    return function (done) {
        var csrfToken;
        server.get('/login')
        .end(function (err, res){
            if (err) return done(err);
            csrfToken = extractCsrfToken(res);
        
        server
            .post('/login')
            .send({ email: 'test@user.com', password: 'password', _csrf: csrfToken })
            .end(function(err, res) {
                if (err) return done(err);
                return done();
            });
        });
    };
};

function extractCsrfToken (res) {
  var $ = cheerio.load(res.text);
  return $('[name=_csrf]').val();
}