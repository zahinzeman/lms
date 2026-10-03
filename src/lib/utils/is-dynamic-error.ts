export function isDynamicServerError(err: unknown): boolean {
  if (err && typeof err === "object" && "digest" in err) {
    return (err as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE";
  }
  return false;
}
