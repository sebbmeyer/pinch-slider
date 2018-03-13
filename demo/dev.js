const pinchSlider = PinchSlider.PinchSlider;
const AlloyFingerVue = PinchSlider.AlloyFingerVue;
const AlloyFinger = PinchSlider.AlloyFinger;

Vue.use(AlloyFingerVue,{ AlloyFinger: AlloyFinger }); // use AlloyFinger's plugin

Vue.component('pinchSlider', pinchSlider);
new Vue({
    el: '.vue-wrapper',
    data: {
        imgs: [
            { src: 'https://img.posterlounge.de/images/wbig/poster-sonnenlicht-im-gruenen-wald-fruehling-1613344.jpg' },
            { src: 'https://static.geo.de/bilder/00/60/68950/article_image_big/wald-m-06086541.jpg' },
            { src: 'https://cdn03.comvel.media/bin/images/sunrise/smallWidgets/destinationen/europa/deutschland/bayerischer-wald/shutterstock_538620196_GRAFIK-4832_WDE_deutschland_bayerischer_wald_bach_wald_201701126_DAM.jpg?v=j3hesazz'},
            { src: 'https://img.posterlounge.de/images/wbig/poster-sonnenuntergang-am-meer-334463.jpg'},
            { src: 'https://img.zeit.de/reisen/2015-07/abwesenheitsnotizen-das-meer-ozean/wide__820x461__desktop'}
        ],
        currentIndex: 0,
        isFull: false
    },
    methods:{
    	showFull(){
    		this.isFull = true;
    	},
    	changePageNo: function (data) {
            this.currentIndex = data.index;
        }
    }
});
