
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SuccessScreen from '@/components/feedback/SuccessScreen';
import Header from '@/components/navigation/Header';

const SuccessPage = () => {
  return (
    <>
      <Header />
      <MainLayout className="pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Success</h1>
            <p className="text-muted-foreground">
              Your cleaning record has been submitted
            </p>
          </div>
          
          <SuccessScreen />
        </div>
      </MainLayout>
    </>
  );
};

export default SuccessPage;
