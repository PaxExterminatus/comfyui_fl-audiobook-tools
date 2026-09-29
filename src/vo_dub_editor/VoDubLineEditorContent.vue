<script setup>
/*
 Full-screen-ish editor for one episode bucket of a VO dub project (see
 nodes/vo_dub_library.py's module docstring). Deliberately NOT
 LineEditorApp.vue with a few fields swapped: there's no position/hash
 filename scheme here (see that module's docstring), no merge/split/
 pause (rows never restructure), and no "stitch into one track" step --
 a row's own rendered take already IS the deliverable. What DOES carry
 over: the debounced-save-to-one-JSON-file pattern (closer to
 RolesEditorApp.vue's own _roles.json save loop than to LineEditorApp's
 per-script save), and lineHash() for the same content-fingerprint
 scheme (see src/shared/line_hash.js).

 The 🔁 render button queues the SAME graph a normal Run would (see
 web/vo_dub_library.js's queueVoDubRender, a close mirror of
 web/script_library.js's own per-line queueLineRevoice), with the VO Dub
 Library node's line_override forced to this row's resolved
 "speaker | instruct | text", Audio Post-Process's output_path_override
 forced to audio_ru\<audio_key>.wav, and its effect_override forced to
 this row's chosen Effect (e.g. "radio") -- see
 nodes/audio_post_process.py's own tooltips for both inputs.

 Логика вынесена в composables/* — этот файл только оркестратор.
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
import { useTextareaAutoGrow } from "../shared/textarea_autogrow.js";
import { insertStressMark } from "../shared/stress_mark.js";

// ── composables ────────────────────────────────────────────────────────
import { useVoDubState } from "./composables/useVoDubState.js";
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

// ── UI-хуки (не переносятся — вызываются в setup-scope) ────────────────
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

// ── шаренные структуры между composables ───────────────────────────────
// effectPreviews — Map<audio_key, {setEffect}>. Пишется в Players
// (setRuAudioRef), читается в Effects (onEffectPicked). Должна жить в main.
const effectPreviews = new Map();

// ── локальное UI-состояние ─────────────────────────────────────────────
const visible = ref(true);
let closed = false;

// ── ctx: то, что нужно всем composables ────────────────────────────────
const ctx = {
  props,
  effectPreviews,
  autoGrow,
  setTextareaRef,
  fontSizePx,
};

// ── порядок вызовов: базовые → производные ─────────────────────────────
// useVoDubEffects и useVoDubPlayers используют late-bind на ctx.hasRuTake,
// ctx.currentContentHash, ctx.finalizeRuTake — потому что Render идёт
// позже. useVoDubRender использует late-bind на ctx.commitEffect, ctx.audioUrl,
// ctx.ruFilePath, ctx.dryFilePath, ctx.rawAudioPath — потому что они из
// Effects и Players. Симметричный late-bind — цикла нет.
Object.assign(ctx, useVoDubState(ctx));
Object.assign(ctx, useVoDubHistory(ctx));
Object.assign(ctx, useVoDubRoles(ctx));
Object.assign(ctx, useVoDubInstruct(ctx));
Object.assign(ctx, useVoDubEffects(ctx));
Object.assign(ctx, useVoDubPlayers(ctx));
Object.assign(ctx, useVoDubRender(ctx));
useVoDubRowApi(ctx);

// ── деструктуринг всего, что нужно шаблону ─────────────────────────────
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
  instructNoteFor, sameRoleCount, applyInstructTitle, applyInstructToSameRole,

  // effects
  effectValue,
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
  measuredDuration, onRuMetadata, durationBadge, enDurationText,
  resolvedUseOriginal, onToggleRowUseOriginal, onToggleUseOriginalDefault,
} = ctx;

// ── close ──────────────────────────────────────────────────────────────
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

// ── lifecycle ──────────────────────────────────────────────────────────
onMounted(async () => {
  loadRoleEntries();
  loadInstructCategories();
  refreshHistoryCounts();
  await loadState();
  await loadRows();
});
</script>

<template>
  <div class="fl-vo-dub-line-editor-content">
    <DialogHeader
        :title="`VO Dub — ${bucket}`"
        :width-presets="widthPresets" :set-width="setPanelWidth"
        :font-size-decrease="decreaseFontSize" :font-size-increase="increaseFontSize"
    />

    <!-- One StickyPanel, three stacked rows -- position:sticky's own
    top:0 means a SECOND sticky element right after this one would
    overlap it instead of stacking below (both stick to the same
    offset), so the actions row and pager both live inside this same
    sticky block rather than their own. Same 3-row split as
    LineEditorApp.vue's own audio-content-row/actions-row/(file nav is
    folded into actions-row there) -- filters here, then actions, then
    the pager -- rather than cramming everything into one row that
    wraps unpredictably at typical panel widths. -->
    <StickyPanel class="vo-dub-editor-controls">
      <div class="vo-dub-filters">
        <InputText v-model="searchText" placeholder="Search text or audio_key..." class="vo-dub-search" />
        <Dropdown
            v-model="statusFilter"
            :options="STATUS_FILTER_OPTIONS"
            option-label="label"
            option-value="value"
            class="vo-dub-status-filter"
        />
        <Button icon="pi pi-refresh" text size="small" title="Re-scan this bucket" @click="loadRows" />
        <span class="vo-dub-editor-status">{{ loading ? "Loading..." : status }}</span>
        <Button icon="pi pi-times" text size="small" title="Close" @click="visible = false" />
      </div>
      <div class="actions-row">
        <Button label="´ Stress mark" text size="small" title="Insert a stress mark at the cursor: click into a row's text, place the cursor right after the vowel to stress (факел|ов), then click this" @mousedown.prevent="insertStressMark(setStatus)" />
        <span class="actions-divider" />
        <Button
            :label="sequentialPlayingKey ? 'Stop' : '▶ Play in order'"
            text size="small"
            :icon="sequentialPlayingKey ? 'pi pi-stop-circle' : 'pi pi-play'"
            title="Play through this page's RU takes in order, auto-advancing to the next row with a take when each one ends -- mirrors LineEditorApp.vue's own sequential playback. Pausing a row via its own native controls stops the run instead of continuing past it."
            @click="toggleSequentialPlayback"
        />
        <Button
            :label="isRenderingAllPending ? 'Rendering...' : '🔁 Render pending'"
            text size="small"
            :icon="isRenderingAllPending ? 'pi pi-spin pi-spinner' : 'pi pi-play'"
            :disabled="!props.renderApi || isRenderingAllPending"
            title="Render every not-started or stale row in this WHOLE bucket (not just this page), one at a time -- mirrors ScriptLibraryPanel.vue's own '🔁 Re-voice pending' button."
            @click="renderAllPending"
        />
        <span class="actions-divider" />
        <label class="vo-dub-original-default-label" title="Project-wide default for the per-row 'Use original as sample' checkbox below each line -- a row that has ticked/unticked its OWN checkbox always keeps that explicit choice regardless of this default.">
          <Checkbox v-model="useOriginalDefault" binary @change="onToggleUseOriginalDefault" />
          Use original as sample by default
        </label>
      </div>
      <div class="vo-dub-pager">
        <Button label="◀ Prev" text size="small" :disabled="currentPage === 0" title="Previous page" @click="currentPage--" />
        <span class="vo-dub-pager-label">Page {{ currentPage + 1 }} / {{ pageCount }} ({{ visibleRows.length }} row(s))</span>
        <Button label="Next ▶" text size="small" :disabled="currentPage >= pageCount - 1" title="Next page" @click="currentPage++" />
      </div>
    </StickyPanel>

    <div class="vo-dub-rows" :style="{ fontSize: `${fontSizePx}px` }">
      <div
          v-for="row in pagedRows" :key="row.audio_key"
          class="vo-dub-row"
          :class="{ 'row-playing': sequentialPlayingKey === row.audio_key }"
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
              title="Manually treat this row as done even if its content has drifted since the last render -- sticky until you click it again to unmark it. Doesn't touch the file or the render hash, only how this row's status reads."
              @click="toggleManuallyDone(row)"
          />
        </div>

        <!-- Multi-channel rows (3/4ch, split into .a-.d segment files --
        see nodes/vo_dub_library.py's SUPPORTED_CHANNELS) have no flat
        "<audio_key>.wav" to play OR write: this addon can only ever
        produce/serve a single mono or stereo file. Neither player nor
        the render button would do anything but fail confusingly, so
        this row gets an explanation instead of a silently broken UI. -->
        <div v-if="row.status === 'unsupported'" class="vo-dub-unsupported-note">
          Unsupported: {{ row.channels }}-channel audio split across multiple files
          (<code>.a</code>-<code>.d</code>) -- this editor can only play or render a single mono/stereo
          file per row. Handle this one outside the tool.
        </div>
        <template v-else>
          <div class="vo-dub-players">
            <!-- ONE left-aligned line: "EN 0.4s vs 0.4s RU -57%" --
            not split across the row (tried, rejected: see the plan
            file's progress notes). -->
            <div class="vo-dub-players-labels">
              <span class="vo-dub-duration-en-tag">{{ enDurationText(row) }}</span>
              <template v-if="durationBadge(row)">
                <span class="vo-dub-duration-vs">vs</span>
                <span :class="['vo-dub-duration-tag', `badge-${durationBadge(row).level}`]">{{ durationBadge(row).ruSeconds }} RU</span>
                <span :class="['vo-dub-duration-delta', `badge-${durationBadge(row).level}`]">{{ durationBadge(row).pctText }}</span>
              </template>
            </div>

            <div class="vo-dub-players-row">
              <div class="vo-dub-player">
                <!-- Purely visual overview above the native
                player -- decodes+draws eagerly on mount (the
                one deliberate exception to "fetch nothing
                until played"); the native element below stays
                preload="none" regardless, so ACTUAL playback
                is still fully lazy. guardAgainstUnbufferedPlay
                (see setEnAudioRef) protects the native play
                button from clipping the first fraction of a
                second once pressed. -->
                <WaveformCanvas :src="audioUrl('audio_en', row.audio_key)" class="vo-dub-waveform" />
                <audio
                    controls preload="none"
                    :src="audioUrl('audio_en', row.audio_key)"
                    :ref="(el) => setEnAudioRef(row.audio_key, el)"
                    @pause="onTrackPaused(row, 'en')"
                    @ended="onTrackPaused(row, 'en')"
                />
              </div>

              <!-- The one genuinely new command neither native
              player offers on its own (see playBoth's own
              comment) -- not a re-skin of play/pause/seek,
              which stay exactly what the native controls already
              provide. Centered between the two players, not
              grouped with Render/Effect below -- those two are
              about the FILE, this one's about listening to it. -->
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
                <!-- crossorigin is REQUIRED on this element, unlike
                the EN player above: this is the one wrapped in
                createMediaElementSource (setRuAudioRef ->
                createEffectPreview). The file is served from the
                BACKEND's origin (127.0.0.1:8765), never the UI's
                (localhost:5199/5173), so without this attribute the
                browser fetches it no-cors, the stream is opaque, and
                the MediaElementAudioSourceNode outputs SILENCE --
                while the element still reports a duration and
                advances currentTime, so it looks like it is playing
                fine. The backend already answers with
                Access-Control-Allow-Origin: *, so "anonymous"
                resolves cleanly. -->
                <audio
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

            <!-- Render/Re-render and Effect (+ its Save button, once
            dirty) on their own row, left-aligned -- both act on the
            FILE this row writes, distinct from Play both above
            (which only ever plays what's already there). -->
            <div class="vo-dub-players-footer">
              <Button
                  v-if="props.renderApi"
                  class="vo-dub-render-btn"
                  :class="{ stale: row.status === 'stale' }"
                  size="small"
                  :label="hasRuTake(row) ? 'Re-render' : 'Render'"
                  :icon="renderingKeys.has(row.audio_key) ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
                  :disabled="renderingKeys.has(row.audio_key)"
                  :title="hasRuTake(row) ? 'Re-render this row and write it to audio_ru\\' : 'Render this row and write it to audio_ru\\'"
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
                  title="Edit output settings"
                  @click="openOutputDialog(row)"
                  class="output-settings-btn"
              />

              <!-- Effect dropdown and save button removed; editing via OutputFileDialog -->

            </div>
          </div>

          <LineRowEditor :row="row">
            <template #leading>
                        <span
                            class="vo-dub-identifier"
                            title="Identifier extracted from the game's own resources (vo_dataset.csv's speaker column) -- not necessarily a real role, just the raw signal this row's audio_key carried"
                        >{{ row.speaker_tag || "—" }}</span>
              <Button
                  icon="pi pi-copy"
                  size="small"
                  class="apply-role-btn"
                  :disabled="sameIdentifierCount(row) === 0"
                  :title="applyRoleTitle(row)"
                  @click="applyRoleToSameIdentifier(row)"
              />
              <label
                  class="vo-dub-use-original-label"
                  title="Use this row's own EN reference take (audio_en\) as the TTS voice-cloning sample for its NEXT render, instead of the Role above -- unticked follows the project-wide default checkbox in the toolbar unless this row's own box has been explicitly touched. Whether an instruct style can still apply together with this depends on your ComfyUI graph/model -- this addon just passes the resolved reference_audio_path through, it doesn't wire it to a specific node."
              >
                <Checkbox
                    :model-value="resolvedUseOriginal(row)"
                    binary
                    @update:model-value="onToggleRowUseOriginal(row, $event)"
                />
                🎙️ Original as sample
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
      @select="onHistoryVersionChosen"
  />

  <RoleInfoPopover
      :visible="roleInfoPopover.visible" :left="roleInfoPopover.left" :top="roleInfoPopover.top"
      :message="roleInfoFields.message" :fields="roleInfoFields.fields"
  />
  <!-- OutputFileDialog for editing effect, normalize, speed -->
  <OutputFileDialog
      v-model:visible="outputDialogVisible"
      :audioKey="dialogRow?.audio_key"
      :effect="dialogRow ? effectValue(dialogRow) : ''"
      :normalize="dialogRow ? entryFor(dialogRow).normalize : false"
      :speed="dialogRow ? entryFor(dialogRow).speed : 1.0"
      :enDurationS="dialogRow ? dialogRow.duration_s : null"
      :ruDurationS="dialogRow ? (measuredDuration[dialogRow.audio_key] ?? dialogRow.rendered_duration_s) : null"
      @apply="onDialogApply"
  />
</template>

<style scoped src="../style/VoDubLineEditor.css"></style>
