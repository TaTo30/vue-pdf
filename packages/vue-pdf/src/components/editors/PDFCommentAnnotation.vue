<script setup lang="ts">
import * as PDFJS from "pdfjs-dist";

import { inject, ref, useTemplateRef } from "vue";

import { COMMENT_EDITOR_KEY } from "../utils/symbols";
import type { EditorFn, EditorRequest } from "../types";

const emits = defineEmits<{
  (event: "addComment", payload: Function): void;
}>();

const popupDispatcher = inject<EditorFn & EditorRequest>(COMMENT_EDITOR_KEY)!;

const show = ref(false);
const selected = ref(false);
const data = ref<any | undefined>();

const position = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const popupContainer = useTemplateRef("popupContainer");

let currentEditor: any | null = null;

function toggle(
  editor: any,
  isSelected: boolean,
  visibility: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isEditable: boolean,
) {
  if (!editor) {
    show.value = false;
    return;
  }

  if (visibility === undefined) {
    // Clicked
    selected.value = isSelected;
    show.value = isSelected;

    if (selected.value && editor.isSelected) {
      selected.value = false;
      show.value = false;
    }
  } else {
    if (selected.value) {
      // Already opened
    } else {
      show.value = visibility;
      // Hovered
    }
  }

  editor.isSelected = selected.value;
  editor.setCommentButtonStates({
    selected: selected.value,
    hasPopup: true,
  });

  if (editor.hasComment && editor.commentPopupPosition) {
    let [posX, posY] = editor.commentPopupPosition;
    editor.elementBeforePopup.after(popupContainer.value);
    position.value.x = posX * 100;
    position.value.y = posY * 100;
  }

  try {
    const { contentsObj, richText, creationDate, modificationDate } =
      editor.getData();

    const html =
      richText?.str && (!contentsObj?.str || richText.str === contentsObj.str)
        ? richText.html
        : contentsObj?.str;
    data.value = {
      html,
      creationDate,
      modificationDate,
    };

    currentEditor = editor;
  } catch (e) {
    // Ignore errors related to missing comments with editor that has none
  }
}

function formatDate(input: string): string {
  const date = PDFJS.PDFDateString.toDateObject(input);

  if (!date) return "";

  return Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  }).format(date);
}

function editComment() {
  show.value = false;
  selected.value = false;
  currentEditor?.editComment({ height: 0 });
  currentEditor.focus();
}

function deleteComment() {
  if (currentEditor) {
    currentEditor.comment = null;
    show.value = false;
    selected.value = false;
    currentEditor.focus();
  }
}

function requestComment(callback: Function) {
  emits("addComment", (text: string | null) => {
    if (text !== null && text.length > 0) {
      callback(text);
    }
  });
}

popupDispatcher.fn = toggle;
popupDispatcher.request = requestComment;
</script>

<template>
  <div
    v-show="show"
    ref="popupContainer"
    class="commentPopup"
    id="commentPopup"
    tabindex="-1"
    role="dialog"
    aria-modal="false"
    :style="{ left: position.x + '%', top: position.y + '%' }"
  >
    <div class="commentPopupTop">
      <time class="commentPopupTime">
        {{ formatDate(data?.creationDate) }}
      </time>

      <div
        v-show="selected"
        class="commentPopupButtons"
        style="visibility: visible !important"
      >
        <button
          @click="editComment"
          class="commentPopupIcon commentPopupEdit toolbarButton"
          tabindex="0"
          data-l10n-id="pdfjs-editor-edit-comment-popup-button"
          aria-haspopup="dialog"
        ></button>

        <button
          @click="deleteComment"
          class="commentPopupIcon commentPopupDelete toolbarButton"
          tabindex="0"
          data-l10n-id="pdfjs-editor-delete-comment-popup-button"
        ></button>
      </div>
    </div>

    <hr />

    <div class="commentPopupText">
      {{ data?.html }}
    </div>
  </div>
</template>

<style>
.commentPopupIcon::before {
  background-color: white;
}

.commentPopupIcon:hover::before {
  background-color: white !important;
}
</style>
