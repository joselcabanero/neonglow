export type ItemPredicate<T> = (query: string, item: T) => boolean;

export interface QueryListCoreOptions<T> {
  items: T[];
  /** Rendering, default filtering and tag text. */
  getItemLabel: (item: T) => string;
  /** Stable identity; defaults to getItemLabel. */
  getItemKey?: (item: T) => string;
  itemPredicate?: ItemPredicate<T>;
  itemDisabled?: (item: T) => boolean;
  onItemSelect: (item: T) => void;
}
