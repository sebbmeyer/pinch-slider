<style scoped>
    .pinch-slider,
    .ps-slider{
        white-space: nowrap;
        height:100%;
        width:100%;
    }
    .ps-slider .ps-img-wrapper{
        height:100%;
        min-width:100%;
        vertical-align: top;
        display: -webkit-inline-box;
        display: -ms-inline-flexbox;
        display: inline-flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        position: relative;
        text-align: center;
        overflow:hidden;
    }

    .ps-img-wrapper img{
        height:100%;
        /*min-width:100%;*/
        -o-object-fit: contain;
        object-fit: contain;
        background-size: 100%;
        background-size: 100vw;
        background-position: center center;
        background-repeat: no-repeat;
        /*background-image: url("../assets/images/loading.gif");*/
        background-color: black;
        min-height: 2rem;
        position: absolute;
        top: -99999px;
        right: -99999px;
        left: -99999px;
        bottom: -99999px;
        margin: auto;
    }

    .ps-full-mode-slider .ps-img-wrapper img{
        -o-object-fit: contain;
        object-fit: contain;
        height:auto;
    }
    .ps-thumbnails{
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 15vh;
        overflow: scroll;
        background-color: rgba(0,0,0,0.5);
        padding: 10px;
    }
    .ps-thumbnail-wrapper {
        display: inline-block;
        margin: 0 2%;
        height: 100%;
    }
    .ps-thumbnail-wrapper img{
        max-width:100%;
        max-height:100%;
    }
    .ps-thumbnail-wrapper .slide-number{
        width: 100%;
        font-size: 3em;
        color: white;
        text-align: center;
    }
    @media screen and (max-width: 576px) {
        .ps-thumbnails{
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 10vh;
            overflow: scroll;
        }
        .ps-thumbnail-wrapper {
            display: inline-block;
            margin: 0 3%;
        }
        .ps-thumbnail-wrapper .slide-number{
            width: 100%;
            font-size: 3em;
            color: white;
            text-align: center;
        }
    }
</style>

<template>
    <div class="pinch-slider">
        <div ref="psSlider" class="ps-slider"
             v-finger:tap="tap"
             v-finger:long-tap="longTap"
             v-finger:rotate="rotate"
             v-finger:swipe="swipe"
             v-finger:touch-start="touchStart"
             v-finger:touch-move="touchMove"
             v-finger:touch-end="touchEnd"
             v-finger:touch-cancel="touchCancel">
            <div v-for="(slide,index) in domSlides" class="ps-img-wrapper">
                <img :width='windowWidth'
                     :src="(index === 0 || !lazyLoad) ? slide[srcAtr]: loadingImgUrl"
                     v-finger:multipoint-start="multipointStart"
                     v-finger:multipoint-end="multipointEnd"
                     v-finger:pinch="pinch"
                     v-finger:swipe.stop.prevent="imageSwipe"
                     v-finger:press-move="pressMove"
                     v-finger:double-tap="doubleTap"
                     v-finger:single-tap="singleTap"
                     v-finger:long-tap="longImgTap"
                     v-on:click="click">
            </div>
        </div>
        <div ref="psThumbnails" class="ps-thumbnails" v-if="showThumbnails" v-finger:swipe="thumbnailSwipe">
            <div v-for="(slide, index) in slides" class="ps-thumbnail-wrapper" v-show="showThumbs">
                <img class="ps-thumbnail"
                     :src="(slide[thumbAtr] && slide[thumbAtr] !== '') ? slide[thumbAtr] : slide[srcAtr]"
                     v-on:click="clickThumbnail(index)"
                >
                <!--<div class="slide-number">{{ index + 1 }}</div>-->
            </div>
        </div>
    </div>
</template>

<script type="text/javascript">
    import To from './To.js';

    //component begin

    export default {
        name: 'pinch-slider',

        props: {
            'slides':Array,
            'srcAtr':{
                type: String,
                default: 'src'
            },
            'thumbAtr':{
                type: String,
                default: 'thumb'
            },
            'enablePinch':{
                type: Boolean,
                default: true
            },
            'currentIndex':{
                type: Number,
                default: 0
            },
            'lazyLoad':{
                type: Boolean,
                default: false,
            },
            'loadingImgUrl':{
                type: String,
                default: ''
            },
            //max number of images in DOM
            'maxCachedSize':{
                type: Number,
                default: 15
            },
            'showThumbnails':{
                type: Boolean,
                default: false
            }
        },

        data: function() {
            return{
                //cache index in the total slides
                currentCacheStartIndex:0,
                currentScale : 1,
                slidesDoms : [],
                curSlideImg : {},
                ratio : 1,
                lastIndex: -100,
                lazyLoadMap: [],
                swipeFlag: false,
                windowWidth: window.innerWidth,
                multipointFlag: 0,
                showThumbs: false,
                cachedSize: 15
            }
        },

        watch:{
            'slides': function(){
                this.cachedSize = Math.min(this.slides.length, this.maxCachedSize);
                this.bindTransform();
            },
            'currentCacheStartIndex': function(){
                this.bindTransform();
            },
            'currentIndex': function(){
                this.processCurrentIndexChange();
            },
            'domSlides': function() {
                this.processCurrentIndexChange();
            },
        },

        computed:{
            'domSlides': function() {
                this.lazyLoadMap = new Array(Math.min(this.cachedSize,this.slides.length));
                return this.slides.slice(this.currentCacheStartIndex, Math.min(this.slides.length, this.currentCacheStartIndex + this.cachedSize));
            },
        },

        mounted: function(){
            this.bindTransform();
        },

        methods: {
            bindTransform: function(){
                if(this.slides.length > 0){
                    (typeof this.$refs.psSlider.translateX) === "undefined" && Transform(this.$refs.psSlider);
                    setTimeout(function () {
                        this.slidesDoms = [].slice.call(this.$refs.psSlider.children);

                        this.slidesDoms.map((child,index) => {
                            let $img = child.childNodes[0];
                            $img.translateX || Transform($img);
                        });

                        if(this.slidesDoms[this.currentIndex - this.currentCacheStartIndex]){
                            this.curSlideImg = this.slidesDoms[this.currentIndex - this.currentCacheStartIndex].childNodes[0];
                            this.ratio = this.curSlideImg.naturalHeight/this.curSlideImg.naturalWidth;
                        }

                        this.$emit('on-slide-change', { id: this.$refs.psSlider.id, index: this.currentIndex, slides: this.slides });
                        this.processCurrentIndexChange();
                    }.bind(this), 0);
                }
            },

            resetCurrentImg() {
                this.curSlideImg.width = window.innerWidth;
                this.curSlideImg.translateX = 0;
                this.curSlideImg.translateY = 0;
            },

            processCurrentIndexChange: function(){
                if (this.currentIndex < 0) return;

                let windowWidth = document.body.clientWidth;
                let direction = this.lastIndex < this.currentIndex ? "next" : "previous";
                let step = this.lastIndex === this.currentIndex - 1 ? "next" : this.lastIndex === this.currentIndex + 1 ? "previous" : "jump";

                //time to swap slides dom cache
                if(this.currentIndex < this.currentCacheStartIndex + 2 || this.currentIndex > this.currentCacheStartIndex + (this.cachedSize - 2)){
                    this.cachedSize = Math.min(this.slides.length, this.maxCachedSize);
                    this.currentCacheStartIndex = Math.min(this.slides.length - this.cachedSize, Math.max(0, this.currentIndex - Math.floor(this.cachedSize/2)));
                    if(step === 'next'){
                        this.$refs.psSlider['translateX'] = -windowWidth * (this.currentIndex - this.currentCacheStartIndex - 1);
                    }
                    if(step === 'previous'){
                        this.$refs.psSlider['translateX'] = -windowWidth * (this.currentIndex - this.currentCacheStartIndex + 1);
                    }
                }

                if(this.slidesDoms[this.currentIndex - this.currentCacheStartIndex]){
                    this.curSlideImg = this.slidesDoms[this.currentIndex - this.currentCacheStartIndex].childNodes[0];
                    this.ratio = this.curSlideImg.naturalHeight/this.curSlideImg.naturalWidth;
                }

                this.resetCurrentImg();

                //lastIndex img reset
                if(this.slidesDoms[this.lastIndex - this.currentCacheStartIndex]){
                    let lastImg = this.slidesDoms[this.lastIndex - this.currentCacheStartIndex].childNodes[0];
                    lastImg.width = window.innerWidth;
                    lastImg.height = window.innerWidth * this.ratio;
                    this.curSlideImg.width = window.innerWidth;
                    lastImg.translateX = 0;
                }

                //lazyLoad
                if(this.lazyLoad){
                    this._lazyLoad();
                }

                if (!this.swipeFlag) {
                    this.$refs.psSlider['translateX'] = -windowWidth * (this.currentIndex - this.currentCacheStartIndex);
                } else {
                    this.swipeFlag = false;
                    new To(this.$refs.psSlider, 'translateX', -windowWidth * (this.currentIndex - this.currentCacheStartIndex), 500, this.ease, function () {});
                }

                this.$emit('on-slide-change', { index: this.currentIndex, slides: this.slides });
                this.lastIndex = this.currentIndex;
            },

            _lazyLoad: function () {
                loadImageSrc(this.currentIndex - this.currentCacheStartIndex,this);
                //load next and previouse
                function loadImageSrc(index,that) {
                    if(!that.slidesDoms[index] || isNaN(index)){
                        return;
                    }
                    if(that.lazyLoadMap && that.lazyLoadMap[index]){
                        return false;
                    }
                    preloadImage(that.slides[index + that.currentCacheStartIndex][that.srcAtr], function() {
                        that.slidesDoms[index].childNodes[0].setAttribute('src', that.slides[index + that.currentCacheStartIndex][that.srcAtr]);
                        that.ratio = that.curSlideImg.naturalHeight/that.curSlideImg.naturalWidth;
                        that.lazyLoadMap[index] = 1;
                    });

                    return true;
                }

                function preloadImage(imgSrc, callback){
                    var objImagePreloader = new Image();

                    objImagePreloader.src = imgSrc;
                    if(objImagePreloader.complete){
                        callback();
                        objImagePreloader.onload=function(){};
                    }
                    else{
                        objImagePreloader.onload = function() {
                            callback();
                            //clear onLoad, IE behaves irratically with animated gifs otherwise
                            objImagePreloader.onload=function(){};
                        }
                    }
                }
            },

            tap: function (evt) {
                this.$emit('on-slide-tap', { evt: evt, index: this.currentIndex });
            },

            multipointStart: function (evt) {
                this.curSlideImg = this.slidesDoms[this.currentIndex - this.currentCacheStartIndex].childNodes[0];
                this.ratio = this.curSlideImg.naturalHeight/this.curSlideImg.naturalWidth;
                evt.cancelBubble=true;
            },

            longTap: function (evt) {
                //console.log('onLongTap');
                this.$emit('on-slide-long-tap', { evt: evt, index: this.currentIndex });
            },

            swipe: function (evt) {
                // if it is a thumbnail were we swipe - we use the thumbnailSwipe function
                if (evt.target.classList.contains('ps-thumbnail')) {
                    return;
                }
                if(this.currentScale > 1){
                    return;
                }
                this.swipeFlag = true;
                if (evt.direction === 'Left') {
                    if (this.currentIndex < this.slides.length - 1) {
                        this.currentIndex++;
                    }
                }else if (evt.direction === 'Right') {
                    if (this.currentIndex > 0) {
                        this.currentIndex--;
                    }
                }
            },

            imageSwipe: function (evt) {
                evt.cancelBubble = true;
                evt.preventDefault();
            },

            pinch: function (evt) {
                if(!this.multipointFlag){
                    this.multipointFlag = setTimeout(() => {
                        this.multipointFlag = 0;
                    },500);
                }else{
                    clearTimeout(this.multipointFlag);
                    this.multipointFlag = setTimeout(() => {
                        this.multipointFlag = 0;
                    },500);
                }

                if(!this.enablePinch){
                    return;
                }

                let scale = evt.scale ? evt.scale : evt.zoom;

                if(this.currentScale * scale < 1){
                    this.curSlideImg.width = window.innerWidth;
                    this.curSlideImg.height = window.innerWidth * this.ratio;
                }else if(this.currentScale * scale < 10){
                    this.curSlideImg.width = this.currentScale * scale * window.innerWidth;
                    this.curSlideImg.height = this.currentScale * scale * window.innerWidth * this.ratio;
                }

                if(scale < 1) {
                    this.curSlideImg.translateX = 0;
                    this.curSlideImg.translateY = 0;
                }
                evt.cancelBubble=true;
                evt.preventDefault();
            },

            rotate: function (evt) {
//            console.log(evt.angle);
            },

            pressMove: function (evt) {
                let range = (this.currentScale - 1)/2 * window.innerWidth;
                let rangeY = this.currentScale * window.innerWidth * this.ratio/2 -  window.innerHeight / 2;
                if((this.curSlideImg.translateX + evt.deltaX > range || this.curSlideImg.translateX + evt.deltaX < -range)){
                    if (this.currentScale >= 1 && Math.abs(evt.deltaX) < 25) {
                        //
                    }else{
                        this.curSlideImg.width = window.innerWidth;
                        this.curSlideImg.translateX = 0;
                        this.curSlideImg.translateY = 0;
                        return;
                    }
                }else{
                    this.curSlideImg.translateX += evt.deltaX;
                }
                if(rangeY > 0 && (this.curSlideImg.translateY + evt.deltaY <= rangeY && this.curSlideImg.translateY + evt.deltaY >= -rangeY)){
                    this.curSlideImg.translateY += evt.deltaY;
                }
                evt.cancelBubble=true;
                evt.preventDefault();
            },

            multipointEnd: function () {
                this.currentScale = this.curSlideImg.width/window.innerWidth;
            },

            doubleTap: function () {
                if(this.curSlideImg.width === window.innerWidth){
                    new To(this.curSlideImg, 'width', window.innerWidth * 2, 200, this.ease);
                    new To(this.curSlideImg, 'height', window.innerWidth * this.ratio * 2, 200, this.ease, function () {});
                    new To(this.curSlideImg, 'translateX', 0, 200, this.ease, function () {});
                    this.currentScale = 2;
                }else{
                    new To(this.curSlideImg, 'width', window.innerWidth, 200, this.ease);
                    new To(this.curSlideImg, 'height', window.innerWidth * this.ratio, 200, this.ease, function () {});
                    new To(this.curSlideImg, 'translateX', 0, 200, this.ease, function () {});
                    new To(this.curSlideImg, 'translateY', 0, 200, this.ease, function () {});
                    this.currentScale = 1;
                }
            },

            singleTap: function (evt) {
                if(!this.multipointFlag) {
                    evt.cancelBubble = true;
                    evt.preventDefault();
                    this.$emit('on-img-tap', { evt: evt, index: this.currentIndex });
                }
            },

            longImgTap: function (evt) {
                this.$emit('on-img-long-tap', { evt: evt, index: this.currentIndex });
            },

            click: function (evt) {
                //console.log('click');
                if(!this.multipointFlag) {
                    this.$emit('on-img-click', { index: this.currentIndex });
                    evt.cancelBubble = true;
                    evt.preventDefault();
                }
            },

            touchStart: function () {
                //console.log('onTouchStart');
            },

            touchMove: function (evt) {
                //console.log('onTouchMove');
//            if (Math.abs(evt.deltaX) >= Math.abs(evt.deltaY)) {
//                evt.preventDefault();
//            }
            },

            touchEnd: function () {
                //console.log('onTouchEnd');
            },

            touchCancel: function () {
                //console.log('onTouchCancel');
            },

            ease: function (x) {
                return Math.sqrt(1 - Math.pow(x - 1, 2));
            },

            toggleThumbnails: function () {
                console.log('toggleThumbnails');
//                this.showThumbs = !this.showThumbs;
            },
            thumbnailSwipe: function () {
                console.log('thumbnailSwipe');
            },
            clickThumbnail: function (index) {
                console.log('clickThumbnail');
                this.currentIndex = index;
                this.$emit('on-slide-change', { id: this.$refs.psSlider.id, index: index, slides: this.slides });
                this.processCurrentIndexChange();
            }
        },
    }
</script>
