app.controller('ListodoTasksCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, serverService) {
    $anchorScroll();

    $rootScope.sync = function () {
        serverService.sync(function (data) {
          $scope.lists = data;
        });
    }

    $scope.goTask = function (list, task) {
        $location.path('/tasks/' + encodeURI(list.name) + '/' + encodeURI(task.name));
    };

    $scope.goCreation = function () {
        $location.path('/creation');
    };


    $scope.lists = localStorageService.get('lists').concat(localStorageService.get('listsToPublish'));
    $http.get(serverService.adress() + '/api/lists').success(function (data) {
        $scope.lists = localStorageService.get('listsToPublish').concat(data);
        localStorageService.set('lists', data);
        serverService.sync(function (data) {
            $scope.lists = data;
        });
    });
});
