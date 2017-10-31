angular.module('rootApp')

// This is used in the browser file-reader fallback
// UNUSED on device, but i want to keep it for reference
//
// <attr file-change="function(parameters,$event,files)">
//
.directive('fileChange', ['$parse', function($parse) {
  // We depend on this custom and generic file-change directive
  // to catch a new selection, and run the image validation service
  // Many thanks to Simon Robb https://stackoverflow.com/a/26591042 !
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function ($scope, element, attrs, ngModel) {
        // Get the function provided in the file-change attribute.
        // Note the attribute has become an angular expression,
        // which is what we are parsing. The provided handler is
        // wrapped up in an outer function (attrHandler) - we'll
        // call the provided event handler inside the handler()
        // function below.
        var attrHandler = $parse(attrs['fileChange']);
        // This is a wrapper handler which will be attached to the
        // HTML change event.
        var handler = function (e) {
          $scope.$apply(function () {
            // Execute the provided handler in the directive's scope.
            // The files variable will be available for consumption
            // by the event handler.
            attrHandler($scope, { $event: e, files: e.target.files });
          });
        };
        // Attach the handler to the HTML change event
        element[0].addEventListener('change', handler, false);
      }
    };
  }]) // End directive


// generic filesystem browser for selecting an image
// more sophisticated @ https://www.html5rocks.com/en/tutorials/file/dndfiles/
.directive("fileRead", [
  function() {
    return {
      scope: { fileRead: "=" },
	      link: function(scope, element, attributes) {
	        element.bind("change", function(changeEvent) {
	          var reader = new FileReader();
	          reader.onload = function(loadEvent) {
	            scope.$apply(function() {
													scope.fileRead = loadEvent.target.result;
												});
	          }
	       reader.readAsDataURL(changeEvent.target.files[0]);
	      });
      }  // End link
   } // End return
 }  // End function
]) // End directive
