
// -----------------------------------------------------------------------------

rootApp.factory('DataFactory', function($rootScope,MapFactory,DataService) {

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
											$rootScope.appData = null;
											delete $rootScope.appData;
											appData = angular.copy(GLOBAL_ONTO.init.appDataTemplate);
											appData.report_saved_select_zoom = appData.initialZoomLevel;
											$rootScope.appData = appData;
											$rootScope.view = appData.view;
									break;
									case 'image':
											$rootScope.imageData = null;
											delete $rootScope.imageData;
											imageData = angular.copy(GLOBAL_ONTO.init.ImageDataTemplate);
											$rootScope.imageData = imageData;
											// need this for correct mandatory counter:
											DataService.updateAppData('image.text','reset',false);
									break;
							}
}, // End resetData


makeDitoData: function (appData) {


				// create a copy of the json which will be send to dito
				let ditoFormDataStatic = angular.copy(GLOBAL_ONTO.init.ditoFormDataStatic);


        // Note that we need to turn position coords to lng - lat
				// because dito expects that order
				ditoFormDataStatic.geoCoordinate= appData.position.coordinates.lng+
																				":"+appData.position.coordinates.lat;
				// for the time being we use this hardcoded id
				ditoFormDataStatic.gp_149_localizationProposal_value=
																				appData.position.coordinates.lng+
																				":"+appData.position.coordinates.lat;
				ditoFormDataStatic.label			 	= appData.category.text;
				ditoFormDataStatic.title				= appData.title.text;
				ditoFormDataStatic.note         = appData.note.text ;
				ditoFormDataStatic.email				= appData.email.text;
				ditoFormDataStatic.check_privacy_accepted =
																					appData.check_privacy_accepted.state;


				return ditoFormDataStatic;

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
