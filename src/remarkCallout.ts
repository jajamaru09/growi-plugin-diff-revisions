import type { Plugin } from 'unified';
import type { Root, Parent } from 'mdast';
import { visit } from 'unist-util-visit';

const CALLOUT_TYPES = new Set([
  'note', 'tip', 'important', 'info', 'warning', 'danger', 'caution',
]);

const CALLOUT_TITLES: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
  caution: 'Caution',
};

const remarkCallout: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'containerDirective', (node: any) => {
      const type = node.name as string;
      if (!CALLOUT_TYPES.has(type)) return;

      // Extract label from directiveLabel paragraph if present
      let label = CALLOUT_TITLES[type] ?? type;
      const children = (node as Parent).children as any[];
      const labelIdx = children.findIndex(
        (child: any) => child.data?.directiveLabel === true,
      );
      if (labelIdx !== -1) {
        const labelNode = children[labelIdx];
        const textParts: string[] = [];
        if (labelNode.children) {
          for (const c of labelNode.children) {
            if (c.type === 'text') textParts.push(c.value);
          }
        }
        if (textParts.length > 0) {
          label = textParts.join('');
        }
        children.splice(labelIdx, 1);
      }

      // Transform the node into a callout div structure
      const data = node.data || (node.data = {});
      data.hName = 'div';
      data.hProperties = { className: `callout callout-${type}` };

      // Save existing content children
      const contentChildren = [...children];

      // Build indicator: use 'strong' node with hName override to render as <div>
      const indicatorNode = {
        type: 'paragraph',
        data: {
          hName: 'div',
          hProperties: { className: 'callout-indicator' },
        },
        children: [
          {
            type: 'strong',
            data: {
              hName: 'span',
              hProperties: { className: 'callout-title' },
            },
            children: [{ type: 'text', value: label }],
          },
        ],
      };

      // Build content wrapper
      const contentNode = {
        type: 'blockquote',
        data: {
          hName: 'div',
          hProperties: { className: 'callout-content' },
        },
        children: contentChildren,
      };

      // Replace children with indicator + content structure
      node.children = [indicatorNode, contentNode];
    });
  };
};

export default remarkCallout;
