export function resolveAvatarUrl(avatar?: string) {
  const API = process.env.NEXT_PUBLIC_API_URL;

  if (!avatar) {
    return `${API}/uploads/default-avatar.jpg`;
  }

  if (avatar.startsWith("http")) {
    return avatar;
  }

  return `${API}${avatar}`;
} 
