type Listener = () => void;

let expanded = false;
const listeners = new Set<Listener>();

export const heroExpandedStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    return expanded;
  },
  getServerSnapshot() {
    return false;
  },
  set(value: boolean) {
    if (value === expanded) return;
    expanded = value;
    for (const listener of listeners) listener();
  },
};
