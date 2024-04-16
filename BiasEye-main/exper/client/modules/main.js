import {createApp} from 'vue';
import {createRouter, createWebHashHistory} from 'vue-router';
import routes from './routers';
import * as d3 from "d3";
import 'assets/css/main.less';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// import '@icon-park/vue-next/styles/index.css';

// import 'default-passive-events';

// import axios from "axios";
// Vue.prototype.$axios = axios;

window.d3 = d3;

const router = createRouter({
    history: createWebHashHistory(),
    routes
});
const myApp = createApp({
    el: '#app-wrapper',
});

myApp.use(router); // 全局挂载路由实例

myApp.use(ElementPlus);

myApp.mount("#app-wrapper");