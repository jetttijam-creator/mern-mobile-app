import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createItem, deleteItem, fetchItems, setItemDone } from '../services/tasks';
import { ensureOnline } from '../lib/network';
import { getErrorMessage } from '../lib/errors';
import { sessionEnded } from './sessionActions';

// Every thunk below does the same three things: check we are online, call the service,
// and turn any failure into one friendly message (the "rejected" payload).
function makeThunk(type, work, options) {
  return createAsyncThunk(
    type,
    async (arg, { rejectWithValue }) => {
      try {
        await ensureOnline();
        return await work(arg);
      } catch (err) {
        return rejectWithValue(getErrorMessage(err));
      }
    },
    options
  );
}

// arg = the signed-in user's id (the list is filtered to that owner)
const fetchList = async (ownerId) => ({
  items: await fetchItems(ownerId),
  fetchedAt: new Date().toISOString(),
});

export const loadList = makeThunk('list/load', fetchList, {
  condition: (_arg, { getState }) => getState().list.status !== 'loading',
});
export const refreshList = makeThunk('list/refresh', fetchList);

// arg = the new item's name
export const addListItem = makeThunk('list/add', (name) => createItem(name));
// arg = the item as the screen showed it, so item.done is the OLD value
export const toggleListItem = makeThunk('list/toggle', (item) => setItemDone(item.id, !item.done));
// arg = the item
export const removeListItem = makeThunk('list/remove', (item) => deleteItem(item.id));

const initialState = {
  items: [],
  lastUpdated: null, // when `items` was last fetched from the server
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  error: '',
  refreshing: false,
};

const listSlice = createSlice({
  name: 'list',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadList.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(loadList.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.lastUpdated = action.payload.fetchedAt;
        state.status = 'success';
      })
      .addCase(loadList.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? action.error.message;
      })
      .addCase(refreshList.pending, (state) => {
        state.refreshing = true;
      })
      .addCase(refreshList.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.lastUpdated = action.payload.fetchedAt;
        state.status = 'success';
        state.refreshing = false;
      })
      .addCase(refreshList.rejected, (state) => {
        state.refreshing = false;
      })
      // Not optimistic: the item appears only after the server has said yes.
      .addCase(addListItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Optimistic: flip it now, and flip it back if the server refuses.
      .addCase(toggleListItem.pending, (state, action) => {
        const entry = state.items.find((item) => item.id === action.meta.arg.id);
        if (entry) entry.done = !action.meta.arg.done;
      })
      .addCase(toggleListItem.rejected, (state, action) => {
        const entry = state.items.find((item) => item.id === action.meta.arg.id);
        if (entry) entry.done = action.meta.arg.done;
      })
      // Not optimistic: the row goes only after the server has said yes.
      .addCase(removeListItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.meta.arg.id);
      })
      .addCase(sessionEnded, () => initialState);
  },
});

export default listSlice.reducer;

export const selectListItems = (state) => state.list.items;
export const selectListUpdatedAt = (state) => state.list.lastUpdated;
export const selectListStatus = (state) => state.list.status;
export const selectListError = (state) => state.list.error;
export const selectListRefreshing = (state) => state.list.refreshing;
