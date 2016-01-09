﻿angular.module('Listodo', ['ngRoute', 'ngStorage', 'ngSanitize', 'ngTouch'])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'ListodoHomeCtrl'
    })
    .when('/tasks', {
        templateUrl: 'views/tasks-list.html',
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
        tasks: [],
        lists: []
    });


    if (!$localStorage.adress) {
        $rootScope.nav = 'home';

        $scope.start = function () {
            $localStorage.adress = $scope.adress;
            $localStorage.user = $scope.user;
            $location.path('/tasks');
        };
    } else {
        $location.path('/tasks');
    }
}).controller('ListodoTasksCtrl', function ($scope, $rootScope, $location, $localStorage, $http, $anchorScroll) {
    $anchorScroll();

    $rootScope.nav = 'tasks';
    $http.get('http://' + $localStorage.adress + '/api/tasks').success(function (data) {
        $scope.items = data;

        $scope.goTask = function (task) {
            $location.path('/tasks/' + item.id);
        };

    }).error(function () {
        $location.path('/offline');
    });
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