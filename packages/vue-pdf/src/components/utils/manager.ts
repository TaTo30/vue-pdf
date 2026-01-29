import {
  AnnotationEditorParamsType,
  AnnotationEditorUIManager,
} from "pdfjs-dist";
import { AnnotationEditorConstructor } from "../types";
import { AnnotationEditorType } from "pdfjs-dist/build/pdf";

class SimpleAbortSignal implements AbortSignal {
  private _aborted = false;
  private _reason: any = undefined;
  private _listeners = new Map<
    string,
    Set<EventListenerOrEventListenerObject>
  >();

  onabort: ((this: AbortSignal, ev: Event) => any) | null = null;

  get aborted(): boolean {
    return this._aborted;
  }

  get reason(): any {
    return this._reason;
  }

  throwIfAborted(): void {
    console.log("throwIfAborted");
  }

  addEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void {
    console.log("addEventListener", type, listener, options);
    if (!listener) return;
    const set = this._listeners.get(type) ?? new Set();
    set.add(listener);
    this._listeners.set(type, set);
  }

  removeEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void {
    console.log("removeEventListener", type, listener, options);
    if (!listener) return;
    this._listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: Event): boolean {
    console.log("dispatchEvent", event);
    const set = this._listeners.get(event.type);
    set?.forEach((l) => {
      if (typeof l === "function") {
        l.call(this, event);
      } else if (l && typeof (l as any).handleEvent === "function") {
        (l as any).handleEvent.call(this, event);
      }
    });
    if (event.type === "abort" && this.onabort) {
      this.onabort.call(this, event);
    }
    return true;
  }
}

const abortSignal: AbortSignal = new SimpleAbortSignal();

export default class MinimalUiManager extends AnnotationEditorUIManager {
  static get _keyboardManager() {
    console.log("_keyboardManager");
    return null;
  }

  _editorUndoBar: any | null = null;
  viewParameters: { realScale: number; rotation: number } = {
    realScale: 1,
    rotation: 0,
  };
  isShiftKeyDown = false;
  _supportsPinchToZoom = false;
  _eventBus: any;

  editorsAvailable: AnnotationEditorConstructor[] = [];

  #editorDefaultParams: Function[] = [];

  constructor(pdfDocument: any, editorsParams: Function[] = []) {
    console.log("MinimalUiManager constructor", pdfDocument);
    console.log(editorsParams);
    const eventBus = {
      _on(event: any, any: any) {
        console.log("eventBus on", event, any);
      },
      dispatch(event: any, data: any) {
        console.log("eventBus dispatch", event, data);
        switch (event) {
          case "annotationeditorparamschanged":
            break;

          default:
            break;
        }
      },
    };

    super(
      null,
      null,
      null,
      null,
      null,
      null,
      eventBus,
      pdfDocument,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    this._supportsPinchToZoom = false;
    this._eventBus = eventBus;
    this.#editorDefaultParams = editorsParams;
  }

  destroy(): void {
    console.log("destroy");
  }

  get mlManager(): any {
    console.log("mlManager");
    return null;
  }

  get useNewAltTextFlow(): boolean {
    console.log("useNewAltTextFlow");
    return false;
  }

  get useNewAltTextWhenAddingImage(): boolean {
    console.log("useNewAltTextWhenAddingImage");
    return false;
  }

  get hcmFilter(): boolean {
    console.log("hcmFilter");
    return false;
  }

  get direction(): any {
    console.log("direction");
    return {};
  }

  get _highlightColors(): any {
    console.log("_highlightColors");
    return null;
  }

  get highlightColors(): any {
    console.log("highlightColors");
    return null;
  }

  get highlightColorNames(): any {
    console.log("highlightColorNames");
    return null;
  }

  getNonHCMColor(color: any): any {
    console.log("getNonHCMColor", color);
    return {};
  }

  getNonHCMColorName(color: any): any {
    console.log("getNonHCMColorName", color);
    return {};
  }

  setCurrentDrawingSession(layer: any): void {
    console.log("setCurrentDrawingSession", layer);
  }

  setMainHighlightColorPicker(): void {
    console.log("setMainHighlightColorPicker");
  }

  editAltText(): void {
    console.log("editAltText");
  }

  hasCommentManager(): boolean {
    console.log("hasCommentManager");
    return false;
  }

  editComment(): void {
    console.log("editComment");
  }

  selectComment(): void {
    console.log("selectComment");
  }

  updateComment(): void {
    console.log("updateComment");
  }

  updatePopupColor(): void {
    console.log("updatePopupColor");
  }

  removeComment(): void {
    console.log("removeComment");
  }

  toggleComment(): void {
    console.log("toggleComment");
  }

  makeCommentColor(color: any, opacity: any): any {
    console.log("makeCommentColor", color, opacity);
    return { color, opacity };
  }

  getCommentDialogElement(): any {
    console.log("getCommentDialogElement");
    return null;
  }

  async waitForEditorsRendered(): Promise<void> {
    console.log("waitForEditorsRendered");
  }

  getSignature(): void {
    console.log("getSignature");
  }

  get signatureManager(): any {
    console.log("signatureManager");
    return null;
  }

  switchToMode(mode: any, callback: any): void {
    console.log("switchToMode", mode, callback);
  }

  setPreference(name: any, value: any): void {
    console.log("setPreference", name, value);
  }

  onSetPreference({ name, value }: { name: any; value: any }): void {
    console.log("onSetPreference", name, value);
    this.setPreference(name, value);
  }

  onPageChanging(): void {
    console.log("onPageChanging");
  }

  focusMainContainer(): void {
    console.log("focusMainContainer");
  }

  findParent(): any {
    console.log("findParent");
    return null;
  }

  // TODO: this function notify whenever text selection is disabled or enabled when editor is beign dragging
  disableUserSelect(): void {
    console.log("disableUserSelect");
  }

  addShouldRescale(): void {
    console.log("addShouldRescale");
  }

  removeShouldRescale(): void {
    console.log("removeShouldRescale");
  }

  onScaleChanging({ scale }: { scale: any }): void {
    console.log("onScaleChanging", scale);
    const vp = this.viewParameters || { realScale: 1, rotation: 0 };
    vp.realScale = Number(scale) || vp.realScale;
    this.viewParameters = vp;
  }

  onRotationChanging({ pagesRotation }: { pagesRotation: any }): void {
    console.log("onRotationChanging", pagesRotation);
    const vp = this.viewParameters || { realScale: 1, rotation: 0 };
    vp.rotation = Number(pagesRotation) || vp.rotation;
    this.viewParameters = vp;
  }

  highlightSelection(): void {
    console.log("highlightSelection");
  }

  commentSelection(): void {
    console.log("commentSelection");
  }

  getAndRemoveDataFromAnnotationStorage(): Object | null {
    console.log("getAndRemoveDataFromAnnotationStorage");
    return null;
  }

  a11yAlert(messageId: any, args = null): void {
    console.log("a11yAlert", messageId, args);
  }

  blur(): void {
    console.log("blur");
  }

  focus(): void {
    console.log("focus");
  }

  addEditListeners(): void {
    console.log("addEditListeners");
  }

  removeEditListeners(): void {
    console.log("removeEditListeners");
  }

  dragOver(): void {
    console.log("dragOver");
  }

  drop(): void {
    console.log("drop");
  }

  copy(): void {
    console.log("copy");
  }

  cut(): void {
    console.log("cut");
  }

  async paste(): Promise<void> {
    console.log("paste");
  }

  keydown(): void {
    console.log("keydown");
  }

  keyup(): void {
    console.log("keyup");
  }

  onEditingAction(): void {
    console.log("onEditingAction");
  }

  setEditingState(isEditing: boolean): void {
    console.log("setEditingState", isEditing);
    super.setEditingState(isEditing);
  }

  getLayer(pageIndex: any): any {
    console.log("getLayer", pageIndex);
  }

  get currentPageIndex(): number {
    console.log("currentPageIndex");
    return 0;
  }

  addLayer(layer: any): void {
    console.log("addLayer", layer);
    super.addLayer(layer);

    for (const editorParams of this.#editorDefaultParams) {
      editorParams(this.updateParams.bind(this));
    }
  }

  removeLayer(layer: any): void {
    console.log("removeLayer", layer);
    super.removeLayer(layer);
  }

  async updateMode(mode: number): Promise<void> {
    console.log("updateMode", mode);
  }

  addNewEditorFromKeyboard(): void {
    console.log("addNewEditorFromKeyboard");
  }

  // TODO: Notifica el fin de la edicion, se puede utilizar para remover el modo de edicion
  updateToolbar(): undefined {
    console.log("updateToolbar");
    return undefined;
  }

  // TODO: llamar despues de addeditor para modificar parametros globales y tambien notificar cambios en parametros
  updateParams(type: any, value: any): void {
    console.log("updateParams", type, value, this.hasSelection);
    super.updateParams(type, value);
  }

  showAllEditors(): void {
    console.log("showAllEditors");
  }

  enableWaiting(mustWait?: boolean): void {
    console.log("enableWaiting", mustWait);
  }

  addEditor(editor: any): void {
    super.addEditor(editor);
  }

  removeEditor(editor: any): void {
    super.removeEditor(editor);
  }

  addDeletedAnnotationElement(editor: any): void {
    console.log("addDeletedAnnotationElement", editor);
  }

  isDeletedAnnotationElement(annotationElementId: string): boolean {
    console.log("isDeletedAnnotationElement", annotationElementId);
    return false;
  }

  removeDeletedAnnotationElement(editor: any): void {
    console.log("removeDeletedAnnotationElement", editor);
  }

  updateUI(): void {
    console.log("updateUI");
  }

  updateUIForDefaultProperties(): void {
    console.log("updateUIForDefaultProperties");
  }

  get isEnterHandled(): boolean {
    console.log("isEnterHandled");
    return false;
  }

  undo(): void {
    console.log("undo");
  }

  redo(): void {
    console.log("redo");
  }

  cleanUndoStack(): void {
    console.log("cleanUndoStack");
  }

  // TODO: Evento de eliminacion de editores seleccionados
  // delete(): void {
  // }

  hasSomethingToControl(): boolean {
    console.log("hasSomethingToControl");
    return false;
  }

  rebuild(): void {
    console.log("rebuild");
  }

  get isEditorHandlingKeyboard(): boolean {
    console.log("isEditorHandlingKeyboard");
    return false;
  }

  getMode(): number {
    console.log("getMode", AnnotationEditorType.FREETEXT);
    return AnnotationEditorType.FREETEXT;
  }

  get imageManager(): any {
    console.log("imageManager");
    return null;
  }

  getSelectionBoxes():
    | { x: number; y: number; width: number; height: number }[]
    | null {
    console.log("getSelectionBoxes");
    return null;
  }

  addChangedExistingAnnotation({
    annotationElementId,
    id,
  }: {
    annotationElementId: any;
    id: any;
  }): void {
    console.log("addChangedExistingAnnotation", annotationElementId, id);
  }

  removeChangedExistingAnnotation({
    annotationElementId,
  }: {
    annotationElementId: any;
  }): void {
    console.log("removeChangedExistingAnnotation", annotationElementId);
  }

  renderAnnotationElement(): void {
    console.log("renderAnnotationElement");
  }

  setMissingCanvas(): void {
    console.log("setMissingCanvas");
  }

  addMissingCanvas(): void {
    console.log("addMissingCanvas");
  }
}
