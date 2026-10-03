/** Native Sätteri plugin: keyboard-accessible code and table scroll areas. */
export default {
  name: 'accessible-scroll-areas',
  element: {
    filter: ['pre', 'table'],
    visit(node, context) {
      context.setProperty(node, 'tabindex', '0');
      context.setProperty(node, 'role', node.tagName === 'table' ? 'table' : 'region');
      if (!node.properties?.['aria-label']) {
        context.setProperty(node, 'aria-label', node.tagName === 'table' ? '数据表格' : '代码块');
      }
    },
  },
};
