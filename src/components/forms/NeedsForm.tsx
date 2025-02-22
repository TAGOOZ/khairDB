import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NeedsFormData } from '../../types/needs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { Textarea } from '../ui/TextArea';
import { Input } from '../ui/Input';

interface NeedsFormProps {
  onSubmit: (data: NeedsFormData) => void;
  onCancel: () => void;
  initialData?: Partial<NeedsFormData>;
}

export function NeedsForm({ onSubmit, onCancel, initialData }: NeedsFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<NeedsFormData>({
    medicalChecks: initialData?.medicalChecks || {
      examination: false,
      tests: false,
      xrays: false,
      operations: false
    },
    medicalDescriptions: initialData?.medicalDescriptions || {
      examination: '',
      tests: '',
      xrays: '',
      operations: ''
    },
    chronicDisease: initialData?.chronicDisease || '',
    treatmentFrequency: initialData?.treatmentFrequency || '',
    treatmentAbility: initialData?.treatmentAbility || '',
    hasHealthInsurance: initialData?.hasHealthInsurance || '',
    feedingStatus: initialData?.feedingStatus || '',
    hasSupplyCard: initialData?.hasSupplyCard || false,
    marriageStage: initialData?.marriageStage || '',
    weddingDate: initialData?.weddingDate || '',
    marriageNeeds: initialData?.marriageNeeds || '',
    selectedTags: initialData?.selectedTags || []
  });

  const renderMedicalNeedSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('medicalNeeds')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(formData.medicalChecks).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      medicalChecks: {
                        ...prev.medicalChecks,
                        [key]: checked
                      }
                    }));
                  }}
                />
                <Label htmlFor={key}>{t(key)}</Label>
              </div>
              {value && (
                <Textarea
                  placeholder={t('enterDescription')}
                  value={formData.medicalDescriptions[key]}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      medicalDescriptions: {
                        ...prev.medicalDescriptions,
                        [key]: e.target.value
                      }
                    }));
                  }}
                  className="mt-2"
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>{t('chronicDisease')}</Label>
          <RadioGroup
            value={formData.chronicDisease}
            onValueChange={(value) => setFormData(prev => ({ ...prev, chronicDisease: value }))}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">{t('yes')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">{t('no')}</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );

  const renderFoodNeedSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('foodNeeds')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t('feedingStatus')}</Label>
          <RadioGroup
            value={formData.feedingStatus}
            onValueChange={(value) => setFormData(prev => ({ ...prev, feedingStatus: value }))}
            className="space-y-2"
          >
            {['ready', 'not_ready', 'none'].map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value}>{t(value)}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="supplyCard"
            checked={formData.hasSupplyCard}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, hasSupplyCard: checked as boolean }))
            }
          />
          <Label htmlFor="supplyCard">{t('hasSupplyCard')}</Label>
        </div>
      </CardContent>
    </Card>
  );

  const renderMarriageNeedSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('marriageNeeds')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t('marriageStage')}</Label>
          <RadioGroup
            value={formData.marriageStage}
            onValueChange={(value) => setFormData(prev => ({ ...prev, marriageStage: value }))}
            className="space-y-2"
          >
            {['katb_ketab', 'not_yet', 'none'].map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value}>{t(value)}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.marriageStage !== 'none' && (
          <>
            <div className="space-y-2">
              <Label>{t('weddingDate')}</Label>
              <Input
                type="date"
                value={formData.weddingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('marriageNeeds')}</Label>
              <Textarea
                placeholder={t('enterMarriageNeeds')}
                value={formData.marriageNeeds}
                onChange={(e) => setFormData(prev => ({ ...prev, marriageNeeds: e.target.value }))}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderMedicalNeedSection()}
      {renderFoodNeedSection()}
      {renderMarriageNeedSection()}
    </div>
  );
}