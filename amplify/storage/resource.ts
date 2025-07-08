import { defineStorage } from "@aws-amplify/backend";
import { defineFunction } from "@aws-amplify/backend";

const onUploadHandler = defineFunction({
  entry: "./on-upload-handler.ts",
});

export const storage = defineStorage({
  name: "documents",
  triggers: {
    onUpload: onUploadHandler,
  },
  access: (allow) => ({
    // Only authenticated users can write, everyone can read
    "documents/*": [
      allow.authenticated.to(["read", "write"]),
      allow.guest.to(["read"]),
    ],
  }),
});
