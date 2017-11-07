rootApp.controller('howToCtrl', function($scope,$rootScope, $http) {
    $http({
        method: 	'GET',
        url:			GLOBAL_ONTO.init.url_faq()
      }).then(
          function onSucc(response){
                  $scope.contentValue = response.data;
                  return true;
          },

          function onFail(response){
                  return false;
          }
    );
});
