import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, SecondaryButton, SectionHeader } from "@/components/physica-ui";
import { useColors } from "@/hooks/use-colors";
import { isMockModeEnabled, isProductionRuntime } from "@/lib/mock/config";
import { MOCK_SCENARIOS } from "@/lib/mock/scenarios/definitions";
import { useMockDataControls } from "@/hooks/use-mock-data";
import { getMockDataset } from "@/lib/mock/registry";
import { inspectMockAI } from "@/lib/mock/ai/ai-inspector";
import { setMockAIScenario, setAIFailureMode, getMockAIConfig, setMockAIConfig } from "@/lib/mock/ai/config";
import type { MockAIMode } from "@/lib/mock/ai/ai-types";
import { SHOWCASES, setAIDemoShowcase, getAIDemoShowcase, setAITestUserState, getAITestUserState } from "@/lib/mock/ai/expansion/orchestration";
import type { TestUserState } from "@/lib/mock/ai/expansion/types";
import { inspectExpansion } from "@/lib/mock/ai/expansion/debug";
import type { MockLatencyProfile, MockNetworkState, MockScenarioId } from "@/lib/mock/types";

const LATENCIES: MockLatencyProfile[] = ["instant", "fast", "realistic", "slow"];
const NETWORKS: MockNetworkState[] = ["online", "offline", "degraded"];
const LEARNERS = [
  { id: "user-alex", label: "Beginner" },
  { id: "user-maya", label: "Intermediate" },
  { id: "user-noah", label: "Advanced" },
  { id: "user-jordan", label: "Power User" },
  { id: "user-taylor", label: "Exam Prep" },
];
const AI_MODES: MockAIMode[] = ["mock-basic", "mock-rich", "mock-streaming", "mock-error", "mock-offline", "mock-slow"];
const TEST_USERS: TestUserState[] = ["fresh", "active", "struggling", "mastery", "exam", "offline", "error", "returning"];

export default function MockDataPanelScreen() {
  const colors = useColors();
  const controls = useMockDataControls();
  if (isProductionRuntime() || !isMockModeEnabled()) {
    return (
      <ScreenContainer className="p-5">
        <SectionHeader title="Mock data" subtitle="This panel is available only in development with mock mode enabled." />
        <SecondaryButton label="Back" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }
  const counts: Record<string, number> = controls.stats?.entityCounts ?? {};
  const expansion = getMockDataset().expansion;
  const chip = (active: boolean) => ({
    borderWidth: 1,
    borderColor: active ? colors.primary : colors.border,
    backgroundColor: active ? colors.primary + "18" : colors.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  });
  return (
    <ScreenContainer className="p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 14 }}>
        <SectionHeader title="Mock Data" subtitle="Development-only controls. These never alter production backends." />
        <Card>
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18 }}>Scenario</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {MOCK_SCENARIOS.map((scenario) => (
              <Pressable key={scenario.id} onPress={() => { void controls.setScenario(scenario.id as MockScenarioId); }} style={chip(controls.config.scenario === scenario.id)}>
                <Text style={{ color: controls.config.scenario === scenario.id ? colors.primary : colors.foreground, fontWeight: "700" }}>{scenario.title}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: colors.muted, marginTop: 10, lineHeight: 20 }}>{MOCK_SCENARIOS.find((item) => item.id === controls.config.scenario)?.description}</Text>
        </Card>
        <Card>
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18 }}>Learner</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {LEARNERS.map((learner) => (
              <Pressable key={learner.id} onPress={() => { void controls.setLearner(learner.id); }} style={chip(controls.config.learnerId === learner.id)}>
                <Text style={{ color: controls.config.learnerId === learner.id ? colors.primary : colors.foreground, fontWeight: "700" }}>{learner.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
        <Card>
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18 }}>Latency & network</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {LATENCIES.map((latency) => (
              <Pressable key={latency} onPress={() => controls.setLatency(latency)} style={chip(controls.config.latency === latency)}>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{latency}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {NETWORKS.map((network) => (
              <Pressable key={network} onPress={() => controls.setNetwork(network)} style={chip(controls.config.network === network)}>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{network}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ marginTop: 12, gap: 8 }}>
            <SecondaryButton label="Inject tutor timeout" onPress={() => controls.injectFailure("tutor.get")} />
            <SecondaryButton label="Inject experiment save failure" onPress={() => controls.injectFailure("save-experiment")} />
            <SecondaryButton label="Clear injected failures" onPress={controls.clearFailures} />
          </View>
        </Card>
        <Card>
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18 }}>Dataset inspector</Text>
          {Object.entries(counts).map(([key, value]) => (
            <Text key={key} style={{ color: colors.muted, marginTop: 4 }}>{key}: {value}</Text>
          ))}
          <Text style={{ color: colors.muted, marginTop: 8 }}>Users in catalog: {getMockDataset().users.length}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>Expansion v{expansion.version} · packs {expansion.packsLoaded.join(", ")}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>labs {expansion.labExperiments.length} · discovery {expansion.discoveryCards.length} · QOTD {expansion.questionsOfTheDay.length}</Text>
        </Card>
        <Card>
          <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18 }}>Demo AI inspector</Text>
          <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>Development-only. Never shown as a live provider.</Text>
          {(() => {
            const ai = inspectMockAI();
            const config = getMockAIConfig();
            if (!ai || !("enabled" in ai) || !ai.enabled) return <Text style={{ color: colors.muted, marginTop: 8 }}>Demo AI is off.</Text>;
            return (
              <View style={{ marginTop: 8, gap: 4 }}>
                <Text style={{ color: colors.foreground }}>scenario: {ai.scenarioTitle}</Text>
                <Text style={{ color: colors.foreground }}>mode: {ai.providerMode}</Text>
                <Text style={{ color: colors.foreground }}>latency: {ai.latency}</Text>
                <Text style={{ color: colors.foreground }}>failure: {ai.failureMode}</Text>
                <Text style={{ color: colors.foreground }}>conversations: {ai.counts.conversations} · messages: {ai.counts.messages}</Text>
                <SecondaryButton label="Scenario: first question" onPress={() => setMockAIScenario("first-tutor-question")} />
                <SecondaryButton label="Failure: timeout" onPress={() => setAIFailureMode("timeout")} />
                <SecondaryButton label="Failure: none" onPress={() => setAIFailureMode("none")} />
                <Text style={{ color: colors.muted }}>active config {config.aiMode} / {config.failureMode}</Text>
                <Text style={{ color: colors.foreground, fontWeight: "700", marginTop: 10 }}>Demo AI provider</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {AI_MODES.map((mode) => (
                    <Pressable key={mode} onPress={() => setMockAIConfig({ aiMode: mode })} style={chip(config.aiMode === mode)}>
                      <Text style={{ color: colors.foreground, fontWeight: "700" }}>{mode.replace("mock-", "")}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ color: colors.foreground, fontWeight: "700", marginTop: 10 }}>AI showcase</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {SHOWCASES.map((item) => (
                    <Pressable key={item.id} onPress={() => setAIDemoShowcase(item.id)} style={chip(getAIDemoShowcase() === item.id)}>
                      <Text style={{ color: colors.foreground, fontWeight: "700" }}>{item.title}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ color: colors.foreground, fontWeight: "700", marginTop: 10 }}>AI test user</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {TEST_USERS.map((state) => (
                    <Pressable key={state} onPress={() => setAITestUserState(state)} style={chip(getAITestUserState() === state)}>
                      <Text style={{ color: colors.foreground, fontWeight: "700" }}>{state}</Text>
                    </Pressable>
                  ))}
                </View>
                {(() => {
                  const expansion = inspectExpansion();
                  if (!expansion || expansion.enabled !== true) return null;
                  return (
                    <View style={{ marginTop: 8, gap: 4 }}>
                      <Text style={{ color: colors.muted }}>expansion v{expansion.version} · {expansion.showcase} · {expansion.learner.displayLabel}</Text>
                      <Text style={{ color: colors.muted }}>style {expansion.learner.style} · hint dependence {expansion.learner.hintDependence.toFixed(2)}</Text>
                    </View>
                  );
                })()}
              </View>
            );
          })()}
        </Card>
        <PrimaryButton label="Reset mock data" onPress={() => { void controls.reset(); }} />
        <SecondaryButton label="Back to settings" onPress={() => router.back()} />
      </ScrollView>
    </ScreenContainer>
  );
}
