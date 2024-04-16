<template>
  <div style="height: 1006px; width: 1602px; display: flex">
    <div id="studentInfo">
      <div class="stuSelector">
        <!-- <el-icon class="bolderIcon" :size="54" color="#306D5A" style="margin: 0 26px 0 0; cursor:pointer" -->
        <el-icon class="bolderIcon" :size="54" color="#306D5A" style="cursor:pointer"
                 @click="handleStuBackBtn"><Back /></el-icon>
        <div class="graySelect">
          <!--          <el-select v-model="activeStuIndex" size="large" filterable  style="width: 622px">-->
          <el-select v-model="selectedValue" size="large" filterable  @change="handleStuChange" style="width: 592px">
            <el-option
                v-for="item in stuOptionList"
                :key="item.index"
                :label="item.label"
                :value="item.index"
            />
          </el-select>
        </div>

        <!-- <el-icon class="bolderIcon" :size="54" color="#306D5A" style="margin: 0 0 0 26px; cursor:pointer" -->
        <el-icon class="bolderIcon" :size="54" color="#306D5A" style="cursor:pointer"
                 @click="handleStuRightBtn"><Right /></el-icon>
      </div>

      <div class="infoDescription">
        <el-scrollbar :noresize="true" ref="myDesScoll">
          <div class="infoSec" id="BasicInfo">
            <div>
              <div style="position: absolute; left: 0; width:10px; height: 25px; background-color: #6B9589;"/>
              <div class="secTitle">Basic Information</div>
              <!-- <div class="secTitle">Basic Information 基本信息</div> -->
            </div>
            <div>
              <el-descriptions :column="3"  style="width: 740px; margin-top: 11px" border :size='formSize'>
                <!-- <el-descriptions-item label="姓名" align="center" width="120px">
                  {{ selectedStuCV["姓名"] }} </el-descriptions-item>
                <el-descriptions-item label="性别" align="center" width="120px">
                  {{selectedStuCV['性别']}} </el-descriptions-item>
                <el-descriptions-item label="就读院校" align="center" width="140px">
                  {{selectedStuCV['就读院校']}} </el-descriptions-item>
                <el-descriptions-item label="籍贯" align="center" >
                  {{selectedStuCV["籍贯"]}} </el-descriptions-item>
                <el-descriptions-item label="年龄" align="center" >
                  {{selectedStuCV['年龄']}} </el-descriptions-item>
                <el-descriptions-item label="专业" align="center" >
                  {{selectedStuCV['专业']}} </el-descriptions-item>
                <el-descriptions-item label="技能" align="center" >
                  {{selectedStuCV['技能']}} </el-descriptions-item> -->
                <el-descriptions-item label="Name" align="center" width="120px">
                  {{ selectedStuCV["姓名"] }} </el-descriptions-item>
                <el-descriptions-item label="Gender" align="center" width="110px">
                  {{selectedStuCV['性别']}} </el-descriptions-item>
                <el-descriptions-item label="College" align="center" width="140px">
                  {{selectedStuCV['就读院校']}} </el-descriptions-item>
                <el-descriptions-item label="Native Place" align="center" >
                  {{selectedStuCV["籍贯"]}} </el-descriptions-item>
                <el-descriptions-item label="Age" align="center" >
                  {{selectedStuCV['年龄']}} </el-descriptions-item>
                <el-descriptions-item label="Major" align="center" >
                  {{selectedStuCV['专业']}} </el-descriptions-item>
                <el-descriptions-item label="Skills" align="center" >
                  {{selectedStuCV['技能']}} </el-descriptions-item>
              </el-descriptions>
              <el-input v-model="comment_CV" autosize type="textarea" @change="save_comment_CV"
                        placeholder="Comment here ..." style="width: 741px;"/>
            </div>
          </div>

          <div class="infoSec" id="EduBackground">
            <div>
              <div style="position: absolute; left: 0; width:10px; height: 25px; background-color: #C4A99A;"/>
              <div class="secTitle">Education Background</div>
              <!-- <div class="secTitle">Education Background 教育经历</div> -->
            </div>
            <div>
              <el-descriptions :column="3"  style="width: 740px; margin: 11px 0 5px 0" border :size='formSize'>
                <!-- <el-descriptions-item label="绩点" align="center" width="120px" >
                  {{selectedStuEB["绩点"]}} </el-descriptions-item>
                <el-descriptions-item label="四级" align="center" width="120px" >
                  {{selectedStuEB["四级"]}} </el-descriptions-item>
                <el-descriptions-item label="托福" align="center" width="140px">
                  {{selectedStuEB["托福"]}} </el-descriptions-item>
                <el-descriptions-item label="排名" align="center" >
                  {{selectedStuEB["排名"]}} </el-descriptions-item>
                <el-descriptions-item label="六级" align="center" >
                  {{selectedStuEB["六级"]}} </el-descriptions-item>
                <el-descriptions-item label="雅思" align="center" >
                  {{selectedStuEB["雅思"]}} </el-descriptions-item> -->
                <el-descriptions-item label="GPA" align="center" width="120px" >
                  {{selectedStuEB["绩点"]}} </el-descriptions-item>
                <el-descriptions-item label="CET-4" align="center" width="110px" >
                  {{selectedStuEB["四级"]}} </el-descriptions-item>
                <el-descriptions-item label="TOEFL" align="center" width="140px">
                  {{selectedStuEB["托福"]}} </el-descriptions-item>
                <el-descriptions-item label="Ranking" align="center" >
                  {{selectedStuEB["排名"]}} </el-descriptions-item>
                <el-descriptions-item label="CET-6" align="center" >
                  {{selectedStuEB["六级"]}} </el-descriptions-item>
                <el-descriptions-item label="IETLS" align="center" >
                  {{selectedStuEB["雅思"]}} </el-descriptions-item>
              </el-descriptions>
              <el-descriptions :column="2"  style="width: 740px;" border :size='formSize'
                               v-for="(item, index) in selectedStuEB['主修课程']" :key="index">
                <!-- <el-descriptions-item label="课程名称" align="center" width="240px" >
                  {{item["课程名称"]}} </el-descriptions-item>
                <el-descriptions-item label="课程成绩" align="center" width="140px">
                  {{item["课程成绩"]}} </el-descriptions-item> -->
                <el-descriptions-item label="Course" align="center" label-class-name="desLabel_120" >
                  {{item["课程名称"]}} </el-descriptions-item>
                <el-descriptions-item label="Grade" align="center" width="140px">
                  {{item["课程成绩"]}} </el-descriptions-item>
              </el-descriptions>
              <el-input v-model="comment_EB" autosize type="textarea" @change="save_comment_EB"
                        placeholder="Comment here ..." style="width: 741px;"/>
              <div class="ratingBox">
                <div class="ratingBox-rate">
                  <div class="rate-text" style="color:#776357">Score</div>
                  <el-rate
                      v-model="score_EB"
                      @change="save_score_EB"
                      :texts="['1', '2', '3', '4', '5']"
                      :colors="['#C4A99A', '#C4A99A', '#C4A99A']"
                      show-text/>
                </div>
                <div id="hint_EB" class="ratingBox-hint"></div>
              </div>
            </div>
          </div>

          <div class="infoSec" id="Competition">
            <div style="margin: 0 0 11px 0px;">
              <div style="position: absolute; left: 0; width:10px; height: 25px; background-color: #92CADB;"/>
              <div class="secTitle">Competition</div>
              <!-- <div class="secTitle">Competition 竞赛经历</div> -->
            </div>
            <div>
              <el-descriptions :column="2"  style="width: 740px; margin-top: 5px;" border :size='formSize'
                               v-for="(item, index) in selectedStuCom" :key="index">
                <!-- <el-descriptions-item label="竞赛名称" align="center" label-class-name="desLabel_120" >
                  {{item["竞赛名称"]}} </el-descriptions-item>
                <el-descriptions-item label="级别" align="center" width="140px" >
                  {{item["竞赛范围"]}} </el-descriptions-item>
                <el-descriptions-item label="时间" align="center" >
                  {{item["竞赛时间"]}} </el-descriptions-item>
                <el-descriptions-item label="名次" align="center" >
                  {{item["竞赛奖项"]}} </el-descriptions-item> -->
                <el-descriptions-item label="Name" align="center" label-class-name="desLabel_120" >
                  {{item["竞赛名称"]}} </el-descriptions-item>
                <el-descriptions-item label="Level" align="center" width="140px" >
                  {{item["竞赛范围"]}} </el-descriptions-item>
                <el-descriptions-item label="Time" align="center" >
                  {{item["竞赛时间"]}} </el-descriptions-item>
                <el-descriptions-item label="Awards" align="center" >
                  {{item["竞赛奖项"]}} </el-descriptions-item>
              </el-descriptions>
              <el-input v-model="comment_Com" autosize type="textarea" @change="save_comment_Com"
                        placeholder="Comment here ..." style="width: 741px;"/>
              <div class="ratingBox">
                <div class="ratingBox-rate">
                  <div class="rate-text" style="color:#317286" >Score</div>
                  <el-rate
                      v-model="score_Com"
                      @change="save_score_Com"
                      :texts="['1', '2', '3', '4', '5']"
                      :colors="['#92CADB', '#92CADB', '#92CADB']"
                      show-text/>
                </div>
                <div id="hint_Com" class="ratingBox-hint"></div>
              </div>
            </div>
          </div>

          <div class="infoSec" id="Honor">
            <div style="margin-bottom: 11px">
              <div style="position: absolute; left: 0; width:10px; height: 25px; background-color: #F9AFAF;"/>
              <div class="secTitle">Honor</div>
              <!-- <div class="secTitle">Honor 荣誉经历</div> -->
            </div>
            <div>
              <el-descriptions :column="2" style="width: 740px; margin-top: 5px;" border :size='formSize'
                               v-for="(item, index) in selectedStuHo" :key="index">
                <!-- <el-descriptions-item label="经历名称" align="center" label-class-name="desLabel_80" >
                  {{item["经历名称"]}} </el-descriptions-item>
                <el-descriptions-item label="级别" align="center" width="90px" >
                  {{item["经历范围"]}} </el-descriptions-item> -->
                <el-descriptions-item label="Name" align="center" label-class-name="desLabel_80" >
                  {{item["经历名称"]}} </el-descriptions-item>
                <el-descriptions-item label="Level" align="center" width="90px" >
                  {{item["经历范围"]}} </el-descriptions-item>
                <!-- <el-descriptions-item label="时间" align="center" width="90px" >
                  {{item["竞赛奖项"]}} </el-descriptions-item> -->
              </el-descriptions>
              <el-input v-model="comment_Ho" autosize type="textarea" @change="save_comment_Ho"
                        placeholder="Comment here ..." style="width: 741px;"/>
              <div class="ratingBox">
                <div class="ratingBox-rate">
                  <div class="rate-text" style="color:#B56B6B" >Score</div>
                  <el-rate
                      v-model="score_Ho"
                      @change="save_score_Ho"
                      :texts="['1', '2', '3', '4', '5']"
                      :colors="['#F9AFAF', '#F9AFAF', '#F9AFAF']"
                      show-text/>
                </div>
                <div id="hint_Ho" class="ratingBox-hint"></div>
              </div>
            </div>
          </div>

          <div class="infoSec" id="ExtraActivity">
            <div style="margin-bottom: 11px">
              <div style="position: absolute; left: 0; width:10px; height: 25px; background-color: #F2D492;"/>
              <div class="secTitle">Extra Activity</div>
              <!-- <div class="secTitle">Extra Activity 其他活动</div> -->
            </div>
            <div>
              <div class="secSubTitle">Project</div>
              <!-- <div class="secSubTitle">Project 项目经历</div> -->
              <el-descriptions :column="3" style="width: 740px; margin-top: 5px;" border :size='formSize'
                               v-for="(item, index) in selectedStuExA['项目经历']" :key="index">
                <!-- <el-descriptions-item label="名称" align="center" label-class-name="desLabel_80">
                  {{item["项目名称"]}} </el-descriptions-item>
                <el-descriptions-item label="时间" align="center" width="90px">
                  {{item["项目时间"]}} </el-descriptions-item>
                <el-descriptions-item label="担任角色" align="center" width="90px">
                  {{item["担任角色"]}} </el-descriptions-item>
                <el-descriptions-item label="项目描述" align="center" >
                  {{item["项目描述"]}} </el-descriptions-item> -->
                <el-descriptions-item label="Name" align="center" label-class-name="desLabel_80">
                  {{item["项目名称"]}} </el-descriptions-item>
                <el-descriptions-item label="Time" align="center" width="90px">
                  {{item["项目时间"]}} </el-descriptions-item>
                <el-descriptions-item label="Role" align="center" width="90px">
                  {{item["担任角色"]}} </el-descriptions-item>
                <el-descriptions-item label="Description" align="center" >
                  {{item["项目描述"]}} </el-descriptions-item>
              </el-descriptions>

              <div class="secSubTitle" style="margin-top: 5px">Research Paper</div>
              <!-- <div class="secSubTitle" style="margin-top: 5px">Research Paper 科研成果</div> -->
              <el-descriptions :column="2" style="width: 740px; margin-top: 5px;" border :size='formSize'
                               v-for="(item, index) in selectedStuExA['论文']" :key="index">
                <!-- <el-descriptions-item label="论文题目" align="center" label-class-name="desLabel_80" >
                  {{item["论文题目"]}} </el-descriptions-item>
                <el-descriptions-item label="作者排序" align="center" width="120px" >
                  {{item["作者排序"]}} </el-descriptions-item>
                <el-descriptions-item label="发表刊物" align="center" label-class-name="desLabel_80" >
                  {{item["发表刊物"]}} </el-descriptions-item>
                <el-descriptions-item label="刊物层次" align="center" width="120px" >
                  {{item["刊物层次"]}} </el-descriptions-item>
                <el-descriptions-item label="论文内容" align="center" >
                  {{item["论文内容"]}} </el-descriptions-item> -->
                <el-descriptions-item label="Title" align="center" label-class-name="desLabel_80" >
                  {{item["论文题目"]}} </el-descriptions-item>
                <el-descriptions-item label="Author" align="center" width="120px" >
                  {{item["作者排序"]}} </el-descriptions-item>
                <el-descriptions-item label="Publication" align="center" label-class-name="desLabel_80" >
                  {{item["发表刊物"]}} </el-descriptions-item>
                <el-descriptions-item label="Level" align="center" width="120px" >
                  {{item["刊物层次"]}} </el-descriptions-item>
                <el-descriptions-item label="Summary" align="center" >
                  {{item["论文内容"]}} </el-descriptions-item>
              </el-descriptions>

              <div class="secSubTitle" style="margin-top: 5px">Other Experience</div>
              <!-- <div class="secSubTitle" style="margin-top: 5px">Other Experience 其他经历</div> -->
              <el-descriptions :column="2" style="width: 740px; margin-top: 5px;" border :size='formSize'
                               v-for="(item, index) in selectedStuExA['其他经历']" :key="index">
                <!-- <el-descriptions-item label="名称" align="center" label-class-name="desLabel_80" >
                  {{item["经历名称"]}} </el-descriptions-item>
                <el-descriptions-item label="时间" align="center" width="180px" >
                  {{item["时间"]}} </el-descriptions-item> -->
                <el-descriptions-item label="Name" align="center" label-class-name="desLabel_80" >
                  {{item["经历名称"]}} </el-descriptions-item>
                <el-descriptions-item label="Time" align="center" width="180px" >
                  {{item["时间"]}} </el-descriptions-item>
              </el-descriptions>

              <el-input v-model="comment_ExA" autosize type="textarea" @change="save_comment_ExA"
                        placeholder="Comment here ..." style="width: 741px;"/>
              <div id="hint_ExA" class="ratingBox">
                <div class="ratingBox-rate">
                  <div class="rate-text" style="color:#C89528" >Score</div>
                  <el-rate
                      v-model="score_ExA"
                      @change="save_score_ExA"
                      :texts="['1', '2', '3', '4', '5']"
                      :colors="['#F2D492', '#F2D492', '#F2D492']"
                      show-text/>
                </div>
                <div class="ratingBox-hint"></div>
              </div>
            </div>
          </div>

        </el-scrollbar>
      </div>
    </div>


<!--    <transition :name="transitionName">-->
    <div id="AssRightPart">
      <div v-if="$route.path==='/summary/:id'">
        <SumPage v-model:active-stu-index="selectedValue"
                 v-model:scoring-data="scoringData" />
      </div>
      <div v-else>
        <div id="supplement">
          <div class="supplement-title">{{suppleTitle}}</div>
          <div class="supplement-content">
            <el-scrollbar ref="myPdfScroll">
              <vue-pdf-embed :source="pdfsrc" />
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AssPage.js"></script>

<style scoped>

  :deep(.desLabel_80)  { /* /deep/ 已经被弃用了 */
    width: 80px;
  }

  :deep(.desLabel_120) {
    width: 120px;
  }

  #studentInfo {
    width: 752px;
    /*height: 978px;*/
    height: 1006px;
    margin-right: 9px;
  }

  .stuSelector {
    width: 752px;
    height: 54px;
    display: flex;
    justify-content: space-between;
    margin: 0;
  }

  .infoDescription {
    width: 752px;
    height: 945px;
    margin: 5px 0 0 0;
    border-top: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    /* border-radius: 5px; */
  }

  .el-icon.bolderIcon svg {
    width: 37px;
    height: 37px;
    border: 3px solid #306D5A;
    border-radius: 37px;
  }

  .graySelect {
    width: 592px;
    height: 48px;
    margin: 3px 0;
  }


  .infoSec{
    /* margin: 30px 0 ; */
    position: relative;
    padding: 15px 10px;
    width: 740px;
  }

  .ratingBox {
    display: flex;
    width: 740px;
    height: 60px;
    margin-top: 10px;
    border: 1px solid #EBEEF5;
    background-color: #F5F7FA;
  }

  .ratingBox-rate {
    width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 30px 0 30px;
    border-right:  1px solid #EBEEF5;
  }

  .ratingBox-hint {

  }

  :deep(.el-rate *){
    font-size: 18px;
  }


  .secTitle {
    /*margin: 0 16px 0 0;*/
    padding-left: 14px;
    font-size: 18px;
    font-weight: 500;
    color: #2D2D2D;
  }

  .secSubTitle {
    /*margin: 0 16px 0 0;*/
    /*padding-left: 14px;*/
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: 400;
    color: #2D2D2D;
  }

  .rate-text {
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 19px;
    /* color: #306D5A; */
  }

  #supplement {
    /*width: 752px;*/
    width: 840px;
    height: 998px;
  }

  .supplement-title {
    margin: 0 200px 11px 200px;
    height: 48px;
    background-color: #F3F3F3;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 48px;
    /* identical to box height */
    text-align: center;
    color: #306D5A;
  }

  .supplement-content {
    width: 830px;
    height: 936px;
    padding: 5px;
    border: 1px solid #DCDFE6;
    border-radius: 5px;
    overflow-y: auto;
  }

  #AssRightPart{

  }

  .animation {
    display: flex;
    width: 200%;
    > div {
        width: 50%;
      }
    .slide-left-enter-active,
    .slide-left-leave-active,
    .slide-right-enter-active,
    .slide-right-leave-active {
      transition: transform 0.3s;
    }

    .slide-right-enter-from {
      transform: translateX(0);
    }
    .slide-right-enter-to {
      transform: translateX(-100%);
    }
    .slide-right-leave-from {
      transform: translateX(0);
    }
    .slide-right-leave-to {
      transform: translateX(-100%);
    }

    .slide-left-enter-from {
      transform: translateX(-200%);
    }
    .slide-left-enter-to {
      transform: translateX(-100%);
    }
    .slide-left-leave-from {
      transform: translateX(0);
    }
    .slide-left-leave-to {
      transform: translateX(100%);
    }
  }


</style>