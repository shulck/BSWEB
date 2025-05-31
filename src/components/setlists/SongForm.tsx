import React, { useState, useEffect } from 'react';
import { Song } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface SongFormProps {
  song?: Song | null;
  onSubmit: (song: Omit<Song, 'id'> | Song) => void;
  onCancel: () => void;
}

export const SongForm: React.FC<SongFormProps> = ({
  song,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    durationMinutes: 3,
    durationSeconds: 30,
    bpm: 120,
    key: '',
    chords: '',
    notes: ''
  });

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title,
        durationMinutes: song.durationMinutes,
        durationSeconds: song.durationSeconds,
        bpm: song.bpm,
        key: song.key || '',
        chords: song.chords || '',
        notes: song.notes || ''
      });
    }
  }, [song]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const songData = {
      ...(song && { id: song.id }),
      title: formData.title.trim(),
      durationMinutes: formData.durationMinutes,
      durationSeconds: formData.durationSeconds,
      bpm: formData.bpm,
      key: formData.key.trim() || undefined,
      chords: formData.chords.trim() || undefined,
      notes: formData.notes.trim() || undefined
    };

    onSubmit(songData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Song Title*"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter song title"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duration (Minutes)"
          name="durationMinutes"
          type="number"
          min="0"
          max="20"
          value={formData.durationMinutes}
          onChange={handleChange}
        />

        <Input
          label="Duration (Seconds)"
          name="durationSeconds"
          type="number"
          min="0"
          max="59"
          value={formData.durationSeconds}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="BPM"
          name="bpm"
          type="number"
          min="60"
          max="200"
          value={formData.bpm}
          onChange={handleChange}
        />

        <Input
          label="Key (Optional)"
          name="key"
          value={formData.key}
          onChange={handleChange}
          placeholder="C, Am, etc."
        />
      </div>

      <Textarea
        label="Chords (Optional)"
        name="chords"
        value={formData.chords}
        onChange={handleChange}
        placeholder="C - Am - F - G"
        rows={2}
      />

      <Textarea
        label="Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Performance notes, lyrics, etc."
        rows={3}
      />

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {song ? 'Update Song' : 'Add Song'}
        </Button>
      </div>
    </form>
  );
};
