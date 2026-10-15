import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createItem, deleteItem, fetchItems, setItemDone } from '../services/tasks';
import { getErrorMessage } from '../lib/errors';
import { ensureOnline } from '../lib/network';
import useOnReconnect from './useOnReconnect';

// useShoppingList() returns:
//   { items, status, error, refreshing, reload, refresh, add, toggle, remove }
//
// items       the shopping list items (newest first)
// status      'loading' | 'success' | 'error'
// error       a friendly message when status is 'error'
// refreshing  true while a pull-to-refresh is running
// reload()    load the list again, showing the loading state
// refresh()   load the list again, keeping the items on screen; returns true or false
// add(name)   create an item, then put it at the top of the list
// toggle(item) flip done/not done IMMEDIATELY, and flip it back if the server refuses
// remove(item) delete on the server first, then remove the row
//
// add, toggle and remove all return { ok: true } or { ok: false, message }
export default function useShoppingList() {
  const { user } = useAuth();
  const ownerId = user?.id;

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      await ensureOnline();
      setItems(await fetchItems(ownerId));
      setStatus('success');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, [ownerId]);

  // Pull-to-refresh: keep the items on screen and just report whether it worked.
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await ensureOnline();
      setItems(await fetchItems(ownerId));
      setStatus('success');
      return true;
    } catch (err) {
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [ownerId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // When the connection comes back, quietly fetch fresh data.
  useOnReconnect(refresh);

  // Pessimistic: change the list only after the server has said yes.
  const add = useCallback(async (name) => {
    try {
      await ensureOnline();
      const created = await createItem(name);
      setItems((current) => [created, ...current]);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) };
    }
  }, []);

  // Optimistic: flip it now, and flip it back if the server refuses.
  const toggle = useCallback(async (item) => {
    const setDone = (done) =>
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, done } : entry)));

    setDone(!item.done);
    try {
      await ensureOnline();
      await setItemDone(item.id, !item.done);
      return { ok: true };
    } catch (err) {
      setDone(item.done); // the item we were given still has its old value
      return { ok: false, message: getErrorMessage(err) };
    }
  }, []);

  // Pessimistic: remove the row only after the server has said yes.
  const remove = useCallback(async (item) => {
    try {
      await ensureOnline();
      await deleteItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) };
    }
  }, []);

  return { items, status, error, refreshing, reload, refresh, add, toggle, remove };
}
