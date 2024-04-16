/* eslint-disable no-unused-vars */
// import HttpHelper from "common/utils/axios_helper.js";
// import { reactive, onMounted, ref} from 'vue';
// import { ElTable, ElTableColumn } from "element-plus";
// import 'element-plus/es/components/table/style/css';

// import { ref } from 'vue';
import { onMounted } from 'vue';

// import VueRouter from 'vue-router';

import taskPanel from "../../components_new/task.vue";
// import assPanel from "../../components/assessing.vue";

export default {
    data () {
        return {

        };
    },

    methods:{

    },
    components:{
        taskPanel,
        // assPanel,
        // VueRouter,
    },
    setup() { // 这里的内容需要 return 出去才可被 vue 使用

        onMounted(()=>{
            /** 根据浏览器窗口大小改变界面放缩 */
            scaleWindow();

            function scaleWindow() {
                // let browserWidth = window.innerWidth;
                // let browserHeight = window.innerHeight;
                let browserWidth = document.body.clientWidth;
                let browserHeight = document.body.clientHeight;
                let baseWidth = 1920, baseHeight = 1080;
                let browserZoomFactor_w = browserWidth / baseWidth;
                let browserZoomFactor_h = browserHeight / baseHeight;
                let transX = 0,
                    transY = 0;
                if ((browserZoomFactor_w < 1 && browserZoomFactor_h < 1) || (browserZoomFactor_w > 1 && browserZoomFactor_h > 1)){
                    if (browserZoomFactor_w < browserZoomFactor_h){
                        // browserZoomFactor_w
                        transX = (browserWidth - baseWidth) / 2;
                        transY = (baseHeight * browserZoomFactor_w - baseHeight) / 2;
                        document.getElementById('baseWeb').style.transform = `scale(${browserZoomFactor_w},${browserZoomFactor_w})translate(${transX}px,${transY}px)`;
                        console.log('@1 browserZoomFactor_w', browserZoomFactor_w, browserWidth, browserHeight);
                        // console.log("window.innerWidth", window.innerWidth, "document.body.clientWidth", document.body.clientWidth, "document.documentElement.clientWidth", document.documentElement.clientWidth);
                        // console.log(window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth);
                    }
                    else {
                        // browserZoomFactor_h
                        transX = (baseWidth * browserZoomFactor_w - baseWidth) / 2;
                        transY = (browserHeight - baseHeight) / 2;
                        document.getElementById('baseWeb').style.transform = `scale(${browserZoomFactor_h},${browserZoomFactor_h})translate(${transX}px,${transY}px)`;
                        console.log('@2 browserZoomFactor_h', browserZoomFactor_h, browserWidth, browserHeight);
                    }
                }
                else {
                    if (browserZoomFactor_w < browserZoomFactor_h){
                        // browserZoomFactor_w
                        transX = (browserWidth - baseWidth) / 2;
                        transY = (baseHeight * browserZoomFactor_w - baseHeight) / 2;
                        document.getElementById('baseWeb').style.transform = `scale(${browserZoomFactor_w},${browserZoomFactor_w})translate(${transX}px,${transY}px)`;
                        console.log('@3 browserZoomFactor_w', browserZoomFactor_w);
                    }
                    else {
                        // browserZoomFactor_h
                        transX = (baseWidth * browserZoomFactor_w - baseWidth) / 2;
                        transY = (browserHeight - baseHeight) / 2;
                        document.getElementById('baseWeb').style.transform = `scale(${browserZoomFactor_h},${browserZoomFactor_h})translate(${transX}px,${transY}px)`;
                        console.log('@4 browserZoomFactor_h', browserZoomFactor_h);
                    }
                }

                // window.onresize = function () {
                //     browserWidth = window.innerWidth;
                //     browserZoomFactor = browserWidth / baseWidth;
                //     document.getElementById('app-wrapper').style.transform = `scale(${browserZoomFactor},${browserZoomFactor})`;
                // };
            }

        });

        return {
            // tableData
        };
    }
};