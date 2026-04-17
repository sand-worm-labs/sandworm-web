import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { NetworkStatus } from "@apollo/client";
import { useRouter } from "next/navigation";

import WorkspaceRedirectPage from "@/app/workspace/page";
import { useSession, useSignout } from "@/components/Editor/hooks/useAuth";
import { useCurrentWorkspaceInfo } from "@/components/Editor/hooks/useWorkspaces";

vi.mock("@/components/Editor/hooks/useAuth", () => ({
  useSession: vi.fn(),
  useSignout: vi.fn(),
}));

vi.mock("@/components/Editor/hooks/useWorkspaces", () => ({
  useCurrentWorkspaceInfo: vi.fn(),
}));

// =====================================
// ⬢ Helpers
// =====================================
const mockRouter = { replace: vi.fn(), push: vi.fn() };
const mockSignout = vi.fn();

const mockSession = (overrides = {}) => ({
  user: { id: "user-123" },
  loading: false,
  isAuthenticated: true,
  error: null,
  ...overrides,
});

const mockWorkspace = (overrides = {}) => ({
  workspaceInfo: { id: "workspace-abc" },
  isLoading: false,
  error: undefined,
  networkStatus: NetworkStatus.ready,
  refetch: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  vi.mocked(useSignout).mockReturnValue(mockSignout);
});

// =====================================
// ⬢ Tests
// =====================================
describe("WorkspaceRedirectPage", () => {
  describe("happy path", () => {
    it("redirects to workspace when authenticated and workspace resolves", async () => {
      vi.mocked(useSession).mockReturnValue(mockSession() as any);
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace() as any
      );

      render(<WorkspaceRedirectPage />);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          "/workspace/workspace-abc"
        );
      });
    });

    it("shows loader while session is loading", () => {
      vi.mocked(useSession).mockReturnValue(
        mockSession({ loading: true }) as any
      );
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace() as any
      );

      const { container } = render(<WorkspaceRedirectPage />);

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(container.querySelector(".bar-loader")).toBeTruthy();
    });

    it("shows loader while workspace is loading", () => {
      vi.mocked(useSession).mockReturnValue(mockSession() as any);
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace({
          isLoading: true,
          networkStatus: NetworkStatus.loading,
        }) as any
      );

      render(<WorkspaceRedirectPage />);

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe("skip behaviour", () => {
    it("skips workspace query while session is loading", () => {
      vi.mocked(useSession).mockReturnValue(
        mockSession({ loading: true }) as any
      );
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace() as any
      );

      render(<WorkspaceRedirectPage />);

      expect(useCurrentWorkspaceInfo).toHaveBeenCalledWith(true);
    });

    it("skips workspace query when not authenticated", () => {
      vi.mocked(useSession).mockReturnValue(
        mockSession({ isAuthenticated: false, user: null }) as any
      );
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace() as any
      );

      render(<WorkspaceRedirectPage />);

      expect(useCurrentWorkspaceInfo).toHaveBeenCalledWith(true);
    });

    it("skips workspace query when user object is null", () => {
      vi.mocked(useSession).mockReturnValue(mockSession({ user: null }) as any);
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace() as any
      );

      render(<WorkspaceRedirectPage />);

      expect(useCurrentWorkspaceInfo).toHaveBeenCalledWith(true);
    });

    it("does not skip workspace query when fully authenticated", () => {
      vi.mocked(useSession).mockReturnValue(mockSession() as any);
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace() as any
      );

      render(<WorkspaceRedirectPage />);

      expect(useCurrentWorkspaceInfo).toHaveBeenCalledWith(false);
    });
  });

  describe("error states", () => {
    it("forces signout when workspace query returns GraphQL error", async () => {
      vi.mocked(useSession).mockReturnValue(mockSession() as any);
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace({
          workspaceInfo: null,
          error: { message: "User ID is required" },
          networkStatus: NetworkStatus.error,
        }) as any
      );

      render(<WorkspaceRedirectPage />);

      await waitFor(() => {
        expect(mockSignout).toHaveBeenCalled();
      });
    });

    it("forces signout on workspace not found error", async () => {
      vi.mocked(useSession).mockReturnValue(mockSession() as any);
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace({
          workspaceInfo: null,
          error: { message: "Workspace not found or user not a member" },
          networkStatus: NetworkStatus.error,
        }) as any
      );

      render(<WorkspaceRedirectPage />);

      await waitFor(() => {
        expect(mockSignout).toHaveBeenCalled();
      });
    });

    it("does not signout if query is not done yet", () => {
      vi.mocked(useSession).mockReturnValue(mockSession() as any);
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace({
          workspaceInfo: null,
          error: { message: "User ID is required" },
          networkStatus: NetworkStatus.loading, // still in flight
        }) as any
      );

      render(<WorkspaceRedirectPage />);

      expect(mockSignout).not.toHaveBeenCalled();
    });

    it("redirects to /signin?error=no-workspace when authenticated, query succeeds, but no workspace exists", async () => {
      const originalHref = window.location.href;
      Object.defineProperty(window, "location", {
        value: { href: "" },
        writable: true,
      });

      vi.mocked(useSession).mockReturnValue(mockSession() as any);
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace({
          workspaceInfo: null,
          error: undefined,
          networkStatus: NetworkStatus.ready,
        }) as any
      );

      render(<WorkspaceRedirectPage />);

      await waitFor(() => {
        expect(window.location.href).toBe("/signin?error=no-workspace");
      });

      window.location.href = originalHref;
    });
  });

  describe("race conditions", () => {
    it("does not redirect while networkStatus is not ready or error", () => {
      vi.mocked(useSession).mockReturnValue(mockSession() as any);

      const refetch = vi.fn();

      // Simulate cache-and-network: first render has networkStatus=2 (setVariables)
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace({
          workspaceInfo: null,
          error: undefined,
          networkStatus: NetworkStatus.setVariables,
          refetch,
        }) as any
      );

      render(<WorkspaceRedirectPage />);

      expect(mockSignout).not.toHaveBeenCalled();
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("does not signout when unauthenticated — useSession handles that redirect", () => {
      vi.mocked(useSession).mockReturnValue(
        mockSession({ isAuthenticated: false, user: null }) as any
      );
      vi.mocked(useCurrentWorkspaceInfo).mockReturnValue(
        mockWorkspace({
          workspaceInfo: null,
          error: { message: "User ID is required" },
          networkStatus: NetworkStatus.error,
        }) as any
      );

      render(<WorkspaceRedirectPage />);

      expect(mockSignout).not.toHaveBeenCalled();
    });
  });
});
