/**
 * @description 客户端路由
 * @author uct8086
 */
import homePanel from './home/index.vue';
import detailPanel from './detail/index.vue';
import pageNotFound from '../components_new/pageNotFound.vue';

// import taskPanel from '../components/task.vue';
// import assPanel from "../components/assessing.vue";
// import stuListPanel from "../components/assContent/stuList.vue";
// import assDetailPanel from "../components/assContent/assDetail.vue";
// import sumPanel from "../components/assContent/summary.vue";

import taskPanel from '../components_new/task.vue';
import assessingPanel from "../components_new/assessing.vue";
import ListPage from "../components_new/assContent/ListPage.vue";
import assPage from "../components_new/assContent/AssPage.vue";
// import SumPage from "../components_new/assContent/SumPage.vue";s


const routes = [ //构造全局的路由实例，是router构造方法的实例。
    {
        path: `/`,
        component: homePanel,
        // redirect: '/task',
        redirect: '/task',
        children: [ { name: 'task', path: '/task', component: taskPanel, }, ],
    },
    { path: `/detail`, component: detailPanel },
    { path: '/:pathMatch(.*)*', component: pageNotFound },
    {
        path: '/assessing/:id',
        name: 'assessing',
        component: assessingPanel,
        redirect: '/stuList/:id',
        children: [
            {
                path: '/stuList/:id',
                component: ListPage,
            },
            {
                // path: '/stuDetail/:id/:stuIdx?', //?问号的意思是该参数不是必传项
                path: '/stuDetail/:id',
                component: assPage,
            },
            {
                path: '/summary/:id',
                // component: SumPage,
                component: assPage,
            },
        ]
    },
    // {
    //     path: '/summary',
    //     component: sumPanel,
    // },

];

// const router = new Router({
//     routes,
//     linkActiveClass: "active-router",
//     linkExactActiveClass: "exact-router"
// })


export default routes;