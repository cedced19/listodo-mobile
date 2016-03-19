app.controller('ListodoTasksIdCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork, $routeParams, serverService) {
    $anchorScroll();

    $rootScope.nav = '';

    var lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish')),
        beforeName;

    lists.forEach(function (list) {
      list.tasks.forEach(function (task) {
        if (decodeURI($routeParams.name) == task.name && decodeURI($routeParams.list) == list.name) {
          $scope.currentTask = task;
          $scope.currentTask.list = list;
          beforeName = task.name;
        }
      });
    });

    $scope.goCreation = function () {
        $location.path('/creation');
    };

    var removeTaskOffline = function () {
      var listsToPublish = localStorageService.get('listsToPublish');
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

      if ($scope.currentTask.list.id) {
        var tasksToPublish = localStorageService.get('tasksToPublish');
        tasksToPublish.forEach(function (task, index) {
          if (task.name == $scope.currentTask.name && task.list == $scope.currentTask.list.id) {
            tasksToPublish.splice(index, 1);
          }
        });
        localStorageService.set('tasksToPublish', tasksToPublish);
      }

      if ($scope.currentTask.id) {
        var tasksToUpdate = localStorageService.get('tasksToUpdate');
        tasksToUpdate.forEach(function (task, index) {
          if (task.id == $scope.currentTask.id) {
            tasksToUpdate.splice(index, 1);
          }
        });
        localStorageService.set('tasksToUpdate', tasksToUpdate);
      }

      $location.path('/tasks');
    };

    $scope.removeTask = function () {
      if ($cordovaNetwork.isOnline() && $scope.currentTask.list.id) {
          serverService.login(function () {
            $http.delete(serverService.adress() + '/api/tasks/' + $scope.currentTask.list.id)
            .success(function () {
                navigator.notification.alert('The task has just been deleted online!', null, 'Done', 'Ok');
                var lists = localStorageService.get('lists');
                lists.forEach(function (list, listIndex) {
                  if (list.name == $scope.currentTask.list.name) {
                    list.tasks.forEach(function (task, taskIndex) {
                      if (task.name == $scope.currentTask.name) {
                        lists[listIndex].tasks.splice(taskIndex, 1);
                      }
                    });
                  }
                });
                $location.path('/tasks');
                localStorageService.set('lists', lists);
            }).error(function () {
                removeTaskOffline();
            });
          });
      } else {
        removeTaskOffline();
      }
    };

    var updateTaskOffline = function () {
      var listsToPublish = localStorageService.get('listsToPublish');
      var lists = localStorageService.get('lists');


      var updateFromList = function (list, listIndex, array) {
        if (list.name == $scope.currentTask.list.name) {
          list.tasks.forEach(function (task, taskIndex) {
            if (task.name == beforeName) {
              array[listIndex].tasks[taskIndex].name = $scope.currentTask.name;
              array[listIndex].tasks[taskIndex].content = $scope.currentTask.content;
            }
          });
        }
      };
      lists.forEach(updateFromList);
      localStorageService.set('lists', lists);
      listsToPublish.forEach(updateFromList);
      localStorageService.set('listsToPublish', listsToPublish);

      if ($scope.currentTask.list.id) {
        var tasksToPublish = localStorageService.get('tasksToPublish');
        tasksToPublish.forEach(function (task, index) {
          if (task.name == beforeName && task.list == $scope.currentTask.list.id) {
            tasksToPublish[index].name = $scope.currentTask.name;
            tasksToPublish[index].content = $scope.currentTask.content;
          }
        });
        localStorageService.set('tasksToPublish', tasksToPublish);
      }

      if ($scope.currentTask.id) {
        var tasksToUpdate = localStorageService.get('tasksToUpdate');
        var contains = function () {
          for (var i = 0; i < tasksToUpdate.length; i++) {
              if (tasksToUpdate[i].id === $scope.currentTask.id) {
                tasksToUpdate[i].name = $scope.currentTask.name;
                tasksToUpdate[i].content = $scope.currentTask.content;
                return true;
              }
          }
          return false
        }
        if (!contains()) {
          tasksToUpdate.push({
            name: $scope.currentTask.name,
            content: $scope.currentTask.content,
            id: $scope.currentTask.id
          })
        };
        localStorageService.set('tasksToUpdate', tasksToUpdate);
      }

      beforeName = $scope.currentTask.name;
      $scope.editing = false;
    };

    $scope.updateTask = function () {
      if ($cordovaNetwork.isOnline() && $scope.currentTask.id) {
          serverService.login(function () {
            $http.put(serverService.adress() + '/api/tasks/' + $scope.currentTask.id,  {
                name: $scope.currentTask.name,
                content: $scope.currentTask.content
            }).success(function (data) {
                navigator.notification.alert('The task has just been updated online!', null, 'Done', 'Ok');
                var lists = localStorageService.get('lists');
                lists.forEach(function (list, listIndex) {
                  if (list.name == $scope.currentTask.list.name) {
                    list.tasks.forEach(function (task, taskIndex) {
                      if (task.name == $scope.currentTask.name) {
                        lists[listIndex].tasks.splice(taskIndex, 1);
                        lists[listIndex].tasks.push(data);
                      }
                    });
                  }
                });
                localStorageService.set('lists', lists);
                $scope.editing = false;
            }).error(function () {
                updateTaskOffline();
            });
          });
      } else {
        updateTaskOffline();
      }
    };
});
