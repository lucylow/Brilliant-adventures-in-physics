import { useEffect, useState } from "react";
import { Text } from "react-native";
import { getLastSave, getRetryCount, formatLastSave } from "@/lib/retry-queue";
import { useColors } from "@/hooks/use-colors";

export function PersistenceDiagnostics() {
  const colors = useColors();
  const [count, setCount] = useState(0);
  const [lastSave, setLastSave] = useState<string | null>(null);
  useEffect(() => { let active = true; void Promise.all([getRetryCount(), getLastSave()]).then(([nextCount, nextSave]) => { if (active) { setCount(nextCount); setLastSave(nextSave); } }); return () => { active = false; }; }, []);
  return <Text accessibilityRole="text" accessibilityLiveRegion="polite" style={{ color: count ? colors.warning : colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }}>{count ? `${count} offline draft${count === 1 ? "" : "s"} queued for retry. ` : ""}{formatLastSave(lastSave)}</Text>;
}
