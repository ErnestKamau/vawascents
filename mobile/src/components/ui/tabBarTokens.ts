/** Floating bubble tab bar — shared layout tokens */
export const TAB_BAR = {
  BAR_H: 80,
  CORNER_R: 30,
  BUMP_W: 68,
  BUMP_RISE: 14,
  DOT: 5,
  ICON_SIZE: 22,
  ICON_LABEL_GAP: 3,
  LABEL_SIZE: 11,
  CONTENT_TOP: 16,
  PAD_BOTTOM: 10,
  SIDE_INSET: 16,
} as const;

/** Visible bar body (bump + content) — floating lift is separate */
export function tabBarBodyHeight(): number {
  return TAB_BAR.BUMP_RISE + TAB_BAR.BAR_H;
}
