module.exports = function(config) {
    config.set({
        files: [
            'http://code.jquery.com/jquery-1.11.3.js',
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular.js',
            // ngMockE2E
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-mocks.js',
            './app.js',
            './tests.js'
        ],
        frameworks: ['mocha', 'chai'],
        browsers: ['Chrome'],
        proxies: {
            '/': 'http://localhost:3000'
        }
    });
};
