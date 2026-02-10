import axiosClient from './axiosClient';

const goalApi = {
  // Set or update a reading goal
  setGoal: (year, targetBooks) =>
    axiosClient.post('/goals', { year, targetBooks }),

  // Get current year's goal
  getCurrentGoal: () =>
    axiosClient.get('/goals/current'),

  // Get goal by year
  getGoalByYear: (year) =>
    axiosClient.get(`/goals/${year}`),

  // Get all goals (history)
  getAllGoals: () =>
    axiosClient.get('/goals/all'),

  // Delete a goal
  deleteGoal: (goalId) =>
    axiosClient.delete(`/goals/${goalId}`),
};

export default goalApi;
