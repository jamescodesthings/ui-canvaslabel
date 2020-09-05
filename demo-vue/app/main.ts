import Vue from 'nativescript-vue';
import { isAndroid } from '@nativescript/core/platform';

import { Label as HTMLLabel, enableIOSDTCoreText } from 'nativescript-htmllabel';
// this will trigger Font overrides and other improvements
enableIOSDTCoreText();
Vue.registerElement('HTMLLabel', () => HTMLLabel);


import CollectionView from 'nativescript-collectionview/vue';
Vue.use(CollectionView);
import CanvasLabel from '@nativescript-community/ui-canvaslabel/vue';
Vue.use(CanvasLabel);
import Canvas from 'nativescript-canvas/vue';
Vue.use(Canvas);
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = true;

import Home from './views/App.vue';
new Vue({
    render: h => h('frame', [h(Home)])
}).$start();
