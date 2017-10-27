// -----------------------------------------------------------------------------

rootApp.service('NetworkService', function($rootScope,$http,$q,DataToolServices) {

// -----------------------------------------------------------------------------


// Returns geoData object
//
this.getGeoJSON = function()  {

		 	return $http({
											method: 	'GET',
											url:			url_geoData

							}).then(
											function onSuccess(response){

															$rootScope.debug && console.log('Service getGeoJSON response:', response.data);

															return response.data;
											},

											function onFailed(response){

															return response.statusText;
											}
										) // End then
	}  // End getGeoJSON

	this.getRemoteContent = function(url_remote)  {

				return $http({
													method: 	'GET',
													url:			url_remote

								}).then(
													function onSucc(response){
																	return response.data;
													},

													function onFail(response){
																	return response.statusText;
													}
												) // End then
			}  // End getCategories

this.getCategories = function()  {

			return $http({
												method: 	'GET',
												url:			url_categories

							}).then(
												function onSucc(response){
																$rootScope.debug && console.log('Service getCategories response:', response.data);
																return response.data.categories;
												},

												function onFail(response){
																return response.statusText;
												}
											) // End then
		}  // End getCategories


// @params
// data: 			key-value paris encoded as stated by second parameter
// format:
//		"form": 		data = {key = value} pairs
//    "json": 		data = {key:value} pairs
// This method only works for form data w/o image
//
this.sendForm = function(data,format) {

					let config="";

					switch (format) {  // use format specific headers

								case 'form': config = {
															          method: 	'POST',
																				url:			 url_dito + "?"+ DataToolServices.serializeData(data),
																				headers:	{'Content-Type': 'application/x-www-form-urlencoded,charset=utf-8'},
																			}
				 				break;


								case 'json': // we don't use this, kept just for reference
														// headers = {'Content-Type': 'application/json; charset=utf-8'};
								break;

					} // End config switch


					return $http(config).then(

											function onSucc(response){
															$rootScope.debug && console.log('Service sendForm SUCCESS response:', response);
															return {response};
											},
											function onFail(response){
															$rootScope.debug && console.log('Service sendForm FAILED response:', response);
															return {response};
											}
							) // End then

}  // End sendForm

});	// End Network Service



// -----------------------------------------------------------------------------


rootApp.service('DeviceService', function($rootScope,$q,$timeout,DataFactory,DataToolServices) {


// -----------------------------------------------------------------------------


// @params:
// @source: 'camera' || 'gallery' (configures cordova getPicture option 'sourceType')
//
this.getDeviceImage = function (source) {

		debug && console.warn('Service getDeviceImage:');
		debug && console.log('Options for ' + source + ':', photoOptions[source]);

		var deferred = $q.defer();

		navigator.camera.getPicture(

						function onSucc(response) {

						    debug && console.log('cordova camera plugin returns:', response);
								deferred.resolve( { uri: response } );
								// return true;
						},

						function onFail(response) {

								debug && console.warn("cordova camera plugin: No picture loaded: " + response);
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


this.clearCameraCache = function(source)  {

						navigator.camera.cleanup(onSucc,onFail);

										function onSucc() {
										   			$rootScope.debug && console.log("Camera cache cleanup: OK.")
										}

										function onFail(message) {
										    alert('Camera cache cleanup:', message);
										}

	} // End cache cleanup

});	// End Device Service



// -----------------------------------------------------------------------------


rootApp.service('DataToolServices', function($rootScope) {


// -----------------------------------------------------------------------------

// mode: 'device' or 'filreread'
// item: for file-read, the files[0] object returned from the file-reader
// 			 for device, the fileEntry object created by makeImageData
//
// The service returns true/false and an error message
//
this.validateImage = function(mode,item)  {

				$rootScope.debug && console.log('DataToolServices: Validating', mode);
				// $rootScope.debug && console.log('Event:', event, 'File:', item);

				switch(mode) {

							case 'fileread': 	// file from generic brwoser file reader
																// TODO: Is it possible to prevent invalid images from loading in file reader?
											filesize = item.size;
											type = item.type.split("/").pop();

							break;  // End file reader validation


							case 'device': 	// file from smartphone camera or gallery

											filesize = item.size;
											type = item.type.split("/").pop();

							break;  // End broser image validation

				} // End switch


				// Validate

				let text = "";

				if (imageTypesAllowed.includes(type)) {
								// Check size
								// $rootScope.debug && console.log('File size:', filesize, "Limit:", maxFileSize);
								if (filesize <= maxFileSize) {

														 result = true;

								} else {  // file too large

													with (Math) {
																	var sizeKB = floor(filesize/1000);
																	var maxKB = floor(maxFileSize/1000);
																	var maxMB = round(maxKB/1000);
															 		}
									result = false;
									text="file too large";

							}  // End file too large

						} else {  // invalid file type
								 result = false;
								 text = "unsupported format";
	       }

return 	{ result:result, text: text };

} // End validate



// Update mandatory-completed counter
// "+" or "true" : increase counter
// "-" or "false" : decrease counter
// (the latter allows directly passing boolean checkbox values)
//
// Also updates: report_mandatory_is_complete,
// by matching against report_mandatory_number
//
this.updateMandatoryCounter = function(value) {

						$rootScope.debug && console.log('update Mandatory Counter value:', value);

						switch(value) {

								case "+" : case true :

									appData.report_mandatory_completed_counter +=1;

								break;

								case "-" : case false :

									appData.report_mandatory_completed_counter -=1;

								break;

						}  // End switch

					if ((appData.report_mandatory_completed_counter > report_mandatory_number)
							|| (appData.report_mandatory_completed_counter <1)) console.error("Error: Mandatory counter screwed.");

					appData.report_mandatory_is_complete = (appData.report_mandatory_completed_counter == report_mandatory_number) ? true : false;

			}  // End mandatory counter


// update app-data manager used for report data + mandatory counter
//
// parameters:
// property 	..... 		appData property (expects 2 path level deep)
// value		....... 		set this as new attrribute && update mandatory counter, OR: special keyword
// is_valid 	.... 		(optional parameter) set this as new validation state
//
// value special keywrd = 'toggle' .... toggle boolean value && update mandatory counter
//
this.updateAppData = function(property,value,is_valid) {

					appData = $rootScope.appData;

					$rootScope.debug && console.log('updateAppData:');

					let path=property.split(".");

					$rootScope.debug && console.log('Setting',path[0]+'.'+path[1]+' <-- ', value);

					// handle cases


					switch(value) {

									default:
															appData[path[0]][path[1]] = value;

															if ( ( appData[path[0]].mandatory == true )

																&& ( appData[path[0]].is_valid == false ))

																							{
																										this.updateMandatoryCounter("+");
																							}
									break;

									case "toggle":
																	value = !appData[path[0]][path[1]]
																	$rootScope.debug && console.log('Toggle: ', !value, "->", value);
																	appData[path[0]][path[1]] = value;
																	// check_privacy_accepted.is_valid is set in html
																	if ( appData[path[0]].mandatory == true ) this.updateMandatoryCounter(value);
									break;

									}  // End switch

									// Update 'valid' state with thirrd parameter boolean if it was given
									// (this is kind of a "function overloading" hack)
									$rootScope.debug && console.log("Option is_valid:", is_valid);
									if (typeof is_valid !== "undefined") appData[path[0]].is_valid = is_valid;

}  // End report data



// Serialize { key:value } data object into "key = value" strings.
// Used by: service 'sendForm'
// See https://github.com/jquery/jquery/blob/master/src/serialize.js#L45
//
this.serializeData = function(data) {

        // If this is not an object, defer to native stringification.
        if ( ! angular.isObject( data ) ) {
            return( ( data == null ) ? "" : data.toString() );
        }

        // Else do the job
        var buffer = [];
        // Serialize each key of object.
        for ( var name in data ) {
            if ( ! data.hasOwnProperty( name ) ) {
                continue;
            }
            var value = data[ name ];
            buffer.push(
                encodeURIComponent( name ) +
                "=" +
                encodeURIComponent( ( value == null ) ? "" : value )
            );
        }
        // Serialize buffer and clean up
        var result = buffer
            .join( "&" )
            .replace( /%20/g, "+" )
        ;
        return( result );

  } // End serializeData


});	// End Local Service
