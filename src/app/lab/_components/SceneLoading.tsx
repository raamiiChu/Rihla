/**
 * Placeholder shown while a unit's Scene chunk is loading.
 * Pass it to `dynamic(..., { loading: SceneLoading })`.
 */
const SceneLoading = () => (
  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
    載入中…
  </div>
);

export default SceneLoading;
