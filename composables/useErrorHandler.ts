export async function useErrorHandler(err: unknown): Promise<void>;
export async function useErrorHandler(err: unknown[]): Promise<void>;
export async function useErrorHandler(err: unknown | unknown[]): Promise<void> {
  if (Array.isArray(err)) {
    for (const error of err)
      await _handleError(toValue(error));
  } else {
    await _handleError(toValue(err));
  }
}

async function _handleError(err: unknown): Promise<void> {
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
