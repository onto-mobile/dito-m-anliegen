// -----------------------------------------------------------------------------

rootApp.factory('MapFactory', function($rootScope,NetworkService) {

// -----------------------------------------------------------------------------

 thisfactory = {

  createBaseMap: function() {


                baseLayer = L.tileLayer(url_tiles + '&z={z}&x={x}&y={y}&r=mapnik',
                                              {
                                                attribution: mapAttribution,
                                                    maxZoom: maxZoomLevel,
                                                    minZoom: minZoomLevel
                                              });

                baseMap = L.map('mapid', {
                                                center  : [mapCenter.lat, mapCenter.lng],
                                                zoom    : initialZoomLevel,
                                                zoomControl : false
                                              });

              // var baseMap = L.map('mapid').setView([mapCenter.lat, mapCenter.lng], initialZoomLevel);
              // var baseMap = L.map('mapid').locate({setView: true; maxzoom: 16});

              L.layerGroup().addLayer(baseLayer).addTo(baseMap);

              debug && console.warn('MapFactory: baseMap created');

  						return baseMap;

},  // End createBaseMap


createMiniMap: function(divId,lat,lng) {

            // debug && console.log('MiniMap:',divId, coords );
            // debug && console.warn('tiles_url ', url_tiles);
            miniLayer = L.tileLayer( url_tiles + '&z={z}&x={x}&y={y}&r=mapnik',
                                          {
                                            // attribution: mapAttribution,
                                                maxZoom: maxZoomLevel,
                                                minZoom: minZoomLevel
                                          });

            miniMap = L.map(divId, {
                                          center: [lat,lng],
                                          zoom: 16,
                                          zoomControl : false
                                          });

          L.layerGroup().addLayer(miniLayer).addTo(miniMap);

          L.marker([lat,lng]).addTo(miniMap);

          debug && console.warn('MapFactory: miniMap created');

      		return miniMap;

},  // End createMiniMap



addControl: function(mode) {

  switch (mode) {

    case 'geoloc':  // GEOLOC

            console.log('Leaflet GeoControl init with options:',geolocateOptions);
            // create control and add to map
            LOC = L.control.locate(geolocateOptions).addTo($rootScope.baseMap);

            // SUCCESS
            function onLocationFound(e) {

                      debug && console.log("Leaflet GeoControl successful enabled:", e.latlng);

                      mapCenter = e.latlng;

                      if (fake_geoloc) {
                                       mapCenter = fakeGeolocPosition;
                                       console.warn("Using fake coords:", fakeGeolocPosition);
                                        }

                       thisfactory.mapControl('set_geoloc',mapCenter);

                       LOC.stop(); // setTimeout(function(){ LOC.stop(); }, 1000);
                       // unforttly stopping the Control disappears the marker too, so we need to manage this manually:
                       if (typeof geolocMarker !== "undefined") {
                              $rootScope.baseMap.removeLayer(geolocMarker);
                              // destroy instance refs -> garbage collector
                              geolocMarker = null;
                              delete geolocMarker;
                            }

                       geolocMarker = new L.circleMarker([mapCenter.lat,mapCenter.lng],geolocateOptions.markerStyle);
                       geolocMarker.addTo($rootScope.baseMap);

                       debug && console.log("Leaflet GeoControl: Done.");

                      }

             $rootScope.baseMap.on('locationfound', onLocationFound);

             // FAIL
             function onLocationError(e) {

                            debug && console.log("Leaflet Geo-Control: Failed attempt to get localisation.");
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

            markerArray.length = 0;  // clear array

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
                    var marker = L.marker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], { title: feature.properties.title, alt:feature.properties.id, icon:icon}); //                    var marker = L.marker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], { title: feature.properties.title, alt:feature.properties.id}); //

                    marker.bindPopup('<h3>'+feature.properties.title+'</h3>');
                    // TODO: autoPan:false
                    // See http://leafletjs.com/reference-1.2.0.html#popup
                    // marker.addTo(markerLayer);
                    markerArray.push(marker);

                  } // End if

            }  // End for

            // add placemark layer
            $rootScope.markerLayer = L.layerGroup(markerArray);
            L.layerGroup().addLayer($rootScope.markerLayer).addTo($rootScope.baseMap);

            // add layer controls
            // L.control.layers($rootScope.baseMap.layerGroup, {"Markers" :$rootScope.markerLayer}).addTo($rootScope.baseMap);

            // return markerArray;

},  // End addPlacemarks


// 'view': Go back to starting position
// 'rebuild_map': Reset the map internally, no position change, no animation
// (this is an attempt to fix tile loading block)
//
mapControl: function(mode,coords,zoom)  {

        debug && console.log('MapFactory mapControl:', mode, 'Options:', coords, zoom);

        switch (mode) {

              case 'load_placemarks':
                            // RELOAD PLACEMARKS
                            // json by http service:
                            NetworkService.getGeoJSON().then(
                                          function (geoData) {
                                              $rootScope.geoJson = geoData.features;
                                              $rootScope.baseMap.removeLayer(markerLayer);
                                              markerArray = thisfactory.addPlacemarks(geoData.features);
                                            }  // End function
                                          ) // End then
              break;

              case 'center':      // center map to parameters
                                  //  mapCenter.lat = coords.lat;
                                  //  mapCenter.lng = coords.lng;
                                   baseMap.setView([coords.lat, coords.lng],zoom,{animation:true});
              break;

              case 'set_geoloc':    // center map on geolocation with specific options
                                    // mapCenter.lat = options.lat;
                                    // mapCenter.lng = options.lng;
                                    $rootScope.mapCenter = coords;
                                    baseMap.setView([coords.lat, coords.lng],geolocZoomLevel,{animation:geolocateOptions.flyTo});
              break;

              case 'rebuild_map':
                                // What can we do about blocked tiles ?
                                // $rootScope.baseMap.invalidateSize();
              break;

              case 'get_cordova_geoloc':  // this was used for custom geocontrol, unused by now

                              if ($rootScope.device_has_geoloc) {
                                  navigator.geolocation.getCurrentPosition(function(pos) {
                                                  debug && console.warn('MapFactory: Retrieving geoloc position:', pos);
                                                  mapCenter.lat = pos.coords.latitude;
                                                  mapCenter.lng = pos.coords.longitude;
                                                  fake_geoloc && (mapCenter = fakeGeolocPosition);
                                                  baseMap.setView([mapCenter.lat, mapCenter.lng],geolocZoomLevel,{animation:true});
                                                },
                                                  function(err) {
                                                  debug && console.warn('MapFactory: Cordova geoloc failed, using defaults');
                                                  debug && console.warn('Error message was:', err);
                                                  fake_geoloc && (mapCenter = fakeGeolocPosition);
                                                  baseMap.setView([mapCenter.lat, mapCenter.lng],initialZoomLevel,{animation:true});
                                              });
                                } else {
                                   debug && console.warn('MapFactory: No geoloc available, using defaults.');
                                   baseMap.setView([mapCenter.lat, mapCenter.lng],initialZoomLevel,{animation:true});
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
