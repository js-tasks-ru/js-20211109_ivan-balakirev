import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ColumnChart {
  constructor( {
    data = [],
    label = '',
    link = '',
    value = 0,
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    formatHeading = data => data
  } = {} ) {

    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.range = range;
    this.url = url;

    this.chartHeight = 50;

    if ( data.formatHeading ) {
      this.value = data.formatHeading( data.value );
    }

    this.render();
    this.update( this.range.from, this.range.to );
  }

  buildQuery() {
    const from = this.range.from.toISOString();
    const to = this.range.to.toISOString();

    return BACKEND_URL + this.url + '?from=' + from + '&to=' + to;
  }

  render() {
    const elm = document.createElement( 'div' );

    elm.innerHTML = this.getTemplate();
    this.element = elm.firstElementChild;

    // Remove placeholder
    if ( this.data.length ) {
      this.element.classList.remove( 'column-chart_loading' );
    }

    this.subElements = this.getSubElements( this.element );
  }

  getSubElements( element ) {
    const elms = element.querySelectorAll( '[data-element]' );
    const subElms = {};

    for ( const elm of elms ) {
      subElms[ elm.dataset.element ] = elm;
    }

    return subElms;
  }

  async loadData() {
    if ( ! this.query ) {
      return;
    }
    await fetchJson( this.query )
      .then( data => {
        this.data = data;
        this.element.classList.remove( 'column-chart_loading' );
      } );
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

  getColumns() {
    const maxValue = Math.max( ...Object.values( this.data ) );
    let $output = '';

    for ( const col of Object.values( this.data ) ) {
      const scale = this.chartHeight / maxValue;
      const percent = ( col / maxValue * 100 ).toFixed( 0 );

      $output += `<div style="--value: ${Math.floor( col * scale )}" data-tooltip="${percent}%"></div>`;
    }

    return $output;
  }

  async redraw() {
    this.subElements.body.innerHTML = this.getColumns();
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  async update( from, to ) {
    this.range.from = from;
    this.range.to = to;
    this.query = this.buildQuery();

    await this.loadData();

    this.redraw();
    return this.data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

