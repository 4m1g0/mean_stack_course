var Stripe = require('stripe');

module.exports = function(wagner) {
    var stripe = Stripe('sk_test_lyNgKZcsygUN3SDS6dvxsxcK');
    
    wagner.factory('Stripe', function() {
        return stripe;
    });
    
    return {
        Stripe: stripe
    };
};
