// -----------------------------------------------------------------------------


rootApp.service('DeviceService', function($rootScope,$q,$timeout,DataFactory,DataService) {


// -----------------------------------------------------------------------------


// @params:
// @source: 'camera' || 'gallery' (configures cordova getPicture option 'sourceType')
//
this.getDeviceImage = function (source) {

		GLOBAL.init.debug && console.warn('Service getDeviceImage:');
		GLOBAL.init.debug && console.log('Options for ' + source + ':', photoOptions[source]);

		var deferred = $q.defer();

		navigator.camera.getPicture(

						function onSucc(response) {

						    GLOBAL.init.debug && console.log('cordova camera plugin returns:', response);
								deferred.resolve( { uri: response } );
								// return true;
						},

						function onFail(response) {

								GLOBAL.init.debug && console.warn("cordova camera plugin: No picture loaded: " + response);
								deferred.reject( { failed: response }  );
								// return false;
						},
						photoOptions[source])

		return deferred.promise;

} // End getDeviceImage


// Read image filepath as base64 data -- unused --
// @path string
// @callback function receives as first parameter the content of the image
// @return base64 image data
//
// Using cordova plugin 'file'
//
this.getFileAsBase64 = function(path,callback){


    window.resolveLocalFileSystemURL(path, onSucc, onFail);

    function onFail(e) {
          alert('Cannot find requested file!');
    }

    function onSucc(fileEntry) {
           fileEntry.file(function(file) {
              var reader = new FileReader();
              reader.onloadend = function(e) {
                   var content = this.result;
                   callback(content);
              };
              // The most important point, use the readAsDatURL Method from the file plugin
              reader.readAsDataURL(file);
           });
    }
} // End getFileAsBase64



// --------------------------------------------------------------------------------


// This is not tested and needs adjust:
this.clearCameraCache = function()  {

			navigator.camera.cleanup(onSucc,onFail);

								function onSucc() {
								   $rootScope.debug && console.log("Camera cache cleanup: OK.")
								}

								function onFail(message) {
								   console.warn('Camera cache cleanup:', message);
								}

} // End cache cleanup

});	// End Device Service
