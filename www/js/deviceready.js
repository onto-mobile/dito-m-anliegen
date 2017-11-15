// Adding or removing app boot HTML messages
// example: createElement('myID','OK!','text-ok','fa fa-check fa-2x')
//
function messageCreate(id, text, text_class, icon_class) {
      document.write('<div id="'+id+'" class="deviceMessage '+text_class+'"><div class="deviceMessageInner"><i class="'+icon_class+'" style="margin:5px 0 15px 0;"></i><br>'+text+'</div></div>');
}

function messageDelete(id) {
      let element = document.getElementById(id);
      element.outerHTML = "";
      delete element;
}



// =============== CORDOVA CONFIGURATION ===============

var cordovaEvents = {
  // Application Constructor
  initialize: function() {

      console.log("Cordova init.");
      document.addEventListener('deviceready', this.onDeviceReady, false);
      document.addEventListener("resume", this.onResume, false);
      document.addEventListener("backbutton", this.onBackKeyDown, false);
      document.addEventListener("offline", this.onOffline, false);
      document.addEventListener("online", this.onOnline, false);
  },

  // deviceready
  //
  onDeviceReady: function() {

                        console.warn("dito-m-anliegen: device ready.");


                        // XXX Style iOS bugs?
                        // oder https://www.npmjs.com/package/cordova-plugin-statusbar

                        // if (parseFloat(window.device.version) === 7.0) {
                        //          document.body.style.marginTop = "20px";
                        //    }

                        // Update camera plugin options from template in properties.js
                        // This is because Camera methods are not yet available when properties are initialized
                        GLOBAL_ONTO.init.photoOptions.camera.sourceType = Camera.PictureSourceType[GLOBAL_ONTO.init.photoOptions.camera.sourceType];
                        GLOBAL_ONTO.init.photoOptions.camera.destinationType = Camera.DestinationType[GLOBAL_ONTO.init.photoOptions.camera.destinationType];
                        GLOBAL_ONTO.init.photoOptions.camera.mediaType = Camera.MediaType[GLOBAL_ONTO.init.photoOptions.camera.mediaType];
                        GLOBAL_ONTO.init.photoOptions.camera.encodingType = Camera.EncodingType[GLOBAL_ONTO.init.photoOptions.camera.encodingType];
                        //
                        GLOBAL_ONTO.init.photoOptions.gallery.sourceType = Camera.PictureSourceType[GLOBAL_ONTO.init.photoOptions.gallery.sourceType];
                        GLOBAL_ONTO.init.photoOptions.gallery.destinationType = Camera.DestinationType[GLOBAL_ONTO.init.photoOptions.gallery.destinationType];
                        GLOBAL_ONTO.init.photoOptions.gallery.mediaType = Camera.MediaType[GLOBAL_ONTO.init.photoOptions.gallery.mediaType];
                        //
                        GLOBAL_ONTO.init.photoOptions.cleanup.sourceType = Camera.PictureSourceType[GLOBAL_ONTO.init.photoOptions.cleanup.sourceType];
                        GLOBAL_ONTO.init.photoOptions.cleanup.destinationType = Camera.DestinationType[GLOBAL_ONTO.init.photoOptions.cleanup.destinationType];

                        // =============== APP LAUNCHER ===============

                        // NETWORK DETECTION
                        // Check online / offline status
                        // Using cordova plujgin network-information

                        function deviceOnline() {
                              var networkState = navigator.connection.type;
                              switch (networkState) {
                                case "unknown": case "none":
                                  var status = false;
                                break;
                                default: var status = true;  break;
                              } // End switch
                              return status;
                         }

                        console.warn("Online:", deviceOnline());
                        console.log("XXX", navigator.connection);

                        if (deviceOnline()) {
                              // LAUNCH APP
                              console.log('deviceready.js: Initializing Angular App');
                              // Angular needs to be initialized after deviceready
                              angular.bootstrap(document, ['rootApp']);
                         } else {

                              messageCreate("netMsg", text_error, "text-device-error", "fa fa-spin fa-spinner fa-2x");

                              // INTERVAL CHECK LOOP

                              let onlineCheck = setInterval(function(){

                                GLOBAL_ONTO.init.debug && console.log('Waiting for net connection ... ');

                                      if (deviceOnline()) {

                                            console.warn('Network connection found.');
                                            messageDelete("netMsg");

                                            clearInterval(onlineCheck);

                                            // wait a second for full network coming up

                                            setTimeout(function() {
                                                // LAUNCH APP
                                                console.log('deviceready.js: Initializing Angular App');

                                                // Angular needs to be initialized after deviceready
                                                angular.bootstrap(document, ['rootApp']);

                                              },1000);  // End timeout

                                          } // End if online

                                }, 2000 ); // End interval

                        }  // End device offline

                      },  // End devicereday

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
  onOffline : function() {
      alert('you are offline');
  },
  onOnline : function() {
      alert('Great! you are back online');
  },

};  // End var cordova



// =============== APP ENTRY ===============

// Helper fork to support browser debugging

if (window.cordova) {

  GLOBAL_ONTO.init.debug && console.log("Cordova detected.")
  cordovaEvents.initialize();


} else {  // browser debugging mode

       GLOBAL_ONTO.init.debug && console.log("Browser detected.")
       // if (document.createEvent) { element.dispatchEvent('deviceready'); }

      //  function deviceOnline() { return navigator.onLine }

       console.warn("Online:", navigator.onLine);

      //  if (deviceOnline()) {
             // LAUNCH APP
             console.log('deviceready.js: Initializing Angular App');
             // Angular needs to be initialized after deviceready
             angular.bootstrap(document, ['rootApp']);

      //   } else {  // device offline
       //
      //        messageCreate("netMsg", text_error, "text-device-error", "fa fa-spin fa-spinner fa-2x");
       //
      //        // INTERVAL CHECK LOOP
       //
      //        let onlineCheck = setInterval(function(){
       //
      //          GLOBAL_ONTO.init.debug && console.log('Waiting for net connection ... ');
       //
      //                if (deviceOnline()) {
      //                      console.warn('Network connection found.');
      //                      messageDelete("netMsg");
      //                      clearInterval(onlineCheck);
      //                   // wait a second for full network coming up
      //                   console.log('deviceready.js: Initializing Angular App');
      //                   // Angular needs to be initialized after deviceready
      //                    angular.bootstrap(document, ['rootApp']);
       //
      //              } // End if online
       //
      //          }, 2000 ); // End interval
       //
      //  }  // End device offline

}  // End browser debug mode




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
