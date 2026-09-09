import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import {
  MODEL_OPTIONS,
  DEFAULT_MODEL_ID,
  PROVIDER_DEFERRED_TEXT,
  canSendMessage,
  normalizeModelId,
} from '../lib/chat';

/** Props for the chat view (F1/F2/F3). */
export interface ChatViewProps {
  /** The Strapi users-permissions user id, used to scope Convex data (AC5). */
  ownerUserId: string;
}

/** Short label for a model id (e.g. "GPT-4o" from "gpt-4o"). */
function shortModelLabel(id: string | null): string {
  const option = MODEL_OPTIONS.find((o) => o.id === id);
  if (!option) return 'No model';
  return option.label.replace(/^Claude 3\.5 Sonnet$/, 'Claude 3.5').replace(/^Gemini 1\.5 Pro$/, 'Gemini 1.5');
}

/**
 * Chat view (wireframe 2; F1/F2/F3). The dashboard talks directly to Convex
 * (Q2); it never routes chat through apps/api. Messages are scoped to the
 * caller's `ownerUserId` so a user only sees its own conversations (AC5).
 */
export function ChatView({ ownerUserId }: ChatViewProps) {
  const conversations = useQuery(api.conversations.listOwnConversations, {
    ownerUserId,
  });
  const [activeId, setActiveId] = useState<Id<'conversations'> | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const messages = useQuery(
    api.conversations.listMessages,
    activeId ? { conversationId: activeId } : 'skip',
  );
  const createConversation = useMutation(api.conversations.createConversation);
  const sendMessage = useMutation(api.conversations.sendMessage);
  const updateModelId = useMutation(api.conversations.updateModelId);

  const activeConversation =
    conversations?.find((c) => c._id === activeId) ?? null;

  async function handleNewChat() {
    const newId = await createConversation({
      ownerUserId,
      title: 'New conversation',
      modelId: DEFAULT_MODEL_ID,
    });
    setActiveId(newId);
  }

  async function handleSend() {
    if (!activeId || !canSendMessage(draft) || sending) return;
    const content = draft.trim();
    setSending(true);
    setDraft('');
    try {
      await sendMessage({ conversationId: activeId, role: 'user', content });
    } finally {
      setSending(false);
    }
  }

  function handleModelChange(next: string) {
    if (!activeId) return;
    updateModelId({
      conversationId: activeId,
      modelId: normalizeModelId(next),
    });
  }

  // Conversation list (sidebar)
  const isEmpty = conversations !== undefined && conversations.length === 0;
  const modelId = activeConversation
    ? normalizeModelId(activeConversation.modelId)
    : DEFAULT_MODEL_ID;

  const query = filter.trim().toLowerCase();
  const visibleConversations = query
    ? (conversations ?? []).filter((c) =>
        `${c.title} ${c.modelId ?? ''}`.toLowerCase().includes(query),
      )
    : (conversations ?? []);

  return (
    <div className="chat-layout">
      <aside className="conversations" aria-label="Sessions">
        <div className="conversations-header">
          <h2>Sessions</h2>
          <button type="button" onClick={handleNewChat}>
            + New chat
          </button>
        </div>

        <input
          ref={searchRef}
          className="session-search"
          type="search"
          value={filter}
          placeholder="Search sessions…  (⌘K)"
          aria-label="Search sessions"
          onChange={(event) => setFilter(event.target.value)}
        />

        {conversations === undefined && (
          <div aria-label="Loading sessions">
            <div className="skeleton" />
          </div>
        )}

        {isEmpty && (
          <p className="empty" role="status">
            You have no conversations yet. Start your first chat — pick a model
            and send your opening message.
          </p>
        )}

        {!isEmpty && conversations !== undefined && visibleConversations.length === 0 && (
          <p className="empty" role="status">
            No sessions match “{filter.trim()}”. Clear the search or start a new
            chat.
          </p>
        )}

        <ul className="session-list">
          {visibleConversations.map((conversation) => (
            <li key={conversation._id}>
              <button
                type="button"
                className={
                  conversation._id === activeId
                    ? 'conversation active'
                    : 'conversation'
                }
                aria-current={conversation._id === activeId ? 'true' : undefined}
                onClick={() => setActiveId(conversation._id)}
              >
                <span className="conv-title">{conversation.title}</span>
                <span className="conv-meta">
                  <span
                    className="model-dot"
                    data-model={conversation.modelId ?? ''}
                    aria-hidden="true"
                  />
                  {shortModelLabel(
                    normalizeModelId(conversation.modelId),
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="chat-pane" aria-label="Conversation">
        {!activeConversation ? (
          <div className="chat-empty">
            <h2>Start a session</h2>
            <p>
              Select a session on the left or start a new one. Every session
              keeps its own model and history.
            </p>
            <button type="button" onClick={handleNewChat}>
              Start your first chat
            </button>
          </div>
        ) : (
          <>
            <header className="chat-header">
              <h3>{activeConversation.title}</h3>
              <div
                className="model-switch"
                role="group"
                aria-label="Model for this session"
              >
                {MODEL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={(modelId ?? '') === option.id}
                    title={option.label}
                    onClick={() => handleModelChange(option.id)}
                  >
                    {shortModelLabel(option.id)}
                  </button>
                ))}
              </div>
            </header>

            <div className="messages" aria-live="polite">
              {messages === undefined && (
                <div aria-label="Loading messages">
                  <div className="skeleton" />
                  <div className="skeleton" style={{ marginTop: '0.6rem' }} />
                </div>
              )}
              {messages?.map((message) => (
                <div
                  key={message._id}
                  className={`message message-${message.role}`}
                >
                  <span className="message-role">
                    {message.role === 'user'
                      ? 'You'
                      : shortModelLabel(modelId)}
                  </span>
                  <p>{message.content}</p>
                </div>
              ))}

              {/* Provider-deferred assistant slot (Q5/AC9): a static notice, never
                  persisted as simulated assistant content. */}
              <div className="message message-assistant provider-deferred">
                <span className="message-role">Assistant</span>
                <p>{PROVIDER_DEFERRED_TEXT}</p>
              </div>
            </div>

            <div className="composer-wrap">
              <form
                className="composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend();
                }}
              >
                <input
                  value={draft}
                  placeholder={`Message ${shortModelLabel(modelId)}…`}
                  aria-label="Message"
                  onChange={(event) => setDraft(event.target.value)}
                />
                <button
                  type="submit"
                  disabled={!canSendMessage(draft) || sending}
                >
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </form>
              <p className="composer-hint">
                Each session keeps its own model · Enter to send
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
