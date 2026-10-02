<script setup>
/*
 Full-screen-ish editor for one episode bucket of a VO dub project.
*/
import { ref, watch, onMounted } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import { usePanelWidth } from "../shared/panel_width.js";
import { useFontSize } from "../shared/font_size.js";
import DialogHeader from "../shared/DialogHeader.vue";
import StickyPanel from "../shared/StickyPanel.vue";
import LineRowEditor from "../shared/LineRowEditor.vue";
import InstructPickerDialog from "../shared/InstructPickerDialog.vue";
import OutputFileDialog from "./OutputFileDialog.vue";
import LineHistoryDialog from "../shared/LineHistoryDialog.vue";
import RoleInfoPopover from "../shared/RoleInfoPopover.vue";
import WaveformCanvas from "./WaveformCanvas.vue";
import { useTextareaAutoGrow } from "../shared/textarea_autogrow.js";
import { insertStressMark } from "../shared/stress_mark.js";

import { storeToRefs } from "pinia";
import { useVoDubStore } from "../stores/voDubStore.js";

import { useVoDubHistory } from "./composables/useVoDubHistory.js";
import { useVoDubRoles } from "./composables/useVoDubRoles.js";
import { useVoDubInstruct } from "./composables/useVoDubInstruct.js";
import { useVoDubEffects } from "./composables/useVoDubEffects.js";
import { useVoDubPlayers } from "./composables/useVoDubPlayers.js";
import { useVoDubRender } from "./composables/useVoDubRender.js";
import { useVoDubRowApi } from "./composables/useVoDubRowApi.js";

const props = defineProps({
  root: { type: String, required: true },
  bucket: { type: String, required: true },
  renderApi: { type: Object, default: null },
  onClose: { type: Function, required: true },
});

// ── UI-хуки ──────────────────────────────────────────────────────────────
const { cssWidth: panelWidthCss, setWidth: setPanelWidth, presets: widthPresets } = usePanelWidth({
  storageKey: "FL_CosyVoice3.VODubLineEditor.widthPx",
  defaultWidth: 1100,
  presets: [800, 1100, 1500],
});
const { fontSizePx, decrease: decreaseFontSize, increase: increaseFontSize } = useFontSize({
  storageKey: "FL_CosyVoice3.VODubLineEditor.fontSizePx",
  defaultSize: 13,
});
const { autoGrow, setTextareaRef, regrowAll } = useTextareaAutoGrow();
watch(fontSizePx, regrowAll);

// ── шаренные структуры между composables ─────────────────────────────────
const effectPreviews = new Map();

// ── локальное UI-состояние ──────────────────────────────────────────────
const visible = ref(true);
let closed = false;

// ← PINIA: базовое состояние VO Dub — теперь Pinia-стор вместо
// useVoDubState. Инициализируем root/bucket из props.
const voDub = useVoDubStore();
voDub.init({ root: props.root, bucket: props.bucket });

// ── ctx: то, что нужно всем composables ─────────────────────────────────
const ctx = {
  props,
  effectPreviews,
  autoGrow,
  setTextareaRef,
  fontSizePx,
};

const voDubRefs = storeToRefs(voDub);

Object.assign(ctx, {
  // refs
  rows: voDubRefs.rows,
  statusFilter: voDubRefs.statusFilter,
  searchText: voDubRefs.searchText,
  status: voDubRefs.status,
  loading: voDubRefs.loading,
  useOriginalDefault: voDubRefs.useOriginalDefault,
  saveTimer: voDubRefs.saveTimer,
  currentPage: voDubRefs.currentPage,
  visibleRows: voDubRefs.visibleRows,
  pageCount: voDubRefs.pageCount,
  pagedRows: voDubRefs.pagedRows,
  // reactive — напрямую
  stateRows: voDub.stateRows,
  // функции
  entryFor: voDub.entryFor,
  loadState: voDub.loadState,
  loadRows: voDub.loadRows,
  scheduleSave: voDub.scheduleSave,
  flushSave: voDub.flushSave,
  onTextEdit: voDub.onTextEdit,
  setStatus: voDub.setStatus,
  statePath: voDub.statePath,
  // константы
  SAVE_DEBOUNCE_MS: voDub.SAVE_DEBOUNCE_MS,
  PAGE_SIZE: voDub.PAGE_SIZE,
  STATUS_LABELS: voDub.STATUS_LABELS,
  STATUS_FILTER_OPTIONS: voDub.STATUS_FILTER_OPTIONS,
});

// ── остальные composables: без изменений ────────────────────────────────
Object.assign(ctx, useVoDubHistory(ctx));
Object.assign(ctx, useVoDubRoles(ctx));
Object.assign(ctx, useVoDubInstruct(ctx));
Object.assign(ctx, useVoDubEffects(ctx));
Object.assign(ctx, useVoDubPlayers(ctx));
Object.assign(ctx, useVoDubRender(ctx));
useVoDubRowApi(ctx);

const {
  // state
  rows, stateRows, statusFilter, searchText, status, loading, useOriginalDefault,
  entryFor, loadState, loadRows, scheduleSave, flushSave, onTextEdit, setStatus,
  visibleRows, PAGE_SIZE, currentPage, pageCount, pagedRows,
  STATUS_LABELS, STATUS_FILTER_OPTIONS, saveTimer,

  // history
  historyVisible, historyRow, historyVersions, historyChosenVersion,
  historyCounts, refreshHistoryCounts, openLineHistory, onHistoryVersionChosen,

  // roles
  roleEntries, loadRoleEntries, roleCodeFor, roleOptionSubLabel,
  sameIdentifierCount, applyRoleTitle, applyRoleToSameIdentifier,
  roleInfoPopover, showRoleInfoPopover, hideRoleInfoPopover, roleInfoFields,

  // instruct
  instructCategories, loadInstructCategories,
  instructPickerVisible, instructPickerRow, openInstructPicker,
  onInstructPicked, prevInstruct, undoInstructTitle, undoInstruct,
  instructNoteFor, sameRoleCount, applyInstructToSameRole,

  // effects
  effectValue,
  speedMatchValue,
  commitEffect, applyEffectToFile,
  outputDialogVisible, dialogRow, openOutputDialog, onDialogApply,

  // players
  audioUrl, setEnAudioRef, setRuAudioRef,
  dualPlayingRows, dualLoadingRows, playBoth, onTrackPaused,
  sequentialPlayingKey, toggleSequentialPlayback,
  setRowRef,

  // render
  cacheBust, renderingKeys, isRenderingAllPending,
  renderRow, renderAllPending,
  hasRuTake, manuallyDone, toggleManuallyDone,
  manuallyIssue, toggleManuallyIssue,
  measuredDuration, onRuMetadata, durationBadge, enDurationText,
  resolvedUseOriginal, onToggleRowUseOriginal, onToggleUseOriginalDefault,
} = ctx;

onMounted(async () => {
  loadRoleEntries();
  loadInstructCategories();
  refreshHistoryCounts();
  await loadState();
  await loadRows();
});

function close() {
  if (closed) return;
  closed = true;
  if (saveTimer.value) {
    clearTimeout(saveTimer.value);
    flushSave();
  }
  props.onClose();
}

watch(visible, (v) => { if (!v) close(); });
</script>

<template>
  <div class="fl-vo-dub-line-editor-content">
    <DialogHeader
        :title="`VO Dub — ${bucket}`"
        :width-presets="widthPresets" :set-width="setPanelWidth"
        :font-size-decrease="decreaseFontSize" :font-size-increase="increaseFontSize"
    />

    <StickyPanel class="vo-dub-editor-controls">
      <div class="vo-dub-filters">
        <InputText v-model="searchText" placeholder="Search text or audio_key..." class="vo-dub-search"/>
        <Dropdown v-model="statusFilter" :options="STATUS_FILTER_OPTIONS" option-label="label" option-value="value" class="vo-dub-status-filter"/>
        <Button icon="pi pi-refresh" text size="small" title="Re-scan this bucket" @click="loadRows"/>
        <span class="vo-dub-editor-status">{{ loading ? "Loading..." : status }}</span>
        <Button icon="pi pi-times" text size="small" title="Close" @click="visible = false"/>
      </div>

      <div class="actions-row">
        <div class="vo-dub-pager-inline">
          <Button
              label="◀"
              text
              size="small"
              :disabled="currentPage === 0"
              title="Previous page"
              @click="currentPage--"
          />
          <span class="vo-dub-pager-label">
            {{ currentPage + 1 }} / {{ pageCount }} ({{ visibleRows.length }})
          </span>
          <Button
              label="▶"
              text
              size="small"
              :disabled="currentPage >= pageCount - 1"
              title="Next page"
              @click="currentPage++"
          />
        </div>

        <span class="actions-divider" />

        <Button
            label="´ Stress mark"
            text
            size="small"
            title="Insert a stress mark at the cursor"
            @mousedown.prevent="insertStressMark(setStatus)"
        />
        <Button
            :label="sequentialPlayingKey ? 'Stop' : '▶ Play in order'"
            text
            size="small"
            :icon="sequentialPlayingKey ? 'pi pi-stop-circle' : 'pi pi-play'"
            title="Play through this page's RU takes in order"
            @click="toggleSequentialPlayback"
        />
        <Button
            :label="isRenderingAllPending ? 'Rendering...' : '🔁 Render pending'"
            text
            size="small"
            :icon="isRenderingAllPending ? 'pi pi-spin pi-spinner' : 'pi pi-play'"
            :disabled="!props.renderApi || isRenderingAllPending"
            title="Render every not-started or stale row in this WHOLE bucket"
            @click="renderAllPending"
        />

        <label
            class="vo-dub-original-default-label"
            title="Project-wide default for the per-row 'Use original as sample' checkbox."
        >
          <Checkbox v-model="useOriginalDefault" binary @change="onToggleUseOriginalDefault" />
          Original as sample
        </label>
      </div>
    </StickyPanel>

    <div class="vo-dub-rows" :style="{ fontSize: `${fontSizePx}px` }">
      <div
          v-for="row in pagedRows" :key="row.audio_key"
          class="vo-dub-row"
          :class="{ 'row-playing': sequentialPlayingKey === row.audio_key, 'row-issue': manuallyIssue(row) }"
          :ref="(el) => setRowRef(row.audio_key, el)"
      >
        <div class="vo-dub-row-head">
          <span class="vo-dub-key">{{ row.audio_key }}</span>
          <span :class="['vo-dub-status-pill', `status-${row.status}`]">{{ STATUS_LABELS[row.status] }}</span>
          <Button
              v-if="hasRuTake(row)"
              class="vo-dub-done-btn"
              :class="{ active: manuallyDone(row) }"
              text size="small"
              :icon="manuallyDone(row) ? 'pi pi-check-circle' : 'pi pi-circle'"
              :label="manuallyDone(row) ? 'Done' : 'Mark done'"
              title="Manually treat this row as done even if its content has drifted since the last render."
              @click="toggleManuallyDone(row)"
          />
          <Button
              class="vo-dub-issue-btn"
              :class="{ active: manuallyIssue(row) }"
              text size="small"
              severity="danger"
              :icon="manuallyIssue(row) ? 'pi pi-exclamation-triangle' : 'pi pi-exclamation-circle'"
              :label="manuallyIssue(row) ? 'Issue' : 'Mark issue'"
              title="Flag this row as needing attention. Independent from Done — both can be set at once."
              @click="toggleManuallyIssue(row)"
          />
        </div>

        <div v-if="row.status === 'unsupported'" class="vo-dub-unsupported-note">
          Unsupported: {{ row.channels }}-channel audio split across multiple files
          (<code>.a</code>-<code>.d</code>) -- this editor can only play or render a single mono/stereo
          file per row. Handle this one outside the tool.
        </div>

        <template v-else>
          <div class="vo-dub-players">
            <div class="vo-dub-duration-line">
              <span class="vo-dub-duration-en">{{ enDurationText(row) }}</span>
              <span class="vo-dub-duration-arrow">→</span>
              <span class="vo-dub-duration-ru">
                RU {{ durationBadge(row)?.ruSeconds || "—" }}
              </span>
              <span
                  v-if="durationBadge(row)"
                  :class="['vo-dub-duration-delta', `badge-${durationBadge(row).level}`]"
              >{{ durationBadge(row).pctText }}</span>
            </div>

            <div class="vo-dub-players-row">
              <div class="vo-dub-player">
                <WaveformCanvas :src="audioUrl('audio_en', row.audio_key)" class="vo-dub-waveform" />
                <audio
                    class="w100p"
                    controls preload="none"
                    :src="audioUrl('audio_en', row.audio_key)"
                    :ref="(el) => setEnAudioRef(row.audio_key, el)"
                    @pause="onTrackPaused(row, 'en')"
                    @ended="onTrackPaused(row, 'en')"
                />
              </div>

              <Button
                  class="play-both-btn"
                  :class="{ playing: dualPlayingRows.has(row.audio_key) }"
                  size="small"
                  label="Play both"
                  :icon="dualLoadingRows.has(row.audio_key) ? 'pi pi-spin pi-spinner' : (dualPlayingRows.has(row.audio_key) ? 'pi pi-pause' : 'pi pi-play')"
                  :disabled="!hasRuTake(row)"
                  :title="hasRuTake(row) ? 'Play EN and RU together, from the start' : 'No RU take yet -- nothing to compare'"
                  @click="playBoth(row)"
              />

              <div class="vo-dub-player">
                <WaveformCanvas v-if="hasRuTake(row)" :src="audioUrl('audio_ru', row.audio_key, cacheBust[row.audio_key])" class="vo-dub-waveform" />
                <audio
                    class="w100p"
                    v-if="hasRuTake(row)"
                    controls preload="none" crossorigin="anonymous"
                    :src="audioUrl('audio_ru', row.audio_key, cacheBust[row.audio_key])"
                    :ref="(el) => setRuAudioRef(row, el)"
                    @loadedmetadata="onRuMetadata(row, $event)"
                    @pause="onTrackPaused(row, 'ru')"
                    @ended="onTrackPaused(row, 'ru')"
                />
                <span v-else class="vo-dub-no-take">not rendered yet</span>
              </div>
            </div>

            <div class="vo-dub-players-footer">
              <Button
                  v-if="props.renderApi"
                  class="vo-dub-render-btn"
                  :class="{ stale: row.status === 'stale' }"
                  text
                  size="small"
                  :label="hasRuTake(row) ? 'Re-render' : 'Render'"
                  :icon="renderingKeys.has(row.audio_key) ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
                  :disabled="renderingKeys.has(row.audio_key)"
                  :title="hasRuTake(row) ? 'Re-render this row' : 'Render this row'"
                  @click="renderRow(row)"
              />
              <Button
                  icon="pi pi-history"
                  size="small"
                  text
                  :label="historyCounts[row.audio_key] ? String(historyCounts[row.audio_key]) : ''"
                  title="Line history (previous takes/versions)"
                  @click="openLineHistory(row)"
              />
              <Button
                  icon="pi pi-cog"
                  size="small"
                  text
                  title="Edit output settings"
                  @click="openOutputDialog(row)"
              />
            </div>
          </div>

          <LineRowEditor :row="row">
            <template #leading>
              <span
                  class="vo-dub-identifier"
                  title="Identifier extracted from the game's own resources (vo_dataset.csv's speaker column)"
              >{{ row.speaker_tag || "—" }}</span>
              <Button
                  icon="pi pi-copy"
                  size="small"
                  text
                  class="apply-role-btn"
                  :disabled="sameIdentifierCount(row) === 0"
                  :title="applyRoleTitle(row)"
                  @click="applyRoleToSameIdentifier(row)"
              />
            </template>

            <template #trailing>
              <label
                  class="vo-dub-use-original-label"
                  title="Use this row's own EN take as the voice-cloning sample for its next render."
              >
                <Checkbox
                    :model-value="resolvedUseOriginal(row)"
                    binary
                    @update:model-value="onToggleRowUseOriginal(row, $event)"
                />
                🎙️ Original
              </label>
            </template>

            <template #above-text>
              <div class="vo-dub-english">{{ row.english }}</div>
            </template>
          </LineRowEditor>
        </template>
      </div>

      <div v-if="!visibleRows.length" class="vo-dub-empty">No rows match this filter.</div>
    </div>
  </div>

  <InstructPickerDialog
      v-model:visible="instructPickerVisible"
      :categories="instructCategories"
      @select="onInstructPicked"
  />

  <LineHistoryDialog
      v-model:visible="historyVisible"
      :versions="historyVersions"
      :chosen-version="historyChosenVersion"
      :original="historyRow?.english || ''"
      :root="props.root"
      :audio-key="historyRow?.audio_key || ''"
      @select="onHistoryVersionChosen"
  />

  <RoleInfoPopover
      :visible="roleInfoPopover.visible" :left="roleInfoPopover.left" :top="roleInfoPopover.top"
      :message="roleInfoFields.message" :fields="roleInfoFields.fields"
  />

  <OutputFileDialog
      v-model:visible="outputDialogVisible"
      :audioKey="dialogRow?.audio_key"
      :effect="dialogRow ? effectValue(dialogRow) : ''"
      :normalize-db="dialogRow ? (entryFor(dialogRow).normalize_db ?? -20.0) : -20.0"
      :speed-match="dialogRow ? speedMatchValue(dialogRow) : false"
      :enDurationS="dialogRow ? dialogRow.duration_s : null"
      :ruDurationS="dialogRow ? (measuredDuration[dialogRow.audio_key] ?? dialogRow.rendered_duration_s) : null"
      @apply="onDialogApply"
  />
</template>

<style scoped src="../style/VoDubLineEditor.css"></style>