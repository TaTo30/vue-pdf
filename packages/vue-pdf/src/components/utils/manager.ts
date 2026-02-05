/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AnnotationEditorUIManager,
  AnnotationEditorType,
  AnnotationEditorParamsType,
} from "pdfjs-dist";

import { FakeEventBus } from "./fake_evenbus";
import { CommentManager } from "./comment_manager";

import type {
  AnnotationEditorConstructor,
  EditorFn,
  EditorRequest,
  HighlightEditorColors,
} from "../types";
import type { AnnotationEditor } from "pdfjs-dist/types/src/display/editor/tools";

export default class MinimalUiManager extends AnnotationEditorUIManager {
  editorsAvailable: AnnotationEditorConstructor[] = [];
  #editorDefaultParams: Function[] = [];
  #stampOpts: EditorRequest;
  #container: HTMLElement;
  #emitters: { [key: number]: Function };
  #draggingEditors: AnnotationEditor[] = [];

  static LAYER_EMITTER_ID = 10000;

  constructor(
    pdfDocument: any,
    commentOpts: EditorFn,
    stampOpts: EditorRequest,
    highlightColors: HighlightEditorColors,
    container: HTMLElement,
    emitters: any,
    editorsParams: Function[] = [],
  ) {
    const eventBus = new FakeEventBus();
    const colorKeyValues = [];
    for (const colorName in highlightColors) {
      const colorValue = highlightColors[colorName];
      colorKeyValues.push(
        `${colorName}=${colorValue[0]},${colorName}_HCM=${colorValue[1]}`,
      );
    }

    super(
      null,
      null,
      null,
      null,
      commentOpts.fn ? new CommentManager(commentOpts) : null,
      null,
      eventBus,
      pdfDocument,
      null,
      colorKeyValues.join(","),
      null,
      null,
      null,
      null,
      null,
      false,
    );
    this._supportsPinchToZoom = false;

    eventBus.setUiManager(this);
    this._eventBus = eventBus;
    this.#editorDefaultParams = editorsParams;
    this.#stampOpts = stampOpts;
    this.#container = container;
    this.#emitters = emitters;
  }

  get direction(): any {
    return "ltr";
  }

  static get _keyboardManager() {
    return null;
  }

  get isEditorHandlingKeyboard(): boolean {
    return false;
  }

  get isEnterHandled(): boolean {
    return false;
  }

  get selectedEditors(): any[] {
    const editors = [];

    for (const editor of this.getEditors(this.currentPageIndex)) {
      if (editor.isSelected) {
        editors.push(editor);
      }
    }
    return editors;
  }

  editAltText(editor: AnnotationEditor): void {
    if (this.#stampOpts.request) {
      this.#stampOpts.request(editor, (altText: string) => {
        editor.altTextData = {
          altText,
          decorative: null,
        };
      });
    }
  }

  // NOTE: Properties and methods related to signatures
  getSignature(): void {}

  get signatureManager(): any {
    return null;
  }

  // NOTE: Those methods are no required for basic editing functionality
  // since they are related to UI interactions that are not implemented
  // as part of this library design, but they are defined to override and avoid errors
  setMainHighlightColorPicker(): void {}
  keydown(): void {}
  keyup(): void {}
  undo(): void {}
  redo(): void {}
  dragOver(): void {}
  drop(): void {}
  copy(): void {}
  cut(): void {}
  async paste(): Promise<void> {}
  addNewEditorFromKeyboard(): void {}
  focusMainContainer(): void {
    this.#container.focus();
  } // This could be used for the wrapper <div>
  disableUserSelect(value: any): void {} // This could be used to control text selection for text layer
  a11yAlert(messageId: any, args = null): void {} // This could be used to announce messages for screen readers
  addEditListeners(): void {}
  removeEditListeners(): void {}

  setSelected(editor: AnnotationEditor): void {
    super.setSelected(editor);

    if (editor.isSelected) {
      const emitter = this.#emitters[MinimalUiManager.LAYER_EMITTER_ID];
      if (emitter)
        emitter("editorSelected", {
          editor,
        });
    }
  }

  // Note: Important methods to customize its original behavior
  addEditor(editor: AnnotationEditor): void {
    super.addEditor(editor);

    if (editor.mode === AnnotationEditorType.STAMP) {
      editor._onResizing = () => {
        this.sizeSelectedEditors(editor);
      };
    }

    if (editor.mode === AnnotationEditorType.INK) {
      const originalOnResizing: Function = editor._onResizing;
      editor._onResizing = () => {
        originalOnResizing.call(editor);
        this.sizeSelectedEditors(editor);
      };
    }

    const emitter = this.#emitters[MinimalUiManager.LAYER_EMITTER_ID];
    if (emitter)
      emitter("editorAdded", {
        editor,
      });
  }

  removeEditor(editor: AnnotationEditor): void {
    super.removeEditor(editor);

    const emitter = this.#emitters[MinimalUiManager.LAYER_EMITTER_ID];
    if (emitter)
      emitter("editorRemoved", {
        editor,
      });
  }

  highlightSelection(methodOfCreation = "", comment = false) {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
    const { anchorNode } = selection;
    const anchorElement: any =
      anchorNode!.nodeType === Node.TEXT_NODE
        ? anchorNode!.parentElement
        : anchorNode;
    const textLayer = anchorElement!.closest(".textLayer");

    if (!this.currentLayer.hasTextLayer(textLayer)) return;
    super.highlightSelection(methodOfCreation, comment);
  }

  addLayer(layer: any): void {
    super.addLayer(layer);

    for (const editorParams of this.#editorDefaultParams) {
      editorParams(this.updateParams.bind(this));
    }
  }

  removeLayer(layer: any): void {
    super.removeLayer(layer);
  }

  getMode(): number {
    return super.getMode();
  }

  updateParams(type: any, value: any, userSelected = false): void {
    super.updateParams(type, value);

    if (!userSelected) {
      const colorTypes = [
        AnnotationEditorParamsType.FREETEXT_COLOR,
        AnnotationEditorParamsType.HIGHLIGHT_COLOR,
        AnnotationEditorParamsType.INK_COLOR,
      ];
      if (this.hasSelection && colorTypes.includes(type)) {
        const selectedEditors = this.selectedEditors;
        selectedEditors.forEach((editor: AnnotationEditor) => {
          const emitter = this.#emitters[editor.mode];
          if (emitter)
            emitter("colorChanged", {
              editor,
              color: value,
            });
        });
      }
    }
  }

  getId(): string {
    const randomNumber = Math.floor(Math.random() * 100);
    return super.getId() + randomNumber;
  }

  get currentLayer() {
    return super.currentLayer;
  }

  setUpDragSession(): void {
    super.setUpDragSession();

    if (!this.hasSelection) {
      return;
    }

    this.#draggingEditors = [];

    this.selectedEditors.forEach((editor: AnnotationEditor) => {
      if (editor.isSelected) {
        this.#draggingEditors.push(editor);
      }
    });
  }

  endDragSession(): boolean {
    const result = super.endDragSession();
    if (result) {
      this.#draggingEditors = [];
    }
    return result;
  }

  dragSelectedEditors(tx: number, ty: number): void {
    super.dragSelectedEditors(tx, ty);
    this.#draggingEditors.forEach((editor: AnnotationEditor) => {
      const emitter = this.#emitters[editor.mode];
      if (emitter)
        emitter("dragging", {
          editor,
          ...this.#calculateEditorPosition(editor),
        });
    });
  }

  sizeSelectedEditors(editor: AnnotationEditor) {
    const emitter = this.#emitters[editor.mode];
    if (emitter)
      emitter("resizing", {
        editor,
        ...this.#calculateEditorSize(editor),
      });
  }

  #calculateEditorPosition(editor: AnnotationEditor) {
    return {
      x: editor.x * editor.pageDimensions[0],
      y: editor.y * editor.pageDimensions[1],
    };
  }

  #calculateEditorSize(editor: AnnotationEditor) {
    return {
      width: editor.width * editor.pageDimensions[0],
      height: editor.height * editor.pageDimensions[1],
      x: editor.x * editor.pageDimensions[0],
      y: editor.y * editor.pageDimensions[1],
    };
  }
}
