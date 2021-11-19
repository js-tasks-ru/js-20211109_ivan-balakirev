/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj( obj ) {
  const inverted = {};

  if ( ! obj ) {
    return;
  }

  for ( const key in obj ) {
    inverted[ obj[ key ] ] = key;
  }

  return inverted;
}

