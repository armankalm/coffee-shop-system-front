export function createPositionClickHandler(id: string, onPositionClick: (id: string) => void) {
  return () => onPositionClick(id)
}
