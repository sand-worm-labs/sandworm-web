"use client";

import { useEffect, Suspense, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";

import { Cautious } from "@/components/Assets/Cautious";
import { useSession } from "@/components/Editor/hooks/useAuth";
import {
  useAcceptInvitation,
  useGetInvitationInfo,
} from "@/components/Editor/hooks/useWorkspaces";
import { Mail } from "@/components/Assets/Mail";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hash = searchParams.get("hash");
  const hasAccepted = useRef(false);
  const hasFetchedInfo = useRef(false);

  const { user, loading: sessionLoading } = useSession({
    redirectToLogin: true,
  });
  const [state, { acceptInvitation }] = useAcceptInvitation();
  const [invitationState, { getInvitationInfo }] = useGetInvitationInfo();
  const [declined] = useState(false);

  useEffect(() => {
    if (hash && !hasFetchedInfo.current && !sessionLoading) {
      hasFetchedInfo.current = true;
      getInvitationInfo(hash);
    }
  }, [hash, sessionLoading, getInvitationInfo]);

  const invitation = invitationState.data
    ? {
        inviter: {
          name: `${invitationState.data.inviter.firstName} ${invitationState.data.inviter.lastName}`.trim(),
          avatar: `/img/avatar/avatar${(parseInt(invitationState.data.inviter.id) % 3) + 1}.svg`,
        },
        workspace: {
          name: invitationState.data.workspace.name,
          slug: invitationState.data.workspace.id,
        },
        role: invitationState.data.role,
      }
    : null;

  useEffect(() => {
    if (!state.success || declined) return () => {};

    const workspaceId = invitation?.workspace?.slug;

    const timer = setTimeout(() => {
      router.push(workspaceId ? `/workspace/${workspaceId}` : "/workspace");
    }, 2000);

    return () => clearTimeout(timer);
  }, [state.success, declined, router, invitation?.workspace?.slug]);

  const handleAccept = () => {
    if (hash && !hasAccepted.current) {
      hasAccepted.current = true;
      acceptInvitation(hash);
    }
  };

  const handleDecline = () => {
    router.push("/workspace");
  };

  if (sessionLoading || invitationState.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!hash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7FF] dark:bg-base-100 flex items-center justify-center mb-4">
            <Cautious />
          </div>
          <h1 className="text-xl font-medium font-body text-ink-100 dark:text-white">
            Invalid Invitation
          </h1>
          <p className="text-ink-300 font-body font-medium">
            This invitation link is invalid. Please check your email for the
            correct link.
          </p>
          <button
            type="button"
            onClick={() => router.push("/workspace")}
            className="w-full text-sm font-body mt-6 px-6 py-3.5 rounded-[20px] bg-[#0F0F0F] text-white font-medium"
          >
            Go to Workspace
          </button>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center  flex-col items-center justify-center">
          <div className="w-12 h-12 mx-auto rounded-xl  flex items-center justify-center mb-4">
            <Mail />
          </div>

          <h1 className="text-ink-300 font-body font-medium dark:text-ink-300">
            <Loader2 className="w-4 h-4 text-primary animate-spin mx-auto" />
            {declined ? "Declining invitation..." : "Accepting invitation..."}
          </h1>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7FF] dark:bg-base-100 flex items-center justify-center mb-4">
            <Cautious />
          </div>
          <h1 className="text-xl font-medium font-body text-ink-100 dark:text-white">
            Unable to Load Invitation
          </h1>
          <p className="text-ink-300 font-body font-medium">
            We couldn't load the invitation details. Please try again or contact
            support.
          </p>
          <button
            type="button"
            onClick={() => router.push("/workspace")}
            className="w-full text-sm font-body mt-6 px-6 py-3.5 rounded-[20px] bg-[#0F0F0F] text-white font-medium"
          >
            Go to Workspace
          </button>
        </div>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src={invitation?.inviter.avatar}
                alt={invitation.inviter.name}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <span className="text-ink-300 text-xl">+</span>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src={user?.avater || "/img/avatar/avatar3.svg"}
                alt="You"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          </div>
          <h1 className="text-xl font-medium font-body text-ink-100 dark:text-white">
            {declined ? "Invitation Declined" : "You're In!"}
          </h1>
          <p className="text-ink-300 font-body font-medium">
            {declined
              ? "You've declined this invitation. Redirecting..."
              : `You've joined ${invitation.workspace.name}. Redirecting...`}
          </p>
        </div>
      </div>
    );
  }

  if (state.error || invitationState.error) {
    const error = state.error || invitationState.error;
    const errorConfig = {
      expired: {
        title: "Invitation Expired",
        message:
          "This invitation has expired. Please ask the workspace admin to send a new one.",
      },
      invalid: {
        title: "Invalid Invitation",
        message: "This invitation is invalid or has already been used.",
      },
      unauthorized: {
        title: "Sign In Required",
        message: "You need to be signed in to accept this invitation.",
      },
      unexpected: {
        title: "Something Went Wrong",
        message: "An unexpected error occurred. Please try again later.",
      },
    };

    const errorInfo = errorConfig[error!];

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7FF] dark:bg-base-100 flex items-center justify-center mb-4">
            <Cautious />
          </div>
          <h1 className="text-xl font-medium font-body text-ink-100">
            {errorInfo.title}
          </h1>
          <p className="text-ink-300 font-body font-medium">
            {errorInfo.message}
          </p>
          <button
            type="button"
            onClick={() =>
              router.push(error === "unauthorized" ? "/signin" : "/workspace")
            }
            className="w-full text-sm font-body mt-6 px-6 py-3.5 rounded-[20px] bg-[#0F0F0F] text-white font-medium"
          >
            {error === "unauthorized" ? "Sign In" : "Go to Workspace"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-lg w-full">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#DEE2E6] dark:border-border-tertiary">
            <Image
              src={invitation.inviter.avatar}
              alt={invitation.inviter.name}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <span className="text-ink-300 text-2xl font-light">+</span>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#DEE2E6] dark:border-border-tertiary">
            <Image
              src={user?.avater || "/img/avatar/avatar3.svg"}
              alt="You"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
        </div>

        {/* Invitation text */}
        <p className="text-center text-ink-100 dark:text-white font-body mb-6">
          <span className="font-semibold">{invitation.inviter.name}</span>
          {" invited you to collaborate on "}
          <span className="font-semibold text-primary">
            {invitation.workspace.name}
          </span>
        </p>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={handleAccept}
            className="px-5 py-2.5 text-sm font-body font-medium rounded-xl  bg-[#0F0F0F] ] text-white transition-colors"
          >
            Accept invitation
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="px-5 py-2.5 text-sm font-body font-medium rounded-xl   text-ink-100 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            Decline invitation
          </button>
        </div>

        {/* Permissions section */}
        <div className="font-body p-4">
          <div className="flex items-start gap-2 mb-3">
            <p className="text-sm text-ink-300">
              <span className="font-medium text-ink-100 dark:text-white">
                Owners
              </span>
              {" of "}
              <span className="font-medium">{invitation.workspace.name}</span>
              {" will be able to see:"}
            </p>
          </div>
          <ul className="space-y-2 ml-6 text-sm text-ink-300">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-ink-300 rounded-full" />
              Your public profile information
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-ink-300 rounded-full" />
              <span>
                <span className="text-primary underline cursor-pointer">
                  Certain activity
                </span>
                {" within this workspace"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-ink-300 rounded-full" />
              Your access level for this workspace
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
