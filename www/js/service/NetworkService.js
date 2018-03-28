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
										var jsoncontent = response.data.address;
										$rootScope.debug && console.log('Service getAddress response:',jsoncontent);
										var housenumber = jsoncontent.house_number, road =jsoncontent.road, city=jsoncontent.town,postcode =jsoncontent.postcode;
										if (housenumber == undefined) {
							           housenumber = "";
										}
										if(road == undefined) {
							           road = "";
										}
										if(city == undefined) {
							           city = "";
										}
										if(postcode == undefined) {
							           postcode = "";
										}
							      //       }if (housenumber == undefinedStr.value) {
							      //           housenumber = "";
							      //       }
										// try {
							      //  			housenumber = jsoncontent.house_number;
							      //       if (housenumber == undefinedStr.value) {
							      //           housenumber = "";
							      //       }
						        //  } catch (err) {
						        //      housenumber = "";
						        //  }
					          // try {
					          //     road = jsoncontent.road;
					          //     if (road == undefinedStr.value) {
					          //         road = "";
					          //     }
					          // } catch (err) {
					          //     road = "";
					          // }
					          // try {
					          //     city = jsoncontent.town;
					          //     if (city == undefinedStr.value) {
					          //         city = "";
					          //     }
					          // } catch (err) {
					          //     city = "";
					          // }
					          // try {
					          //     postcode = jsoncontent.postcode;
					          //     if (postcode == undefinedStr.value) {
					          //         postcode = "";
					          //     }
					          // } catch (err) {
					          //     postcode = "";
					          // }
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
