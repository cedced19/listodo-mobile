app.controller('ListodoTasksIdCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork, $routeParams) {
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
});
