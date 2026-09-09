import { useState } from 'react';
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

  return (
    <div className="chat-layout">
      <aside className="conversations">
        <div className="conversations-header">
          <h2>Conversations</h2>
          <button type="button" onClick={handleNewChat}>
            + New chat
          </button>
        </div>

        {conversations === undefined && <p className="muted">Loading…</p>}

        {isEmpty && (
          <p className="empty" role="status">
            You have no conversations yet. Start your first chat.
          </p>
        )}

        {conversations?.map((conversation) => (
          <button
            key={conversation._id}
            type="button"
            className={
              conversation._id === activeId
                ? 'conversation active'
                : 'conversation'
            }
            onClick={() => setActiveId(conversation._id)}
          >
            {conversation.title}
          </button>
        ))}
      </aside>

      <section className="chat-pane">
        {!activeConversation ? (
          <div className="chat-empty">
            <p>Select a conversation or start a new one to begin.</p>
            <button type="button" onClick={handleNewChat}>
              Start your first chat
            </button>
          </div>
        ) : (
          <>
            <header className="chat-header">
              <h3>{activeConversation.title}</h3>
              <label>
                Model:{' '}
                <select
                  value={modelId ?? ''}
                  onChange={(event) => handleModelChange(event.target.value)}
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </header>

            <div className="messages">
              {messages === undefined && (
                <p className="muted">Loading messages…</p>
              )}
              {messages?.map((message) => (
                <div
                  key={message._id}
                  className={`message message-${message.role}`}
                >
                  <span className="message-role">
                    {message.role === 'user' ? 'You' : 'Assistant'}
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

            <form
              className="composer"
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
            >
              <input
                value={draft}
                placeholder="Type a message…"
                onChange={(event) => setDraft(event.target.value)}
              />
              <button
                type="submit"
                disabled={!canSendMessage(draft) || sending}
              >
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
