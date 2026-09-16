export function adminAuthorized(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  const header = req.headers.get("x-admin-secret");
  const url = new URL(req.url);
  const query = url.searchParams.get("key");
  return header === secret || query === secret;
}
