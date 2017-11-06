rootApp.controller('infoCtrl', function($scope,$rootScope, $http) {
  // var templateUrl = $sce.getTrustedResourceUrl(url_info);
  // $scope.templateUrl = templateUrl;
  $scope.contentValue = '';
  $scope.loadContentInDiv = function(what) {
    var urlToLoad = '';
    switch(what) {
      case 'privacy':
        urlToLoad = url_privacy;
        $scope.linkSelected = 'privacy';
        break;
      case 'information' :
          urlToLoad = url_info;
          $scope.linkSelected = 'information';
        break;
      case 'impressum' :
          urlToLoad = url_impressum;
          $scope.linkSelected = 'impressum';
        break;
      default :
        urlToLoad = url_info;
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
});
