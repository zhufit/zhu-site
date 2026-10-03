export const SITE = {
  name: 'ZHU.',
  title: 'ZHU.',
  description: '技术、项目与正在发生的探索。',
  author: 'Zhu',
  navigation: [
    { name: 'Writing', href: '/writing' },
    { name: 'Projects', href: '/projects' },
    { name: 'About', href: '/about' },
  ],
  home: {
    role: 'Java Developer',
    introduction: ['Building systems,', 'exploring AI,', 'writing what I learn.'],
    exploring: ['AI Application', 'System Design', 'Cloud Native'],
  },
  social: {
    github: '',
    email: '',
  },
  about: {
    description: '关于我，以及持续关注的技术方向。',
    introduction: ['我是一名 Java 开发者，在这里记录系统构建、AI 应用探索和技术学习。'],
    focus: ['系统设计与工程实践', 'AI 应用与工具探索', '技术写作与知识整理'],
    technology: ['Java'],
  },
} as const;
