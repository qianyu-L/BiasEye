<template>
  <div id="baseWeb"
       class="wrapper"
       style="width: 1920px; height: 1080px; margin: 0; transform: scale(1,1)translate(0px,0px) ">
    <el-container
        style="width: 1920px; height: 1080px">

      <el-header style="height: 54px">
        <div class="header-title">BiasEye</div>
      </el-header>

      <el-main style="height: 1026px">
<!--        <taskPanel/>-->
<!--        <assPanel/>-->
        <router-view/>
      </el-main>
    </el-container>

  </div>
</template>
<script src="./script.js"></script>

<style lang="less">

.el-header {
  display: flex;
  justify-content: space-between; // 左右对齐
  align-items: center;
  font-family: 'Noto Sans';
  background: #F2F3F5;
  //border-bottom: 1px solid #CDCDCD;
  // 嵌套
  > div {
    display: flex;
    align-items: center;
  }
}

//.el-main {
//  display: flex;
//  font-family: 'Noto Sans';
//}

.header-title { // system title
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 33px;
  /* identical to box height */
  color: #191919;
}

.flex-grow {
  flex-grow: 1;
}
</style>