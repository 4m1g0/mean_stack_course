var mongodb = require('mongodb');

var uri = 'mongodb://localhost:27017/example';

mongodb.MongoClient.connect(uri, function(error, db) {
    if (error) {
        console.log(error);
        process.exit(1);
    }
    
    var doc = {
        title: 'Jaws',
        year: 1975,
        director: 'Steven Spilberg',
        ratings: {
            critics: 80,
            audience: 97,
        },
        screenplay: ['Peter Benchley', 'Carl Gotlieb']
    };
    
    db.collection('movies').insert(doc, function(error, result) {
        if (error) {
            console.log(error);
            process.exit(1);
        }
        
        var query = { 'ratings.audience': {'$gte': 90}, screenplay: 'Peter Benchley'} // and
        db.collection('movies').find().toArray(function(error, docs) {
            if (error) {
                console.log(error);
                process.exit(1);
            }
            
            console.log('Found docs:');
            docs.forEach(function(doc) {
                console.log(JSON.stringify(doc));
            });
            process.exit(0);
        });
    });     
});
