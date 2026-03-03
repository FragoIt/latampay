'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const steps = [
  {
    id: 'profile',
    title: 'Configura tu Perfil',
    description: 'Completa tu información básica para empezar.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'invoice',
    title: 'Crea tu Primera Factura',
    description: 'Genera un borrador para ver cómo funciona.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'wallet',
    title: 'Conecta tu Wallet',
    description: 'Vincula tu wallet para recibir pagos.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 text-center mb-4">Bienvenido a LatamPay</h2>
        <p className="text-neutral-500 text-center max-w-2xl mx-auto">
          Completa estos 3 pasos sencillos para empezar a cobrar internacionalmente sin fricción.
        </p>
      </div>

      {/* Steps Visual Checklist */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-200 -z-10 transform -translate-y-1/2"></div>
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center bg-gray-100 px-4 z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${index <= currentStep
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-neutral-300 text-neutral-400'
                }`}
            >
              {step.icon}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${index <= currentStep ? 'text-primary-700' : 'text-neutral-500'
                }`}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="w-full max-w-2xl mx-auto shadow-medium border-neutral-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <Badge variant="secondary">Paso {currentStep + 1} de {steps.length}</Badge>
          </div>
          <CardDescription className="text-base mt-2">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Nombre de la Empresa</label>
                  <input type="text" className="w-full rounded-lg border-neutral-300 focus:ring-primary-500 focus:border-primary-500" placeholder="Acme Inc." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Sitio Web</label>
                  <input type="url" className="w-full rounded-lg border-neutral-300 focus:ring-primary-500 focus:border-primary-500" placeholder="https://acme.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Descripción del Negocio</label>
                <textarea className="w-full rounded-lg border-neutral-300 focus:ring-primary-500 focus:border-primary-500" rows={3} placeholder="Agencia de desarrollo de software..." />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-neutral-600 mb-6">
                Vamos a crear una factura de prueba para que veas lo fácil que es.
              </p>
              <Button variant="outline" className="w-full sm:w-auto">
                Generar Factura de Prueba
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-800">
                  Conectar tu wallet te permite recibir pagos en USDC directamente en tu custodia.
                </p>
              </div>
              <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-12 text-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Conectar Metamask / WalletConnect
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-neutral-100 pt-6">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
            Atrás
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
