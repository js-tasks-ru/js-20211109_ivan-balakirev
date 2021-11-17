/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols( string, size ) {
  const arrFromString = string.split( '' );

  let trimmed = '';
  let prevChar = '';
  let counter = 1;

  if ( size === undefined ) {
    return string;
  }

  if ( size === 0 ) {
    return '';
  }

  for ( let i = 0; i < arrFromString.length; i ++ ) {

    if ( prevChar !== arrFromString[ i ] ) {
      trimmed += arrFromString[ i ];
      counter = 1;
    }

    if ( prevChar === arrFromString[ i ] && counter < size ) {
      trimmed += arrFromString[ i ];
      counter ++;
    }

    prevChar = arrFromString[ i ];
  }

  return trimmed;
}


