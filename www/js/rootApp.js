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
//   APP INIT and root scope
//
rootApp.run(function($rootScope,$timeout,MapFactory,DataFactory,NetworkService) {

      debug && console.log("rootApp.run init");

      // Keep these things accessible through all controller instances
      // (We use rootscope, to avoid making things complicated and hard to debug)

 			$rootScope.debug=debug;

			// Check environment
			$rootScope.device_has_cam = (typeof navigator.camera !== "undefined" ) ? true:false;
			debug && console.log("Camera plugin ?",$rootScope.device_has_cam);
      // debug && console.log("Cordova file plugin ?", (typeof cordova.file !== "undefined") ? true:false);
      debug && console.log("Cordova file transfer plugin ?", (typeof FileTransfer !== "undefined") ? true:false);
      //
      $rootScope.device_has_filereader =  ( window.FileReader !== "undefined" ) ? true:false;
      !$rootScope.device_has_filereader && console.warn("Warning: Broswer does not support html file-reader.");

			// CREATE LEAFLET MAP as singleton in rootscope
      $rootScope.geoJson = [];
      $rootScope.markerLayer = markerLayer;
			$rootScope.baseMap = MapFactory.createBaseMap();
      // add placemarks layer
			MapFactory.setMap('load_placemarks');

      // INIT user data
      DataFactory.initAppData();

      report_mandatory_number = appData.mandatoryNumber();

      // We want to access these from all controllers and pages:
      // $rootScope.DataToolServices = DataToolServices;
      // $rootScope.listOfCategories = listOfCategories;
      $rootScope.appTitle = pageInfo.app_title;
      $rootScope.pageMessage = pageMessage;
      $rootScope.imageMessage = imageMessage;
      $rootScope.imageTypesAllowed = imageTypesAllowed;
      $rootScope.photoOptions = photoOptions;

      // view
      view=appData.view;
      debug && console.log("App initialized view:", view);

      receivedCategories = NetworkService.getCategories().then(

            function (receivedCategories) {
                  // old version: only the names
                  //  listOfCategories = receivedCategories.map(a => a.name);
                  //  $rootScope.listOfCategories = listOfCategories;
                  // but now we use the full data:
                  $rootScope.listOfCategories = receivedCategories;
            }
       ) // End then

	});  // End rootApp run
