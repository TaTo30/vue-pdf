import vue from "rollup-plugin-vue";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import css from "rollup-plugin-css-only";

var externals = [
    'pdfjs-dist/build/pdf',
    'pdfjs-dist/web/pdf_viewer',
    'pdfjs-dist/web/pdf_viewer.css',
    'pdfjs-dist/build/pdf.worker.entry'
]

export default [
    {
        input: 'src/index.js',
        external: externals,
        output: [
            {
                format: 'cjs',
                file: 'cjs/index.js',
                exports: 'named'
            },
            {
                format: 'esm',
                file: 'esm/index.js',
                exports: 'named'
            }
        ],
        plugins: [
            css(),
            vue(),
            peerDepsExternal()
        ]
    }
]