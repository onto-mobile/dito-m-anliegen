if (typeof GLOBAL_ONTO == 'undefined')
	var GLOBAL_ONTO = {};
/**
 * @access public
 * @var {Function} The main application class where all the variable for running
 * the app is setup.
 * @constructor
 */
GLOBAL_ONTO.init =  {
  // =============== DEBUG
  //
  debug:true,
  fake_send : false,
  fake_geoloc:false,
  fakeGeolocPosition : { lat:50.1247648, lng:8.82783230 },

  // ::::::::::::::: URL
  //
  // URL
  // var url_dito : 'http://anliegen.noam.de:8080/dito/explore';
  url_dito : 'http://anliegen.muehlheim.ontopica.de/dito/explore',
  url_geoData : function(){return this.url_dito+'?action=browsermap&id=2692&geojson'},
	url_ditoTiles : function(){return this.url_dito+'?action=tiles'},
  url_categories : function(){return this.url_dito+'?action=journalhelperajax&id=2692&method=getCategories'},
  url_privacy : function(){return this.url_dito+'?action=readprivacy&id=2701'},
  url_impressum : function(){return this.url_dito+'?action=readprivacy&id=2702'},
  url_info : function(){return this.url_dito+'?action=readprivacy&id=2696'},
  url_faq : function(){return this.url_dito+'?action=readprivacy&id=2700'},

  // var tile_server:'dito';
  // var url_tiles : url_dito+'?action:tiles';
  tile_server:'dito',
  mapbox_id:'mapbox.streets',
  url_tiles : 'https://api.tiles.mapbox.com/v4/',
  mapbox_access_token:'pk.eyJ1IjoiY29kZWpvZGxlciIsImEiOiJjajc0eXVydGUwY3B1MnBzYndnanc0dmpjIn0.jXdtsPAHawa9Xwou8CalQw',


  // ::::::::::::::: MAP
  //
  // MAP and PLACEMARK
  mapAttribution : 'Data © '+
    '<a href:"http://openstreetmap.org">OpenStreetMap</a> '+
    '<a href:"http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>  |'+
    ' Imagery © <a href:"http://mapbox.com">Mapbox</a>',
  cityCenter : { lat:50.121, lng:8.832 },
  boundsSouthWest : L.latLng(50.0, 8.55),
  boundsNorthEast : L.latLng(50.3, 8.99),
	bounds : function(){return L.latLngBounds(this.boundsSouthWest,
									this.boundsNorthEast)},
  // here we need the bounding box
  mapCenter :function(){return angular.copy(this.cityCenter)},
  minZoomLevel : 12,
  maxZoomLevel : 19,
  initialZoomLevel : 13,
  geolocZoomLevel : 16,
  // beamed to rootScope:
  baseMap : {},
  markerLayer : {},
  //
  geoData : {},
  vectorArray : {},
  markerArray : [],

  // ::::::::::::::: LIST
  listItem : {},
  listOfCategories : {},

  // ::::::::::::::: REPORT

	listOfCategoryNames : [],
  pageInfo : {
  'app_title'  : "Anliegenmanagement",
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
},

  // ::::::::::::::: Message CONFIG :::::::::::::::

  // Status messages
  text_error:"Keine Verbindung ... bitte aktivieren Sie ihr Netzwerk!",
  text_ok:"OK",
  // ::::::::::::::: APPDATA
  //
  // storage object for all 'new report' input data
  //
  // sub-properties of main properties:
  //
  // * mandatory  .........   flag for required input
  // * is_valid .........   keep last state of validation in report data
  // (-> save as template)
  //
  // * obj method: count self number of mandatories
  // * because navigation is async, the app needs some 'report completed'
  // * counter and flag
  // * since app starts with map view, the position-coords are always completed
  // * (counter default : +1)
  // * there is a 'dirty' flag (actually a counter) on some text input which
  // * enables the feedback
  //   to differ between 'first enter' with clear field (no barfs) and
  // 'later cleared field'.
  //
  //  Important:
  //  If you set preconfigured values for debugging, for mandatory properties,
  // you must
  //  set the 'is_valid' state too and adjust the
  // 'report_mandatory_completed_counter';
  //  and do not forget to correct things if you revert to production use!
  //
  appDataTemplate :  {
    'position' : { coordinates:{lat:"",lng:""},is_valid:true,mandatory:true},
    'category' : { text:"undefined",is_valid:false,mandatory:true},
    'image'    : { text:"undefined",is_valid:false,mandatory:false},
    'title'    : { text:"",is_valid:false,mandatory:true,dirty:false},
    'note'     : { text:"",is_valid:true,mandatory:false},
    'email'    :       { text:"",is_valid:false,mandatory:true,dirty:false},
    'check_privacy_accepted'  :  {state:false,is_valid:false,mandatory:true},
    'report_mandatory_completed_counter'  : 1,
    'report_mandatory_is_complete'  : false,
    mandatoryNumber : 5,
		//  function () {
    //             console.log('Mandatory items:');
    //             var number = 0;
    //             for (var item in this) {
    //                 if (this[item].mandatory == true) {
    //                      ++number;
    //                      console.log(number+'.',item);
    //                 }
    //             }
    //             console.log('Counted', number, 'mandatories.');
    //             return number;
    // }, // End method
    'view'  :       'home',
    'report_saved_view' : 'report1',
    'report_saved_select_zoom' : function(){return this.initialZoomLevel},
    'sendOK'  :  'undefined'
  },  // End appData

  // appData.title.text range
   minTitle:5,
   maxTitle:150,

	 ditoFormDataStatic : {
				submitRegister    :   "submit",
				sendfromapp   :     "true",
				action      :    "postbasearticlenotloggedin",
				mode      :     "new",
				parentid      :      "2692",
				rank      :     "100",
				published     :     "true",
				notifycreator     :     "false",
				gp_150_codeProposal_value   :   "",
				gp_188_status_value     :     "gp.status.open"
		},

  // Email validation regular expression
   emailRegExpr : /^[0-9a-z]+([.]?[0-9a-z]+)+@[0-9a-z]+\.[0-9a-z]{2,5}$/i,

  // dito data converts the report data to dito API
  // For now this is hardcoded in the makeDitoData factory
   ditoData : {},


  // ::::::::::::::: IMAGE DATA
  //
  // image data object with many possible properties for maximal flexibility.
  // Also separate from appData because keeping base64 data in appData slows
  // app down. base64 still is in use for browser mode which uses a browser
  // file-read fallback in the image input-form directive
   ImageDataTemplate : {
                   'native':'',
                   'cdv':'',
                   'filepath':'',
                   'base64':'',
                   'type':'',
                   'size':'',
                   'fileEntry':''
                  },
  // max image size in Bytes. 5000000 is 5M.
   maxImageFileSize : 4000000,
   imageTypesAllowed : ['jpg','png'],
   imageMessage : "Möchten Sie ein Bild anfügen ?",

  // ::::::::::::::: VIEW
  //
  // We maintain the view by mainCtrl.changeView and these are rooScope vars
  // W weed to init them here because ng router initializes even before
  // rootApp.run
   view : function(){return this.appDataTemplate.view},
   map_view_active : true,

  // CORDOVA PLUGINS
   uploadData : {},

  // Cordova Canera plugin options
  // It is possible to configure number-encoded (0,1,2) values here, but is hard to read.
  // It is also possible to get these values directly from plugin methods, but we can't do this
  // before 'deviceready'. My solution is to reconfigure the options in deviceready.js, using the
  // option names as string values from the properties file. Thus we can do the entire configuration here.
  // e.g. 'CAMERA' here becomes Camera.DestinationType.CAMERA there.
  //
   photoOptions : {
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
      },


   geolocateOptions : {
  //                  locateOptions : method options, see code
  //                  onLocationError : function
  //                  onLocationOutsideMapBounds : function
                    enableHighAccuracy: true,
                    setView : 'false',
                    flyTo : true,
                    keepCurrentZoomLevel  : false,
                    maxZoom: function(){return this.geolocZoomLevel},
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
      },

    // OTHER
    //
    // The most important plugins are checked @ app init, where we propagate
    // the results to rootscope so that any component can use them
     device_has_cam : "undefined",
     device_has_geoloc : "undefined",
     device_has_filetransfer : "undefined",
     device_has_filereader : "undefined", // html file-reader is fallback for camera

};
