import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Card, Pill, SectionHeader } from "@/components/physica-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAppTranslations } from "@/hooks/use-app-translations";
import { useColors } from "@/hooks/use-colors";
import { formatNumber, formatScientific } from "@/lib/locale";
import { keplerPeriodYears, loadAstronomyCatalog, peakWavelength, stellarLuminosityRelative, type AstronomyCatalog } from "@/lib/astronomy";
import { FALLBACK_ASTRONOMY_CATALOG } from "@/lib/astronomy";
import { FALLBACK_COSMIC_ERAS, FALLBACK_UNIVERSE, cmbTemperatureAtRedshift, createCosmicTimeState, cosmicEraFromTemperature, calculateLookbackFraction, generateCMBSpectrum, generateLightCone, hubbleParameter, lorentzFactorBeta, redshiftToScaleFactor, spacetimeInterval } from "@/lib/cosmology";

export default function AstronomyScreen() {
  const colors = useColors();
  const { locale, tr } = useAppTranslations();
  const [catalog, setCatalog] = useState<AstronomyCatalog>(FALLBACK_ASTRONOMY_CATALOG);
  const [selectedStarId, setSelectedStarId] = useState("sun");
  const [selectedPlanetId, setSelectedPlanetId] = useState("earth");
  const [usedFallback, setUsedFallback] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void loadAstronomyCatalog().then((result) => {
      if (!active) return;
      setCatalog(result.catalog);
      setUsedFallback(result.usedFallback);
      setLoadFailed(false);
    }).catch(() => {
      if (!active) return;
      setCatalog(FALLBACK_ASTRONOMY_CATALOG);
      setUsedFallback(true);
      setLoadFailed(true);
    });
    return () => { active = false; };
  }, []);

  const star = useMemo(() => catalog.stars.find((item) => item.id === selectedStarId) ?? catalog.stars[0] ?? FALLBACK_ASTRONOMY_CATALOG.stars[0], [catalog.stars, selectedStarId]);
  const planet = useMemo(() => catalog.planets.find((item) => item.id === selectedPlanetId) ?? catalog.planets[0] ?? FALLBACK_ASTRONOMY_CATALOG.planets[0], [catalog.planets, selectedPlanetId]);
  const luminosity = stellarLuminosityRelative(star.radiusSolar, star.temperatureK);
  const wavelengthNm = peakWavelength(star.temperatureK) * 1e9;
  const orbitalYears = keplerPeriodYears(planet.orbitAU);
  const gravity = planet.gravityMS2;
  const number = (value: number) => formatNumber(value, locale);
  const [redshift, setRedshift] = useState(0.5);
  const [cosmicAgeGyr, setCosmicAgeGyr] = useState(13.8);
  const [beta, setBeta] = useState(0.5);
  const cosmology = useMemo(() => {
    try {
      return { scaleFactor: redshiftToScaleFactor(redshift), cmbTemperature: cmbTemperatureAtRedshift(redshift), hubbleRate: hubbleParameter(FALLBACK_UNIVERSE.hubbleConstantKmsMpc, FALLBACK_UNIVERSE.matterFraction, FALLBACK_UNIVERSE.darkEnergyFraction, redshift), spectrumCount: generateCMBSpectrum(cmbTemperatureAtRedshift(redshift), 24).length };
    } catch {
      return null;
    }
  }, [redshift]);
  const advancedCosmology = useMemo(() => {
    try {
      const cosmicTime = createCosmicTimeState(cosmicAgeGyr * 3.154e16);
      return { cosmicTime, lookback: calculateLookbackFraction(redshift), era: cosmicEraFromTemperature(cosmicTime.temperatureK), lorentz: lorentzFactorBeta(beta), interval: spacetimeInterval(1, 0.5 * 299792458, 0, 0), lightConeSamples: generateLightCone(1, 16).length };
    } catch {
      return null;
    }
  }, [beta, cosmicAgeGyr, redshift]);

  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <SectionHeader title={tr("astronomy.title")} subtitle={tr("astronomy.subtitle")} />
        {(usedFallback || loadFailed) && <Card accessibilityLabel={loadFailed ? tr("astronomy.loadFailed") : tr("astronomy.fallback")} style={{ marginBottom: 14, backgroundColor: colors.primary + "0D" }}>
          <Text accessibilityLiveRegion={loadFailed ? "assertive" : "polite"} style={{ color: loadFailed ? colors.warning : colors.primary, lineHeight: 20 }}>{loadFailed ? tr("astronomy.loadFailed") : tr("astronomy.fallback")}</Text>
        </Card>}
        <Card accessibilityLabel={tr("astronomy.stars")}>
          <Pill label={tr("astronomy.stars")} active />
          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginTop: 10 }}>{tr("astronomy.selectStar")}</Text>
          <View accessibilityRole="tablist" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {catalog.stars.map((item) => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: item.id === star.id }} accessibilityLabel={item.name} onPress={() => setSelectedStarId(item.id)} style={{ paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: item.id === star.id ? colors.primary : colors.border }}><Text style={{ color: item.id === star.id ? colors.background : colors.foreground, fontWeight: "800" }}>{item.name}</Text></Pressable>)}
          </View>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 16 }}>{star.name} · {star.spectralClass}</Text>
          <Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{star.description}</Text>
          <Text accessibilityLabel={`${tr("astronomy.temperature")}: ${number(star.temperatureK)} K`} style={{ color: colors.muted, marginTop: 12 }}>{tr("astronomy.temperature")}: {number(star.temperatureK)} K</Text>
          <Text accessibilityLabel={`${tr("astronomy.luminosity")}: ${number(luminosity)} solar`} style={{ color: colors.muted, marginTop: 5 }}>{tr("astronomy.luminosity")}: {number(luminosity)} solar</Text>
          <Text style={{ color: colors.muted, marginTop: 5 }}>{tr("astronomy.peakWavelength")}: {number(wavelengthNm)} nm</Text>
        </Card>
        <Card accessibilityLabel={tr("astronomy.planets")} style={{ marginTop: 14 }}>
          <Pill label={tr("astronomy.planets")} active />
          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginTop: 10 }}>{tr("astronomy.selectPlanet")}</Text>
          <View accessibilityRole="tablist" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {catalog.planets.map((item) => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: item.id === planet.id }} accessibilityLabel={item.name} onPress={() => setSelectedPlanetId(item.id)} style={{ paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: item.id === planet.id ? colors.primary : colors.border }}><Text style={{ color: item.id === planet.id ? colors.background : colors.foreground, fontWeight: "800" }}>{item.name}</Text></Pressable>)}
          </View>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 16 }}>{planet.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 5, lineHeight: 20 }}>{planet.description}</Text>
          <Text accessibilityLabel={`${tr("astronomy.gravity")}: ${number(gravity)} meters per second squared`} style={{ color: colors.muted, marginTop: 12 }}>{tr("astronomy.gravity")}: {number(gravity)} m/s²</Text>
          <Text accessibilityLabel={`${tr("astronomy.orbit")}: ${number(orbitalYears)} years`} style={{ color: colors.muted, marginTop: 5 }}>{tr("astronomy.orbit")}: {number(orbitalYears)} years</Text>
          <Text style={{ color: colors.muted, marginTop: 5 }}>{tr("astronomy.orbitalDistance")}: {formatScientific(planet.orbitAU * 149597870.7, locale)} km</Text>
        </Card>
        <Card accessibilityLabel={tr("astronomy.cosmology")} style={{ marginTop: 14 }}>
          <Pill label={tr("astronomy.cosmology")} active />
          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginTop: 10 }}>{tr("astronomy.cosmologyBody")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={tr("astronomy.decreaseRedshift")} disabled={redshift <= 0} onPress={() => setRedshift((value) => Math.max(0, Number((value - 0.1).toFixed(1))))} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: redshift <= 0 ? colors.border : colors.primary }}><Text style={{ color: redshift <= 0 ? colors.muted : colors.background, fontWeight: "800" }}>−</Text></Pressable>
            <Text accessibilityLabel={`${tr("astronomy.redshift")}: ${number(redshift)}`} style={{ color: colors.foreground, fontWeight: "800" }}>{tr("astronomy.redshift")}: {number(redshift)}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={tr("astronomy.increaseRedshift")} disabled={redshift >= 5} onPress={() => setRedshift((value) => Math.min(5, Number((value + 0.1).toFixed(1))))} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: redshift >= 5 ? colors.border : colors.primary }}><Text style={{ color: redshift >= 5 ? colors.muted : colors.background, fontWeight: "800" }}>+</Text></Pressable>
          </View>
          {cosmology ? <View accessible accessibilityLabel={`${tr("astronomy.scaleFactor")}: ${number(cosmology.scaleFactor)}. ${tr("astronomy.cmbTemperature")}: ${number(cosmology.cmbTemperature)} kelvin. ${tr("astronomy.hubbleRate")}: ${number(cosmology.hubbleRate)} kilometers per second per megaparsec.`} style={{ marginTop: 14 }}><Text style={{ color: colors.muted, lineHeight: 21 }}>{tr("astronomy.scaleFactor")}: {number(cosmology.scaleFactor)}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 21 }}>{tr("astronomy.cmbTemperature")}: {number(cosmology.cmbTemperature)} K</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 21 }}>{tr("astronomy.hubbleRate")}: {number(cosmology.hubbleRate)} km/s/Mpc</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 21 }}>{tr("astronomy.spectrumSamples")}: {cosmology.spectrumCount}</Text></View> : <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 14 }}>{tr("astronomy.noCosmology")}</Text>}
          <Text style={{ color: colors.foreground, fontWeight: "800", marginTop: 16 }}>{tr("astronomy.cosmicTimeline")}</Text>
          {FALLBACK_COSMIC_ERAS.map((era) => <Text key={era.id} style={{ color: colors.muted, marginTop: 7, lineHeight: 20 }}>{era.name}: {era.description}</Text>)}
        </Card>
        <Card accessibilityLabel={tr("astronomy.advancedCosmology")} style={{ marginTop: 14 }}>
          <Pill label={tr("astronomy.advancedCosmology")} active />
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 10 }}>{tr("astronomy.cosmicAge")}: {number(cosmicAgeGyr)} Gyr</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}><Pressable accessibilityRole="button" accessibilityLabel={tr("astronomy.decreaseAge")} disabled={cosmicAgeGyr <= 0.1} onPress={() => setCosmicAgeGyr((value) => Math.max(0.1, Number((value - 0.1).toFixed(1))))} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: cosmicAgeGyr <= 0.1 ? colors.border : colors.primary }}><Text style={{ color: cosmicAgeGyr <= 0.1 ? colors.muted : colors.background, fontWeight: "800" }}>−</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={tr("astronomy.increaseAge")} disabled={cosmicAgeGyr >= 20} onPress={() => setCosmicAgeGyr((value) => Math.min(20, Number((value + 0.1).toFixed(1))))} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: cosmicAgeGyr >= 20 ? colors.border : colors.primary }}><Text style={{ color: cosmicAgeGyr >= 20 ? colors.muted : colors.background, fontWeight: "800" }}>+</Text></Pressable></View>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 16 }}>{tr("astronomy.beta")}: {number(beta)}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}><Pressable accessibilityRole="button" accessibilityLabel={tr("astronomy.decreaseBeta")} disabled={beta <= 0} onPress={() => setBeta((value) => Math.max(0, Number((value - 0.05).toFixed(2))))} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: beta <= 0 ? colors.border : colors.primary }}><Text style={{ color: beta <= 0 ? colors.muted : colors.background, fontWeight: "800" }}>−</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={tr("astronomy.increaseBeta")} disabled={beta >= 0.95} onPress={() => setBeta((value) => Math.min(0.95, Number((value + 0.05).toFixed(2))))} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: beta >= 0.95 ? colors.border : colors.primary }}><Text style={{ color: beta >= 0.95 ? colors.muted : colors.background, fontWeight: "800" }}>+</Text></Pressable></View>
          {advancedCosmology ? <View accessible accessibilityLabel={`${tr("astronomy.cosmicAge")}: ${number(cosmicAgeGyr)} billion years. ${tr("astronomy.cosmicEra")}: ${advancedCosmology.era}. ${tr("astronomy.lookback")}: ${number(advancedCosmology.lookback * 100)} percent. ${tr("astronomy.lorentz")}: ${number(advancedCosmology.lorentz)}.`} style={{ marginTop: 14 }}><Text style={{ color: colors.muted, lineHeight: 21 }}>{tr("astronomy.cosmicEra")}: {advancedCosmology.era.replaceAll("-", " ")}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 21 }}>{tr("astronomy.lookback")}: {number(advancedCosmology.lookback * 100)}%</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 21 }}>{tr("astronomy.lorentz")}: {number(advancedCosmology.lorentz)}</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 21 }}>{tr("astronomy.spacetime")}: {formatScientific(advancedCosmology.interval, locale)} m²</Text><Text style={{ color: colors.muted, marginTop: 5, lineHeight: 21 }}>{tr("astronomy.lightCone")}: {advancedCosmology.lightConeSamples}</Text></View> : <Text accessibilityLiveRegion="assertive" style={{ color: colors.warning, marginTop: 14 }}>{tr("astronomy.noCosmology")}</Text>}
        </Card>
        <Text accessibilityRole="text" style={{ color: colors.muted, marginTop: 16, lineHeight: 20 }}>{tr("astronomy.details")}: deterministic equations are calculated locally from the selected catalog values.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
