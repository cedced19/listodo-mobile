app.controller('ListodoTasksCompletedCtrl', function ($scope, $rootScope, $location, localStorageService, $http, $anchorScroll, $cordovaNetwork) {
    $anchorScroll();

    $scope.tasks = localStorageService.get('tasksToRemove');
});
