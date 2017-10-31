rootApp.controller('sendCtrl', function($scope,$rootScope,$http,$timeout,DeviceService,NetworkService,DataFactory,DataServices) {

debug && console.warn("Controller: sendCtrl.");

// fake send for debugging the data ?
if (!fake_send) {

appData.sendOK = "sending";

// create dito API data object from appData
ditoData = DataFactory.makeDitoData(appData);
debug && console.log('Created Dito Data:',ditoData);



switch (appData.image.is_valid) {


    case true:  // If we have an image -> send all data with cordova plugin 'file transfer'

        uploadData.server = url_dito+"?";
        uploadData.uri = imageData.cdv;
        uploadData.options = {
                             'fileKey': 'file',
                             'fileName': uploadData.uri.substr(uploadData.uri.lastIndexOf('/') + 1),
                             'httpMethod': 'POST',
                             'mimeType': imageData.type,
                             'params': ditoData,
                             'chunkedMode' : false
                          //  'headers' : ''
                              }

        function onSucc(response) {
                                      $timeout(function(){
                                      appData.sendOK = "success";
                                      console.log("Send OK ! Response = ", response);
                                      })
                                  }

        function onFail(response) {
                                      $timeout(function(){
                                      appData.sendOK = "failed";
                                      console.log("Send FAILED !  Upload error response:", response);
                                    })
                                  }
        // SEND

        var ft = new FileTransfer();
        ft.upload(uploadData.uri, encodeURI(uploadData.server), onSucc, onFail, uploadData.options);

    break;  // End imageData -> send by plugin



    case false: // no image -> send by $http form

        // we send as form so the service will serialize dito data into key = value pairs
        NetworkService.sendForm(ditoData,'form').then(

                           function (response) {
                                        appData.sendOK = "success";
                                        debug && console.log("Controller sendForm OK response:", response);
                           },
                           function (response) {
                                         appData.sendOK = "failed";
                                         console.error("Controller sendForm FAILED with response:", response);
                           }
                   ) // End then

    break;

} // End valid image switch

} else {  // fake send
  console.warn("Fake Send set in properties.js -- not sending.");
}


});  // End controller
