rootApp.controller('listCtrl', function($scope,$rootScope,$route,$timeout,MapFactory) {

  //	this.$onInit = function () { ... }

  GLOBAL_ONTO.init.debug && console.warn("Controller: listCtrl.");
  GLOBAL_ONTO.init.debug && console.log("View:", appData.view);
  GLOBAL_ONTO.init.debug && console.log("View of main controller:", GLOBAL_ONTO.init.view);

  $scope.geoJson = $rootScope.geoJson;
  $scope.url_dito = GLOBAL_ONTO.init.url_dito;

  GLOBAL_ONTO.init.debug && console.log("List Item:" ,$scope.listItem);

    switch (appData.view) {
      case 'detail':  // create mini-map
          if(typeof $scope.listItem.geometry.coordinates !== 'undefined'){
            // $timeout(function(){MapFactory.createMiniMap('miniMap',$scope.listItem.geometry.coordinates)},3000);
            miniMap = MapFactory.createMiniMap('miniMap',$scope.listItem.geometry.coordinates[1], $scope.listItem.geometry.coordinates[0]);
          }
      break;
    } // End switch
});  // End controller
