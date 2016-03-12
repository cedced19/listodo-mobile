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
        localStorageService.set('tasksToRemove', []);
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

    $scope.goTask = function (list, task) {
        $location.path('/tasks/' + encodeURI(list.name) + '/' + encodeURI(task.name));
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

    var lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish'));

    lists.forEach(function (list) {
      list.tasks.forEach(function (task) {
        if (decodeURI($routeParams.name) == task.name && decodeURI($routeParams.list) == list.name) {
          $scope.currentTask = task;
          $scope.currentTask.list = list;
        }
      });
    });

    $scope.removeTask = function () {
      var listsToPublish = localStorageService.get('listsToPublish');
      var tasksToPublish = localStorageService.get('tasksToPublish');
      var tasksToRemove = localStorageService.get('tasksToRemove');
      var lists = localStorageService.get('lists');

      tasksToRemove.push({
        name: $scope.currentTask.name,
        list: $scope.currentTask.list.name
      });
      localStorageService.set('tasksToRemove', tasksToRemove);

      var deleteFromList = function (list, listIndex, array) {
        if (list.name == $scope.currentTask.list.name) {
          list.tasks.forEach(function (task, taskIndex) {
            if (task.name == $scope.currentTask.name) {
              array[listIndex].tasks.splice(taskIndex, 1);
            }
          });
        }
      };
      lists.forEach(deleteFromList);
      localStorageService.set('lists', lists);
      listsToPublish.forEach(deleteFromList);
      localStorageService.set('listsToPublish', listsToPublish);

      tasksToPublish.forEach(function (task, index) {
        if (task.name == $scope.currentTask.name && task.list == $scope.currentTask.list.name) {
          tasksToPublish.splice(index, 1);
        }
      });
      localStorageService.set('tasksToPublish', tasksToPublish);
    };
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
      var check = $scope.lists.filter(function (list) {
        return $scope.newList.name == list.name;
      }).length;
      if (check) {
        navigator.notification.alert('You can\'t have multiple lists with the same name.', null, 'Error', 'Ok');
      } else {
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
                  displayListOffline();
              });
          });
        } else {
          displayListOffline();
        }
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
        var tasks = localStorageService.get('tasksToPublish');
        tasks.push({
          name: $scope.newTask.name,
          list: $scope.newTask.list.id,
          content: $scope.newTask.content
        })
        localStorageService.set('tasksToPublish', tasks);
      } else {
        var lists = localStorageService.get('listsToPublish');
        lists.forEach(function (value, index) {
          if (value.name == $scope.newTask.list.name) {
            lists[index].tasks.push({
              name: $scope.newTask.name,
              content: $scope.newTask.content,
              createdAt: new Date()
            });
            localStorageService.set('listsToPublish', lists);
          }
        });
      }
      $location.path('/tasks/' + encodeURI($scope.newTask.list.name) + '/' + encodeURI($scope.newTask.name));
    };

    $scope.newTask = {};
    $scope.displayTask = function() {
      if ($cordovaNetwork.isOnline()) {
          $rootScope.$login(function () {
            $http.post('http://' + localStorageService.get('adress') + '/api/tasks',  {
                name: $scope.newTask.name,
                list: $scope.newTask.list.id,
                content: $scope.newTask.content
            }).success(function (data) {
                navigator.notification.alert('The task has just been saved online!', null, 'Done', 'Ok');
                var lists = localStorageService.get('lists');
                lists.push(data);
                localStorageService.set('lists', lists);
                $location.path('/tasks/' + encodeURI($scope.newTask.list.name) + '/' + encodeURI($scope.newTask.name));
            }).error(function () {
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
