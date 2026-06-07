function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

export function cloudinaryCloudName(): string {
  return trimEnv("CLOUDINARY_CLOUD_NAME") || trimEnv("VITE_CLOUDINARY_CLOUD_NAME");
}

export function isCloudinaryAdminConfigured(): boolean {
  const cloud = cloudinaryCloudName();
  return !!(cloud && trimEnv("CLOUDINARY_API_KEY") && trimEnv("CLOUDINARY_API_SECRET"));
}

export function cloudinaryApiKey(): string {
  return trimEnv("CLOUDINARY_API_KEY");
}

export function cloudinaryApiSecret(): string {
  return trimEnv("CLOUDINARY_API_SECRET");
}
