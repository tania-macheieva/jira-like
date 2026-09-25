import { useEffect, useState } from "react";
import { jsonRequest, request } from "../api/client";
import ErrorBanner from "./ErrorBanner";

const STATUSES = ["to_do", "in_progress", "review", "qa", "done"];
const ISSUE_TYPES = ["task", "bug", "story", "feature"];

export default function IssueDetailModal({
  issue,
  currentUser,
  epics,
  sprints,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [form, setForm] = useState({
    title: issue.title,
    description: issue.description || "",
    status: issue.status,
    issue_type: issue.issue_type,
    epic_id: issue.epic_id || "",
    sprint_id: issue.sprint_id || "",
  });
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingBody, setEditingBody] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    request(`/issues/${issue.id}/comments`)
      .then((data) => setComments(data.comments))
      .catch((requestError) => setError(requestError.message));
  }, [issue.id]);

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      setSaving(true);
      const data = await jsonRequest(`/issues/${issue.id}`, "PATCH", {
        issue: {
          ...form,
          epic_id: form.epic_id || null,
          sprint_id: form.sprint_id || null,
        },
      });
      onUpdated(data.issue);
      setSuccess("Issue updated successfully.");
      window.setTimeout(() => setSuccess(""), 3000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      const data = await jsonRequest(`/issues/${issue.id}/comments`, "POST", {
        comment: { body: comment },
      });
      setComments((current) => [...current, data.comment]);
      setComment("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const startEditingComment = (item) => {
    setEditingCommentId(item.id);
    setEditingBody(item.body);
    setError("");
  };

  const updateComment = async (event) => {
    event.preventDefault();
    if (!editingBody.trim()) return;
    try {
      setCommentBusy(true);
      const data = await jsonRequest(`/comments/${editingCommentId}`, "PATCH", {
        comment: { body: editingBody },
      });
      setComments((current) =>
        current.map((item) => item.id === editingCommentId ? data.comment : item),
      );
      setEditingCommentId(null);
      setEditingBody("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCommentBusy(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      setCommentBusy(true);
      await request(`/comments/${commentId}`, { method: "DELETE" });
      setComments((current) => current.filter((item) => item.id !== commentId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCommentBusy(false);
    }
  };

  const removeIssue = async () => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      setDeleting(true);
      await request(`/issues/${issue.id}`, { method: "DELETE" });
      onDeleted(issue.id);
    } catch (requestError) {
      setError(requestError.message);
      setDeleting(false);
    }
  };

  const updateForm = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-detail-title"
      >
        <div className="modal-header">
          <div>
            <small>ISSUE-{issue.id}</small>
            <h2 id="issue-detail-title">Issue details</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close issue details"
          >
            x
          </button>
        </div>
        <ErrorBanner message={error} onDismiss={() => setError("")} />
        {success && <div className="success" role="status">{success}</div>}
        <form onSubmit={save} className="issue-form">
          <label>
            Title
            <input value={form.title} onChange={updateForm("title")} required />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={updateForm("description")}
              rows="4"
            />
          </label>
          <div className="form-grid">
            <label>
              Status
              <select value={form.status} onChange={updateForm("status")}>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select
                value={form.issue_type}
                onChange={updateForm("issue_type")}
              >
                {ISSUE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Epic
              <select value={form.epic_id} onChange={updateForm("epic_id")}>
                <option value="">No epic</option>
                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sprint
              <select value={form.sprint_id} onChange={updateForm("sprint_id")}>
                <option value="">No sprint</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="danger-button"
              onClick={removeIssue}
              disabled={deleting}
            >
              Delete
            </button>
            <span />
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button disabled={saving}>
              {saving ? "Saving..." : success ? "Saved" : "Save changes"}
            </button>
          </div>
        </form>
        <section className="comments">
          <h3>Comments</h3>
          {comments.map((item) => (
            <article className="comment" key={item.id}>
              <div className="comment-author">
                <strong>{item.user?.name || `User #${item.user_id}`}</strong>
                {item.user?.email && <small>{item.user.email}</small>}
              </div>
              {editingCommentId === item.id ? (
                <form onSubmit={updateComment} className="comment-edit-form">
                  <textarea value={editingBody} onChange={(event) => setEditingBody(event.target.value)} rows="3" aria-label="Edit comment" />
                  <div className="comment-actions">
                    <button type="button" className="secondary-button" onClick={() => setEditingCommentId(null)}>Cancel</button>
                    <button disabled={commentBusy || !editingBody.trim()}>Save</button>
                  </div>
                </form>
              ) : (
                <>
                  <p>{item.body}</p>
                  {item.user_id === currentUser.id && <div className="comment-actions">
                      <button type="button" className="text-button" onClick={() => startEditingComment(item)}>Edit</button>
                      <button type="button" className="text-button danger-text" onClick={() => deleteComment(item.id)} disabled={commentBusy}>Delete</button>
                  </div>}
                </>
              )}
            </article>
          ))}
          {!comments.length && <p className="empty">No comments yet.</p>}
          <form onSubmit={addComment} className="comment-form">
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a comment"
              aria-label="Add a comment"
            />
            <button disabled={!comment.trim()}>Comment</button>
          </form>
        </section>
      </section>
    </div>
  );
}
