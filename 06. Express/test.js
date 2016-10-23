 var superagent = require('superagent');
 var app = require('./server');
 var assert = require('assert');
 
 describe('server', function() {
    var server;
    
    beforeEach(function() {
        server = app().listen(3000);
    });
    
    afterEach(function() {
        server.close();
    });
    
    it('prints "hello world"', function(done) {
        superagent.get('http://localhost:3000/', function(error, res) {
            assert.ifError(error);
            assert.equal(res.status, 200);
            assert.equal(res.text, "Hello World");
            done();
        });
    });
 
 });
