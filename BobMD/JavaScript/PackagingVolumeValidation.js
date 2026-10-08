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


// Web resource: bdf_packagingvolume.js
// Volume can't be zero (minimum 0.01) when any of Length, Width or Height has a value.
//
// Register ONLY ONE event (pass execution context as first parameter):
//   Form OnLoad -> onFormLoad
// onFormLoad attaches the OnChange events to all Volume, Length, Width and Height fields
// and checks existing values when the form opens.

// ---------- Form OnLoad: the only event to register ----------
function onFormLoad(executionContext) {
    var formContext = executionContext.getFormContext();

    // Out of Packaging (EA) fields
    addChangeEvent(formContext, "bdf_outofpackaginglength", validateOutOfPackagingVolume);
    addChangeEvent(formContext, "bdf_outofpackagingwidth", validateOutOfPackagingVolume);
    addChangeEvent(formContext, "bdf_outofpackagingheight", validateOutOfPackagingVolume);
    addChangeEvent(formContext, "bdf_outofpackagingvolume", validateOutOfPackagingVolume);

    // In Packaging (ZSH) fields
    addChangeEvent(formContext, "bdf_inpackaginglength", validateInPackagingVolume);
    addChangeEvent(formContext, "bdf_inpackagingwidth", validateInPackagingVolume);
    addChangeEvent(formContext, "bdf_inpackagingheight", validateInPackagingVolume);
    addChangeEvent(formContext, "bdf_inpackagingvolume", validateInPackagingVolume);

    // Check existing values when the form opens (warnings only, no popup)
    validatePackagingOnLoad(executionContext);
}

// Attach an OnChange handler to a field (remove first so it is never added twice)
function addChangeEvent(formContext, fieldName, handler) {
    var attribute = formContext.getAttribute(fieldName);
    if (attribute) {
        attribute.removeOnChange(handler);
        attribute.addOnChange(handler);
    }
}

// ---------- Out of Packaging (EA) ----------
function validateOutOfPackagingVolume(executionContext) {
    var formContext = executionContext.getFormContext();
    checkVolume(
        formContext,
        "bdf_outofpackaginglength",
        "bdf_outofpackagingwidth",
        "bdf_outofpackagingheight",
        "bdf_outofpackagingvolume",
        "Out of Packaging Volume",
        true
    );
}

// ---------- In Packaging (ZSH) ----------
function validateInPackagingVolume(executionContext) {
    var formContext = executionContext.getFormContext();
    checkVolume(
        formContext,
        "bdf_inpackaginglength",
        "bdf_inpackagingwidth",
        "bdf_inpackagingheight",
        "bdf_inpackagingvolume",
        "In Packaging Volume",
        true
    );
}

// ---------- On Load check: show the warnings without popups ----------
function validatePackagingOnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    checkVolume(formContext, "bdf_outofpackaginglength", "bdf_outofpackagingwidth",
        "bdf_outofpackagingheight", "bdf_outofpackagingvolume", "Out of Packaging Volume", false);
    checkVolume(formContext, "bdf_inpackaginglength", "bdf_inpackagingwidth",
        "bdf_inpackagingheight", "bdf_inpackagingvolume", "In Packaging Volume", false);
}

// ---------- Shared check ----------
function checkVolume(formContext, lengthField, widthField, heightField, volumeField, label, showPopup) {
    var length = getNumber(formContext, lengthField);
    var width = getNumber(formContext, widthField);
    var height = getNumber(formContext, heightField);
    var volume = getNumber(formContext, volumeField);

    var notificationId = volumeField + "_zero";
    var volumeControl = formContext.getControl(volumeField);

    // At least one of Length, Width or Height is greater than 0 (empty or 0 = no value)
    var hasDimensions = length > 0 || width > 0 || height > 0;
    // Error when Volume is 0 or any value below 0.01 (empty is ignored)
    var isZero = volume !== null && volume < 0.01;

    if (hasDimensions && isZero) {
        var message = label + " cannot be zero. Please enter at least 0.01.";
        var showWarnings = function () {
            // Field-level error (also stops the form from saving)
            if (volumeControl) {
                volumeControl.setNotification(message, notificationId);
            }
        };

        if (showPopup) {
            Xrm.Navigation.openAlertDialog(
                { title: "Invalid " + label, text: message, confirmButtonLabel: "OK" }
            ).then(showWarnings);
        } else {
            showWarnings();
        }
    } else {
        // Value is valid (or dimensions are empty): no popup, clear the field error
        if (volumeControl) {
            volumeControl.clearNotification(notificationId);
        }
    }
}

function getNumber(formContext, fieldName) {
    var attribute = formContext.getAttribute(fieldName);
    if (!attribute) {
        return null;
    }
    return attribute.getValue();
}


