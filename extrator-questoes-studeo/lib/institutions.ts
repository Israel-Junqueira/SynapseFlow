// lib/institutions.ts

import type { Institution } from "@/types/app"

export const predefinedInstitutions: Institution[] = [
  {
    id: "unicesumar",
    name: "Unicesumar",
    loginUrl: "https://studeo.unicesumar.edu.br/#!/access/login",
    fields: [
      {
        id: "username",
        label: "Usuário (CPF)",
        type: "text",
        placeholder: "Seu CPF/Usuário da Unicesumar",
        helpText:
          "Este é o login que você usa no portal da Unicesumar para acessar suas aulas e provas. Geralmente é o seu CPF.",
        required: true,
      },
      {
        id: "password",
        label: "Senha",
        type: "password",
        placeholder: "Sua senha da Unicesumar",
        helpText: "A senha que você usa para acessar o portal da Unicesumar.",
        required: true,
      },
      {
        id: "examUrl",
        label: "URL da Prova",
        type: "url",
        placeholder: "https://studeo.unicesumar.edu.br/#!/app/studeo/aluno/ambiente/disciplina/.../questionario/...",
        helpText:
          "Cole aqui a URL completa da página da prova que você deseja resolver. Certifique-se de que é a URL da página onde as questões estão visíveis.",
        required: true,
      },
    ],
    tips: [
      "Certifique-se de que o CPF está correto e sem pontos ou traços.",
      "A URL da prova deve ser a página exata onde as questões são exibidas.",
      "Se tiver problemas, tente acessar a prova manualmente no navegador primeiro.",
    ],
  },
  {
    id: "atrator",
    name: "Atrator (Exemplo)",
    loginUrl: "https://atrator.com.br/login",
    fields: [
      {
        id: "email",
        label: "Email",
        type: "text",
        placeholder: "seu.email@exemplo.com",
        helpText: "Use o email cadastrado na plataforma Atrator.",
        required: true,
      },
      {
        id: "password",
        label: "Senha",
        type: "password",
        placeholder: "Sua senha da Atrator",
        helpText: "A senha que você usa para acessar a plataforma Atrator.",
        required: true,
      },
      {
        id: "courseId",
        label: "ID do Curso",
        type: "text",
        placeholder: "Ex: 12345",
        helpText: "O ID numérico do curso onde a prova está localizada. Pode ser encontrado na URL do curso.",
        required: true,
      },
    ],
    tips: [
      "Para o ID do Curso, procure por 'courseId=' na URL do seu navegador.",
      "A Atrator pode ter um sistema de segurança que exige re-login frequente.",
    ],
  },
  // Adicione mais instituições aqui
]

// Funções para gerenciar instituições salvas localmente (simulação)
export const getSavedInstitutions = (): Institution[] => {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("customInstitutions")
  return saved ? JSON.parse(saved) : []
}

export const saveInstitution = (newInstitution: Institution) => {
  if (typeof window === "undefined") return
  const saved = getSavedInstitutions()
  const updated = [...saved.filter((inst) => inst.id !== newInstitution.id), newInstitution]
  localStorage.setItem("customInstitutions", JSON.stringify(updated))
}

export const getAllInstitutions = (): Institution[] => {
  return [...predefinedInstitutions, ...getSavedInstitutions()]
}
