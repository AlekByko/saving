import { Captured, capturedFrom, Choked, chokedFrom, Read } from './reading-basics';

export function readList<Item>(
    text: string, index: number,
    readItem: Read<Item>,
    readDelim: Read<unknown>,
    readEnd: Read<unknown>,
): Choked | Captured<Item[]> {
    const first = readItem(text, index);
    if (first.isBad) return chokedFrom(index, 'bad first item', first);
    const items = [first.value];
    index = first.nextIndex;
    while (true) {
        if (index >= text.length) return capturedFrom(text.length, items);
        const delim = readDelim(text, index);
        if (delim.isBad) {
            // unable to read a delim, it could be the end or bad delim
            const end = readEnd(text, index);
            if (end.isBad) {
                // it is not the end just a bad delim
                return chokedFrom(index, 'bad delim', delim);
            } else {
                // it is the end, we are done
                return capturedFrom(index, items);
            }
        }
        index = delim.nextIndex;

        const item = readItem(text, index);
        if (item.isBad) {
            // unable to read an item, it could be the end or bad item
            const end = readEnd(text, index);
            if (end.isBad) {
                // it is not the end it means it's a bad item
                return chokedFrom(index, `bad #${items.length} item`, item);
            } else {
                // it is the end, we are just done
                return capturedFrom(index, items);
            }
        }
        items.push(item.value); // <-- since we read it it's valid result we need to keep it
        index = item.nextIndex;

        if (index < text.length) {
            // next unread character can still be read from text, we are either at the last one or we are in the middle with plenty more ahead
            continue;
        } else {
            // this next unread character is outside the text, it means we've hit the EOS (end-of-string),
            // and since we've read an item, there is nothing beyond it, and that concludes reading the list as captured
            return capturedFrom(index, items);
        }
    }
}
