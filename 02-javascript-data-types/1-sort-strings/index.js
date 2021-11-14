/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings( arr, param = 'asc' ) {
  const unicodeArr = [];
  const latinArr = [];

  // Split array to unicode and lat to sort them separately
  for ( let i = 0; i < arr.length; i ++ ) {
    if ( arr[ i ].charCodeAt( 0 ) > 255 ) {
      unicodeArr.push( arr[ i ] );
    } else {
      latinArr.push( arr[ i ] );
    }
  }

  latinArr.sort( function( a, b ) {
    return a.localeCompare( b, undefined, { caseFirst: 'upper' } );
  } );

  unicodeArr.sort( function( a, b ) {
    return a.localeCompare( b, undefined, { caseFirst: 'upper' } );
  } );

  if ( param === 'desc' ) {
    latinArr.reverse();
    unicodeArr.reverse();
    return latinArr.concat( unicodeArr );
  }

  return unicodeArr.concat( latinArr );
}

