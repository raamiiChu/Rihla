import { useLabUi } from "../_i18n";

/**
 * Placeholder shown while a unit's Scene chunk is loading.
 * Pass it to `dynamic(..., { loading: SceneLoading })`.
 */
const SceneLoading = () => {
  const ui = useLabUi();

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {ui.loading}
    </div>
  );
};

export default SceneLoading;
