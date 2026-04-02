const parseAdminEmails = () => {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_MAIL || "";

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export const getConfiguredAdminEmails = () => parseAdminEmails();

export const isConfiguredAdminEmail = (email?: string | null) => {
  if (!email) return false;

  const configuredEmails = parseAdminEmails();
  return configuredEmails.includes(email.trim().toLowerCase());
};
