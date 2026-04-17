import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { NetworkStatus } from "@apollo/client";

import { useCurrentWorkspaceInfo } from "@/components/Editor/hooks/useWorkspaces";
import { useGetUserWorkspaceInfoQuery } from "@/generated/graphql";

vi.mock("@/graphql/generated", () => ({
  useGetUserWorkspaceInfoQuery: vi.fn(),
}));

const mockWorkspaceData = {
  getUserWorkspaceInfo: {
    id: "workspace-abc",
    role: "admin",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useCurrentWorkspaceInfo", () => {
  it("returns workspace data when query succeeds", () => {
    vi.mocked(useGetUserWorkspaceInfoQuery).mockReturnValue({
      data: mockWorkspaceData,
      loading: false,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCurrentWorkspaceInfo(false));

    expect(result.current.workspaceInfo?.id).toBe("workspace-abc");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.networkStatus).toBe(NetworkStatus.ready);
  });

  it("skips query when skip=true", () => {
    vi.mocked(useGetUserWorkspaceInfoQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: vi.fn(),
    } as any);

    renderHook(() => useCurrentWorkspaceInfo(true));

    expect(useGetUserWorkspaceInfoQuery).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true })
    );
  });

  it("returns isLoading=false when skip=true even if loading=true", () => {
    vi.mocked(useGetUserWorkspaceInfoQuery).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      networkStatus: NetworkStatus.loading,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCurrentWorkspaceInfo(true));

    expect(result.current.isLoading).toBe(false);
  });

  it("returns error when query fails", () => {
    vi.mocked(useGetUserWorkspaceInfoQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: { message: "User ID is required" },
      networkStatus: NetworkStatus.error,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useCurrentWorkspaceInfo(false));

    expect(result.current.error?.message).toBe("User ID is required");
    expect(result.current.workspaceInfo).toBeUndefined();
    expect(result.current.networkStatus).toBe(NetworkStatus.error);
  });

  it("passes notifyOnNetworkStatusChange to query", () => {
    vi.mocked(useGetUserWorkspaceInfoQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: vi.fn(),
    } as any);

    renderHook(() => useCurrentWorkspaceInfo(false));

    expect(useGetUserWorkspaceInfoQuery).toHaveBeenCalledWith(
      expect.objectContaining({ notifyOnNetworkStatusChange: true })
    );
  });
});
