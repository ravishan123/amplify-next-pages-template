import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "documents",
  triggers: {
    onUpload: require("./on-upload-handler").handler,
  },
  access: (allow) => ({
    // Only authenticated users can write, everyone can read
    "documents/*": [
      allow.authenticated.to(["read", "write"]),
      allow.guest.to(["read"]),
    ],
  }),
});
