import { Component, type ErrorInfo, type ReactNode } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";

import { PrimaryButton, SecondaryButton } from "@/components/physica-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { createDiagnosticId } from "@/lib/diagnostics";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  diagnosticId: string | null;
  detail: string | null;
}

function RecoveryFallback({
  onReset,
  diagnosticId,
  detail,
}: {
  onReset: () => void;
  diagnosticId: string | null;
  detail: string | null;
}) {
  const colors = useColors();
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-5">
      <View style={{ flex: 1, justifyContent: "center", gap: 14 }}>
        <Text accessibilityRole="header" style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", lineHeight: 32 }}>
          This screen needs a reset
        </Text>
        <Text accessibilityLiveRegion="assertive" style={{ color: colors.muted, lineHeight: 22 }}>
          PhysicaAI could not render this screen. Your local study data was not changed. A safe empty recovery view is shown instead.
        </Text>
        {diagnosticId ? <Text style={{ color: colors.muted }}>Reference {diagnosticId}</Text> : null}
        {detail ? <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{detail}</Text> : null}
        <PrimaryButton label="Try this screen again" onPress={onReset} />
        <SecondaryButton label="Return home" onPress={() => router.replace("/(tabs)" as never)} />
      </View>
    </ScreenContainer>
  );
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false, diagnosticId: null, detail: null };

  static getDerivedStateFromError(): Pick<AppErrorBoundaryState, "hasError"> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const diagnosticId = createDiagnosticId();
    const detail = process.env.NODE_ENV !== "production" ? `${error.message}` : null;
    this.setState({ diagnosticId, detail });
    if (process.env.NODE_ENV !== "production") {
      console.error("PhysicaAI rendering recovery", error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ hasError: false, diagnosticId: null, detail: null });
  };

  render() {
    return this.state.hasError ? (
      <RecoveryFallback onReset={this.reset} diagnosticId={this.state.diagnosticId} detail={this.state.detail} />
    ) : (
      this.props.children
    );
  }
}
