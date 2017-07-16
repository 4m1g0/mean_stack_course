describe('Nav Bar', function() {
    var injector;
    var element;
    var scope;
    var compiler;
    var httpBackend;
    
    beforeEach(function(){
        injector = angular.injector(['myApp', 'ngMockE2E']);
        intercepts = {};
        
        injector.invoke(function($rootScope, $compile, $httpBackend) {
            scope = $rootScope;
            compiler = $compile;
            httpBackend = $httpBackend;
        });
    });
    
    it ('shows logged in users name', function(done) {
        httpBackend.expectGET('/api/v1/me').respond({
            user: {profile: {username: 'Jhon'}}
        });
        
        element = compiler('<user-menu></user-menu>')(scope);
        scope.$apply();
        
        httpBackend.flush();
        assert.notEqual(element.find('.user').css('display'), 'none');
        assert.equal(element.find('.user').text().trim(), 'Current User: Jhon');
        done();
    });
});
