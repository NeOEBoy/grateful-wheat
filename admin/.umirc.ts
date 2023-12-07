import { defineConfig } from '@umijs/max';
import proxy from './proxy';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
    {
      name: 'WS 示例',
      path: '/ws',
      component: './WS',
    },
    {
      name: '订单',
      path: '/order',
      component: './Order',
    },
  ],
  npmClient: 'npm',
  /**
 * @name 代理配置
 * @description 可以让你的本地服务器代理到你的服务器上，这样你就可以访问服务器的数据了
 * @see 要注意以下 代理只能在本地开发时使用，build 之后就无法使用了。
 * @doc 代理介绍 https://umijs.org/docs/guides/proxy
 * @doc 代理配置 https://umijs.org/docs/api/config#proxy
 */
  proxy: proxy['dev'],
});

