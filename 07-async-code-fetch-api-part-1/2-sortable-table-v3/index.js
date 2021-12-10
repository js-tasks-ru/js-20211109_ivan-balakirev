import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor( headersConfig, {
    data = [],
    isSortLocally = false,
    sorted = {
      id: headersConfig.find( item => item.sortable ).id,
      order: 'asc',
    },
    url = '',
  } = {} ) {
    this.headerConfig = headersConfig;

    // No need to seek for logic here
    this.data = Array.isArray( data ) ? data : data.data;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.url = url;

    // Number of posts to be loaded
    this.chunk = 10;
    this.start = 0;
    this.end = this.chunk;

    // Set offset for the infinite scroll
    this.scrollOffset = 300;

    // Save loading status
    this.loading = false;

    this.windowHeight = window.innerHeight;

    this.render();
    this.initEventListeners();
  }

  async render() {
    const elm = document.createElement( 'div' );
    elm.innerHTML = this.template;
    this.element = elm.firstElementChild;
    this.subElements = this.getSubElements( this.element );

    // Apply default sorting
    await this.sort( this.sorted.id, this.sorted.order );

    document.body.append( this.element );
  }


  initEventListeners() {
    document.addEventListener( 'scroll', this.scroll );
    window.addEventListener( 'resize', this.resize );
    document.addEventListener( 'pointerdown', this.click );
  }

  removeEventListeners() {
    document.removeEventListener( 'scroll', this.scroll );
    window.removeEventListener( 'resize', this.resize );
    document.removeEventListener( 'pointerdown', this.click );
  }

  resize = () => {
    this.windowHeight = window.innerHeight;
  }

  scroll = async () => {
    const elmHeight = this.element.offsetHeight;
    const scrollTop = window.scrollY;

    // Load items before we reach the element
    if ( ! this.loading && ( scrollTop + this.windowHeight >= elmHeight - this.scrollOffset ) ) {
      this.loading = true;

      this.start = 0;
      this.end += this.chunk;

      const query = this.buildQuery( { start: this.start, end: this.end } );

      await this.loadData( query );
    }
  }

  async redraw() {
    this.subElements.body.innerHTML = this.getItemTemplate();
  }

  buildQuery( {
    order = 'asc',
    param = 'title',
    start = 0,
    end = 30,
  } = {} ) {
    return BACKEND_URL + '/'
      + this.url
      + '?_sort=' + param
      + '&_order=' + order + '&_start=' + start + '&_end=' + end;
  }

  async sort( field, direction ) {
    this.sorted.id = field;
    this.sorted.order = direction;

    if ( this.isSortLocally ) {
      await this.sortOnClient( field, direction );
    } else {
      await this.sortOnServer( field, direction );
    }
  }

  sortHelper( arr, direction = 'asc', field ) {
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


  async sortOnClient( id, order ) {
    this.data = this.sortHelper( this.data, order, id );


    await this.highlightActiveArrow( id, order );
    await this.redraw();
  }

  async sortOnServer( id, order ) {
    this.sorted.id = id;
    this.sorted.order = order;

    const query = this.buildQuery( { order: order, param: id, start: 0, end: 30 } );

    await this.loadData( query );
  }

  async loadData( query ) {
    if ( ! query ) {
      return;
    }

    await fetchJson( query )
      .then( data => {
        this.data = data;
        this.redraw();
        this.loading = false;
      } );
  }

  click = async ( e ) => {
    const closestHeader = e.target.closest( '.sortable-table__cell' );

    if ( ! closestHeader ) {
      return;
    }

    const isSortable = closestHeader.getAttribute( 'data-sortable' );

    // Do nothing
    if ( isSortable !== 'true' ) {
      return;
    }

    const direction = ( closestHeader.getAttribute( 'data-order' ) === 'desc' ) ? 'asc' : 'desc';
    const id = closestHeader.getAttribute( 'data-id' )


    this.highlightActiveArrow( id, direction );

    // Toggle direction and sort
    await this.sort( id, direction );
  }


  async highlightActiveArrow( id = this.sorted.id, order = this.sorted.order ) {
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
    this.remove();
    this.removeEventListeners();
    this.element = null;
    this.subElements = {};
  }

  getSubElements( element ) {
    const result = {};
    const elements = element.querySelectorAll( '[data-element]' );

    for ( const subElement of elements ) {
      const name = subElement.dataset.element;

      result[ name ] = subElement;
    }

    return result;
  }

  isSortable( type ) {
    for ( const items of this.headerConfig ) {
      if ( items.id === type ) {
        return !!items.sortable;
      }
    }

    return false;
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

  getItemTemplate() {
    const data = [...this.data];
    if ( data && data.length ) {
      return data.map( function( item ) {
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
