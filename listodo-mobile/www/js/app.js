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
    .when('/completed', {
        templateUrl: 'views/completed.html',
        controller: 'ListodoTasksCompletedCtrl'
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
app.factory('serverService', function($http, localStorageService) {
  return {
    adress: function () {
      return 'http://' + localStorageService.get('adress');
    },
    login: function (cb) {
      var adress = this.adress();
      $http.get(adress + '/authenticated').success(function (data) {
          if (!data.status) {
            $http.post(adress + '/login', {
              email: localStorageService.get('user').email,
              password: localStorageService.get('user').password
            }).success(cb).error(cb);
          } else {
            cb();
          }
      }).error(cb);
    },
    sync: function(cb) {
      var adress = this.adress();
      this.login(function () {
        $http.post(adress + '/api/sync', {
          tasksToPublish: localStorageService.get('tasksToPublish'),
          tasksToUpdate: localStorageService.get('tasksToUpdate'),
          tasksToRemove: localStorageService.get('tasksToRemove'),
          listsToPublish: localStorageService.get('listsToPublish')
        }).success(function (data) {
          localStorageService.set('tasksToPublish', []);
          localStorageService.set('tasksToUpdate', []);
          localStorageService.set('tasksToRemove', []);
          localStorageService.set('listsToPublish', []);
          localStorageService.set('lists', data);
          cb(data);
        });
      });
    }
  };
});
app.run(function ($rootScope, $location) {
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
});
