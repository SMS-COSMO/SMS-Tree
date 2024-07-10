export function usePreventLeave(form: any) {
  const changed = ref(false);
  const hasReset = ref(false);
  watch(form, () => changed.value = true);

  onMounted(() => {
    window.onbeforeunload = () => {
      if (!hasReset.value && changed.value)
        return 'Are you sure you want to lose unsaved changes?';
    };
  });

  onBeforeUnmount(() => {
    window.onbeforeunload = () => {};
  });

  onBeforeRouteUpdate(async () => {
    if (!hasReset.value && changed.value) {
      try {
        await ElMessageBox.confirm(
          '修改未提交，确定要离开吗？',
          { type: 'warning' },
        );
        return true;
      } catch {
        return false;
      }
    }
  });

  function reset() {
    hasReset.value = true;
  };

  return { reset };
}
