var app = angular.module('Listodo', ['ngRoute', 'LocalStorageModule', 'ngSanitize', 'ngTouch', 'ngCordovaNetwork']);
app.config(function ($routeProvider, localStorageServiceProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'ListodoHomeCtrl'
    })
    .when('/tasks', {
        templateUrl: 'views/list.html',
        controller: 'ListodoTasksCtrl'
    })
    .when('/tasks/:list/:name', {
        templateUrl: 'views/task.html',
        controller: 'ListodoTasksIdCtrl'
    })
    .when('/config', {
        templateUrl: 'views/config.html',
        controller: 'ListodoConfigCtrl'
    })
    .when('/creation', {
        templateUrl: 'views/creation.html',
        controller: 'ListodoCreationCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
    localStorageServiceProvider
    .setPrefix('listodo')
    .setNotify(false, false);
});
app.run(function ($rootScope, $location, $http, localStorageService) {
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
    $rootScope.$login = function (cb) {
      $http.get('http://' + localStorageService.get('adress') + '/authenticated').success(function (data) {
          if (!data.status) {
            $http.post('/login', {
              name: localStorageService.get('user').email,
              password: localStorageService.get('user').password
            }).success(cb).error(cb);
          } else {
            cb();
          }
        }).error(cb);
    };
});
