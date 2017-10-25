
rootApp.controller('reportCtrl', function($scope,$rootScope,DataService,LocalService) {

// Report step 1 -- not here -- LOCALISATION
// Controller: mapSelectCtrl € map.js
// template: mapSelect.html


switch($scope.view) {

                  // CATEGORY CHOOSER
                  case 'report2':

                      // Update map position
                      LocalService.updateReportData('position.coordinates', $scope.baseMap.getCenter());

                      // only once initialize data
                      if (!$rootScope.listOfCategories.length) {

                            receivedCategories = DataService.getCategories().then(

                             			function (receivedCategories) {
                                         listOfCategories = receivedCategories.map(a => a.name);
                                         $rootScope.listOfCategories = listOfCategories;
                                         // Set a default: (needs to set mandatory counter)
                                         // reportData.category.text = listOfCategories[0]
                          	      }
                             ) // End then
                      }  // End if

                break;  // End CATEGORY


                // // IMAGE CHOOSER
                case 'report4':
                break;

                default: $scope.debug && console.log('report switch: Nothing special here.'); break;

}  // End view switch


});  // END CONTROLLER
