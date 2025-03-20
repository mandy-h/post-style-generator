/* ========== Constants ========== */

const REGEXP = Object.freeze({
  /* These do not work with the 'pattern' attribute */
  color: /^(#([0-9a-fA-F]{3}){1,2}|[rR][gG][bB]\(((1?\d{1,2}|2([0-4]\d|5[0-5])),\s?){2}(1?\d{1,2}|2([0-4]\d|5[0-5]))\))$/,
  imageUrl: /(http)s?:?(\/\/[^"']*\.(?:jpg|jpeg|gif|png|svg))/i
});

const LABELS = Object.freeze({
  'background-attachment': 'Fixed background',
  'background-color': 'Background color',
  'background-image': 'Background image',
  'background-position': 'Background position',
  'background-repeat': 'Background repeat',
  'border-color': 'Border color',
  'border-style': 'Border style',
  'border-width': 'Border width',
  'color': 'Font color',
  'font-size': 'Font size',
  'height': 'Custom height',
  'margin-bottom': 'Margin (bottom)',
  'margin-left': 'Margin (left)',
  'margin-right': 'Margin (right)',
  'margin-top': 'Margin (top)',
  'padding-bottom': 'Padding (bottom)',
  'padding-left': 'Padding (left)',
  'padding-right': 'Padding (right)',
  'padding-top': 'Padding (top)',
  'repeat-background': 'Repeat background',
  'vertical-align': 'Vertical alignment',
  'width': 'Custom width'
});

/* ========== Components ========== */

const Modal = {
  template: '#modal-template'
};

const ImageUrlInput = {
  template: '#image-input-template',
  props: {
    isRequired: {
      type: Boolean,
      default: false
    },
    cssProp: {
      type: String
    }
  },
  data () {
    return {
      value: ''
    }
  },
  computed: {
    isValid () {
      if (this.value === '' && !this.isRequired) {
        return true;
      } else {
        const test = REGEXP.imageUrl.test(this.value);
        this.$emit('validated', test);
        return test;
      }
    }
  }
};

const ColorInput = {
  template: '#color-input-template',
  props: {
    cssProp: String
  },
  data () {
    return {
      value: ''
    }
  },
  computed: {
    isValid () {
      if (this.value === '') {
        return true;
      } else {
        return REGEXP.color.test(this.value);
      }
    }
  }
};

const NumberInput = {
  template: '#number-input-template',
  props: {
    cssProp: String,
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    }
  },
  data () {
    return {
      value: ''
    }
  },
  computed: {
    isValid () {
      if (this.value === '') {
        /* There are no required numerical inputs, so empty value is okay */
        return true;
      } else {
        return (Number.isInteger(this.value) && this.value >= this.min && this.value <= this.max);
      }
    }
  }
};

const DropdownInput = {
  template: '#dropdown-input-template',
  props: {
    value: String,
    cssProp: String,
    options: {
      type: Object,
      required: true
    },
    emptyOption: {
      type: Boolean,
      default: false
    }
  }
};

const ContainerStyles = {
  template: '#container-styles-template',
  components: { ColorInput, NumberInput, ImageUrlInput, DropdownInput },
  props: {
    selectedTemplate: {
      type: String
    },
    options: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      borderStyle: '',
      backgroundImage: false,
      borderStyleOptions: {
        'solid': 'solid',
        'dashed': 'dashed',
        'dotted': 'dotted',
        'double': 'double',
        'inset': 'inset',
        'outset': 'outset'
      },
      backgroundRepeatOptions: {
        'no-repeat': 'don\'t repeat',
        'repeat': 'repeat',
        'repeat-x': 'repeat horizontally',
        'repeat-y': 'repeat vertically'
      },
      backgroundPositionOptions: {
        'center': 'center',
        'top left': 'top left',
        'top right': 'top right',
        'bottom right': 'bottom right',
        'bottom left': 'bottom left'
      },
      verticalAlignOptions: {
        'top': 'top',
        'middle': 'middle',
        'bottom': 'bottom'
      }
    };
  }
};

const MainForm = {
  template: '#main-form-template',
  components: { ContainerStyles, ImageUrlInput, DropdownInput },
  methods: {
    validateForm (event) {
      event.preventDefault();
      if (document.getElementById('main-form').checkValidity() && !document.querySelector('.inline-error')) {
        this.$root.$emit('generate-html');
      }
    }
  },
  data () {
    return {
      selectedTemplate: 'no-image',
      addOuterDiv: false,
      templateOptions: {
        'no-image': '1. No Image',
        'image-right-float': '2. Image on Right (Float Method)',
        'image-right-table': '3. Image on Right (Table Method)',
        'image-top': '4. Image on Top'
      },
      imageStyleOptions: [
        'width', 'height', 'margin', 'vertical-align'
      ],
      postStyleOptions: [
        'color', 'font-size', 'background', 'border', 'padding', 'margin'
      ],
      outerStyleOptions: [
        'background', 'border', 'padding', 'margin'
      ]
    }
  },
  watch: {
    selectedTemplate (newValue, oldValue) {
      if (newValue === 'image-right-table') {
        this.addOuterDiv = false;
      }
      this.$root.$emit('update-data', { key: 'selectedTemplate', value: newValue });
    },
    addOuterDiv (newValue, oldValue) {
      this.$root.$emit('update-data', { key: 'addOuterDiv', value: newValue });
    }
  }
};

const HtmlOutput = {
  template: '#html-output-template',
  methods: {
    copyHtml () {
      document.querySelector('#html-output').select();
      document.execCommand('copy');
    },
    getImageSource () {
      return document.querySelector('#image-url-field input').value;
    },
    getStyleString (type) {
      const fieldsEl = document.querySelector(`#${type}-style-fields`);
      if (fieldsEl === null) {
        return;
      }
      
      let str = '';
      Object.values(fieldsEl.elements).forEach((el) => {
        if (el.value && el.name) {
          let unit = '';
          if (el.type === 'number') {
            unit = 'px';
          } else if (el.type === 'checkbox' && !el.checked) {
            return;
          }
          
          if (el.name !== 'background-image') {
            str += `${el.name}:${el.value}${unit};`;
          } else {
            str += `${el.name}:url('${el.value}');`;
          }
        }
      });
      
      return str;
    },
    getTemplate (templateName) {
      let template;
      
      switch (templateName) {
        case 'no-image':
          template = `${this.addOuterDiv ? `<div style="${this.outerStyle}">\n\n` : ''}<div style="${this.postStyle}">%POST%</div>${this.addOuterDiv ? `\n\n</div>` : ''}`;
          break;
        case 'image-right-float':
          template = `<img src="${this.imgSrc}" style="float:right;${this.imgStyle}">\n\n${this.addOuterDiv ? `<div style="${this.outerStyle}">\n\n` : ''}<div style="${this.postStyle}">%POST%</div>${this.addOuterDiv ? `\n\n</div>` : ''}`;
          break;
        case 'image-right-table':
          template = `<table border="0" cellpadding="0" cellspacing="0" style="width:100%;${this.postStyle}"><tr>\n\n<td>%POST%</td>\n\n<td style="width:100px;"><img src="${this.imgSrc}" style="${this.imgStyle}"></td>\n\n</tr></table>`;
          break;
        case 'image-top':
          template = `<img src="${this.imgSrc}" style="${this.imgStyle}">\n\n${this.addOuterDiv ? `<div style="${this.outerStyle}">\n\n` : ''}<div style="${this.postStyle}">%POST%</div>${this.addOuterDiv ? `\n\n</div>` : ''}`;
          break;
        default:
          console.error(`getTemplate() error: No template named ${templateName}`);
      }
      
      return template;
    },
    generateHtml () {
      if (this.selectedTemplate !== 'no-image') {
        this.imgStyle = this.getStyleString('image');
        this.imgSrc = this.getImageSource();
      }
      
      if (this.addOuterDiv) {
        this.outerStyle = this.getStyleString('outer');
      }
      
      this.postStyle = this.getStyleString('post');
      
      this.output = this.getTemplate(this.selectedTemplate);
      const appearanceHtml = this.output.replace('%POST%', `<div contenteditable>Click to edit text. Try it with long and short posts!</div>`);
      this.$root.$emit('update-data', { key: 'appearanceHtml', value: appearanceHtml });
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.$root.$on('generate-html', this.generateHtml);
      document.querySelector('#html-output').addEventListener('animationend', function (event) {
        event.currentTarget.classList.remove('flash');
      });
    });
  },
  props: {
    selectedTemplate: {
      type: String,
      required: true
    },
    addOuterDiv: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      imgSrc: '',
      imgStyle: '',
      postStyle: '',
      outerStyle: '',
      output: ''
    }
  },
  watch: {
    output () {
      document.querySelector('#html-output').classList.add('flash');
    }
  }
};

/* ========== Vue code ========== */

const app = new Vue({
  template: '#app-template',
  components: { Modal, MainForm, HtmlOutput },
  methods: {
    updateData (params) {
      this[params.key] = params.value;
    },
    switchTab (tab) {
      this.activeTab = tab;
    }
  },
  created () {
    this.$root.$on('update-data', this.updateData);
  },
  data () {
    return {
      activeTab: 'edit-tab',
      selectedTemplate: 'no-image',
      addOuterDiv: false,
      appearanceHtml: '<strong class="required">Oops, nothing to see here. Please click "Generate HTML" before viewing this tab.</strong>',
      showSplashModal: true
    };
  }
}).$mount('#app');