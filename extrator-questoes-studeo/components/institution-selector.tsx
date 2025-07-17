// components/institution-selector.tsx
"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, School } from "lucide-react"
import type { Institution } from "@/types/app" // Corrigido: Importa 'Institution' diretamente de types/app

interface InstitutionSelectorProps {
  institutions: Institution[]
  onSelectInstitution: (institution: Institution) => void
  onAddNewInstitution: () => void
}

export function InstitutionSelector({
  institutions,
  onSelectInstitution,
  onAddNewInstitution,
}: InstitutionSelectorProps) {
  return (
    <Card className="w-full max-w-3xl bg-[#2a2a4a] border-[#3a3a5a] shadow-lg shadow-[#a020f0]/20 z-10">
      <CardHeader className="border-b border-[#3a3a5a] pb-4">
        <CardTitle className="text-3xl font-bold text-[#a020f0] flex items-center">
          <School className="mr-3 h-8 w-8" />
          Escolha sua Instituição
        </CardTitle>
        <CardDescription className="text-gray-300 mt-2">
          Selecione a plataforma de ensino onde sua prova está localizada.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {institutions.map((inst) => (
            <Button
              key={inst.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left bg-[#3a3a5a] border-[#4a4a6a] hover:bg-[#4a4a6a] hover:border-[#a020f0] transition-all duration-200"
              onClick={() => onSelectInstitution(inst)}
            >
              <span className="text-lg font-semibold text-gray-100">{inst.name}</span>
              <span className="text-sm text-gray-300 mt-1 truncate w-full">{inst.loginUrl}</span>
            </Button>
          ))}
        </div>
        <Button
          variant="secondary"
          className="w-full bg-[#3a3a5a] hover:bg-[#4a4a6a] text-gray-100 flex items-center justify-center mt-4"
          onClick={onAddNewInstitution}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Adicionar Nova Instituição (Em Breve)
        </Button>
        <p className="text-sm text-gray-400 text-center mt-4">
          A funcionalidade de adicionar novas instituições está em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  )
}
