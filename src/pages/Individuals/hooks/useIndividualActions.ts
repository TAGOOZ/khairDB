import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { toast } from '../Toast';
import { useLanguage } from '../../../contexts/LanguageContext';
import { logActivity } from '../../../services/activityLogs';

interface UseIndividualActionsProps {
    onSuccess: () => void;
}

export function useIndividualActions({ onSuccess }: UseIndividualActionsProps) {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: IndividualFormData, individualId?: string) => {
        setIsSubmitting(true);
        try {
            if (individualId) {
                // First, fetch current individual data to compare changes
                const { data: oldData } = await supabase
                    .from('individuals')
                    .select('first_name, last_name, id_number, date_of_birth, gender, marital_status, phone, address, district, description, job, employment_status, salary, list_status, family_id')
                    .eq('id', individualId)
                    .single();

                // Update existing individual
                const { error } = await supabase.rpc('update_individual_transaction', {
                    p_individual_id: individualId,
                    p_data: data
                });

                if (error) throw error;

                // Calculate which fields actually changed
                const changedFields: string[] = [];
                if (oldData) {
                    const fieldsToCheck = ['first_name', 'last_name', 'id_number', 'date_of_birth', 'gender', 'marital_status', 'phone', 'address', 'district', 'description', 'job', 'employment_status', 'salary', 'list_status', 'family_id'];
                    fieldsToCheck.forEach(field => {
                        const oldValue = oldData[field as keyof typeof oldData];
                        const newValue = data[field as keyof typeof data];
                        if (String(oldValue || '') !== String(newValue || '')) {
                            changedFields.push(field);
                        }
                    });
                }

                // Check for assistance changes (we can't easily compare, so just note if they exist in new data)
                const assistanceTypes = ['medical_help', 'food_assistance', 'marriage_assistance', 'debt_assistance', 'education_assistance', 'shelter_assistance'];
                assistanceTypes.forEach(type => {
                    const assistanceData = data[type as keyof typeof data];
                    if (assistanceData && typeof assistanceData === 'object' && Object.keys(assistanceData).length > 0) {
                        changedFields.push(type);
                    }
                });

                // Log the update activity with only changed fields
                await logActivity(
                    'update',
                    'individual',
                    individualId,
                    `${data.first_name} ${data.last_name}`,
                    { changed_fields: changedFields.length > 0 ? changedFields : ['metadata only'] }
                );
            } else {
                // Create new individual
                const { data: result, error } = await supabase.rpc('create_individual_transaction', {
                    p_data: data
                });

                if (error) throw error;

                // Log the create activity
                await logActivity(
                    'create',
                    'individual',
                    result?.id,
                    `${data.first_name} ${data.last_name}`
                );
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving individual:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirmDelete'))) return;

        try {
            // Get individual name before deletion for logging
            const { data: individual } = await supabase
                .from('individuals')
                .select('first_name, last_name')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('individuals')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Log the delete activity
            await logActivity(
                'delete',
                'individual',
                id,
                individual ? `${individual.first_name} ${individual.last_name}` : 'Unknown'
            );

            toast.success(t('individualDeletedSuccess' as any));
            onSuccess();
        } catch (error) {
            console.error('Error deleting individual:', error);
            toast.error(t('errorDeleting' as any));
        }
    };

    return {
        handleSubmit,
        handleDelete,
        isSubmitting
    };
}

