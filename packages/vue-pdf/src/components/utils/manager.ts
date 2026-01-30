import { AnnotationEditorUIManager } from "pdfjs-dist";
import { AnnotationEditorConstructor } from "../types";
import { FakeEventBus } from "./fake_evenbus";

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
    const eventBus = new FakeEventBus();

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
      "yellow=#FFFF98,green=#53FFBC,blue=#80EBFF,pink=#FFCBE6,red=#FF4F5F,yellow_HCM=#FFFFCC,green_HCM=#53FFBC,blue_HCM=#80EBFF,pink_HCM=#F6B8FF,red_HCM=#C50043",
      null,
      null,
      null,
      null,
      null,
      null,
    );
    this._supportsPinchToZoom = false;

    eventBus.setUiManager(this);
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

  get direction(): any {
    return "ltr";
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

  // onScaleChanging({ scale }: { scale: any }): void {
  //   console.log("onScaleChanging", scale);
  //   const vp = this.viewParameters || { realScale: 1, rotation: 0 };
  //   vp.realScale = Number(scale) || vp.realScale;
  //   this.viewParameters = vp;
  // }

  // onRotationChanging({ pagesRotation }: { pagesRotation: any }): void {
  //   console.log("onRotationChanging", pagesRotation);
  //   const vp = this.viewParameters || { realScale: 1, rotation: 0 };
  //   vp.rotation = Number(pagesRotation) || vp.rotation;
  //   this.viewParameters = vp;
  // }

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
    super.addLayer(layer);

    for (const editorParams of this.#editorDefaultParams) {
      editorParams(this.updateParams.bind(this));
    }
  }

  removeLayer(layer: any): void {
    console.log("removeLayer", layer);
    super.removeLayer(layer);
  }

  addNewEditorFromKeyboard(): void {
    console.log("addNewEditorFromKeyboard");
  }

  // TODO: This is called when editor has finished the changes to update toolbar
  updateToolbar(): undefined {
    console.log("updateToolbar");
    return undefined;
  }

  updateParams(type: any, value: any): void {
    console.log("updateParams", type, value, this.hasSelection);
    super.updateParams(type, value);
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
    console.log("getMode", super.getMode());
    return super.getMode();
  }

  get imageManager(): any {
    console.log("imageManager");
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
