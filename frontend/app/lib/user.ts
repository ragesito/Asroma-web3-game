const API = process.env.NEXT_PUBLIC_API_URL;

export async function updateAvatar(token: string, file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API}/api/users/update-avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
