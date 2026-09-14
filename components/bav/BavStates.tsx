import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { OfflineState } from "@/components/states/OfflineState";
import { LoadingState } from "@/components/states/LoadingState";
import { BavLoadingState } from "./BavFeedback";

/** Design-system aliases so screens can import empty/error from `components/bav`. */
export function BavEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return <EmptyState title={title} body={body} />;
}

export function BavErrorState({
  title,
  body,
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return <ErrorState title={title} body={body} onRetry={onRetry} />;
}

export function BavOfflineState({ onRetry }: { onRetry?: () => void }) {
  return <OfflineState onRetry={onRetry} />;
}

export { BavLoadingState, LoadingState };
