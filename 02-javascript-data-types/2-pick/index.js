/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = ( obj, ...fields ) => {
  const picked = {};

  for ( const [key, value] of Object.entries( obj ) ) {
    // Look for the field in our object
    if ( fields.indexOf( key ) !== - 1 ) {
      picked[key] = value;
    }
  }

  return picked;
};
