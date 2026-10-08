function convertToUpperCaseOnFormChange(executionContext) {
  debugger;
  var formContext = executionContext.getFormContext();
  var fieldName = executionContext.getEventSource().getName();

  var capitalizedValue = formContext.getAttribute(fieldName).getValue();
  if (capitalizedValue) {
    capitalizedValue = capitalizedValue.toUpperCase();
    formContext.getAttribute(fieldName).setValue(capitalizedValue);
  }
}



function specialCharacters(executionContext) {
  // Debugging statement to help during development
  debugger;

  // Get the form context and the field name that triggered the event
  var formContext = executionContext.getFormContext();
  var fieldName = executionContext.getEventSource().getName();

  // Get the current value of the field
  var fieldValue = formContext.getAttribute(fieldName).getValue();

  // Check if the field value is not empty
  if (fieldValue) {
      // Define a regular expression to check for special characters: #, consecutive dashes (--), and accent characters
      var specialCharactersRegex = /[#]|[^\u0000-\u007F]+|--+/g;

      // Test if the field value contains any of the special characters
      var match = fieldValue.match(specialCharactersRegex);
      if (match) {
          // Get the first special character that caused the issue
          var specialCharacter = match[0];

          // Display a dynamic alert to the user
          //alert("Please remove the special character '" + specialCharacter + "' from the field value.");

          // Prevent saving by setting notifications
          formContext.getControl(fieldName).setNotification("Please remove the special character '" + specialCharacter + "' from the field value.", fieldName);
          //formContext.ui.setFormNotification("Please fix the field values before saving.", "ERROR", "specialCharacterError");

          // Exit the function to stop further processing
          return;
      }
  }

  // Clear any previous notifications if no special characters were found
  formContext.getControl(fieldName).clearNotification(fieldName);
  formContext.ui.clearFormNotification("specialCharacterError");
}

