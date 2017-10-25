var debug=true;
// URL
// var url_dito = 'http://anliegen.noam.de:8080/dito/explore';
var url_dito = 'http://anliegen.muehlheim.ontopica.de/dito/explore';
var url_tiles = url_dito+'?action=tiles';
var url_geoData = url_dito+'?action=browsermap&id=2692&geojson';
var url_categories = url_dito+'?action=journalhelperajax&id=2692&method=getCategories';
var url_info = url_dito+'?action=readprivacy&id=2701';

// MAP and PLACEMARK
var mapAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
var mapCenter = { lat:50.121, lng:8.832 };
var minZoomLevel = 3;
var maxZoomLevel = 20;
var initialZoomLevel = 13;

// beamed to rootScope:
var baseMap = {};
var markerLayer = {};
//
var geoData = {};
var vectorArray = {};
var markerArray = [];
//
// only for reference
var miniMap = {};
var miniLayer = {};
var lat = 1;
var lng = 1;
var zoom = 1;

// LIST
var listItem = {};
var listOfCategories = {};

// REPORT
var listOfCategoryNames = [];
var pageInfo = {
'app_title'  : "Dito CityApp",
'home'    :  "Startseite",
'map'  : "MELDEN",
'report1'  : "Markieren Sie den Ort",
'report2'  : "Kategorie wählen",
'report3'  : "Bereits gemeldet?",
'report4'  : "Foto hinzufügen",
'report5'  : "Beschreibung",
'report6'  : "Rückmeldung",
'send'  : "Senden",
'info'  : "Info zur App",
'my'  : "Meine Meldungen",
'list'  : "Alle Meldungen",
'error'  : "Fehler :(",
'detail' : "detail"
};
var pageMessage="";

// obj appData:
//
// storage object for all 'new report' input data
//
// sub-properties of main properties:
//
// * mandatory  .........   flag for required input
// * is_valid .........   keep last state of validation in report data (-> save as template)
//
// * obj method: count self number of mandatories
// * because navigation is async, the app needs some 'report completed' counter and flag
// * since app starts with map view, the position-coords are always completed (counter default +1)
//
// Important: If you set defaults for debugging, adjust the  'report_mandatory_completed_counter'
// and do not forget to correct if after you reverted to production use.
//
var AppDataTemplate =  {
                  'position'  :       { coordinates:{lat:"",lng:""},is_valid:true,mandatory:true},
                  'category'  :       { text:"undefined",is_valid:false,mandatory:true},
                  'image'     :       { text:"undefined",is_valid:false,mandatory:false},
                  'title'     :       { text:"yet another thing to mention",is_valid:true,mandatory:true},
                  'note'      :       { text:"\n",is_valid:true,mandatory:false},
                  'email'     :       { text:"mw@ontopica.de",is_valid:true,mandatory:true},
                  'check_privacy_accepted'  :  {state:false,is_valid:false,mandatory:true},
                  'report_mandatory_completed_counter'  : 3,
                  'report_mandatory_is_complete'  : false,
                   mandatoryNumber : function () {
                                              console.log('Mandatory items:');
                                              var number = 0;
                                              for (var item in this) {
                                                if (this[item].mandatory == true) {
                                                     ++number;
                                                     console.log(number+'.',item);
                                                  }
                                                }
                                                console.log('Counted', number, 'mandatories.');
                                                return number;
                                      }, // End method
                  'view'  :       'home',
                  'sendOK'  :  'undefined'
                  };  // End appData

// Need to init this here because ng router initializes even before rootApp.run
var view = AppDataTemplate.view;

// dito data converts the report data to dito API
// by now still fully implemented in the makeDitoData factory
//
var ditoData = {};

// image data object with many possible properties for maximal flexibility.
// Also separate from appData because keeping base64 data in appData slows app down.
// base64 still is in use for browser mode which uses a browser file-read fallback in the image input-form directive
var ImageDataTemplate = {
                 'native':'',
                 'cdv':'',
                 'filepath':'',
                 'base64':'',
                 'type':'',
                 'size':'',
                 'fileEntry':''
                };
// max image size in Bytes. 5000000 is 5M.
var maxFileSize = 5000000;
var imageTypesAllowed = ['jpeg','png']
var imageMessage = "Möchten Sie ein Bild anfügen ?";



// CORDOVA PLUGINS
var uploadData = {};

// Cordova Canera plugin options
// Normally one would configure number-encoded (0,1,2) vlaues directly from plugin methods
// but we can't do this before 'deviceready', so we reconfigure the options in deviceready.js
// using the string values given here, e.g. 'CAMERA' here becomes Camera.DestinationType.CAMERA there.
//
photoOptions = {
          'camera' : {
                        sourceType: 'CAMERA',
                        destinationType: 'FILE_URI',
                        mediaType: 'PICTURE',
                        encodingType: 'JPEG',
                        correctOrientation: true,  //Corrects Android orientation quirks
                        // resample on-the-fly
                        targetWidth: 1600,
                        quality: 86,
                        // also save the original reslouted image to album?
                        // note that we don't get a lik for this
                        saveToPhotoAlbum: true
                      },
          'gallery' : {
                      sourceType: 'SAVEDPHOTOALBUM',
                      destinationType: 'NATIVE_URI',
                      mediaType: 'PICTURE'
                    },
        'cleanup' :  {
                      sourceType: 'CAMERA',
                      destinationType: 'FILE_URI'
                      }
    };

    // OTHER
    //
    // Plugins check @ app init
    var device_has_cam = "undefined";
    var device_has_filetransfer = "undefined";
    var device_has_filereader = "undefined"; // html file-reader fallback
