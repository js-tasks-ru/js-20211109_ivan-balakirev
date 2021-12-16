export default class SortableList {

  subElements = {};

  currentItem = null;

  constructor( { items = [] } = {} ) {
    this.items = items;
    console.log(items);
    this.render();
  }

  render() {

    this.element = document.createElement( 'ul' );
    this.element.className = 'sortable-list';

    for ( const item of this.items ) {
      item.classList.add( 'sortable-list__item' );
    }

    this.element.append( ...this.items );
    document.body.append( this.element );
    this.subElements = this.getSubElements( this.element );

    this.initListeners();
  }

  initListeners() {
    this.element.addEventListener( 'pointerdown', this.pointerDown );
  }

  pointerDown = ( event ) => {
    if ( event.target.hasAttribute( 'data-delete-handle' ) ) {
      event.target.closest( 'li' ).remove();
    } else if ( event.target.hasAttribute( 'data-grab-handle' ) ) {
      this.dragStart( event.target, event );
    }
  }

  dragStart = ( element, { clientX, clientY } ) => {
    this.currentItem = element.closest( 'li' );
    this.elementInitialIndex = [...this.element.children].indexOf( this.currentItem );

    const { x, y } = this.currentItem.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = this.currentItem;

    this.itemCoordinates = {
      x: clientX - x,
      y: clientY - y
    };

    this.currentItem.style.width = `${offsetWidth}px`;
    this.currentItem.style.height = `${offsetHeight}px`;
    this.currentItem.classList.add( 'sortable-list__item_dragging' );

    this.placeholder = this.createPlaceholder( offsetWidth, offsetHeight );

    this.currentItem.after( this.placeholder );
    this.element.append( this.currentItem );

    this.moveItem( clientX, clientY );

    document.addEventListener( 'pointermove', this.dragMove );
    document.addEventListener( 'pointerup', this.dragEnd );
  }

  createPlaceholder( width, height ) {
    const element = document.createElement( 'li' );

    element.className = 'sortable-list__placeholder';
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;

    return element;
  }

  dragMove = ( { clientX, clientY } ) => {
    this.moveItem( clientX, clientY );

    if ( ! this.placeholder ) {
      return;
    }
    const prevElem = this.placeholder.previousElementSibling;
    const nextElem = this.placeholder.nextElementSibling;

    const { firstElementChild, lastElementChild } = this.element;
    const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect();

    if ( clientY < firstElementTop ) {
      return firstElementChild.before( this.placeholder );
    }

    if ( clientY > bottom ) {
      return lastElementChild.after( this.placeholder );
    }

    if ( prevElem ) {
      const { top, height } = prevElem.getBoundingClientRect();
      const middlePrevElem = top + height / 2;

      if ( clientY < middlePrevElem ) {
        return prevElem.before( this.placeholder );
      }
    }

    if ( nextElem ) {
      const { top, height } = nextElem.getBoundingClientRect();
      const middleNextElem = top + height / 2;

      if ( clientY > middleNextElem ) {
        return nextElem.after( this.placeholder );
      }
    }
  }

  dragEnd = () => {
    if ( this.currentItem ) {
      this.currentItem.classList.remove( 'sortable-list__item_dragging' );
      this.currentItem.style.cssText = '';
    }

    if ( this.placeholder ) {
      this.placeholder.replaceWith( this.currentItem );
    }

    this.currentItem = null;

    document.removeEventListener( 'pointermove', this.dragMove );
    document.removeEventListener( 'pointerup', this.dragEnd );
  }

  moveItem( clientX, clientY ) {
    this.currentItem.style.left = `${clientX - this.itemCoordinates.x}px`;
    this.currentItem.style.top = `${clientY - this.itemCoordinates.y}px`;
  }

  getSubElements( element ) {
    return element.querySelectorAll( '.sortable-list__item' );
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.currentItem = null;
  }

  remove() {
    if ( this.element ) {
      this.element.remove();
    }
  }
}


