"use client";

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

interface TestStepContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
}

const TestStepContext = createContext<TestStepContextType | undefined>(undefined);

export const useTestStep = () => {
  const context = useContext(TestStepContext);
  if (!context) {
    throw new Error("useTestStep must be used within a TestStepProvider");
  }
  return context;
};

export const TestStepProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(1);
  return (
    <TestStepContext.Provider value={{ step, setStep }}>
      {children}
    </TestStepContext.Provider>
  );
};
