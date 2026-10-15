import { api } from '../lib/api';

// The API calls them tasks. The app calls them shopping list items.
export function mapItem(raw) {
  return {
    id: raw._id,
    name: raw.title,
    done: raw.completed,
    urgent: raw.priority === 'high',
    ownerId: raw.owner,
  };
}

// The Day 2 list endpoint returns every user's tasks, so we keep only the signed-in user's.
// (In production the server should do this filtering.)
export async function fetchItems(ownerId) {
  const response = await api.get('/tasks', { params: { limit: 100 } });
  return response.data.data.map(mapItem).filter((item) => item.ownerId === ownerId);
}

export async function createItem(name) {
  const response = await api.post('/tasks', { title: name });
  return mapItem(response.data.data);
}

export async function setItemDone(id, done) {
  const response = await api.put(`/tasks/${id}`, { completed: done });
  return mapItem(response.data.data);
}

export async function deleteItem(id) {
  await api.delete(`/tasks/${id}`);
}
