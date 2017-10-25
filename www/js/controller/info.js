rootApp.controller('infoCtrl', function($scope,$rootScope, $http) {
  // var templateUrl = $sce.getTrustedResourceUrl(url_info);
  // $scope.templateUrl = templateUrl;
  $http({
                    method: 	'GET',
                    url:			url_info

          }).then(
                    function onSucc(response){
                            $scope.contentValue = response.data;
                            return response.data.categories;
                    },

                    function onFail(response){
                            return response.statusText;
                    }
                  )
});
