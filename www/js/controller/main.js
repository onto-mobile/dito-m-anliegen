rootApp.controller('mainCtrl', function($scope,$rootScope,$q,$route,DataToolServices,DeviceService,NetworkService,MapFactory,DataFactory) {
// alternate:
//	rootApp.controller('mainCtrl',['$scope','DataToolServices','NetworkService','MapFactory', function($scope,DataToolServices) {
this.$onInit = function () {

				console.warn("Initializing mainCtrl.");

				// Enable html debug switch button
				$scope.switchDebug = function() {$rootScope.debug = !$scope.debug;}
				// We access these services from html:
				$scope.DataFactory = DataFactory;		// report4 image
//				$scope.DeviceService = DeviceService;  // report4 image
				$scope.DataToolServices = DataToolServices;  // report2 categories

	}	// End onInit

$scope.debug && console.warn("Controller: mainCtrl.");

// CONTROLLER METHODS

// updateView
//
// This is the main navigation logic which implements what to do at which view
$scope.updateView = function (view,item) {

	$scope.debug && console.log('--------------------------------------------------------\nView:', view);

	// The view value where we came from is still not updated in $scope
	// since we need it for some conditions.
	// Here, we need to update the position coordinates everytime we are
	// leaving report1, no matter to what page:
	if ($scope.view == 'report1') {
			DataToolServices.updateAppData('position.coordinates', $rootScope.baseMap.getCenter());
			// We want to recall the full selector map state so we also save the zoom
			appData.report_saved_select_zoom = $rootScope.baseMap.getZoom();
	  }


	// If we are entering a native report stage (not a saved one) then save it
	// because we want to be able to pick up that stage from anywhere else again
	switch (view) {
			case 'report1':case 'report2':case 'report3':case 'report4':case 'report5':case 'report6':
			 								debug && console.log("Saving view:", view);
											appData.report_saved_view = view;
			break;
  } // End switch



	switch (view) {

				case "home":	// actions 'HOME' and 'Cancel'
									if ($scope.view =="report1") {
												// coming from 'cancel' => reset all data
												DataFactory.initAppData();
												MapFactory.mapControl('rebuild_map');
												MapFactory.mapControl('center', cityCenter, initialZoomLevel);
												//$route.reload();
									 }
								 	 MapFactory.showPlacemarks();
				break;
				case 'detail':   // detail view, we need to pass the selected item
									$rootScope.listItem = item;
				break;
				case 'map':   // SHOW PLACEMARKS
									MapFactory.mapControl('rebuild_map');
									$rootScope.baseMap.setZoom(initialZoomLevel);
									MapFactory.showPlacemarks();
				break;
				case 'report_saved':
									// When we enter this from any other than report views (like my,map,list,info)
									// then the last saved report stage is recalled
									view = appData.report_saved_view;
									debug && console.log("Recalled report view:", view)
									$scope.report_saved_view = view;
				// !nobreak

				case 'report1':		// MAP POSITION SELECTOR
									//MapFactory.mapControl('rebuild_map');
									MapFactory.hidePlacemarks();
									// If there is already a selected position then recall it:
									if (appData.position.coordinates.lat !== "") MapFactory.mapControl('center',appData.position.coordinates,appData.report_saved_select_zoom);
				break;

        default:  $scope.debug && console.log('updateView: Nothing special here.'); break;

  } // End switch

	appData.view = view;
	$scope.view = view;
	$scope.hintMessage=pageInfo[view];

} // End update-view

$scope.typeCssClass = function (type)   {
	//$scope.debug && console.log(type);
	switch (type) {
				case 'gp.status.open':
				return 'label-danger';

				case 'gp.status.processing':
				return 'label-info';

				case 'gp.status.done':
				return 'label-success';

				case 'gp.notInOurCompetence':
				return 'label-warning';

				default :
				return 'label-default';
		}
}
$scope.categoryCssClass = function (articleLabel)   {
	var listOfCategoryNames = $rootScope.listOfCategories.map(a => a.name);
	listOfCategoryNames.reverse(); // to align the color with the server
	var indexOfCat = listOfCategoryNames.indexOf(articleLabel);
	indexOfCat++;
	return 'cat-'+indexOfCat;
}




$scope.getImage = function(source) {

if ($rootScope.device_has_cam) {  // Ensure that we are on a device with camera


 	DeviceService.getDeviceImage(source).then( function( status ){

 	// SUCCESS:

	// ! if android
	$scope.imageData.native = status.uri;

	 switch (source) {

			 case 'camera':
										 $scope.imageData.filepath = status.uri;

										 // We also want the cordova cdv:// path and the file size
										 window.resolveLocalFileSystemURL($scope.imageData.filepath, function(fileEntry) {

																			 $scope.imageData.cdv = fileEntry.toInternalURL()

																			 fileEntry.file(function(fileObj) {
																																				 $scope.imageData.type = fileObj.type;
																																				 $scope.imageData.size = fileObj.size;
																																			 });
																			 $scope.imageData.fileEntry = fileEntry;
																	 });
			 break;

			 case 'gallery':

										 // @Android: Using 'cordova filepath plugin' to resolve content:// links to file:// path
										 window.FilePath.resolveNativePath(status.uri, function onSucc(result) {

												$scope.imageData.filepath = result;

												// We also want the cordova cdv:// path and the file size
												window.resolveLocalFileSystemURL($scope.imageData.filepath, function(fileEntry) {

																		$scope.imageData.cdv = fileEntry.toInternalURL()

																		fileEntry.file(function(fileObj) {
																																			$scope.imageData.type = fileObj.type;
																																			$scope.imageData.size = fileObj.size;
																																		 });
																		$scope.imageData.fileEntry = fileEntry;
																});

											}, function onFail() { console.warn("Filepath plugin failed: ", result); }
									 );
			 break;

	 }  // End switch

	 debug && console.log("Service getDeviceImage saved $scope.imageData:", $scope.imageData);

	 // log response:
	 					// DataToolServices.updateAppData('image.text','returned device image',true)
	 					// DataToolServices.updateAppData('image.text','failed device image',false)

	 // validate image

	 					// $scope.validateImage

	 // update App data happens in validation


 	}, function( status ){

 	// FAIL:

	 console.warn( 'Service getDeviceImage:', status.failed );

 }) // End promise);



} else  {  // No camera device, probably a browser:
						debug && console.log('Camera plugin not suppoerted by this device.')
						alert("Die Kamera/Galerie-Funktion wird von diesem Gerät nicht unterstützt.");
	 		  	}

} // End getImage


$scope.validateImage = function(mode,file)  {

					$scope.debug && console.log('validateInput: Checking', mode);

					let result = DataToolServices.validateImage(mode,file);

									if (result == true) {
																				// valid image -> image message no more needed
																				DataToolServices.updateAppData('image.text','valid '+mode+' image',true)
																				$scope.imageData.file = file;
																				$scope.imageMessage = null;

									} else { // image invalid
																				// need this, else doesn't update in time
																				$scope.imageMessage = $rootScope.imageMessage;

																				if (mode="fileread") $scope.imageData.base64=null;  // clear memory
																				// console.log("R:",$rootScope.$scope.imageData.base64, "S:", $scope.$scope.imageData.base64, "L:", $scope.imageData.base64);
									}

}  // End validateImage


});  // End main controller

// alternate: }]); // End controller




// router EXAMPLE
// Using this example for doing stuff on route Change ? : ->

//* `routeTemplateMonitor` monitors each `$route` change and logs the current
//* template via the `batchLog` service.
//*
	// batchModule.factory('routeTemplateMonitor', ['$route', 'batchLog', '$rootScope',
	//   function($route, batchLog, $rootScope) {
	//     return {
	//       startMonitoring: function() {
	//         $rootScope.$on('$routeChangeSuccess', function() {
	//           batchLog($route.current ? $route.current.template : null);
	//         });
	//       }
	//     };
	//   }]);
