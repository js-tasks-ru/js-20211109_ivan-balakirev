/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter( path ) {
  return function( product ) {
    const pathArr = path.split( '.' );
    let _product = product;

    for ( let i = 0; i < pathArr.length; i ++ ) {
      if ( ! _product[ pathArr[ i ] ] ) {
        return;
      }
      _product = _product[ pathArr[ i ] ];
    }
    return _product;
  }
}

