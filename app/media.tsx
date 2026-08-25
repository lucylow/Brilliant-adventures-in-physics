import { useEffect, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { canUseCamera, pickImageFromLibrary, takePhoto, type MediaAsset, type MediaAdapterResult } from "@/lib/media-adapters";
import { createAppTranslations, translate, type SupportedLocale } from "@/lib/locale";
import { loadPreferencesWithStatus } from "@/lib/preferences";

export default function MediaScreen() {
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [locale, setLocale] = useState<SupportedLocale>("en");
  const copy = createAppTranslations();
  const tr = (key: string) => translate(copy, locale, key); 
  useEffect(() => { let active = true; void loadPreferencesWithStatus().then((result) => { if (active) setLocale(result.preferences.locale); }).catch(() => undefined); return () => { active = false; }; }, []);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const handleResult = (result: MediaAdapterResult<MediaAsset>) => { setStatus(result.message); if (result.ok && result.data) setAsset(result.data); };
  const run = (action: () => Promise<MediaAdapterResult<MediaAsset>>) => { if (busy) return; setBusy(true); setStatus(null); void action().then(handleResult).catch(() => setStatus("Media access failed safely. Your existing study data is unchanged.")).finally(() => setBusy(false)); };
  return <ScreenContainer className="p-5"><SectionHeader title={tr("media.title")} subtitle={tr("media.subtitle")} /><Card><Text style={{ color: "#11181C", fontSize: 18, fontWeight: "800" }}>{tr("media.localObservation")}</Text><Text style={{ color: "#687076", marginTop: 6, lineHeight: 20 }}>Use a photo as evidence for a Physics Lens session. Camera access is requested only when you tap the capture action.</Text><View style={{ marginTop: 14 }}><PrimaryButton label={busy ? "Opening media…" : tr("media.choose")} disabled={busy} onPress={() => run(pickImageFromLibrary)} /></View><View style={{ marginTop: 10 }}><SecondaryButton label={canUseCamera() ? tr("media.take") : tr("media.webUnavailable")} onPress={() => { if (busy) return; if (!canUseCamera()) { setStatus("This browser cannot capture camera photos. Choose an image from the library instead."); return; } run(takePhoto); }} /></View>{Platform.OS === "web" && <Text style={{ color: "#687076", marginTop: 10, lineHeight: 20 }}>This browser build can display selected images, but native camera capture is unavailable here.</Text>}{status && <Text accessibilityLiveRegion="assertive" style={{ color: status.includes("ready") ? "#16A34A" : "#B45309", marginTop: 12, lineHeight: 20 }}>{status}</Text>}{asset && <View style={{ marginTop: 16 }}><Image accessibilityLabel="Selected local observation image" source={{ uri: asset.uri }} style={{ width: "100%", height: 220, borderRadius: 14, backgroundColor: "#E5E7EB" }} /><Text style={{ color: "#687076", marginTop: 8 }}>{tr("media.localOnly")}</Text></View>}</Card></ScreenContainer>;
}
