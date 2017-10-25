
cordova build (or run) will on-the-fly add the file cordova.js to the www root, taken from the source folder

	platforms/android/platform_www/cordova.js

I created a symlink in that place, which will be overwritten, to get rid of the 404 when debugging with a browser.

-- mi


ng-cordova is another project offering an angular API for cordova. Not used. 
