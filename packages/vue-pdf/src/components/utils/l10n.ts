// This only re-exports GenericL10n from pdfjs-dist to avoid importing from pdfjs-dist directly
// in another part of the codebase. Also, this allows us to modify or extend its functionality if needed.
// Since pdf_viewer is not exportable on pdfjs-dist declaration, vite will copy the original code into vue-pdf final bundle.
