const STORAGE_KEY = 'domine_app_data';

const defaultState = {
  pastGames: [], // { id, date, winner }
  currentGame: null, // { player1Score: 0, player2Score: 0, date: string, isActive: boolean }
  lastScoreGoal: 150
};

export const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultState;
  } catch (e) {
    return defaultState;
  }
};

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};
