var Stripe = require('stripe');
var fx = require('./fx');

module.exports = function(wagner) {
    var stripe = Stripe('sk_test_lyNgKZcsygUN3SDS6dvxsxcK');
    
    wagner.factory('Stripe', function() {
        return stripe;
    });
    
    wagner.factory('fx', fx);
};
