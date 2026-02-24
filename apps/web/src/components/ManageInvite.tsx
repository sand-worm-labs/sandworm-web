import React, { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

import { User } from "./Assets/Avatar/User";
import { useInviteUserToWorkspace } from "./Visualization/hooks/useWorkspaces";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type UserRole = "owner" | "editor" | "viewer";

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface PendingInvite {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  invitedAt: Date;
  avatar?: string;
}

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: UserRole;
  requestedAt: Date;
  message?: string;
  avatar?: string;
}

interface ManageInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceMembers: WorkspaceMember[];
  pendingInvites: PendingInvite[];
  pendingRequests?: PendingRequest[];
  onSendInvite: (email: string, role: UserRole) => Promise<void>;
  onCancelInvite: (inviteId: string) => Promise<void>;
  onApproveRequest?: (requestId: string) => Promise<void>;
  onDenyRequest?: (requestId: string) => Promise<void>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

  if (diffInMonths >= 1) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays >= 1) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return "Today";
};

// ============================================================================
// INVITE FORM COMPONENT
// ============================================================================

interface InviteFormProps {
  onSendInvite: (email: string, role: UserRole) => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteForm: React.FC<InviteFormProps> = ({ onSendInvite }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return;

    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await onSendInvite(email, "editor");
      setEmail("");
    } catch (err) {
      console.error("Failed to send invite:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-base font-medium text-ink-100 mb-3">Invite users</h3>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Samsonderulo@gmail.com"
            className="flex-1 px-4 py-2.5 border border-[#DEE2E6] bg-[#F8F9FA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A308F0] placeholder:text-[#868E96] text-sm font-medium"
            disabled={isLoading}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="px-6 py-2.5 bg-[#A308F0] text-white disabled:text-[#E9ECEF] font-medium font-body rounded-xl disabled:bg-[#868E96] disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isLoading ? "Sending..." : "Send invite"}
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// PENDING REQUEST ITEM COMPONENT
// ============================================================================

interface PendingRequestItemProps {
  request: PendingRequest;
  onApprove: (requestId: string) => Promise<void>;
  onDeny: (requestId: string) => Promise<void>;
}

const PendingRequestItem: React.FC<PendingRequestItemProps> = ({
  request,
  onApprove,
  onDeny,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isDenying, setIsDenying] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(request.id);
    } catch (error) {
      console.error("Failed to approve request:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeny = async () => {
    setIsDenying(true);
    try {
      await onDeny(request.id);
    } catch (error) {
      console.error("Failed to deny request:", error);
    } finally {
      setIsDenying(false);
    }
  };

  const isProcessing = isApproving || isDenying;

  return (
    <div className="flex items-start gap-3 p-4">
      <User size={30} />

      <div className="flex-1 min-w-0">
        <p className="mb-1">
          <span className="font-medium text-ink-100 mr-1">{request.name}</span>
          <span className="text-sm text-[#343A40]">requested access as</span>
          <span className="text-[13px] font-medium text-[#A308F0] font-tertiary ml-1">
            {request.requestedRole}
          </span>
        </p>
        <div className="text-sm text-[#6C757D]">
          {request.email} | {getTimeAgo(request.requestedAt)}
        </div>
        {request.message && (
          <p className="text-sm text-[#6C757D] mt-1 italic">
            "{request.message}"
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isProcessing}
          className="px-3 py-1 text-xs font-medium bg-[#F8F9FA] border border-[#DEE2E6] text-[#1A1A1A] rounded-md  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
        <button
          type="button"
          onClick={handleDeny}
          disabled={isProcessing}
          className="px-2 py-2 text-xs font-medium  bg-[#FF0000]  rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <X className="w-[14px] h-[14px] text-[#F8F9FA]" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// PENDING INVITE ITEM COMPONENT
// ============================================================================

interface PendingInviteItemProps {
  invite: PendingInvite;
  onCancel: (inviteId: string) => Promise<void>;
}

const PendingInviteItem: React.FC<PendingInviteItemProps> = ({
  invite,
  onCancel,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel(invite.id);
    } catch (error) {
      console.error("Failed to cancel invite:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 ">
      {/* Avatar */}
      <User size={30} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className=" mb-1">
          <span className="font-medium text-ink-100 mr-1">{invite.name} </span>
          <span className="text-sm text-[#343A40]">
            invited to collaborate as
          </span>
          <span className="text-[13px] font-medium text-[#A308F0] font-tertiary  ml-1 ">
            {invite.role}
          </span>
        </p>
        <div className="text-sm text-[#6C757D]">
          {invite.email} | {getTimeAgo(invite.invitedAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-[#6C757D] font-medium bg-[#F8F9FA] py-1 px-2.5 rounded-md">
          Pending
        </span>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCancelling}
          className="px-2.5 py-1 text-xs font-medium border border-[#DEE2E6] bg-[#F8F9FA] rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel Invite
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// PENDING TABS CONTENT COMPONENT
// ============================================================================

interface PendingTabsContentProps {
  invites: PendingInvite[];
  requests: PendingRequest[];
  onCancelInvite: (inviteId: string) => Promise<void>;
  onApproveRequest: (requestId: string) => Promise<void>;
  onDenyRequest: (requestId: string) => Promise<void>;
}

const PendingTabsContent: React.FC<PendingTabsContentProps> = ({
  invites,
  requests,
  onCancelInvite,
  onApproveRequest,
  onDenyRequest,
}) => {
  const [activeTab, setActiveTab] = useState<"requests" | "invites">("invites");

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`pb-2 text-sm font-medium transition-colors relative ${
            activeTab === "requests"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-[#6C757D] hover:text-gray-700"
          }`}
        >
          Pending requests
          {requests.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#A308F0] text-white rounded-full">
              {requests.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("invites")}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === "invites"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-[#6C757D] hover:text-gray-700"
          }`}
        >
          Pending invites
          {invites.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#6C757D] text-white rounded-full">
              {invites.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-2 divide-y divide-[#E9ECEF]">
        {activeTab === "requests" ? (
          requests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No pending requests
            </p>
          ) : (
            requests.map(request => (
              <PendingRequestItem
                key={request.id}
                request={request}
                onApprove={onApproveRequest}
                onDeny={onDenyRequest}
              />
            ))
          )
        ) : invites.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No pending invites
          </p>
        ) : (
          invites.map(invite => (
            <PendingInviteItem
              key={invite.id}
              invite={invite}
              onCancel={onCancelInvite}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// WORKSPACE DESCRIPTION COMPONENT
// ============================================================================

interface WorkspaceDescriptionProps {
  members: WorkspaceMember[];
}

const WorkspaceDescription: React.FC<WorkspaceDescriptionProps> = ({
  members,
}) => {
  return (
    <div className=" rounded-xl p-1 px-0 w-full text-ink-100">
      <div className="relative w-full">
        <Image
          src="/img/workspace-banner.svg"
          width={350}
          height={250}
          alt="workspace banner"
          className="object-cover w-full"
        />
      </div>
      {/* Description */}
      <div className="mt-8">
        <h3 className="text-sm font-bold mb-2 text-ink-100">Description</h3>
        <p className="text-sm text-[#6C757D] font-medium mb-4">
          Invite people to collaborate with you on your workspace. There are 3
          levels of access.
        </p>

        {/* Role Badges */}
        <div className="flex gap-2 mb-4 font-tertiary">
          <span className="bg-rainbow-gradient p-[1px] rounded-[8px] inline-block">
            <span className="px-2 py-1 text-xs rounded-[7px] bg-[#F8F9FA] inline-block">
              Owner
            </span>
          </span>

          <span className="bg-rainbow-gradient p-[1px] rounded-[8px] inline-block">
            <span className="px-2 py-1 text-xs rounded-[7px] bg-[#F8F9FA]  inline-block">
              Editor
            </span>
          </span>

          <span className="bg-rainbow-gradient p-[1px] rounded-[8px] inline-block">
            <span className="px-2 py-1 text-xs rounded-[7px] bg-[#F8F9FA]  inline-block">
              Viewer
            </span>
          </span>
        </div>

        {/* Role Descriptions */}
        <ul className="space-y-1 mt-2 text-sm opacity-90">
          <li className="flex items-start gap-2 text-[#6C757D] font-medium ">
            <span className="mt-1 text-[#6C757D]">•</span>
            <span>Owners have full access to the workspace</span>
          </li>
          <li className="flex items-start gap-2 text-[#6C757D] font-medium">
            <span className="mt-1">•</span>
            <span>Editors have edit access to the workspace</span>
          </li>
          <li className="flex items-start gap-2 text-[#6C757D] font-medium">
            <span className="mt-1">•</span>
            <span>Viewers can only view files.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

const ManageInviteModal: React.FC<ManageInviteModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceMembers,
  pendingInvites,
  pendingRequests = [],
  onCancelInvite,
  refetchInvite = async () => {},
  onApproveRequest = async () => {},
  onDenyRequest = async () => {},
}) => {
  if (!isOpen) return null;
  const { inviteUser } = useInviteUserToWorkspace(workspaceId);

  const handleSendInvite = async (email: string, role: UserRole) => {
    const success = await inviteUser(email, workspaceId, role);
    if (success) {
      refetchInvite();
      toast.success(`Invitation sent to ${email}`);
    } else {
      toast.error("Failed to send invitation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0000001A] " onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl  max-w-6xl w-full max-h-[90vh] overflow-hidden mx-4">
        <div className="flex h-full">
          {/* Left Panel - Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-ink-100">
                Manage Invite
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#1C3B5A]" />
              </button>
            </div>

            {/* Invite Form */}
            <InviteForm onSendInvite={handleSendInvite} />

            {/* Pending Tabs Content */}
            <PendingTabsContent
              invites={pendingInvites}
              requests={pendingRequests}
              onCancelInvite={onCancelInvite}
              onApproveRequest={onApproveRequest}
              onDenyRequest={onDenyRequest}
            />
          </div>

          {/* Right Panel - Description */}
          <div className="w-[410px] p-4 border-l border-[#E9ECEF]">
            <WorkspaceDescription members={workspaceMembers} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ManageInviteModal;
export type {
  ManageInviteModalProps,
  UserRole,
  WorkspaceMember,
  PendingInvite,
  PendingRequest,
};
