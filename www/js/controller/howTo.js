rootApp.controller('howToCtrl', function($scope,$rootScope, $http) {
  $scope.loadContent = function() {
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
  };
  $scope.$on('updateModel', function (event, data) {
    	$timeout(function(){
        $scope.loadContent();
        $scope.$apply;
      });
  });
  $scope.loadContent();
});
