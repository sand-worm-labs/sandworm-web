"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";

// =====================================
// ⬢ Types
// =====================================
interface ProfileFormData {
  username: string;
  bio: string;
  github: string;
  discord: string;
  telegram: string;
  email: string;
  farcaster: string;
  firstName: string;
  lastName: string;
}

interface SessionUser {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avater?: string;
  fullName?: string;
  settings?: {
    statusText?: string;
    socialLinks?: {
      github?: string | null;
      discord?: string | null;
      telegram?: string | null;
      email?: string | null;
      twitter?: string | null;
      warpcast?: string | null;
    };
  };
}

interface UseProfileFormProps {
  user: SessionUser | null | undefined;
  updateProfile: (params: {
    user?: { username?: string; firstName?: string; lastName?: string };
    socialLinks?: {
      github?: string | null;
      discord?: string | null;
      telegram?: string | null;
      email?: string | null;
      warpcast?: string | null;
    };
    statusText?: string;
  }) => Promise<void>;
  loading: boolean;
  onSuccess?: () => void;
}

const initialFormData: ProfileFormData = {
  username: "",
  bio: "",
  github: "",
  discord: "",
  telegram: "",
  email: "",
  farcaster: "",
  firstName: "",
  lastName: "",
};

// =====================================
// ⬢ use Profile Form Hook
// =====================================
export function useProfileForm({
  user,
  updateProfile,
  loading,
  onSuccess,
}: UseProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: user.settings?.statusText || "",
        github: user.settings?.socialLinks?.github || "",
        discord: user.settings?.socialLinks?.discord || "",
        telegram: user.settings?.socialLinks?.telegram || "",
        email: user.settings?.socialLinks?.email || "",
        farcaster: user.settings?.socialLinks?.warpcast || "",
      });
    }
  }, [
    user?.firstName,
    user?.lastName,
    user?.username,
    user?.settings?.statusText,
    user?.settings?.socialLinks?.github,
    user?.settings?.socialLinks?.discord,
    user?.settings?.socialLinks?.telegram,
    user?.settings?.socialLinks?.email,
    user?.settings?.socialLinks?.warpcast,
  ]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (updateSuccess) setUpdateSuccess(false);
      if (submitError) setSubmitError(null);
    },
    [updateSuccess, submitError]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setUpdateSuccess(false);
      setSubmitError(null);

      try {
        await updateProfile({
          user: {
            username: formData.username || undefined,
            firstName: formData.firstName || undefined,
            lastName: formData.lastName || undefined,
          },
          socialLinks: {
            github: formData.github || null,
            discord: formData.discord || null,
            telegram: formData.telegram || null,
            email: formData.email || null,
            warpcast: formData.farcaster || null,
          },
          statusText: formData.bio || undefined,
        });

        setUpdateSuccess(true);
        onSuccess?.();
        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (err) {
        console.error("Failed to update profile:", err);
        setSubmitError("Failed to update profile. Please try again.");
      }
    },
    [formData, updateProfile, onSuccess]
  );

  const resetForm = useCallback(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: "",
        github: "",
        discord: "",
        telegram: "",
        email: "",
        farcaster: "",
      });
    }
    setUpdateSuccess(false);
    setSubmitError(null);
  }, [user]);

  return {
    formData,
    handleChange,
    handleSubmit,
    resetForm,
    updateSuccess,
    submitError,
    isSubmitting: loading,
  };
}
