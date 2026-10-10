import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import KeyConnectCards, {
  failureReason,
  maskKey,
  validateKey,
} from "@/components/Environment/KeyConnectCards";
import type { KeyProvider } from "@/components/Environment/ApiKeyNudge";

const KEY = "nsn_0123456789abcdef0123456789abcdef";

type Props = React.ComponentProps<typeof KeyConnectCards>;

const base: Props = {
  variables: [],
  saving: false,
  loading: false,
  isViewer: false,
  onSave: vi.fn().mockResolvedValue(undefined),
  onRestart: vi.fn(),
};

const setup = (props: Partial<Props> = {}) => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onRestart = vi.fn();
  const view = render(
    <KeyConnectCards {...base} onSave={onSave} onRestart={onRestart} {...props} />
  );
  return { onSave, onRestart, ...view };
};

const service = () => screen.getByLabelText("Service") as HTMLSelectElement;
const choose = (id: string) => fireEvent.change(service(), { target: { value: id } });
const row = (name: string) =>
  screen.getByRole("region", { name: new RegExp(`${name} connection`, "i") });

// A registry as long as the real one may become.
const many = (n: number): KeyProvider[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    name: `Provider ${i}`,
    varName: `PROVIDER_${i}_KEY`,
    title: `Provider ${i}`,
    body: `Body ${i}`,
    getKeyUrl: "https://example.com",
    blurb: `Blurb ${i}`,
    category: i % 2 ? "Market data" : "Onchain data",
  }));

describe("validateKey", () => {
  it("accepts a plausible key, trimmed, and says what is wrong otherwise", () => {
    expect(validateKey(`  ${KEY}  `)).toBeNull();
    expect(validateKey("   ")).toMatch(/paste/i);
    expect(validateKey("abc")).toMatch(/too short/i);
    expect(validateKey("abcd efgh ijkl mnop")).toMatch(/no spaces/i);
  });
});

describe("maskKey", () => {
  it("shows only the last four characters", () => {
    expect(maskKey(KEY)).toBe("••••••••cdef");
    expect(maskKey(KEY)).not.toContain("0123");
    expect(maskKey("short")).toBe("••••••••");
  });
});

describe("failureReason", () => {
  it("adds the server's own message when there is one", () => {
    expect(failureReason(new Error("Forbidden"), "Couldn't save the key.")).toBe("Couldn't save the key. Forbidden");
    expect(failureReason(new Error("  "), "Couldn't save the key.")).toBe("Couldn't save the key.");
    expect(failureReason("nope", "Couldn't save the key.")).toBe("Couldn't save the key.");
  });
});

describe("KeyConnectCards, the form", () => {
  it("is one dropdown for the service and one field for the key, however many services there are", () => {
    setup({ providers: many(20) });
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(screen.getAllByLabelText("API key")).toHaveLength(1);
    // One option per service, plus the prompt.
    expect(within(service()).getAllByRole("option")).toHaveLength(21);
    expect(screen.getByText("Env name")).toBeTruthy();
    expect(screen.getByText("Key")).toBeTruthy();
    expect(screen.getByText("0 of 20 connected")).toBeTruthy();
  });

  it("lists each service with its env name, grouped by category", () => {
    setup({ providers: many(4) });
    const labels = within(service()).getAllByRole("option").map(o => o.textContent);
    expect(labels).toContain("Provider 2 (PROVIDER_2_KEY)");
    expect(service().querySelectorAll("optgroup")).toHaveLength(2);
  });

  it("shows what a service gives, and where to get its key, once it is chosen", () => {
    setup();
    expect(screen.queryByRole("link", { name: /get a key/i })).toBeNull();
    choose("nansen");
    expect(screen.getByRole("link", { name: /get a key/i }).getAttribute("href")).toBe(
      "https://app.nansen.ai"
    );
    expect((screen.getByLabelText("API key") as HTMLInputElement).placeholder).toBe(
      "Paste your Nansen key"
    );
  });

  it("stacks the two columns when narrow, for the editor's side panel", () => {
    const { container, rerender } = setup();
    expect(container.querySelector("[role=group] div")?.className).toContain("sm:grid-cols-");

    rerender(<KeyConnectCards {...base} narrow />);
    expect(container.querySelector("[role=group] div")?.className).not.toContain("sm:grid-cols-");
  });
});

describe("KeyConnectCards, connecting", () => {
  it("works inside another form, as in the editor's panel: Connect saves the key and does not submit that form", async () => {
    const outerSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <form onSubmit={outerSubmit}>
        <KeyConnectCards {...base} onSave={onSave} />
      </form>
    );
    expect(container.querySelectorAll("form")).toHaveLength(1);

    choose("nansen");
    fireEvent.change(screen.getByLabelText("API key"), { target: { value: KEY } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(outerSubmit).not.toHaveBeenCalled();
  });

  it("connects when Enter is pressed in the key field, without submitting an outer form", async () => {
    const outerSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <form onSubmit={outerSubmit}>
        <KeyConnectCards {...base} onSave={onSave} />
      </form>
    );
    choose("nansen");
    const input = screen.getByLabelText("API key");
    fireEvent.change(input, { target: { value: KEY } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(outerSubmit).not.toHaveBeenCalled();
  });

  it("saves the trimmed key under the chosen service's env name, in one step", async () => {
    const { onSave } = setup();
    choose("nansen");
    fireEvent.change(screen.getByLabelText("API key"), { target: { value: `  ${KEY} ` } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const [add, remove] = onSave.mock.calls[0] as [{ name: string; value: string }[], string[]];
    expect(add).toHaveLength(1);
    expect(add[0]).toMatchObject({ name: "NANSEN_API_KEY", value: KEY });
    expect(remove).toEqual([]);
    // The form is cleared for the next one.
    await waitFor(() => expect(service().value).toBe(""));
    expect((screen.getByLabelText("API key") as HTMLInputElement).value).toBe("");
  });

  it("asks for a service before a key", async () => {
    const { onSave } = setup();
    fireEvent.change(screen.getByLabelText("API key"), { target: { value: KEY } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/choose a service/i);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not save a key that is empty or too short, and says why", async () => {
    const { onSave } = setup();
    choose("nansen");
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/paste your key/i);

    fireEvent.change(screen.getByLabelText("API key"), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/too short/i));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("keeps the key hidden until asked, and shows a friendly error when saving fails", async () => {
    setup({ onSave: vi.fn().mockRejectedValue(new Error("Forbidden resource")) });
    choose("nansen");
    const input = screen.getByLabelText("API key") as HTMLInputElement;
    expect(input.type).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: "Show key" }));
    expect(input.type).toBe("text");

    fireEvent.change(input, { target: { value: KEY } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));
    const alert = await screen.findByText(/couldn't save the key/i);
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert.textContent).toContain("Forbidden resource");
  });

  it("advises a restart after saving, and restarts when asked", async () => {
    const { onRestart } = setup();
    choose("nansen");
    fireEvent.change(screen.getByLabelText("API key"), { target: { value: KEY } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));

    fireEvent.click(await screen.findByRole("button", { name: /restart environment/i }));
    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toMatch(/restarting/i);
  });
});

describe("KeyConnectCards, connected", () => {
  const variables = [{ id: "v1", name: "NANSEN_API_KEY", value: KEY }];

  it("keeps a connected service in the dropdown but disabled, and lists it with its key masked, never in full", () => {
    setup({ variables });
    const nansen = within(service()).getByText(/Nansen \(NANSEN_API_KEY\)/) as HTMLOptionElement;
    expect(nansen.textContent).toContain("connected");
    expect(nansen.disabled).toBe(true);
    const avacloud = within(service()).getByText(/AvaCloud \(AVACLOUD_API_KEY\)/) as HTMLOptionElement;
    expect(avacloud.disabled).toBe(false);

    expect(screen.getByText("1 of 2 connected")).toBeTruthy();
    expect(within(row("Nansen")).getByText("NANSEN_API_KEY")).toBeTruthy();
    expect(within(row("Nansen")).getByText("Connected")).toBeTruthy();
    expect(row("Nansen").textContent).toContain("••••••••cdef");
    expect(document.body.textContent).not.toContain(KEY);
  });

  it("does not let a disabled service be picked", () => {
    setup({ variables });
    choose("nansen");
    const nansen = within(service()).getByText(/Nansen \(/) as HTMLOptionElement;
    expect(nansen.disabled).toBe(true);
    expect(screen.queryByRole("link", { name: /get a key/i })).toBeNull();
  });

  it("says so when there is nothing left to connect", () => {
    setup({
      variables: [
        { id: "v1", name: "NANSEN_API_KEY", value: KEY },
        { id: "v2", name: "AVACLOUD_API_KEY", value: KEY },
      ],
    });
    expect(screen.getByText(/every service is connected/i)).toBeTruthy();
    expect(screen.queryByLabelText("Service")).toBeNull();
  });

  it("replaces the key in one call: the old row removed, the new one added", async () => {
    const { onSave } = setup({ variables });
    fireEvent.click(within(row("Nansen")).getByRole("button", { name: "Replace" }));
    fireEvent.change(screen.getByLabelText("Nansen API key"), {
      target: { value: "nsn_ffffffffffffffffffffffffffffffff" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Replace key" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const [add, remove] = onSave.mock.calls[0] as [{ name: string; value: string }[], string[]];
    expect(add[0]).toMatchObject({ name: "NANSEN_API_KEY", value: "nsn_ffffffffffffffffffffffffffffffff" });
    expect(remove).toEqual(["v1"]);
  });

  it("asks before disconnecting, and only then removes it", async () => {
    const { onSave } = setup({ variables });
    fireEvent.click(within(row("Nansen")).getByRole("button", { name: "Disconnect" }));
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith([], ["v1"]));
  });

  it("lets Keep it back out of disconnecting", () => {
    const { onSave } = setup({ variables });
    fireEvent.click(within(row("Nansen")).getByRole("button", { name: "Disconnect" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(within(row("Nansen")).getByRole("button", { name: "Disconnect" })).toBeTruthy();
  });
});

describe("KeyConnectCards, a viewer", () => {
  it("sees what is connected but gets no form and no way to change a key", () => {
    setup({ isViewer: true, variables: [{ id: "v1", name: "NANSEN_API_KEY", value: KEY }] });
    expect(within(row("Nansen")).getByText("Connected")).toBeTruthy();
    expect(screen.queryByLabelText("Service")).toBeNull();
    expect(screen.queryByLabelText("API key")).toBeNull();
    expect(screen.queryByRole("button", { name: "Replace" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Disconnect" })).toBeNull();
  });

  it("is told so when nothing is connected yet", () => {
    setup({ isViewer: true });
    expect(screen.getByText(/no connections yet/i)).toBeTruthy();
  });
});

describe("KeyConnectCards, loading", () => {
  it("shows nothing until the workspace's variables are known", () => {
    const { container } = render(<KeyConnectCards {...base} loading />);
    expect(container.firstChild).toBeNull();
  });
});
