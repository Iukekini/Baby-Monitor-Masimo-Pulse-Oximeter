var request = require('supertest');
var app = require('../app.js');

describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /data', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/data')
      .expect(200, done);
  });
});
