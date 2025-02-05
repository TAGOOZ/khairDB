import { Individual } from '../types';
    import { formatDate } from './formatters';
    import { jsPDF } from 'jspdf';
    
    export function printIndividualsToCSV(individuals: Individual[]): string {
      const header = [
        'First Name',
        'Last Name',
        'ID Number',
        'Date of Birth',
        'Gender',
        'Marital Status',
        'Phone',
        'District',
        'Address',
        'Description',
        'Job',
        'Employment Status',
        'Salary',
        'Created At',
        'Added By',
        'Needs'
      ];
    
      const rows = individuals.map(individual => [
        individual.first_name,
        individual.last_name,
        individual.id_number,
        formatDate(individual.date_of_birth),
        individual.gender,
        individual.marital_status,
        individual.phone || '',
        individual.district,
        individual.address || '',
        individual.description || '',
        individual.job || '',
        individual.employment_status,
        individual.salary || '',
        formatDate(individual.created_at),
        individual.created_by_user ? `${individual.created_by_user.first_name} ${individual.created_by_user.last_name}` : '',
        individual.needs.map(need => `${need.category} (${need.priority}): ${need.description}`).join('; ')
      ]);
    
      // Use encodeURIComponent to handle special characters
      return [header, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    }
    
    export function downloadCSV(csv: string, filename: string) {
      // Use UTF-8 BOM to ensure correct encoding
      const utf8BOM = '\ufeff';
      const blob = new Blob([utf8BOM + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
