/** Mapping between basicValidationType and the basic validation login
 * @param {Object} event - event triggered when a character is typed
 */
export const typeToFunctionMap = {
    "numeric": function (event){
        return (event.keyCode >= 48 && event.keyCode <= 57);
    },
    "alphanumeric": function(event){
        return (event.keyCode >=48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122);
    }
}
