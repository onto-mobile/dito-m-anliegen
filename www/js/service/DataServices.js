// -----------------------------------------------------------------------------


rootApp.service('DataServices', function($rootScope) {


// -----------------------------------------------------------------------------

// The method examines image features and also validates against type and size.
//
// @param	mode:	"filreread" for browser call (via directive)
// @param	mode:	"device" for call from device
// @param	item:	for file-read, the files[0] object returned from the file-reader
// @param	item:	for device, the 2 needed properties 'type' and 'size' are taken from makeImageData
// @return:			Object 'imgdata' {size,type,sizeKB,maxKB,maxMB,valid}
// @return:			Validation result is boolean: imgdata.valid
//
this.examineImage = function(mode,item)  {

				$rootScope.debug && console.log('DataServices: Validating', mode);
				// $rootScope.debug && console.log('Event:', event, 'File:', item);

				let imgdata = {};

				switch(mode) {

							case 'fileread': 	// file from generic brwoser file reader
											// TODO: Is it possible to prevent invalid images from loading in file reader?
											imgdata.size = item.size;
											imgdata.type = item.type.split("/").pop();
											imgdata.type = imgdata.type.replace("e", "");

							break;  // End file reader validation

							case 'device': 	// file from smartphone camera or gallery
											imgdata.size = item.size;
											imgdata.type = item.type.split("/").pop();
											imgdata.type = imgdata.type.replace("e", "");

							break;  // End browser image validation

				} // End switch


				// =========== VALIDATE ==============

				imgdata.text = "";

				if (imageTypesAllowed.includes(imgdata.type)) {

								// Check size
								//$rootScope.debug && console.log('File size:',imgdata.size, "Limit:", maxImageFileSize);
								if (imgdata.size <= maxImageFileSize) {

										 imgdata.valid = true;

								} else {  // file too large

											with (Math) {
																	imgdata.sizeKB = floor(imgdata.size/1000);
																	imgdata.maxKB = floor(maxImageFileSize/1000);
																	imgdata.maxMB = round(imgdata.maxKB/1000);
															 		}
											imgdata.valid = false;
											imgdata.text="file too large";

							 }  // End file too large

				} else {  // invalid file type
										 imgdata.valid = false;
										 imgdata.text = "unsupported format";
   			}

return 	imgdata;

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
