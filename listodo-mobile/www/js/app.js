angular.module('Listodo', ['ngRoute', 'LocalStorageModule', 'ngSanitize', 'ngTouch', 'ngCordovaNetwork'])
.config(function ($routeProvider, localStorageServiceProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'ListodoHomeCtrl'
    })
    .when('/tasks', {
        templateUrl: 'views/list.html',
        controller: 'ListodoTasksCtrl'
    })
    .when('/tasks/:name', {
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
})
.run(function ($rootScope, $location, $http, localStorageService) {
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
})
.controller('ListodoHomeCtrl', function ($scope, $rootScope, $location, localStorageService) {
    if (!localStorageService.get('adress') || !localStorageService.get('user')) {
        $rootScope.nav = 'home';
        localStorageService.set('lists', []);
        localStorageService.set('listsToPublish', []);
        localStorageService.set('tasksToPublish', []);
        $scope.start = function () {
            localStorageService.set('adress', $scope.adress);
            localStorageService.set('user', $scope.user);
            $location.path('/tasks');
        };
    } else {
        $location.path('/tasks');
    }
}).controller('ListodoTasksCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork) {
    $anchorScroll();

    $rootScope.nav = 'tasks';

    $scope.goTask = function (task) {
        $location.path('/tasks/' + encodeURI(task.name));
    };

    $scope.goCreation = function () {
        $location.path('/creation');
    };

    if ($cordovaNetwork.isOffline()) {
        $scope.lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish'));
    } else {
        $http.get('http://' + localStorageService.get('adress') + '/api/lists').success(function (data) {
            $scope.lists = localStorageService.get('listsToPublish').concat(data);
            localStorageService.get('lists') = data;
        }).error(function () {
            $scope.lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish'));
        });
    }
}).controller('ListodoTasksIdCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork, $routeParams) {
    $anchorScroll();

    $rootScope.nav = '';

    var name = decodeURI($routeParams.name);
    var lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish'));

    lists.forEach(function (list) {
      list.tasks.forEach(function (task) {
        if (name == task.name) {
          $scope.currentTask = task;
          $scope.currentTask.list = list;
        }
      });
    });
}).controller('ListodoCreationCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork) {
    $anchorScroll();

    $rootScope.nav = 'creation';
    $scope.lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish'));

    var displayListOffline = function () {
      var lists = localStorageService.get('listsToPublish')
      lists.push({
        name: $scope.newList.name,
        tasks: []
      });
      $scope.newList = {};
      localStorageService.set('listsToPublish', lists);
      $scope.lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish'));
    };

    $scope.newList = {};
    $scope.displayList = function() {
      if ($cordovaNetwork.isOnline()) {
        $rootScope.$login(function () {
            $http.post('http://' + localStorageService.get('adress') + '/api/lists',  {
                name: $scope.newList.name
            }).success(function (data) {
                $scope.newList = {};
                var lists = localStorageService.get('lists');
                lists.push(data);
                localStorageService.set('lists', lists);
                $scope.lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish'));
                navigator.notification.alert('The list has just been saved online!', null, 'Done', 'Ok');
            }).error(function () {
                navigator.notification.alert('Somethings went wrong! It will be saved offline.', null, 'Error', 'Ok');
                displayListOffline();
            });
        });
      } else {
        displayListOffline();
      }
    };

    var displayTaskOffline = function () {
      if ($scope.newTask.list.id) {
        var lists = localStorageService.get('lists');
        lists.forEach(function (value, index) {
          if (value.id = $scope.newTask.list.id) {
            lists[index].tasks.push({
              name: $scope.newTask.name,
              content: $scope.newTask.content
            });
            localStorageService.set('lists', lists);
          }
        });
      } else {
        var lists = localStorageService.get('listsToPublish');
        lists.forEach(function (value, index) {
          if (value.name = $scope.newTask.list.name) {
            lists[index].tasks.push({
              name: $scope.newTask.name,
              content: $scope.newTask.content,
              createdAt: new Date()
            });
            localStorageService.set('listsToPublish', lists);
          }
        });
      }
      var tasks = localStorageService.get('tasksToPublish');
      tasks.push({
        name: $scope.newTask.name,
        list: $scope.newTask.list.name,
        content: $scope.newTask.content
      })
      localStorageService.set('tasksToPublish', tasks);
      $location.path('/tasks/' + encodeURI($scope.newTask.name));
    };

    $scope.newTask = {};
    $scope.displayTask = function() {
      if ($cordovaNetwork.isOnline()) {
          $rootScope.$login(function () {
            $http.post('/api/tasks',  {
                name: $scope.newTask.name,
                list: $scope.newTask.list.id,
                content: $scope.newTask.content
            }).success(function (data) {
                $scope.newTasks = {};
                $location.path('/tasks/' + encodeURI(data.name));
                navigator.notification.alert('The task has just been saved online!', null, 'Done', 'Ok');
            }).error(function () {
                navigator.notification.alert('Somethings went wrong! It will be save offline.', null, 'Error', 'Ok');
                displayTaskOffline();
            });
          });
      } else {
        displayTaskOffline();
      }
    };

}).controller('ListodoConfigCtrl', function ($scope, $rootScope, $location, localStorageService, $anchorScroll) {
    $anchorScroll();

    $rootScope.nav = 'config';

    $scope.adress = localStorageService.get('adress');
    $scope.user = localStorageService.get('user');

    $scope.update = function () {
        localStorageService.set('adress', $scope.adress);
        localStorageService.set('user', $scope.user);
        navigator.notification.alert('The adress and user has just been updated!', null, 'Done', 'Ok');
    };
});
