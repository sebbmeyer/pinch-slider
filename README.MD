# Overview

pinch-slider is a touch slider for which can be zoomed or pinched for vue.js.

# Install

```bash
$ npm install pinch-slider
```

## Import using module
Import components to your project:

```JavaScript
require('pinch-slider/dist/pinch-slider.css');

// in ES6 modules
import { PinchSlider, AlloyFinger, AlloyFingerVue } from 'pinch-slider';

// in CommonJS
const { PinchSlider, AlloyFinger, AlloyFingerVue } = require('pinch-slider');

// in Global variable
const { PinchSlider, AlloyFinger, AlloyFingerVue } = PinchSlider;
```

And register components:

```javascript
Vue.use( AlloyFingerVue, { AlloyFinger: AlloyFinger }); // use AlloyFinger's plugin
Vue.component('pinch-slider', PinchSlider);
```

## Import using script tag

``` HTML
<link rel="stylesheet" href="../node-modules/pinch-slider/dist/pinch-slider.css" charset="utf-8">
<script src="../node-modules/pinch-slider/dist/pinch-slider.js"></script>
```

```JavaScript
const { PinchSlider, AlloyFinger, AlloyFingerVue } = PinchSlider;
Vue.use( AlloyFingerVue, { AlloyFinger: AlloyFinger }); // use AlloyFinger's plugin

Vue.component('pinchSlider', PinchSlider);
new Vue({
    el: '.vue-wrapper',
    data: {
        imgs: [
            { src: 'https://cdn.pixabay.com/photo/2016/11/07/05/13/map-1804891__480.jpg' },
            { src: 'https://cdn.pixabay.com/photo/2016/12/09/08/09/texture-1893788__480.jpg' },
            {src:'https://cdn.pixabay.com/photo/2016/10/20/18/35/sunrise-1756274__480.jpg'}
        ],
        currentIndex: 0,
        isFull:false
    },
    methods:{
      showFull() {
        this.isFull = true;
      },
      changePageNo(data) {
            this.currentIndex = data.index;
        }
    }
});
```

# Usage

Work on a Vue instance:

```HTML
<div class="slider-container">
      <pinch-slider :slides="imgs" :enable-pinch="false" :current-index='currentIndex' @on-slide-change="changePageNo" @on-img-click="showFull">
      </pinch-slider>
</div>
```

```CSS
.slider-container {
        width: 100%;
        height: 500px;
        overflow: hidden;
    }
```

# Options

Here list Props and events on the component

| Option | Description |
| ----- | ----- |
| slides | Array(default: []) image lists to be loaded. |
| enablePinch | Boolean(default: true). |
| currentIndex | Number (default:0) - current image showing |
| srcAtr | String (default:'src') - key for the slider object which contains the image. |
| thumbAtr | String (default:'thumb') - key for the slider object which contains the thumbnail. |
| lazyLoad | Boolean (default:false) - if true, the images won't be downloaded until swiped near to them. |
| loadingImgUrl | String (default:'') - if lazyLoad, the loading image shown before the real image downloaded. |
| maxCachedSize | Number (defailt:15) - determines the size of images will be hold in cache (if the presentation has big images set this to a lower value) |
| showThumbnails | Boolean (default:false) - adds a button to view thumbnails |
| @on-slide-change | function - trigged when the slider changes, passes current index for the callback |
| @on-img-click | function - trigged when image be clicked, this event cancels bubble |
| @on-slide-tap | function - trigged when tapped on slide, returns event |
| @on-slide-long-tap | function - trigged when long tapped on slide, returns event |
| @on-img-tap | function - trigged when tapped on image, returns event |
| @on-img-long-tap | function - trigged when long tapped on image, returns event |


# Develop

```bash
$ npm run build
```

# Many thanks to 
[AlloyFinger](https://github.com/AlloyTeam/AlloyFinger)

# License
MIT

clone svg from FontAwesome: https://fontawesome.com/icons/clone?style=regular
License: https://fontawesome.com/license