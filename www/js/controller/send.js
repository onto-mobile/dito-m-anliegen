rootApp.controller('sendCtrl', function($scope,$rootScope,$http,$timeout,DeviceService,NetworkService,DataFactory,DataService) {

GLOBAL_ONTO.init.debug && console.warn("Controller: sendCtrl.");

// fake send for debugging the data ?
if (!GLOBAL_ONTO.init.fake_send) {

$scope.appData.sendOK = "sending";

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
                              }

      function onSucc(response) {
            GLOBAL_ONTO.init.debug && console.log('response', response);
              $timeout(function(){

              if(typeof response.data.success != 'undefined'){
                  $scope.appData.sendOK = "success";
              } else {
                  $scope.appData.sendOK = "failed";
                  $scope.appData.messageOfSubmit = response.data.errors[0]
              }
              console.log("Send OK ! Response = ", response);
              })
        }

        function onFail(response) {
                                      $timeout(function(){
                                      $scope.appData.sendOK = "failed";
                                      $scope.appData.messageOfSubmit = "Das hat leider nicht geklappt."

                                      console.log("Send FAILED !  Upload error response:", response);
                                    })
                                  }
        // SEND
        GLOBAL_ONTO.init.debug && console.log('Upload file:',GLOBAL_ONTO.init.uploadData.uri);
        GLOBAL_ONTO.init.debug && console.log('Upload options:',GLOBAL_ONTO.init.uploadData.options);

        var ft = new FileTransfer();
        ft.upload(GLOBAL_ONTO.init.uploadData.uri, encodeURI(GLOBAL_ONTO.init.uploadData.server), onSucc, onFail, GLOBAL_ONTO.init.uploadData.options);

    break;  // End HaveImage -> send by filetransfer plugin


    case false: // no image -> send by $http form

        // we send as form so the service will serialize dito data into key = value pairs
        NetworkService.sendForm(ditoData,'form').then(

                           function (response) {
                                        if(typeof response.response.data.success != 'undefined'){
                                            $scope.appData.sendOK = "success";
                                        } else {
                                            $scope.appData.sendOK = "failed";
                                            $scope.appData.messageOfSubmit = response.response.data.errors[0]
                                        }
                                        GLOBAL_ONTO.init.debug && console.log("Controller sendForm OK response:", response);
                           },
                           function (response) {
                                         $scope.appData.sendOK = "failed";
                                         console.error("Controller sendForm FAILED with response:", response);
                           }
                   ) // End then

    break;

} // End valid image switch

} else {  // fake send
  console.warn("Fake Send set in properties.js -- not sending.");
  $scope.appData.sendOK = "success";
}


});  // End controller
