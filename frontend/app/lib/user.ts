export async function updateAvatar(token: string, file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch("http://localhost:5000/api/users/update-avatar", { 
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error updating avatar: ${error}`);
  }

  return await res.json();
}
