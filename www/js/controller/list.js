rootApp.controller('listCtrl', function($scope,$rootScope,$route,$timeout,MapFactory) {

  //	this.$onInit = function () { ... }

  debug && console.warn("Controller: listCtrl.");
  debug && console.log("View:", appData.view);
  debug && console.log("View main controller:", view);

  $scope.geoJson = $rootScope.geoJson;
  $scope.url_dito = url_dito;

  debug && console.log("List Item:" ,$scope.listItem);
  
  $scope.$on('$routeChangeSuccess', function () {
    debug && console.log("Route changed.");
    switch (appData.view) {
      case 'detail':  // create mini-map
          if(typeof $scope.listItem.geometry.coordinates !== 'undefined'){
            // $timeout(function(){MapFactory.createMiniMap('miniMap',$scope.listItem.geometry.coordinates)},3000);
            miniMap = MapFactory.createMiniMap('miniMap',$scope.listItem.geometry.coordinates[1], $scope.listItem.geometry.coordinates[0]);
          }
      break;
    } // End switch
  })  // End on route change
});  // End controller
