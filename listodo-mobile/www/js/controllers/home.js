app.controller('ListodoHomeCtrl', function ($scope, $rootScope, $location, localStorageService) {
    if (!localStorageService.get('adress') || !localStorageService.get('user')) {
        $rootScope.nav = 'home';
        localStorageService.set('lists', []);
        localStorageService.set('listsToPublish', []);
        localStorageService.set('tasksToPublish', []);
        localStorageService.set('tasksToRemove', []);
        localStorageService.set('tasksToUpdate', []);
        $scope.start = function () {
            localStorageService.set('adress', $scope.adress);
            localStorageService.set('user', $scope.user);
            $location.path('/tasks');
        };
    } else {
        $location.path('/tasks');
    }
});
