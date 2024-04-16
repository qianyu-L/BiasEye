/* eslint-disable no-unused-vars */

import { Right, Back, Document } from '@element-plus/icons-vue';
import { ref, watch, onMounted, getCurrentInstance  } from 'vue';

import VuePdfEmbed from 'vue-pdf-embed';
import {useRoute} from "vue-router";
import * as d3 from "d3";

import SumPage from "./SumPage.vue";

export default {
    data () {
        return {
            suppleTitle: "Supplementary Material",
            formSize: 'small',
        };
    },

    components: {
        VuePdfEmbed,
        Right,
        Back,
        // Document,
        SumPage,
    },

    props: {
        activeStuIndex: {
            type: Number,
            // default: 0,
        },

        scoringData: {
            type: Array,
            // default: [...],
        },

        // summaryClickIndex: {
        //     type:Number,
        // },
    },

    emits: ['update:active-stu-index'],

    setup(props, { emit }) {
        const route = useRoute(); // 获取参数用
        const taskID = route.query.id;
        const NNum = taskID==='1'? 40:40;
        const idx_Ename_lookup = taskID==='1'?
            [   "James Smith",    "Emma Jones",     "Ethan Taylor",    "Ava Johnson",   "Noah Williams",
                "Mia Brown",      "Liam Davis",     "Sophia Miller",   "Oliver Wilson", "Isla Thomas",
                "Lucas Evans",    "Amelia Roberts", "Jacob Thompson",  "Ella Lewis",    "Leo Walker",
                "Olivia White",   "Oscar Wright",   "Lily Green",      "Harry Wood",    "Emily Hall",
                "Charlie Clark",  "Alfie Baker",    "Jack Martin",     "Chloe Scott",   "Isabella Turner",
                "Grace Hill",     "Ruby Lee",       "Benjamin Carter", "Zoe Cooper",    "Isaac Edwards",
                "Abigail Foster", "Logan Graham",   "Hannah Hughes",   "Mason King",    "Will Lee",
                "Nathan Moore",   "Eva Parker",     "Ryan Phillips",   "Maya Robinson", "Samuel Smith",
            ] :
            [   "Jago Bythesea", "Khaleesi Rummage", "Massimo Nithercott", "Darius Harred",  "Quinn Raynott",
                "Nathan Lee",    "Xander Woodbead",  "Paityn Southwark",   "Fatima Jarsdel", "Anwen Puddifoot",
                "Landon Adams",  "Madison Anderson", "Evelyn Armstrong",   "Elman Allen",    "Anwen Campbell",
                "Daniel Bailey", "Alexander Ball",   "Ariadne Atkinson",   "Lucy Baker",     "Fatima Butler",
                "Ethan Bell",    "Ella Bennett",     "Xander Black",       "Quinn Brown",    "Isaac Carter",
                "Chloe Clark",   "Sophie Edwards",   "Khaleesi Davis",     "Paityn Davies",  "Ivy Bell",
                "Logan Collins", "Hannah Cook",      "Massimo Cooper",     "Darius Cox",     "Finn Baker",
                "Jago Evans",    "Oliver Puddifoot", "Levi Butler",        "Kai Bennett",    "Levi Adams",
            ];
        const idx_Cname_lookup = taskID==='1'?
            [
                "沈璐璐", "邱铭轩", "梁诗涵", "董云鹏", "华蕾蕾", "宋昊天", "苏若雨", "冯智豪", "范芷萱", "高铭杰",
                "李嘉欣", "王志明", "张晓丽", "刘伟",  "赵晨曦",  "孙悦",  "陈思远", "马婷婷", "林峰",   "郭靖",
                "殷梓萱", "钟宇轩", "沈晨阳", "邵晓飞", "卢紫薇", "罗天宇", "宋雅婷", "蒋子豪", "汤芷蕾", "魏星辰",
                "江梦琪", "钱煜辰", "赖诗婷", "郑博文", "姚雨欣", "潘天佑", "王紫薇", "李智勇", "刘梓涵", "邓宇轩",
            ] :
            [   "赵雅萍", "吴志豪", "张晨曦", "杨子鹏", "林芷蕾", "王嘉琪", "刘浩然", "赵欣怡", "孙宇航", "刘梦琪",
                "钱煜辰", "赖诗婷", "郑博文", "姚雨欣", "潘天佑", "王紫薇", "李智勇", "刘梓涵", "邓宇轩", "陈梓萱",
                "高翔宇", "范诗琪", "周博涵", "韩雨薇", "蒋天翔", "杜紫薇", "魏志强", "苏梓涵", "殷康永", "王雅萍",
                "李志豪", "张味",  "杨子鹏",  "钱煜辰", "姜思捷", "马涛",  "赖诗婷", "唐诚成", "石宇诺", "海一亦",
            ];

        /**********************************************************************************************************
         *********************************************** 打分计时部分 ***********************************************
         *********************************************************************************************************/
        let lastTime = '', nowTime = '';
        function timeDiff(last, now){
            // console.log(last);
            // console.log(now);
            console.log( 'use ', (now-last)/1000, 's' ); // 以秒为单位计算
            return (now - last)/1000;
        }

        watch(
            ()=>route.path, // getter函数，返回要监听的值
            (to, from) => { //回调函数
                // console.log('watch', to);
                if (to==='/stuDetail/:id') {
                    lastTime = new Date();
                    openBI();
                } // 模拟 onMounted()

            }
        );

        /*********************************************************************************************************
         *********************************************** 选择学生部分 ***********************************************
         *********************************************************************************************************/
        let _this = getCurrentInstance();
        const scoringDataRef = ref(props.scoringData);
        let stuOptionList = scoringDataRef.value.map( function(item){
            let obj = {};
            obj.index = +item.stuIndex;
            obj.label = item.stuIndex + `/${NNum}   -   ` + idx_Ename_lookup[item.stuIndex-1];
            // obj.label = item.stuIndex + `/${NNum}   -   ` + idx_Cname_lookup[item.stuIndex-1];
            return obj;
        });
        const selectedValue = ref(props.activeStuIndex);
        // console.log('AssPage, selectedValue', selectedValue);

        watch(selectedValue,(newValue, oldValue)=>{
            // console.log("watch(selectedValue), old", oldValue, 'newValue', newValue);
            if(oldValue) handleSelectedValueUpdate(newValue);
        },{immediate:true});

        function handleSelectedValueUpdate (newValue) {
            // console.log(newValue);
            getStuCV(route.path==='/stuDetail/:id'); // 描述列表的值要跟着选中的学生进行替换
            if(_this.refs.myDesScoll) { // 在组件切换时有可能是 Null
                _this.refs.myDesScoll.setScrollTop(0); //描述列表归位
            }
            emit('update:active-stu-index', newValue);
            lastTime = new Date();
        }

        // 下拉选择部分
        function handleStuChange(e) { /* 参数 e 是接收到的事件对象 */
            // console.log(`handleStuChange(${selectedValue.value})`);
            handleSelectedValueUpdate(selectedValue.value);
        }
        const handleStuBackBtn = () => {
            if(selectedValue.value > 1){
                selectedValue.value -= 1;
                handleSelectedValueUpdate(selectedValue.value);}
            // console.log(`to fetch ${selectedValue.value} student data`);
        };
        const handleStuRightBtn = () => {
            if(selectedValue.value < 40){
                selectedValue.value += 1;
                handleSelectedValueUpdate(selectedValue.value); }
            // console.log(`to fetch ${selectedValue.value} student data`);
        };

        /*********************************************************************************************************
         ********************************************* 学生信息展示部分 *********************************************
         *********************************************************************************************************/
        /* 逻辑：当 activeStuIndex 改变时再更新 */
        const selectedStuCV = ref({});
        const selectedStuEB = ref({});
        const selectedStuCom= ref([]);
        const selectedStuHo = ref([]);
        const selectedStuExA= ref({});

        const comment_CV = ref('');
        const comment_EB = ref('');
        const comment_Com= ref('');
        const comment_Ho = ref('');
        const comment_ExA= ref('');

        const score_EB = ref(0);
        const score_Com= ref(0);
        const score_Ho = ref(0);
        const score_ExA= ref(0);

        /* 保存得分，只有summary不出现时才计时 */
        const save_score_EB = () => {
            // console.log("save_score_EB");
            nowTime = new Date();
            scoringDataRef.value[selectedValue.value-1].total_score += (score_EB.value
                -scoringDataRef.value[selectedValue.value-1].EB_score);
            scoringDataRef.value[selectedValue.value-1].EB_score    = score_EB.value;
            drawHint('hint_EB');
            if (route.path==='/stuDetail/:id'){
                let useTime = timeDiff(lastTime, nowTime);
                scoringDataRef.value[selectedValue.value-1].total_time += useTime;
                scoringDataRef.value[selectedValue.value-1].EB_time += useTime;
                lastTime = new Date();
                scoringDataRef.value[selectedValue.value-1].EB_timestamp.push(["Ass", lastTime]);
                // console.log( scoringDataRef.value[selectedValue.value-1].EB_timestamp );
            }
        };
        const save_score_Com = () => {
            nowTime = new Date();
            // console.log("save_score_Com");
            scoringDataRef.value[selectedValue.value-1].total_score += (score_Com.value
                -scoringDataRef.value[selectedValue.value-1].Com_score);
            scoringDataRef.value[selectedValue.value-1].Com_score    = score_Com.value;
            drawHint('hint_Com');
            if (route.path==='/stuDetail/:id') {
                let useTime = timeDiff(lastTime, nowTime);
                scoringDataRef.value[selectedValue.value - 1].total_time += useTime;
                scoringDataRef.value[selectedValue.value - 1].Com_time += useTime;
                lastTime = new Date();
                scoringDataRef.value[selectedValue.value - 1].Com_timestamp.push(["Ass", lastTime]);
            }
        };
        const save_score_Ho = () => {
            nowTime = new Date();
            // console.log("save_score_Ho");
            scoringDataRef.value[selectedValue.value-1].total_score += (score_Ho.value
                -scoringDataRef.value[selectedValue.value-1].Ho_score);
            scoringDataRef.value[selectedValue.value-1].Ho_score    = score_Ho.value;
            drawHint('hint_Ho');
            if (route.path==='/stuDetail/:id') {
                let useTime = timeDiff(lastTime, nowTime);
                scoringDataRef.value[selectedValue.value - 1].total_time += useTime;
                scoringDataRef.value[selectedValue.value - 1].Ho_time += useTime;
                lastTime = new Date();
                scoringDataRef.value[selectedValue.value - 1].Ho_timestamp.push(["Ass", lastTime]);
            }
        };
        const save_score_ExA = () => {
            nowTime = new Date();
            // console.log("save_score_ExA");
            scoringDataRef.value[selectedValue.value-1].total_score += (score_ExA.value
                -scoringDataRef.value[selectedValue.value-1].ExA_score);
            scoringDataRef.value[selectedValue.value-1].ExA_score    = score_ExA.value;
            drawHint('hint_ExA');
            if (route.path==='/stuDetail/:id') {
                let useTime = timeDiff(lastTime, nowTime);
                scoringDataRef.value[selectedValue.value - 1].total_time += useTime;
                scoringDataRef.value[selectedValue.value - 1].ExA_time += useTime;
                lastTime = new Date();
                scoringDataRef.value[selectedValue.value - 1].ExA_timestamp.push(["Ass", lastTime]);
            }
        };

        /* 保存文本 */
        const save_comment_CV = () => { scoringDataRef.value[selectedValue.value-1].CV_comment = comment_CV.value; };
        const save_comment_EB = () => { scoringDataRef.value[selectedValue.value-1].EB_comment = comment_EB.value; };
        const save_comment_Com = () => { scoringDataRef.value[selectedValue.value-1].Com_comment = comment_Com.value; };
        const save_comment_Ho = () => { scoringDataRef.value[selectedValue.value-1].Ho_comment = comment_Ho.value; };
        const save_comment_ExA = () => { scoringDataRef.value[selectedValue.value-1].ExA_comment = comment_ExA.value; };

        function getStuCV(canOpenBI){
            // console.log('getStuCV', 'score_EB', score_EB);
            //TODO: 这里根据 taskID 和 selectedValue 范围读取。
            if (selectedValue.value<NNum+1 & selectedValue.value>0){
                let jsonSrc = taskID==='1' ? "static/UseCaseJson/Case1.json" : "static/UseCaseJson/Case2.json";
                // d3.json("static/UseCase80.json", function(error, stuCV) {
                d3.json( jsonSrc, function(error, stuCV) {
                    if(error) console.error(error);
                    //读进了authordata变量, 接下来用到authordata的代码必须全部在此函数内部进行
                    let kkk = Object.keys(stuCV);
                    // stuRealID.value = kkk[selectedValue.value-1]; //用来读pdf, 但是中文识别有问题
                    // console.log(kkk[selectedValue.value-1], kkk[selectedValue.value-1+40]);
                    stuRealID.value = kkk[selectedValue.value-1].split('-')[0]; //用来读pdf
                    // stuRealID.value = taskID==='1' ? kkk[selectedValue.value-1].split('-')[0] : kkk[selectedValue.value-1+40].split('-')[0]; //用来读pdf
                    if(canOpenBI && stuRealID.value) openBI(); // 学生跳转之后默认显示简历

                    stuCV = stuCV[kkk[selectedValue.value-1]];
                    // console.log(stuCV);
                    selectedStuCV.value = {
                        "姓名": idx_Ename_lookup[selectedValue.value - 1],
                        // "姓名": idx_Cname_lookup[selectedValue.value - 1],
                        "性别": stuCV["性别"],
                        "就读院校": stuCV["教育经历"][0]["就读院校"],
                        "籍贯": stuCV["籍贯"],
                        "年龄": stuCV["年龄"],
                        "专业": stuCV["教育经历"][0]["专业"],
                        "技能": stuCV["技能"],
                    };
                    selectedStuEB.value = {
                        "绩点": stuCV["教育经历"][0]["绩点"],
                        "排名": stuCV["教育经历"][0]["排名"],
                        "四级": stuCV["教育经历"][0]["英语成绩"]["四级"],
                        "六级": stuCV["教育经历"][0]["英语成绩"]["六级"],
                        "托福": "托福" in stuCV["教育经历"][0]["英语成绩"]? stuCV["教育经历"][0]["英语成绩"]["托福"]: "",
                        "雅思": "雅思" in stuCV["教育经历"][0]["英语成绩"]? stuCV["教育经历"][0]["英语成绩"]["雅思"]: "",
                        "主修课程": stuCV["教育经历"][0]["主修课程"]
                    };
                    selectedStuCom.value = stuCV["竞赛经历"];
                    selectedStuHo.value  = stuCV["荣誉及其他经历"];
                    selectedStuExA.value = {
                        "项目经历": stuCV["项目经历"],
                        "论文":    stuCV["论文"],
                        "其他经历": stuCV["其他经历"],
                    };
                    console.log(`正在查看任务${taskID}, 第${selectedValue.value}位同学，${kkk[selectedValue.value-1]} (${stuCV["姓名"]})。`);
                });

                score_EB.value = scoringDataRef.value[selectedValue.value-1].EB_score;
                score_Com.value= scoringDataRef.value[selectedValue.value-1].Com_score;
                score_Ho.value = scoringDataRef.value[selectedValue.value-1].Ho_score;
                score_ExA.value= scoringDataRef.value[selectedValue.value-1].ExA_score;

                comment_CV.value = scoringDataRef.value[selectedValue.value-1].CV_comment;
                comment_EB.value = scoringDataRef.value[selectedValue.value-1].EB_comment;
                comment_Com.value= scoringDataRef.value[selectedValue.value-1].Com_comment;
                comment_Ho.value = scoringDataRef.value[selectedValue.value-1].Ho_comment;
                comment_ExA.value= scoringDataRef.value[selectedValue.value-1].ExA_comment;
            }
        }

        /* 打分时辅助用的箱线图 */
        const hint_cfg = {
            SvgW : 380,
            SvgH : 60,
            level: 6,
            l_x1: 20, l_y: 11, l_w: 30,
            t_y : 54,
            b_h : 20, b_y: 16,
            mean_off: 3, mean_y: 23,
            x_scale : d3.scaleLinear().range([0, 300]).domain([0, 5]),
        };
        const legend = ['EB', 'Com', 'Ho', 'ExA', 'PS', 'RL'];
        const colorList = {'EB':'#F4E9E3', 'Com':'#F1FAFD', 'Ho':'#FFF2F2', 'ExA':'#FFFCEF', 'PS':'#F4EAF7', 'RL':'#F2F2F2'};
        const deepColorList = {'EB':'#776357', 'Com':'#317286', 'Ho':'#B56B6B', 'ExA':'#C89528', 'PS':'#74527B', 'RL':'#666666'};

        function drawBoxPlot(){
            drawHint('hint_EB');
            drawHint('hint_Com');
            drawHint('hint_Ho');
            drawHint('hint_ExA');
        }
        function drawHint(id) { //  eg. id = hint_EB
            if (d3.select(`#${id}`).select(`#${id}Svg`)) { d3.selectAll(`#${id}Svg`).remove(); }
            let Hint_SVG = d3.select(`#${id}`).append('svg').attr('id', `${id}Svg`)
                .attr('width', hint_cfg.SvgW).attr('height', hint_cfg.SvgH);
            /* 刻度线 */
            let hint_level_g = Hint_SVG.append('g');
            hint_level_g.selectAll('.levels').data(d3.range(hint_cfg.level)).enter().append('line')
                .attr('x1', function(d){return hint_cfg.l_x1+60*d;}).attr('y1', hint_cfg.l_y)
                .attr('x2', function(d){return hint_cfg.l_x1+60*d;}).attr('y2', hint_cfg.l_y+hint_cfg.l_w)
                .attr('stroke', '#CDD0D6');
            hint_level_g.selectAll('.levelText').data(d3.range(hint_cfg.level)).enter().append('text')
                .style("font-size", "10px").attr("text-anchor", "middle").attr("fill", "#CDD0D6")
                .attr("x", function(d){ return hint_cfg.l_x1+60*d;} ).attr("y", hint_cfg.t_y )
                .text(function(d){return d;});
            let keyname = id.split('_')[1].concat('_score');
            let tmp = scoringDataRef.value.map(item =>{ if(item[keyname]>0){return item[keyname];} }).filter(Boolean);
            let hint_min = d3.max([0, d3.min(tmp)]);
            let hint_max = d3.max([0, d3.max(tmp)]);
            let hint_mean = d3.max([0, d3.mean(tmp)]);
            let hint_25 = d3.max([0, d3.quantile(tmp.sort(), 0.25)]);
            let hint_75 = d3.max([0, d3.quantile(tmp.sort(), 0.75)]);
            let hint_median = d3.max([0, d3.quantile(tmp.sort(), 0.5)]);
            // console.log(hint_min, hint_max, hint_median, hint_mean, hint_25, hint_75);

            /* box plot */
            let hint_box_g = Hint_SVG.append('g');
            hint_box_g.append('line').attr('stroke', deepColorList[id.split('_')[1]] )
                .attr('x1', hint_cfg.l_x1+hint_cfg.x_scale(hint_min) ).attr('y1', hint_cfg.l_y+hint_cfg.l_w/2 )
                .attr('x2', hint_cfg.l_x1+hint_cfg.x_scale(hint_max) ).attr('y2', hint_cfg.l_y+hint_cfg.l_w/2 );
            hint_box_g.append('line').attr('stroke', deepColorList[id.split('_')[1]] )
                .attr('x1', hint_cfg.l_x1+hint_cfg.x_scale(hint_min) ).attr('y1', hint_cfg.b_y )
                .attr('x2', hint_cfg.l_x1+hint_cfg.x_scale(hint_min) ).attr('y2', hint_cfg.b_y + hint_cfg.b_h );
            hint_box_g.append('line').attr('stroke', deepColorList[id.split('_')[1]] )
                .attr('x1', hint_cfg.l_x1+hint_cfg.x_scale(hint_max) ).attr('y1', hint_cfg.b_y )
                .attr('x2', hint_cfg.l_x1+hint_cfg.x_scale(hint_max) ).attr('y2', hint_cfg.b_y + hint_cfg.b_h );
            hint_box_g.append('rect').attr('stroke', deepColorList[id.split('_')[1]] ).attr('fill', colorList[id.split('_')[1]] )
                .attr('x', hint_cfg.l_x1+hint_cfg.x_scale(hint_25)).attr('y', hint_cfg.b_y)
                .attr('height', hint_cfg.b_h).attr('width', hint_cfg.x_scale(hint_75-hint_25));
            hint_box_g.append('line').attr('stroke', deepColorList[id.split('_')[1]] )
                .attr('x1', hint_cfg.l_x1+hint_cfg.x_scale(hint_median) ).attr('y1', hint_cfg.b_y )
                .attr('x2', hint_cfg.l_x1+hint_cfg.x_scale(hint_median) ).attr('y2', hint_cfg.b_y + hint_cfg.b_h );
            hint_box_g.append('rect').attr('fill', deepColorList[id.split('_')[1]] )
                .attr('x', hint_cfg.l_x1+hint_cfg.x_scale(hint_mean)-hint_cfg.mean_off).attr('y', hint_cfg.mean_y)
                .attr('height', 2*hint_cfg.mean_off).attr('width', 2*hint_cfg.mean_off);
            /* 标签 */
            let hint_legend_g = Hint_SVG.append('g');
            hint_legend_g.append('rect').attr('fill', deepColorList[id.split('_')[1]] )
                .attr('x', 330).attr('y', 13)
                .attr('height', 2*hint_cfg.mean_off).attr('width', 2*hint_cfg.mean_off);
            hint_legend_g.append('line').attr('stroke', deepColorList[id.split('_')[1]] )
                .attr('x1', 332 ).attr('y1', 34 )
                .attr('x2', 332 ).attr('y2', 34 + hint_cfg.b_h );
            hint_legend_g.append('text').style("font-size", "10px").attr("text-anchor", "middle").attr("fill", deepColorList[id.split('_')[1]] )
                .attr("x", 361 ).attr("y", 19 ).text('mean');
            hint_legend_g.append('text').style("font-size", "10px").attr("text-anchor", "middle").attr("fill", deepColorList[id.split('_')[1]] )
                .attr("x", 357 ).attr("y", 48 ).text('median');
        }


        /*********************************************************************************************************
         ********************************************* material view *********************************************
         *********************************************************************************************************/
        const stuRealID = ref('');
        const pdfsrc = ref('');
        //TODO: 这里根据 taskID 和 selectedValue 范围读取。
        const openBI = () => {
            // suppleTitle.value = "Supplementary Material";
            // pdfsrc.value = "static/stuCV/sampleLetter/2021X010600121.pdf";
            pdfsrc.value = `static/CV/${stuRealID.value}.pdf`;
            if(_this.refs.myPdfScroll) { // 在组件切换时有可能是 Null
                _this.refs.myPdfScroll.setScrollTop(0); //pdf归位
            }
        };


        /*********************************************************************************************************
         ******************************************** Vue3 生命周期钩子 ********************************************
         *********************************************************************************************************/
        onMounted(() => {
            getStuCV(route.path==='/stuDetail/:id');
            drawBoxPlot();
            lastTime = new Date();
            // console.log(lastTime);
        });

        return{
            selectedValue,
            scoringDataRef,
            pdfsrc,

            score_EB,
            score_Com,
            score_Ho,
            score_ExA,

            comment_CV,
            comment_EB,
            comment_Com,
            comment_Ho,
            comment_ExA,

            stuOptionList,
            selectedStuCV,
            selectedStuEB,
            selectedStuCom,
            selectedStuHo,
            selectedStuExA,

            /*** function ***/
            handleStuChange,
            handleStuBackBtn,
            handleStuRightBtn,

            save_score_EB,
            save_score_Com,
            save_score_Ho,
            save_score_ExA,

            save_comment_CV,
            save_comment_EB,
            save_comment_Com,
            save_comment_Ho,
            save_comment_ExA,
        };
    },
};