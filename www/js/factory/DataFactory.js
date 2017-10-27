
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
											$rootScope.appData = null;
											delete $rootScope.appData;
											appData = angular.copy(AppDataTemplate);
											$rootScope.appData = appData;
											$rootScope.view = appData.view;
									break;
									case 'image':
											$rootScope.imageData = null;
											delete $rootScope.imageData;
											imageData = angular.copy(ImageDataTemplate);
											$rootScope.imageData = imageData;
											// need this for correct mandatory counter:
											DataToolServices.updateAppData('image.text','reset',false);
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
              note      :     appData.note.text + "\n",
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
