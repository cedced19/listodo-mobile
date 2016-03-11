angular.module('Listodo', ['ngRoute', 'ngStorage', 'ngSanitize', 'ngTouch', 'ngCordovaNetwork'])
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
        lists: [],
        toPublish: {
            lists: [],
            tasks: []
        }
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
        $location.path('/tasks/' + encodeURI(task.name));
    };

    $scope.goCreation = function () {
        $location.path('/creation');
    };

    if ($cordovaNetwork.isOffline()) {
        $scope.lists = $localStorage.lists.concat($localStorage.toPublish.lists);
    } else {
        $http.get('http://' + $localStorage.adress + '/api/lists').success(function (data) {
            $scope.lists = $localStorage.toPublish.lists.concat(data);
            $localStorage.lists = data;
        }).error(function () {
            $scope.lists = $localStorage.lists.concat($localStorage.toPublish.lists);
        });
    }
}).controller('ListodoTasksIdCtrl', function ($scope, $rootScope, $location, $localStorage, $http, $anchorScroll, $cordovaNetwork, $routeParams) {
    $anchorScroll();

    $rootScope.nav = '';

    var name = decodeURI($routeParams.name);
    var lists = $localStorage.lists.concat($localStorage.toPublish.lists);

    lists.forEach(function (list) {
      list.tasks.forEach(function (task) {
        if (name == task.name) {
          $scope.currentTask = task;
          $scope.currentTask.list = list;
        }
      });
    });
}).controller('ListodoCreationCtrl', function ($scope, $rootScope, $location, $localStorage, $http, $anchorScroll, $cordovaNetwork) {
    $anchorScroll();

    $rootScope.nav = 'creation';
    $scope.lists = $localStorage.lists.concat($localStorage.toPublish.lists);

    $scope.newList = {};
    $scope.displayList = function() {
      if ($cordovaNetwork.isOnline()) {
            $http.post('/api/lists',  {
                name: $scope.newList.name
            }).success(function (data) {
                $scope.newList = {};
                $scope.lists.push(data);
                navigator.notification.alert('The list has just been saved!', null, 'Done', 'Ok');
            }).error(function () {
                navigator.notification.alert('Somethings went wrong!', null, 'Error', 'Ok');
            });
      } else {
        $localStorage.toPublish.lists.push({
          name: $scope.newList.name,
          tasks: []
        });
      }
    };

    $scope.newTask = {};
    $scope.displayTask = function() {
      if ($cordovaNetwork.isOnline()) {
          $http.post('/api/tasks',  {
              name: $scope.newTask.name,
              list: $scope.newTask.list.id,
              content: $scope.newTask.content
          }).success(function (data) {
              $scope.newTasks = {};
              location.path('/tasks/' + data.id);
              navigator.notification.alert('The task has just been saved!', null, 'Done', 'Ok');
          }).error(function () {
              navigator.notification.alert('Somethings went wrong!', null, 'Error', 'Ok');
          });
      } else {
        if ($scope.newTask.list.id) {
          $localStorage.lists.forEach(function (value, index) {
            if (value.id = $scope.newTask.list.id) {
              $localStorage.lists[index].tasks.push({
                name: $scope.newTask.name,
                content: $scope.newTask.content
              });
            }
          });
        } else {
          $localStorage.toPublish.lists.forEach(function (value, index) {
            if (value.name = $scope.newTask.list.name) {
              $localStorage.toPublish.lists[index].tasks.push({
                name: $scope.newTask.name,
                content: $scope.newTask.content
              });
            }
          });
        }
        $localStorage.toPublish.tasks.push({
          name: $scope.newTask.name,
          list: $scope.newTask.list.name,
          content: $scope.newTask.content
        });
      }
    };

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
