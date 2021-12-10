import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};
  // Allowed form data
  formData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 0,
    price: 100,
    discount: 0,
    images: [],
  };

  constructor( productId = null ) {
    this.productId = productId;
    this.editMode = !! this.productId;

    document.addEventListener( 'submit', this.submit );
  }

  submit = async ( e ) => {
    if ( e.target.closest( '.product-form' ) ) {
      e.preventDefault();
      const url = new URL( BACKEND_URL + '/api/rest/products' );
      const method = this.productId ? 'PATCH' : 'PUT';

      const $form = this.element.querySelectorAll( '.form-grid' )[ 0 ];
      const values = Object.values( $form );
      const numericValues = ['discount', 'price', 'quantity', 'status'];
      const formData = { ...this.formData };

      values.map( function( item ) {
        if ( this.formData[ item.name ] !== undefined ) {
          if ( numericValues.indexOf( item.name ) !== - 1 ) {
            formData[ item.name ] = parseInt( item.value );
          } else {
            formData[ item.name ] = escapeHtml( item.value );
          }
        }
      }.bind( this ) );


      if ( this.productId ) {
        formData.id = this.productId;
      }

      const images = document.querySelectorAll( '.sortable-list__item' );
      const imgArr = [];

      for ( const image of images ) {
        imgArr.push( {
            url: image.querySelectorAll( '[name="url"]' )[ 0 ].value,
            source: image.querySelectorAll( '[name="source"]' )[ 0 ].value,
          }
        )
      }

      if ( imgArr.length ) {
        formData.images = imgArr;
      }

      try {
        await fetchJson( url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify( formData ),
        } );

        // Dispatch events accordingly
        if ( this.productId ) {
          this.update();
        } else {
          this.save();
        }
      }
      catch ( e ) {
        console.log( e );
      }
    }
  }

  // Helper for Select tag
  isSelected( init, curr ) {
    if ( init === curr ) {
      return ' selected';
    } else {
      return '';
    }
  }

  async render() {
    const elm = document.createElement( 'div' );

    // Order matters for tests
    this.subcategories = await this.getCategories();
    this.product = await this.getProductDetails();

    // Wait for the template to load all the data via AJAX
    elm.innerHTML = await this.getTemplate();

    this.element = elm.firstElementChild;
    this.subElements = this.getSubElements( this.element );

    document.body.append( this.element );

    const uploadBtn = this.element.querySelectorAll( '[name="uploadImage"]' )[ 0 ];
    uploadBtn.addEventListener( 'click', this.uploadHandler );
  }

  uploadHandler = async ( e ) => {
    const $input = document.createElement( 'input' );
    const $imageList = this.element.querySelectorAll( '.sortable-list' )[ 0 ];
    const $uploadBtn = this.element.querySelectorAll( '[name="uploadImage"]' )[ 0 ];

    $input.type = 'file';
    $input.accept = 'image/*';
    document.body.append( $input );

    $input.hidden = true;
    $input.click();


    $input.addEventListener( 'change', async () => {
      const [file] = $input.files;

      if ( file ) {
        $uploadBtn.classList.add( 'is-loading' );
        $uploadBtn.disabled = true;

        const formData = new FormData();

        formData.append( 'image', file );

        await fetchJson( 'https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        } )
          .then( ( { data: { link } } ) => {
            const li = this.imageItemRow( link, file.name );
            const elm = document.createElement( 'div' );
            elm.innerHTML = li;

            $imageList.append( elm.firstElementChild );
          } )
          .catch( ( e ) => {
            console.error( e );
          } )
          .finally( () => {
            $input.remove();
            $uploadBtn.classList.remove( 'is-loading' );
          } );
      }
    } );
  }

  imageItemRow( url, source ) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="${url}" alt="delete">
        </button>
      </li>`;
  }

  async getProductDetails() {
    if ( ! this.productId ) {
      return this.formData;
    }
    const url = new URL( BACKEND_URL + '/api/rest/products' );
    url.searchParams.set( 'id', this.productId );

    await fetchJson( url )
      .then( data => {
        this.product = data[ 0 ];
      } )
      .catch( e => {
          this.product = this.formData;
        }
      );

    return this.product;
  }

  async getCategories() {
    const url = new URL( BACKEND_URL + '/api/rest/categories' );
    url.searchParams.set( '_sort', 'weight' );
    url.searchParams.set( '_refs', 'subcategory' );

    let categories = [];

    await fetchJson( url )
      .then( data => {
        categories = data;
      } )
      .catch( e => {
          categories = [];
        }
      );

    let data = [...categories];

    // Get subcategories
    const subcategoriesRaw = data.map( ( category ) => {
      const { subcategories } = category;
      return subcategories.map(
        ( { id, title } ) => ( { id, label: `${category.title} > ${title}` } )
      );
    } );


    let cleanSubcategories = [];
    for ( const subcategory of subcategoriesRaw ) {
      cleanSubcategories = cleanSubcategories.concat( cleanSubcategories, subcategory );
    }

    // Remove duplicates
    cleanSubcategories = [...new Set( cleanSubcategories )];

    // todo maybe check active somehow?
    return `<select id="subcategory" class="form-control" name="subcategory">${cleanSubcategories.map( function( item ) {
      return `<option value="${item.id}">${item.label}</option>`;
    }.bind( this ) ).join( '' )}</select>`;
  }

  save = () => {
    const event = new CustomEvent( 'product-updated', {
      detail: 'Product Saved',
    } );
    this.element.dispatchEvent( event );
  }

  update = () => {
    const event = new CustomEvent( 'product-save', {
      detail: 'Product id: ' + this.productId,
    } );
    this.element.dispatchEvent( event );
  }

  getImages( product ) {
    const images = product.images ? product.images : [];

    return images.map( function( item ) {
      return `<li class="products-edit__imagelist-item sortable-list__item" style="">
              <input type="hidden" name="url" value="${item.url}">
              <input type="hidden" name="source" value="${item.source}">
              <span>
              <img src="icon-grab.svg" data-grab-handle="" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
              <span>${item.source}</span>
              </span>

              <button type="button">
              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>`;
    } ).join( '' );
  }

  getSubElements( element ) {
    const subElements = {};
    const elements = element.querySelectorAll( '[data-element]' );

    for ( const item of elements ) {
      subElements[ item.dataset.element ] = item;
    }

    return subElements;
  }

  async getTemplate() {
    // Something failed and product isn't found
    if ( this.product === undefined ) {
      return;
    }

    return `<div class="product-form">
                <form data-element="productForm" class="form-grid">
                  <div class="form-group form-group__half_left">
                    <fieldset>
                      <label class="form-label">Название товара</label>
                      <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара" value="${escapeHtml( this.product.title )}">
                    </fieldset>
                  </div>
                  <div class="form-group form-group__wide">
                    <label class="form-label">Описание</label>
                    <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара">${this.product.description}</textarea>
                  </div>

                  <div class="form-group form-group__wide" data-element="sortable-list-container">
                    <label class="form-label">Фото</label>
                    <div data-element="imageListContainer">
                    <ul class="sortable-list">
                       ${this.getImages( this.product )}
                    </ul>

                      </div>
                    <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
                  </div>

                  <div class="form-group form-group__half_left">
                    <label class="form-label">Категория</label>
                    ${this.subcategories}
                  </div>
                  <div class="form-group form-group__half_left form-group__two-col">
                    <fieldset>
                      <label class="form-label">Цена ($)</label>
                      <input required="" type="number" name="price" id="price" class="form-control" placeholder="100" value="${this.product.price}">
                    </fieldset>
                    <fieldset>
                      <label class="form-label">Скидка ($)</label>
                      <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0" value="${this.product.discount}">
                    </fieldset>
                  </div>
                  <div class="form-group form-group__part-half">
                    <label class="form-label">Количество</label>
                    <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1" value="${this.product.quantity}">
                  </div>
                  <div class="form-group form-group__part-half">
                    <label class="form-label">Статус</label>
                    <select class="form-control" name="status" id="status">
                      <option value="1"${this.isSelected( 1, this.product.status )}>Активен</option>
                      <option value="0"${this.isSelected( 0, this.product.status )}>Неактивен</option>
                    </select>
                  </div>
                  <div class="form-buttons">
                    <button type="submit" name="save" class="button-primary-outline">
                      Сохранить товар
                    </button>
                  </div>
                </form>
            </div>`;
  }

  remove() {
    if ( this.element ) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;

    document.removeEventListener( 'submit', this.submit );
  }
}
