app.controller('ListodoConfigCtrl', function ($scope, $rootScope, $location, localStorageService, $anchorScroll) {
    $anchorScroll();

    $rootScope.nav = 'config';

    $scope.adress = localStorageService.get('adress');
    $scope.user = localStorageService.get('user');

    $scope.update = function () {
        localStorageService.set('adress', $scope.adress);
        localStorageService.set('user', $scope.user);
        navigator.notification.alert('The adress and user has just been updated!', null, 'Done', 'Ok');
    };

    $scope.reset = function () {
        navigator.notification.confirm('Are you sure?', function () {
          localStorageService.set('lists', []);
          localStorageService.set('listsToPublish', []);
          localStorageService.set('tasksToPublish', []);
          localStorageService.set('tasksToRemove', []);
          localStorageService.set('tasksToUpdate', []);
          localStorageService.set('adress', false);
          localStorageService.set('user', false);
          $location.path('/');
        }, 'Comfirm', ['Reset', 'Cancel'])
    };
});
