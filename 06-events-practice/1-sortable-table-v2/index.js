export default class SortableTable {
  constructor( headersConfig, {
    data = [],
    sorted = {}
  } = {} ) {
    this.headerConfig = headersConfig;
    this.sorted = sorted;

    // No need to seek for logic here
    this.data = Array.isArray( data ) ? data : data.data;

    this.render();
  }

  render() {
    const elm = document.createElement( 'div' );
    elm.innerHTML = this.template;
    this.element = elm.firstElementChild;

    document.body.append( elm );
    this.subElements = this.getSubElements( this.element );

    // Apply default sorting
    if ( this.sorted.id ) {
      this.sort( this.sorted.id, this.sorted.order ? this.sorted.order : null );
    } else {
      this.subElements.header.addEventListener( 'pointerdown', this.hightlightArrowEvents );
    }
  }

  hightlightArrowEvents = ( e ) => {
    const closestHeader = e.target.closest( '.sortable-table__cell' );
    const isSortable = closestHeader.getAttribute( 'data-sortable' );

    // Do nothing
    if ( isSortable !== 'true' ) {
      return;
    }

    const direction = closestHeader.getAttribute( 'data-order' );
    const id = closestHeader.getAttribute( 'data-id' )

    // Toggle direction and sort
    this.sort( id, ( direction === 'desc' ) ? 'asc' : 'desc' );
  }


  highlightActiveArrow( id = this.sorted.id, order = this.sorted.order ) {
    const $header = document.querySelectorAll( '.sortable-table__header' )[ 0 ];
    const $arrows = $header.querySelectorAll( '[data-sortable="true"]' );

    for ( const arrow of $arrows ) {
      if ( arrow.getAttribute( 'data-id' ) === id ) {
        arrow.setAttribute( 'data-order', order )
      } else {
        arrow.setAttribute( 'data-order', '' );
      }
    }
  }

  remove() {
    if ( this.element ) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove()
    this.element = null;
    this.subElements = {};
  }

  getSubElements( element ) {
    return {
      body: element.getElementsByClassName( 'sortable-table__body' )[ 0 ],
      header: element.getElementsByClassName( 'sortable-table__header' )[ 0 ],
    };
  }

  isSortable( type ) {
    for ( const items of this.headerConfig ) {
      if ( items.id === type ) {
        return !! items.sortable;
      }
    }

    return false;
  }

  sort( field = 'title', direction = 'desc' ) {
    if ( ! this.isSortable( field ) ) {
      return;
    }

    this.data = this.sortHelper( this.data, direction, field );
    this.element.innerHTML = this.template;
    this.subElements = this.getSubElements( this.element );

    this.subElements.header.addEventListener( 'pointerdown', this.hightlightArrowEvents );

    this.highlightActiveArrow( field, direction );
  }

  sortHelper( arr, direction = 'asc', field ) {
    // Make a copy not to change the original array
    let newArr = [...arr];

    return newArr.sort( function( a, b ) {
      const first = direction === 'desc' ? b[ field ] : a[ field ];
      const last = direction === 'desc' ? a[ field ] : b[ field ];

      if ( typeof first === 'number' ) {
        return first - last;
      } else if ( typeof first === 'string' ) {
        return first.localeCompare( last, ['ru', 'en'] );
      }
    } );
  }

  get template() {
    return `<div data-element="productsContainer" class="products-list__container">
                ${this.getHeaderTemplate()}
              <div data-element="body" class="sortable-table__body">
                ${this.getItemTemplate()}
              </div>
              <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

              <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                <div>
                  <p>No products satisfies your filter criteria</p>
                  <button type="button" class="button-primary-outline">Reset all filters</button>
                </div>
              </div>
            </div>`;
  }

  getHeaderTemplate() {
    let $output = '<div data-element="header" class="sortable-table__header sortable-table__row">\n';
    if ( this.headerConfig && this.headerConfig.length ) {
      $output += this.headerConfig.map( function( data ) {

        const $arrow = data.sortable
          ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
             </span>`
          : '';
        return `<div class="sortable-table__cell" data-id="${data.id}" data-sortable="${data.sortable}" data-order="">
                    <span>${data.title}</span>
                    ${$arrow}
                </div>\n`;
      } ).join( '' );
    }
    $output += "\n</div>";

    return $output;
  }

  getItemTemplate( data ) {
    data = data ? data : this.data;

    if ( data && data.length ) {
      return this.data.map( function( item ) {
        return `<a href="/products/${item.id}" class="sortable-table__row">${this.getCells( item, this.headerConfig )}</a>`;
      }.bind( this ) ).join( '' );
    }
  }

  getCells( item ) {
    return this.headerConfig.map( function( config ) {
      if ( config.template ) {
        return config.template( item[ config.id ] );
      } else {
        return `<div class="sortable-table__cell">${item[ config.id ]}</div>`;
      }
    } ).join( '' );
  }
}

