import "@/styles/app.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { Storage } from "@aws-amplify/storage";

Amplify.configure(outputs);
Amplify.register(Storage);

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
