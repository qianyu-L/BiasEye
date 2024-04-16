<template>
  <div class="wrapper">
    <span class="pageHeading">Your tasks</span>
    <div class="pageContent">

      <div class="taskList">
        <div class="taskTerm">2023</div>
        <div class="taskListInTerm">

          <a id="task1" class="taskBox"
             @click="taskClick(1)">
            <h1 class="taskName">Open Day I</h1>
            <div class="taskDescription">Group 1</div>
            <div class="taskBox-students">40 students</div>
          </a>

          <a id="task2" class="taskBox"
             @click="taskClick(2)">
            <h1 class="taskName">Open Day II</h1>
            <div class="taskDescription">Group 2</div>
            <div class="taskBox-students">40 students</div>
          </a>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
    name: "task",
    setup() {
        // setup() 中不能访问 this, 只能访问 props, attrs, slots, emit
        const router = useRouter();
        function taskClick(para){
            // console.log(para);
            router.push({path:'/assessing/:id', query: {id: para} });
        }

        return {
            taskClick,
        };
    }
};
</script>

<style scoped>

  .pageHeading {
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
    line-height: 33px;
    color: #191919;
  }

  .taskTerm {
    margin-bottom: 16px;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    color: #2d2d2d;
  }

  .taskName {
    margin: 0 0 8px 0;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    color: #191919;
  }

  .taskDescription {
    font-family: 'Noto Sans';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: #636363;
  }

  .taskBox-students {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 320px;
    padding: 8px 16px;
    background-color: #306D5A;
    color: #FFFFFF;
  }

  .wrapper {
    padding: 16px 16px 0 16px;
  }

  .pageContent {
    padding-top: 24px;
  }

  .taskListInTerm {
    display: flex;
    justify-content: flex-start;
  }


  .taskBox {
    position: relative;
    float: left;
    display: block;
    height: 165px;
    width: 320px;
    margin: 0 32px 0 0;
    padding: 16px;
    background-color: #f3f3f3;
    color: #191919;
    cursor: pointer;
  }

</style>