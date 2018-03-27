// -----------------------------------------------------------------------------

rootApp.service('NetworkService', function($rootScope,$http,$q,DataService) {

// -----------------------------------------------------------------------------


// Returns geoData object
//
this.getGeoJSON = function()  {

		 	return $http({
											method: 	'GET',
											url:			GLOBAL_ONTO.init.url_geoData()

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

this.getComments = function(id)  {
 	return $http({
				method: 	'GET',
				url:			GLOBAL_ONTO.init.url_comments()+id
			}).then(
							function onSuccess(response){
								$rootScope.debug && console.log('Service getComments response:', response.data);
								return response.data;
							},
							function onFailed(response){
								return response.statusText;
							}
			) // End then
	}  // End getComments


this.getCategories = function()  {

			return $http({
												method: 	'GET',
												url:			GLOBAL_ONTO.init.url_categories()

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
this.sendForm = function(data,format, configSpecial) {

					var config="";

					switch (format) {  // use format specific headers

								case 'form': config = {
															          method: 	'POST',
																				url:			 GLOBAL_ONTO.init.url_dito + "?"+ DataService.serializeData(data),
																				headers:	{'Content-Type': 'application/x-www-form-urlencoded,charset=utf-8'},
																			}
				 				break;


								case 'json': // we don't use this, kept just for reference
														// headers = {'Content-Type': 'application/json; charset=utf-8'};
								break;

					} // End config switch
					if(typeof configSpecial != "undefined"){
						config=configSpecial;
						$rootScope.debug && console.log("use configSpecial");
					}

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
