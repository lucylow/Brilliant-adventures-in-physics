import { Component, type ErrorInfo, type ReactNode } from "react";
import { Text, View } from "react-native";

import { PrimaryButton } from "@/components/physica-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

function RecoveryFallback({ onReset }: { onReset: () => void }) {
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
        <PrimaryButton label="Return to a safe view" onPress={onReset} />
      </View>
    </ScreenContainer>
  );
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("PhysicaAI rendering recovery", error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    return this.state.hasError ? <RecoveryFallback onReset={this.reset} /> : this.props.children;
  }
}
