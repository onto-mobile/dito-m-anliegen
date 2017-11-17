// Adding or removing app boot HTML messages
// example: createElement('myID','OK!','text-ok','fa fa-check fa-2x')
//
var wasOffline = false;

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

      // Update camera plugin options from template in properties.js
      // This is because Camera methods are not yet available when
      // properties are initialized.
      GLOBAL_ONTO.init.photoOptions.camera.sourceType =
        Camera.PictureSourceType[GLOBAL_ONTO.init.photoOptions.camera.sourceType];
      GLOBAL_ONTO.init.photoOptions.camera.destinationType =
        Camera.DestinationType[GLOBAL_ONTO.init.photoOptions.camera.destinationType];
      GLOBAL_ONTO.init.photoOptions.camera.mediaType =
        Camera.MediaType[GLOBAL_ONTO.init.photoOptions.camera.mediaType];
      GLOBAL_ONTO.init.photoOptions.camera.encodingType =
        Camera.EncodingType[GLOBAL_ONTO.init.photoOptions.camera.encodingType];
      //
      GLOBAL_ONTO.init.photoOptions.gallery.sourceType =
        Camera.PictureSourceType[GLOBAL_ONTO.init.photoOptions.gallery.sourceType];
      GLOBAL_ONTO.init.photoOptions.gallery.destinationType =
        Camera.DestinationType[GLOBAL_ONTO.init.photoOptions.gallery.destinationType];
      GLOBAL_ONTO.init.photoOptions.gallery.mediaType =
        Camera.MediaType[GLOBAL_ONTO.init.photoOptions.gallery.mediaType];
      //
      GLOBAL_ONTO.init.photoOptions.cleanup.sourceType =
        Camera.PictureSourceType[GLOBAL_ONTO.init.photoOptions.cleanup.sourceType];
      GLOBAL_ONTO.init.photoOptions.cleanup.destinationType =
        Camera.DestinationType[GLOBAL_ONTO.init.photoOptions.cleanup.destinationType];

      // =============== APP LAUNCHER ===============

      // Check online / offline status
      // Using cordova plujgin network-information
      GLOBAL_ONTO.init.debug && console.log("isOnline", navigator.connection);
      angular.bootstrap(document, ['rootApp']);
      var elt = document.getElementById('outer-message');
      if(elt != null)
        elt.setAttribute('style', 'display:block;');

  },  // End devicereday

  onPause: function() {
    GLOBAL_ONTO.init.debug && console.log("devready: PASUE");
  },
  onResume: function() {
    GLOBAL_ONTO.init.debug && console.log("devready: RESUME");
  },
  onBackKeyDown: function(){
    GLOBAL_ONTO.init.debug && console.log("devready: BACK-BUTTON");
  },
  onOffline : function() {
    wasOffline = true;
    navigator.notification.alert('Sie haben keine Internet-Verbindung!',
        function(){}, 'Anliegenmanagement');
  },
  onOnline : function() {
    if(wasOffline)
      navigator.notification.alert('Gut! Sie sind wieder online.',
        function(){}, 'Anliegenmanagement');
  },

};  // End var cordova

// =============== APP ENTRY ===============
// Helper fork to support browser debugging
if (window.cordova) {
    GLOBAL_ONTO.init.debug && console.log("Cordova detected.");
    cordovaEvents.initialize();
} else {  // browser debugging mode
    GLOBAL_ONTO.init.debug && console.log("Browser detected.");
    console.warn("Online:", navigator.onLine);
    // Angular needs to be initialized after deviceready
    angular.bootstrap(document, ['rootApp']);
    var elt = document.getElementById('outer-message');
    if(elt != null)
      elt.setAttribute('style', 'display:block;');

}  // End browser debug mode
