import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";

import { useSession } from "@/components/Editor/hooks/useAuth";
import { useCurrentUserQuery } from "@/generated/graphql";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  usePathname: vi.fn(() => "/workspace"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/graphql/generated", () => ({
  useCurrentUserQuery: vi.fn(),
}));

const mockUser = {
  currentUser: {
    user: {
      id: "user-123",
      firstName: "Dan",
      lastName: "Ife",
      fullName: "Dan Ife",
      username: "danife",
    },
    roles: ["admin"],
    token: "tok",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSession", () => {
  it("returns authenticated user when currentUser resolves", async () => {
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: mockUser,
      loading: false,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useSession({ redirectToLogin: false }));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe("user-123");
    expect(result.current.loading).toBe(false);
  });

  it("returns unauthenticated when currentUser is null", () => {
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: { currentUser: null },
      loading: false,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useSession({ redirectToLogin: false }));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("returns loading state while query is in flight", () => {
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useSession({ redirectToLogin: false }));

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("redirects to signin when unauthenticated and redirectToLogin is true", async () => {
    const replace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ replace } as any);

    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: { currentUser: null },
      loading: false,
      error: undefined,
    } as any);

    renderHook(() => useSession({ redirectToLogin: true }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        expect.stringContaining("/signin?callback=")
      );
    });
  });

  it("does not redirect when still loading", () => {
    const replace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ replace } as any);

    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as any);

    renderHook(() => useSession({ redirectToLogin: true }));

    expect(replace).not.toHaveBeenCalled();
  });

  it("does not redirect when authenticated even with redirectToLogin true", () => {
    const replace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ replace } as any);

    vi.mocked(useCurrentUserQuery).mockReturnValue({
      data: mockUser,
      loading: false,
      error: undefined,
    } as any);

    renderHook(() => useSession({ redirectToLogin: true }));

    expect(replace).not.toHaveBeenCalled();
  });
});
