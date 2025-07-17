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
  fields: FormField[]
  tips: string[] // Dicas gerais para a instituição
}

export type AppStep =
  | "welcome"
  | "select_institution"
  | "enter_credentials"
  | "enter_api_key"
  | "processing"
  | "view_results"
  | "send_answers"
  | "help"
