// components/step-indicator.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { AppStep } from "@/types/app" // Importa AppStep

interface StepIndicatorProps {
  steps: { name: string; id: AppStep }[] // Agora espera um array de objetos com nome e id
  currentStepIndex: number
  onStepClick: (stepId: AppStep) => void // Nova prop para lidar com o clique
}

export function StepIndicator({ steps, currentStepIndex, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => onStepClick(step.id)}>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
                index <= currentStepIndex ? "bg-[#a020f0] text-white" : "bg-[#3a3a5a] text-gray-300",
              )}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                "mt-2 text-xs text-center transition-colors duration-300",
                index <= currentStepIndex ? "text-[#a020f0]" : "text-gray-400",
              )}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-12 transition-colors duration-300",
                index < currentStepIndex ? "bg-[#a020f0]" : "bg-[#3a3a5a]",
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
