import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
}: PaginationProps) {
    const { t, dir } = useLanguage();

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6" dir={dir}>
            <div className="flex-1 flex justify-between sm:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage <= 1}
                >
                    {t('previous')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                >
                    {t('next')}
                </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">{startItem}</span>
                        {' - '}
                        <span className="font-medium">{endItem}</span>
                        {' / '}
                        <span className="font-medium">{totalItems}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
                            disabled={currentPage <= 1}
                            icon={dir === 'rtl' ? ChevronRight : ChevronLeft}
                            className="mr-2"
                        >
                            {t('previous')}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNext}
                            disabled={currentPage >= totalPages}
                            icon={dir === 'rtl' ? ChevronLeft : ChevronRight} // Icon should flip based on direction, but "Next" is usually right arrow in LTR. In RTL, "Next" (future) is left arrow? No, usually "Next" logic is handled by text. Icons: LTR Left=Prev, Right=Next. RTL Right=Prev, Left=Next. 
                        // Wait, lucide-react icons are directional.
                        // In RTL: Prev (Right Arrow), Next (Left Arrow).
                        // Logic check:
                        // LTR: Prev (<), Next (>)
                        // RTL: Prev (>), Next (<)
                        // So:
                        // Icon for Prev: dir === 'rtl' ? ChevronRight : ChevronLeft
                        // Icon for Next: dir === 'rtl' ? ChevronLeft : ChevronRight
                        >
                            {t('next')}
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
