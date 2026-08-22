import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Card, PrimaryButton, SecondaryButton } from "@/components/physica-ui";
import { deleteDraft, loadDraft, type SessionDraft } from "@/lib/progress-store";
import { persistSafely, persistenceRecoveryMessage } from "@/lib/persistence";
import { useColors } from "@/hooks/use-colors";

export function DraftRecovery({ id, onResume }: { id: string; onResume: (draft: SessionDraft<Record<string, unknown>>) => void }) {
  const colors = useColors();
  const [draft, setDraft] = useState<SessionDraft<Record<string, unknown>> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => { void loadDraft<Record<string, unknown>>(id).then(setDraft); }, [id]);
  if (!draft) return null;
  return <Card style={{ marginBottom: 12, backgroundColor: colors.primary + "10" }}><Text style={{ color: colors.primary, fontWeight: "800" }}>Resume where you left off?</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 19 }}>A saved {id} session is available from {new Date(draft.updatedAt).toLocaleTimeString()}.</Text><View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}><View style={{ flex: 1 }}><PrimaryButton label="Resume" onPress={() => onResume(draft)} /></View><View style={{ flex: 1 }}><SecondaryButton label="Discard" onPress={() => { void persistSafely(deleteDraft(id)).then((result) => { const message = persistenceRecoveryMessage(result); setErrorMessage(message); if (!message) setDraft(null); }); }} /></View></View>{errorMessage && <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 10 }}>{errorMessage}</Text>}</Card>;
}
