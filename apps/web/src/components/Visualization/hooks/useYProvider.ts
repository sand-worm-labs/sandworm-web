import type { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";
import { useEffect, useRef, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import Cookies from "js-cookie";

import { NEXT_PUBLIC_API_WS_URL } from "../utils/env";

import { tokenStorage } from "./useAuth";

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
  const baseUrl = NEXT_PUBLIC_API_WS_URL(); // ws://localhost:8003
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
  publishedAt: string | null
): WebsocketProvider {
  const id = getDocId(documentId, isDataApp, clock, publishedAt);
  const wsUrl = getYjsUrl();
  const isDev = process.env.NODE_ENV === "development";
  const token = tokenStorage.getToken();

  if (!isDev) {
    Cookies.set("auth-token", token ?? "", {
      expires: 7,
      path: "/",
      sameSite: "none",
      secure: false,
    });
  }

  const provider = new WebsocketProvider(wsUrl, id, yDoc, {
    connect: false,
    params: {
      documentId,
      clock: clock.toString(),
      isApp: isDataApp ? "true" : "false",
      userId: userId ?? "",
      ...(isDev ? { authToken: token || "" } : {}),
    },
    resyncInterval: 30000,
  });

  return provider;
}

export interface IProvider {
  synced: boolean;
  connect: () => void;
  destroy: () => void;
  awareness: Awareness;
  onSynced: (cb: (synced: boolean) => void) => void;
  offSynced: (cb: (synced: boolean) => void) => void;
}

class Provider implements IProvider {
  private _synced = false;

  private onSyncCbs: ((synced: boolean) => void)[] = [];

  constructor(private wsProvider: WebsocketProvider) {
    this._synced = this.wsProvider.synced;

    this.wsProvider.on("synced", this.onWSSynced);
  }

  private onWSSynced = async () => {
    if (!this.wsProvider.wsconnected) {
      return;
    }

    this._synced = this.wsProvider.synced;

    for (const cb of this.onSyncCbs) {
      cb(this._synced);
    }
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

export function useProvider(
  yDoc: Y.Doc,
  documentId: string,
  isDataApp: boolean,
  clock: number,
  userId: string | null,
  publishedAt: string | null
): IProvider {
  const [provider, setProvider] = useState<Provider>(
    // must be a function to avoid creating a new provider on every render
    // which would cause the provider to leak
    () =>
      new Provider(
        getWSProvider(yDoc, documentId, isDataApp, clock, userId, publishedAt)
      )
  );

  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    provider.destroy();
    setProvider(
      new Provider(
        getWSProvider(yDoc, documentId, isDataApp, clock, userId, publishedAt)
      )
    );
  }, [yDoc, documentId, isDataApp, clock, userId, publishedAt]);

  useEffect(
    () => () => {
      // cleanup after the component is unmounted
      provider.destroy();
    },
    []
  );

  return provider;
}
