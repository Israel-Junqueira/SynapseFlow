// components/help-content.tsx
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookText } from "lucide-react" // Corrigido: Importar de lucide-react

interface HelpContentProps {
  section: string
}

export function HelpContent({ section }: HelpContentProps) {
  const renderContent = () => {
    switch (section) {
      case "how-to-use":
        return (
          <>
            <h2 className="text-2xl font-bold text-[#a020f0] mb-3">Como Usar o SynapseFlow</h2>
            <p className="text-gray-200 mb-4">
              O SynapseFlow automatiza o processo de extração e resolução de questões de provas online. Siga os passos
              abaixo:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-200">
              <li>
                <span className="font-semibold text-gray-100">Escolha a Instituição:</span> Na tela inicial, selecione a
                plataforma de ensino (ex: Unicesumar) onde sua prova está.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Preencha as Credenciais:</span> Informe seu usuário (CPF,
                email, etc.) e senha da instituição. Use o botão "Entenda isso" para dicas.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Insira a URL da Prova:</span> Cole a URL completa da
                página da prova. Veja a seção "Encontrar URL da Prova" para ajuda.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Forneça a Chave da API Groq:</span> Insira sua chave de
                API do Groq para que a inteligência artificial possa resolver as questões.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Inicie o Processamento:</span> Clique no botão para
                iniciar o processo. Um jogo divertido aparecerá enquanto a IA trabalha!
              </li>
              <li>
                <span className="font-semibold text-gray-100">Visualize e Envie as Respostas:</span> Após o
                processamento, as respostas da IA serão exibidas. Você pode copiá-las ou, se disponível, enviá-las
                diretamente para um formulário.
              </li>
            </ol>
          </>
        )
      case "find-exam-url":
        return (
          <>
            <h2 className="text-2xl font-bold text-[#a020f0] mb-3">Como Encontrar a URL Correta da Prova</h2>
            <p className="text-gray-200 mb-4">
              A URL da prova é crucial para que o SynapseFlow possa acessar e extrair as questões. Siga estas dicas:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-200">
              <li>
                <span className="font-semibold text-gray-100">Acesse a Prova no Navegador:</span> Primeiro, faça login
                na sua instituição e navegue até a página exata da prova que você deseja resolver.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Copie a URL da Barra de Endereços:</span> Uma vez na
                página da prova (onde as questões são visíveis), copie a URL completa da barra de endereços do seu
                navegador.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Verifique a URL:</span> A URL deve ser específica para a
                prova. Para a Unicesumar, geralmente contém `/questionario/` ou algo similar. Evite URLs de dashboards
                ou listas de provas.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Exemplo (Unicesumar):</span>
                <code className="block bg-[#3a3a5a] p-2 rounded-md text-xs mt-1 break-all">
                  https://studeo.unicesumar.edu.br/#!/app/studeo/aluno/ambiente/disciplina/12345/questionario/67890
                </code>
              </li>
            </ul>
            <p className="text-gray-200 mt-4">
              Se a URL mudar após você clicar em "Iniciar Prova" ou "Continuar", use a URL da página onde as questões
              estão realmente carregadas.
            </p>
          </>
        )
      case "troubleshooting":
        return (
          <>
            <h2 className="text-2xl font-bold text-[#a020f0] mb-3">Solução de Problemas Comuns</h2>
            <p className="text-gray-200 mb-4">Encontrou um problema? Tente as soluções abaixo antes de pedir ajuda:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-200">
              <li>
                <span className="font-semibold text-gray-100">Erro de Login:</span>
                <ul className="list-circle list-inside ml-4 text-gray-300">
                  <li>Verifique seu usuário e senha.</li>
                  <li>Tente fazer login manualmente no portal da instituição para confirmar as credenciais.</li>
                  <li>Certifique-se de que não há caracteres extras ou espaços.</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold text-gray-100">
                  "HTML não encontrado" ou "Nenhuma questão extraída":
                </span>
                <ul className="list-circle list-inside ml-4 text-gray-300">
                  <li>A URL da prova pode estar incorreta ou não é a página onde as questões são carregadas.</li>
                  <li>A página da prova pode ter conteúdo dinâmico que o sistema não conseguiu carregar a tempo.</li>
                  <li>Tente recarregar a página da prova no seu navegador e copiar a URL novamente.</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold text-gray-100">
                  "Erro ao chamar a API Groq" (401 Unauthorized, 404 Not Found):
                </span>
                <ul className="list-circle list-inside ml-4 text-gray-300">
                  <li>
                    Sua chave de API Groq pode estar incorreta ou expirada. Gere uma nova em{" "}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a020f0] hover:underline"
                    >
                      console.groq.com/keys
                    </a>
                    .
                  </li>
                  <li>Verifique se não há espaços extras na chave.</li>
                  <li>O modelo `llama3-8b-8192` pode estar temporariamente indisponível (raro).</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold text-gray-100">"Erro ao enviar respostas para o formulário":</span>
                <ul className="list-circle list-inside ml-4 text-gray-300">
                  <li>A URL de envio do formulário pode estar incorreta ou não aceita o formato JSON.</li>
                  <li>Esta funcionalidade é mais avançada e pode exigir um endpoint de API específico.</li>
                </ul>
              </li>
            </ul>
          </>
        )
      case "groq-api-info":
        return (
          <>
            <h2 className="text-2xl font-bold text-[#a020f0] mb-3">Sobre a API Groq</h2>
            <p className="text-gray-200 mb-4">
              O SynapseFlow utiliza a API do Groq para processar as questões com inteligência artificial. O Groq é
              conhecido por sua{" "}
              <span className="font-semibold text-gray-100">velocidade de inferência extremamente alta</span>, graças à
              sua arquitetura de hardware otimizada (LPU™).
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-200">
              <li>
                <span className="font-semibold text-gray-100">Modelos:</span> Utilizamos o modelo `llama3-8b-8192`, um
                modelo de linguagem grande (LLM) da Meta, otimizado para velocidade no Groq.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Desempenho:</span> As respostas da IA são geradas em
                milissegundos, tornando o processo de resolução de questões muito rápido.
              </li>
              <li>
                <span className="font-semibold text-gray-100">Chave de API:</span> Sua chave (`gsk_...`) é pessoal e
                autentica suas requisições. Mantenha-a segura!
              </li>
              <li>
                <span className="font-semibold text-gray-100">Custo:</span> O Groq oferece um tier gratuito generoso
                para desenvolvedores. Para uso intensivo, consulte a página de preços do Groq.
              </li>
            </ul>
            <p className="text-gray-200 mt-4">
              Para mais detalhes, visite a documentação oficial do Groq:{" "}
              <a
                href="https://groq.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a020f0] hover:underline"
              >
                groq.com/docs
              </a>
              .
            </p>
          </>
        )
      case "api-limits":
        return (
          <>
            <h2 className="text-2xl font-bold text-[#a020f0] mb-3">Limites de Uso da API Groq</h2>
            <p className="text-gray-200 mb-4">
              Para garantir a estabilidade do serviço, o Groq impõe limites de requisições. O SynapseFlow monitora seu
              uso localmente para ajudar você a ficar dentro desses limites.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-200">
              <li>
                <span className="font-semibold text-gray-100">Modelo `llama3-8b-8192` (Tier Gratuito):</span>
                <ul className="list-circle list-inside ml-4 text-gray-300">
                  <li>
                    <span className="font-semibold">RPM (Requisições por Minuto):</span> 30
                  </li>
                  <li>
                    <span className="font-semibold">RPD (Requisições por Dia):</span> 14.400
                  </li>
                </ul>
              </li>
              <li>
                <span className="font-semibold text-gray-100">O que acontece se eu exceder?</span>
                <ul className="list-circle list-inside ml-4 text-gray-300">
                  <li>A API retornará um erro `429 Too Many Requests`.</li>
                  <li>Você precisará esperar até que o limite seja redefinido (no próximo minuto ou dia).</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold text-gray-100">Monitoramento Local:</span>
                <ul className="list-circle list-inside ml-4 text-gray-300">
                  <li>O contador no aplicativo é uma estimativa baseada nas suas ações no navegador.</li>
                  <li>
                    Para métricas oficiais e precisas, consulte seu painel em{" "}
                    <a
                      href="https://console.groq.com/dashboard/metrics"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a020f0] hover:underline"
                    >
                      console.groq.com/dashboard/metrics
                    </a>
                    .
                  </li>
                </ul>
              </li>
            </ul>
            <p className="text-gray-200 mt-4">
              Planeje seu uso para evitar interrupções. Para volumes maiores, considere os planos pagos do Groq.
            </p>
          </>
        )
      default:
        return <p className="text-gray-200">Selecione uma seção no menu lateral para ver a documentação.</p>
    }
  }

  return (
    <Card className="w-full max-w-3xl bg-[#2a2a4a] border-[#3a3a5a] shadow-lg shadow-[#a020f0]/20 z-10">
      <CardHeader className="border-b border-[#3a3a5a] pb-4">
        <CardTitle className="text-3xl font-bold text-[#a020f0] flex items-center">
          <BookText className="mr-3 h-8 w-8" />
          Documentação SynapseFlow
        </CardTitle>
        <CardDescription className="text-gray-300 mt-2">
          Tudo o que você precisa saber para usar o SynapseFlow.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          {" "}
          {/* Ajuste a altura conforme necessário */}
          {renderContent()}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
