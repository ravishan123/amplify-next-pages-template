import { defineStorage } from "@aws-amplify/backend";
import { defineFunction } from "@aws-amplify/backend";

export const onUploadHandler = defineFunction({
  entry: "./on-upload-handler.ts",
});

export const storage = defineStorage({
  name: "documents",
  triggers: {
    onUpload: onUploadHandler,
  },
  access: (allow) => ({
    // Documents folder - authenticated users can write, everyone can read
    "documents/": [
      allow.authenticated.to(["read", "write", "delete"]),
      allow.guest.to(["read", "write"]),
    ],
    // Public folder - authenticated users can write, everyone can read
    "public/": [
      allow.authenticated.to(["read", "write", "delete"]),
      allow.guest.to(["read", "write"]),
    ],
  }),
});
