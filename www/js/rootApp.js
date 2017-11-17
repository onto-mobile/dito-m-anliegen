var rootApp = angular.module('rootApp',['ngRoute','ngSanitize']);


//
//   APP config: route provider
//
rootApp.config(function($routeProvider,$locationProvider,$compileProvider) {

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(http|https?|file|blob|cdvfile|content):|data:image\//);
// config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {

      // Note that some separate subcontrollers are declared in the html templates
      // Also note that when there is no controller specified, then
      // it's just dealt by mainCtrl which is declared on top of index.html.
      //
      GLOBAL_ONTO.init.debug && console.log("Angular link router initialized with view:", GLOBAL_ONTO.init.view);

  		$routeProvider

        .when( 'home', { templateUrl: 'html/home.html' })

    		.otherwise({ templateUrl: function() { return "html/" + appData.view + ".html"; } });

        // This is kind of a dirty hack because it seems like we can not inject scope to routeProvider.when()
        // We should rather have instead when(view, ...) and then .otherwise calling error.html

});  // End rootApp config


//
//   APP INIT
//
rootApp.run(function($rootScope,$location,$timeout,MapFactory,DataFactory,NetworkService) {

      GLOBAL_ONTO.init.debug && console.log("rootApp.run init");

      // Keep these things accessible through all controller instances
      // (We use rootscope, to avoid making things complicated and hard to debug)
 			$rootScope.debug=GLOBAL_ONTO.init.debug;

      /**
       * Alert
       */
      $rootScope.alerts = [];
      // $scope.alerts = $rootScope.alerts;
    	$rootScope.closeAlert = function(index) {
    		 $rootScope.alerts.splice(index, 1);
     	};

      $rootScope.pushAlert = function( item ){
        $timeout(function(){
              $rootScope.alerts.push(item);
              $timeout(function(){
                    $rootScope.closeAlert($rootScope.alerts.indexOf(item));
              }, GLOBAL_ONTO.init.messageDelayInMS);
        });


      };
      // $rootScope.pushAlert(  { type: 'success', msg: 'Well done! You have successfully started the app.' });


      //
			// DEVICE ENVIRONMENT
      //
      GLOBAL_ONTO.init.debug && console.log("Checking Cordova plugins:");
      $rootScope.device_has_geoloc = (typeof navigator.geolocation !== "undefined" ) ? true:false;
      GLOBAL_ONTO.init.debug && console.log("Geolocation:",$rootScope.device_has_geoloc);
			$rootScope.device_has_cam = (typeof navigator.camera !== "undefined" ) ? true:false;
			GLOBAL_ONTO.init.debug && console.log("Camera and Gallery:",$rootScope.device_has_cam);
      $rootScope.device_has_filetransfer = (typeof FileTransfer !== "undefined" ) ? true:false;
      GLOBAL_ONTO.init.debug && console.log("http file transfer:", $rootScope.device_has_filetransfer);
      //
      $rootScope.device_has_filereader =  ( window.FileReader !== "undefined" ) ? true:false;
      !$rootScope.device_has_filereader && GLOBAL_ONTO.init.debug && console.log("Broswer does not support native html file-reader.");
      //
      // APP / REPORT DATA init
      //
      DataFactory.initAppData();
      //
      // Initial view
      //
      view=appData.view;
      GLOBAL_ONTO.init.debug && console.log("App initialized view:", view);
      $rootScope.map_view_active = GLOBAL_ONTO.init.map_view_active;
      //
      // MAP INIT
      //
      $rootScope.fake_geoloc=GLOBAL_ONTO.init.fake_geoloc;
      GLOBAL_ONTO.init.fake_geoloc && console.warn("Debug option: Fake Geolocation");
      //
			// CREATE LEAFLET MAP as singleton in rootscope
      $rootScope.geoJson = [];
      $rootScope.markerLayer = GLOBAL_ONTO.init.markerLayer;
      $rootScope.baseMap = MapFactory.createBaseMap();
      // Add placemarks layer:
			MapFactory.mapControl('load_placemarks');
      // Set initial map view at city center:
      MapFactory.mapControl('center', GLOBAL_ONTO.init.cityCenter);
      // Try to set view by cordova plugin geolocation:
      // MapFactory.mapControl('get_cordova_geoloc');
      // However, the geolocation is done by leaflet plugin now:
      MapFactory.addControl('geoloc');
      //
      // Load categroies from server
      //
      NetworkService.getCategories().then(
            function (receivedCategories) {
                  // old version: only names
                  //  listOfCategories = receivedCategories.map(a => a.name);
                  //  $rootScope.listOfCategories = listOfCategories;
                  // but now we use the full data:
                  $rootScope.listOfCategories = receivedCategories;
            }
       ) // End then

      //  report_mandatory_number = appData.mandatoryNumber();
       report_mandatory_number = appData.mandatoryNumber;

       // We want to access these from all controllers and pages:
       $rootScope.appTitle = GLOBAL_ONTO.init.pageInfo.app_title;
       $rootScope.imageTypesAllowed = GLOBAL_ONTO.init.imageTypesAllowed;
       $rootScope.photoOptions = GLOBAL_ONTO.init.photoOptions;
	});  // End rootApp run
