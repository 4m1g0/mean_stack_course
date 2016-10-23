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
        
        // make Category model available in tests
        Category = models.Category;
        Product = models.Product;
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

