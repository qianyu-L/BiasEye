/* eslint-disable no-unused-vars */
import * as d3 from "d3";
import { onMounted, ref, getCurrentInstance } from "vue";
import {useRoute} from "vue-router";
import key from "@icon-park/vue-next/lib/icons/Key";
import {k} from "vue3-pdfjs/esm/index-19f89c12";

export default {
    name: "SumPage",
    data () {
        return {
            rateColor: {
                EB:  ['#D5C1E0', '#D5C1E0', '#D5C1E0'],
                Com: ['#A1D9D5', '#A1D9D5', '#A1D9D5'],
                Ho:  ['#F2D492', '#F2D492', '#F2D492'],
                ExA: ['#C5E99B', '#C5E99B', '#C5E99B']
            },
        };
    },

    components:{
    },

    props: { // 用不用都接要接收一下，不然就会undefined（不应该用名字识别吗？很怪）
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


    setup (props, { emit }) {
        const route = useRoute(); // 获取参数用
        const taskID = route.query.id;
        const NNum = taskID==='1'? 40:40;
        const itemList = ['EB', 'Com', 'Ho', 'ExA'];
        const colorList = [
            ['#E6DAEC', '#D5C1E0', '#C0A5D0', '#B292C5', '#A380B9'],
            ['#C6E8E8', '#AEDEDB', '#9AD3D3', '#70B9BE', '#51A6AB'],
            ['#F7E5BE', '#F2D492', '#EBBF6D', '#E6B054', '#E0A142'],
            ['#DCF2C3', '#C5E99B', '#AADD76', '#98D55E', '#87CC4C']];
        const glyphLegend = d3.scaleOrdinal().domain(itemList).range(colorList);
        const estColor = d3.scaleOrdinal().domain(['low', 'high', 'consistent']).range(['#FA8181', '#4A92FF', '#A3A3A3']);
        // const grayRingColor = '#F3F3F3';
        const grayRingColor = 'none';
        const idColor = '#D3D3D3';

        const scoringDataRef = ref(props.scoringData);
        const activeStuIndexRef = ref(props.activeStuIndex);
        // const summaryClickIndexRef = ref(props.summaryClickIndex);

        let _this = getCurrentInstance(); // getCurrentInstance 方法返回了当前的实例对象，只能在 setup() 和生命周期函数中使用

        // /* 构建假数据 */
        // let scoringDataRef = [];
        // for(let i=1; i<41; i++){
        //     let obj = {
        //         stuIndex: (i).toString(),
        //         // time
        //         EB_time:     Math.floor(Math.random() * (150 - 0 + 1) + 0),
        //         Com_time:    Math.floor(Math.random() * (150 - 0 + 1) + 0),
        //         Ho_time:     Math.floor(Math.random() * (100 - 0 + 1) + 0),
        //         ExA_time:    Math.floor(Math.random() * (220 - 0 + 1) + 0),
        //         total_time:  0,
        //         // score
        //         EB_score:    Math.floor(Math.random() * (5 - 0 + 1) + 0),
        //         Com_score:   Math.floor(Math.random() * (5 - 0 + 1) + 0),
        //         Ho_score:    Math.floor(Math.random() * (5 - 0 + 1) + 0),
        //         ExA_score:   Math.floor(Math.random() * (5 - 0 + 1) + 0),
        //         total_score: 0,
        //         // predict score
        //         EB_est:    0,
        //         Com_est:   0,
        //         Ho_est:    0,
        //         ExA_est:   0,
        //         // change times
        //         EB_timestamp:    [],
        //         Com_timestamp:   [],
        //         Ho_timestamp:    [],
        //         ExA_timestamp:   [],
        //     };
        //     obj.total_score = obj.EB_score + obj.Com_score + obj.Ho_score + obj.ExA_score;
        //     obj.total_time  = obj.EB_time + obj.Com_time + obj.Ho_time + obj.ExA_time;
        //     scoringDataRef.push(obj);
        // }

        /** 当在 exSitu view 选择好对应的 term 和选中一部分 stuIndex 时可以 调用后端降维
         * 同时再调用 rankSVM/estimate 计算预测的分数
         * 绘制 glyph，并且更新表格，显示预测列 */

        /*********************************************************************************************************
         ********************************************* DimReduce View *********************************************
         *********************************************************************************************************/
        const dimReduceData = ref([]), centerDimReduceData = ref([]), centerStuDict = ref([]);
        const RankSVM_topk = ref([]), RankSVM_rank = ref({});
        const Estimate_score = ref({});
        const sid_idx_lookup = ref({}), idx_sid_lookup = ref({}); // 前后端所用 id 对查表
        const term_Lookup = { EB:'Edu', Com:'Com', Ho:'Honor', ExA:'Project' };

        function construct_sid_lookup () {
            let jsonSrc = taskID==='1' ? "static/UseCaseJson/Case1.json" : "static/UseCaseJson/Case2.json";
            d3.json( jsonSrc, function(error, stuCV) {
                if (error) console.error(error);
                let kkk = Object.keys(stuCV);
                kkk = kkk.map((d)=>{ return d.split('-')[0]; });
                kkk.map( (k,i)=>{
                    sid_idx_lookup.value[k] = i+1;
                    idx_sid_lookup.value[i+1] = k;
                } );
            });
        }

        /* 从后端获取 tsne 降维位置后，调用 estimate 函数或 ranksvm */
        function call_Cluster (term){
            // selectedIndexes 全局变量用于控制计算簇涉及到的学生
            // 通过人打分结果算出 1 - 5 分的五个簇。打分保存在全局，不用传递参数
            // 将每个 rough 簇的打分传递给后端: (后端在开始时先预处理好每个 task & term 下学生的高维 vector 备用)
            //    getCluster 函数在高维空间进行计算并返回簇中心 vector， 和每个簇包含的的idx (排除outlier)
            //    getTSNE 函数得到 getCluster 的结果，将簇中心和学生一起降维，完成后分组返回学生和簇中心的坐标（也需要包含高维坐标，estimate 函数待用）
            //

            /* 提取每个分数对应的 sid, 注意这里会有零分 */
            let scoreGroup = scoringDataRef.value.reduce( (groups, item) => {
                // 回调函数接受两个参数，一个是累加器，一个是当前值
                let score = item[`${term}_score`];
                groups[score] = groups[score] || []; // || 代表赋予一个默认值[],防止出现假值（undefined, NA...）
                // groups[score].push(+item.stuIndex);
                if( selectedIndexes.includes(+item.stuIndex) ) { groups[score].push(idx_sid_lookup[item.stuIndex]); }
                return groups;
            }, {}); // reduce 函数接受两个参数，一个回调函数，一个初始值
            // console.log('scoreGroup', scoreGroup);

            console.log(`TODO: use real location of ${term} from backend`);
            let minX = 20,  maxX = 818, minY = 20, maxY = 430;
            // let returnData = await HttpHelper.axiosPost("/api/getCluster", { "taskID": Number(taskID), "item": term_Lookup[term],
            //     "scoreGroup": scoreGroup, "minX": minX, "maxX": maxX, "minY": minY, "maxY": maxY });
            /** returnData <==> [ stuLocList, centerLocList, centerStuDict] */
            // dimReduceData.value = returnData[0].map(function(item){
            //     return { stuIndex: sid_idx_lookup[item.sid],  x: item.x,  y: item.y };
            // } );
            // centerDimReduceData.value = returnData[1];
            // centerStuDict.value = returnData[2].map(item=> { // 将 sid转换成前端用的数字 id
            //     return { center:item.center, stuList:item.stuList.map(d => sid_idx_lookup[d])};
            // })
            // let centerVector = centerDimReduceData.value.map((item)=>{
            //     return { center: item.center,  highLoc: item.highLoc };
            // }); // 2D loc 在 drawglyph 部分再构建


            let fakeScoreList = [];
            for (let i = 0; i < NNum; i++) {
                let obj = {
                    stuIndex: (i + 1),
                    x: Math.floor(Math.random() * (maxX - minX + 1) + minX),
                    y: Math.floor(Math.random() * (maxY - minY + 1) + minY),
                };
                fakeScoreList.push(obj);
            }
            // console.log(fakeScoreList);
            dimReduceData.value = fakeScoreList;
            // let fakeHighLoc = [];
            // for(let i=0; i<6; i++){
            //     let obj = {
            //         center: i,
            //         highLoc: [],
            //     };
            //     fakeHighLoc.push(obj);
            // }
            // let centerVector = fakeHighLoc;


            /** estimate 函数或 ranksvm 二选一 */
            // let [centers, clusterHulls] = estimateScores (term);
            // call_estimate(selectedIndexes, term, centerVector);
            call_RankSVM(selectedIndexes, term); // 对 term_pre 一列重新赋值并重建了 tableData
            miti_exsitu_show.value = term; // 现在可以展示 mitigation 列

            drawGlyphs(term);

            UpdateLoading.value = !UpdateLoading.value;

        }

        /* 已弃用 */
        // function getGlyphLoc(term) {
        //     // 得到学生和簇中心降维后的坐标，并根据 2D 坐标计算凸包，调用绘制函数
        //     console.log(`TODO: use real location of ${term} from backend`);
        //     let minX = 20,  maxX = 818, minY = 20, maxY = 430;
        //     // let dimData = await HttpHelper.axiosPost("/api/getTSNE", { "taskID": Number(taskID), "sector": mode, "minX": minX, "maxX": maxX, "minY": minY, "maxY": maxY });  // top_k, pred
        //     // dimReduceData.value = dimData.map(function(item){
        //     //     return { stuIndex: item.stuIndex.toString,  x: item.x,  y: item.y };
        //     // } );
        //
        //     let fakeScoreList = [];
        //     for (let i = 0; i < NNum; i++) {
        //         let obj = {
        //             stuIndex: (i + 1).toString(),
        //             x: Math.floor(Math.random() * (maxX - minX + 1) + minX),
        //             y: Math.floor(Math.random() * (maxY - minY + 1) + minY),
        //             est: 0,
        //         };
        //         fakeScoreList.push(obj);
        //     }
        //     // console.log(fakeScoreList);
        //     dimReduceData.value = fakeScoreList;
        //
        //     // let [centers, clusterHulls] = estimateScores (term);
        //     call_RankSVM(selectedIndexes, term); // 对 term_pre 一列重新赋值并重建了 tableData
        //     miti_exsitu_show.value = term; // 现在可以展示 mitigation 列
        //
        //     // let [centers, clusterHulls] = call_cluster(); // TODO: 把计算拆分，并且这个函数应该早于 getTSNE 进行
        //     // drawGlyphs(term, centers, clusterHulls);
        //
        //     UpdateLoading.value = !UpdateLoading.value;
        // }
        /* 已弃用 */
        function estimateScores (term){
            // table 部分选择了 id 范围和 term 之后，table的隐藏列和降维图展示的是同一个 term，只有在展示之前才调用 estimate
            /* 提取每个分数对应的 index, 注意这里会有零分 */
            let scoreGrouping = scoringDataRef.value.reduce( (groups, item) => {
                // 回调函数接受两个参数，一个是累加器，一个是当前值
                const score = item[`${term}_score`];
                groups[score] = groups[score] || []; // || 代表赋予一个默认值[],防止出现假值（undefined, NA...）
                groups[score].push(+item.stuIndex);
                return groups;
            }, {}); // reduce 函数接受两个参数，一个回调函数，一个初始值

            console.log('scoreGrouping', scoreGrouping);

            let centers = [];
            let clusterHulls = [];
            /* 根据 index 获取点的位置并计算中心（排除 outlier） */
            for (let s=1; s<6; s++){
                let locGroup = dimReduceData.value.filter(obj=>{
                    //回调函数接受三个参数：当前元素、当前元素的索引和数组本身。在这段代码中回调函数用于判断obj.index是否在A列表中。
                    return (scoreGrouping[s] || []).includes(+obj.stuIndex);
                });//filter函数接受一个回调函数作为参数，该回调函数用于筛选出符合条件的元素。
                // console.log(locGroup);

                if ( d3.mean(locGroup, d=>d.x) ){ // 防止有的分数没有数据的时候locGroup是空集
                    let centerX = d3.mean(locGroup, d=>d.x),
                        centerY = d3.mean(locGroup, d=>d.y);
                    // 使用 3σ 原则&欧几里得距离排除 outliers 并修正中心位置
                    let deviationX = d3.deviation(locGroup, d=>d.x),
                        deviationY = d3.deviation(locGroup, d=>d.y);
                    let locGroupNew = locGroup.filter(obj=>{
                        let threeSigma = Math.sqrt( Math.pow(3*deviationX, 2) + Math.pow(3*deviationY, 2) );
                        return Math.sqrt((obj.x-centerX)**2 + (obj.y-centerY)**2) <= threeSigma;
                    });
                    if( d3.mean(locGroupNew, d=>d.x) ){
                        centers.push( { score:s, x:d3.mean(locGroupNew, d=>d.x), y:d3.mean(locGroupNew, d=>d.y) } );
                    }

                    // 为每一个 cluster 制作一个凸包，用于接下来绘制面积
                    // console.log(s, 'locGroupNew', locGroupNew);
                    let hull = d3.polygonHull(locGroupNew.map(d => [d.x, d.y]));
                    if(hull) { clusterHulls.push({ score:s, hulls:hull}); }

                }
            }
            console.log("centers", centers);

            /* 根据中心 estimate 每个学生的得分 */
            dimReduceData.value.map( function(item){
                const nearest = centers.reduce((prev, curr)=>{
                    const d1 = Math.sqrt((item.x-prev.x)**2 + (item.y-prev.y)**2 ),
                        d2 = Math.sqrt((item.x-curr.x)**2 + (item.y-curr.y)**2 );
                    return d1<d2 ? prev:curr;
                });
                // console.log(nearest.score);
                item.est = nearest.score;
            });

            return [centers, clusterHulls];
        }

        function call_estimate (stuIdxList, term, centerVector){
            // TODO: 接上后端接口
            scoringDataRef.value.map( (d)=>{ d[`${term}_pre`]=0; } ); // 忘记上次预测的值
            // 这里不用传分数再给后端，estimate 只需要根据空间相似度分配预测值
            get_estimate_back();

            // async function get_estimate_back(){
            function get_estimate_back(){
                // 如果用户某项的打分数量是0，1，不要给后端训练, 控制一下
                let limitNum = 5; // 最低需要 5 个训练数据
                let returnData = {};

                if( Object.keys(scoreDict).length > limitNum ){
                    // returnData = await HttpHelper.axiosPost("/api/getEstimate", { "taskID": taskID, "item": term_Lookup[term], center:centerVector});
                    // 返回的预测分数在1-5之间（原来零的需要是零，预测值无效）

                    let fakeScore = {};
                    Object.keys(sid_idx_lookup).map((k)=>{ fakeScore[k]=Math.floor(Math.random() * (5 - (1) + 1) + (1)); });
                    returnData = fakeScore;

                    Estimate_score.value = returnData; // 全局变量
                    // estimate 根据现有的簇进行预测，直接得到该有的分数
                    // let maxs = Object.values(Estimate_score.value).reduce((max, val) => { return Math.max(max, val); }, -Infinity);
                    // let mins = Object.values(Estimate_score.value).reduce((min, val) => { return Math.min(min, val); }, +Infinity);
                    scoringDataRef.value.map((s)=>{
                        if(s[`${term}_score`]){ // 只展示被打过分的学生的预测分数值, 其余已在开始时赋 0
                            s[`${term}_pre`] = Estimate_score.value[idx_sid_lookup[+s.stuIndex-1]];
                        }
                    });
                }
                else { console.log("Warning: Too less valid training data, cannot call Estimate!"); }
                getTableData();

            }

            console.log("receive estimation here!", stuIdxList);
        }

        function call_RankSVM(stuIdxList, term) {
            // TODO: 接上后端接口
            scoringDataRef.value.map( (d)=>{ d[`${term}_pre`]=0; } ); // 忘记上次预测的值
            let scoreDict = {};
            let scoreRange = [Infinity, -Infinity]; // 预测的值需要归一化到这个分数区间
            stuIdxList.map((idx)=>{  // 提取出在选择范围内并已打过分的数据构成 SID-分数 字典, 给后端做训练
                if (scoringDataRef.value[idx-1][`${term}_score`]){
                    let scr = scoringDataRef.value[idx-1][`${term}_score`];
                    scoreDict[idx_sid_lookup[idx]] = scr;
                    scoreRange = [scr<scoreRange[0]?scr:scoreRange[0], scr>scoreRange[1]?scr:scoreRange[1]];
                }});
            get_RankSVM_back();

            // async function get_RankSVM_back(){
            function get_RankSVM_back(){
                // 如果用户某项的打分数量是0，1，不要给后端训练, 控制一下
                let limitNum = 5; // 最低需要 5 个训练数据
                let returnData = [];

                if( Object.keys(scoreDict).length > limitNum ){
                    // returnData = await HttpHelper.axiosPost("/api/getRankSVM", { "taskID": taskID, "item": term_Lookup[term], "scoreDict": scoreDict });  // top_k, pred

                    let fakeRank = {};
                    Object.keys(sid_idx_lookup).map((k)=>{ fakeRank[k]=Math.floor(Math.random() * (100 - (-100) + 1) + (-100)); });
                    returnData = [[], fakeRank];

                    RankSVM_topk.value = returnData[0], RankSVM_rank.value = returnData[1]; // 全局变量
                    let maxr = Object.values(RankSVM_rank.value).reduce((max, val) => { return Math.max(max, val); }, -Infinity);
                    let minr = Object.values(RankSVM_rank.value).reduce((min, val) => { return Math.min(min, val); }, +Infinity);
                    scoringDataRef.value.map((s)=>{
                        if(s[`${term}_score`]){ // 只展示被打过分的学生的预测分数值, 其余已在开始时赋 0
                            s[`${term}_pre`] = Math.round( (RankSVM_rank.value[idx_sid_lookup[+s.stuIndex-1]] - minr)/
                                (maxr-minr) * (scoreRange[1]-scoreRange[0]) + scoreRange[0] );
                        }
                    });
                }
                else { console.log("Warning: Too less valid training data, cannot call RankSVM!"); }
                getTableData();
            }

            console.log("receive rankSVM here!", stuIdxList);
        }

        /** call_cluster 必须在 estimate 之前做，和 rankSVM 关系不大
         * 需要计算每个(人打分)分数段学生在高维上的簇和簇中心，和原始点一起降维得到画图用的降维坐标
         * estimate 根据高维聚类中心生成估计值（最近簇），但不生成新的簇中心位置，因此和降维函数顺序无关
         * rankSVM 估计值直接和簇中心对应 */



        function drawGlyphs (term) {
            let bindDataGroup = scoringDataRef.value.map( function(item, index){
                let temp = dimReduceData.value.find( ({stuIndex}) => stuIndex===item.stuIndex );
                return  {
                    stuIndex: item.stuIndex,
                    x: temp.x,
                    y: temp.y,
                    // x: dimReduceData.value[index].x,
                    // y: dimReduceData.value[index].y,
                    score: item[`${term}_score`],
                    score_pre: item[`${term}_pre`],
                };
            });
            // console.log(bindDataGroup);

            // 构建 centers[], clusterHulls[]
            let centers = centerDimReduceData.value.map((item)=>{
                return { score:item.center, x:item.x, y:item.y };
            });

            let clusterHulls = centerStuDict.value.map( (item)=>{
                let locGroup = dimReduceData.value.filter(obj=>{
                    //回调函数接受三个参数：当前元素、当前元素的索引和数组本身。在这段代码中回调函数用于判断obj.index是否在A列表中。
                    return (item.stuList).includes(+obj.stuIndex);
                }); //filter函数接受一个回调函数作为参数，该回调函数用于筛选出符合条件的元素。
                return { score:item.center, hulls:d3.polygonHull( locGroup.map( sl=>[sl.x, sl.y] ) ) };
            } )


            /* svg配置 */
            const svgH = 400, svgW = 840, margin = 20;
            // const svgW = 1130;
            const scoreInnerRadius = 11.5, scoreOuterRadius = 15, idRadius = 8, estRadius = 11, centerRadius = 8;
            if (d3.select('#DimReduceDiv').select('#DimReduceSvg')) { d3.select('#DimReduceSvg').remove(); }
            let DimRedSVG = d3.select('#DimReduceDiv').append('svg').attr('id', 'DimReduceSvg')
                .attr('width', svgW).attr('height', svgH);

            let x_scale = d3.scaleBand().range([0, 2*Math.PI])
                .align(0) // This does nothing ?
                .domain( [1,2,3,4,5] );

            let xg_scale = d3.scaleLinear().domain([margin, svgW-margin]).range([margin, svgW-margin]);
            let yg_scale = d3.scaleLinear().domain([margin, svgH-margin]).range([margin, svgH-margin]);

            /* Add a clipPath: everything out of this area won't be drawn. */
            DimRedSVG.append("defs").append("SVG:clipPath")
                .attr("id", "clip")
                .append("SVG:rect")
                .attr("width", svgW )
                .attr("height", svgH )
                .attr("x", 0)
                .attr("y", 0);
            let scatter = DimRedSVG.append('g').attr("clip-path", "url(#clip)");
            let zoom = d3.zoom()
                .scaleExtent([0.5, 6]).extent([[0,0], [svgW, svgH]])
                .on('zoom', updateZoomChart);

            // 利用 svg 中的 marker 元素定义箭头的形状和相对位置，marker 是用于定义在路径或折线的端点样式的元素，例如箭头或多边形
            // DimRedSVG.append("defs").append("marker")
            //     .attr("id", "arrow") // 箭头的 id
            //     .attr("viewBox", "0 -5 10 10") // 箭头的视图框
            //     .attr("refX", -20) // 箭头相对于路径的位置
            //     .attr("markerWidth", 5) // 箭头的宽度
            //     .attr("markerHeight", 5) // 箭头的高度
            //     .attr("orient", "auto") // 箭头的方向
            //     .append("path") // 箭头的路径
            //     .attr("d", "M0,-5L10,0L0,5"); // 箭头的形状

            // 绘制每个 cluster 的凸包
            console.log('clusterHulls', clusterHulls);
            const centerArea = d3.line() // 在定义 hulls 的时候 d => [d.x, d.y]
                .x(d => xg_scale(d[0]))
                .y(d => yg_scale(d[1]))
                .curve(d3.curveCatmullRomClosed); // 设置曲线插值方式为闭合的 Catmull-Rom
            scatter.selectAll('path').data(clusterHulls).enter().append('path')
                .attr('class','clusterHulls').attr('id', (d)=>{ return `hull${d.score}`; })
                .attr('d', (d)=>{ return centerArea(d.hulls); })
                .attr('fill', glyphLegend(term)[0])
                .attr('stroke-width', scoreOuterRadius*2)
                .attr('stroke', (d)=>{ return glyphLegend(term)[0]; })
                .attr('opacity', 0);

            // 中心点连线
            // let centerLines = centers.reduce((paths, item, i)=>{
            //     if(i<centers.length-1) { paths.push( { x1:item.x, y1:item.y, x2:centers[i+1].x, y2:centers[i+1].y } ); }
            //     return paths;
            // }, []);
            // console.log(centerLines);
            const centerPath = d3.line()
                .x(d=>xg_scale(d.x))
                .y(d=>yg_scale(d.y));
            scatter.append("path").attr('d', centerPath(centers)).attr("stroke", '#2D2D2D').attr("fill", 'none')
                .attr('id', 'centerPath');

            let glyph_g_group = scatter.selectAll('glyph_g')
                .data(bindDataGroup).enter().append('g')
                .attr('id', function (d){ return `glyph_${d.stuIndex}`; })
                .attr('class', (d)=>{ return `gCluster${d.score}`; })
                .style("opacity", 0.9)
                .style('cursor', 'default')
                .attr("transform", function (d){ return `translate(${xg_scale(d.x)}, ${yg_scale(d.y)})`; });

            glyph_g_group
                .on("mouseover", (d)=>{
                    scatter.select(`#center${d.score}`).style('stroke', '#2D2D2D');
                    scatter.select(`#hull${d.score}`).style("opacity", 0.3);
                    glyph_g_group.style('opacity', 0.15);
                    scatter.selectAll(`.gCluster${d.score}`).style("opacity", 0.9);
                })
                .on("mouseleave", ()=>{
                    scatter.selectAll('.centerDots').style('stroke', 'none');
                    scatter.selectAll('.clusterHulls').style('opacity', 0);
                    glyph_g_group.style('opacity', 0.9);
                });

            // 绘制中心点
            scatter.selectAll('circle').data(centers).enter().append('circle')
                .attr('class','centerDots').attr('id', (d)=>{ return `center${d.score}`; })
                .attr('r', centerRadius)
                .style('fill', (d)=>{ return glyphLegend(term)[d.score-1]; })
                .style('cursor', 'pointer')
                .attr("transform", function (d){ return `translate(${xg_scale(d.x)}, ${yg_scale(d.y)})`; })
                .on("mouseover", (d)=>{
                    scatter.select(`#center${d.score}`).style('stroke', '#2D2D2D');
                    scatter.select(`#hull${d.score}`).style("opacity", 0.3);
                    glyph_g_group.style('opacity', 0.15);
                    scatter.selectAll(`.gCluster${d.score}`).style("opacity", 0.9);
                })
                .on("mouseleave", ()=>{
                    scatter.selectAll('.centerDots').style('stroke', 'none');
                    scatter.selectAll('.clusterHulls').style('opacity', 0);
                    glyph_g_group.style('opacity', 0.9);
                });
            // console.log(centers);

            // 下面开始画glyph

            // glyph_g_group.append('circle').attr('r', scoreOuterRadius).style('fill', 'white').style("opacity", 0.7);
            // id 圈
            glyph_g_group.append('circle')
                .attr('r', idRadius)
                .style('fill', 'white')
                .style('stroke', idColor);
            // id
            glyph_g_group.append('text')
                .attr('x', -6.2)
                .attr('y', 4.1)
                .style('font-size', 11)
                .style('font-weight', 700)
                .style('font-family', 'Noto Sans')
                .text((d) => { return String(d.stuIndex).padStart(2, 0); })
                .style('fill', function (d){
                    if(d.score===0 || d.score===d.score_pre){ return estColor('consistent'); }
                    else if (d.score > d.score_pre){ return estColor('high'); }
                    else { return estColor('low'); }
                });
            // 人打分分数
            let glyph_arc_group = glyph_g_group.append('g');
            for (let i=1; i<6; i++){
                glyph_arc_group.append('path')
                    .attr("fill", function (d) {
                        if(i>d.score){ return grayRingColor; }
                        else { return glyphLegend(term)[d.score-1]; }
                    })
                    .attr("d", d3.arc()
                        .innerRadius(scoreInnerRadius).outerRadius(scoreOuterRadius)
                        .startAngle(x_scale(i)).endAngle( x_scale(i) + x_scale.bandwidth() )
                        .cornerRadius(4)
                        .padAngle(0.12)
                        .padRadius(scoreOuterRadius)
                    ); // 间隔的弧长是用半径×弧度计算的，不能用 0);
            }
            // 估计分数
            glyph_g_group.append('path')
                .attr("fill", function (d) {
                    if (d.score === 0) { return 'none';}
                    return glyphLegend(term)[d.score_pre-1];
                    // if (d.score < d.score_pre){ return estColor('low'); }
                    // else if (d.score > d.score_pre){ return estColor('high'); }
                    // else { return estColor('consistent'); }
                })
                .attr("d", d3.arc()
                    .innerRadius(idRadius+1).outerRadius(estRadius)
                    .startAngle(0).endAngle( (d)=>{ return x_scale(d.score_pre) + x_scale.bandwidth(); } ));

            DimRedSVG.call(zoom);

            function updateZoomChart() {
                let new_xg_scale = d3.event.transform.rescaleX(xg_scale);
                let new_yg_scale = d3.event.transform.rescaleY(yg_scale);
                glyph_g_group.attr('transform', (d)=>{ return `translate(${new_xg_scale(d.x)},${new_yg_scale(d.y)})`; });
                // scatter.selectAll('.my_glyph')
                //     .attr('transform', function (d){
                //         return `translate(${new_xg_scale(d.x)},${new_yg_scale(d.y)})`;
                //     });
                scatter.selectAll('.centerDots')
                    .attr('transform', function (d){
                        return `translate(${new_xg_scale(d.x)},${new_yg_scale(d.y)})`;
                    });
                scatter.select('#centerPath')
                    .attr('d', centerPath(centers.map(
                        (d)=>{ return {score:d.score, x:new_xg_scale(d.x), y:new_yg_scale(d.y)}; }
                    )));
                scatter.selectAll('.clusterHulls')
                    .attr('d', function (d){
                        // console.log(d);
                        return centerArea(d.hulls.map(
                            (d)=>{ return [ new_xg_scale(d[0]), new_yg_scale(d[1]) ]; }
                        )); });
            }
        }


        /*********************************************************************************************************
         ********************************************** ExSitu View **********************************************
         *********************************************************************************************************/
        const eTable =ref(null);
        const tableData = ref([]);
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

        const timeSvgConfig = {
            width: 210,
            height: 23,
        };
        const basicColorList = ['#D5C1E0', '#A1D9D5', '#F2D492', '#C5E99B'];
        const timeLegend = d3.scaleOrdinal().domain(itemList).range(basicColorList);
        let timeScale = '', timeItemMax = 0;
        let lastTerm = 'EB';

        // const exsitu_show = ref({EB: false, Com: false, Ho: false, ExA: false});
        const exsitu_show = ref('');
        const miti_exsitu_show = ref('');
        const UpdateLoading = ref(false);
        const disUpdatable = ref(true);
        const selectedRange = ref([1, NNum]);
        let selectedIndexes = [];

        function cellStyle({row, column}) {
            let [t, suffix] = column.property.split('_');
            if(suffix === 'est') {
                if( row[column.property]<row[t] ){ return {color:estColor('low')}; }
                else if( row[column.property]>row[t] ){ return {color:estColor('high')}; }
                else return {};
            }
            return {};
        }

        function getTableData() {
            // 从 scoringDataRef 转化到 table data 的过程
            timeItemMax = d3.max(scoringDataRef.value, d => d.total_time);
            // console.log('timeItemMax', timeItemMax);
            timeScale = d3.scaleLinear().domain([0, d3.max([timeItemMax, 20])]).range([0, timeSvgConfig.width]);
            tableData.value = scoringDataRef.value.map( function(item, index){
                let obj = {};
                obj.index = +item.stuIndex;
                obj.status = item.total_score===0?'Ungraded':(item.EB_score && item.Com_score && item.Ho_score && item.ExA_score ? 'Graded': 'Grading');
                obj.name = idx_Ename_lookup[item.stuIndex-1];
                // obj.name = idx_Cname_lookup[item.stuIndex-1];
                obj.EB = item.EB_score;
                obj.Com = item.Com_score;
                obj.Ho = item.Ho_score;
                obj.ExA = item.ExA_score;

                obj.EB_est = item.EB_est;
                obj.Com_est = item.Com_est;
                obj.Ho_est = item.Ho_est;
                obj.ExA_est = item.ExA_est;

                let stackdata = [];
                let start = 0;
                itemList.forEach((term)=>{
                    stackdata.push([term, timeScale(start), timeScale(item[`${term}_time`])]);
                    start += item[`${term}_time`];
                });
                // console.log(stackdata);
                obj.stackTime = stackdata;
                obj.total_time = item.total_time;
                return obj;
            } );

        }

        const handTermChange = (val) => {
            // 选择了term才能点击update按钮, 和表格的关系已经直接通过v-model和v-if绑定好了
            // console.log(val);
            disUpdatable.value = !val;
            miti_exsitu_show.value = '';
        };

        const sliderToggleTableSelect = (selVal) => {
            eTable.value.clearSelection();
            for (let r=selVal[0]-1; r<selVal[1]; r++) {
                eTable.value.toggleRowSelection(tableData.value[r], true);
            }
        };


        function handleSelectionChange (selection) {
            // console.log("handleSelectionChange", selection);
            let newRange = selection.map((sel)=>sel.index).reduce((range, selIdx)=>{
                range = [ selIdx<range[0]?selIdx:range[0], selIdx>range[1]?selIdx:range[1] ];
                return range;
            }, [41, 0]);
            // console.log(newRange);
            selectedRange.value = newRange;
        }

        const handleUpdateButton = (statusBool) => {
            UpdateLoading.value = statusBool; //loading状态，避免快速点击
            // setTimeout(function() {
            //     UpdateLoading.value = !statusBool;
            // }, 1500); // 取消 loading 状态
            let selectedRow = _this.refs.eTable.getSelectionRows();
            selectedIndexes = selectedRow.map( (r)=>r.index ).reduce( (acc, curr)=>acc.concat(curr), [] ); // 从1计数
            // let selectedIndexes = selectedRow.map( (r)=>r.index ).reduce( (acc, curr)=>acc.concat(curr), [] )
            //     || Array.from({ length: NNum }, (_, i) => i + 1); //当用户没有选择范围则返回全体【仅适用于 estimate】
            // console.log('handleUpdateButton', selectedIndexes);
            if(!selectedIndexes.isEmpty) { // 仅当选中的数据不为空时才调用后端函数估计 mitigation 值
                call_cluster(exsitu_show.value);
                // getGlyphLoc(exsitu_show.value);  //TODO: 根据选中的 stuIndex 和 term 去做【estimate 或 rankSVM】
            }

            // rankSVM 调用后端函数进行计算，直接修改 scoringDataRef 和 tabledata，展示对应的一列，获取 loc 和展示
            // estimate 先获取
        };

        const handleFilterStatus = (value, row, column) => {
            return row.status === value;
        };

        const handleScoreChange = (value, term) => {
            // console.log("handleScoreChange ", value, term);
            scoringDataRef.value[value.index-1].total_score += (value[term] - scoringDataRef.value[value.index-1][`${term}_score`]);
            scoringDataRef.value[value.index-1][`${term}_score`] = value[term];
            tableData.value[value.index-1].status = scoringDataRef.value[value.index-1].total_score===0?'Ungraded':
                (scoringDataRef.value[value.index-1].EB_score && scoringDataRef.value[value.index-1].Com_score &&
                scoringDataRef.value[value.index-1].Ho_score && scoringDataRef.value[value.index-1].ExA_score ? 'Graded': 'Grading');
            // drawGlyphs();  // TODO: 代码逻辑要理顺
            let timeStamp = new Date();
            scoringDataRef.value[value.index-1][`${term}_timestamp`].push(["Sum", timeStamp]);
        };

        function handleTRowClick (row, column, event) {
            console.log('handleTRowClick', row.index);
            // activeStuIndexRef.value = row.index;
            handleSelectedValueUpdate(row.index);
            // /////////////////// TODO: glyph 高亮
        }

        const handleSelectedValueUpdate = (newValue) => { // 使 父亲更新 CV Description
            activeStuIndexRef.value = newValue;
            // console.log(newValue, activeStuIndexRef, activeStuIndexRef.value);
            emit('update:active-stu-index', activeStuIndexRef.value);
        };


        onMounted(() => {
            getTableData();
            construct_sid_lookup();
            if (! d3.max(scoringDataRef.value, d => d.total_time)){ console.log(" 还没打分，不应该访问 Summary "); }
        });

        return {
            /* data */
            NNum,
            UpdateLoading,
            disUpdatable,
            selectedRange,
            eTable,
            tableData,
            exsitu_show,
            miti_exsitu_show,
            itemList,
            timeSvgConfig,
            timeLegend,
            /* function */
            cellStyle,
            handTermChange,
            sliderToggleTableSelect,
            handleUpdateButton,
            handleFilterStatus,
            handleScoreChange,
            handleTRowClick,
            handleSelectionChange,
        };

    },
};