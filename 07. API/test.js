var superagent = require('superagent');
var assert = require('assert');
var express = require('express');
var wagner = require('wagner-core');
var URL_ROOT = 'http://localhost:3000';

describe('Category API', function() {
    var server;
    var Category;
    
    before(function() {
        var app = express();
        
        //Bootstrap server
        models = require('./models')(wagner);
        require('./dependencies')(wagner);
        app.use(require('./api')(wagner));
    
        server = app.listen(3000);
        
        // make Category model available in tests
        Category = models.Category;
    });
    
    after(function(){
        server.close();
    });
    
    beforeEach(function(done){
        // empty categories before each test
        Category.remove({},function(error) {
            assert.ifError(error);
            done();
        });
    });
    
    it('can load a category by id', function(done) {
        // create a single category
        Category.create({_id: 'Electronics'}, function(error, doc) {
            assert.ifError(error);
            var url = URL_ROOT + '/category/id/Electronics';
            
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;
            
                // make sure we got {_id: 'Electronics'} back
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                
                assert.ok(result.category);
                assert.equal(result.category._id, 'Electronics');
                done();
            });
        });
    });
    
    it('Can load all categories with a certain parent', function(done) {
        var categories = [
            {_id: 'Electronics'},
            {_id: 'Phones', parent:'Electronics'},
            {_id: 'Laptops', parent:'Electronics'},
            {_id: 'Bacon'}
        ];
        
        // Create 4 categories
        Category.create(categories, function(error, categories){
            assert.ifError(error);
            
            var url = URL_ROOT + '/category/parent/Electronics';
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;
                
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                
                assert.equal(result.categories.length, 2);
                assert.equal(result.categories[0]._id, 'Laptops');
                assert.equal(result.categories[1]._id, 'Phones');
                done();
            });
        });
        
    });
});

describe('Product API', function() {
    var Caregory;
    var Product;
    var server;
    
    before(function() {
        var app = express();
        
        //Bootstrap server
        models = require('./models')(wagner);
        app.use(require('./api')(wagner));
    
        server = app.listen(3000);
        
        // make Category and product models available in tests
        var deps = wagner.invoke(function(Category, Product) {
            return {
                Category: Category,
                Product: Product
            };
        });
        
        Category = deps.Category;
        Product = deps.Product;
    });
    
    after(function(){
        server.close();
    });
    
    beforeEach(function(done){
        // empty categories before each test
        Category.remove({},function(error) {
            assert.ifError(error);
            
            // empty products before each test
            Product.remove({},function(error) {
                assert.ifError(error);
                done();
            });
        });
    });
    
    it('can load a product by id', function(done) {
        // create single product
        var PRODUCT_ID = '000000000000000000000001';
        var product = {
            name: 'LG G4',
            _id: PRODUCT_ID,
            price: {
                amount: 300,
                currency: 'USD'
            }
        };
        
        Product.create(product, function(error, doc) {
            assert.ifError(error);
            var url = URL_ROOT + '/product/id/' + PRODUCT_ID;
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                var result;
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.ok(result.product);
                assert.equal(result.product._id, PRODUCT_ID);
                assert.equal(result.product.name, 'LG G4');
                done();
            });
        });
    });
    
    it('can load all product in category with subcategories', function(done) {
        var categories = [
            {_id: 'Electronics'},
            {_id: 'Phones', parent:'Electronics'},
            {_id: 'Laptops', parent:'Electronics'},
            {_id: 'Bacon'}
        ];
        
        var products = [
            {
                name: 'LG G4',
                category: {_id: 'Phones', ancestors: ['Electronics', 'Phones']},
                price: {
                    amount: 300,
                    currency: 'USD'
                }
            },
            {
                name: 'Asus Zenbook Prime',
                category: {_id: 'Laptops', ancestors: ['Electronics', 'Laptops']},
                price: {
                    amount: 2000,
                    currency: 'USD'
                }
            },
            {
                name: 'Pork bacon',
                category: {_id: 'Bacon', ancestors: ['Bacon']},
                price: {
                    amount: 20,
                    currency: 'USD'
                }
            }
        ];
        
        Category.create(categories, function(error, categories) {
            assert.ifError(error);
            Product.create(products, function(error, products) {
                assert.ifError(error);
                var url = URL_ROOT + '/product/category/Electronics';
                superagent.get(url, function(error, res) {
                    assert.ifError(error);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);
                    });
                    assert.equal(result.products.length, 2);
                    assert.equal(result.products[0].name, 'Asus Zenbook Prime');
                    assert.equal(result.products[1].name, 'LG G4');
                    
                    // sort by price ascending
                    var url = URL_ROOT + '/product/category/Electronics?price=1';
                    superagent.get(url, function(error, res) {
                        assert.ifError(error);
                        var result;
                        assert.doesNotThrow(function(){
                            result = JSON.parse(res.text);
                        });
                        assert.equal(result.products.length, 2);
                        assert.equal(result.products[0].name, 'LG G4');
                        assert.equal(result.products[1].name, 'Asus Zenbook Prime');
                        done();
                    });
                });
            });
        });
    });
});

describe('UserAPI', function(){
    var server;
    var Category;
    var Product;
    var User;
    var PRODUCT_ID = '000000000000000000000001';
    
    before(function() {
        var app = express();
        
        app.use(function(req, res, next) {
            User.findOne({}, function(error, user) {
                assert.ifError(error);
                req.user = user;
                next();
            });
        });
        
        //Bootstrap server
        models = require('./models')(wagner);
        app.use(require('./api')(wagner));
    
        server = app.listen(3000);
        
        // make models available in tests
        var deps = wagner.invoke(function(Category, Product, User, Stripe) {
            return {
                Category: Category,
                Product: Product,
                User: User,
                Stripe: Stripe
            };
        });
        
        Category = deps.Category;
        Product = deps.Product;
        User = deps.User;
        Stripe = deps.Stripe;
    });
    
    beforeEach(function(done) {
        var categories = [
            {_id: 'Electronics'},
            {_id: 'Phones', parent:'Electronics'},
            {_id: 'Laptops', parent:'Electronics'},
            {_id: 'Bacon'}
        ];
        
        var products = [
            {
                name: 'LG G4',
                category: {_id: 'Phones', ancestors: ['Electronics', 'Phones']},
                price: {
                    amount: 300,
                    currency: 'USD'
                }
            },
            {
                _id: PRODUCT_ID,
                name: 'Asus Zenbook Prime',
                category: {_id: 'Laptops', ancestors: ['Electronics', 'Laptops']},
                price: {
                    amount: 2000,
                    currency: 'USD'
                }
            },
            {
                name: 'Pork bacon',
                category: {_id: 'Bacon', ancestors: ['Bacon']},
                price: {
                    amount: 20,
                    currency: 'USD'
                }
            }
        ];
        
        var users = [{
            profile: {
                username: 'vkarpov15',
                picture: 'http://test.com'
            },
            data: {
                oauth: 'invalid',
                cart: []
            }
        }];
        
        Category.remove({},function(error) {
            assert.ifError(error);
            
            Category.create(categories, function(error) {
                assert.ifError(error);
            });
        });
        
        // empty products before each test
        Product.remove({},function(error) {
            assert.ifError(error);
            
            Product.create(products, function(error) {
                assert.ifError(error);
            });
        });
        
        User.remove({}, function(error) {
            User.create(users, function(error) {
                assert.ifError(error);
                done();
            });
        });
    });
    
    after(function(){
        server.close();
    });
    
    it('can save users cart', function(done) {
        var url = URL_ROOT + '/me/cart';
        superagent.
            put(url).
            send({
                data: {
                    cart: [{product: PRODUCT_ID, quantity: 1}]
                }
            }).
            end(function(error, res){
                assert.ifError(error);
                assert.equal(res.status, 200);
                User.findOne({}, function(error, user) {
                    assert.ifError(error);
                    assert.equal(user.data.cart.length, 1);
                    assert.equal(user.data.cart[0].product, PRODUCT_ID);
                    assert.equal(user.data.cart[0].quantity, 1);
                    done();
                });
            });
    });
    
    it('can load users cart', function(done) {
        var url = URL_ROOT + '/me';
        
        User.findOne({}, function(error, user) {
            assert.ifError(error);
            user.data.cart = [{product: PRODUCT_ID, quantity: 1}];
            user.save(function(error){
                assert.ifError(error);
                
                superagent.get(url, function(error, res) {
                    assert.ifError(error);
                    
                    assert.equal(res.status, 200);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text).user;
                    });
                    assert.equal(result.data.cart.length, 1);
                    assert.equal(result.data.cart[0].product.name, 'Asus Zenbook Prime');
                    assert.equal(result.data.cart[0].quantity, 1);
                    done();
                });
            });
        });
    });
    
    it('can check out', 
        function(done) {
            var url = URL_ROOT + '/checkout';
            
            // setup data
            User.findOne({},
                function(error, user) {
                    assert.ifError(error);
                    user.data.cart = [{product: PRODUCT_ID, quantity: 1}];
                    user.save(
                        function(error) {
                            assert.ifError(error);
                            
                            // checkout through the API
                            superagent.
                                post(url).
                                send(
                                    {
                                        stripeToken: {
                                            number: '4242424242424242',
                                            cvc: '123',
                                            exp_month: 12,
                                            exp_year: 2017
                                        }
                                    }
                                ).
                                end(function(error, res) {
                                    assert.ifError(error);
                                    
                                    assert.equal(res.status, 200);
                                    var result;
                                    
                                    
                                    assert.doesNotThrow(function() {
                                        result = JSON.parse(res.text);
                                    });
                                    
                                    assert.ok(result.id);
                                    
                                    Stripe.charges.retrieve(result.id, function(error, charge) {
                                        assert.ifError(error);
                                        assert.ok(charge);
                                        assert.equal(charge.amount, 2000 * 100); //2000 usd
                                        done();
                                    });
                                });
                        }
                    );
                }
            );
        }
    );
    
    it('can search by text', 
        function(done) {
            var url = URL_ROOT + '/product/text/asus';
            
            // Get products whose name contains 'asus'
            superagent.get(
                url,
                function(error, res){
                    assert.ifError(error);
                    
                    assert.equal(res.status, 200);
                    
                    var results;
                    assert.doesNotThrow(function() {
                        results = JSON.parse(res.text).products;
                    });
                    
                    assert.equal(results.length, 1);
                    assert.equal(results[0]._id, PRODUCT_ID);
                    assert.equal(results[0].name, 'Asus Zenbook Prime'); 
                    done();
                }
            ); 
        }
    );
    
    
    
    
});

