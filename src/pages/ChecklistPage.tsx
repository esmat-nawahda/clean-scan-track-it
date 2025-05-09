
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CleaningChecklist from '@/components/forms/CleaningChecklist';
import Header from '@/components/navigation/Header';

const ChecklistPage = () => {
  return (
    <>
      <Header />
      <MainLayout className="pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Cleaning Checklist</h1>
            <p className="text-muted-foreground">
              Please complete all items on the checklist
            </p>
          </div>
          
          <CleaningChecklist />
        </div>
      </MainLayout>
    </>
  );
};

export default ChecklistPage;
