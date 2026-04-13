// Stub for @tauri-apps/api/event — used in web preview where Tauri is unavailable.
export async function listen(): Promise<() => void> {
  return () => {};
}

export async function emit(): Promise<void> {}
