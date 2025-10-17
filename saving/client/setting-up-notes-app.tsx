import React, { MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';
import { isNonNull, isNull } from '../shared/core';
import { KnownPickedDirRef } from '../shared/identities';
import { willSaveDirRef, willTryGetDirFromDb } from './reading-writing-files';


export async function willClaimDir(
    db: IDBDatabase, element: HTMLElement, ref: KnownPickedDirRef,
) {
    return new Promise<FileSystemDirectoryHandle>(async resolve => {
        const dir = await willTryGetDirFromDb(db, ref);
        if (isNonNull(dir)) {
            resolve(dir);
            return;
        }
        class App extends React.Component {
            whenPickingNotesDir: MouseEventHandler<HTMLButtonElement> = async _e => {
                const dir = await willPickDirOr(null);
                if (isNull(dir)) return;
                await willSaveDirRef(ref, dir, db);
                resolve(dir);
            };
            render() {
                return <div>
                    <button onClick={this.whenPickingNotesDir}>Pick Dir</button>
                </div>
            }
        }
        ReactDOM.render(<App />, element);
    });

}


async function willPickDirOr<Or>(or: Or) {
    try {
        return await window.showDirectoryPicker();
    } catch {
        return or;
    }
}

