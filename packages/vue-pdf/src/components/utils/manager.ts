import { AnnotationEditorUIManager } from "pdfjs-dist";
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

type InternalState = {
  layers: Map<number, any>;
  editors: Map<string, any>;
  selection: Set<any>;
  deletedAnnotationElements: Set<string>;
  changedExisting: Map<string, string>;
  undoStack: any[];
  redoStack: any[];
  mode: number;
  activeEditor: any | null;
  waiting: boolean;
  preferences: Record<string, any>;
  isEditing: boolean;
  dragSession?: { started: boolean };
};

const __state = new WeakMap<MinimalUiManager, InternalState>();
function getState(self: MinimalUiManager): InternalState {
  let s = __state.get(self);
  if (!s) {
    s = {
      layers: new Map(),
      editors: new Map(),
      selection: new Set(),
      deletedAnnotationElements: new Set(),
      changedExisting: new Map(),
      undoStack: [],
      redoStack: [],
      mode: 0,
      activeEditor: null,
      waiting: false,
      preferences: {},
      isEditing: false,
      dragSession: { started: false },
    };
    __state.set(self, s);
  }
  return s;
}

export default class MinimalUiManager extends AnnotationEditorUIManager {
  static get _keyboardManager() {
    console.log("_keyboardManager");
    return null;
  }

  _editorUndoBar: any | null = null;
  _signal: AbortSignal = abortSignal;
  viewParameters: { realScale: number; rotation: number } = {
    realScale: 1,
    rotation: 0,
  };
  isShiftKeyDown = false;
  _supportsPinchToZoom = false;
  private _currentLayer: any | null = null;
  _eventBus: any;

  editorsAvailable: AnnotationEditorConstructor[] = [];

  constructor(pdfDocument: any) {
    console.log("MinimalUiManager constructor", pdfDocument);
    const eventBus = {
      _on(event: any, any: any) {
        console.log("eventBus on", event, any);
      },
      dispatch(event: any, data: any) {
        console.log("eventBus dispatch", event, data);
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
    this._signal = abortSignal;
  }

  destroy(): void {
    console.log("destroy");
  }

  combinedSignal(_ac: any): AbortSignal {
    return _ac.signal;
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
    this._currentLayer = layer;
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
    getState(this).mode = Number(mode) || 0;
    if (typeof callback === "function") callback();
  }

  setPreference(name: any, value: any): void {
    console.log("setPreference", name, value);
    getState(this).preferences[String(name)] = value;
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

  /** @override */
  disableUserSelect(): void {
    // TODO: this function notify whenever text selection is disabled or enabled when editor is beign dragging
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

  // addToAnnotationStorage(): void {
  //   console.log("addToAnnotationStorage");
  // }

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

  registerEditorTypes(vals: any): void {
    this.editorsAvailable = vals;
    console.log("registerEditorTypes", vals);
  }

  // getId(): string {
  //   console.log("getId");
  //   return `mui-${Math.random().toString(36).slice(2)}`;
  // }

  get currentLayer(): any {
    console.log("currentLayer");
    return this._currentLayer ?? null;
  }

  getLayer(pageIndex: any): any {
    console.log("getLayer", pageIndex);
    return getState(this).layers.get(Number(pageIndex)) || null;
  }

  get currentPageIndex(): number {
    console.log("currentPageIndex");
    const active = getState(this).activeEditor;
    return typeof active?.pageIndex === "number" ? active.pageIndex : 0;
  }

  addLayer(layer: any): void {
    // call super method
    console.log("addLayer", layer);
    super.addLayer(layer);
  }

  removeLayer(layer: any): void {
    console.log("removeLayer", layer);
    getState(this).layers.delete(Number(layer.pageIndex));
  }

  async updateMode(mode: number): Promise<void> {
    console.log("updateMode", mode);
    getState(this).mode = Number(mode) || 0;
  }

  addNewEditorFromKeyboard(): void {
    console.log("addNewEditorFromKeyboard");
  }

  updateToolbar(): undefined {
    // TODO: Notifica el fin de la edicion, se puede utilizar para remover el modo de edicion
    console.log("updateToolbar");
    return undefined;
  }

  updateParams(): void {
    console.log("updateParams");
  }

  showAllEditors(): void {
    console.log("showAllEditors");
  }

  enableWaiting(mustWait?: boolean): void {
    console.log("enableWaiting", mustWait);
    getState(this).waiting = !!mustWait;
  }

  addEditor(editor: any): void {
    // call super method
    console.log("addEditor", editor);
    super.addEditor(editor);
  }

  removeEditor(editor: any): void {
    console.log("removeEditor", editor);
    const s = getState(this);
    s.editors.delete(editor.id);
    const layer = s.layers.get(Number(editor.pageIndex));
    if (layer?.editors) {
      layer.editors = layer.editors.filter((e: any) => e !== editor);
    }
    s.selection.delete(editor);
    if (s.activeEditor === editor) s.activeEditor = null;
  }

  addDeletedAnnotationElement(editor: any): void {
    console.log("addDeletedAnnotationElement", editor);
    getState(this).deletedAnnotationElements.add(editor.id);
  }

  isDeletedAnnotationElement(annotationElementId: string): boolean {
    console.log("isDeletedAnnotationElement", annotationElementId);
    return getState(this).deletedAnnotationElements.has(
      String(annotationElementId),
    );
  }

  removeDeletedAnnotationElement(editor: any): void {
    console.log("removeDeletedAnnotationElement", editor);
    getState(this).deletedAnnotationElements.delete(editor.id);
  }

  // setActiveEditor(editor: any): void {
  //   console.log("setActiveEditor", editor);
  //   getState(this).activeEditor = editor || null;
  // }

  updateUI(): void {
    console.log("updateUI");
  }

  updateUIForDefaultProperties(): void {
    console.log("updateUIForDefaultProperties");
  }

  // toggleSelected(editor: any): void {
  //   console.log("toggleSelected", editor);
  //   const s = getState(this);
  //   if (s.selection.has(editor)) {
  //     s.selection.delete(editor);
  //     editor.isSelected = false;
  //   } else {
  //     s.selection.add(editor);
  //     editor.isSelected = true;
  //   }
  // }

  // setSelected(editor: any): void {
  //   console.log("setSelected", editor);
  //   const s = getState(this);
  //   s.selection.add(editor);
  //   editor.isSelected = true;
  // }

  // isSelected(editor: any): boolean {
  //   console.log("isSelected", editor);
  //   return getState(this).selection.has(editor);
  // }

  // get firstSelectedEditor(): any | null {
  //   console.log("firstSelectedEditor");
  //   const it = getState(this).selection.values();
  //   const n = it.next();
  //   return n.done ? null : n.value;
  // }

  // unselect(editor: any): void {
  //   console.log("unselect", editor);
  //   const s = getState(this);
  //   s.selection.delete(editor);
  //   editor.isSelected = false;
  // }

  // get hasSelection(): boolean {
  //   console.log("hasSelection");
  //   return getState(this).selection.size > 0;
  // }

  get isEnterHandled(): boolean {
    console.log("isEnterHandled");
    return false;
  }

  undo(): void {
    console.log("undo");
    const s = getState(this);
    const cmd = s.undoStack.pop();
    if (cmd?.undo) cmd.undo();
    if (cmd) s.redoStack.push(cmd);
  }

  redo(): void {
    console.log("redo");
    const s = getState(this);
    const cmd = s.redoStack.pop();
    if (cmd?.redo) cmd.redo();
    if (cmd) s.undoStack.push(cmd);
  }

  addCommands(params: Object): void {
    // TODO: Esta funcion permite habilitar acciones rapidas sobre un editor seleccionado
    console.log("addCommands", params);

    // getState(this).undoStack.push(params);
    // getState(this).redoStack.length = 0;
  }

  cleanUndoStack(): void {
    console.log("cleanUndoStack");
    const s = getState(this);
    s.undoStack.length = 0;
    s.redoStack.length = 0;
  }

  delete(): void {
    console.log("delete");
    const s = getState(this);
    for (const ed of Array.from(s.selection)) {
      this.removeEditor(ed);
    }
  }

  commitOrRemove(): void {
    console.log("commitOrRemove");
  }

  hasSomethingToControl(): boolean {
    console.log("hasSomethingToControl");
    const s = getState(this);
    return s.editors.size > 0 || s.selection.size > 0;
  }

  // selectAll(): void {
  //   console.log("selectAll");
  //   const s = getState(this);
  //   s.selection.clear();
  //   for (const ed of s.editors.values()) {
  //     s.selection.add(ed);
  //     ed.isSelected = true;
  //   }
  // }

  // unselectAll(): void {
  //   console.log("unselectAll");
  //   const s = getState(this);
  //   for (const ed of s.selection) ed.isSelected = false;
  //   s.selection.clear();
  // }

  // translateSelectedEditors(x: any, y: any, noCommit?: boolean): void {
  //   console.log("translateSelectedEditors", x, y, noCommit);
  //   super.translateSelectedEditors(x, y, noCommit);
  //   // const s = getState(this);
  //   // for (const ed of s.selection) {
  //   //   ed.translate?.(Number(x) || 0, Number(y) || 0, !!noCommit);
  //   // }
  // }

  // setUpDragSession(): void {
  //   console.log("setUpDragSession");
  //   super.setUpDragSession();
  // }

  // endDragSession(): boolean {
  //   console.log("endDragSession");
  //   return super.endDragSession();
  // }

  // dragSelectedEditors(tx: number, ty: number): void {
  //   console.log("dragSelectedEditors", tx, ty);
  //   super.dragSelectedEditors(tx, ty);
  //   // this.translateSelectedEditors(tx, ty, true);
  // }

  rebuild(): void {
    console.log("rebuild");
  }

  get isEditorHandlingKeyboard(): boolean {
    console.log("isEditorHandlingKeyboard");
    return false;
  }

  // isActive(editor: any): editor is never {
  //   console.log("isActive", editor);
  //   return getState(this).activeEditor === editor;
  // }

  // getActive(): any | null {
  //   console.log("getActive");
  //   return getState(this).activeEditor;
  // }

  getMode(): number {
    // TODO: Esto puede variar realmente
    return AnnotationEditorType.FREETEXT;
  }

  // isEditingMode(): boolean {
  //   console.log("isEditingMode");
  //   return getState(this).mode !== 0;
  // }

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
    getState(this).changedExisting.set(String(annotationElementId), String(id));
  }

  removeChangedExistingAnnotation({
    annotationElementId,
  }: {
    annotationElementId: any;
  }): void {
    console.log("removeChangedExistingAnnotation", annotationElementId);
    getState(this).changedExisting.delete(String(annotationElementId));
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
