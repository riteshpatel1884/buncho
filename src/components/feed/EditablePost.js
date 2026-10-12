"use client";
import { useState, useTransition } from "react";
import PostCard from "./PostCard";
import Spinner from "../Spinner";
import { showToast } from "../Toast";
import { updatePost } from "@/app/feed/actions";
import { TOPICS, MAX_POST } from "@/lib/feed/feed";

// Shows a post as usual, with an Edit button under it. Edit swaps the card for a small form.
export default function EditablePost({ post, signedIn, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(post.body);
  const [topic, setTopic] = useState(post.topic ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const topicOptional = !!post.viewerIsAdmin;

  function open() {
    setBody(post.body);
    setTopic(post.topic ?? "");
    setError("");
    setEditing(true);
  }

  function save(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await updatePost(post.id, body, topic);
      if (res?.error) {
        setError(res.error);
        return;
      }
      onUpdated(post.id, { body: res.body, topic: res.topic });
      showToast("Post updated", "success");
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="space-y-2">
        {/* PostCard copies `post` into its own state once, so a new key makes it show the edited text. */}
        <PostCard key={`${post.body}|${post.topic ?? ""}`} post={post} signedIn={signedIn} onDeleted={onDeleted} />
        <div className="flex justify-end">
          <button type="button" onClick={open} className="btn-outline cursor-pointer !px-4 !py-1.5">Edit post</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="card space-y-3 p-5">
      <p className="font-display text-lg">Edit post</p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        required
        minLength={20}
        maxLength={MAX_POST}
        aria-label="Post"
        className="input"
        autoFocus
      />
      <select value={topic} onChange={(e) => setTopic(e.target.value)} required={!topicOptional} className="input" aria-label="Topic">
        {topicOptional ? <option value="">No category</option> : <option value="" disabled>Choose a topic</option>}
        {Object.entries(TOPICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <p className="text-xs text-muted">Don't include phone numbers, emails, links or handles. {body.length}/{MAX_POST}</p>
      {error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setEditing(false)} disabled={pending} className="btn-outline">Cancel</button>
        <button disabled={pending || body.trim().length < 20} className="btn-primary">
          {pending ? (<><Spinner />Saving</>) : "Save changes"}
        </button>
      </div>
    </form>
  );
}