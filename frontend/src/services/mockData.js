// Mock data for development and testing
export const mockUserData = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'athlete'
};

export const mockStats = {
  totalMatches: 127,
  winRate: 58.3,
  kda: 2.7,
  averageScore: 214
};

export const mockActivities = [
  {
    id: 1,
    type: 'match',
    game: 'CS:GO',
    result: 'win',
    score: '16-10',
    date: '2023-11-25T14:30:00Z'
  },
  {
    id: 2,
    type: 'achievement',
    title: 'Sharpshooter',
    description: 'Achieve 80% headshot rate in a match',
    date: '2023-11-23T18:15:00Z'
  },
  {
    id: 3,
    type: 'match',
    game: 'CS:GO',
    result: 'loss',
    score: '11-16',
    date: '2023-11-22T20:45:00Z'
  },
  {
    id: 4,
    type: 'training',
    title: 'Aim Training',
    score: '92/100',
    date: '2023-11-21T16:00:00Z'
  }
];
