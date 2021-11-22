export default class ColumnChart {
  constructor( data = {} ) {

    this.data = data.data;
    this.label = data.label;
    this.value = data.value;
    this.link = data.link ? data.link : null;

    this.chartHeight = 50;

    if ( data.formatHeading ) {
      this.value = data.formatHeading( data.value );
    }

    this.render();
  }

  render() {
    const elm = document.createElement( 'div' );

    elm.innerHTML = this.getTemplate();
    this.element = elm.firstElementChild;

    // Remove placeholder
    if ( this.data && this.data.length ) {
      this.element.classList.remove( 'column-chart_loading' );
    }

    this.subElements = this.chartItems( this.element );
  }

  chartItems( element ) {
    const elms = element.querySelectorAll( '[data-element]' );
    const subElms = {};

    for ( const elm of elms ) {
      subElms[ elm.dataset.element ] = elm;
    }

    return subElms;
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumns( this.data )}
          </div>
        </div>
      </div>
    `;
  }

  getColumns( data ) {
    if ( ! data || ! data.length ) {
      return;
    }

    const maxValue = Math.max( ...data );
    let $output = '';

    for ( const col of data ) {
      const scale = this.chartHeight / maxValue;
      const percent = ( col / maxValue * 100 ).toFixed( 0 );

      $output += `<div style="--value: ${Math.floor( col * scale )}" data-tooltip="${percent}%"></div>`;
    }

    return $output;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  update( data = [] ) {
    this.subElements.body.innerHTML = this.getColumns( data );
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

