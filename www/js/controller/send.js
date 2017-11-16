rootApp.controller('sendCtrl', function($scope,$rootScope,$http,$timeout,DeviceService,NetworkService,DataFactory,DataService) {

GLOBAL_ONTO.init.debug && console.warn("Controller: sendCtrl.");

// fake send for debugging the data ?
if (!GLOBAL_ONTO.init.fake_send) {

$scope.appData.sendOK = "sending";
$scope.sendOK = "sending";
// create dito API data object from appData
ditoData = DataFactory.makeDitoData(appData);
GLOBAL_ONTO.init.debug && console.log('Created Dito Data:',ditoData);

$scope.appData.messageOfSubmit ='';

switch (appData.image.is_valid) {
    case true:  // If we have an image -> send all data with cordova plugin 'file transfer'
        GLOBAL_ONTO.init.uploadData.server = GLOBAL_ONTO.init.url_dito+"?";
        GLOBAL_ONTO.init.uploadData.uri = imageData.cdv;
        GLOBAL_ONTO.init.uploadData.options = {
                             'fileKey': 'file',
                             'fileName': GLOBAL_ONTO.init.uploadData.uri.substr(GLOBAL_ONTO.init.uploadData.uri.lastIndexOf('/') + 1),
                             'httpMethod': 'POST',
                             'mimeType': imageData.type,
                             'params': ditoData,
                             'chunkedMode' : false
                          //  'headers' : ''
                        };

      function onSucc(response) {
            GLOBAL_ONTO.init.debug && console.log('response', response);
            $timeout(function(){
              GLOBAL_ONTO.init.debug && console.log('response.response', response.response);
              if(typeof response.response != 'undefined'){
                  $scope.sendOK = "success";
                  $timeout(function(){
                      DataFactory.initAppData();
                      $rootScope.baseMap.invalidateSize();
                      $rootScope.apply;
                  });
              } else {
                  $scope.sendOK = "failed";
                  $scope.appData.sendOK = "failed";
                  $scope.appData.messageOfSubmit = response.response.errors[0];
              }
              GLOBAL_ONTO.init.debug && console.log("Send OK ! Response = ", response);
            });
        }

        function onFail(response) {
            $timeout(function(){
              $scope.appData.sendOK = "failed";
              $scope.appData.messageOfSubmit = "Das hat leider nicht geklappt.";

              console.log("Send FAILED !  Upload error response:", response);
            });
        }
        // SEND
        GLOBAL_ONTO.init.debug && console.log('Upload file:',GLOBAL_ONTO.init.uploadData.uri);
        GLOBAL_ONTO.init.debug && console.log('Upload options:',GLOBAL_ONTO.init.uploadData.options);

        var ft = new FileTransfer();
        $scope.progress = 0;
        $scope.progressVisible = false;
        ft.onprogress = function(progressEvent) {
            $timeout(function(){
              if (progressEvent.lengthComputable) {
                $scope.progressVisible = true;
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                GLOBAL_ONTO.init.debug && console.log(perc);
                $scope.progress = perc;
              } else {
                  $scope.progressVisible = false;
                  $scope.progress = 0;
              }
            });
        };
        ft.upload(GLOBAL_ONTO.init.uploadData.uri, encodeURI(GLOBAL_ONTO.init.uploadData.server), onSucc, onFail, GLOBAL_ONTO.init.uploadData.options);

    break;  // End HaveImage -> send by filetransfer plugin


    case false: // no image -> send by $http form

      var configSpecial = {
            method: 	'POST',
            url:			 GLOBAL_ONTO.init.url_dito + "?"+ DataService.serializeData(ditoData),
            headers:	{'Content-Type': 'application/x-www-form-urlencoded,charset=utf-8'},
            uploadEventHandlers: {
                progress: function (e) {
                          if (e.lengthComputable) {
                             $scope.progress = (e.loaded / e.total) * 100;
                             $scope.progressVisible = true;
                             GLOBAL_ONTO.init.debug && console.log($scope.progress);
                          }
                }
            }
          };
        // we send as form so the service will serialize dito data into key = value pairs
        NetworkService.sendForm(ditoData,'form',configSpecial).then(

                           function (response) {
                                        if(typeof response.response.data.success != 'undefined'){
                                            $scope.sendOK = "success";
                                            $timeout(function(){
                                								DataFactory.initAppData();
                                								$rootScope.baseMap.invalidateSize();
                                								$rootScope.apply;
                                						});
                                        } else {
                                            $scope.sendOK = "failed";
                                            $scope.appData.sendOK = "failed";
                                            $scope.appData.messageOfSubmit = response.response.data.errors[0]
                                        }
                                        GLOBAL_ONTO.init.debug && console.log("Controller sendForm OK response:", response);
                           },
                           function (response) {
                             $scope.sendOK = "failed";
                             $scope.appData.sendOK = "failed";
                             console.error("Controller sendForm FAILED with response:", response);
                           }
                   ); // End then

    break;

} // End valid image switch

} else {  // fake send
  console.warn("Fake Send set in properties.js -- not sending.");
  $scope.appData.sendOK = "success";
}


});  // End controller
