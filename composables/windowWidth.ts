export function useWindowWidth() {
  const isSmallScreen = ref(false);
  onMounted(() => {
    isSmallScreen.value = window.outerWidth <= 700;
  });

  return isSmallScreen;
}
