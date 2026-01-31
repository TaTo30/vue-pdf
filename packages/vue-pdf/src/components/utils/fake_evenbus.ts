import MinimalUiManager from "./manager";

// Fake EventBus to mock pdfjs-dist dispatch/on methods
export class FakeEventBus {
  private uiManager?: MinimalUiManager;

  constructor(uiManager?: MinimalUiManager) {
    this.uiManager = uiManager;
  }

  setUiManager(uiManager: MinimalUiManager): void {
    this.uiManager = uiManager;
  }

  _on(event: string, callback: Function): void {}

  on(event: string, callback: Function): void {
    this._on(event, callback);
  }

  // In the original eventbus this dispatch method is actually the emitter
  // but for the sake of this library we will be using it as the listener
  dispatch(event: string, data: any): void {
    if (this.uiManager) {
      switch (event) {
        case "switchannotationeditorparams":
          this.uiManager.updateParams(data.type, data.value);
          break;
      }
    }
  }
}
