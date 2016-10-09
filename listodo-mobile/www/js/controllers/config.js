app.controller('ListodoConfigCtrl', function ($scope, $rootScope, $location, localStorageService, $anchorScroll, $translate) {
    $anchorScroll();

    $scope.adress = localStorageService.get('adress');
    $scope.user = localStorageService.get('user');

    $scope.update = function () {
        localStorageService.set('adress', $scope.adress);
        localStorageService.set('user', $scope.user);
        $translate(['adress_and_user_updated', 'ok', 'done']).then(function (translations) {
          navigator.notification.alert(translations['adress_and_user_updated'], null, translations['done'], translations['ok']);
        });
    };

    $scope.reset = function () {
        $translate(['are_you_sure', 'confirm', 'reset', 'cancel']).then(function (translations) {
          navigator.notification.confirm(translations['are_you_sure'], function (buttonIndex) {
            if (buttonIndex == 1) {
              ['tasksToPublish', 'tasksToUpdate', 'tasksToRemove', 'listsToPublish', 'list'].forEach(function (val) {
                localStorageService.set(val, []);
              });
              localStorageService.set('adress', false);
              localStorageService.set('user', false);
              $location.path('/');
            }
          }, translations['confirm'], [translations['reset'], translations['cancel']])
        });
    };
});
