import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
    title: 'Typescript 类型体操',
    social: {
      github: 'https://github.com/heachou/typescript-challenges'
    },
    defaultLocale: 'root',
    locales: {
      'root': {
        label: '简体中文',
        lang: 'zh-CN'
      }
    },
    sidebar: [{
      label: '开篇',
      items: [
      // Each item here is one entry in the navigation menu.
      {
        label: '如何阅读',
        link: '/guides/start/'
      }, {
        label: '类型前置知识',
        link: '/guides/about/'
      }, {
        label: 'TS类型编程为什么叫类型体操',
        link: '/guides/why/'
      }]
    }, {
      label: '理论知识',
      items: [{
        label: 'TS支持哪些类型',
        link: '/theory/types/'
      }, {
        label: '套路一：模式匹配做提取',
        link: '/theory/infer/'
      }, 
      {
        label: '套路二：重新构造做变换',
        link: '/theory/structural_transformer/'
      }, 
      {
        label: '套路三：递归复用做循环',
        link: '/theory/recursion/'
      }
    ]
    }]
  }), tailwind()]
});