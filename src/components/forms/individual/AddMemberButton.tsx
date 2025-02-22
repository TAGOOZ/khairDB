import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AddMemberButtonProps {
  onAddMember: (data: any) => void;
}

export function AddMemberButton({ onAddMember }: AddMemberButtonProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = React.useState(false);
  const [memberType, setMemberType] = React.useState<'child' | 'else'>('child');
  const formRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData();
    const inputs = formRef.current.querySelectorAll('input, select, textarea');
    inputs.forEach((input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      if (input.name) {
        formData.append(input.name, input.value);
      }
    });

    const data = Object.fromEntries(formData.entries());
    onAddMember(data);
    setShowForm(false);
    
    // Reset form values
    inputs.forEach((input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      input.value = '';
    });
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button
          variant="outline"
          icon={Plus}
          onClick={() => setShowForm(true)}
        >
          {t('addMember')}
        </Button>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">{t('addMember')}</h4>
            <Select
              value={memberType}
              onChange={(e) => setMemberType(e.target.value as 'child' | 'else')}
              options={[
                { value: 'child', label: t('addChild') },
                { value: 'else', label: t('addElse') }
              ]}
              className="w-40"
            />
          </div>

          <div ref={formRef} className="space-y-4">
            {memberType === 'child' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="first_name"
                    label={t('childName')}
                    required
                  />
                  <Input
                    name="last_name"
                    label={t('lastName')}
                    required
                  />
                  <Input
                    type="date"
                    name="date_of_birth"
                    label={t('dateOfBirth')}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Select
                    name="gender"
                    label={t('gender')}
                    required
                    options={[
                      { value: 'boy', label: t('boy') },
                      { value: 'girl', label: t('girl') }
                    ]}
                  />
                  <Select
                    name="school_stage"
                    label={t('schoolStage')}
                    options={[
                      { value: 'kindergarten', label: t('kindergarten') },
                      { value: 'primary', label: t('primary') },
                      { value: 'preparatory', label: t('preparatory') },
                      { value: 'secondary', label: t('secondary') }
                    ]}
                  />
                </div>
                <Textarea
                  label={t('description')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    label={t('name')}
                    required
                  />
                  <Input
                    type="date"
                    name="date_of_birth"
                    label={t('dateOfBirth')}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Select
                    name="gender"
                    label={t('gender')}
                    required
                    options={[
                      { value: 'male', label: t('male') },
                      { value: 'female', label: t('female') }
                    ]}
                  />
                  <Select
                    name="role"
                    label={t('role')}
                    required
                    options={[
                      { value: 'spouse', label: t('spouse') },
                      { value: 'sibling', label: t('sibling') },
                      { value: 'grandparent', label: t('grandparent') },
                      { value: 'other', label: t('other') }
                    ]}
                  />
                  <Input
                    name="job_title"
                    label={t('jobTitle')}
                  />
                  <Input
                    name="phone_number"
                    label={t('phoneNumber')}
                  />
                  <Select
                    name="relation"
                    label={t('relation')}
                    required
                    options={[
                      { value: 'wife', label: t('wife') },
                      { value: 'husband', label: t('husband') },
                      { value: 'sister', label: t('sister') },
                      { value: 'brother', label: t('brother') },
                      { value: 'mother', label: t('mother') },
                      { value: 'father', label: t('father') },
                      { value: 'mother_in_law', label: t('motherInLaw') },
                      { value: 'father_in_law', label: t('fatherInLaw') },
                      { value: 'daughters_husband', label: t('daughtersHusband') },
                      { value: 'sons_wife', label: t('sonsWife') }
                    ]}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
              >
                {t('add')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}