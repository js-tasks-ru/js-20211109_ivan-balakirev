export default class NotificationMessage {
  static element;
  element = NotificationMessage.element;

  constructor( message = '', {
    duration = 100,
    type = 'success'
  } = {} ) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    if ( NotificationMessage.element ) {
      this.destroy();
    }

    const elm = document.createElement( 'div' );

    elm.innerHTML = this.getTemplate();
    NotificationMessage.element = elm.firstElementChild;
    this.element = NotificationMessage.element;
  }

  getTemplate() {
    return `<div class="notification ${this.type}" style="--value:${this.duration}ms">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.message}
      </div>
    </div>
  </div>`;
  }

  show( container =  document.body) {
    container.append( this.element );

    if ( this.type === 'success' ) {
      this.element.classList.remove( 'error' );
      this.element.classList.add( 'success' );
    }

    if ( this.type === 'error' ) {
      this.element.classList.remove( 'success' );
      this.element.classList.add( 'error' );
    }

    this.timeout = setTimeout( function() {
      this.destroy();
    }.bind( this ), this.duration );
  }

  remove() {
    if ( this.element ) {
      this.element.remove();
    }
  }

  destroy() {
    clearTimeout( this.timeout );

    this.remove();
    this.element = null;
  }
}

