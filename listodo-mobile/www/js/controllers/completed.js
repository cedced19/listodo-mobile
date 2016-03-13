app.controller('ListodoTasksCompletedCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork) {
    $anchorScroll();

    $rootScope.nav = 'completed';

    $scope.tasks = localStorageService.get('tasksToRemove');
});
