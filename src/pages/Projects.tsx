import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { availableHashtags } from '../schemas/individualSchema';
import { Plus, Trash2, Edit, Check, X, Users, ChevronRight } from 'lucide-react';
import {
  getHashtagCounts,
  addHashtagToAll,
  removeHashtagFromAll,
  createHashtag,
  Hashtag
} from '../services/hashtags';
import { supabase } from '../lib/supabase';

export function Projects() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isAddingHashtag, setIsAddingHashtag] = useState(false);
  const [newHashtag, setNewHashtag] = useState('');
  const [individualsList, setIndividualsList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch project statistics
  const { data: projectStats = [], isLoading, isError } = useQuery({
    queryKey: ['projectStats'],
    queryFn: async () => {
      try {
        // Get counts of individuals by hashtag
        const data = await getHashtagCounts();
        return data;
      } catch (error) {
        console.error('Error fetching project stats:', error);
        setError('Failed to load projects data. Database functions might be missing.');
        return [];
      }
    },
    retry: 1, // Only retry once to avoid infinite loading on missing functions
  });

  // Fetch individuals for selected project
  useEffect(() => {
    if (selectedProject) {
      const fetchIndividuals = async () => {
        try {
          // Get hashtag ID first
          const hashtags = projectStats.filter((h: Hashtag) => h.name === selectedProject);

          if (hashtags.length === 0) {
            setIndividualsList([]);
            return;
          }

          const hashtagId = hashtags[0].id;

          // Query for individuals with this hashtag
          const { data, error } = await supabase
            .from('individual_hashtags')
            .select('individual_id')
            .eq('hashtag_id', hashtagId);

          if (error) throw error;

          if (!data || data.length === 0) {
            setIndividualsList([]);
            return;
          }

          // Get the individual details
          const individualIds = data.map((item: { individual_id: string }) => item.individual_id);

          const { data: individuals, error: indError } = await supabase
            .from('individuals')
            .select('id, first_name, last_name, id_number, district')
            .in('id', individualIds);

          if (indError) throw indError;

          setIndividualsList(individuals || []);
        } catch (error) {
          console.error('Error fetching individuals:', error);
          setError('Failed to load individuals data.');
          setIndividualsList([]);
        }
      };

      fetchIndividuals();
    }
  }, [selectedProject, projectStats]);

  // Handle adding a hashtag to all individuals
  const handleAddHashtagToAll = async (hashtagName: string) => {
    try {
      // Create the hashtag without connecting to any individuals
      const { data, error } = await supabase
        .from('hashtags')
        .insert([{ name: hashtagName }])
        .select();

      if (error) throw error;

      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['projectStats'] });
    } catch (error) {
      console.error('Error creating new project:', error);
      setError('Failed to create new project.');
    }
  };

  // Remove hashtag from system
  const handleRemoveHashtag = async (hashtagName: string) => {
    try {
      if (confirm(`Are you sure you want to remove the project "${hashtagName}"?`)) {
        // Get all individual IDs
        const { data: individuals, error } = await supabase
          .from('individuals')
          .select('id');

        if (error) throw error;

        if (!individuals || individuals.length === 0) return;

        const individualIds = individuals.map((ind: { id: string }) => ind.id);

        // Remove hashtag from all individuals
        await removeHashtagFromAll(hashtagName, individualIds);

        // Refetch data
        queryClient.invalidateQueries({ queryKey: ['projectStats'] });

        if (selectedProject === hashtagName) {
          setSelectedProject(null);
          setIndividualsList([]);
        }
      }
    } catch (error) {
      console.error('Error removing hashtag:', error);
      setError('Failed to remove project.');
    }
  };

  // Handle adding a new hashtag
  const handleAddHashtag = async () => {
    if (!newHashtag.trim()) return;

    try {
      // Create the hashtag
      await createHashtag(newHashtag.trim());

      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['projectStats'] });

      setNewHashtag('');
      setIsAddingHashtag(false);
    } catch (error) {
      console.error('Error adding new hashtag:', error);
      setError('Failed to add new project.');
    }
  };

  // Get missing hashtags that aren't in the stats yet
  const existingHashtags = new Set(projectStats.map((stat: Hashtag) => stat.name));
  const missingHashtags = availableHashtags.filter(tag => !existingHashtags.has(tag));

  // If there's a database error, show a friendly message
  if (isError || error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error || "Failed to load projects. The database functions might be missing or there's a connection issue."}</span>
          <p className="mt-2">Please contact the system administrator to set up the required database functions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setIsAddingHashtag(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Projects List</h2>

            {/* New hashtag input */}
            {isAddingHashtag && (
              <div className="mb-4 p-3 border border-blue-200 bg-blue-50 rounded-md">
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    placeholder="New project name"
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button
                    onClick={handleAddHashtag}
                    className="ml-2 p-2 text-green-600 hover:text-green-800"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingHashtag(false);
                      setNewHashtag('');
                    }}
                    className="ml-1 p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Missing hashtags */}
                {missingHashtags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Recommended projects:</p>
                    <div className="flex flex-wrap gap-2">
                      {missingHashtags.map(tag => (
                        <button
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-xs rounded-md hover:bg-gray-200"
                          onClick={() => setNewHashtag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Project list */}
            <ul className="space-y-2">
              {projectStats.map((item: Hashtag) => (
                <li
                  key={item.id}
                  className={`
                    flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors
                    ${selectedProject === item.name ? 'bg-blue-100' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => setSelectedProject(item.name)}
                >
                  <div className="flex items-center space-x-2">
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedProject === item.name ? 'transform rotate-90' : ''}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full flex items-center mr-2">
                      <Users className="w-3 h-3 mr-1" />
                      {item.count}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveHashtag(item.name);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}

              {projectStats.length === 0 && (
                <li className="text-center py-4 text-gray-500">
                  No projects found
                </li>
              )}
            </ul>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            {selectedProject ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  {selectedProject} - Individuals ({individualsList.length})
                </h2>

                {individualsList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                            {t('name')}
                          </th>
                          <th scope="col" className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                            {t('idNumber')}
                          </th>
                          <th scope="col" className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                            {t('district')}
                          </th>
                          <th scope="col" className={`px-6 py-3 text-${isRTL ? 'left' : 'right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                            {t('actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {individualsList.map((individual) => (
                          <tr key={individual.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {individual.first_name} {individual.last_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {individual.id_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {individual.district}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <a href={`/individuals/${individual.id}`} className="text-blue-600 hover:text-blue-900">View</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No individuals in this project
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a project to see individuals
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 