<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick, provide } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";
import { usePanelWidth } from "../shared/panel_width.js";
import { useFontSize } from "../shared/font_size.js";
import DialogHeader from "../shared/DialogHeader.vue";
import StickyPanel from "../shared/StickyPanel.vue";
import InstructPickerDialog from "../shared/InstructPickerDialog.vue";
import SpeakerPickerDialog from "./SpeakerPickerDialog.vue";
import LineHistoryDialog from "../shared/LineHistoryDialog.vue";
import LineRowEditor from "../shared/LineRowEditor.vue";
import { speakerAccent } from "../shared/speaker_accent.js";
import { insertStressMark as sharedInsertStressMark } from "../shared/stress_mark.js";
import { useRoleInfoPopover } from "../shared/role_info_popover.js";
import RoleInfoPopover from "../shared/RoleInfoPopover.vue";
import { useTextareaAutoGrow } from "../shared/textarea_autogrow.js";
import {
  joinPath, stripSuffixAndExt,
  SCRIPT_EDITOR_API as FILE_API, SCRIPT_LIBRARY_API as SCAN_API, SPEAKER_PRESETS_API as PRESETS_API,
  BROWSE_API, DEFAULT_LINE_GAP_S,
} from "../../web/fl_common.js";

import { parseLine, parseScript, serializeRows, freshRow } from "./composables/useScriptParsing.js";
import { useLineFiles } from "./composables/useLineFiles.js";
import { usePlayback } from "./composables/usePlayback.js";
import { useLineCatalog } from "./composables/useLineCatalog.js";
import { useScriptIO } from "./composables/useScriptIO.js";
import { useRowOps } from "./composables/useRowOps.js";
import { useDialogs } from "./composables/useDialogs.js";
import { useRevoice } from "./composables/useRevoice.js";
import { useRowHelpers } from "./composables/useRowHelpers.js";

const props = defineProps({
  folder: { type: String, required: true },
  filename: { type: String, required: true },
  suffix: { type: String, default: "" },
  checkedApi: { type: Object, default: null },
  revoiceApi: { type: Object, default: null },
  onClose: { type: Function, required: true },
});

const SAVE_DEBOUNCE_MS = 600;
const POLL_MS = 3000;
const EDIT_QUIET_MS = 1500;

const visible = ref(true);
const filename = ref(props.filename);
const rows = ref([]);
const status = ref("");
const selectChecked = ref(props.checkedApi ? props.checkedApi.isChecked(props.filename) : false);

// шаренные между composables refs и структуры
const rawTimingLines = ref(null);
const lastTimingMtime = ref(null);
const lastAudioFingerprint = ref(null);
const rowEls = new Map(); // row.__key -> DOM-узел

const confirm = useConfirm();
function confirmAsync({ title = "Confirm", message = "", okText = "OK", cancelText = "Cancel" } = {}) {
  return new Promise((resolve) => {
    confirm.require({
      header: title, message,
      acceptLabel: okText, rejectLabel: cancelText,
      accept: () => resolve(true),
      reject: () => resolve(false),
      onHide: () => resolve(false),
    });
  });
}

const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
  storageKey: "FL_CosyVoice3.LineEditor.widthPx", defaultWidth: 1600, presets: [1280, 1600],
});
const { fontSizePx: textFontSizePx, decrease: decreaseTextFontSize, increase: increaseTextFontSize } = useFontSize({
  storageKey: "FL_CosyVoice3.LineEditor.textFontSizePx", defaultSize: 11.5,
});
const { autoGrow, setTextareaRef, regrowAll } = useTextareaAutoGrow();

const fullPath = computed(() => joinPath(props.folder, filename.value));
const audioFolder = computed(() => joinPath(props.folder, "_audio"));
const audioBaseName = computed(() => stripSuffixAndExt(filename.value, props.suffix));
const linesDirPath = computed(() => joinPath(joinPath(audioFolder.value, "lines"), audioBaseName.value));

function setStatus(text) { status.value = text; }

const saveTimer = ref(null);
const pollTimer = ref(null);
const audioPollTimer = ref(null);
const timingPollTimer = ref(null);
const closed = ref(false);

const ctx = {
  props, visible, filename, rows, status, selectChecked,
  parseLine, parseScript, serializeRows, freshRow,
  confirmAsync, setStatus, setTextareaRef, autoGrow,
  fullPath, audioFolder, audioBaseName, linesDirPath,
  saveTimer, pollTimer, audioPollTimer, timingPollTimer, closed,
  rawTimingLines, lastTimingMtime, lastAudioFingerprint, rowEls,
  SAVE_DEBOUNCE_MS, POLL_MS, EDIT_QUIET_MS,
  FILE_API, SCAN_API, BROWSE_API, PRESETS_API, DEFAULT_LINE_GAP_S,
};

Object.assign(ctx, useLineFiles(ctx));
Object.assign(ctx, usePlayback(ctx));
Object.assign(ctx, useLineCatalog(ctx));
Object.assign(ctx, useScriptIO(ctx));
Object.assign(ctx, useRowOps(ctx));
Object.assign(ctx, useDialogs(ctx));
Object.assign(ctx, useRevoice(ctx));
Object.assign(ctx, useRowHelpers(ctx));

const {
  // useLineCatalog
  instructCategories, instructCategoriesPath, roleEntries, rolesJsonPath,
  presets, speakerSampleDir, scriptList,
  roleEntryByCode, roleEntryFor,
  resolveSpeakerFile, resolvedSpeakerForHash, speakerUsageIndex, roleOptionSubLabel,
  saveRolesJson, notifyRoleSpeakerChanged, loadPresets, loadCatalog,

  // useLineFiles
  lineFilesOnDisk, lineFileMtimes, loadLineFiles, positionByIndex, latestFileFor,
  rowHasAnyTake, rowIsFresh, expectedHash, rowHashDebounce, ROW_HASH_DEBOUNCE_MS,
  updateRowHash, recomputeAllHashes,

  // useScriptIO
  lastSavedText, lastLocalEditAt,
  scheduleSave, flushSave, loadFromDisk, switchToFile, close,

  // usePlayback
  activeTimingIdx, audioElRef,
  loadTiming, computeLineTiming, lineTiming, currentRowToTimingIdx,
  timingWarningVisible, syncActiveLine,
  audioIsPlaying, mode1PlayingIdx,
  stopMode1Playback, playRowSequential,
  isRowPlaying, canPlayRow, onPlayClick,
  isPlayingAnything, canPlayGlobal, globalPlayTitle, toggleGlobalPlayback,
  readyScripts, audioState,
  loadAudio, deleteAudioDisabled, deleteAudio,
  isCurrentlyReady, allRowsVoiced, doneDisabled, doneTitle, toggleDone,

  // useRowOps
  mergeRows, attachDragHandlers, deleteRow, confirmDeleteRow,
  splitFocusedLine, addLine, reorganizeLines,
  rowsContainerEl, justAddedKey, setRowRef, focusNewRow,

  // useDialogs
  instructPickerVisible, instructPickerRow,
  openInstructPicker, onInstructPicked, undoInstructTitle, undoInstruct,
  instructCategoryByPhrase, instructNoteFor,
  instructLibrarySaveDebounce, scheduleInstructLibrarySave, onInstructInput,
  speakerPickerVisible, speakerPickerRow,
  openSpeakerPicker, onSpeakerPicked, onSpeakerFileRecast, speakerFileTitle,
  historyVisible, historyRow, historyVersions, historyChosenVersion, historyCounts,
  refreshHistoryCounts, openLineHistory, onHistoryVersionChosen,

  // useRevoice
  pendingRevoiceRows, isRevoicingStale, staleRowCount, revoiceStaleTitle,
  isRowStale, revoiceTitle, revoiceRow, revoiceStaleRows,

  // useRowHelpers
  lastRowIndex, pauseDefaultFor, pauseUnreadable, pauseTitle,
  roleCountByCode, sameRoleCount, applyInstructToSameRole,
  navIdx, prevDisabled, nextDisabled, goPrev, goNext,
} = ctx;

const {
  popover: roleInfoPopover,
  show: showRoleInfoPopover,
  hide: hideRoleInfoPopover,
  info: roleInfoFields,
} = useRoleInfoPopover(
    roleEntries,
    (entry) => Object.entries(entry).filter(
        ([, v]) => v !== "" && v !== null && v !== undefined && v !== entry.__key,
    ),
);

// ──────────────────────────────────────────────────────────────────────
// lineRowApi — контракт для LineRowEditor через inject
// ──────────────────────────────────────────────────────────────────────
provide("lineRowApi", {
  // общий каталог и UI
  roleEntries,
  roleOptionSubLabel,
  fontSizePx: textFontSizePx,
  autoGrow,
  setTextareaRef,
  showRoleInfoPopover,
  hideRoleInfoPopover,

  // подписи, специфичные для audiobook
  speakerPlaceholder: "Speaker",
  speakerTitle: "Speaker (role code, or a literal preset/preset#tag)",
  instructPlaceholder: "Instruct",
  instructTitle: "Instruct text -- type freely, or pick from the phrase bank",
  textPlaceholder: "",

  // доступ к полям row
  getSpeaker:  (row) => row.speaker,
  setSpeaker:  (row, v) => { row.speaker = v; onSpeakerInput(row); },
  getInstruct: (row) => row.instruct,
  setInstruct: (row, v) => { row.instruct = v; onInstructInput(row); },
  getText:     (row) => row.text,
  setText:     (row, v) => { row.text = v; updateRowHash(row); scheduleSave(); },
  getRoleInfoCode: (row) => row.speaker,
  textKey:     (row) => row.__key,

  // instruct-действия
  canUndoInstruct:     (row) => row.__prevInstruct !== undefined,
  undoInstructTitle:   (row) => undoInstructTitle(row),
  undoInstruct:        (row) => undoInstruct(row),
  /*
   LineRowEditor.vue calls these two WITHOUT optional chaining (its lines
   112-113, unlike the audio-url pair just below them), so omitting them here
   crashed the editor outright: "api.canApplyInstruct is not a function".
   VO Dub's useVoDubRowApi.js supplied both and this side did not -- the two
   implementations of one shared contract had drifted apart.
  */
  canApplyInstruct:    (row) => sameRoleCount(row) > 0,
  applyInstructTitle:  (row) => {
    const count = sameRoleCount(row);
    return count > 0
      ? `Apply this instruct to every other "${(row.speaker || "").trim()}" row in this script (${count})`
      : "No other rows in this script use this role";
  },
  applyInstructToSameRole: (row) => applyInstructToSameRole(row),
  instructNoteFor:     (row) => instructNoteFor(row),
  openInstructPicker:  (row) => openInstructPicker(row),
});

// ── локальные хелперы main ──────────────────────────────────────────────
function onSelectCheckboxChange(checked) {
  props.checkedApi?.setChecked(filename.value, checked);
}

function insertStressMark() {
  sharedInsertStressMark(setStatus);
}

// ── watch ───────────────────────────────────────────────────────────────
watch(roleEntries, recomputeAllHashes);
watch(visible, (v) => { if (!v) close(); });
watch(lineTiming, () => nextTick(syncActiveLine));
watch(textFontSizePx, regrowAll);

// ── lifecycle ───────────────────────────────────────────────────────────
onMounted(() => {
  loadCatalog();
  loadPresets();
  loadAudio();
  loadLineFiles();
  refreshHistoryCounts();
  audioPollTimer.value = setInterval(() => {
    loadAudio({ silent: true });
    loadLineFiles();
  }, POLL_MS);
  loadFromDisk().then(() => {
    pollTimer.value = setInterval(() => loadFromDisk({ isPoll: true }), POLL_MS);
    loadTiming();
    timingPollTimer.value = setInterval(() => loadTiming({ silent: true }), POLL_MS);
  });
});

onBeforeUnmount(() => {
  stopMode1Playback();
  if (pollTimer.value) clearInterval(pollTimer.value);
  if (audioPollTimer.value) clearInterval(audioPollTimer.value);
  if (timingPollTimer.value) clearInterval(timingPollTimer.value);
});
</script>

<template>
  <div class="fl-line-editor-content">
    <DialogHeader
        :title="filename" :status="status"
        :width-presets="widthPresets" :set-width="setPanelWidth"
        :font-size-decrease="decreaseTextFontSize" :font-size-increase="increaseTextFontSize"
    />

    <StickyPanel class="line-editor-controls">
      <div class="audio-content-row">
                <span
                    class="play-btn global-play-btn"
                    :class="{ 'is-playing': isPlayingAnything, disabled: !canPlayGlobal }"
                    :title="globalPlayTitle"
                    @click="toggleGlobalPlayback"
                >{{ isPlayingAnything ? "⏸" : "▶" }}</span>

        <template v-if="audioState.best">
          <audio
              ref="audioElRef"
              controls
              class="audio-el"
              :src="`${SCAN_API}/audio?path=${encodeURIComponent(joinPath(audioFolder, audioState.best))}&v=${encodeURIComponent(audioState.mtime || '')}`"
              @timeupdate="syncActiveLine"
              @play="audioIsPlaying = true"
              @pause="audioIsPlaying = false"
              @ended="audioIsPlaying = false"
          />
          <Button
              label="Delete audio" text size="small"
              :disabled="deleteAudioDisabled"
              :title="isCurrentlyReady ? 'Delete the final file -- this also un-marks the script as done' : 'Delete the rendered audio for this script'"
              @click="deleteAudio"
              icon="pi pi-times-circle"
          />
        </template>

        <Button icon="pi pi-refresh" text size="small" title="Re-check _audio\ for this script's rendered audio" @click="loadAudio()" />
      </div>
      <div v-if="timingWarningVisible" class="timing-warning">⚠ Тайминг устарел -- изменилось число строк, нужен полный рендер</div>

      <div class="actions-row">
        <input
            type="checkbox"
            class="row-checkbox"
            :checked="selectChecked"
            :disabled="!checkedApi || isCurrentlyReady"
            title="Mark this script as checked for queueing (Script Library's tree)"
            @change="selectChecked = $event.target.checked; onSelectCheckboxChange($event.target.checked)"
        />
        <Button
            :label="isCurrentlyReady ? 'Done ✓' : 'Done'"
            size="small"
            :outlined="!isCurrentlyReady"
            :disabled="doneDisabled"
            :title="doneTitle"
            @click="toggleDone"
        />
        <div class="actions-divider" />
        <Button label="´ Stress mark" text size="small" title="Insert a stress mark at the cursor" @mousedown.prevent="insertStressMark" />
        <Button label="✂ Split line" text size="small" title="Split this line into two at the cursor" @mousedown.prevent="splitFocusedLine" />
        <Button label="+ Add line" text size="small" title="Add a new empty line at the end of the script" @click="addLine" />
        <Button
            label="🔁 Re-voice pending"
            text size="small"
            :disabled="!revoiceApi || isCurrentlyReady || staleRowCount === 0 || isRevoicingStale"
            :title="revoiceStaleTitle"
            @click="revoiceStaleRows"
        />
        <div class="actions-divider" />
        <Button label="◀ Prev" text size="small" :disabled="prevDisabled" title="Open the previous script in this act" @click="goPrev" />
        <Button label="Next ▶" text size="small" :disabled="nextDisabled" title="Open the next script in this act" @click="goNext" />
      </div>
    </StickyPanel>

    <div ref="rowsContainerEl" class="rows-container">
      <div
          v-for="(row, index) in rows"
          :key="row.__key"
          class="fl-line-row"
          :class="{ 'row-enter': justAddedKey === row.__key, 'row-playing': (isCurrentlyReady ? currentRowToTimingIdx.get(index) === activeTimingIdx : mode1PlayingIdx === index) }"
          :data-row-index="index"
          :ref="(el) => setRowRef(row.__key, el)"
      >
        <div class="line-rail"
             :style="row.malformed ? {} : { backgroundColor: speakerAccent(row.speaker) }"
             title="Drag onto another line to merge them"
             :ref="(el) => attachDragHandlers(el, index)"
        >
          <span class="line-number">{{ index + 1 }}</span>
          <i class="pi pi-arrows-v"></i>
        </div>
        <div class="line-body">
          <template v-if="row.malformed">
            <div class="malformed-warn-line">
              <div class="malformed-warn">⚠ unparsed line (needs exactly two '|' separators) -- edit as raw text:</div>
              <Button icon="pi pi-trash" text size="small" title="Delete this line" @click="confirmDeleteRow(index, row.raw)" />
            </div>
            <Textarea
                v-model="row.raw"
                auto-resize
                class="fl-textarea malformed-textarea"
                :style="{ fontSize: `${textFontSizePx}px` }"
                rows="1"
                :ref="(el) => setTextareaRef(row.__key, el)"
                @update:model-value="scheduleSave()"
                @keydown.enter.prevent
            />
          </template>
          <template v-else>
            <LineRowEditor :row="row" :index="index">
              <template #leading>
                            <span
                                class="play-btn"
                                :class="{ 'is-playing': isRowPlaying(index), disabled: !canPlayRow(index, row) }"
                                :title="canPlayRow(index, row) ? (isCurrentlyReady ? 'Jump to this line in the full render' : 'Play this line (and every voiced line after it)') : 'Not voiced yet -- nothing to play'"
                                @click="onPlayClick(row, index)"
                            >{{ isRowPlaying(index) ? "⏸" : "▶" }}</span>
              </template>
              <template #trailing>
                <InputGroup class="speaker-file-group">
                  <Button
                      v-if="revoiceApi && !isCurrentlyReady"
                      class="revoice-btn"
                      size="small"
                      :icon="pendingRevoiceRows.has(row) ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
                      :class="{ pending: pendingRevoiceRows.has(row), stale: !pendingRevoiceRows.has(row) && rowHasAnyTake(index) && !rowIsFresh(row, index) }"
                      :disabled="pendingRevoiceRows.has(row)"
                      :title="revoiceTitle(row, index)"
                      @click="revoiceRow(row, index)"
                  />
                  <InputText
                      :model-value="roleEntryFor(row)?.speaker || ''"
                      placeholder="(no speaker)"
                      class="speaker-file-input"
                      :disabled="!roleEntryFor(row)"
                      :title="speakerFileTitle(row)"
                      @update:model-value="onSpeakerFileRecast(row, $event)"
                  />
                  <Button
                      icon="pi pi-microphone"
                      size="small"
                      :disabled="!roleEntryFor(row)"
                      title="Pick a speaker from the preset gallery"
                      @click="openSpeakerPicker(row)"
                  />
                </InputGroup>

                <InputGroup class="pause-group">
                  <InputGroupAddon>
                    <i :class="pauseUnreadable(row) ? 'pi pi-exclamation-triangle pause-warn' : 'pi pi-stopwatch'" />
                  </InputGroupAddon>
                  <InputText
                      v-model="row.pause"
                      class="pause-input"
                      :class="{ 'p-invalid': pauseUnreadable(row) }"
                      :placeholder="String(pauseDefaultFor(index))"
                      :title="pauseTitle(row, index)"
                      @update:model-value="scheduleSave()"
                  />
                </InputGroup>

                <div class="spacer" />
                <Button
                    icon="pi pi-history"
                    size="small"
                    text
                    :label="historyCounts.get(positionByIndex.get(index)) ? String(historyCounts.get(positionByIndex.get(index))) : ''"
                    title="Line history (previous takes/versions)"
                    @click="openLineHistory(row, index)"
                />
                <Button icon="pi pi-times" color="red" text size="small" title="Delete this line" @click="confirmDeleteRow(index, row.text)" />
              </template>
            </LineRowEditor>
          </template>
        </div>
      </div>
    </div>
  </div>

  <ConfirmDialog />

  <InstructPickerDialog
      v-model:visible="instructPickerVisible"
      :categories="instructCategories"
      @select="onInstructPicked"
  />

  <SpeakerPickerDialog
      v-model:visible="speakerPickerVisible"
      :presets="presets"
      :sample-dir="speakerSampleDir"
      :usage-for="speakerUsageSubLabel"
      @select="onSpeakerPicked"
  />

  <LineHistoryDialog
      v-model:visible="historyVisible"
      :versions="historyVersions"
      :chosen-version="historyChosenVersion"
      original=""
      @select="onHistoryVersionChosen"
  />

  <RoleInfoPopover
      :visible="roleInfoPopover.visible" :left="roleInfoPopover.left" :top="roleInfoPopover.top"
      :message="roleInfoFields.message" :fields="roleInfoFields.fields"
  />
</template>

<style scoped src="../style/LineEditorApp.css"></style>
