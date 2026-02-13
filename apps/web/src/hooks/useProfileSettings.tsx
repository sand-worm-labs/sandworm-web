"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface ProfileFormData {
  username: string;
  bio: string;
  github: string;
  discord: string;
  telegram: string;
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
}

interface UserSettings {
  statusText?: string;
  socialLinks?: {
    github?: string | null;
    discord?: string | null;
    telegram?: string | null;
  };
}

interface UseProfileFormProps {
  user: SessionUser | null | undefined;
  settings: UserSettings | null | undefined;
  updateUser: (data: Partial<{ username?: string }>) => Promise<void>;
  updateUserSettings: (data: {
    statusText?: string;
    socialLinks?: {
      github?: string | null;
      discord?: string | null;
      telegram?: string | null;
    };
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
  firstName: "",
  lastName: "",
};

export function useProfileForm({
  user,
  settings,
  updateUser,
  updateUserSettings,
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
        bio: settings?.statusText || "",
        github: settings?.socialLinks?.github || "",
        discord: settings?.socialLinks?.discord || "",
        telegram: settings?.socialLinks?.telegram || "",
      });
    }
  }, [
    user?.firstName,
    user?.lastName,
    user?.username,
    settings?.statusText,
    settings?.socialLinks?.github,
    settings?.socialLinks?.discord,
    settings?.socialLinks?.telegram,
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
        await updateUser({
          username: formData.username || undefined,
        });

        await updateUserSettings({
          statusText: formData.bio || undefined,
          socialLinks: {
            github: formData.github || null,
            discord: formData.discord || null,
            telegram: formData.telegram || null,
          },
        });

        setUpdateSuccess(true);
        onSuccess?.();

        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (err) {
        console.error("Failed to update profile:", err);
        setSubmitError("Failed to update profile. Please try again.");
      }
    },
    [formData, updateUser, updateUserSettings, onSuccess]
  );

  const resetForm = useCallback(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: settings?.statusText || "",
        github: settings?.socialLinks?.github || "",
        discord: settings?.socialLinks?.discord || "",
        telegram: settings?.socialLinks?.telegram || "",
      });
    }
    setUpdateSuccess(false);
    setSubmitError(null);
  }, [user, settings]);

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
