import { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, AlertCircle, Info, Zap } from 'lucide-react';

export interface Note {
  id: string;
  type: 'concept' | 'warning' | 'info' | 'tip';
  title: string;
  content: string;
  details?: string[];
}

interface NotesPanelProps {
  title?: string;
  notes: Note[];
  defaultExpanded?: boolean;
}

export function NotesPanel({ title = "Notas Importantes", notes, defaultExpanded = false }: NotesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNote = (noteId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const noteStyles = {
    concept: {
      icon: Lightbulb,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-300 dark:border-amber-700',
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-800 dark:text-amber-200',
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-300 dark:border-red-700',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800 dark:text-red-200',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-300 dark:border-blue-700',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800 dark:text-blue-200',
    },
    tip: {
      icon: Zap,
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-300 dark:border-emerald-700',
      iconColor: 'text-emerald-500',
      titleColor: 'text-emerald-800 dark:text-emerald-200',
    },
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown size={20} className="text-gray-400" />
          ) : (
            <ChevronRight size={20} className="text-gray-400" />
          )}
          <Lightbulb size={20} className="text-amber-500" />
          <span className="font-semibold text-gray-800 dark:text-white">{title}</span>
          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
            {notes.length}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {isExpanded ? 'Clic para ocultar' : 'Clic para expandir'}
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
          {notes.map(note => {
            const style = noteStyles[note.type];
            const Icon = style.icon;
            const isNoteExpanded = expandedNotes.has(note.id);

            return (
              <div
                key={note.id}
                className={`rounded-lg border ${style.bg} ${style.border} overflow-hidden`}
              >
                <button
                  onClick={() => toggleNote(note.id)}
                  className="w-full flex items-start gap-3 p-3 text-left hover:opacity-90 transition-opacity"
                >
                  <Icon size={18} className={`${style.iconColor} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${style.titleColor}`}>
                      {note.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {note.content}
                    </p>
                  </div>
                  {note.details && note.details.length > 0 && (
                    <div className="flex-shrink-0">
                      {isNoteExpanded ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                    </div>
                  )}
                </button>

                {/* Expandable details */}
                {isNoteExpanded && note.details && (
                  <div className="px-3 pb-3 pt-0">
                    <div className="ml-7 pl-3 border-l-2 border-gray-300 dark:border-gray-600 space-y-2">
                      {note.details.map((detail, idx) => (
                        <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
