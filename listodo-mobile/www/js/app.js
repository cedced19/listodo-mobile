angular.module('Listodo', ['ngRoute', 'ngStorage', 'ngSanitize', 'ngTouch', 'ngCordova.plugins.network'])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'ListodoHomeCtrl'
    })
    .when('/tasks', {
        templateUrl: 'views/list.html',
        controller: 'ListodoTasksCtrl'
    })
    .when('/config', {
        templateUrl: 'views/config.html',
        controller: 'ListodoConfigCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
})
.run(function ($rootScope, $location) {
    $rootScope.$menu = {
        show: function () {
            if ($rootScope.nav != 'home') {
                document.getElementsByTagName('body')[0].classList.add('with-sidebar');
            }
        },
        hide: function (path) {
            document.getElementsByTagName('body')[0].classList.remove('with-sidebar');
            if (path) {
                $location.path('/' + path);
            }
        }
    };
})
.controller('ListodoHomeCtrl', function ($scope, $rootScope, $location, $localStorage) {
    $localStorage.$default({
        adress: '',
        user: {
            email: '',
            password: ''
        },
        lists: []
    });


    if (!$localStorage.adress || !$localStorage.user) {
        $rootScope.nav = 'home';

        $scope.start = function () {
            $localStorage.adress = $scope.adress;
            $localStorage.user = $scope.user;
            $location.path('/tasks');
        };
    } else {
        $location.path('/tasks');
    }
}).controller('ListodoTasksCtrl', function ($scope, $rootScope, $location, $localStorage, $http, $anchorScroll, $cordovaNetwork) {
    $anchorScroll();

    $rootScope.nav = 'tasks';

    $scope.goTask = function (task) {
        $location.path('/tasks/' + task.id);
    };

    $scope.Creation = function () {
        $location.path('/creation');
    };
    if ($cordovaNetwork.isOnline()) {
        $scope.lists = $localStorage.lists;
    } else {
        $http.get('http://' + $localStorage.adress + '/api/lists').success(function (data) {
            $scope.lists = data;
            $localStorage.lists = data;
        }).error(function () {
            $scope.lists = $localStorage.lists;
        });
    }
}).controller('ListodoConfigCtrl', function ($scope, $rootScope, $location, $localStorage, $anchorScroll) {
    $anchorScroll();

    $rootScope.nav = 'config';

    $scope.adress = $localStorage.adress;
    $scope.user = $localStorage.user;

    $scope.update = function () {
        $localStorage.adress = $scope.adress;
        $localStorage.user = $scope.user;
        navigator.notification.alert('The adress and user has just been updated!', null, 'Done', 'Ok');
    };
});