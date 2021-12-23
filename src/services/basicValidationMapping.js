/**
 * Mapping between basicValidationType and the basic validation login
 * @param {Object} event - event triggered when a character is typed
 */

function isNumeric(event){
    return (event.keyCode >= 48 && event.keyCode <= 57);
}

function isAlphanumeric(event){
    return isNumeric(event) || (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)
}
export const validationTypeToFunctionMap = {
    "numeric": isNumeric,
    "alphanumeric": isAlphanumeric,
    undefined: function (){
        return false
    }

}
