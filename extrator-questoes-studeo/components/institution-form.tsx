// components/institution-form.tsx
"use client"

import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, HelpCircle, User } from "lucide-react"
import type { Institution, FormField } from "@/types/app" // Corrigido: Importa 'Institution' e 'FormField' diretamente de types/app
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface InstitutionFormProps {
  institution: Institution
  formData: { [key: string]: string }
  onFormDataChange: (key: string, value: string) => void
  onSubmit: () => void
  onBack: () => void
  submitButtonText: string
  isSubmitting: boolean
  message: string | null
  isError: boolean
  children?: React.ReactNode // Para renderizar a área de respostas ou outros elementos
}

export function InstitutionForm({
  institution,
  formData,
  onFormDataChange,
  onSubmit,
  onBack,
  submitButtonText,
  isSubmitting,
  message,
  isError,
  children,
}: InstitutionFormProps) {
  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      type: field.type,
      placeholder: field.placeholder,
      value: formData[field.id] || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onFormDataChange(field.id, e.target.value),
      className:
        "bg-[#3a3a5a] border-[#4a4a6a] text-white placeholder:text-gray-400 focus:border-[#a020f0] focus:ring-[#a020f0]",
      required: field.required,
    }

    return (
      <div key={field.id} className="space-y-2">
        <label htmlFor={field.id} className="block text-sm font-medium text-gray-200">
          {field.label}
        </label>
        {field.type === "textarea" ? (
          <Textarea {...(commonProps as React.ComponentProps<typeof Textarea>)} rows={3} />
        ) : (
          <Input {...(commonProps as React.ComponentProps<typeof Input>)} />
        )}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-gray-300 hover:text-gray-100">
              <HelpCircle className="mr-1 h-3 w-3" /> Entenda isso
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-2 bg-[#3a3a5a]/50 rounded-md text-xs text-gray-200">
            {field.helpText}
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl bg-[#2a2a4a] border-[#3a3a5a] shadow-lg shadow-[#a020f0]/20 z-10">
      <CardHeader className="border-b border-[#3a3a5a] pb-4">
        <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4 text-gray-300 hover:text-gray-100">
          <ChevronLeft className="h-5 w-5 mr-2" /> Voltar
        </Button>
        <CardTitle className="text-3xl font-bold text-[#a020f0] flex items-center justify-center">
          <User className="mr-3 h-8 w-8" />
          {institution.name}
        </CardTitle>
        <CardDescription className="text-gray-300 mt-2 text-center">
          Preencha os dados para acessar sua prova em {institution.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {institution.fields.map(renderField)}
        <Button
          onClick={onSubmit}
          className="w-full bg-[#a020f0] hover:bg-[#8a1acb] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processando..." : submitButtonText}
        </Button>
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${isError ? "bg-red-900/30 text-red-300 border border-red-700" : "bg-green-900/30 text-green-300 border border-green-700"}`}
          >
            {message}
          </div>
        )}
        {children} {/* Renderiza conteúdo adicional, como a área de respostas */}
      </CardContent>
    </Card>
  )
}
