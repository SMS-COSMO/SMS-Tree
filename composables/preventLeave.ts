export function usePreventLeave(form: any) {
  let changed = false;
  watch(form, () => changed = true);

  onMounted(() => {
    window.onbeforeunload = () => {
      if (changed)
        return 'Are you sure you want to lose unsaved changes?';
    };
  });

  onBeforeUnmount(() => {
    window.onbeforeunload = () => {};
  });

  onBeforeRouteLeave(async () => {
    if (changed) {
      try {
        await ElMessageBox.confirm(
          '修改未提交，确定要离开吗？',
          { type: 'warning' },
        );
        return true;
      } catch (err) {
        return false;
      }
    }
  });
}
