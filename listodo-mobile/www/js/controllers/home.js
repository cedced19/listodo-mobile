app.controller('ListodoHomeCtrl', function ($scope, $rootScope, $location, localStorageService) {
    if (!localStorageService.get('adress') || !localStorageService.get('user')) {
        $rootScope.nav = 'home';
        ['tasksToPublish', 'tasksToUpdate', 'tasksToRemove', 'listsToPublish', 'list'].forEach(function (val) {
          localStorageService.set(val, []);
        });
        $scope.start = function () {
            localStorageService.set('adress', $scope.adress);
            localStorageService.set('user', $scope.user);
            $location.path('/tasks');
        };
    } else {
        $location.path('/tasks');
    }
});
