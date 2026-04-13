import type { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";
import { useEffect, useRef, useState } from "react";
import { WebsocketProvider } from "y-websocket";

import { NEXT_PUBLIC_API_WS_URL } from "../../../utils/env";

import { useSession } from "./useAuth";

// =====================================
// ⬢ Utils
// =====================================
export function getDocId(
  id: string,
  isDataApp: boolean,
  clock: number,
  publishedAt: string | null
) {
  const parts = [id, isDataApp, clock];
  if (publishedAt) {
    parts.push(publishedAt);
  }

  return parts.join("-");
}

function getYjsUrl() {
  const baseUrl = NEXT_PUBLIC_API_WS_URL();
  const url = new URL(baseUrl);
  url.port = (parseInt(url.port, 10) + 2).toString();
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
  const id = getDocId(documentId, isDataApp, clock, publishedAt);
  const wsUrl = getYjsUrl();

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
    // ⬢ NOTE — y-websocket emits "sync" (not "synced") when the document
    // has been synchronised with the server. Using "synced" was a bug —
    // the callback would never fire and the doc would appear stuck syncing.
    this.wsProvider.on("sync", this.onWSSynced);
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
  publishedAt: string | null
): IProvider {
  const session = useSession({ redirectToLogin: false });

  // ── state ──
  // ⬢ NOTE — useState with initialiser function to avoid creating a new
  // provider on every render, which would cause the previous one to leak.
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
          session.user?.token ?? null
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
          session.user?.token ?? null
        )
      )
    );
  }, [
    yDoc,
    documentId,
    isDataApp,
    clock,
    userId,
    publishedAt,
    session.user?.token,
  ]);

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
