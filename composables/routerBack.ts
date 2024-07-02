/**
 * Helper function to use router.back() only when there is somewhere to go back.
 * This prevents navigating to browser homepage.
 * @param path The path to navigate to when nowhere to go back. Default to `/`.
 */
export function useRouterBack(path: string = '/') {
  const router = useRouter();
  if (router.options.history.state.back) {
    router.back();
  } else {
    navigateTo(path);
  }
}
