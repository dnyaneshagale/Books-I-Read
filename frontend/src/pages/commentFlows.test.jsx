import React from 'react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { socialApiMock, bookApiMock } = vi.hoisted(() => ({
  socialApiMock: {
    getFollowingReflections: vi.fn(),
    getEveryoneReflections: vi.fn(),
    searchReflections: vi.fn(),
    createReflection: vi.fn(),
    deleteReflection: vi.fn(),
    updateReflectionPrivacy: vi.fn(),
    toggleLikeReflection: vi.fn(),
    toggleSaveReflection: vi.fn(),
    getReflection: vi.fn(),
    getReflectionComments: vi.fn(),
    getReflectionCommentReplies: vi.fn(),
    addReflectionComment: vi.fn(),
    deleteReflectionComment: vi.fn(),
    searchUsers: vi.fn(),
  },
  bookApiMock: {
    getAllBooks: vi.fn(),
  },
}));

vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, username: 'me' } }),
}));

vi.mock('../api/socialApi', () => ({
  default: socialApiMock,
}));

vi.mock('../api/bookApi', () => ({
  default: bookApiMock,
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const baseReflection = {
  id: 42,
  content: 'Reflection body',
  createdAt: '2026-03-01T10:00:00.000Z',
  commentsCount: 0,
  likesCount: 0,
  savesCount: 0,
  hasLiked: false,
  hasSaved: false,
  visibleToFollowersOnly: false,
  user: {
    id: 1,
    username: 'me',
    displayName: 'Me',
  },
};

const renderWithProviders = (ui, initialPath = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Comment flows', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    const topLevelComments = [];
    const repliesByParent = {};
    let nextId = 100;

    socialApiMock.getFollowingReflections.mockResolvedValue({
      data: {
        content: [baseReflection],
        page: { number: 0, totalPages: 1 },
      },
    });
    socialApiMock.getEveryoneReflections.mockResolvedValue({
      data: {
        content: [baseReflection],
        page: { number: 0, totalPages: 1 },
      },
    });
    socialApiMock.searchReflections.mockResolvedValue({
      data: { content: [], page: { number: 0, totalPages: 1 } },
    });

    socialApiMock.getReflection.mockResolvedValue({ data: baseReflection });

    socialApiMock.getReflectionComments.mockImplementation(async () => ({
      data: {
        content: topLevelComments,
        page: { number: 0, totalPages: 1 },
      },
    }));

    socialApiMock.getReflectionCommentReplies.mockImplementation(async (commentId) => ({
      data: repliesByParent[Number(commentId)] || [],
    }));

    socialApiMock.addReflectionComment.mockImplementation(async (_reflectionId, text, parentId) => {
      const created = {
        id: ++nextId,
        parentId: parentId ?? null,
        content: text,
        createdAt: '2026-03-01T10:01:00.000Z',
        replyCount: 0,
        replies: [],
        user: { id: 1, username: 'me', displayName: 'Me' },
      };

      if (parentId) {
        const key = Number(parentId);
        repliesByParent[key] = [...(repliesByParent[key] || []), created];
        topLevelComments.forEach((comment) => {
          if (comment.id === key) {
            comment.replyCount = (comment.replyCount || 0) + 1;
            comment.replies = [...(comment.replies || []), created];
          }
        });
      } else {
        topLevelComments.unshift(created);
      }

      return { data: created };
    });

    socialApiMock.deleteReflectionComment.mockImplementation(async (commentId) => {
      const id = Number(commentId);
      const topLevelIndex = topLevelComments.findIndex((c) => c.id === id);
      if (topLevelIndex >= 0) {
        topLevelComments.splice(topLevelIndex, 1);
      }

      Object.keys(repliesByParent).forEach((parentId) => {
        repliesByParent[parentId] = (repliesByParent[parentId] || []).filter((reply) => reply.id !== id);
      });

      topLevelComments.forEach((comment) => {
        comment.replies = (comment.replies || []).filter((reply) => reply.id !== id);
      });

      return { data: {} };
    });

    socialApiMock.searchUsers.mockResolvedValue({ data: { content: [] } });

    socialApiMock.toggleLikeReflection.mockResolvedValue({
      data: { hasLiked: true, likesCount: 1 },
    });
    socialApiMock.toggleSaveReflection.mockResolvedValue({
      data: { hasSaved: true, savesCount: 1 },
    });

    bookApiMock.getAllBooks.mockResolvedValue([]);
  });

  it('supports add and reply in feed comments', async () => {
    const { default: FeedPage } = await import('./FeedPage');

    renderWithProviders(<FeedPage />, '/feed');

    await screen.findByText('Reflection body');
    await userEvent.click(screen.getByRole('button', { name: /comment/i }));

    const addInput = await screen.findByPlaceholderText('Add a comment...');
    await userEvent.type(addInput, 'Top level from feed');
    await userEvent.keyboard('{Enter}');

    await screen.findByText('Top level from feed');

    const replyButtons = await screen.findAllByRole('button', { name: 'Reply' });
    await userEvent.click(replyButtons[0]);

    const replyInput = await screen.findByPlaceholderText('Reply to @me...');
    await userEvent.type(replyInput, 'Reply from feed');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(socialApiMock.addReflectionComment).toHaveBeenCalledWith(42, '@me Reply from feed', expect.any(Number));
    });
  });

  it('supports add and delete in reflection detail comments', async () => {
    const { default: ReflectionDetailPage } = await import('./ReflectionDetailPage');

    renderWithProviders(
      <Routes>
        <Route path="/reflections/:reflectionId" element={<ReflectionDetailPage />} />
      </Routes>,
      '/reflections/42'
    );

    await screen.findByText('Reflection body');

    const addInput = await screen.findByPlaceholderText('Add a comment...');
    await userEvent.type(addInput, 'Detail page comment');
    await userEvent.keyboard('{Enter}');

    await screen.findByText('Detail page comment');

    const deleteToggles = await screen.findAllByTitle('Delete');
    await userEvent.click(deleteToggles[0]);
    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete' });
    await userEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(socialApiMock.deleteReflectionComment).toHaveBeenCalled();
    });
  });
});
