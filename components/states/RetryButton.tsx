import { PrimaryButton } from "@/components/physica-ui";

export function RetryButton({
  label = "Try again",
  onPress,
  busy = false,
  disabled = false,
}: {
  label?: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <PrimaryButton
      label={busy ? "Working…" : label}
      onPress={onPress}
      disabled={busy || disabled}
    />
  );
}
