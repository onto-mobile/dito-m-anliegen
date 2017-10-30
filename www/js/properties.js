// =============== DEBUG
//
var debug=true;
var fake_geoloc=false;
var fakeGeolocPosition = { lat:50.1247648, lng:8.82783230 };

// =============== URL
//
// URL
// var url_dito = 'http://anliegen.noam.de:8080/dito/explore';
var url_dito = 'http://anliegen.muehlheim.ontopica.de/dito/explore';
var url_geoData = url_dito+'?action=browsermap&id=2692&geojson';
var url_categories = url_dito+'?action=journalhelperajax&id=2692&method=getCategories';
var url_info = url_dito+'?action=readprivacy&id=2701';
//
// var tile_server='dito';
// var url_tiles = url_dito+'?action=tiles';
//
var tile_server='mapbox';
var mapbox_id='mapbox.streets';
var url_tiles = 'https://api.tiles.mapbox.com/v4/'
var mapbox_access_token='pk.eyJ1IjoiY29kZWpvZGxlciIsImEiOiJjajc0eXVydGUwY3B1MnBzYndnanc0dmpjIn0.jXdtsPAHawa9Xwou8CalQw'
//

// =============== MAP
//
// MAP and PLACEMARK
var mapAttribution = '<a href="http://leafletjs.com">LeafLet</a> | Data © <a href="http://openstreetmap.org">OpenStreetMap</a> <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>  | Imagery © <a href="http://mapbox.com">Mapbox</a>';
var cityCenter = { lat:50.121, lng:8.832 };
var mapCenter = angular.copy(cityCenter);
var minZoomLevel = 12;
var maxZoomLevel = 19;
var initialZoomLevel = 13;
var geolocZoomLevel = 16;
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

// =============== LIST
var listItem = {};
var listOfCategories = {};

// =============== REPORT
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

// =============== APPDATA
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
// * since app starts with map view, the position-coords are always completed (counter default = +1)
//
// Important: If you set defaults for debugging, adjust the  'report_mandatory_completed_counter'
// and do not forget to correct if after you reverted to production use.
//
var AppDataTemplate =  {
                  'position'  :       { coordinates:{lat:"",lng:""},is_valid:true,mandatory:true},
                  'category'  :       { text:"undefined",is_valid:false,mandatory:true},
                  'image'     :       { text:"undefined",is_valid:false,mandatory:false},
                  'title'     :       { text:"",is_valid:false,mandatory:true,dirty:false},
                  'note'      :       { text:"",is_valid:true,mandatory:false},
                  'email'     :       { text:"",is_valid:false,mandatory:true,dirty:false},
                  'check_privacy_accepted'  :  {state:false,is_valid:false,mandatory:true},
                  'report_mandatory_completed_counter'  : 1,
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
                  'report_saved_view' : 'report1',
                  'report_saved_select_zoom' : initialZoomLevel,
                  'sendOK'  :  'undefined'
                  };  // End appData

// appData.title.text range
var minTitle=5;
var maxTitle=150;

// Email validation regular expression
let emailRegExpr = /^[0-9a-z]+([.]?[0-9a-z]+)+@[0-9a-z]+\.[0-9a-z]{2,5}$/i;

// dito data converts the report data to dito API
// For now this is hardcoded in the makeDitoData factory
var ditoData = {};


// =============== IMAGE DATA
//
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
var maxImageFileSize = 4000000;
var imageTypesAllowed = ['jpg','png']
var imageMessage = "Möchten Sie ein Bild anfügen ?";

// =============== VIEW
//
// We maintain the view by mainCtrl.changeView and these are rooScope vars
// W weed to init them here because ng router initializes even before rootApp.run
var view = AppDataTemplate.view;
var map_view_active = true;

// CORDOVA PLUGINS
var uploadData = {};

// Cordova Canera plugin options
// It is possible to configure number-encoded (0,1,2) values here, but is hard to read.
// It is also possible to get these values directly from plugin methods, but we can't do this
// before 'deviceready'. My solution is to reconfigure the options in deviceready.js, using the
// option names as string values from the properties file. Thus we can do the entire configuration here.
// e.g. 'CAMERA' here becomes Camera.DestinationType.CAMERA there.
//
var photoOptions = {
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
          'cleanup' : {
                      sourceType: 'CAMERA',
                      destinationType: 'FILE_URI'
                      }
    };


var geolocateOptions = {
  //                  locateOptions : method options, see code
  //                  onLocationError : function
  //                  onLocationOutsideMapBounds : function
                    enableHighAccuracy: true,
                    setView : 'false',
                    flyTo : true,
                    keepCurrentZoomLevel  : false,
                    maxZoom: geolocZoomLevel,
                    // clickBehavior :  {inView: 'stop', outOfView: 'setView'},
                    position  : 'topleft',
                    drawCircle  : false,
                    //markerClass : L.CircleMarker,
                    markerStyle : {
                                    radius: 12,
                                    fillColor :'red',
                                    color: 'white',
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                  },
                    icon  : 'fa fa-map-marker',
                    iconLoading : 'fa fa-spinner fa-spin',
                    strings: {
                                title : "Standort automatisch erkennen und Karte anpassen",
                                popup : "Geolokalisierung aktiviert."
                              }
      };

    // OTHER
    //
    // The most important plugins are checked @ app init, where we propagate
    // the results to rootscope so that any component can use them
    var device_has_cam = "undefined";
    var device_has_geoloc = "undefined";
    var device_has_filetransfer = "undefined";
    var device_has_filereader = "undefined"; // html file-reader is fallback for camera
