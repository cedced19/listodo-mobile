app.controller('ListodoTasksCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork) {
    $anchorScroll();

    $rootScope.nav = 'tasks';

    $scope.goTask = function (list, task) {
        $location.path('/tasks/' + encodeURI(list.name) + '/' + encodeURI(task.name));
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
});
