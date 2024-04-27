<template>
  <div class="box-border w-full p-2 rounded border-normal">
    <div class="space-x-1">
      <el-check-tag :checked="editor.isActive('bold')" @change="editor.chain().focus().toggleBold().run()">
        <el-icon class="i-tabler:bold" />
      </el-check-tag>
      <el-check-tag :checked="editor.isActive('italic')" @change="editor.chain().focus().toggleItalic().run()">
        <el-icon class="i-tabler:italic" />
      </el-check-tag>
      <el-check-tag :checked="editor.isActive('underline')" @change="editor.chain().focus().toggleUnderline().run()">
        <el-icon class="i-tabler:underline" />
      </el-check-tag>
      <el-check-tag :checked="editor.isActive('bulletList')" @change="editor.chain().focus().toggleBulletList().run()">
        <el-icon class="i-tabler:list" />
      </el-check-tag>
      <el-check-tag :checked="editor.isActive('orderedList')" @change="editor.chain().focus().toggleOrderedList().run()">
        <el-icon class="i-tabler:list-numbers" />
      </el-check-tag>
      <el-check-tag :checked="editor.isActive('heading', { level: 1 })" @change="editor.chain().focus().toggleHeading({ level: 1 }).run()">
        <el-icon class="i-tabler:h-1" />
      </el-check-tag>
      <el-check-tag :checked="editor.isActive('heading', { level: 2 })" @change="editor.chain().focus().toggleHeading({ level: 2 }).run()">
        <el-icon class="i-tabler:h-2" />
      </el-check-tag>
      <el-check-tag :checked="editor.isActive('heading', { level: 3 })" @change="editor.chain().focus().toggleHeading({ level: 3 }).run()">
        <el-icon class="i-tabler:h-3" />
      </el-check-tag>
    </div>
    <el-scrollbar height="200px">
      <client-only>
        <EditorContent
          :editor="editor"
          class="h-full min-h-8 px-2"
        />
      </client-only>
    </el-scrollbar>
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
  content: JSON.parse(content.value ?? '{}'),
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

function resetEditor() {
  editor.commands.clearContent(true);
}

defineExpose({ resetEditor });
onUnmounted(() => editor.destroy());
</script>
