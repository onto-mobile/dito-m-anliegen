var rootApp = angular.module('rootApp',['ngRoute','ngSanitize']);

//
//   APP config: route provider
//
rootApp.config(function($routeProvider) {

      // Note that some separate subcontrollers are declared in the html templates
      // Also note that when there is no controller specified, then
      // it's just dealt by mainCtrl which is declared on top of index.html.
      //
      debug && console.log("Link router initialized with view:", view);

  		$routeProvider

        .when( 'home', { templateUrl: 'html/home.html' })

    		.otherwise({ templateUrl: function() { return "html/" + appData.view + ".html"; } });

        // This is kind of a dirty hack because it seems like we can not inject scope to routeProvider.when()
        // We should rather have instead when(view, ...) and then .otherwise calling error.html

});  // End rootApp config


//
//   APP INIT
//
rootApp.run(function($rootScope,MapFactory,DataFactory,NetworkService) {

      debug && console.log("rootApp.run init");

      // Keep these things accessible through all controller instances
      // (We use rootscope, to avoid making things complicated and hard to debug)
 			$rootScope.debug=debug;

			// DEVICE ENVIRONMENT
      debug && console.log("Checking Cordova plugins:");
      $rootScope.device_has_geoloc = (typeof navigator.geolocation !== "undefined" ) ? true:false;
      debug && console.log("Geolocation:",$rootScope.device_has_geoloc);
			$rootScope.device_has_cam = (typeof navigator.camera !== "undefined" ) ? true:false;
			debug && console.log("Camera and Gallery:",$rootScope.device_has_cam);
      $rootScope.device_has_filetransfer = (typeof FileTransfer !== "undefined" ) ? true:false;
      debug && console.log("http file transfer:", $rootScope.device_has_filetransfer);
      //
      $rootScope.device_has_filereader =  ( window.FileReader !== "undefined" ) ? true:false;
      !$rootScope.device_has_filereader && console.log("Broswer does not support native html file-reader.");


      // APP / REPORT DATA init
      DataFactory.initAppData();
      // Initial view
      view=appData.view;
      debug && console.log("App initialized view:", view);

      // MAP INIT
      //
      $rootScope.fake_geoloc=fake_geoloc;
      fake_geoloc && console.warn("Debug option: Fake Geolocation");
      //
			// CREATE LEAFLET MAP as singleton in rootscope
      $rootScope.geoJson = [];
      $rootScope.markerLayer = markerLayer;
      $rootScope.baseMap = MapFactory.createBaseMap();
      // Add placemarks layer:
			MapFactory.mapControl('load_placemarks');
      // Set initial map view at city center:
      MapFactory.mapControl('center', cityCenter);
      // Try to set view by cordova plugin geolocation:
      // MapFactory.mapControl('get_cordova_geoloc');
      // However, the geolocation is done by leaflet plugin now:
      MapFactory.addControl('geoloc');

      // We want to access these from all controllers and pages:
      // $rootScope.DataToolServices = DataToolServices;
      // $rootScope.listOfCategories = listOfCategories;
      $rootScope.appTitle = pageInfo.app_title;
      $rootScope.pageMessage = pageMessage;
      $rootScope.imageMessage = imageMessage;
      $rootScope.imageTypesAllowed = imageTypesAllowed;
      $rootScope.photoOptions = photoOptions;
      report_mandatory_number = appData.mandatoryNumber();
      //
      // Load categroies from server
      NetworkService.getCategories().then(
            function (receivedCategories) {
                  // old version: only names
                  //  listOfCategories = receivedCategories.map(a => a.name);
                  //  $rootScope.listOfCategories = listOfCategories;
                  // but now we use the full data:
                  $rootScope.listOfCategories = receivedCategories;
            }
       ) // End then

	});  // End rootApp run
