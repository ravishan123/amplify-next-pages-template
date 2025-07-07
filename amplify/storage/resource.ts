import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "documents",
  triggers: {
    onUpload: import("./on-upload-handler").then((m) => m.handler),
  },
  access: (allow) => ({
    // Only authenticated users can write, everyone can read
    "documents/*": [
      allow.authenticated.to(["read", "write"]),
      allow.guest.to(["read"]),
    ],
  }),
});
