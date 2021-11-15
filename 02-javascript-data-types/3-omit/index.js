/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = ( obj, ...fields ) => {
  const picked = {};

  for ( const [key, value] of Object.entries( obj ) ) {
    // Look for the field in our object
    if ( ! fields.includes( key ) ) {
      picked[ key ] = value;
    }
  }

  return picked;
};

