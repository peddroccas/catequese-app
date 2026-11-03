export function matchesSearch(text: string, search: string) {
  const normalize = (value: string) =>
    value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase()
  return normalize(text).includes(normalize(search.trim()))
}
