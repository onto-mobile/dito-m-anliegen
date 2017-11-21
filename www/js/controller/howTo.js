rootApp.controller('howToCtrl', function($scope,$rootScope,$timeout,$http) {
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
  $scope.$on('updateModelHowTo', function (event, data) {
    console.log('updateModelHowTo');
  	$timeout(function(){
      $scope.loadContent();
      $scope.$apply;
    });
  });
  $scope.loadContent();
});
