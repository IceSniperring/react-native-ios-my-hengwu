/**
 * Rewrites `Text` / `TextInput` imports from react-native to AppText so the
 * whole app uses the loaded display face without touching every file.
 */
const path = require('path');

const APP_TEXT = 'src/ui/AppText';
const TARGETS = new Set(['Text', 'TextInput']);

module.exports = function appFontBabelPlugin({ types: t }) {
  function relImport(fromFile) {
    const root = path.join(__dirname, '..');
    let rel = path.relative(path.dirname(fromFile), path.join(root, APP_TEXT));
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel.replace(/\\/g, '/').replace(/\.(tsx|ts|jsx|js)$/, '');
  }

  return {
    name: 'app-font',
    visitor: {
      Program(programPath, state) {
        const filename = state.filename || '';
        if (!filename || filename.includes('node_modules')) return;
        if (filename.replace(/\\/g, '/').includes(APP_TEXT)) return;

        const swapped = new Set();

        programPath.traverse({
          ImportDeclaration(importPath) {
            if (importPath.node.source.value !== 'react-native') return;
            const specs = importPath.node.specifiers;
            const keep = [];
            let removed = false;

            for (const spec of specs) {
              if (
                t.isImportSpecifier(spec) &&
                t.isIdentifier(spec.imported) &&
                TARGETS.has(spec.imported.name) &&
                t.isIdentifier(spec.local) &&
                spec.local.name === spec.imported.name
              ) {
                swapped.add(spec.local.name);
                removed = true;
                continue;
              }
              keep.push(spec);
            }

            if (!removed) return;

            if (keep.length === 0) {
              importPath.remove();
            } else {
              importPath.node.specifiers = keep;
            }
          },
        });

        if (swapped.size === 0) return;

        const names = [...swapped]
          .map((n) => (n === 'Text' ? 'Text' : 'TextInput'))
          .join(', ');

        programPath.unshiftContainer(
          'body',
          t.importDeclaration(
            [...swapped].map((n) => t.importSpecifier(t.identifier(n), t.identifier(n))),
            t.stringLiteral(relImport(filename)),
          ),
        );

        // silence unused if plugin name needs the names string
        void names;
      },
    },
  };
};
