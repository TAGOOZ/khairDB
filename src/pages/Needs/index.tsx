import { AssistanceList } from './NeedsList';
import { useLanguage } from '../../contexts/LanguageContext';

export function Needs() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('assistanceNeeds')}</h1>
      </div>

      <AssistanceList />
    </div>
  );
}
