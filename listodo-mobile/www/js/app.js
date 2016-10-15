var app = angular.module('Listodo', ['ngRoute', 'LocalStorageModule', 'ngSanitize', 'ngTouch', 'ngCordovaNetwork', 'pascalprecht.translate']);
app.config(function ($routeProvider, localStorageServiceProvider, $translateProvider) {
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

    $translateProvider
    .useStaticFilesLoader({
       prefix: 'langs/locale-',
       suffix: '.json'
    })
    .registerAvailableLanguageKeys(['en', 'fr'], {
     'fr_*': 'fr',
     'en_*': 'en',
     '*': 'en'
    })
    .useSanitizeValueStrategy(null)
    .determinePreferredLanguage()
    .fallbackLanguage('en');
});
app.factory('serverService', function($http, localStorageService, $rootScope) {
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
      $rootScope.syncing = true;
      this.login(function () {
        $http.post(adress + '/api/sync', {
          tasksToPublish: localStorageService.get('tasksToPublish'),
          tasksToUpdate: localStorageService.get('tasksToUpdate'),
          tasksToRemove: localStorageService.get('tasksToRemove'),
          listsToPublish: localStorageService.get('listsToPublish')
        }).success(function (data) {
          localStorageService.set('lists', data);
          ['tasksToPublish', 'tasksToUpdate', 'tasksToRemove', 'listsToPublish'].forEach(function (val) {
            localStorageService.set(val, []);
          });
          $rootScope.syncing = false;
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
    $rootScope.$on('$routeChangeSuccess', function(event, next, current) {
          $rootScope.nav = $location.path().substring(1);
    });
});
