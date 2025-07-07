import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "@aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadMessage("");
    try {
      await uploadData({ key: file.name, data: file }).result;
      setUploadMessage("File uploaded successfully!");
      setFile(null);
    } catch (err) {
      setUploadMessage("Upload failed: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <form onSubmit={handleFileUpload} style={{ marginTop: 24 }}>
        <h2>Upload a file</h2>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={uploading}
        />
        <button
          type="submit"
          disabled={!file || uploading}
          style={{ marginLeft: 8 }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {uploadMessage && <div style={{ marginTop: 8 }}>{uploadMessage}</div>}
      </form>
      <div>
        🥳 App successfully hosted. Try creating a new todo or uploading a file.
        <br />
        <a href="https://docs.amplify.aws/gen2/start/quickstart/nextjs-pages-router/">
          Review next steps of this tutorial.
        </a>
      </div>
    </main>
  );
}
