import type { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";
import { useEffect, useRef, useState } from "react";
import { WebsocketProvider } from "y-websocket";

import { NEXT_PUBLIC_API_WS_URL } from "../../../utils/env";

// =====================================
// ⬢ Utils
// =====================================
export function getDocId(id: string, isDataApp: boolean, clock: number) {
  const parts = [id, isDataApp, clock];
  /*  if (publishedAt) {
    parts.push(publishedAt);
  } */

  return parts.join("-");
}

function getYjsUrl() {
  const baseUrl = NEXT_PUBLIC_API_WS_URL();
  const url = new URL(baseUrl);

  return `${url.toString()}yjs`;
}

function getWSProvider(
  yDoc: Y.Doc,
  documentId: string,
  isDataApp: boolean,
  clock: number,
  userId: string | null,
  publishedAt: string | null,
  accessToken: string | null
): WebsocketProvider {
  const id = getDocId(documentId, isDataApp, clock /* publishedAt */);
  const wsUrl = getYjsUrl();

  console.log("[Room Name]", {
    mode: isDataApp ? "VIEW" : "EDIT",
    roomId: id,
    parts: [documentId, isDataApp, clock],
  });

  return new WebsocketProvider(wsUrl, id, yDoc, {
    connect: false,
    params: {
      documentId,
      clock: clock.toString(),
      isApp: isDataApp ? "true" : "false",
      userId: userId ?? "",
      publishedAt: publishedAt ?? "",
      access_token: accessToken ?? "",
    },
    resyncInterval: 30000,
  });
}

// =====================================
// ⬢ Types
// =====================================
export interface IProvider {
  synced: boolean;
  connect: () => void;
  destroy: () => void;
  awareness: Awareness;
  onSynced: (cb: (synced: boolean) => void) => void;
  offSynced: (cb: (synced: boolean) => void) => void;
}

// =====================================
// ⬢ Provider
// =====================================
class Provider implements IProvider {
  private _synced = false;

  private onSyncCbs: ((synced: boolean) => void)[] = [];

  constructor(private wsProvider: WebsocketProvider) {
    this._synced = this.wsProvider.synced;
    this.wsProvider.on("sync", this.onWSSynced);
    this.wsProvider.on("status", (event: any) => {
      console.log("[WS] status:", event.status);
    });
    this.wsProvider.on("connection-error", (event: any) => {
      console.log("[WS] connection-error:", event);
    });
  }

  private onWSSynced = () => {
    if (!this.wsProvider.wsconnected) {
      return;
    }

    this._synced = this.wsProvider.synced;
    this.onSyncCbs.forEach(cb => cb(this._synced));
  };

  public get synced() {
    return this._synced;
  }

  public connect() {
    this.wsProvider.connect();
    console.log("[Provider] connect() called");
  }

  public destroy() {
    this.wsProvider.awareness.destroy();
    this.wsProvider.off("sync", this.onWSSynced);
    this.wsProvider.destroy();
  }

  public get awareness() {
    return this.wsProvider.awareness;
  }

  private checkSync() {
    this._synced = this.wsProvider.synced;
  }

  public onSynced(cb: (synced: boolean) => void) {
    this.onSyncCbs.push(cb);
    this.checkSync();
    cb(this._synced);
  }

  public offSynced(cb: (synced: boolean) => void) {
    this.onSyncCbs = this.onSyncCbs.filter(c => c !== cb);
  }
}

// =====================================
// ⬢ useProvider
// =====================================
export function useProvider(
  yDoc: Y.Doc,
  documentId: string,
  isDataApp: boolean,
  clock: number,
  userId: string | null,
  publishedAt: string | null,
  accessToken: string | null
): IProvider {
  // ── state ──
  // ⬢ NOTE — useState with initialiser function to avoid creating a new
  // provider on every render, which would cause the previous one to leak.
  // accessToken is taken from the caller's already-resolved session (not
  // re-fetched here) — an independent useSession() call in this hook would
  // resolve after the initial provider is constructed, so the first
  // connection attempt would carry an empty token and get rejected by the
  // server, burning through reconnect backoff before a token-bearing retry
  // finally lands.
  const [provider, setProvider] = useState<Provider>(
    () =>
      new Provider(
        getWSProvider(
          yDoc,
          documentId,
          isDataApp,
          clock,
          userId,
          publishedAt,
          accessToken
        )
      )
  );

  const isFirst = useRef(true);

  // Recreate provider when any connection param changes
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    provider.destroy();
    setProvider(
      new Provider(
        getWSProvider(
          yDoc,
          documentId,
          isDataApp,
          clock,
          userId,
          publishedAt,
          accessToken
        )
      )
    );
  }, [yDoc, documentId, isDataApp, clock, userId, publishedAt, accessToken]);

  useEffect(
    () => () => {
      provider.destroy();
    },
    // ⬢ NOTE — Empty deps is intentional — this only runs on unmount.
    // The provider at unmount time is captured via closure ref.
    []
  );

  return provider;
}
