import { SelectingDefaults } from './selecting';
import { isNonNull } from './shared/core';
import { TilingDefaults } from './tiling';

export function henceGrading<TileKey, Tile, Grade, Order, Selection>(
    tilingDefaults: TilingDefaults<TileKey, Tile, Grade>,
    selectingDefaults: SelectingDefaults<Order, Tile, Selection>,
) {
    const { keyOf, areKeysEqual, setGradeAndSeeIfDirty } = tilingDefaults;
    const { seeIfHasAny, seeIfSelected, makeAllUnselected } = selectingDefaults;

    function setTileGradeAtOrSelectedIfAny(
        at: TileKey | null,
        grade: Grade,
        tiles: Tile[],
        selection: Selection,
    ): Tile[] {

        const hasAnySelected = seeIfHasAny(selection);
        if (hasAnySelected) {
            // many selected
            const dirtyTiles: Tile[] = [];
            tiles.forEach(tile => {
                const isSelected = seeIfSelected(selection, tile);
                if (!isSelected) return;
                const isDrity = setGradeAndSeeIfDirty(tile, grade);
                if (isDrity) {
                    dirtyTiles.push(tile)
                }
            });
            makeAllUnselected(selection, tiles);
            return dirtyTiles;
        } else if (isNonNull(at)) {
            // only one selected
            const dirtyTiles: Tile[] = [];
            for (const tile of tiles) {
                const key = keyOf(tile);
                if (areKeysEqual(key, at)) continue;
                const isDrity = setGradeAndSeeIfDirty(tile, grade);
                if (isDrity) {
                    dirtyTiles.push(tile);
                }
                break;
            }
            return dirtyTiles;
        } else {
            // at is null and doesn't have anything selected
            return [];
        }
    }
    return { setTileGradeAtOrSelectedIfAny }
}
