app.controller('ListodoCreationCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork) {
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
              content: $scope.newTask.content,
              createdAt: new Date()
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
      if ($cordovaNetwork.isOnline() && $scope.newTask.list.id) {
          $rootScope.$login(function () {
            $http.post('http://' + localStorageService.get('adress') + '/api/tasks',  {
                name: $scope.newTask.name,
                list: $scope.newTask.list.id,
                content: $scope.newTask.content
            }).success(function (data) {
                navigator.notification.alert('The task has just been saved online!', null, 'Done', 'Ok');
                var lists = localStorageService.get('lists');
                lists.forEach(function (list, index) {
                  if (list.id == $scope.newTask.list.id) {
                    lists[index].tasks.push(data);
                  }
                });
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
});
