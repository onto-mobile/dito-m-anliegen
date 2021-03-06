rootApp.controller('listCtrl', function($scope,$rootScope,$route,$timeout,NetworkService,MapFactory) {

  //	this.$onInit = function () { ... }

  GLOBAL_ONTO.init.debug && console.warn("Controller: listCtrl.");
  GLOBAL_ONTO.init.debug && console.log("View:", appData.view);
  GLOBAL_ONTO.init.debug && console.log("View of main controller:", GLOBAL_ONTO.init.view);

  $scope.geoJson = $rootScope.geoJson;
  $scope.url_dito = GLOBAL_ONTO.init.url_dito;

  GLOBAL_ONTO.init.debug && console.log("List Item:" ,$scope.listItem);

    switch (appData.view) {
      case 'detail':  // create mini-map
      console.log();
          if(typeof $scope.listItem.geometry.coordinates !== 'undefined' && $scope.listItem.geometry.coordinates[0] > 0){
            // $timeout(function(){MapFactory.createMiniMap('miniMap',$scope.listItem.geometry.coordinates)},3000);
            miniMap = MapFactory.createMiniMap('miniMap',$scope.listItem.geometry.coordinates[1], $scope.listItem.geometry.coordinates[0]);
          }
          GLOBAL_ONTO.init.debug && console.log($scope.listItem.properties.attachmentId);
          if(typeof $scope.listItem.properties.attachmentId == 'undefined' || $scope.listItem.properties.attachmentId == ''){
            $scope.linkForImg = 'img/missing.jpg';
          } else {
            $scope.linkForImg = GLOBAL_ONTO.init.url_dito+'?action=openattachment&id='+
              $scope.listItem.properties.id+'&attachmentid='+$scope.listItem.properties.attachmentId;
          }
          // load the comments of this topic
          $timeout(function(){
        		GLOBAL_ONTO.init.debug && console.log('load comments for '+$scope.listItem.properties.id);
        		var features = [];
        		NetworkService.getComments($scope.listItem.properties.id).then(
        				function (commentsArgs) {
        						// $rootScope.pushAlert({type: 'success', msg:'Daten wurden aktualisiert.'});
        						// $rootScope.geoJson.reverse(); // latest first
        						$scope.comments = commentsArgs.comments;
        						$rootScope.$broadcast('updateComments', commentsArgs);
        					}  // End function
        		); // End then
        	});
      break;
    }; // End switch
    $scope.$on('updateModel', function (event, data) {
    	$timeout(function(){
        GLOBAL_ONTO.init.debug && console.log('reload content',data);
        $scope.geoJson = data;
    	});
    });
});  // End controller
