import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DistributionsList } from './DistributionsList';
import { CreateDistribution } from './CreateDistribution';
import { EditDistribution } from './EditDistribution';
import { DistributionHistory } from './DistributionHistory';
import { useLanguage } from '../../contexts/LanguageContext';

export function Distributions() {
  const { t } = useLanguage();
  
  return (
    <Routes>
      <Route index element={<DistributionsList />} />
      <Route path="create" element={<CreateDistribution />} />
      <Route path="edit/:id" element={<EditDistribution />} />
      <Route path="history" element={<DistributionHistory />} />
    </Routes>
  );
}
