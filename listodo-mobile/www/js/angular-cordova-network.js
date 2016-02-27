angular.module('ngCordovaNetwork', [])
.factory('$cordovaNetwork', ['$rootScope', function ($rootScope) {
      return {
          isOnline: function () {
              if (navigator.connection == undefined) return true;
              var networkState = navigator.connection.type;
              return networkState !== Connection.UNKNOWN && networkState !== Connection.NONE;
          },

          isOffline: function () {
              if (navigator.connection == undefined) return true;
              var networkState = navigator.connection.type;
              return networkState === Connection.UNKNOWN || networkState === Connection.NONE;
          }
      };
  }])
  .run(['$injector', function ($injector) {
      $injector.get('$cordovaNetwork'); //ensure the factory always gets initialised
  }]);
