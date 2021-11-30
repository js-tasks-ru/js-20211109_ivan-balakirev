class Tooltip {
  constructor() {
    // Create Singleton
    if ( ! Tooltip.instance ) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  initialize() {
    document.addEventListener( 'pointerover', this.show.bind( this ) );
    document.addEventListener( 'pointerout', this.hide.bind( this ) );
  }

  render( message ) {
    const element = document.createElement( 'div' );
    element.innerHTML = `<div class="tooltip">${message}</div>`;
    this.element = element.firstElementChild;
    document.body.append( this.element );
  }

  show( e ) {
    if ( e.target.dataset.tooltip !== undefined ) {
      this.render( e.target.dataset.tooltip );
    }
    document.addEventListener( 'pointermove', this.getPosition.bind( this ) );
  }

  hide() {
    this.remove();
    document.removeEventListener( 'pointermove', this.getPosition );
  }

  getPosition( e ) {
    if ( e.target.dataset.tooltip !== undefined ) {
      this.element.style.left = `${e.clientX}px`;
      this.element.style.top = `${e.clientY + 10}px`;
    }
  }

  removeListeners() {
    document.removeEventListener( 'pointerover', this.show );
    document.removeEventListener( 'pointerout', this.hide );
  }

  remove() {
    if ( this.element ) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeListeners();
    this.element = null;
  }
}

export default Tooltip;
