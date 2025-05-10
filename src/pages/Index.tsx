
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/navigation/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, QrCode, Database, Users, Settings, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <>
      <Header />
      <MainLayout>
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  QR-Based Cleaning Log System
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Streamline your facility cleaning management with our QR-based tracking solution. 
                  Track, analyze, and optimize your cleaning operations effortlessly.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="px-8">
                  <Link to="/demo">Try Demo</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8">
                  <Link to="/admin">Admin Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Powerful Features
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                  Everything you need to manage and optimize your facility cleaning operations
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <Card className="glass-effect hover-scale">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <QrCode className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">QR Code Scanning</h3>
                    <p className="text-muted-foreground">
                      Scan location-specific QR codes to instantly access the right cleaning checklist
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect hover-scale">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Smart Checklists</h3>
                    <p className="text-muted-foreground">
                      Customizable cleaning checklists with location context and automatic timestamping
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect hover-scale">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Data Dashboard</h3>
                    <p className="text-muted-foreground">
                      Comprehensive analytics dashboard to track cleaning history and performance metrics
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect hover-scale">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Staff Management</h3>
                    <p className="text-muted-foreground">
                      Track staff performance, assign responsibilities, and manage cleaning schedules
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect hover-scale">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Export Reports</h3>
                    <p className="text-muted-foreground">
                      Generate detailed reports and export data in multiple formats for analysis
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect hover-scale">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Custom Settings</h3>
                    <p className="text-muted-foreground">
                      Tailored system configuration to match your organization's specific needs
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  How It Works
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                  Simple and effective workflow for tracking cleaning activities
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">1</div>
                    <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 w-full h-0.5 bg-primary/30 hidden md:block"></div>
                  </div>
                  <h3 className="text-xl font-bold">Scan QR Code</h3>
                  <p className="text-muted-foreground text-center">
                    Staff scan location-specific QR code using any smartphone
                  </p>
                </div>
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">2</div>
                    <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 w-full h-0.5 bg-primary/30 hidden md:block"></div>
                  </div>
                  <h3 className="text-xl font-bold">Complete Checklist</h3>
                  <p className="text-muted-foreground text-center">
                    Fill out the location-specific cleaning checklist and submit
                  </p>
                </div>
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">3</div>
                  <h3 className="text-xl font-bold">Track & Analyze</h3>
                  <p className="text-muted-foreground text-center">
                    Administrators review data, generate reports, and optimize operations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to streamline your cleaning operations?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                  Try our QR-Based Cleaning Log System today and experience the difference
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="px-8">
                  <Link to="/demo">Try Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Index;
