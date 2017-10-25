rootApp.controller('mapCtrl', function($scope,$rootScope,DataService,MapFactory) {


switch($scope.view) {

		case '/':		// CREATE PLACEMARKS
		

							// LOAD PLACEMARKS json by http service:
							DataService.getJSON().then(

													function (geoData) {
																		let markerArray = MapFactory.addPlacemarks($rootScope.baseMap, geoData.features);
													}  // End function
									) // End then
		break;


		case 'map':  // SHOW PLACEMARKS

		break;

		case 'report1':  	// HIDE PLACEMARKS

							// is the layer created correctly ??

							// $rootScope.baseMap.removeLayer();

							// baseMap.markerLayer.bringToBack();
							// console.log($scope.markerLayer);



		break;



} // End switch

});  // End Controller



	// EXAMPLES

	// Using this example for saving centerposition on route Change ? : ->
	/**
	 * `routeTemplateMonitor` monitors each `$route` change and logs the current
	 * template via the `batchLog` service.
	 */
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
