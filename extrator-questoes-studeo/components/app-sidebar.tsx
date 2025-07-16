// components/app-sidebar.tsx
"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { BookText, ChevronDown, CircleHelp, Home, Info, LifeBuoy, Link, Play } from "lucide-react" // Adicionado Play
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { AppStep } from "@/types/app" // Importa AppStep

interface AppSidebarProps {
  onNavigateHelp: (section: string) => void
  onResetJourney: () => void // Nova prop para resetar a jornada
  unlockedSteps: AppStep[] // Nova prop para saber quais etapas estão desbloqueadas
}

export function AppSidebar({ onNavigateHelp, onResetJourney, unlockedSteps }: AppSidebarProps) {
  const { state } = useSidebar()

  const isStepUnlocked = (stepId: AppStep) => unlockedSteps.includes(stepId)

  return (
    <Sidebar className="bg-[#1a1a2e] text-gray-100" collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="text-gray-100 hover:bg-[#3a3a5a]">
                  <Home />
                  <span>SynapseFlow</span>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width] bg-[#2a2a4a] border-[#3a3a5a] text-gray-100">
                {/* Removidos "Sobre o App" e "Configurações" */}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#a020f0]">Guia Rápido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onResetJourney} // Botão para resetar a jornada
                  className="text-gray-100 hover:bg-[#3a3a5a]"
                >
                  <Play /> {/* Ícone mais representativo para "Iniciar" */}
                  <span>Iniciar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigateHelp("how-to-use")}
                  className="text-gray-100 hover:bg-[#3a3a5a]"
                >
                  <BookText />
                  <span>Como Usar o App</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigateHelp("find-exam-url")}
                  className="text-gray-100 hover:bg-[#3a3a5a]"
                >
                  <Link />
                  <span>Encontrar URL da Prova</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigateHelp("troubleshooting")}
                  className="text-gray-100 hover:bg-[#3a3a5a]"
                >
                  <LifeBuoy />
                  <span>Solução de Problemas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild className="text-[#a020f0]">
              <CollapsibleTrigger>
                Informações da API
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => onNavigateHelp("groq-api-info")}
                      className="text-gray-100 hover:bg-[#3a3a5a]"
                    >
                      <Info />
                      <span>Sobre a API Groq</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => onNavigateHelp("api-limits")}
                      className="text-gray-100 hover:bg-[#3a3a5a]"
                    >
                      <CircleHelp />
                      <span>Limites de Uso</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 text-xs text-gray-500">SynapseFlow v1.0</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
