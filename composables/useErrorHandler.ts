export async function useErrorHandler(err: unknown) {
  if (useIsTRPCClientError(err)) {
    if (err.data?.zodError) {
      for (const issue of err.data.zodError)
        ElMessage({ message: issue.message, type: 'error', showClose: true });
    } else {
      ElMessage({ message: err.message, type: 'error', showClose: true });
    }
  } else {
    ElMessage({ message: '未知错误', type: 'error', showClose: true });
  }
}
