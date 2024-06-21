<template>
  <div class="box-border w-full p-3 rounded border-normal">
    <el-scrollbar>
      <div class="whitespace-nowrap pb-1 space-x-1">
        <el-check-tag :checked="editor.isActive('bold')" @change="editor.chain().focus().toggleBold().run()">
          <el-icon class="i-tabler:bold" />
        </el-check-tag>
        <el-check-tag :checked="editor.isActive('italic')" @change="editor.chain().focus().toggleItalic().run()">
          <el-icon class="i-tabler:italic" />
        </el-check-tag>
        <el-check-tag :checked="editor.isActive('underline')" @change="editor.chain().focus().toggleUnderline().run()">
          <el-icon class="i-tabler:underline" />
        </el-check-tag>
        <el-check-tag :checked="editor.isActive('bulletList')" type="success" @change="editor.chain().focus().toggleBulletList().run()">
          <el-icon class="i-tabler:list" />
        </el-check-tag>
        <el-check-tag :checked="editor.isActive('orderedList')" type="success" @change="editor.chain().focus().toggleOrderedList().run()">
          <el-icon class="i-tabler:list-numbers" />
        </el-check-tag>
        <el-check-tag :checked="editor.isActive('heading', { level: 1 })" type="danger" @change="editor.chain().focus().toggleHeading({ level: 1 }).run()">
          <el-icon class="i-tabler:h-1" />
        </el-check-tag>
        <el-check-tag :checked="editor.isActive('heading', { level: 2 })" type="danger" @change="editor.chain().focus().toggleHeading({ level: 2 }).run()">
          <el-icon class="i-tabler:h-2" />
        </el-check-tag>
        <el-check-tag :checked="editor.isActive('heading', { level: 3 })" type="danger" @change="editor.chain().focus().toggleHeading({ level: 3 }).run()">
          <el-icon class="i-tabler:h-3" />
        </el-check-tag>
        <el-check-tag :checked="editor.isActive('highlight')" type="warning" @change="editor.chain().focus().toggleHighlight().run()">
          <el-icon class="i-tabler:highlight" />
        </el-check-tag>
      </div>
    </el-scrollbar>
    <div class="h-40">
      <EditorContent
        :editor="editor"
        class="box-border h-full min-h-8 px-1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { Editor, EditorContent } from './vue';
import { tipTapExtensions } from './extensions';

const props = defineProps<{
  modelValue: string | null | undefined;
  class?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value?: string | null): void;
}>();

const content = useVModel(props, 'modelValue', emit);

const editor = new Editor({
  content: content.value ? JSON.parse(content.value) : undefined,
  extensions: tipTapExtensions,
  editorProps: {
    attributes: {
      class: `max-h-full w-full overflow-y-auto focus:outline-none p-0 h-full`,
    },
  },
  onUpdate: () => {
    emit('update:modelValue', JSON.stringify(editor.getJSON()));
  },
});

watch(() => props.modelValue, (v) => {
  editor.commands.setContent(v ? JSON.parse(v) : undefined);
});

function resetEditor() {
  editor.commands.clearContent(true);
}

defineExpose({ resetEditor });
onUnmounted(() => editor.destroy());
</script>
