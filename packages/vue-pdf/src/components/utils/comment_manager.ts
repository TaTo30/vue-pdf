export class CommentManager {
  commentPopup: any | null = null;
  dialogElement: HTMLElement | null; // Important for editor toolbar
  constructor(commentPopup: any) {
    this.dialogElement = document.createElement("div");
    this.commentPopup = commentPopup;
  }

  setSidebarUiManager(uiManager: unknown): void {}
  showSidebar(annotations: unknown): void {}
  hideSidebar(): void {}
  removeComments(ids: unknown): void {}
  selectComment(id: unknown): void {}
  addComment(annotation: unknown): void {}
  updateComment(annotation: unknown): void {}
  makeCommentColor(color: string, opacity: number): void {}
  destroyPopup(): void {}
  destroy(): void {}
  updatePopupColor(editor: unknown): void {}
  static _makeCommentColor(color: string, opacity: number): string {
    return "transparent";
  }

  toggleCommentPopup(
    editor: unknown,
    isSelected: boolean,
    visibility: unknown,
    isEditable: boolean,
  ): void {
    this.commentPopup.fn(editor, isSelected, visibility, isEditable);
  }

  showDialog(
    uiManager: unknown,
    editor: any,
    posX: number,
    posY: number,
    options: unknown,
  ): void {
    this.commentPopup.request((text: string) => {
      editor.comment = text;
      editor.focusCommentButton();
    });
  }
}
