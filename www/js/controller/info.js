rootApp.controller('infoCtrl', function($scope,$rootScope, $http) {
  // var templateUrl = $sce.getTrustedResourceUrl(url_info);
  // $scope.templateUrl = templateUrl;
  $scope.contentValue = '';
  $scope.what= '';
  $scope.loadContentInDiv = function(what) {
    $scope.what = what;
    var urlToLoad = '';
    switch(what) {
      case 'privacy':
        urlToLoad = GLOBAL_ONTO.init.url_privacy();
        $scope.linkSelected = 'privacy';
        break;
      case 'information' :
          urlToLoad = GLOBAL_ONTO.init.url_info();
          $scope.linkSelected = 'information';
        break;
      case 'impressum' :
          urlToLoad = GLOBAL_ONTO.init.url_impressum();
          $scope.linkSelected = 'impressum';
        break;
      default :
        urlToLoad = GLOBAL_ONTO.init.url_info();
    }
    $http({
        method: 	'GET',
        url:			urlToLoad
      }).then(
          function onSucc(response){
                  $scope.contentValue = response.data;
                  return true;
          },

          function onFail(response){
                  return false;
          }
    )
  }
  $scope.$on('updateModelInfo', function (event, data) {
      console.log('updateModelInfo');
    	$timeout(function(){
        $scope.loadContentInDiv($scope.what);
        $scope.$apply;
      });
  });

});
