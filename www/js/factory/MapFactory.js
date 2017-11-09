// -----------------------------------------------------------------------------

rootApp.factory('MapFactory', function($rootScope,$timeout,NetworkService) {

// -----------------------------------------------------------------------------

thisfactory = {

  createBaseMap: function() {
        baseMap = L.map('mapid',{
                                  center  : GLOBAL_ONTO.init.mapCenter(),
                                  zoom    : GLOBAL_ONTO.init.initialZoomLevel,
                                  zoomControl : false
                                 });

          // var baseMap = L.map('mapid').setView([mapCenter.lat, mapCenter.lng], initialZoomLevel);
          // var baseMap = L.map('mapid').locate({setView: true; maxzoom: 16});

          L.layerGroup().addLayer(this.createTileLayer()).addTo(baseMap);
          baseMap.setMaxBounds(GLOBAL_ONTO.init.bounds());
          GLOBAL_ONTO.init.debug && console.warn('MapFactory: baseMap created');

      		return baseMap;

  },  // End createBaseMap

  /**
   * @access private
   * @var {Function} create the leaflet tile layer object accordingly what is
   * set in the properties file
   * @constructor
   */
createTileLayer : function() {
  var miniLayer;
  switch (GLOBAL_ONTO.init.tile_server) {

      case 'mapbox':
        miniLayer = L.tileLayer(GLOBAL_ONTO.init.url_tiles + GLOBAL_ONTO.init.mapbox_id + '/{z}/{x}/{y}.png?access_token=' + GLOBAL_ONTO.init.mapbox_access_token,
                    {
                          accessToken: GLOBAL_ONTO.init.mapbox_access_token,
                          maxZoom: GLOBAL_ONTO.init.maxZoomLevel,
                          minZoom: GLOBAL_ONTO.init.minZoomLevel,
                          attribution: GLOBAL_ONTO.init.mapAttribution,
                     });
      break;
      case 'dito':
      default:
        miniLayer = L.tileLayer( GLOBAL_ONTO.init.url_ditoTiles() + '&z={z}&x={x}&y={y}&r=mapnik',
                    {
                          maxZoom: GLOBAL_ONTO.init.maxZoomLevel,
                          minZoom: GLOBAL_ONTO.init.minZoomLevel,
                          attribution: GLOBAL_ONTO.init.mapAttribution,
                     });
      break;
  } // End switch
  return miniLayer;
}, // End createTileLayer


  createMiniMap: function(divId,lat,lng) {

          miniMap = L.map(divId, {
                                  center: [lat,lng],
                                  zoom: 16,
                                  zoomControl : false,
                                  dragging : false,
                                  doubleClickZoom : false,
                                  scrollWheelZoom : false
                                  });

          L.layerGroup().addLayer(this.createTileLayer()).addTo(miniMap);


          L.marker([lat,lng]).addTo(miniMap);

          GLOBAL_ONTO.init.debug && console.warn('MapFactory: miniMap created');

      		return miniMap;

},  // End createMiniMap



addControl: function(mode) {

  switch (mode) {

    case 'geoloc':  // GEOLOC

            console.log('Leaflet GeoControl init with options:',GLOBAL_ONTO.geolocateOptions);
            // create control and add to map
            LOC = L.control.locate(GLOBAL_ONTO.geolocateOptions).addTo($rootScope.baseMap);

            // SUCCESS
            function onLocationFound(e) {
                GLOBAL_ONTO.init.debug && console.log("Leaflet GeoControl successful enabled:", e.latlng);
                if(!GLOBAL_ONTO.init.bounds().contains(e.latlng)){
                  $timeout(function(){
                    $rootScope.alerts.push({msg:'User is outside of the bounding box.'});
                  });
                    GLOBAL_ONTO.init.debug && console.log("Leaflet GeoControl: User is outside of the bounding box.");
                    return ;
                }
                mapCenter = e.latlng;

                if (GLOBAL_ONTO.init.fake_geoloc) {
                     mapCenter = GLOBAL_ONTO.init.fakeGeolocPosition;
                     console.warn("Using fake coords:", GLOBAL_ONTO.init.fakeGeolocPosition);
                }
                thisfactory.mapControl('set_geoloc',mapCenter);
                LOC.stop(); // setTimeout(function(){ LOC.stop(); }, 1000);
                // unforttly stopping the Control, the marker disappears,
                // so we need to manage this manually:
                if (typeof geolocMarker !== "undefined") {
                      $rootScope.baseMap.removeLayer(geolocMarker);
                      // destroy instance refs -> garbage collector
                      geolocMarker = null;
                      delete geolocMarker;
                }

                geolocMarker = new L.circleMarker([mapCenter.lat,mapCenter.lng],GLOBAL_ONTO.init.geolocateOptions.markerStyle);
                geolocMarker.addTo($rootScope.baseMap);
                GLOBAL_ONTO.init.debug && console.log("Leaflet GeoControl: User is in the bounding box.");

                GLOBAL_ONTO.init.debug && console.log("Leaflet GeoControl: Done.");
            }

             $rootScope.baseMap.on('locationfound', onLocationFound);

             // FAIL
             function onLocationError(e) {
                  GLOBAL_ONTO.init.debug && console.log("Leaflet Geo-Control: Failed attempt to get localisation.");
                  // e.marker.closePopup()
                  // request location update?
                  // LOC.start;
              }
              $rootScope.baseMap.on('locationerror', onLocationError);
    break;

  } // End switch

},  // End addControls

// Add placemarks
// * creates a layer of placemarks with {vectorArray} data
// * adds that layer to a new layer group
// * adds this layer group to { thisMap }
// All map objects are pre-declared in $rootScope
//
addPlacemarks: function(vectorArray) {

            GLOBAL_ONTO.init.markerArray.length = 0;  // clear array

            var listOfCategoryNames = $rootScope.listOfCategories.map(a => a.name)
            for (var i = 0; i < vectorArray.length; i++) {

                var feature = vectorArray[i];

                // There may be entries w/o coordinates, entered in the Mühlheim Web Interface, so we need to test:
                if(feature.geometry != null && feature.geometry.coordinates!= null) {
                   var indexOfCat = listOfCategoryNames.indexOf(feature.properties.articleLabel);
                   var cssClassMarker = "default";
                   if(indexOfCat > 0){
                      cssClassMarker = $rootScope.listOfCategories[indexOfCat].cssClass;
                      indexOfCat++;
                   }else {
                     indexOfCat = 0;
                   }
                    var icon = L.divIcon({className: cssClassMarker+' '+cssClassMarker+'map-icon leaflet-div-icon-ont marker cat-'+indexOfCat, iconSize:null , popupAnchor:  [1, -22]});
                    var marker = L.marker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], { label:feature.properties.articleLabel,title: feature.properties.title, alt:feature.properties.id, icon:icon}); //                    var marker = L.marker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], { title: feature.properties.title, alt:feature.properties.id}); //

                    marker.bindPopup('<small class="color-'+indexOfCat+'">'+feature.properties.articleLabel+'</small><br/>'+feature.properties.title+'');
                    // TODO: autoPan:false
                    // See http://leafletjs.com/reference-1.2.0.html#popup
                    // marker.addTo(markerLayer);
                    GLOBAL_ONTO.init.markerArray.push(marker);

                  } // End if

            }  // End for

            // add placemark layer
            $rootScope.markerLayer = L.layerGroup(GLOBAL_ONTO.init.markerArray);
            L.layerGroup().addLayer($rootScope.markerLayer).addTo($rootScope.baseMap);

            // add layer controls
            // L.control.layers($rootScope.baseMap.layerGroup, {"Markers" :$rootScope.markerLayer}).addTo($rootScope.baseMap);

            // return markerArray;

},  // End addPlacemarks


// 'view': Go back to starting position
//  Any setView is done within an angular $timout (setting to new digest cycle)
// (this is an attempt to fix tile loading block)
//
mapControl: function(mode,coords,zoom)  {

        GLOBAL_ONTO.init.debug && console.log('MapFactory mapControl:', mode, 'Options:', coords, zoom);

        switch (mode) {

              case 'load_placemarks':
                  // RELOAD PLACEMARKS
                  // json by http service:
                  NetworkService.getGeoJSON().then(
                      function (geoData) {
                          $rootScope.geoJson = geoData.features;
                          $rootScope.baseMap.removeLayer(GLOBAL_ONTO.init.markerLayer);
                          markerArray = thisfactory.addPlacemarks(geoData.features);
                        }  // End function
                  ); // End then
              break;

              case 'center':      // center map to parameters
                                  baseMap.setView([coords.lat, coords.lng],zoom,{animation:true});
              break;

              case 'set_geoloc':  // center map on geolocation with specific options
                                  // mapCenter.lat = options.lat;
                                  // mapCenter.lng = options.lng;
                                  $rootScope.mapCenter = coords;
                                  baseMap.setView([coords.lat, coords.lng],GLOBAL_ONTO.init.geolocZoomLevel,{animation:GLOBAL_ONTO.init.geolocateOptions.flyTo});
              break;

              case 'rebuild_map':
                                // What can we do about blocked tiles ?
                                // $rootScope.baseMap.invalidateSize();
              break;

              case 'get_cordova_geoloc':  // this was used for custom geocontrol, unused by now

                              if ($rootScope.device_has_geoloc) {
                                  navigator.geolocation.getCurrentPosition(function(pos) {
                                                  GLOBAL_ONTO.init.debug && console.warn('MapFactory: Retrieving geoloc position:', pos);
                                                  GLOBAL_ONTO.init.mapCenter.lat = pos.coords.latitude;
                                                  GLOBAL_ONTO.init.mapCenter.lng = pos.coords.longitude;
                                                  GLOBAL_ONTO.init.fake_geoloc && (GLOBAL_ONTO.init.mapCenter = GLOBAL_ONTO.init.fakeGeolocPosition);
                                                  baseMap.setView([mapCenter.lat, mapCenter.lng],GLOBAL_ONTO.init.geolocZoomLevel,{animation:true});
                                                },
                                                  function(err) {
                                                  GLOBAL_ONTO.init.debug && console.warn('MapFactory: Cordova geoloc failed, using defaults');
                                                  GLOBAL_ONTO.init.debug && console.warn('Error message was:', err);
                                                  GLOBAL_ONTO.init.fake_geoloc && (GLOBAL_ONTO.init.mapCenter = GLOBAL_ONTO.init.fakeGeolocPosition);
                                                  baseMap.setView([mapCenter.lat, mapCenter.lng],GLOBAL_ONTO.init.initialZoomLevel,{animation:true});
                                              });
                                } else {
                                  GLOBAL_ONTO.init.debug && console.warn('MapFactory: No geoloc available, using defaults.');
                                  baseMap.setView([GLOBAL_ONTO.init.mapCenter.lat, GLOBAL_ONTO.init.mapCenter.lng],GLOBAL_ONTO.init.initialZoomLevel,{animation:true});
                                }

              break;

              }  // End switch

},  // End reset map

showPlacemarks: function(mode)  {

      $rootScope.baseMap.addLayer($rootScope.markerLayer);

},

hidePlacemarks: function(mode)  {

      $rootScope.baseMap.removeLayer($rootScope.markerLayer);

}

}   // End thisfactory object

return thisfactory;


});	// END MAP FACTORY
