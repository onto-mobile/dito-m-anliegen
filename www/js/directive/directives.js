angular.module('rootApp')


// test
// .directive('createMinimap', ['MapFactory', function(MapFactory) {
// 			var m = MapFactory.createMiniMap('miniMap',[8.856627345085144, 50.12326773148066]);
// 			return m
// }])  // End directive mini-map




// validator: EMAIL
//
.directive('checkEmail', ['DataToolServices', function(DataToolServices) {

let regExpr = /^[0-9a-z]+([.]?[0-9a-z]+)+@[0-9a-z]+\.[0-9a-z]{2,5}$/i;
// debug && ( regExpr = /test/ );

	return {
						require:'ngModel',
						link:function(scope,element,attr,ctrl) {

									// ? if(ctrl.$validators.email) {
									// Overwrite browser validator:
									ctrl.$validators.email = function(value) {

														// debug && console.log('Custom email validator:');
														// debug && console.log('Last validation state:', appData.email.is_valid);

														// the damm validator sets true when undefined, so:
														if (!value) {
																		// debug && console.log('Input field cleared.');
																		if (appData.email.is_valid == true)
																					{
																						DataToolServices.updateMandatoryCounter("-");
																						appData.email.is_valid = false
																					 }
																					return false;

														 }	else  {  // Input field was modified but not cleared

																  result=regExpr.test(value);
																	// debug && console.log("New result:",result);
																	if ((result == false) && (appData.email.is_valid == true)) DataToolServices.updateMandatoryCounter("-");
																	if ((result == true) && (appData.email.is_valid == false)) DataToolServices.updateMandatoryCounter("+");
																	appData.email.is_valid = result
																	return result;
															} // End if
										} // End func
						}  // End link
	 };  // End return
}])  // End directive email


// validator: TITLE
//
.directive('checkTitle', ['DataToolServices', function(DataToolServices) {

  // let regExpr = /^[0-9a-z\s]{5,150}$/i;
	return {
						require:'ngModel',
						link:function(scope,element,attr,ctrl) {

						// Overwrite browser validator:
						ctrl.$validators.text = function(value) {

						// debug && console.log('Title text validator:');
						// debug && console.log('Last validation state:', appData.title.is_valid);

										// the damm validator sets true when undefined, so:
										if (!value) {
														// debug && console.log('Input field cleared.');
														if (appData.title.is_valid == true)
																	{
																		DataToolServices.updateMandatoryCounter("-");
																		appData.title.is_valid = false
																	 }
																	return false;

										 }	else  {  // Input field was modified but not cleared
													  // result=regExpr.test(value);
														//value = value.trim();
														result =  value.length > 4 && value.length <= 150;
														// debug && console.log("New result:",result);
														if ((result == false) && (appData.title.is_valid == true)) DataToolServices.updateMandatoryCounter("-");
														if ((result == true) && (appData.title.is_valid == false)) DataToolServices.updateMandatoryCounter("+");
														appData.title.is_valid = result
														return result;
		 							} // End if
							}  // End func
						}  // End link
	 };  // End return
}])  // End directive title


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
