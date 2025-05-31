import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/redux';
import { SetlistService } from '../services/setlistService';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Setlist, Song } from '../types';

export const SetlistsPage: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSetlist, setEditingSetlist] = useState<Setlist | null>(null);
  const [showSongModal, setShowSongModal] = useState(false);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    isShared: false,
    concertDate: ''
  });

  const [songData, setSongData] = useState({
    title: '',
    durationMinutes: 3,
    durationSeconds: 30,
    bpm: 120,
    key: ''
  });

  useEffect(() => {
    fetchSetlists();
  }, [currentUser?.groupId, fetchSetlists]);

  const fetchSetlists = async () => {
    if (!currentUser?.groupId) return;
    
    setIsLoading(true);
    try {
      const fetchedSetlists = await SetlistService.fetchSetlists(currentUser.groupId);
      setSetlists(fetchedSetlists);
    } catch (error) {
      console.error('Failed to fetch setlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.groupId) return;

    try {
      const setlistData: Omit<Setlist, 'id'> = {
        name: formData.name,
        userId: currentUser.id,
        groupId: currentUser.groupId,
        isShared: formData.isShared,
        songs: editingSetlist?.songs || [],
        concertDate: formData.concertDate ? new Date(formData.concertDate) : undefined
      };

      if (editingSetlist) {
        await SetlistService.updateSetlist(editingSetlist.id!, setlistData);
      } else {
        await SetlistService.addSetlist(setlistData);
      }
      
      await fetchSetlists();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save setlist:', error);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSetlist) return;

    const song: Song = {
      id: crypto.randomUUID(),
      title: songData.title,
      durationMinutes: songData.durationMinutes,
      durationSeconds: songData.durationSeconds,
      bpm: songData.bpm,
      key: songData.key || undefined
    };

    try {
      const updatedSetlist = SetlistService.addSongToSetlist(selectedSetlist, song);
      await SetlistService.updateSetlist(selectedSetlist.id!, updatedSetlist);
      await fetchSetlists();
      setShowSongModal(false);
      resetSongForm();
    } catch (error) {
      console.error('Failed to add song:', error);
    }
  };

  const handleRemoveSong = async (setlist: Setlist, songId: string) => {
    try {
      const updatedSetlist = SetlistService.removeSongFromSetlist(setlist, songId);
      await SetlistService.updateSetlist(setlist.id!, updatedSetlist);
      await fetchSetlists();
    } catch (error) {
      console.error('Failed to remove song:', error);
    }
  };

  const handleEdit = (setlist: Setlist) => {
    setEditingSetlist(setlist);
    setFormData({
      name: setlist.name,
      isShared: setlist.isShared,
      concertDate: setlist.concertDate?.toISOString().split('T')[0] || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (setlistId: string) => {
    if (window.confirm('Are you sure you want to delete this setlist?')) {
      try {
        await SetlistService.deleteSetlist(setlistId);
        await fetchSetlists();
      } catch (error) {
        console.error('Failed to delete setlist:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingSetlist(null);
    setFormData({
      name: '',
      isShared: false,
      concertDate: ''
    });
  };

  const resetSongForm = () => {
    setSongData({
      title: '',
      durationMinutes: 3,
      durationSeconds: 30,
      bpm: 120,
      key: ''
    });
  };

  const openSongModal = (setlist: Setlist) => {
    setSelectedSetlist(setlist);
    setShowSongModal(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Setlists</h1>
            <p className="text-gray-600">Manage your band's setlists and songs</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            Create Setlist
          </Button>
        </div>

        {/* Setlists Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : setlists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No setlists yet. Create your first setlist to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {setlists.map((setlist) => (
              <div key={setlist.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{setlist.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {setlist.isShared && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Shared
                        </span>
                      )}
                      {setlist.concertDate && (
                        <span className="text-xs text-gray-500">
                          {setlist.concertDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(setlist)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(setlist.id!)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{setlist.songs.length}</span> songs
                  </div>
                  <div className="text-sm text-gray-600">
                    Duration: <span className="font-medium">
                      {SetlistService.formatDuration(SetlistService.calculateTotalDuration(setlist.songs))}
                    </span>
                  </div>
                </div>

                {/* Songs List */}
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {setlist.songs.map((song, index) => (
                    <div key={song.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{index + 1}. {song.title}</span>
                        <span className="text-gray-500 ml-2">
                          ({song.durationMinutes}:{song.durationSeconds.toString().padStart(2, '0')})
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSong(setlist, song.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {setlist.songs.length === 0 && (
                    <p className="text-gray-400 text-sm">No songs added yet</p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openSongModal(setlist)}
                  className="w-full"
                >
                  Add Song
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Setlist Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingSetlist ? 'Edit Setlist' : 'Create New Setlist'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Setlist Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Concert at..."
              required
            />

            <Input
              label="Concert Date (Optional)"
              type="date"
              value={formData.concertDate}
              onChange={(e) => setFormData(prev => ({ ...prev, concertDate: e.target.value }))}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isShared"
                checked={formData.isShared}
                onChange={(e) => setFormData(prev => ({ ...prev, isShared: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="isShared" className="ml-2 text-sm text-gray-900">
                Share with group members
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSetlist ? 'Update' : 'Create'} Setlist
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Song Modal */}
        <Modal
          isOpen={showSongModal}
          onClose={() => {
            setShowSongModal(false);
            resetSongForm();
          }}
          title={`Add Song to "${selectedSetlist?.name}"`}
        >
          <form onSubmit={handleAddSong} className="space-y-4">
            <Input
              label="Song Title"
              value={songData.title}
              onChange={(e) => setSongData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Song name"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (Minutes)"
                type="number"
                min="0"
                max="20"
                value={songData.durationMinutes}
                onChange={(e) => setSongData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
              />

              <Input
                label="Duration (Seconds)"
                type="number"
                min="0"
                max="59"
                value={songData.durationSeconds}
                onChange={(e) => setSongData(prev => ({ ...prev, durationSeconds: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="BPM"
                type="number"
                min="60"
                max="200"
                value={songData.bpm}
                onChange={(e) => setSongData(prev => ({ ...prev, bpm: parseInt(e.target.value) || 120 }))}
              />

              <Input
                label="Key (Optional)"
                value={songData.key}
                onChange={(e) => setSongData(prev => ({ ...prev, key: e.target.value }))}
                placeholder="C, Am, etc."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowSongModal(false);
                  resetSongForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Song
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};
