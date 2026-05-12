import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type Note = {
  id: string;
  title: string;
  body: string;
  date: string;
  accent: string;
  status: NoteStatus;
};

export type NoteStatus = 'pending' | 'done';

type NoteDraft = {
  title: string;
  body: string;
  status: NoteStatus;
};

type NotesContextValue = {
  notes: Note[];
  selectedNote: Note | undefined;
  selectedNoteId: string | null;
  addNote: (draft: NoteDraft) => void;
  updateNote: (id: string, draft: NoteDraft) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  toggleNoteStatus: (id: string) => void;
};

const accents = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#14B8A6', '#D946EF'];

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Project ideas for the week',
    body: 'Sketch the notes flow, decide the empty state, and keep the first version small.',
    date: 'Today, 8:45 PM',
    accent: '#F59E0B',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Grocery list',
    body: 'Coffee, spinach, lemons, rice, yogurt, and something quick for breakfast.',
    date: 'Yesterday',
    accent: '#10B981',
    status: 'done',
  },
  {
    id: '3',
    title: 'Reading notes',
    body: 'The best chapter was really about attention, not productivity.',
    date: 'Mon, 6:10 PM',
    accent: '#6366F1',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Travel packing',
    body: 'Pack charger pouch first. Keep documents in the outer pocket.',
    date: 'Apr 28',
    accent: '#EC4899',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Tiny wins',
    body: 'Refactored the list UI, watered the plants, replied to the pending email.',
    date: 'Apr 24',
    accent: '#14B8A6',
    status: 'done',
  },
];

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

function getSavedLabel() {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
}

export function NotesProvider({ children }: PropsWithChildren) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId),
    [notes, selectedNoteId]
  );

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      selectedNote,
      selectedNoteId,
      addNote: (draft) => {
        const id = Date.now().toString();
        const note: Note = {
          id,
          title: draft.title.trim() || 'Untitled note',
          body: draft.body.trim(),
          date: getSavedLabel(),
          accent: accents[notes.length % accents.length],
          status: draft.status,
        };

        setNotes((currentNotes) => [note, ...currentNotes]);
        setSelectedNoteId(id);
      },
      updateNote: (id, draft) => {
        setNotes((currentNotes) =>
          currentNotes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  title: draft.title.trim() || 'Untitled note',
                  body: draft.body.trim(),
                  date: getSavedLabel(),
                  status: draft.status,
                }
              : note
          )
        );
      },
      deleteNote: (id) => {
        setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
        setSelectedNoteId((currentId) => (currentId === id ? null : currentId));
      },
      selectNote: setSelectedNoteId,
      toggleNoteStatus: (id) => {
        setNotes((currentNotes) =>
          currentNotes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  status: note.status === 'done' ? 'pending' : 'done',
                  date: getSavedLabel(),
                }
              : note
          )
        );
      },
    }),
    [notes, selectedNote, selectedNoteId]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error('useNotes must be used inside NotesProvider');
  }

  return context;
}
