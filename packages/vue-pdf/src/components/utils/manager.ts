/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnnotationEditorUIManager } from "pdfjs-dist";
import { FakeEventBus } from "./fake_evenbus";

import type {
  AnnotationEditorConstructor,
  AnnotationFnRequestParams,
  HighlightEditorColors,
} from "../types";
import { CommentManager } from "./comment_manager";

export default class MinimalUiManager extends AnnotationEditorUIManager {
  editorsAvailable: AnnotationEditorConstructor[] = [];
  #editorDefaultParams: Function[] = [];
  #commentOpts: AnnotationFnRequestParams;
  #stampOpts: AnnotationFnRequestParams;

  constructor(
    pdfDocument: any,
    commentOpts: AnnotationFnRequestParams,
    stampOpts: AnnotationFnRequestParams,
    highlightColors: HighlightEditorColors,
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
    this.#commentOpts = commentOpts;
    this.#stampOpts = stampOpts;
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

  editAltText(editor: any): void {
    if (this.#stampOpts.request) {
      this.#stampOpts.request((altText: string) => {
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
  focusMainContainer(): void {} // This could be used for the wrapper <div>
  disableUserSelect(): void {} // This could be used to control text selection for text layer
  a11yAlert(messageId: any, args = null): void {} // This could be used to announce messages for screen readers
  addEditListeners(): void {}
  removeEditListeners(): void {}

  // Note: Important methods to customize its original behavior
  addEditor(editor: any): void {
    super.addEditor(editor);
  }

  removeEditor(editor: any): void {
    super.removeEditor(editor);
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

  updateParams(type: any, value: any): void {
    super.updateParams(type, value);
  }
}
