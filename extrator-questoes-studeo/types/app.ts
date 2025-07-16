// types/app.ts

export type FormFieldType = "text" | "password" | "url" | "textarea" // Adicionado "textarea"

export interface FormField {
  id: string
  label: string
  type: FormFieldType
  placeholder: string
  helpText: string
  required: boolean
}

export interface Institution {
  id: string
  name: string
  loginUrl: string
  fields: FormField[] // Agora pode conter todos os campos, incluindo examUrl
  tips: string[] // Dicas gerais para a instituição
}

export type AppStep =
  | "welcome"
  | "select_institution"
  | "ask_login_requirement" // Nova etapa
  | "enter_credentials" // Para login + URL da prova
  | "enter_exam_url_public" // Para URL da prova sem login
  | "enter_api_key"
  | "processing"
  | "view_results"
  | "send_answers"
  | "help"
