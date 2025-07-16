// components/step-indicator.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { AppStep } from "@/types/app" // Importa AppStep

interface StepIndicatorProps {
  steps: { name: string; id: AppStep }[] // Agora espera um array de objetos com nome e id
  currentStepIndex: number
  onStepClick: (stepId: AppStep) => void // Nova prop para lidar com o clique
  unlockedSteps: AppStep[] // Nova prop para saber quais etapas estão desbloqueadas
}

export function StepIndicator({ steps, currentStepIndex, onStepClick, unlockedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const isUnlocked = unlockedSteps.includes(step.id)
        const isCurrent = index === currentStepIndex
        const isCompleted = index < currentStepIndex

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex flex-col items-center",
                isUnlocked ? "cursor-pointer" : "cursor-not-allowed opacity-50", // Desabilita clique visualmente
              )}
              onClick={() => isUnlocked && onStepClick(step.id)} // Só permite clique se desbloqueado
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
                  isCurrent
                    ? "bg-[#a020f0] text-white"
                    : isCompleted
                      ? "bg-[#a020f0]/70 text-white"
                      : "bg-[#3a3a5a] text-gray-300",
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs text-center transition-colors duration-300",
                  isCurrent ? "text-[#a020f0]" : isCompleted ? "text-[#a020f0]/70" : "text-gray-400",
                )}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 transition-colors duration-300",
                  isCompleted ? "bg-[#a020f0]" : "bg-[#3a3a5a]",
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
