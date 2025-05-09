
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuccessScreen = () => {
  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <div className="w-20 h-20 bg-primary/10 flex items-center justify-center rounded-full mx-auto mb-4">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Cleaning Record Submitted</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Thank you for submitting your cleaning record. Your work has been logged in the system.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button asChild className="w-full">
          <Link to="/">Scan Another Location</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/admin">Admin Dashboard</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SuccessScreen;
