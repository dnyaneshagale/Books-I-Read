export const reflectionCommentKeys = {
  detail: (reflectionId) => ['reflection', Number(reflectionId)],
  comments: (reflectionId) => ['reflection-comments', Number(reflectionId)],
  replies: (commentId) => ['reflection-comment-replies', Number(commentId)],
};

export const updateReflectionCaches = (queryClient, reflectionId, updater) => {
  queryClient.setQueriesData(
    {
      predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'reflections',
    },
    (oldData) => {
      if (!oldData) return oldData;

      if (Array.isArray(oldData.pages)) {
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            content: (page.content || []).map((item) => (
              item.id === Number(reflectionId) ? updater(item) : item
            )),
          })),
        };
      }

      if (Array.isArray(oldData.content)) {
        return {
          ...oldData,
          content: oldData.content.map((item) => (
            item.id === Number(reflectionId) ? updater(item) : item
          )),
        };
      }

      return oldData;
    }
  );

  queryClient.setQueryData(reflectionCommentKeys.detail(reflectionId), (oldData) => (
    oldData ? updater(oldData) : oldData
  ));
};

const updateInfiniteContent = (data, transform) => {
  if (!data?.pages) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      content: transform(page.content || []),
    })),
  };
};

export const updateReflectionCommentCountCaches = (queryClient, reflectionId, delta) => {
  updateReflectionCaches(queryClient, reflectionId, (item) => ({
    ...item,
    commentsCount: Math.max(0, (item.commentsCount || 0) + delta),
  }));
};

export const addTopLevelCommentToCache = (queryClient, reflectionId, comment) => {
  queryClient.setQueryData(reflectionCommentKeys.comments(reflectionId), (oldData) => {
    if (!oldData?.pages) {
      return {
        pages: [{ content: [comment], page: { number: 0, totalPages: 1 } }],
        pageParams: [0],
      };
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page, index) => (
        index === 0
          ? { ...page, content: [comment, ...(page.content || []).filter((item) => item.id !== comment.id)] }
          : page
      )),
    };
  });
};

export const addReplyToCache = (queryClient, reflectionId, parentId, reply) => {
  queryClient.setQueryData(reflectionCommentKeys.replies(parentId), (oldData) => {
    const replies = oldData || [];
    return [...replies.filter((item) => item.id !== reply.id), reply];
  });

  queryClient.setQueryData(reflectionCommentKeys.comments(reflectionId), (oldData) => (
    updateInfiniteContent(oldData, (content) => content.map((item) => (
      item.id === Number(parentId)
        ? {
            ...item,
            replyCount: (item.replyCount || 0) + 1,
            replies: item.replies ? [...item.replies.filter((r) => r.id !== reply.id), reply] : item.replies,
          }
        : item
    )))
  ));
};

export const removeCommentFromCache = (queryClient, reflectionId, commentId, parentId = null) => {
  if (parentId) {
    queryClient.setQueryData(reflectionCommentKeys.replies(parentId), (oldData) => (
      (oldData || []).filter((item) => item.id !== Number(commentId))
    ));

    queryClient.setQueryData(reflectionCommentKeys.comments(reflectionId), (oldData) => (
      updateInfiniteContent(oldData, (content) => content.map((item) => (
        item.id === Number(parentId)
          ? {
              ...item,
              replyCount: Math.max(0, (item.replyCount || 0) - 1),
              replies: item.replies ? item.replies.filter((reply) => reply.id !== Number(commentId)) : item.replies,
            }
          : item
      )))
    ));

    return;
  }

  queryClient.setQueryData(reflectionCommentKeys.comments(reflectionId), (oldData) => (
    updateInfiniteContent(oldData, (content) => content.filter((item) => item.id !== Number(commentId)))
  ));
};
