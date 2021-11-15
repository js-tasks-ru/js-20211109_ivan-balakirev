/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings( arr, param = 'asc' ) {
  // Make a copy not to change the original array
  let newArr = [...arr];

  return newArr.sort( function( a, b ) {
    const first = param === 'desc' ? b : a;
    const last = param === 'desc' ? a : b;

    return first.localeCompare( last, ['ru', 'en'], { caseFirst: 'upper' } );
  } );
}

