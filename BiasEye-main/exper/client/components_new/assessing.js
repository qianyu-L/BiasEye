/* eslint-disable no-unused-vars */

//vue3.0 新增API：useRouter (跳转页) 和 useRoute (接受页)
import { useRoute } from 'vue-router';

// import { onMounted } from "vue";
import { onMounted, ref, watch } from "vue";
import * as d3 from "d3";

export default {
    data () {
        return {
            defaultMenuIndex: '/stuList/:id',
            menuList: [
                {id: 1, authName:"Student List", path: '/stuList/:id',   },
                {id: 2, authName:"Assessing",    path: '/stuDetail/:id', },
                {id: 3, authName:"Summary",      path: '/summary/:id',   },
            ],
        };
    },

    components:{

    },

    setup() { // 这里的内容需要 return 出去才可被 vue 使用
        const route = useRoute(); // 获取参数用
        const taskID = route.query.id;
        const NNum = taskID==='1'? 40:40;


        /************************************************************************************************
         ********************************************* el-main *******************************************
         *************************************************************************************************/
        const activeStuIndex = ref(0);
        // const summaryClickIndex = ref(0);
        let initList = [];
        for(let i=0; i<NNum; i++) {
            let obj = {
                stuIndex: (i+1).toString(),
                // stuIndex:  i+1,
                // time
                EB_time:     0,
                Com_time:    0,
                Ho_time:     0,
                ExA_time:    0,
                // PS_time:     0,
                // RL_time:     0,
                total_time:  0,
                // score
                EB_score:    0,
                Com_score:   0,
                Ho_score:    0,
                ExA_score:   0,
                // PS_score:    0,
                // RL_score:    0,
                total_score: 0,
                // predict score
                EB_pre:    0,
                Com_pre:   0,
                Ho_pre:    0,
                ExA_pre:   0,
                // PS_pre:    0,
                // RL_pre:    0,
                // comment
                CV_comment:    '',
                EB_comment:    '',
                Com_comment:   '',
                Ho_comment:    '',
                ExA_comment:   '',
                // PS_comment:    '',
                // RL_comment:    '',
                // change times
                EB_timestamp:    [],
                Com_timestamp:   [],
                Ho_timestamp:    [],
                ExA_timestamp:   [],
                // PS_timestamp:    [],
                // RL_timestamp:    [],
            };
            initList.push(obj);
        }
        let scoringData = ref(initList);


        /*************************************************************************************************
         ***************************************** statistic view ******************************************
         *************************************************************************************************/
        const overInfo = ref([]);
        const allDensity = ref([]);

        let x_scale_200 = d3.scaleLinear().domain([205, -5]).range([10, 276]);
        let x_scale_5   = d3.scaleLinear().domain([-0.5, 5.5]).range([10, 276]);
        let x_scale_4   = d3.scaleLinear().domain([4.5, 0.5]).range([10, 276]);
        let x_scale_100 = d3.scaleLinear().domain([84, -2]).range([10, 276]);
        let x_scale_10  = d3.scaleLinear().domain([-0.5, 10.5]).range([10, 276]);

        function getOverviewInfo(){
            // TODO: 根据 taskID 向后端获取 overview 的 information
            const letters = ['A', 'B', 'C', 'D'];
            const svgH = 80, svgW = 288;
            d3.selectAll('.overviewCard').append('svg').attr('id', 'cardSvg').attr('width', svgW).attr('height', svgH);

            let kde_200 = kernelDensityEstimator(kernelEpanechnikov(1), x_scale_200.ticks(100)); // increase this 40 for more accurate density.
            let kde_100 = kernelDensityEstimator(kernelEpanechnikov(2), x_scale_100.ticks(100));
            let kde_10  = kernelDensityEstimator(kernelEpanechnikov(0.4), x_scale_10.ticks(100));
            let kde_5 = kernelDensityEstimator(kernelEpanechnikov(0.4), x_scale_5.ticks(50));
            let kde_4 = kernelDensityEstimator(kernelEpanechnikov(0.4), x_scale_4.ticks(50));

            function kernelDensityEstimator(kernel, X) {
                return function(V) {
                    return X.map(function(x) {
                        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
                    });
                };
            }
            function kernelEpanechnikov(k) {
                return function(v) {
                    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
                };
            }

            let jsonSrc = taskID==='1' ? "static/UseCaseJson/Overview1.json" : "static/UseCaseJson/Overview2.json";
            d3.json( jsonSrc, function(error, file) {
                if(error) console.error(error);
                overInfo.value = file;
                overInfo.value.map( function(item){
                    if(item.key==='rankSchool'){
                        item.value = item.value.map(function(d){ return d3.min([d, 200]); }); // d3.min() 要的是数组，要套中括号
                    }
                    else if(item.key.includes('Com') | item.key.includes('Ho') | item.key==='paperNum'){
                        if(item.key==='HoSchool'){ item.value = item.value.map((d)=>{ return d3.min([d, 10]); }); }
                        else{ item.value = item.value.map((d)=>{ return  d3.min([d, 5]); }); }
                    }
                    else if(item.key==='paperLevel'){
                        item.raw = item.value;
                        let tmp = [];
                        tmp = item.raw.map((d)=>{
                            return Array(d[0]).fill(1).concat( Array(d[1]).fill(2), Array(d[2]).fill(3), Array(d[3]).fill(4) );
                        });
                        item.value = [].concat(...tmp);
                    }
                } );
                // console.log(overInfo.value);
                // overInfo.value = [
                //     {key: 'rankSchool', value: file },
                //     {key: 'rankStu',    value: Array(40).fill().map(() => Math.floor(Math.random() * (50 - 1 + 1)) + 1) },

                //     {key: 'ComCountry', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },
                //     {key: 'ComProvince', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },
                //     {key: 'ComCity', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },
                //     {key: 'ComSchool', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },

                //     {key: 'HoCountry', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },
                //     {key: 'HoProvince', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },
                //     {key: 'HoCity', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },
                //     {key: 'HoSchool', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },

                //     {key: 'paperNum', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },
                //     {key: 'paperLevel', value: Array(40).fill().map(() => Math.floor(Math.random() * (5 + 1))) },
                //   //{key: 'paperLevel', value: Array.from({ length: 40 }, () => letters[Math.floor(Math.random() * letters.length)])},
                // ]

                // let keyList = overInfo.value.map((item)=>item.key);
                for (let i = 0; i < 12; i++) {
                    if(overInfo.value[i].key==='rankSchool'){
                        let caDensity = kde_200( overInfo.value[i].value );
                        allDensity.value.push( {key: overInfo.value[i].key, density: caDensity} );
                    }
                    else if(overInfo.value[i].key==='rankStu'){
                        let caDensity = kde_100( overInfo.value[i].value );
                        allDensity.value.push( {key: overInfo.value[i].key, density: caDensity} );
                    }
                    else if(overInfo.value[i].key==='paperLevel'){
                        let caDensity = kde_4( overInfo.value[i].value );
                        allDensity.value.push( {key: overInfo.value[i].key, density: caDensity} );
                    }
                    else if(overInfo.value[i].key==='HoSchool'){
                        let caDensity = kde_10( overInfo.value[i].value );
                        allDensity.value.push( {key: overInfo.value[i].key, density: caDensity} );
                    }
                    else {
                        let caDensity = kde_5( overInfo.value[i].value );
                        allDensity.value.push( {key: overInfo.value[i].key, density: caDensity} );
                    }
                }
                // console.log(allDensity.value);

                drawDensityLine();
                drawRainCloud();

            });

            function drawDensityLine() {

                const text_y = 77, title_x = 6, title_y = 19;
                let y_scale_group = {};
                // console.log("drawDensityLine", allDensity.value);
                allDensity.value.map(function(item){
                    let domain_max = d3.max( item.density.map((item) => item[1]) );
                    let keyname = item.key;
                    y_scale_group[keyname] = d3.scaleLinear().domain([0, domain_max]).range([54, 18]) ;
                });
                // console.log(y_scale_group['paperNum'](0.01));

                let density_group = d3.selectAll('.overviewCard').select('#cardSvg')
                    .data(allDensity.value)
                    .append('g').attr('id', (d)=>`density_${d.key}`);

                density_group.append('text').style("font-size", "14px").style('font-weight',500).attr("text-anchor", "left")
                    .attr("fill", "#606266").attr("x", title_x).attr("y", title_y)
                    .text(function(){
                        if(this.parentElement.id.indexOf('rankSchool')>-1){
                            // return '学校排名';
                            return 'School Ranking';
                        }
                        if(this.parentElement.id.indexOf('rankStu')>-1){
                            // return '学生成绩排名';
                            return 'Student GPA Ranking';
                        }
                        if(this.parentElement.id.indexOf('ComWorld')>-1){
                            // return '国际竞赛数量';
                            return '# of International Competition';
                        }
                        if(this.parentElement.id.indexOf('ComNation')>-1){
                            // return '国家级竞赛数量';
                            return '# of National Competition';
                        }
                        if(this.parentElement.id.indexOf('ComProvince')>-1){
                            // return '省级竞赛数量';
                            return '# of Provincial Competition';
                        }
                        if(this.parentElement.id.indexOf('ComSchool')>-1){
                            // return '校级竞赛数量';
                            return '# of School-level Competition';
                        }
                        if(this.parentElement.id.indexOf('HoWorld')>-1){
                            // return '国际荣誉称号数量';
                            return '# of International Honor';
                        }
                        if(this.parentElement.id.indexOf('HoNation')>-1){
                            // return '国家级荣誉称号数量';
                            return '# of National Honor';
                        }
                        if(this.parentElement.id.indexOf('HoProvince')>-1){
                            // return '省级荣誉称号数量';
                            return '# of Provincial Honor';
                        }
                        if(this.parentElement.id.indexOf('HoSchool')>-1){
                            // return '校级荣誉称号数量';
                            return '# of School-level Honor';
                        }
                        if(this.parentElement.id.indexOf('paperNum')>-1){
                            // return '科研成果数量';
                            return '# of Research Paper';
                        }
                        if(this.parentElement.id.indexOf('paperLevel')>-1){
                            // return '会议/期刊级别';
                            return 'Level of Conference / Journal';
                        }
                    });

                density_group.append('g').selectAll('.levelText')
                    .data(function(){
                        let keyname = this.parentElement.id.split('_')[1];
                        if(keyname==='rankSchool'){  return [1].concat(d3.range(50,210,50)); }
                        else if(keyname==='rankStu') { return [1].concat( d3.range(20,85,20) ); }
                        else if(keyname==='HoSchool') { return d3.range(0,11,1); }
                        else if(keyname==='paperLevel') { return d3.range(1,5,1); }
                        else{ return d3.range(0,6,1); }
                    })
                    .enter().append('text')
                    .style("font-size", "10px").attr("text-anchor", "middle").attr("fill", "#606266")
                    .attr('x', function (d){
                        let keyname = this.parentElement.parentElement.id.split('_')[1];
                        // console.log(keyname);
                        if(keyname==='rankSchool'){ return x_scale_200(d); }
                        else if(keyname==='rankStu') { return x_scale_100(d); }
                        else if(keyname==='HoSchool') { return x_scale_10(d); }
                        else if(keyname==='paperLevel') { return x_scale_4(d); }
                        else{ return x_scale_5(d); }
                    })
                    .attr("y", text_y )
                    .text(function(d){
                        let keyname = this.parentElement.parentElement.id.split('_')[1];
                        if(keyname==='rankStu') { return `${d}%`; }
                        else if(keyname==='paperLevel') { return letters[d-1]; }
                        else {return d;}
                    });

                density_group.append("path")
                    .datum( (d)=>d.density )
                    .style("stroke", function(d){
                        // console.log(this.parentElement.id);
                        if(this.parentElement.id.indexOf('rank')>-1){ return '#776357'; }
                        else if(this.parentElement.id.indexOf('Com')>-1){ return '#317286'; }
                        else if(this.parentElement.id.indexOf('Ho')>-1){ return '#B56B6B'; }
                        else { return '#C89528'; }
                    })
                    .style("fill", function(d){
                        if(this.parentElement.id.indexOf('rank')>-1){ return '#F4E9E3'; }
                        else if(this.parentElement.id.indexOf('Com')>-1){ return '#F1FAFD'; }
                        else if(this.parentElement.id.indexOf('Ho')>-1){ return '#FFF2F2'; }
                        else { return '#FFFCEF'; }
                    })
                    .attr("stroke-width", 1)
                    .attr("d", function(d){
                        let keyname = this.parentElement.id.split('_')[1];
                        return d3.line()
                            .curve(d3.curveBasis)
                            .x(function(item) {
                                if(keyname==='rankSchool'){ return x_scale_200(item[0]); }
                                else if(keyname==='rankStu') { return x_scale_100(item[0]); }
                                else if(keyname==='HoSchool') { return x_scale_10(item[0]); }
                                else if(keyname==='paperLevel') { return x_scale_4(item[0]); }
                                else{ return x_scale_5(item[0]); }
                            })
                            .y(function(item) { return y_scale_group[keyname](item[1]);  })(d);
                    });
            }

            function drawRainCloud(){ // no rain actually ...
 
                // let circlePadding = 0.5;
                // let dot_r = 2;
                const box_y = 55, box_h = 12, line_y = 60, mean_y = 59, mean_h = 4;
 
                let rainCloud_group = d3.selectAll('.overviewCard').select('#cardSvg').data(overInfo.value)
                    .append('g').attr('id', function(d){
                        // console.log('debug', d.key);
                        return `rainCloud_${d.key}`;
                    });
                rainCloud_group.append('line')
                    .attr("y1", line_y)
                    .attr("y2", line_y)
                    .attr("x1", function(d){
                        if(d.key==='rankSchool'){ return x_scale_200(d3.min(d.value)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.max(d.value)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.min(d.value)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.max(d.value)); }
                        else { return x_scale_5(d3.min(d.value)); }
                    })
                    .attr("x2", function(d){
                        if(d.key==='rankSchool'){ return x_scale_200(d3.max(d.value)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.min(d.value)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.max(d.value)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.min(d.value)); }
                        else { return x_scale_5(d3.max(d.value)); }
                    })
                    .style("stroke", function(d){
                        if(d.key.includes('rank')){ return '#776357'; }
                        else if(d.key.includes('Com')){ return '#317286'; }
                        else if(d.key.includes('Ho')){ return '#B56B6B'; }
                        else { return '#C89528'; }
                    });
 
                rainCloud_group.append('line')
                    .attr("y1", box_y)
                    .attr("y2", box_h + box_y)
                    .attr("x1", function(d){
                        if(d.key==='rankSchool'){ return x_scale_200(d3.min(d.value)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.max(d.value)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.min(d.value)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.max(d.value)); }
                        else { return x_scale_5(d3.min(d.value)); }
                    })
                    .attr("x2", function(d){
                        if(d.key==='rankSchool'){ return x_scale_200(d3.min(d.value)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.max(d.value)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.min(d.value)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.max(d.value)); }
                        else { return x_scale_5(d3.min(d.value)); }
                    })
                    .style("stroke", function(d){
                        if(d.key.includes('rank')){ return '#776357'; }
                        else if(d.key.includes('Com')){ return '#317286'; }
                        else if(d.key.includes('Ho')){ return '#B56B6B'; }
                        else { return '#C89528'; }
                    });
 
                rainCloud_group.append('line')
                    .attr("y1", box_y)
                    .attr("y2", box_h + box_y)
                    .attr("x1", function(d){
                        if(d.key==='rankSchool'){ return x_scale_200(d3.max(d.value)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.min(d.value)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.max(d.value)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.min(d.value)); }
                        else { return x_scale_5(d3.max(d.value)); }
                    })
                    .attr("x2", function(d){
                        if(d.key==='rankSchool'){ return x_scale_200(d3.max(d.value)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.min(d.value)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.max(d.value)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.min(d.value)); }
                        else { return x_scale_5(d3.max(d.value)); }
                    })
                    .style("stroke", function(d){
                        if(d.key.includes('rank')){ return '#776357'; }
                        else if(d.key.includes('Com')){ return '#317286'; }
                        else if(d.key.includes('Ho')){ return '#B56B6B'; }
                        else { return '#C89528'; }
                    });

                rainCloud_group.append('rect')
                    .attr("y", box_y)
                    .attr('height', box_h)
                    .attr("x", function(d){
                        let sortedData = d3.range(d.value.length).map((i) => d.value[i]).sort((a, b) => a - b);
                        if(d.key==='rankSchool'){ return x_scale_200(d3.quantile(sortedData, 0.75)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.quantile(sortedData, 0.75)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.quantile(sortedData, 0.25)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.quantile(sortedData, 0.75)); }
                        else { return x_scale_5(d3.quantile(sortedData, 0.25)); }
                    })
                    .attr('width', function(d){
                        let sortedData = d3.range(d.value.length).map((i) => d.value[i]).sort((a, b) => a - b);
                        // let sortedData = d3.interpose(d.value).sort((a, b) => a - b);
                        if(d.key==='rankSchool'){
                            return Math.abs( x_scale_200(d3.quantile(sortedData, 0.25)) - x_scale_200(d3.quantile(sortedData, 0.75)) );
                        }
                        else if(d.key==='rankStu'){
                            return Math.abs( x_scale_100(d3.quantile(sortedData, 0.25)) - x_scale_100(d3.quantile(sortedData, 0.75)) );
                        }
                        else if(d.key==='HoSchool') {
                            return Math.abs( x_scale_10(d3.quantile(sortedData, 0.75)) - x_scale_10(d3.quantile(sortedData, 0.25)) );
                        }
                        else if(d.key==='paperLevel') {
                            return Math.abs( x_scale_4(d3.quantile(sortedData, 0.25)) - x_scale_4(d3.quantile(sortedData, 0.75)) );
                        }
                        else {
                            return Math.abs( x_scale_5(d3.quantile(sortedData, 0.75)) - x_scale_5(d3.quantile(sortedData, 0.25)) );
                        }
                    })
                    .style("stroke", function(d){
                        if(d.key.includes('rank')){ return '#776357'; }
                        else if(d.key.includes('Com')){ return '#317286'; }
                        else if(d.key.includes('Ho')){ return '#B56B6B'; }
                        else { return '#C89528'; }
                    })
                    .style("fill", function(d){
                        if(d.key.includes('rank')){ return '#F4E9E3'; }
                        else if(d.key.includes('Com')){ return '#F1FAFD'; }
                        else if(d.key.includes('Ho')){ return '#FFF2F2'; }
                        else {  return '#FFFCEF'; }
                    });

                rainCloud_group.append('line')
                    .attr("y1", box_y)
                    .attr("y2", box_h + box_y)
                    .attr("x1", function(d){
                        let sortedData = d3.range(d.value.length).map((i) => d.value[i]).sort((a, b) => a - b);
                        // let sortedData = d3.interpose(d.value).sort((a, b) => a - b);
                        if(d.key==='rankSchool'){ return x_scale_200(d3.quantile(sortedData, 0.5)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.quantile(sortedData, 0.5)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.quantile(sortedData, 0.5)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.quantile(sortedData, 0.5)); }
                        else { return x_scale_5(d3.quantile(sortedData, 0.5)); }
                    })
                    .attr("x2", function(d){
                        let sortedData = d3.range(d.value.length).map((i) => d.value[i]).sort((a, b) => a - b);
                        if(d.key==='rankSchool'){ return x_scale_200(d3.quantile(sortedData, 0.5)); }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.quantile(sortedData, 0.5)); }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.quantile(sortedData, 0.5)); }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.quantile(sortedData, 0.5)); }
                        else { return x_scale_5(d3.quantile(sortedData, 0.5)); }
                    })
                    .style("stroke", function(d){
                        if(d.key.includes('rank')){ return '#776357'; }
                        else if(d.key.includes('Com')){ return '#317286'; }
                        else if(d.key.includes('Ho')){ return '#B56B6B'; }
                        else { return '#C89528'; }
                    });

                rainCloud_group.append('rect')
                    .attr('height', mean_h)
                    .attr('width', mean_h)
                    .attr("y", mean_y)
                    .attr("x", function(d){
                        if(d.key==='rankSchool'){ return x_scale_200(d3.mean(d.value)) - mean_h/2; }
                        else if(d.key==='rankStu'){ return x_scale_100(d3.mean(d.value)) - mean_h/2; }
                        else if(d.key==='HoSchool') { return x_scale_10(d3.mean(d.value)) - mean_h/2; }
                        else if(d.key==='paperLevel') { return x_scale_4(d3.mean(d.value)) - mean_h/2; }
                        else { return x_scale_5(d3.mean(d.value)) - mean_h/2; }
                    })
                    .style("fill", 'none')
                    .style("stroke", function(d){
                        if(d.key.includes('rank')){ return '#776357'; }
                        else if(d.key.includes('Com')){ return '#317286'; }
                        else if(d.key.includes('Ho')){ return '#B56B6B'; }
                        else { return '#C89528'; }
                    });
            }
        }
 
 
        const refActiveStu = ref(activeStuIndex);
        // const refClickIndex = ref(summaryClickIndex);

        watch(refActiveStu, drawActiveStu); // 监听代理变量貌似可行
        // watch(refClickIndex, drawActiveStu);
        function drawActiveStu(stuIdx) {
 
            let dodge = (data, radius, padding, scale) => {
                const circles = data.map((d, i) => ({x: scale(d), data: d, index: i})).sort((a, b) => a.x - b.x);
                const epsilon = 0.001;
                let head = null, tail = null;

                // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
                function intersects(x, y) {
                    let a = head;
                    while (a) {
                        if ((radius * 2 + padding - epsilon) ** 2 > (a.x - x) ** 2 + (a.y - y) ** 2) { return true; }
                        a = a.next;
                    }
                    return false;
                }

                // Place each circle sequentially.
                for (const b of circles) {
                    // Remove circles from the queue that can’t intersect the new circle b.
                    while (head && head.x < b.x - (radius * 2 + padding)) head = head.next;

                    // Choose the minimum non-intersecting tangent.
                    if (intersects(b.x, b.y = 0)) {
                        let a = head;
                        b.y = Infinity;
                        do {
                            let y1 = a.y + Math.sqrt((radius * 2 + padding) ** 2 - (a.x - b.x) ** 2);
                            let y2 = a.y - Math.sqrt((radius * 2 + padding) ** 2 - (a.x - b.x) ** 2);
                            if (Math.abs(y1) < Math.abs(b.y) && !intersects(b.x, y1)) b.y = y1;
                            if (Math.abs(y2) < Math.abs(b.y) && !intersects(b.x, y2)) b.y = y2;
                            a = a.next;
                        } while (a);
                    }

                    // Add b to the queue.
                    b.next = null;
                    if (head === null) head = tail = b;
                    else tail = tail.next = b;
                }

                return circles;
            };
 
            // console.log(d3.selectAll('.overviewCard'));
            let dot_r = 4, dot_y = 45, dot_pad = 0.8;
            if(d3.selectAll('.overviewCard').select('#cardSvg').select('.rainDots')){d3.selectAll('.overviewCard').select('#cardSvg').selectAll('.rainDots').remove();}
            d3.selectAll('.overviewCard').select('#cardSvg').append('circle')
                .attr('id', function(){
                    let keyname = this.parentElement.parentElement.id;
                    // console.log(keyname);
                    return `${keyname}_stuDot`;
                })
                .attr("class", "rainDots")
                .attr('cx', function(d){
                    let keyname = this.parentElement.parentElement.id;
                    if(keyname==='rankSchool'){ return x_scale_200(d.value[stuIdx-1]); }
                    else if(keyname==='rankStu') { return x_scale_100(d.value[stuIdx-1]); }
                    else if(keyname==='HoSchool') { return x_scale_10(d.value[stuIdx-1]); }
                    else if(keyname==='paperLevel') { return x_scale_4(d.value[stuIdx-1]); }
                    else{ return x_scale_5(d.value[stuIdx-1]); }
                })
                .attr('cy', dot_y)
                .attr("r", dot_r)
                .style('fill', function(d){ return '#606266'; })
                .style('opacity', 0.75);
 
            d3.select('#paperLevel').select('#cardSvg').selectAll('.rainDots').remove();
            d3.select('#paperLevel').select('#cardSvg').selectAll('.rainDots')
                .data(function(d){
                    let plist = d.raw[stuIdx-1];
                    let paperData = Array(plist[0]).fill(1).concat( Array(plist[1]).fill(2), Array(plist[2]).fill(3), Array(plist[3]).fill(4) );
                    return dodge(paperData, dot_r, dot_pad, x_scale_4);
                })
                .enter()
                .append('circle')
                .attr('id', function(){
                    let keyname = this.parentElement.parentElement.id;
                    return `${keyname}_stuDot`;
                })
                .attr("class", "rainDots")
                .attr('cx', function(d){
                    // return x_scale_4(d);
                    return d.x;
                })
                .attr('cy', function(d){
                    // return x_scale_4(d);
                    return d.y+44;
                })
                .attr("r", dot_r)
                .style('fill', () => { return '#606266'; })
                .style('opacity', 0.75);
        }


        onMounted(()=>{
            /** 根据浏览器窗口大小改变界面放缩 */
            scaleWindow();
            /** 获取和生成 statistic view 的部分 */
            getOverviewInfo();

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
            taskID,
            /** sync **/
            activeStuIndex,
            // summaryClickIndex,
            scoringData,
            /*** function ***/
        };
    },

};