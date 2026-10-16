import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import {
  addListItem,
  loadList,
  refreshList,
  removeListItem,
  selectListError,
  selectListItems,
  selectListRefreshing,
  selectListStatus,
  toggleListItem,
} from '../store/listSlice';
import useOnReconnect from './useOnReconnect';

// useShoppingList() returns:
//   { items, status, error, refreshing, reload, refresh, add, toggle, remove }
//
// The list now lives in the Redux store. The contract is the same as on Day 4:
// add(name), toggle(item) and remove(item) answer { ok: true } or { ok: false, message }.
export default function useShoppingList() {
  const { user } = useAuth();
  const ownerId = user?.id;
  const dispatch = useDispatch();

  const items = useSelector(selectListItems);
  const storeStatus = useSelector(selectListStatus);
  const error = useSelector(selectListError);
  const refreshing = useSelector(selectListRefreshing);

  // Before the first request starts the store says 'idle'. To the screen that is still "loading".
  const status = storeStatus === 'idle' ? 'loading' : storeStatus;

  const reload = useCallback(() => dispatch(loadList(ownerId)), [dispatch, ownerId]);

  // Pull-to-refresh: .unwrap() turns a rejected thunk into a thrown error, so we can report true/false.
  const refresh = useCallback(async () => {
    try {
      await dispatch(refreshList(ownerId)).unwrap();
      return true;
    } catch (err) {
      return false;
    }
  }, [dispatch, ownerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // When the connection comes back, quietly fetch fresh data.
  useOnReconnect(refresh);

  // Dispatch a thunk and answer { ok: true } or { ok: false, message }. The rejected value is the friendly message.
  const run = useCallback(
    async (thunkAction) => {
      try {
        await dispatch(thunkAction).unwrap();
        return { ok: true };
      } catch (message) {
        return { ok: false, message: typeof message === 'string' ? message : 'Something went wrong.' };
      }
    },
    [dispatch]
  );

  const add = useCallback((name) => run(addListItem(name)), [run]);
  const toggle = useCallback((item) => run(toggleListItem(item)), [run]);
  const remove = useCallback((item) => run(removeListItem(item)), [run]);

  return { items, status, error, refreshing, reload, refresh, add, toggle, remove };
}
