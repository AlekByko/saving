import React from 'react';

export interface NotesAppProps {
}

export function thusNotesApp() {
    return class NotesApp extends React.Component {
        render() {
            return <div>Notes App</div>;
        }
    }
}
