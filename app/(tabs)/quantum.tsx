import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { Card, Pill, SectionHeader } from "@/components/physica-ui";
import { useColors } from "@/hooks/use-colors";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { formatScientific, formatNumber } from "@/lib/locale";
import { loadQuantumCatalog, photonEnergy, photonFrequency, matterWave, minimumMomentumUncertainty, qubitProbabilities, blochCoordinates, tunnelingProbability, hydrogenTransitionEnergyEV, transitionWavelengthNm, type QuantumCatalog } from "@/lib/quantum";
import { FALLBACK_ADVANCED_PHYSICS_CATALOG, hydrogenicTransitionEnergyEV, spectralWavelengthNm, vibrationalEnergyJ, radioactiveRemaining, braggAngleRad } from "@/lib/advanced-physics";
import { FALLBACK_DOMAIN_CATALOG, STANDARD_MODEL_PARTICLES, diffusionRmsDistanceM, ohmsLawCurrentA, photonMomentumKgMps, restEnergyJ, thinLensImageDistanceM } from "@/lib/physics-domains";

const FALLBACK_WAVELENGTH_M = 500e-9;
const FALLBACK_QUANTUM_CATALOG: QuantumCatalog = { concepts: [] };

export default function QuantumScreen() {
  const colors = useColors();
  const { locale, tr } = useAppTranslations();
  const [catalog, setCatalog] = useState<QuantumCatalog>(FALLBACK_QUANTUM_CATALOG);
  const [usedFallback, setUsedFallback] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState("photon-energy");

  useEffect(() => {
    let active = true;
    void loadQuantumCatalog().then((result) => {
      if (!active) return;
      setCatalog(result.catalog);
      setUsedFallback(result.usedFallback);
      setLoadFailed(false);
    }).catch(() => {
      if (!active) return;
      setCatalog(FALLBACK_QUANTUM_CATALOG);
      setUsedFallback(true);
      setLoadFailed(true);
    });
    return () => { active = false; };
  }, []);

  const calculations = useMemo(() => {
    try {
      const photonJ = photonEnergy(FALLBACK_WAVELENGTH_M);
      const wave = matterWave(9.1093837e-31, 1e6);
      const uncertainty = minimumMomentumUncertainty(1e-10);
      const qubit = qubitProbabilities({ alpha: { real: 1, imaginary: 0 }, beta: { real: 1, imaginary: 0 } });
      const bloch = blochCoordinates({ alpha: { real: 1, imaginary: 0 }, beta: { real: 1, imaginary: 0 } });
      const tunneling = tunnelingProbability(1e-19, 5e-20, 1e-10);
      const transitionEV = hydrogenTransitionEnergyEV(1, 3, 2);
      return { photonJ, frequency: photonFrequency(FALLBACK_WAVELENGTH_M), wave, uncertainty, qubit, bloch, tunneling, transitionEV, wavelengthNm: transitionWavelengthNm(transitionEV) };
    } catch {
      return null;
    }
  }, []);

  const advanced = useMemo(() => {
    try {
      return {
        atomic: `${formatNumber(hydrogenicTransitionEnergyEV(1, 3, 2), locale)} eV · ${formatNumber(spectralWavelengthNm(hydrogenicTransitionEnergyEV(1, 3, 2)), locale)} nm`,
        molecular: `${formatScientific(vibrationalEnergyJ(0, 5e14), locale)} J zero-point energy`,
        nuclear: `${formatNumber(radioactiveRemaining(1, 10, 3), locale)} of the initial sample remains`,
        condensed: `${formatNumber(braggAngleRad(1e-10, 2e-10) * 180 / Math.PI, locale)}° first-order Bragg angle`,
      };
    } catch {
      return null;
    }
  }, [locale]);

  const conceptLabel = (id: string) => id === "photon-energy" ? tr("quantum.photon") : id === "matter-waves" ? tr("quantum.matterWave") : id === "uncertainty" ? tr("quantum.uncertainty") : id === "qubit" ? tr("quantum.qubit") : id === "tunneling" ? tr("quantum.tunneling") : tr("quantum.spectrum");
  const domainResults = useMemo(() => { try { return { particle: tr("domains.particleResult", { value: formatScientific(restEnergyJ(9.1093837e-31), locale) }), optics: tr("domains.opticsResult", { value: formatNumber(thinLensImageDistanceM(1, 2), locale) }), lightMatter: `${tr("domains.lightMatter")}: ${formatScientific(photonMomentumKgMps(500e-9), locale)} kg·m/s photon momentum`, electronics: tr("domains.electronicsResult", { value: formatNumber(ohmsLawCurrentA(12, 6), locale) }), biophysics: tr("domains.biophysicsResult", { value: formatScientific(diffusionRmsDistanceM(1e-9, 2), locale) }) }; } catch { return null; } }, [locale, tr]);
  const domainTitle = (id: string) => id === "standard-model" ? tr("domains.standardModel") : id === "lenses" ? tr("domains.lenses") : id === "light-matter" ? tr("domains.lightMatter") : id === "circuits" ? tr("domains.circuits") : tr("domains.diffusion");
  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <SectionHeader title={tr("quantum.title")} subtitle={tr("quantum.subtitle")} />
        {(usedFallback || loadFailed) && <Card accessibilityLabel={tr("quantum.fallback")} style={{ marginBottom: 14, backgroundColor: colors.primary + "0D" }}><Text accessibilityLiveRegion={loadFailed ? "assertive" : "polite"} style={{ color: loadFailed ? colors.warning : colors.primary, lineHeight: 21 }}>{tr("quantum.fallback")}</Text></Card>}
        <Card accessibilityLabel={tr("quantum.title")}>
          <Pill label={conceptLabel(selectedConcept)} active />
          <View accessibilityRole="tablist" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {catalog.concepts.map((concept) => <Pressable key={concept.id} accessibilityRole="tab" accessibilityState={{ selected: selectedConcept === concept.id }} accessibilityLabel={conceptLabel(concept.id)} onPress={() => setSelectedConcept(concept.id)} style={{ paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: selectedConcept === concept.id ? colors.primary : colors.border }}><Text style={{ color: selectedConcept === concept.id ? colors.background : colors.foreground, fontWeight: "800" }}>{conceptLabel(concept.id)}</Text></Pressable>)}
          </View>
          <Text style={{ marginTop: 16, color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{catalog.concepts.find((concept) => concept.id === selectedConcept)?.description ?? tr("quantum.recovery")}</Text>
          {calculations ? <View accessible accessibilityLabel={`${tr("quantum.energy")}: ${formatScientific(calculations.photonJ, locale)} joules. ${tr("quantum.frequency")}: ${formatScientific(calculations.frequency, locale)} hertz. ${tr("quantum.momentum")}: ${formatScientific(calculations.wave.momentum, locale)} kilogram meters per second. ${tr("quantum.probability")}: ${formatNumber(calculations.qubit.zero, locale)}.`} style={{ marginTop: 14, gap: 7 }}><Text style={{ color: colors.muted }}>{tr("quantum.energy")}: {formatScientific(calculations.photonJ, locale)} J</Text><Text style={{ color: colors.muted }}>{tr("quantum.frequency")}: {formatScientific(calculations.frequency, locale)} Hz</Text><Text style={{ color: colors.muted }}>{tr("quantum.momentum")}: {formatScientific(calculations.wave.momentum, locale)} kg·m/s</Text><Text style={{ color: colors.muted }}>{tr("quantum.uncertainty")}: Δp ≥ {formatScientific(calculations.uncertainty, locale)} kg·m/s</Text><Text style={{ color: colors.muted }}>{tr("quantum.probability")}: |0⟩ {formatNumber(calculations.qubit.zero, locale)} · |1⟩ {formatNumber(calculations.qubit.one, locale)}</Text><Text style={{ color: colors.muted }}>Bloch z: {formatNumber(calculations.bloch.z, locale)} · tunneling: {formatNumber(calculations.tunneling * 100, locale)}%</Text><Text style={{ color: colors.muted }}>{tr("quantum.spectrum")}: {formatNumber(calculations.transitionEV, locale)} eV · {formatNumber(calculations.wavelengthNm, locale)} nm</Text></View> : <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 14 }}>{tr("quantum.recovery")}</Text>}
        </Card>
        <Card accessibilityLabel={tr("advanced.title")} style={{ marginTop: 14 }}>
          <Pill label={tr("advanced.title")} active />
          <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 10 }}>{tr("advanced.subtitle")}</Text>
          {FALLBACK_ADVANCED_PHYSICS_CATALOG.map((item) => <View key={item.id} style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{item.title}</Text><Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>{advanced ? advanced[item.domain === "condensed-matter" ? "condensed" : item.domain] : tr("quantum.recovery")}</Text></View>)}
        </Card>
        <Card accessibilityLabel={tr("domains.title")} style={{ marginTop: 14 }}>
          <SectionHeader title={tr("domains.title")} subtitle={tr("domains.subtitle")} />
          {FALLBACK_DOMAIN_CATALOG.map((item) => <View key={item.id} style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={{ color: colors.foreground, fontWeight: "800" }}>{domainTitle(item.id)}</Text><Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>{domainResults ? domainResults[item.domain === "light-matter" ? "lightMatter" : item.domain] : tr("quantum.recovery")}</Text>{item.domain === "particle" && <Text accessibilityLabel={tr("domains.referenceParticles", { count: STANDARD_MODEL_PARTICLES.length })} style={{ color: colors.muted, marginTop: 3 }}>{tr("domains.referenceParticles", { count: STANDARD_MODEL_PARTICLES.length })}</Text>}</View>)}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
