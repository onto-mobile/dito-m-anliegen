

// Example fork  device <--> browser:
// Put this inside a script tag before the /body tag.
//
//   angular.element(document).ready(function () {
//     if (window.cordova) {
//       console.log("Running in Cordova, will bootstrap AngularJS once 'deviceready' event fires.");
//       document.addEventListener('deviceready', function () {
//         console.log("Deviceready event has fired, bootstrapping AngularJS.");
//         angular.bootstrap(document.body, ['app']);
//       }, false);
//     } else {
//       console.log("Running in browser, bootstrapping AngularJS now.");
//       angular.bootstrap(document.body, ['app']);
//     }
//   });

console.warn("Entering deviceready.js");

var cordovaEvents = {
    // Application Constructor
    initialize: function() {

        document.addEventListener('deviceready', this.onDeviceReady, false);

        document.addEventListener("resume", this.onResume, false);

        document.addEventListener("backbutton", this.onBackKeyDown, false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function()
                        {
                        console.log("Device ready.");
//                        console.log("Cordova file:",cordova.file);

                          // Update camera plugin options from template in properties.js
                          // This is because Camera methods are not yet available when properties are initialized
                          photoOptions.camera.sourceType = Camera.PictureSourceType[photoOptions.camera.sourceType];
                          photoOptions.camera.destinationType = Camera.DestinationType[photoOptions.camera.destinationType];
                          photoOptions.camera.mediaType = Camera.MediaType[photoOptions.camera.mediaType];
                          photoOptions.camera.encodingType = Camera.EncodingType[photoOptions.camera.encodingType];
                          //
                          photoOptions.gallery.sourceType = Camera.PictureSourceType[photoOptions.gallery.sourceType];
                          photoOptions.gallery.destinationType = Camera.DestinationType[photoOptions.gallery.destinationType];
                          photoOptions.gallery.mediaType = Camera.MediaType[photoOptions.gallery.mediaType];
                          //
                          photoOptions.cleanup.sourceType = Camera.PictureSourceType[photoOptions.cleanup.sourceType];
                          photoOptions.cleanup.destinationType = Camera.DestinationType[photoOptions.cleanup.destinationType];

                          // The same problem with angular - needs to be initialized after deviceready
                          angular.bootstrap(document, ['rootApp']);

                            // Example see below
                            // this.receivedEvent('deviceready');
                        },

    onPause: function() {
                            console.log("devready: PASUE");
                        },

    onResume: function() {
                            console.log("devready: RESUME");
                         },

    onBackKeyDown: function()
                        {
                            console.log("devready: BACK-BUTTON");
                        },

  };

  cordovaEvents.initialize();

    // // Eaxmple update DOM on a Received Event
    // receivedEvent: function(id) {
    //     var parentElement = document.getElementById(id);
    //     var listeningElement = parentElement.querySelector('.listening');
    //     var receivedElement = parentElement.querySelector('.received');
    //
    //     listeningElement.setAttribute('style', 'display:none;');
    //     receivedElement.setAttribute('style', 'display:block;');
    //
    //     console.log('Received Event: ' + id);
    //     console.log("Avaliable plugins:");
    //     console.log(navigator.camera);
    // },
