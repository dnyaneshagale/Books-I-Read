import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
  addReplyToCache,
  addTopLevelCommentToCache,
  reflectionCommentKeys,
  removeCommentFromCache,
  updateReflectionCaches,
  updateReflectionCommentCountCaches,
} from './reflectionCommentCache';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const seedReflectionCaches = (queryClient, reflection) => {
  queryClient.setQueryData(reflectionCommentKeys.detail(reflection.id), reflection);
  queryClient.setQueryData(['reflections', 'following', 'relevant', 15], {
    pages: [
      {
        content: [reflection],
        page: { number: 0, totalPages: 1 },
      },
    ],
    pageParams: [0],
  });
};

describe('reflectionCommentCache helpers', () => {
  it('adds a top-level comment and updates reflection comment counts', () => {
    const queryClient = createQueryClient();
    const reflection = { id: 42, commentsCount: 2, hasLiked: false, hasSaved: false };
    const comment = { id: 1001, content: 'New top-level comment', replyCount: 0, replies: [] };

    seedReflectionCaches(queryClient, reflection);

    addTopLevelCommentToCache(queryClient, reflection.id, comment);
    updateReflectionCommentCountCaches(queryClient, reflection.id, 1);

    const detail = queryClient.getQueryData(reflectionCommentKeys.detail(reflection.id));
    const comments = queryClient.getQueryData(reflectionCommentKeys.comments(reflection.id));
    const feed = queryClient.getQueryData(['reflections', 'following', 'relevant', 15]);

    expect(detail.commentsCount).toBe(3);
    expect(comments.pages[0].content).toEqual([comment]);
    expect(feed.pages[0].content[0].commentsCount).toBe(3);
  });

  it('adds a reply and keeps reply caches plus parent metadata in sync', () => {
    const queryClient = createQueryClient();
    const reflection = { id: 42, commentsCount: 1, hasLiked: false, hasSaved: false };
    const parentComment = {
      id: 2001,
      content: 'Parent comment',
      replyCount: 0,
      replies: [],
    };
    const reply = {
      id: 2002,
      parentId: 2001,
      content: 'Reply comment',
    };

    seedReflectionCaches(queryClient, reflection);
    queryClient.setQueryData(reflectionCommentKeys.comments(reflection.id), {
      pages: [{ content: [parentComment], page: { number: 0, totalPages: 1 } }],
      pageParams: [0],
    });

    addReplyToCache(queryClient, reflection.id, parentComment.id, reply);
    updateReflectionCommentCountCaches(queryClient, reflection.id, 1);

    const comments = queryClient.getQueryData(reflectionCommentKeys.comments(reflection.id));
    const replies = queryClient.getQueryData(reflectionCommentKeys.replies(parentComment.id));
    const detail = queryClient.getQueryData(reflectionCommentKeys.detail(reflection.id));

    expect(replies).toEqual([reply]);
    expect(comments.pages[0].content[0].replyCount).toBe(1);
    expect(comments.pages[0].content[0].replies).toEqual([reply]);
    expect(detail.commentsCount).toBe(2);
  });

  it('removes reply and top-level comments while preventing negative counts', () => {
    const queryClient = createQueryClient();
    const reflection = { id: 42, commentsCount: 2, hasLiked: false, hasSaved: false };
    const reply = { id: 3002, parentId: 3001, content: 'Reply' };
    const parentComment = {
      id: 3001,
      content: 'Parent',
      replyCount: 1,
      replies: [reply],
    };

    seedReflectionCaches(queryClient, reflection);
    queryClient.setQueryData(reflectionCommentKeys.comments(reflection.id), {
      pages: [{ content: [parentComment], page: { number: 0, totalPages: 1 } }],
      pageParams: [0],
    });
    queryClient.setQueryData(reflectionCommentKeys.replies(parentComment.id), [reply]);

    removeCommentFromCache(queryClient, reflection.id, reply.id, parentComment.id);
    updateReflectionCommentCountCaches(queryClient, reflection.id, -1);
    removeCommentFromCache(queryClient, reflection.id, parentComment.id);
    updateReflectionCommentCountCaches(queryClient, reflection.id, -1);
    updateReflectionCommentCountCaches(queryClient, reflection.id, -1);

    const comments = queryClient.getQueryData(reflectionCommentKeys.comments(reflection.id));
    const replies = queryClient.getQueryData(reflectionCommentKeys.replies(parentComment.id));
    const detail = queryClient.getQueryData(reflectionCommentKeys.detail(reflection.id));

    expect(replies).toEqual([]);
    expect(comments.pages[0].content).toEqual([]);
    expect(detail.commentsCount).toBe(0);
  });

  it('updates detail and feed reflection caches together for engagement changes', () => {
    const queryClient = createQueryClient();
    const reflection = { id: 42, likesCount: 3, savesCount: 1, hasLiked: false, hasSaved: false };

    seedReflectionCaches(queryClient, reflection);

    updateReflectionCaches(queryClient, reflection.id, (item) => ({
      ...item,
      hasLiked: true,
      likesCount: item.likesCount + 1,
      hasSaved: true,
      savesCount: item.savesCount + 1,
    }));

    const detail = queryClient.getQueryData(reflectionCommentKeys.detail(reflection.id));
    const feed = queryClient.getQueryData(['reflections', 'following', 'relevant', 15]);

    expect(detail.hasLiked).toBe(true);
    expect(detail.likesCount).toBe(4);
    expect(detail.hasSaved).toBe(true);
    expect(feed.pages[0].content[0].savesCount).toBe(2);
  });
});