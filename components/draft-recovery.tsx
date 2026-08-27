import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Card, PrimaryButton, SecondaryButton } from "@/components/physica-ui";
import { deleteDraft, loadDraftWithStatus, type SessionDraft } from "@/lib/progress-store";
import { persistSafely, persistenceRecoveryMessageKey } from "@/lib/persistence";
import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";

export function DraftRecovery({ id, onResume }: { id: string; onResume: (draft: SessionDraft<Record<string, unknown>>) => void }) {
  const colors = useColors();
  const { tr } = useAppTranslations();
  const localizedPersistenceMessage = (result: Parameters<typeof persistenceRecoveryMessageKey>[0]) => { const key = persistenceRecoveryMessageKey(result); return key ? tr(key) : null; };
  const [draft, setDraft] = useState<SessionDraft<Record<string, unknown>> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => { let active = true; setLoadFailed(false); setErrorMessage(null); void loadDraftWithStatus<Record<string, unknown>>(id).then((result) => { if (!active) return; setDraft(result.draft); setLoadFailed(result.recovered); }).catch(() => { if (active) setLoadFailed(true); }); return () => { active = false; }; }, [id]);
  if (loadFailed) return <Card style={{ marginBottom: 12, backgroundColor: colors.warning + "12" }}><Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, lineHeight: 20 }}>{tr("draft.loadRecovered")}</Text></Card>;
  if (!draft) return null;
  return <Card style={{ marginBottom: 12, backgroundColor: colors.primary + "10" }}><Text style={{ color: colors.primary, fontWeight: "800" }}>{tr("draft.resumeTitle")}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 19 }}>{tr("draft.available", { id })}</Text><View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}><View style={{ flex: 1 }}><PrimaryButton label={tr("draft.resume")} onPress={() => onResume(draft)} /></View><View style={{ flex: 1 }}><SecondaryButton label={tr("draft.discard")} onPress={() => { void persistSafely(deleteDraft(id)).then((result) => { const message = localizedPersistenceMessage(result); setErrorMessage(message); if (!message) { setDraft(null); setErrorMessage(tr("draft.discarded")); } }); }} /></View></View>{errorMessage && <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 10 }}>{errorMessage}</Text>}</Card>;
}
