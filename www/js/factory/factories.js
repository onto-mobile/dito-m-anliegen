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
                                                center: [mapCenter.lat, mapCenter.lng],
                                                zoom: initialZoomLevel
                                              });
              // var baseMap = L.map('mapid').setView([mapCenter.lat, mapCenter.lng], initialZoomLevel);
              // var baseMap = L.map('mapid').locate({setView: true; maxzoom: 16});

              L.layerGroup().addLayer(baseLayer).addTo(baseMap);

              debug && console.warn('MapFactory: baseMap created');

  						return baseMap;

},  // End createBaseMap


createMiniMap: function(divId,lat,lng) {

            // debug && console.log('MiniMap:',divId, coords );
            // debug && console.log('url tiles:',url_tiles);
            debug && console.warn('tiles_url ', url_tiles);
            miniLayer = L.tileLayer( url_tiles + '&z={z}&x={x}&y={y}&r=mapnik',
                                          {
                                            // attribution: mapAttribution,
                                                maxZoom: maxZoomLevel,
                                                minZoom: minZoomLevel
                                          });

            miniMap = L.map(divId, {
                                          center: [lat,lng],
                                          zoom: 16
                                          });

          L.layerGroup().addLayer(miniLayer).addTo(miniMap);

          L.marker([lat,lng]).addTo(miniMap);

          debug && console.warn('MapFactory: miniMap created');

      		return miniMap;

},  // End createBaseMap


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
                    // See http://leafletjs.com/reference-1.2.0.html#popup
                    // marker.addTo(markerLayer);
                    markerArray.push(marker);

                  } // End if

            }  // End for

            // add placemark layer
            $rootScope.markerLayer = L.layerGroup(markerArray);
            L.layerGroup().addLayer($rootScope.markerLayer).addTo($rootScope.baseMap);

            // add controls
            // L.control.layers($rootScope.baseMap.layerGroup, {"Markers" :$rootScope.markerLayer}).addTo($rootScope.baseMap);

            // return markerArray;

},  // End addPlacemarks


// 'view': Go back to starting position
// 'reconnect': Reset the view internally, no position change, no animation
//
setMap: function(mode)  {

        console.log('MapFactory resetMap: ' + mode + ' map.');

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

              case 'view':
                          // $rootScope.baseMap.invalidateSize();
                          baseMap.setView([mapCenter.lat, mapCenter.lng],initialZoomLevel,{animation:true});
              break;

              case 'reconnect':
                          // let coords = $rootScope.baseMap.getCenter();
                          // $rootScope.baseMap.setView(coords);
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



// -----------------------------------------------------------------------------

rootApp.factory('DataFactory', function($rootScope,MapFactory,DataToolServices) {

// -----------------------------------------------------------------------------


return  {


initAppData : function()  {  // Inititalize user data
								this.resetData('app');
								this.resetData('image');
}, // End initAppData


resetData : function(choice)  {

						console.log('Factory resetData: Resetting ' + choice + ' data.');

						switch(choice) {

									case 'app':
											appData = angular.copy(AppDataTemplate);
											$rootScope.appData = appData;
											$rootScope.view = appData.view
									break;

									case 'image':
											imageData = angular.copy(ImageDataTemplate);
											$rootScope.imageData = imageData;
											// need this for correct mandatory counter:
											DataToolServices.updateAppData('image.text','reset',false);
											$rootScope.imageMessage = "Kein Bild ausgewählt.";
									break;
							}
}, // End resetData


makeDitoData: function (appData) {

        // Note that we need to turn position coords to lng - lat because dito expects that order
        return {
              submitRegister    :   "submit",
              sendfromapp   :     "true",
              action      :    "postbasearticlenotloggedin",
              mode      :     "new",
              parentid      :      "2692",
              rank      :     "100",
              published     :     "true",
              notifycreator     :     "false",
              gp_150_codeProposal_value   :   "",
              gp_188_status_value     :     "gp.status.open",
              gp_149_localizationProposal_value     :    appData.position.coordinates.lng+":"+appData.position.coordinates.lat,
              label     :     appData.category.text,
              title     :     appData.title.text,
              note      :     appData.note.text,
              email     :     appData.email.text,
              check_privacy_accepted      :     appData.check_privacy_accepted.state
              // file : blobData
              }
  }, // End function



  // convert dataURI -> data blob
  // Used by: sendCtrl
  //
  // On modern OS there's also blob = new Blob(uri), {type: "image/png"});
  // but we won't rely on that w/o extensive information and testing
  //
  base64To2Blob: function (data) {
               // debug && console.log('Creating blob from:', data);
               var binary = atob(data.split(',')[1]);
               var mimeString = data.split(',')[0].split(':')[1].split(';')[0];
               var array = [];
               for (var i = 0; i < binary.length; i++) {
                                                       array.push(binary.charCodeAt(i));
                                                       }

               return new Blob([new Uint8Array(array)], {
                                                         type: mimeString
                                                         });
    }  // End function

}   // End factory return
});	// END DATA FACTORY
