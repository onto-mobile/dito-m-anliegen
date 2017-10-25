rootApp.controller('mainCtrl', function($scope,$rootScope,$q,DataToolServices,DeviceService,NetworkService,MapFactory,DataFactory) {
// alternate:
//	rootApp.controller('mainCtrl',['$scope','DataToolServices','NetworkService','MapFactory', function($scope,DataToolServices) {
this.$onInit = function () {

				debug && console.warn("Initializing mainCtrl.");

				// Enable html debug switch button
				$scope.switchDebug = function() {$rootScope.debug = !$scope.debug;}
				// We access these services from html:
				$scope.DataFactory = DataFactory;		// report4 image
//				$scope.DeviceService = DeviceService;  // report4 image
				$scope.DataToolServices = DataToolServices;  // report2 categroy

	}	// End onInit

$scope.debug && console.warn("Controller: mainCtrl.");

// CONTROLLER METHODS

$scope.updateView = function (view,item) {

		$scope.debug && console.log('--------------------------------------------------------\nView:', view);
		appData.view = view;
		$scope.view = view;
		$scope.hintMessage=pageInfo[view];

		switch (view) {

				case "home":	// actions 'HOME' and 'Cancel'

								if ($scope.view =="report1") {
											// coming from 'cancel' => reset all data
											DataFactory.initAppData();
											// $route.reload();
								 }
							 	MapFactory.showPlacemarks();
						    MapFactory.setMap('view');

				break;
				case 'detail':   // detail view, we need to pass the selected item
									$rootScope.listItem = item;
				break;
				case 'map':   // SHOW PLACEMARKS
									// MapFactory.setMap('reconnect');
									MapFactory.showPlacemarks();

				break;
				case 'report1': // HIDE PLACEMARKS

									MapFactory.hidePlacemarks();

				break;
        case 'report2':		// CATEGORY CHOOSER
                  // Update map position
                  DataToolServices.updateAppData('position.coordinates', $rootScope.baseMap.getCenter());
        break;  // End CATEGORY

        default: $scope.debug && console.log('updateView: Nothing special here.'); break;

	} // End switch
} // End update-view

$scope.typeCssClass = function (type)   {
	console.log(type);
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


	function imagePromise() {

					var response = $q.defer();
					console.log(DeviceService.getDeviceImage(source) );

					// does not wait w/o:
																				// function () { response.resolve({ success: true });		},
																				//
																				// function() { response.reject({ failed: true });    })
				  return response.promise;

				}



		imagePromise().then(

			 // success
			 function( status ) {
														console.log("XXX status succ:", status.success);
												 		console.log("imageData:", imageData);
													},


	   	 // failed
			 function( status ) {

													  console.log("XXX status fail:", status.failed);
														console.log("imageData:", imageData);

													 }) // End then




// log response:
					// DataToolServices.updateAppData('image.text','returned device image',true)
					// DataToolServices.updateAppData('image.text','failed device image',false)

// validate image
					// $scope.validateInput = function('device',listItem)

// update App data happens in validation


} else  {  // No camera device, probably a browser:
						debug && console.log('Camera plugin not suppoerted by this device.')
						alert("Die Kamera/Galerie-Funktion wird von diesem Gerät nicht unterstützt.");
	 		  	}

} // End getImage


// DEBUG: Letś say we validatet the image already as OK
$scope.appData.image.is_valid = true;


$scope.updateImagePreview = function() {
		//if (imageData.filepath.length !== 0)
		return imageData.filepath;
	}


$scope.validateInput = function(mode,file)  {

					$scope.debug && console.log('validateInput: Checking', mode);

					// do we need switch(mode) ? no.

					let result = DataToolServices.validateImage(mode,file);

									if (result == true) {
																				// valid image -> image message no more needed
																				DataToolServices.updateAppData('image.text','valid '+mode+' image',true)
																				$rootScope.imageData.file = file;
																				$scope.imageMessage = null;

									} else { // image invalid
																				// need this, else doesn't update in time
																				$scope.imageMessage = $rootScope.imageMessage;

																				if (mode="fileread") $rootScope.imageData.base64=null;  // clear memory
																				// console.log("R:",$rootScope.imageData.base64, "S:", $scope.imageData.base64, "L:", imageData.base64);
									}

}  // End validate


});  // End main controller


// alternate: }]); // End controller




	// EXAMPLES

	// Using this example for saving centerposition on route Change ? : ->
	//
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


	//Add in a crosshair as placemark
	//var crosshairIcon = L.icon({
	//    iconUrl: 'css/images/crosshair.png',
	//    iconSize:     [80, 80], // size of the icon
	//    iconAnchor:   [40, 40], // point of the icon which will correspond to marker's location
	//});
	//crosshair = new L.marker(baseMap.getCenter(), {icon: crosshairIcon, clickable:false});
	//crosshair.addTo(baseMap);
	//// Move the crosshair when user panes
	//baseMap.on('move', function(e) {
	//    crosshair.setLatLng(baseMap.getCenter());
	//});


	// Exanmple adding options:
	//var geojsonMarkerOptions = {
	//	    radius: 8,
	//	    fillColor: "#ff7800",
	//	    color: "#000",
	//	    weight: 1,
	//	    opacity: 1,
	//	    fillOpacity: 0.8
	//	};
	//
	//	L.geoJSON(someGeojsonFeature, {
	//	    pointToLayer: function (feature, latlng) {
	//	        return L.circleMarker(latlng, geojsonMarkerOptions);
	//	    }
	//	}).addTo(map);
  //
	// shortcut to stuff like add popups -- not used:
	//	L.geoJson(geoData, {
	//		onEachFeature: addPopup,
	//		}).addTo(baseMap);
	//
	//	function addPopup(feature,layer) {
	//		// console.log(feature);
	//		layer.bindPopup(feature.properties.title);
	//	}
	// };



// ================ OLD XHR =========================
/*
	var xhr = new XMLHttpRequest();
	// 'preflight' CORS request
	xhr.open("GET", url_geoData, true);
		// onload event
		xhr.onload = function() {
		geoData=JSON.parse(xhr.responseText)
		// Load data to Leaflet Map
		// We could do it just as
		// L.geoJSON(geoData).addTo(baseMap);
		// but we want only the details that we need
		// making the thing faster too
		vectorArray = geoData.features;
		for (var i = 0; i < vectorArray.length; i++) {
			var feature = vectorArray[i];
			// There may be entries w/o coordinates, entered in the Mühlheim Web Interface, so we need to test:
			if(feature.geometry != null && feature.geometry.coordinates!= null) {
				var marker = L.marker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], { title: feature.properties.title, alt:feature.properties.id});
				marker.bindPopup('<h2>'+feature.properties.title+'</h2>');
				// See http://leafletjs.com/reference-1.2.0.html#popup
				marker.addTo(baseMap);
			}
		};
		// error event
		xhr.onerror = function() {
		console.log('Error loading the placemarks!');
		};
	// perform request (async)
	xhr.send();
	*/
