export interface TilingDefaults<TileKey, Tile, Grade> {
    keyOf: (tile: Tile) => TileKey;
    areKeysEqual: (one: TileKey, another: TileKey) => boolean;
    setGradeAndSeeIfDirty: (tile: Tile, grade: Grade) => boolean;
    setIndex: (tile: Tile, index: number) => void;
}
