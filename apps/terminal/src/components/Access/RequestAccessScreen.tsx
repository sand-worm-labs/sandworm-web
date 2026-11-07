"use client";

import { useState } from "react";
import { PiCheck, PiLockKey } from "react-icons/pi";
import { Button, buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { TextAreaField } from "@sandworm/ui/kit/form/text-area-field";
import { TextField } from "@sandworm/ui/kit/form/text-field";

import { AppLink } from "@/components/AppLink";
import { env } from "@/config/env";
import { site } from "@/config/site";
import { requestAccess } from "@/lib/access/actions";
import {
  canSubmitAccessRequest,
  EMPTY_REQUEST_ACCESS_DRAFT,
  type RequestAccessDraft,
} from "@/lib/access/request-draft";

type RequestAccessScreenProps = { email: string | null };

export function RequestAccessScreen({ email }: RequestAccessScreenProps) {
  const [draft, setDraft] = useState<RequestAccessDraft>(
    EMPTY_REQUEST_ACCESS_DRAFT
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const update = (patch: Partial<RequestAccessDraft>) =>
    setDraft({ ...draft, ...patch });

  const send = async () => {
    setIsSending(true);
    try {
      await requestAccess(draft);
      setIsSent(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6 pt-6">
      <div className="flex flex-col items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200"
        >
          <PiLockKey size={22} />
        </span>
        <h1 className="text-[26px] font-medium leading-tight text-ink-100">
          You don&apos;t have access to Terminal yet
        </h1>
        <p className="text-sm leading-[1.55] text-ink-500">
          Terminal is for the teams {site.name} works with.{" "}
          {email ? (
            <>
              You&apos;re signed in as{" "}
              <span className="font-medium text-ink-100">{email}</span>, and
              that account isn&apos;t part of a client yet.
            </>
          ) : (
            "Your account isn't part of a client yet."
          )}
        </p>
      </div>
      {isSent ? (
        <Card
          aria-labelledby="access-sent"
          className="flex flex-col items-start gap-3 px-6 py-5"
        >
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <PiCheck size={18} />
          </span>
          <h2 id="access-sent" className="text-base font-medium text-ink-100">
            Request sent
          </h2>
          <p className="text-sm leading-[1.55] text-ink-500">
            {site.name} will look at it and get back to you
            {email ? ` at ${email}` : ""}. You don&apos;t need to do anything
            else.
          </p>
          <a
            href={env.webAppUrl}
            className={buttonClassName({ variant: "secondary" })}
          >
            Back to {site.name}
          </a>
        </Card>
      ) : (
        <Card aria-labelledby="access-request" className="px-6 py-5">
          <form
            className="flex flex-col gap-4"
            onSubmit={event => {
              event.preventDefault();
              if (canSubmitAccessRequest(draft) && !isSending) send();
            }}
          >
            <h2
              id="access-request"
              className="text-base font-medium text-ink-100"
            >
              Request access
            </h2>
            <TextField
              id="access-organisation"
              label="Organisation"
              placeholder="The company or team you work with"
              value={draft.organisation}
              onChange={event => update({ organisation: event.target.value })}
            />
            <TextAreaField
              id="access-interest"
              label="What would you like Terminal to show you? (optional)"
              rows={3}
              maxLength={500}
              value={draft.interest}
              onChange={event => update({ interest: event.target.value })}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!canSubmitAccessRequest(draft) || isSending}
              >
                Request access
              </Button>
            </div>
          </form>
        </Card>
      )}
      <p className="text-[13px] text-ink-400">
        Already part of a team? Ask an admin to invite {email ?? "your email"},
        or{" "}
        <AppLink
          route="contact"
          className="font-medium text-primary-700 dark:text-primary-200"
        >
          contact us
        </AppLink>
        .
      </p>
    </div>
  );
}
