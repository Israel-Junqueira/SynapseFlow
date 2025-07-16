"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Brain,
  Send,
  Timer,
  Gamepad2,
  Zap,
  ChevronLeft,
  Lock,
  Unlock,
} from "lucide-react"
import MinesweeperGame from "@/components/minesweeper-game"
import PongGame from "@/components/pong-game"
import { InstitutionSelector } from "@/components/institution-selector"
import { InstitutionForm } from "@/components/institution-form"
import { StepIndicator } from "@/components/step-indicator"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { getAllInstitutions } from "@/lib/institutions"
import { HelpContent } from "@/components/help-content"
import type { Institution, AppStep, FormField, FormFieldType } from "@/types/app"

// Estimativa de tempo total para o processo em milissegundos (1 minuto e 40 segundos)
const TOTAL_ESTIMATED_PROCESS_TIME = 100 * 1000 // 100 segundos

export default function CyberFuturisticProcessor() {
  // --- Estados da Aplicação ---
  const [currentStep, setCurrentStep] = useState<AppStep>("welcome")
  const [unlockedSteps, setUnlockedSteps] = useState<AppStep[]>(["welcome"]) // Controla etapas desbloqueadas
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [formData, setFormData] = useState<{ [key: string]: string }>({})
  const [apiKey, setApiKey] = useState("")
  const [formSubmitUrl, setFormSubmitUrl] = useState("")
  const [requiresLogin, setRequiresLogin] = useState<boolean | null>(null) // Novo estado para login

  // --- Estados de Processamento e Feedback ---
  const [status, setStatus] = useState("idle") // idle, processing, success, error
  const [processingMessage, setProcessingMessage] = useState("Aguardando início...")
  const [message, setMessage] = useState("") // Mensagens de erro/sucesso para o usuário
  const [answers, setAnswers] = useState("")

  // --- Estados do Timer ---
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState(TOTAL_ESTIMATED_PROCESS_TIME)

  // --- Estados do Jogo ---
  const [currentGame, setCurrentGame] = useState<"minesweeper" | "pong">("minesweeper")

  // --- Estados do Controle de Requisições da API (local storage) ---
  const [dailyCalls, setDailyCalls] = useState(0)
  const [minuteCalls, setMinuteCalls] = useState(0)
  const [lastMinuteResetTime, setLastMinuteResetTime] = useState(Date.now())
  const [lastDailyResetDate, setLastDailyResetDate] = useState(new Date().toDateString())

  // --- Estados da Sidebar de Ajuda ---
  const [helpSection, setHelpSection] = useState("how-to-use") // Seção atual da ajuda

  // --- Dados e Funções de Inicialização ---
  const allInstitutions = useMemo(() => getAllInstitutions(), [])

  // Efeito para carregar dados do localStorage ao montar o componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFormData = localStorage.getItem("formData")
      if (storedFormData) {
        setFormData(JSON.parse(storedFormData))
      }
      setApiKey(localStorage.getItem("apiKey") || "")
      setFormSubmitUrl(localStorage.getItem("formSubmitUrl") || "")

      // Sempre começa na tela de boas-vindas, mas carrega dados para preenchimento
      setCurrentStep("welcome")
      setUnlockedSteps(["welcome"]) // Garante que apenas a primeira etapa esteja desbloqueada no início

      // Carregar e inicializar contadores de API
      const storedDailyCalls = localStorage.getItem("dailyCalls")
      const storedLastDailyDate = localStorage.getItem("lastDailyResetDate")
      const today = new Date().toDateString()

      if (storedLastDailyDate === today) {
        setDailyCalls(Number.parseInt(storedDailyCalls || "0", 10))
      } else {
        localStorage.setItem("dailyCalls", "0")
        localStorage.setItem("lastDailyResetDate", today)
        setDailyCalls(0)
      }

      setMinuteCalls(0)
      setLastMinuteResetTime(Date.now())
    }
  }, []) // Dependência vazia para rodar apenas uma vez na montagem

  // Efeitos para salvar dados no localStorage quando eles mudam
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("formData", JSON.stringify(formData))
    }
  }, [formData])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apiKey", apiKey)
    }
  }, [apiKey])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("formSubmitUrl", formSubmitUrl)
    }
  }, [formSubmitUrl])

  useEffect(() => {
    if (typeof window !== "undefined" && selectedInstitution) {
      localStorage.setItem("selectedInstitutionId", selectedInstitution.id)
    }
  }, [selectedInstitution])

  // Efeito para o timer decrescente
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (status === "processing" && processingStartTime !== null) {
      interval = setInterval(() => {
        const elapsed = Date.now() - processingStartTime
        const newRemaining = TOTAL_ESTIMATED_PROCESS_TIME - elapsed
        setRemainingTime(Math.max(0, newRemaining))
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, processingStartTime])

  // Efeito para resetar o contador de requisições por minuto
  useEffect(() => {
    const minuteInterval = setInterval(() => {
      setMinuteCalls(0)
      setLastMinuteResetTime(Date.now())
    }, 60 * 1000)

    return () => clearInterval(minuteInterval)
  }, [])

  // --- Funções de Manipulação ---
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleFormDataChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSelectInstitution = useCallback((institution: Institution) => {
    setSelectedInstitution(institution)
    setUnlockedSteps((prev) => Array.from(new Set([...prev, "select_institution", "ask_login_requirement"])))
    setCurrentStep("ask_login_requirement")
    setMessage("") // Limpa mensagens ao mudar de etapa
  }, [])

  const handleBackToInstitutionSelect = useCallback(() => {
    setSelectedInstitution(null)
    setRequiresLogin(null) // Resetar estado de login
    setCurrentStep("select_institution")
    setMessage("")
  }, [])

  const handleBackToLoginRequirement = useCallback(() => {
    setRequiresLogin(null)
    setCurrentStep("ask_login_requirement")
    setMessage("")
  }, [])

  const handleBackToCredentials = useCallback(() => {
    setCurrentStep("enter_credentials")
    setMessage("")
  }, [])

  const handleBackToPublicExamUrl = useCallback(() => {
    setCurrentStep("enter_exam_url_public")
    setMessage("")
  }, [])

  const handleStepNavigation = useCallback(
    (stepId: AppStep) => {
      // Não permite navegação manual para 'processing'
      if (stepId === "processing") {
        setMessage("O passo de processamento é automático e não pode ser acessado diretamente.")
        return
      }
      if (unlockedSteps.includes(stepId)) {
        setCurrentStep(stepId)
        setMessage("") // Limpa mensagens ao navegar
      } else {
        setMessage("Por favor, complete as etapas anteriores para avançar.")
      }
    },
    [unlockedSteps],
  )

  const handleResetJourney = useCallback(() => {
    setCurrentStep("welcome")
    setUnlockedSteps(["welcome"])
    setSelectedInstitution(null)
    setFormData({})
    setApiKey("")
    setFormSubmitUrl("")
    setRequiresLogin(null)
    setAnswers("")
    setStatus("idle")
    setProcessingMessage("Aguardando início...")
    setMessage("")
    setProcessingStartTime(null)
    setRemainingTime(TOTAL_ESTIMATED_PROCESS_TIME)
    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedInstitutionId")
      localStorage.removeItem("formData")
      localStorage.removeItem("apiKey")
      localStorage.removeItem("formSubmitUrl")
    }
  }, [])

  const downloadAnswers = useCallback((answersContent: string) => {
    if (!answersContent) return

    const blob = new Blob([answersContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "respostas_synapseflow.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url) // Libera o objeto URL
    setMessage("Respostas baixadas automaticamente!")
  }, [])

  const handleProcess = async () => {
    if (!selectedInstitution) {
      setMessage("Por favor, selecione uma instituição.")
      return
    }

    // Validação dos campos obrigatórios com base no fluxo de login
    let fieldsToValidate: FormField[] = []
    if (requiresLogin) {
      fieldsToValidate = selectedInstitution.fields.filter((field) => field.id !== "examUrl" && field.required)
      if (!formData.examUrl) {
        setMessage("Por favor, preencha a URL da Prova.")
        return
      }
    } else {
      fieldsToValidate = selectedInstitution.fields.filter((field) => field.id === "examUrl" && field.required)
    }

    for (const field of fieldsToValidate) {
      if (!formData[field.id]) {
        setMessage(`Por favor, preencha o campo obrigatório: ${field.label}.`)
        return
      }
    }

    if (!apiKey || apiKey === "gsk_sua_chave_aqui") {
      setMessage("Por favor, insira sua chave de API do Groq no campo.")
      return
    }

    setAnswers("")
    setMessage("")
    setStatus("processing")
    setProcessingStartTime(Date.now())
    setRemainingTime(TOTAL_ESTIMATED_PROCESS_TIME)
    setProcessingMessage("Iniciando processamento...")
    setCurrentStep("processing") // Navega para a tela de processamento imediatamente

    // Adiciona um pequeno atraso para garantir que a tela de processamento seja renderizada
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      // 1. Baixar o HTML usando Selenium (com login ou sem)
      setProcessingMessage("1/3: Fazendo Login e Baixando HTML da Prova...")
      let response = await fetch("/api/fetch-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: requiresLogin ? formData.username : undefined,
          password: requiresLogin ? formData.password : undefined,
          examUrl: formData.examUrl,
          requiresLogin: requiresLogin, // Passa a flag para o backend
        }),
      })
      let data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao baixar HTML.")
      setMessage("HTML baixado com sucesso!")

      // 2. Extrair as questões
      setProcessingMessage("2/3: Extraindo Questões do Conteúdo Baixado...")
      response = await fetch("/api/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao extrair questões.")
      setMessage("Questões extraídas com sucesso!")

      // 3. Resolver as questões com a IA
      setProcessingMessage("3/3: Resolvendo Questões com Inteligência Artificial (Groq)...")
      response = await fetch("/api/resolve-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })
      data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao resolver questões com IA.")

      // Incrementa os contadores de API apenas se a chamada à IA for bem-sucedida
      setDailyCalls((prev) => {
        const newCount = prev + 1
        localStorage.setItem("dailyCalls", newCount.toString())
        return newCount
      })
      setMinuteCalls((prev) => prev + 1)

      setStatus("success")
      setMessage(data.message || "Processamento concluído com sucesso!")
      setAnswers(data.answers || "Nenhuma resposta gerada.")
      // Desbloqueia e navega automaticamente para a tela de resultados
      setUnlockedSteps((prev) => Array.from(new Set([...prev, "view_results"])))
      setCurrentStep("view_results")
      setProcessingStartTime(null)

      // Download automático das respostas
      downloadAnswers(data.answers)
    } catch (error) {
      setStatus("error")
      setMessage(`Erro no processamento: ${error instanceof Error ? error.message : String(error)}`)
      // Volta para a etapa anterior com base no fluxo
      if (requiresLogin) {
        setCurrentStep("enter_api_key")
      } else {
        setCurrentStep("enter_api_key") // Ou enter_exam_url_public se for o caso
      }
      setProcessingStartTime(null)
    }
  }

  const handleSendToForm = async () => {
    if (!formSubmitUrl) {
      setMessage("Por favor, insira a URL do formulário para envio.")
      return
    }
    if (!answers) {
      setMessage("Não há respostas para enviar. Por favor, processe as questões primeiro.")
      return
    }

    setStatus("processing")
    setProcessingMessage("Enviando respostas para o formulário...")
    setProcessingStartTime(Date.now())
    setRemainingTime(10000) // Estimativa de 10 segundos para envio
    setMessage("Enviando respostas para o formulário...")

    try {
      const response = await fetch("/api/send-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formSubmitUrl, answers: answers }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Respostas enviadas para o formulário com sucesso!")
        setProcessingMessage("Respostas Enviadas!")
        setUnlockedSteps((prev) => Array.from(new Set([...prev, "send_answers"])))
        setCurrentStep("send_answers")
      } else {
        setStatus("error")
        setMessage(data.error || "Erro ao enviar respostas para o formulário.")
        setProcessingMessage("Erro ao Enviar Respostas")
      }
      setProcessingStartTime(null)
    } catch (error) {
      setStatus("error")
      setMessage(`Erro de conexão ao enviar formulário: ${error instanceof Error ? error.message : String(error)}`)
      setProcessingMessage("Erro de Conexão ao Enviar")
      setProcessingStartTime(null)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const toggleGame = useCallback(() => {
    setCurrentGame((prevGame) => (prevGame === "minesweeper" ? "pong" : "minesweeper"))
  }, [])

  const handleNavigateHelp = useCallback((section: string) => {
    setHelpSection(section)
    setUnlockedSteps((prev) => Array.from(new Set([...prev, "help"])))
    setCurrentStep("help")
  }, [])

  const steps = useMemo(() => {
    const baseSteps: { name: string; id: AppStep }[] = [
      { name: "Bem-vindo", id: "welcome" },
      { name: "Instituição", id: "select_institution" },
      { name: "Login?", id: "ask_login_requirement" },
      { name: "Credenciais", id: "enter_credentials" }, // Este será condicionalmente visível
      { name: "URL Prova", id: "enter_exam_url_public" }, // Este será condicionalmente visível
      { name: "API Key", id: "enter_api_key" },
      // Removido "processing" como um passo clicável, pois é um estado automático
      { name: "Resultados", id: "view_results" },
    ]

    // Filtra os passos para exibir apenas os relevantes no StepIndicator
    return baseSteps.filter((step) => {
      if (step.id === "enter_credentials" && requiresLogin !== true) return false
      if (step.id === "enter_exam_url_public" && requiresLogin !== false) return false
      return true
    })
  }, [requiresLogin])

  const currentStepIndex = useMemo(() => {
    const stepIds = steps.map((s) => s.id)
    return stepIds.indexOf(currentStep)
  }, [currentStep, steps])

  // Campos para o formulário de credenciais ou URL pública
  const formFields = useMemo(() => {
    if (!selectedInstitution) return []

    if (requiresLogin) {
      // Campos de login + URL da prova
      return selectedInstitution.fields
        .filter((field) => field.id !== "examUrl")
        .concat([
          {
            id: "examUrl",
            label: "URL da Prova",
            type: "url" as FormFieldType, // Adiciona o casting explícito
            placeholder: "https://studeo.unicesumar.edu.br/#!/app/studeo/aluno/ambiente/disciplina/...",
            helpText: "Cole aqui a URL completa da página da prova que você deseja resolver.",
            required: true,
          },
        ])
    } else if (requiresLogin === false) {
      // Apenas URL da prova para sites públicos
      return [
        {
          id: "examUrl",
          label: "URL da Prova",
          type: "url" as FormFieldType, // Adiciona o casting explícito
          placeholder: "https://exemplo.com/prova-publica",
          helpText: "Cole aqui a URL completa da página da prova que você deseja resolver.",
          required: true,
        },
      ]
    }
    return []
  }, [selectedInstitution, requiresLogin])

  const handleSubmitCredentialsOrUrl = useCallback(() => {
    // Validação básica antes de avançar para API Key
    const currentFields = formFields
    for (const field of currentFields) {
      if (field.required && !formData[field.id]) {
        setMessage(`Por favor, preencha o campo obrigatório: ${field.label}.`)
        return
      }
    }
    setUnlockedSteps((prev) =>
      Array.from(
        new Set([
          ...prev,
          currentStep, // Desbloqueia a etapa atual
          "enter_api_key", // Desbloqueia a próxima etapa
        ]),
      ),
    )
    setCurrentStep("enter_api_key")
    setMessage("")
  }, [formFields, formData, currentStep])

  return (
    <SidebarProvider>
      <AppSidebar
        onNavigateHelp={handleNavigateHelp}
        onResetJourney={handleResetJourney}
        unlockedSteps={unlockedSteps}
      />
      <SidebarInset className="relative flex min-h-svh flex-1 flex-col bg-[#1a1a2e]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#3a3a5a] px-4 bg-[#1a1a2e]/50">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold text-[#a020f0] ml-4">SynapseFlow</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-6 font-mono relative overflow-hidden">
          {currentStep !== "processing" && (
            <StepIndicator
              steps={steps}
              currentStepIndex={currentStepIndex}
              onStepClick={handleStepNavigation}
              unlockedSteps={unlockedSteps}
            />
          )}

          {currentStep === "welcome" && (
            <Card className="w-full max-w-3xl bg-[#2a2a4a] border-[#3a3a5a] shadow-lg shadow-[#a020f0]/20 z-10">
              <CardHeader className="border-b border-[#3a3a5a] pb-4">
                <CardTitle className="text-3xl font-bold text-[#a020f0] flex items-center">
                  <Brain className="mr-3 h-8 w-8" />
                  Bem-vindo ao SynapseFlow!
                </CardTitle>
                <CardDescription className="text-gray-300 mt-2">
                  Automatize a extração e resolução de questões de provas online com IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-gray-300">
                  O SynapseFlow foi criado para simplificar sua vida acadêmica. Com ele, você pode:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Acessar formulários de prova de diversas instituições.</li>
                  <li>Extrair automaticamente as questões do HTML da prova.</li>
                  <li>Resolver as questões usando inteligência artificial (Groq).</li>
                  <li>Visualizar as respostas e, se desejar, enviá-las para o formulário.</li>
                </ul>
                <p className="text-gray-300 font-semibold">
                  Vamos começar? Clique em "Iniciar" para escolher sua instituição.
                </p>
                <Button
                  onClick={() => {
                    setUnlockedSteps((prev) => Array.from(new Set([...prev, "select_institution"])))
                    setCurrentStep("select_institution")
                  }}
                  className="w-full bg-[#a020f0] hover:bg-[#8a1acb] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Iniciar
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "select_institution" && (
            <InstitutionSelector
              institutions={allInstitutions}
              onSelectInstitution={handleSelectInstitution}
              onAddNewInstitution={() => setMessage("Funcionalidade de adicionar nova instituição em breve!")}
            />
          )}

          {currentStep === "ask_login_requirement" && selectedInstitution && (
            <Card className="w-full max-w-3xl bg-[#2a2a4a] border-[#3a3a5a] shadow-lg shadow-[#a020f0]/20 z-10">
              <CardHeader className="border-b border-[#3a3a5a] pb-4">
                <Button
                  onClick={handleBackToInstitutionSelect}
                  variant="ghost"
                  className="absolute top-4 left-4 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" /> Voltar
                </Button>
                <CardTitle className="text-3xl font-bold text-[#a020f0] flex items-center justify-center">
                  <Lock className="mr-3 h-8 w-8" />
                  Acesso à Prova
                </CardTitle>
                <CardDescription className="text-gray-300 mt-2 text-center">
                  O site da {selectedInstitution.name} exige login para acessar a prova?
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <Button
                  onClick={() => {
                    setRequiresLogin(true)
                    setUnlockedSteps((prev) => Array.from(new Set([...prev, "enter_credentials"])))
                    setCurrentStep("enter_credentials")
                  }}
                  className="w-full bg-[#a020f0] hover:bg-[#8a1acb] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <Lock className="mr-2 h-5 w-5" /> Sim, exige login
                </Button>
                <Button
                  onClick={() => {
                    setRequiresLogin(false)
                    setUnlockedSteps((prev) => Array.from(new Set([...prev, "enter_exam_url_public"])))
                    setCurrentStep("enter_exam_url_public")
                  }}
                  className="w-full bg-[#3a3a5a] hover:bg-[#4a4a6a] text-gray-100 font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <Unlock className="mr-2 h-5 w-5" /> Não, é público
                </Button>
                {message && (
                  <div
                    className={`p-3 rounded-md text-sm ${status === "error" ? "bg-red-900/30 text-red-300 border border-red-700" : "bg-green-900/30 text-green-300 border border-green-700"}`}
                  >
                    {message}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(currentStep === "enter_credentials" || currentStep === "enter_exam_url_public") &&
            selectedInstitution &&
            requiresLogin !== null && (
              <InstitutionForm
                institution={selectedInstitution}
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onSubmit={handleSubmitCredentialsOrUrl}
                onBack={handleBackToLoginRequirement}
                submitButtonText="Continuar para API Key"
                isSubmitting={false}
                message={message}
                isError={status === "error"}
                fields={formFields} // Passa os campos dinamicamente
              />
            )}

          {currentStep === "enter_api_key" && selectedInstitution && (
            <Card className="w-full max-w-3xl bg-[#2a2a4a] border-[#3a3a5a] shadow-lg shadow-[#a020f0]/20 z-10">
              <CardHeader className="border-b border-[#3a3a5a] pb-4">
                <Button
                  onClick={requiresLogin ? handleBackToCredentials : handleBackToPublicExamUrl}
                  variant="ghost"
                  className="absolute top-4 left-4 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" /> Voltar
                </Button>
                <CardTitle className="text-3xl font-bold text-[#a020f0] flex items-center justify-center">
                  <Zap className="mr-3 h-8 w-8" />
                  Chave da API Groq
                </CardTitle>
                <CardDescription className="text-gray-300 mt-2 text-center">
                  Precisamos da sua chave de API Groq para que a IA possa resolver as questões.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-1">
                    Groq API Key (Token de Acesso)
                  </label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="gsk_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-[#3a3a5a] border-[#4a4a6a] text-white placeholder:text-gray-400 focus:border-[#a020f0] focus:ring-[#a020f0]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obtenha seu token em{" "}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      console.groq.com/keys
                    </a>
                    .
                  </p>
                </div>
                {/* Card de Métricas da API */}
                <Card className="bg-[#3a3a5a] border-[#4a4a6a] text-gray-100 p-4 mt-4">
                  <CardTitle className="text-xl font-bold text-[#a020f0] flex items-center mb-2">
                    <Zap className="mr-2 h-5 w-5" />
                    Uso da API Groq (Estimativa Local)
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm mb-3">
                    Esta é uma estimativa local do seu uso da API Groq. Para métricas oficiais, consulte seu painel
                    Groq.
                  </CardDescription>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-200">Requisições no Minuto:</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {minuteCalls} / 30 <span className="text-xs text-gray-400">(limite Groq)</span>
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-200">Requisições no Dia:</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {dailyCalls} / 14400 <span className="text-xs text-gray-400">(limite Groq)</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Os limites são para o modelo `llama3-8b-8192`. O contador de minuto é reiniciado a cada 60 segundos.
                  </p>
                </Card>

                <Button
                  onClick={handleProcess}
                  className="w-full bg-[#a020f0] hover:bg-[#8a1acb] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                  disabled={status === "processing"}
                >
                  {getStatusIcon()}
                  <span className="ml-2">{status === "processing" ? "Processando..." : "Iniciar Processamento"}</span>
                </Button>

                {message && (
                  <div
                    className={`p-3 rounded-md text-sm ${status === "error" ? "bg-red-900/30 text-red-300 border border-red-700" : "bg-green-900/30 text-green-300 border border-green-700"}`}
                  >
                    {message}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === "processing" && (
            // Tela de processamento com Jogo e Status
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a2e]/90 z-20">
              {currentGame === "minesweeper" ? <MinesweeperGame /> : <PongGame />}
              <div className="flex flex-col items-center justify-center text-lg text-[#a020f0] mt-4 p-4 bg-[#2a2a4a]/50 rounded-lg border border-[#a020f0]/50 shadow-inner z-30">
                <div className="flex items-center mb-2">
                  <Timer className="h-6 w-6 mr-2 animate-pulse text-[#a020f0]" />
                  <span className="font-bold text-xl text-[#a020f0]">{processingMessage}</span>
                </div>
                <span className="text-2xl font-mono text-gray-100">Tempo Restante: {formatTime(remainingTime)}</span>
                <Button
                  onClick={toggleGame}
                  className="mt-4 bg-[#3a3a5a] hover:bg-[#4a4a6a] text-white flex items-center"
                >
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Trocar Jogo ({currentGame === "minesweeper" ? "Pong" : "Campo Minado"})
                </Button>
              </div>
              {message && (
                <div className="mt-4 p-3 rounded-md text-sm z-30 bg-green-900/30 text-green-300 border border-green-700">
                  {message}
                </div>
              )}
            </div>
          )}

          {currentStep === "view_results" && (
            <Card className="w-full max-w-3xl bg-[#2a2a4a] border-[#3a3a5a] shadow-lg shadow-[#a020f0]/20 z-10">
              <CardHeader className="border-b border-[#3a3a5a] pb-4">
                <Button
                  onClick={() => handleStepNavigation("welcome")} // Volta para o início
                  variant="ghost"
                  className="absolute top-4 left-4 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" /> Início
                </Button>
                <CardTitle className="text-3xl font-bold text-[#a020f0] flex items-center justify-center">
                  <CheckCircle className="mr-3 h-8 w-8" />
                  Processamento Concluído!
                </CardTitle>
                <CardDescription className="text-gray-300 mt-2 text-center">
                  As questões foram resolvidas pela IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-xl font-semibold text-[#a020f0]">Respostas da IA:</h3>
                <Textarea
                  readOnly
                  value={answers}
                  rows={10}
                  className="w-full bg-[#3a3a5a] border-[#4a4a6a] text-white font-mono text-sm resize-none"
                />
                <div className="space-y-2">
                  <label htmlFor="form-submit-url" className="block text-sm font-medium text-gray-300 mb-1">
                    URL para Enviar Respostas do Formulário (Opcional)
                  </label>
                  <Input
                    id="form-submit-url"
                    type="url"
                    placeholder="https://seusite.com/submit-form"
                    value={formSubmitUrl}
                    onChange={(e) => setFormSubmitUrl(e.target.value)}
                    className="bg-[#3a3a5a] border-[#4a4a6a] text-white placeholder:text-gray-400 focus:border-[#a020f0] focus:ring-[#a020f0]"
                  />
                  <Button
                    onClick={handleSendToForm}
                    className="w-full bg-[#a020f0] hover:bg-[#8a1acb] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                    disabled={!formSubmitUrl || !answers || status === "processing"}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Respostas para Formulário
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    **Atenção:** Esta função requer que a URL seja um endpoint de API que aceite JSON. Para formulários
                    complexos (com autenticação, etc.), pode ser necessário mais configuração.
                  </p>
                </div>
                <Button
                  onClick={() => handleStepNavigation("select_institution")}
                  className="w-full bg-[#3a3a5a] hover:bg-[#4a4a6a] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Fazer Nova Prova
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "help" && <HelpContent section={helpSection} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
