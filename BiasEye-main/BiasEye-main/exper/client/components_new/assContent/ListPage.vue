<template>
  <div style="display: flex; flex-direction: column; justify-content: flex-start; width: 1578px">
    <div style="display: flex; justify-content: space-between">
      <div class="taskHeader">
        <div class="taskHeader-top">
          <h1 class="taskHeader-title">Open Day I</h1>
          <h2 class="taskHeader-term">2023</h2>
        </div>
        <div class="taskHeader-student">40 students</div>
      </div>
      <el-button color="#6B9589" size="large" plain @click="handleSubmitAll" >Submit All</el-button>
    </div>

    <section id="taskTable">
      <el-table
          :data="stuTableData"
          :default-sort="{ prop: 'index', order: 'ascending' }"
          style="width: 100%;" height="915px"
          :cell-style="cellStyle"
          @row-click="handleRowSelect">
        <el-table-column prop="index" label="Index" sortable width="90" />
        <el-table-column prop="name" label="Name" sortable  width="200"/>
        <el-table-column prop="status" label="Status" sortable width="150"/>
        <el-table-column prop="total" label="Total Score" sortable/>
        <el-table-column prop="EB" label="Education Background" sortable/>
        <el-table-column prop="Com" label="Competition" sortable/>
        <el-table-column prop="Ho" label="Honor" sortable/>
        <el-table-column prop="ExA" label="Extra Activity" sortable/>
      </el-table>
    </section>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */

// import StatisticView from "./assContent/Statistic.vue";
// import StuListView from "./assContent/StuList.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
    name: "ListPage",
    components:{
        // StatisticView,
        // StuListView,
    },

    data () {
        return {
            // todo
        };
    },

    props: {
        activeStuIndex:{
            type:Number,
            // default:0,
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
        // setup是一个组件选项，在组件被创建之前，props 被解析之后执行。
        // 它是组合式 API 的入口,接受两个参数：{Data} props; {SetupContext} context
        // 这里的内容需要 return 出去才可被 vue 使用

        const route = useRoute(); // 获取参数用
        const router = useRouter(); // 传递参数用
        const taskID = route.query.id;
        const NNum = taskID==='1'? 40:40;
        const idx_Cname_lookup = taskID==='1'?
            [   "沈璐璐", "邱铭轩", "梁诗涵", "董云鹏", "华蕾蕾", "宋昊天", "苏若雨", "冯智豪", "范芷萱", "高铭杰",
                "李嘉欣", "王志明", "张晓丽", "刘伟",  "赵晨曦",  "孙悦",  "陈思远", "马婷婷", "林峰",   "郭靖",
                "殷梓萱", "钟宇轩", "沈晨阳", "邵晓飞", "卢紫薇", "罗天宇", "宋雅婷", "蒋子豪", "汤芷蕾", "魏星辰",
                "江梦琪", "钱煜辰", "赖诗婷", "郑博文", "姚雨欣", "潘天佑", "王紫薇", "李智勇", "刘梓涵", "邓宇轩",
            ] :
            [   "赵雅萍", "吴志豪", "张晨曦", "杨子鹏", "林芷蕾", "王嘉琪", "刘浩然", "赵欣怡", "孙宇航", "刘梦琪",
                "钱煜辰", "赖诗婷", "郑博文", "姚雨欣", "潘天佑", "王紫薇", "李智勇", "刘梓涵", "邓宇轩", "陈梓萱",
                "高翔宇", "范诗琪", "周博涵", "韩雨薇", "蒋天翔", "杜紫薇", "魏志强", "苏梓涵", "殷康永", "王雅萍",
                "李志豪", "张味",  "杨子鹏",  "钱煜辰", "姜思捷", "马涛",  "赖诗婷", "唐诚成", "石宇诺", "海一亦",
            ];
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


        const stuTableData = ref([]);
        hideOverviewDot();

        function hideOverviewDot() {
            if(d3.selectAll('.overviewCard').select('#cardSvg').select('.rainDots')){d3.selectAll('.overviewCard').select('#cardSvg').selectAll('.rainDots').remove();}
        }

        const activeStuIndexRef = ref(props.activeStuIndex);
        // watch(activeStuIndexRef, handleStuIndexRefUpdate);
        const handleStuIndexRefUpdate = (newValue) => {
            // console.log(newValue);
            emit('update:active-stu-index', newValue);
        };

        const scoringDataRef = ref(props.scoringData);
        // watch(scoringDataRef, updateViews); ////////

        getListData();

        function getListData() {
            console.log('//TODO: fetch data of task ', taskID);
            // console.log("scoringDataRef", scoringDataRef.value[0].EB_score);
            // console.log("scoringDataRef", scoringDataRef.value[0].total_score);
            stuTableData.value = scoringDataRef.value.map( function(item){
                let obj = {};
                obj.index = +item.stuIndex;
                obj.name = idx_Ename_lookup[item.stuIndex-1];
                // obj.name = idx_Cname_lookup[item.stuIndex-1];
                obj.status = item.total_score===0?'Ungraded':'Graded';
                obj.EB = item.EB_score===0? null: item.EB_score;
                obj.Com = item.Com_score===0? null: item.Com_score;
                obj.Ho = item.Ho_score===0? null: item.Ho_score;
                obj.ExA = item.ExA_score===0? null: item.ExA_score;
                obj.PS = item.PS_score===0? null: item.PS_score;
                obj.RL = item.EB_score===0? null: item.EB_score;
                obj.total = item.total_score===0? null: item.total_score;
                return obj;
            } );
            // stuTableData.value = [
            //     { index: '1', name: 'John Cooper', status: 'Graded', },
            //     { index: '2', name: 'Missy Lee', status: 'Graded', },
            //     { index: '3', name: 'Emma White', status: 'Ungraded', },
            // ];
        }

        function cellStyle({row, column}) {
            if(column.property === 'status') {
                if(row.status === 'Graded'){ return {color: '#0068B3'}; }
                else if(row.status ==='Ungraded'){ return {color: '#CF3434'}; }
                else { return {color: '#306D5A'}; } // Submitted
            }
            return {};
        }

        function handleRowSelect(row) { /* 传递三个参数： row, col, event */
            /* 已在 el-menu 中定义了路由和 active 的动态绑定√ */
            activeStuIndexRef.value = row.index;
            handleStuIndexRefUpdate(activeStuIndexRef.value);
            router.push({path:'/stuDetail/:id', query: {id: taskID} });
        }

        function handleSubmitAll(){
            ElMessageBox.prompt('Please contact the experimenter to input your ID', 'End user study, thanks!', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputPattern:
                    /^\+?[1-9][0-9]*/,
                inputErrorMessage: 'Invalid ID number',
            })
                .then(({ value }) => {
                    ElMessage({
                        type: 'success',
                        message: `Your user ID is:\t ${value}`,
                    });
                    /* Save scoringDataRef as Json */
                    let fileNameJson = `BiasEye_task_${taskID}_User_${value}_results.json`;
                    let content2save = JSON.stringify(scoringDataRef.value);
                    let fileJson = new Blob([content2save], {type: 'application/json'});
                    let aJson = document.createElement('a');
                    aJson.href = URL.createObjectURL(fileJson);
                    aJson.download = fileNameJson;
                    aJson.click();

                    /* Save scoringDataRef as CSV */
                    let content = ""; // 一个空字符串，用来存储CSV格式的数据
                    let keys = Object.keys(scoringDataRef.value[0]); // 获取对象数组中第一个元素的所有属性名
                    content += keys.join(",") + "\n"; // 将属性名用逗号分隔，并添加换行符
                    scoringDataRef.value.map(item => {
                        content += Object.values(item).join(",") + "\n";
                    });
                    let fileName = `BiasEye_task_${taskID}_User_${value}_results.csv`; // 文件名
                    let a = document.createElement("a"); // 创建一个链接元素
                    let file = new Blob([content], {type: "text/csv"}); // 创建一个Blob对象，指定内容和类型
                    a.href = URL.createObjectURL(file); // 为链接元素设置URL属性，使用Blob对象作为源
                    a.download = fileName; // 为链接元素设置下载属性，指定文件名
                    a.click(); // 触发链接元素的点击事件，开始下载文件
                })
                .catch(() => {
                    ElMessage({
                        type: 'info',
                        message: 'Submit canceled',
                    });
                });
        }



        return {
            stuTableData,
            /*** function ***/
            cellStyle,
            handleRowSelect,
            handleSubmitAll,
        };
    },

};
</script>

<style scoped>

  .taskHeader {
    margin-bottom: 24px;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
  }

  .taskHeader-top {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: 100%;
    color: #2D2D2D;
    vertical-align: center;
  }

  .taskHeader-title {
    margin: 0 16px 0 0;
    padding-right: 16px;
    font-size: 24px;
    font-weight: 500;
    border-right: 1px solid #CDCDCD;
    color: #191919;
  }

  .taskHeader-term {
    margin: 0 16px 0 0;
    font-size: 18px;
    font-weight: 400;
  }

  .taskHeader-student {
    padding-top: 5px;
    font-size: 16px;
    font-weight: 400;
  }

  #taskTable {
    overflow-y: auto;
  }

</style>