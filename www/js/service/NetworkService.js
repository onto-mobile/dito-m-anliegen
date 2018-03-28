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


this.getAddress = function(lon, lat)  {
			return $http({
									method: 	'GET',
									url:			GLOBAL_ONTO.init.url_getAddress()+"&lat="+ lat +"&lon="+lon
							}).then(
								function onSucc(response){
										$rootScope.debug && console.log('Service getAddress response:', response.data);
										var jsoncontent = response.data;
										try {
							       			var housenumber = jsoncontent.address.house_number;
							            if (housenumber == undefinedStr.value) {
							                housenumber = "";
							            }
						         } catch (err) {
						             var housenumber = "";
						         }
					          try {
					              var road = jsoncontent.address.road;
					              if (road == undefinedStr.value) {
					                  road = "";
					              }
					          } catch (err) {
					              var road = "";
					          }
					          try {
					              var city = jsoncontent.address.town;
					              if (city == undefinedStr.value) {
					                  city = "";
					              }
					          } catch (err) {
					              var city = "";
					          }
					          try {
					              var postcode = jsoncontent.address.postcode;
					              if (postcode == undefinedStr.value) {
					                  postcode = "";
					              }
					          } catch (err) {
					              var postcode = "";
					          }
											return  road + ' ' + housenumber+"<br/>"+ postcode + ' ' + city;
								},
								function onFail(response){
												return response.statusText;
								}
							) // End then
		}  // End getAddress

// @params
// data: 			key-value paris encoded as stated by second parameter
// format:
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
