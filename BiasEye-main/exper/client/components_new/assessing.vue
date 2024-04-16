<template>
  <div id="baseWeb"
       class="wrapper"
       style="width: 1920px; height: 1080px">
    <el-container style="width: 1920px; height: 1080px">
      <el-header style="height: 54px">
        <div class="header-title">BiasEye</div>
          <el-menu
            :default-active="$route.path"
            class="header-menu"
            mode="horizontal"
            :ellipsis="false"
            :router="true"
            background-color="#F2F3F5"
            text-color="#2D2D2D"
            active-text-color="#FFFFFF">
            <div class="flex-grow" />
            <el-menu-item v-for="item in menuList" :key="item.id" :index="item.path"
                          :route="{path: item.path, query: {id: taskID}}"
            >{{ item.authName }}</el-menu-item>
          </el-menu>
      </el-header>

      <el-main style="height:1026px; padding:10px; display:flex; justify-content:space-between">

        <div id="overview">
          <div id="rankSchool" class="overviewCard" />
          <div id="rankStu"  class="overviewCard" />

          <div id="ComCountry" class="overviewCard" />
          <div id="ComProvince" class="overviewCard" />
          <div id="ComCity" class="overviewCard" />
          <div id="ComSchool" class="overviewCard" />

          <div id="HoCountry" class="overviewCard" />
          <div id="HoProvince" class="overviewCard" />
          <div id="HoCity" class="overviewCard" />
          <div id="HoSchool" class="overviewCard" />

          <div id="paperNum" class="overviewCard" />
          <div id="paperLevel" class="overviewCard" />
        </div>

        <div id="assContent">
          <router-view v-model:active-stu-index="activeStuIndex"
                       v-model:scoring-data="scoringData" />
          <!-- <router-view/> -->
        </div>
      </el-main>
    </el-container>

  </div>
</template>

<script src="./assessing.js"></script>

<style scoped>
  .wrapper {
    font-family: inherit;
    display: flex;
    /*padding: 4px 0;*/
  }

  :deep(.el-header) {
    display: flex;
    /*左右对齐*/
    justify-content: space-between;
    align-items: center;
    background: #F2F3F5;
    /*border-bottom: 1px solid #CDCDCD;*/
    /*嵌套*/
     > div {
       display: flex;
       align-items: center;
     }
  }

  :deep(.el-menu) {
    height: 54px;
  }

  :deep(.el-menu-item) {
    font-size: 18px !important;
  }

  :deep(.el-menu-item.is-active) {
    background-color: #6B9589 !important;
  }

  :deep(.el-main) {
    display: flex;
    padding: 14px;
  }

  #assContent {
    /*height: 998px;*/
    height: 1006px;
    /*width: 1892px;*/
    /*width: 1558px; // 边距24?*/
    width: 1602px;
  }

  #overview {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  /*height: 996px;*/
  height: 1004px;
  width: 288px;
  border: solid 1px #CDCDCD;
  border-radius: 5px;
  /*margin-right: 10px;*/
}

  .overviewCard {
    width: 288px;
    height: 80px;
  }

</style>