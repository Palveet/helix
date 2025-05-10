import React, { useEffect, useState, useCallback } from 'react';
import { Sequence } from '../types/apiTypes';
import axios from 'axios';
import socket from '../services/socketService';

interface Props {
  userId: string;
}

const Workspace: React.FC<Props> = ({ userId }) => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [expandedSequences, setExpandedSequences] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generatingSequence, setGeneratingSequence] = useState(false);
  const [editingSequence, setEditingSequence] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchSequences = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/sequences/${userId}`);
      const newSequences = response.data.reverse();
      setSequences(newSequences);
      setExpandedSequences(new Set(newSequences.map((seq: Sequence) => seq.id)));
    } catch (error) {
      console.error('Failed to fetch sequences:', error);
    } finally {
      setLoading(false);
      setGeneratingSequence(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSequences();
    
    window.addEventListener('sequenceGenerationStarted', () => {
      setGeneratingSequence(true);
    });
    
    const handleSequenceUpdate = (updatedSeq: Sequence) => {
      if (updatedSeq.user_id === userId) {
        setGeneratingSequence(false);
        setSequences(prev => {
          const exists = prev.some(seq => seq.id === updatedSeq.id);
          if (exists) {
            return prev.map(seq => seq.id === updatedSeq.id ? updatedSeq : seq);
          } else {
            return [updatedSeq, ...prev];
          }
        });
        setExpandedSequences(prev => new Set(Array.from(prev).concat([updatedSeq.id])));
      }
    };

    socket.on('sequence_updated', handleSequenceUpdate);
    
    const handleRefresh = () => {
      fetchSequences();
    };
    
    window.addEventListener('refreshSequences', handleRefresh);
    
    return () => {
      socket.off('sequence_updated', handleSequenceUpdate);
      window.removeEventListener('refreshSequences', handleRefresh);
      window.removeEventListener('sequenceGenerationStarted', () => {
        setGeneratingSequence(false);
      });
    };
  }, [fetchSequences, userId]);

  const toggleSequence = (seqId: number) => {
    setExpandedSequences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seqId)) {
        newSet.delete(seqId);
      } else {
        newSet.add(seqId);
      }
      return newSet;
    });
  };

  const handleEdit = (sequence: Sequence) => {
    setEditingSequence(sequence.id);
    setEditContent(sequence.content);
  };

  const handleSave = async (sequenceId: number) => {
    try {
      await axios.put(
        `http://localhost:5000/api/sequence/${sequenceId}?user_id=${userId}`,
        { updated_content: editContent }
      );
      setSequences(prev => prev.map(seq => 
        seq.id === sequenceId ? { ...seq, content: editContent } : seq
      ));
      
      setEditingSequence(null);
      setEditContent('');
    } catch (error) {

      alert('Failed to update sequence. Please try again.');
    }
  };

  const handleDelete = async (sequenceId: number) => {
    if (!window.confirm('Are you sure you want to delete this sequence?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/sequence/${sequenceId}?user_id=${userId}`);
      setSequences(prev => prev.filter(seq => seq.id !== sequenceId));
    } catch (error) {
      console.error('Failed to delete sequence:', error);
      alert('Failed to delete sequence. Please try again.');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : generatingSequence ? (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Generating sequence...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait, this may take a moment</p>
          </div>
        </div>
      ) : sequences.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No sequences yet. Start a conversation to create one!
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {sequences.map(seq => (
            <div key={seq.id} className="sequence-card">
              <div className="flex justify-between items-center">
                <h3 className="sequence-title" onClick={() => toggleSequence(seq.id)}>
                  {seq.title || 'Untitled Sequence'}
                </h3>
                <div className="sequence-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(seq);
                    }}
                    className="btn btn-edit">
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(seq.id);
                    }} className="btn btn-delete">
                    Delete
                  </button>
                </div>
              </div>
              
              {editingSequence === seq.id ? (
                <div className="sequence-editor">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="sequence-textarea"/>
                  <div className="editor-actions">
                    <button onClick={() => handleSave(seq.id)} className="btn btn-save">
                      Save
                    </button>
                    <button onClick={() => setEditingSequence(null)} className="btn btn-cancel">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                expandedSequences.has(seq.id) && (
                  <div className="sequence-content whitespace-pre-wrap">
                    {seq.content}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workspace;
