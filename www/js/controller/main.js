rootApp.controller('mainCtrl', function($scope,$rootScope,$timeout,$route,$location,$q,DataToolServices,DeviceService,NetworkService,MapFactory,DataFactory) {
// alternate:
//	rootApp.controller('mainCtrl',['$scope','DataToolServices','NetworkService','MapFactory', function($scope,DataToolServices) {
this.$onInit = function () {

				console.warn("Initializing mainCtrl.");

				// Enable html debug switch button
				$scope.switchDebug = function() {$rootScope.debug = !$scope.debug;}
				// We access these services from html:
				$scope.DataToolServices = DataToolServices;  // report2 categories
				// $scope.DataFactory = DataFactory;

	}	// End onInit

$scope.debug && console.warn("Controller: mainCtrl.");

//
//
//  UPDATE VIEW
//
//
// This is the main navigation logic which implements what to do at which view
$scope.updateView = function (view,item) {

	$scope.debug && console.log('--------------------------------------------------------\nView:', view);

	// Where we came from:
	//
	// At this point, view value is still not updated in $scope, and we make use of it.
	// We want to update the position coordinates everytime we are leaving the crosshair selection
	// which is report1, and we alse store the zoom, to be able to switch back to the select view anytime.
	if ($scope.view == 'report1') {
			DataToolServices.updateAppData('position.coordinates', $rootScope.baseMap.getCenter());
			// We want to recall the full selector map state so we also save the zoom
			appData.report_saved_select_zoom = $rootScope.baseMap.getZoom();
	  }

	// Where we are going:
	//
	// If we are entering a new report stage (not a saved one) then log the view into appData
	// because we want to be able to pick up that stage from anywhere else again
	switch (view) {
			case 'report1':case 'report2':case 'report3':case 'report4':case 'report5':case 'report6':
			 								debug && console.log("Saving view:", view);
											appData.report_saved_view = view;
			break;
  } // End switch


	switch (view) {

			  case "home":	// actions 'HOME' and 'Cancel'
											$rootScope.baseMap.invalidateSize();
											MapFactory.showPlacemarks();

											if ($scope.view =="report1") {
												// coming from 'cancel' => reset data and map
												DataFactory.initAppData();
												MapFactory.mapControl('center', cityCenter, initialZoomLevel);
											}
				break;
				case 'detail':   // detail view, we need to pass the selected item
											$rootScope.listItem = item;
				break;
				case 'map':   // SHOW PLACEMARKS
											MapFactory.showPlacemarks();
											// Zoom out a little compared to the crosshair view
											// assuming we probably want to lookup nearby markers
											let zoom = appData.report_saved_select_zoom-1;
											if ( zoom < minZoomLevel ) zoom = minZoomLevel;
											$rootScope.baseMap.setZoom(zoom);
				break;
				case 'report_saved':
											// When we enter this from any other than report views (like my,map,list,info)
											// then the last saved report stage is recalled
											view = appData.report_saved_view;
											debug && console.log("Recalled report view:", view)
											$scope.report_saved_view = view;
				// !nobreak!

				case 'report1':		// MAP POSITION SELECTOR
											MapFactory.hidePlacemarks();
											// If there is already a selected position then recall it:
											if (appData.position.coordinates.lat !== "") MapFactory.mapControl('center',appData.position.coordinates,appData.report_saved_select_zoom);
				break;

        default:  		$scope.debug && console.log('updateView: Nothing special here.'); break;

  } // End switch

	appData.view = view;
	$scope.view = view;
	$scope.hintMessage=pageInfo[view];

	// SET ROUTE by routeProvider $location service
	$location.path(view);

	// Set viewport view template ng-show
	switch (view) {

			case 'home':case 'map':case 'report1': $scope.map_view_active = true;
			break;

			default: $scope.map_view_active = false;
			break;

	} // End switch


} // END UPDATE VIEW



// CAMERA / GALLERY
//
// mode: 'camera' or 'gallery'
// This parameter determines which set of photoOptions will be passed to the plugin
//
$scope.getImage = function(mode) {

if ($rootScope.device_has_cam) {  // Ensure that we are on a device with camera

// Internal helper function for camera/gallery image return
// This is all about $scope so we can't put it into a factory
	makeImageData = function (result)   {
			// We want the cordova cdv:// path and the file size
			window.resolveLocalFileSystemURL(result, function(fileEntry) {
					// We need to resolve the imagData filepathes to angular scope
					// because they are used for the preview, and we also want to
					// do some validation.
					// The solution is $scope.appply in an unconfigured timeout
					// which then will trigger on next angular digest cycle.
					fileEntry.file(function(fileObj) {
							$timeout(function(){
									$scope.imageData.filepath = result;
									$scope.imageData.cdv = fileEntry.toInternalURL()
									$scope.imageData.type = fileObj.type;
									$scope.imageData.size = fileObj.size;
									$scope.imageData.fileEntry = fileEntry;
									$scope.apply();
									debug && console.log("makeImageData saved to $scope:", $scope.imageData);

									// log successful response
									DataToolServices.updateAppData('image.text','returned device image',true)

									// validate image and update appData
									$scope.validateImage
							}) // End teimout

				}); // End fileEntry
			}); // End resolve URL
	} // End makeImageData


// Get picture from device:

DeviceService.getDeviceImage(mode).then( function( status ){

// SUCCESS:

			$scope.imageData.native = status.uri;  // only for android ?
			// log successful response:
			DataToolServices.updateAppData('image.text','returned device image',true)

			// Retrieve information about the image (filepath, size etc)
			// and put them into imageData
			//
			switch (mode) {

					case 'camera':
												// $scope.imageData.filepath = status.uri
												// but we need to get things into angular scope digest cylce
												makeImageData(status.uri);
					break;
					case 'gallery':
											 // @Android: Using 'cordova filepath plugin' to resolve content:// links to file:// path
											 window.FilePath.resolveNativePath(status.uri,

														function onSucc(result) {
																// $scope.imageData.filepath = result but we do this in makeImageData()
																makeImageData(result)
														 },
														function onFail() {
															console.warn("Filepath conversion failed: ", result);
															DataToolServices.updateAppData('image.text','failed fileptah conversion')
														}
											 ); // End resolve Path
					break;

			}  // End switch


// DeviceService.getDeviceImage(mode).then( function( status ){

		 	}, function( status ){

// FAIL:

			console.warn( 'Service getDeviceImage:', status.failed );
			// log failure:
			DataToolServices.updateAppData('image.text','failed device image',false)

		 }) // End promise);



} else  {  // No camera device, probably a browser platform:
				debug && console.log('Camera plugin not suppoerted by this device.')
				alert("Die Kamera/Galerie-Funktion wird von diesem Gerät nicht unterstützt.");
 		  	}

} // End getImage



// Validate image
// We need this in scope and as seperate function because it will be used 2 ways:
// (1) in the html for filereader; and (2) in makeImageData for device images
// Basically, it calls DataToolServices.validateImage, updates appData and
// then cares for the user feedback.
//
$scope.validateImage = function(mode,item)  {

			$scope.debug && console.log('validateInput: Checking image input in mode:', mode);

			let response = DataToolServices.validateImage(mode,item);

			if (response.result == true) {

						DataToolServices.updateAppData('image.text','valid '+mode+' image',true)
						$scope.imageData.file = item;
						// valid image -> html image message no more needed
						$scope.imageMessage = null;

      } else { // image invalid

					switch (response.text) {

						case 'file too large':
						$scope.imageMessage = "Das Bild ist " + sizeKB + " Kilobyte groß.\nSie können nur Dateien bis maximal " + maxKB + " Kilobyte anhängen.";
						break;
						case 'unsupported format':
				  	$scope.imageMessage = 'Der Dateityp "' + type + '" wird nicht unterstützt.\nSie können nur die Bildformate ' + imageTypesAllowed + ' anhängen.';
					  break;

					 } // End switch


					DataToolServices.updateAppData('image.text',response.text,false);

					if (mode="fileread") $scope.imageData.base64=null;  // clear memory
					// console.log("R:",$rootScope.$scope.imageData.base64, "S:", $scope.$scope.imageData.base64, "L:", $scope.imageData.base64);

		}  // End result

return result;

}  // End validateImage



$scope.resetImage = function() {


	$timeout(function(){

			DataFactory.resetData('image');
			$scope.imageData = $rootScope.imageData;
			$scope.imageMessage = "";
			$scope.apply;
	}) // End timeout

} // End resetImage



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



});  // End main controller


// ================================== end file =============================
