<template>
  <div style="height: 1006px; border: 1px solid #DCDFE6; border-radius: 5px;">
      <div id="DimReduceDiv" class="frame" />

      <div id="ExsituDiv" class="frame" >
        <div style="display:flex; justify-content: space-between; padding:5px 10px;" >
          <el-select v-model="exsitu_show"
                     placeholder="Term"
                     size="small"
                     style="width: 80px"
                     @change="handTermChange">
            <el-option v-for="term in itemList" :key="term" :label="term" :value="term"/>
          </el-select>

          <el-slider v-model="selectedRange"
                     range
                     show-stops
                     size="small"
                     :min="1"
                     :max="NNum"
                     style="width: 550px"
                     @change="sliderToggleTableSelect"/>

          <el-button color="#6B9589"
                     plain
                     :loading="UpdateLoading"
                     :disabled="disUpdatable"
                     size="small" style="width: 80px"
                     @click="handleUpdateButton(true)">Update</el-button>
        </div>

        <el-table :data="tableData"
                  :default-sort="{ prop: 'index', order: 'ascending' }"
                  style="width: 100%"
                  height="515px"
                  :highlight-current-row="true"
                  id="ExsituTable"
                  ref='eTable'
                  :cell-style="cellStyle"
                  @row-click="handleTRowClick"
                  @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="47" />
          <el-table-column prop="index" fixed label="#" sortable width="67" />
          <el-table-column v-if="false" prop="status" label="Status" sortable />

          <el-table-column prop="name" label="Name" sortable width="165" />
<!--                           :filters="[{ text: 'Graded', value: 'Graded' },-->
<!--                                  {text: 'Grading', value: 'Grading'},-->
<!--                                  { text: 'Ungraded', value: 'Ungraded' }]"-->
<!--                           :filter-method="handleFilterStatus" />-->

          <el-table-column prop="time" label="Time" fixed="right" >
            <template #default="scope">
              <el-tooltip :content="(scope.row.total_time/60).toFixed(1) + 'min'" placement="top-start" effect="dark">
                <svg :width="timeSvgConfig.width" :height="timeSvgConfig.height" >
                  <rect v-for="(datum, j) in scope.row.stackTime" :key="j" :x="datum[1]" :y="10" :width="datum[2]" :height="10" :fill="timeLegend(datum[0])" :rx="5" :ry="5"></rect>
                </svg>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column v-if="exsitu_show==='EB'"  prop="EB" label="EB" sortable width="165" >
            <template #default="scope">
              <el-rate v-model=scope.row.EB :colors="rateColor.EB" @click.native.stop=null @change="handleScoreChange(scope.row, 'EB')" />
            </template>
          </el-table-column>
          <el-table-column v-if="miti_exsitu_show==='EB'" prop="EB_est" label="Mitigate" sortable align="center" width="110" />

          <el-table-column v-if="exsitu_show==='Com'" prop="Com" label="Com" sortable width="165" >
            <template #default="scope">
              <el-rate v-model=scope.row.Com :colors="rateColor.Com" @click.native.stop=null @change="handleScoreChange(scope.row, 'Com')" />
            </template>
          </el-table-column>
          <el-table-column v-if="miti_exsitu_show==='Com'" prop="Com_est" label="Mitigate" sortable align="center" width="110" />

          <el-table-column v-if="exsitu_show==='Ho'" prop="Ho" label="Ho" sortable width="165" >
            <template #default="scope">
              <el-rate v-model=scope.row.Ho :colors="rateColor.Ho" @click.native.stop=null @change="handleScoreChange(scope.row, 'Ho')"/>
            </template>
          </el-table-column>
          <el-table-column v-if="miti_exsitu_show==='Ho'" prop="Ho_est" label="Mitigate" sortable align="center" width="110" />

          <el-table-column v-if="exsitu_show==='ExA'" prop="ExA" label="ExA" sortable width="165" >
            <template #default="scope">
              <el-rate v-model=scope.row.ExA :colors="rateColor.ExA" @click.native.stop=null @change="handleScoreChange(scope.row, 'ExA')" />
            </template>
          </el-table-column>
          <el-table-column v-if="miti_exsitu_show==='ExA'" prop="ExA_est" label="Mitigate" sortable align="center" width="110" />

        </el-table>
      </div>

    </div>
</template>

<script src="./SumPage.js"></script>

<style scoped>

  .frame {
    /*padding: 5px;*/
    /*border-radius: 5px;*/
    /*border: 1px solid #DCDFE6;*/
    /*width: 1130px;*/
    width: 838px;
  }

  #DimReduceDiv {
    height: 450px;
  }

  #ExsituDiv {
    height: 535px;
    margin-top: 5px;
  }

  :deep(.el-rate *){
    font-size: 18px;
  }

  :deep(.el-table .el-table__cell){
    padding: 4px 0;
  }

  :deep(.el-slider){
    --el-slider-main-bg-color: #A3BEB6;
  }

  :deep(.el-select) {
    --el-select-input-focus-border-color: #306D5A;
  }

  :deep(.el-table__body tr.current-row>td) {
    background-color: #E6EDEB !important;
  }

</style>