import React, { useState } from 'react';
import { Song } from '../../types';

interface DraggableSongListProps {
  songs: Song[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onRemove: (songId: string) => void;
  onEdit: (song: Song) => void;
}

export const DraggableSongList: React.FC<DraggableSongListProps> = ({
  songs,
  onReorder,
  onRemove,
  onEdit
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const formatDuration = (minutes: number, seconds: number) => {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateTotalDuration = () => {
    const totalSeconds = songs.reduce((total, song) => {
      return total + (song.durationMinutes * 60) + song.durationSeconds;
    }, 0);
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return formatDuration(minutes, seconds);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Songs ({songs.length})
        </h3>
        <div className="text-sm text-gray-600">
          Total Duration: {calculateTotalDuration()}
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No songs in this setlist yet. Add some songs to get started!
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song, index) => (
            <div
              key={song.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                bg-white border rounded-lg p-4 cursor-move transition-all duration-200
                ${draggedIndex === index ? 'opacity-50 transform scale-95' : ''}
                ${dropTargetIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}
                hover:shadow-md hover:border-gray-300
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-base font-medium text-gray-900">
                        {song.title}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDuration(song.durationMinutes, song.durationSeconds)}
                      </span>
                      {song.bpm && (
                        <span className="text-sm text-gray-500">
                          {song.bpm} BPM
                        </span>
                      )}
                      {song.key && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {song.key}
                        </span>
                      )}
                    </div>
                    
                    {song.chords && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Chords:</span> {song.chords}
                      </div>
                    )}
                    
                    {song.notes && (
                      <div className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {song.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(song)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onRemove(song.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Remove
                  </button>
                  <div className="text-gray-400 cursor-move">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
