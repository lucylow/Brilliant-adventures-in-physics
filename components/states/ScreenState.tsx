import type { ReactNode } from "react";
import { screenStatusFromFlags } from "@/lib/screen-recovery";
import type { ScreenStatus } from "@/lib/screen-recovery";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { OfflineState } from "./OfflineState";
import { SuccessState } from "./SuccessState";

export type { ScreenStatus };
export { screenStatusFromFlags };

export function ScreenState({
  status,
  loadingTitle,
  loadingBody,
  emptyTitle,
  emptyBody,
  emptyAction,
  errorTitle,
  errorBody,
  diagnosticId,
  onRetry,
  retrying,
  offlineTitle,
  offlineBody,
  successTitle,
  successBody,
  children,
}: {
  status: ScreenStatus;
  loadingTitle?: string;
  loadingBody?: string;
  emptyTitle?: string;
  emptyBody?: string;
  emptyAction?: ReactNode;

  errorTitle?: string;
  errorBody?: string;
  diagnosticId?: string;
  onRetry?: () => void;
  retrying?: boolean;
  offlineTitle?: string;
  offlineBody?: string;
  successTitle?: string;
  successBody?: string;
  children?: ReactNode;
}) {
  if (status === "loading") return <LoadingState title={loadingTitle} body={loadingBody} />;
  if (status === "offline") return <OfflineState title={offlineTitle} body={offlineBody} onRetry={onRetry} retrying={retrying} />;
  if (status === "error") return <ErrorState title={errorTitle} body={errorBody} diagnosticId={diagnosticId} onRetry={onRetry} retrying={retrying} />;
  if (status === "empty") return <EmptyState title={emptyTitle ?? "Nothing here yet"} body={emptyBody ?? "Start this activity when you are ready."} action={emptyAction} />;
  if (status === "success" && successTitle && successBody) return <SuccessState title={successTitle} body={successBody} />;
  return <>{children}</>;
}
