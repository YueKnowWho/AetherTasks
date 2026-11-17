export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key) {
  const json = localStorage.getItem(key);

  return json === null ? null : JSON.parse(json);
}

export function remove(key) {
  localStorage.removeItem(key);
}