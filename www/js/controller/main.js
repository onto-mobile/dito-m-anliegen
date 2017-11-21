rootApp.controller('mainCtrl', function($scope,$rootScope,$timeout,$location,$anchorScroll,$q,$compile,DataService,DeviceService,NetworkService,MapFactory,DataFactory) {
// alternate:
//	rootApp.controller('mainCtrl',['$scope','DataService','NetworkService','MapFactory', function($scope,DataService) {
this.$onInit = function () {
		$scope.debug && console.warn("Initializing mainCtrl.");

		// Enable html debug switch button
		$scope.switchDebug = function() {$rootScope.debug = !$scope.debug;}

		// We access these services and data from html:
		$scope.DataService = DataService;  // report2 categories
		$scope.minTitle = GLOBAL_ONTO.init.minTitle;
		$scope.maxTitle = GLOBAL_ONTO.init.maxTitle;
		$scope.minNote = GLOBAL_ONTO.init.minNote;
		$scope.maxNote = GLOBAL_ONTO.init.maxNote;
		$scope.forms = {};
		var lastView = '';
		$scope.fake_send = GLOBAL_ONTO.init.fake_send;
	};	// End onInit

$scope.debug && console.warn("Controller: mainCtrl.");

//
//
//  UPDATE VIEW
//
//
// This is the main navigation logic which implements what to do at which view
$rootScope.changeView = function (view, item, from) {
	$scope.debug && console.log('--------------------------------------------------------\nView:', view);

	// Where we came from:
	//
	// At this point, view value is still not updated in $scope, and we make use of it.
	// We want to update the position coordinates everytime we are leaving the crosshair selection
	// which is report1, and we alse store the zoom, to be able to switch back to the select view anytime.
	lastView = $scope.view;

	switch (lastView) {

		case 'map': 			// Special case:
											// map -> report_saved = back to report1 position selection,keeping the position.
											// because a user looking up the map in the middle of a report, usually wants to see
											// the other nearby placemarks and then, most probably, re-adjust his position.
											// (It just feels right, and anything else fells confusing)

											// if (view=="report_saved") {
											//
											// 			GLOBAL_ONTO.init.debug && console.log("Coming from map, switching to report1 mode.")
											// 			view = "report1";
											// 			$scope.report_saved_view = view;
											// 			DataService.updateAppData('position.coordinates', $rootScope.baseMap.getCenter());
											// 			// We want to recall the full selector map state so we also save the zoom
											// 			appData.report_saved_select_zoom = $rootScope.baseMap.getZoom();
											//
											// }
			break;
			case 'report1':
					DataService.updateAppData('position.coordinates', $rootScope.baseMap.getCenter());
					// We want to recall the full selector map state so we also save the zoom
					appData.report_saved_select_zoom = $rootScope.baseMap.getZoom();
			break;


} // End switch

	// Where we are going:
	//
	switch (view) {

			// If we are entering a new report stage (not a saved one) then log the view into appData
			// because we want to be able to pick up that stage from anywhere else again
			// This need to be a separate switch.
			case 'report2':
			case 'report3':
			case 'report4':
			case 'report5':
			case 'report6':
				// for the time being the step 3 is skiped
				if(view == "report2")
						appData.currentReportStep = 2;
				else if (view == "report3")
						appData.currentReportStep = 3;
				else if (view == "report4")
						appData.currentReportStep = 3;
				else if (view == "report5")
						appData.currentReportStep = 4;
				else if (view == "report6")
						appData.currentReportStep = 5;
				GLOBAL_ONTO.init.debug && console.log("Saving view:", view);
				appData.report_saved_view = view;
				break;
		  case "home":	// actions 'HOME' and 'Cancel'
					if (lastView =="report1" || lastView =="send") {
						//  => reset data and map
						$timeout(function(){
								DataFactory.initAppData();
								$rootScope.baseMap.invalidateSize();
								MapFactory.mapControl('center',
																			GLOBAL_ONTO.init.cityCenter,
																			GLOBAL_ONTO.init.initialZoomLevel);
								MapFactory.showPlacemarks();
								MapFactory.addOnClickEventToMap();
								$rootScope.apply;
						});
					}
					break;
			case 'map':   // SHOW PLACEMARKS
					MapFactory.showPlacemarks();
					MapFactory.addOnClickEventToMap();
				  // Zoom out a little compared to the crosshair view
					// assuming we probably want to lookup nearby markers
					var zoom = appData.report_saved_select_zoom-1;

					if (isNaN(zoom) || zoom < GLOBAL_ONTO.init.minZoomLevel )
							zoom = GLOBAL_ONTO.init.minZoomLevel;
					//
					$timeout(function(){
								$rootScope.baseMap.setZoom(zoom);
								if(typeof appData.markerCurrentReport != "undefined" ) {
										appData.markerCurrentReport.remove();
								}
								if (appData.position.coordinates.lat !== "") {
										var crosshairs = L.divIcon({className:
											'fa fa-crosshairs fa-2x ti-flag-alt currentPossition'});
										var html = '<div ng-click="changeView(\'report1\')">'+
										' Ihr markierter Ort. <br/>Klicken zum Bearbeiten.</div>',
    							linkFunction = $compile(angular.element(html));

										appData.markerCurrentReport = L.marker(
													appData.position.coordinates,
													{zIndexOffset:1000})
											.bindPopup(linkFunction($scope)[0])
											.addTo($rootScope.baseMap).togglePopup();
								}
								$rootScope.apply;
					})

					break;
			case 'list':
				if (typeof from != "undefined"){
					$location.hash('list-item-'+item.properties.id);
					// call $anchorScroll()
					$anchorScroll.yOffset = 50;
      		$anchorScroll();
				}
				break;
			case 'detail':   // detail view, we need to pass the selected item
				$rootScope.listItem = item;
				$scope.fromWhichView = from;
				break;
			case 'report_saved':											// When we enter this from any other than report views (like my,map,list,info)
					// then the last saved report stage is recalled
					view = appData.report_saved_view;
					GLOBAL_ONTO.init.debug && console.log("Recalled report view:", view)
					if(view != 'report1')
						break;
					// !no-break:
			case 'report1':	// MAP POSITION SELECTOR
				MapFactory.removeOnClickEventToMap();
				appData.currentReportStep = 1;
				appData.report_saved_view = view;
				$timeout(function(){
						MapFactory.hidePlacemarks();
						if(typeof appData.markerCurrentReport != "undefined" ) {
								appData.markerCurrentReport.remove();
						}
						GLOBAL_ONTO.init.debug && console.log(item);
						if(typeof item != "undefined"){
								MapFactory.mapControl('center',item,appData.report_saved_select_zoom);
								$rootScope.apply
						} else
						// If there is already a selected position then recall it:
						if (appData.position.coordinates.lat !== "") {
								MapFactory.mapControl('center',appData.position.coordinates,appData.report_saved_select_zoom);
								$rootScope.apply
						}
				}) // End timeout
				break;
      default:
				$scope.debug && console.log('changeView: Nothing special here.');
				break;

  } // End switch

	appData.view = view;
	$scope.view = view;
	GLOBAL_ONTO.init.view = view;
	$scope.hintMessage=GLOBAL_ONTO.init.pageInfo[view];
	$scope.pageInfo = GLOBAL_ONTO.init.pageInfo;

	GLOBAL_ONTO.init.debug && console.warn('view ',view);

	// SET ROUTE by routeProvider $location service
	$location.path(view);

	// What we do after $location has changed
	//
	// Set viewport view template ng-show
	//
	switch (view) {
			case 'home':
			case 'map':
			case 'report1':
						$scope.map_view_active = true;
						break;
			default:
				$scope.map_view_active = false;
	} // End switch

} // END CHANGE VIEW
$scope.reloadContent=function() {
	$timeout(function(){
		GLOBAL_ONTO.init.debug && console.log('MAin reload content');
		var features = [];
		NetworkService.getGeoJSON().then(
				function (geoData) {
						$rootScope.pushAlert({type: 'success', msg:'Data successfully updated.'});
						$rootScope.geoJson = geoData.features;
						$rootScope.geoJson.reverse(); // latest first
						features = $rootScope.geoJson;
						$rootScope.baseMap.removeLayer(GLOBAL_ONTO.init.markerLayer);
						markerArray = thisfactory.addPlacemarks(geoData.features);
						$rootScope.$broadcast('updateModel', features);
					}  // End function
		); // End then
	});
};
$scope.$watch('online', function(newStatus) {
	if(!$rootScope.firstTime && newStatus	)
		$timeout(function(){
			console.log("back on line");
			$rootScope.baseMap._resetView($rootScope.baseMap.getCenter(), $rootScope.baseMap.getZoom(), true);

			NetworkService.getCategories().then(function(cat){
				$rootScope.listOfCategories = receivedCategories;
			});

			$rootScope.apply
			$scope.reloadContent();
		});
		else {
			$rootScope.firstTime = false;
		}
});

// This is an ansync promise/event thing, thus a little complicated.
// Also calling separate methods to examine and validate the image features.
//
// @param: 		mode: 'camera' or 'gallery' (determines which set of photoOptions will be passed to the plugin)
// @return:		Method updates appData.image and all properties of imageData (see makeImageData)
//
$scope.getImage = function(mode) {

	if ($rootScope.device_has_cam) {  // Ensure that we are on a device with camera

	// Internal helper function for camera/gallery image return
	// This is all about $scope so we can't put it into a factory
		makeImageData = function (filepath)   {
				// We want the cordova cdv:// path and the file size
				window.resolveLocalFileSystemURL(filepath, function(fileEntry) {
						// We need to resolve the imagData filepathes to angular scope
						// because they are used for the preview, and we also want to
						// do some validation.
						// The solution is $scope.appply in an unconfigured timeout
						// which then will trigger on next angular digest cycle.
						fileEntry.file(function(fileObj) {
								$timeout(function(){
										$scope.imageData.filepath = filepath;
										$scope.imageData.cdv = fileEntry.toInternalURL()
										$scope.imageData.type = fileObj.type;
										$scope.imageData.size = fileObj.size;
										$scope.imageData.fileEntry = fileEntry;
										GLOBAL_ONTO.init.debug && console.log("makeImageData saved to $scope:", $scope.imageData);

										// log successful response
										DataService.updateAppData('image.text','returned device image',true)

										// validate image and update appData
										$scope.validateImage('device', { type: $scope.imageData.type, size: $scope.imageData.size } );

								}) // End teimout

					}); // End fileEntry
				}); // End resolve URL
		} // End makeImageData


	// Get picture from device:
	DeviceService.getDeviceImage(mode).then( function( status ){

	// SUCCESS:

			$scope.imageData.native = status.uri;  // only for android ?
			// log successful response:
			DataService.updateAppData('image.text','returned device image',true)

			// Retrieve information about the image (filepath, size etc)
			// and put them into imageData
			//
			switch (mode) {

					case 'camera':
												// We need to get things into angular scope digest cylce
												// makeImageData will set $scope.imageData.filepath = status.uri
												makeImageData(status.uri);
					break;
					case 'gallery':
											GLOBAL_ONTO.init.debug && console.log("mode gallery, status",status);
											GLOBAL_ONTO.init.debug && console.log("window.FilePath ",window.FilePath);
											if(typeof window.FilePath != 'undefined') {
												 // @Android: Using 'cordova filepath plugin' to resolve content:// links to file:// path
												 window.FilePath.resolveNativePath(status.uri,

															function onSucc(result) {
																	// $scope.imageData.filepath = result but we do this in makeImageData()
																	makeImageData(result)
															 },
															function onFail(result) {
																GLOBAL_ONTO.init.debug && console.warn("Filepath conversion failed: ", result);
																DataService.updateAppData('image.text','failed fileptah conversion')
															}
												 ); // End resolve Path
											} else {
												// ios case
												var uri = status.uri;
												uri=uri.replace('assets-library://','cdvfile://localhost/assets-library/');
												GLOBAL_ONTO.init.debug && console.log("uri",uri);
												makeImageData(uri);
											}
					break;

			}  // End switch


// continuing: DeviceService.getDeviceImage(mode).then( function( status ){

		 	}, function( status ){

// FAIL:
			GLOBAL_ONTO.init.debug && console.warn( 'Service getDeviceImage:', status.failed );
			// log failure:
			DataService.updateAppData('image.text','failed device image',false)
			$scope.imageMessage = "Das Bild konnte nicht geladen werden.";

	 }) // End DeviceService.getDeviceImage(mode).then


	 } else  {  // No camera device, probably a browser platform:
						GLOBAL_ONTO.init.debug && console.log('Camera plugin not suppoerted by this device.');
						$rootScope.pushAlert({type: 'danger', msg:'Die Kamera/Galerie-Funktion wird von diesem Gerät nicht unterstützt.'});

	}

}; // End getImage


// Validate image
// We need this as seperate scope function (and not purely service) because the html
//  is based on scope update. The method will be used 2 ways:
// (1) in the html for filereader; and (2) in makeImageData for device images
// Basically, it calls DataService.examineImage, updates appData, and then does some
// user feedback.
//
// @param	mode:	"filreread" for browser call (via directive)
// @param	mode:	"device" for call from device
// @param	item:	for file-read, the files[0] object returned from the file-reader
// @param	item:	for device, the 2 needed properties 'type' and 'size' are taken from makeImageData
// @return:			true/false (valid or invalid)
//
$scope.validateImage = function(mode,item)  {

			GLOBAL_ONTO.init.debug && console.log('validateImage: Checking image input in mode:', mode);

			var imgdata = DataService.examineImage(mode,item);

			if (imgdata.valid == true) {

						DataService.updateAppData('image.text','valid '+mode+' image',true)
						// save some useful data into the imData object
						$scope.imageData.file = item;  // the full fileentry
						$scope.imageData.type = imgdata.type; // standardized file ending
						// valid image -> html image message no more needed
						$scope.imageMessage = null;

      } else { // image invalid, inform user by html message

					switch (imgdata.text) {

						case 'file too large':
						$scope.imageMessage = "Das Bild ist " + imgdata.sizeKB + " Kilobyte groß.\nSie können nur Dateien bis maximal " + imgdata.maxKB + " Kilobyte anhängen.";
						break;
						case 'unsupported format':
				  	$scope.imageMessage = 'Der Dateityp "' + imgdata.type + '" wird nicht unterstützt.\nSie können nur die Bildformate ' + GLOBAL_ONTO.init.imageTypesAllowed + ' anhängen.';
					  break;
					 } // End switch

					DataService.updateAppData('image.text',imgdata.text,false);

					if (mode="fileread") $scope.imageData.base64=null;  // clear memory
					// console.log("R:",$rootScope.$scope.imageData.base64, "S:", $scope.$scope.imageData.base64, "L:", $scope.imageData.base64);

		}  // End if valid

return imgdata.valid;

};  // End validateImage



$scope.resetImage = function() {

	$timeout(function(){
												DataFactory.resetData('image');
												$scope.imageData = $rootScope.imageData;
												$scope.imageMessage = "";
												$rootScope.apply
											}) // End timeout
} // End resetImage

// Validate text input and update mandatory counter.
// It also sets the angular $valid state of the form field
// using an 'forms' object which is necessary to have the
// input in scope (else, on page entry, it is not).
// (I removed $dirty / $valid checks later and put a custom
// management but let's still keep it that way as it's useful)
// Note that for ẃarning visuals, there's $scope.validState and
// specific conditions on HTML tags in report and navbar.
// Only all components together achieve the desired behavior
// for navigation, and warning messages.
//
// @param item: Keyword for input field element (title, email).
//
$scope.validateInput = function(item)  {

	switch(item) {

		case 'title':
							GLOBAL_ONTO.init.debug && console.log("Validating: title");

							if (typeof (appData.title.text.length) == 'undefined') appData.title.text.length=0;
							var length = appData.title.text.length;
							result = (GLOBAL_ONTO.init.minTitle <= length && length <= GLOBAL_ONTO.init.maxTitle);

							if ((result == false) && (appData.title.is_valid == true)) DataService.updateMandatoryCounter("-");
							if ((result == true) && (appData.title.is_valid == false)) DataService.updateMandatoryCounter("+");
							appData.title.is_valid = result;
							// $scope.forms.titleForm.title.$setValidity('required',result);
							$scope.increaseDirtyness('title');
		break;

		case 'note':
							GLOBAL_ONTO.init.debug && console.log("Validating: note");

							if (typeof (appData.note.text.length) == 'undefined') appData.note.text.length=0;
							var length = appData.note.text.length;

							result = (GLOBAL_ONTO.init.minNote <= length && length <= GLOBAL_ONTO.init.maxNote);

							if ((result == false) && (appData.note.is_valid == true)) DataService.updateMandatoryCounter("-");
							if ((result == true) && (appData.note.is_valid == false)) DataService.updateMandatoryCounter("+");
							appData.note.is_valid = result;
							// $scope.forms.titleForm.title.$setValidity('required',result);
							$scope.increaseDirtyness('note');
		break;

		case 'email':

							GLOBAL_ONTO.init.debug && console.log("Validating: email");

							result=GLOBAL_ONTO.init.emailRegExpr.test(appData.email.text);
							// debug && console.log("New result:",result);
							if ((result == false) && (appData.email.is_valid == true)) DataService.updateMandatoryCounter("-");
							if ((result == true) && (appData.email.is_valid == false)) DataService.updateMandatoryCounter("+");
							appData.email.is_valid = result;
							// need this for correct feedback:
							if (result == false) appData.email.dirty = 2;
							return result;

		break;

	} // End switch
}; // End validateInput


// helper for blending in / out HTML navigation depending on validation state
// @param item: keyword for input form element
$scope.validState = function(item)  {

	switch (item) {

		case 'title': 	// for the navbar switch, we need to catch the case when minlength is exceeded, to activate the nav again
						 				result = ((appData.title.text.length) >= GLOBAL_ONTO.init.minTitle && (appData.title.text.length <= GLOBAL_ONTO.init.maxTitle))
		break;
		case 'note': 	// for the navbar switch, we need to catch the case when minlength is exceeded, to activate the nav again
						 				result = ((appData.note.text.length) >= GLOBAL_ONTO.init.minNote && (appData.note.text.length <= GLOBAL_ONTO.init.maxNote))
		break;
		case 'email':		// This switches the status indicator of email input field (fa icon)
										result=GLOBAL_ONTO.init.emailRegExpr.test(appData.email.text);
										// debug && console.log("Email valid:", result);
		break;
		case 'report6':	// This is about when showing the "ABSENDEN" button on report6, which is special
										// because the email input will be validatet onBlur, maybe not yet.
										// So we can't just poll appData here. We need to show the button just-in-time.
										result=(GLOBAL_ONTO.init.emailRegExpr.test(appData.email.text)) && (appData.check_privacy_accepted.is_valid);
		break;

	} // End switch

	return result;

}; // End validState

$scope.increaseDirtyness = function(item)  {
			appData[item].dirty += 1;
			// debug && console.log("Dirty:", appData[item].dirty);
};
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
};
$scope.translateStatus = function (type)   {
	//$scope.debug && console.log(type);
	switch (type) {
				case 'gp.status.open':
				return 'ist neu';

				case 'gp.status.processing':
				return 'in Bearbeitung';

				case 'gp.status.done':
				return 'erledigt';

				case 'gp.notInOurCompetence':
				return 'nicht zuständig';

				default :
				return '';
		}
};
$rootScope.getNumberOfCategory = function (articleLabel){
	// var listOfCategoryNames = $rootScope.listOfCategories.map(a => a.name);
	var listOfCategoryNames  = [];
	for(var i = 0, length = $rootScope.listOfCategories.length ;
				i< length;i++) {
				listOfCategoryNames.push($rootScope.listOfCategories[i].name);
	}

	listOfCategoryNames.reverse(); // to align the color with the server
	var indexOfCat = listOfCategoryNames.indexOf(articleLabel);
	return ++indexOfCat;
};

$scope.categoryCssClass = function (articleLabel)   {
	return 'cat-'+this.getNumberOfCategory(articleLabel);
};

$scope.categoryCssClassColor = function (articleLabel)   {
	return 'color-'+this.getNumberOfCategory(articleLabel);
};

$scope.closeApp = function() {
			// Here, should be something like
			// DeviceService.clearCameraCache();

			if (navigator.app) navigator.app.exitApp();

			if (navigator.device) navigator.device.exitApp();

			if (!window.cordova) {
							alert('Cannot close a browser :(');
							this.changeView('home');
			}
};

});  // End main controller


// ================================== end file =============================
