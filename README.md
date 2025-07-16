# SynapseFlow

Aqui está o arquivo `README.md` para o seu projeto SynapseFlow, incluindo todas as instruções de instalação e configuração necessárias:

```markdown
# SynapseFlow

## Visão Geral

O SynapseFlow é uma aplicação web que automatiza a extração e resolução de questões de provas online de diversas plataformas de ensino, utilizando inteligência artificial. Ele foi projetado para simplificar o processo de acesso, extração e resposta a questionários, oferecendo uma experiência fluida e eficiente.

## Funcionalidades

*   **Extração de Questões:** Acessa a URL da prova (com ou sem login, dependendo da plataforma) e extrai automaticamente as questões e alternativas do HTML.
*   **Arquitetura Modular de Parsers:** Suporta a adição fácil de novas instituições de ensino através de parsers dedicados, garantindo escalabilidade e fácil manutenção.
*   **Fallback Inteligente:** Utiliza um parser genérico como fallback se um parser específico não for encontrado ou falhar.
*   **Resolução com IA:** Envia as questões extraídas para a API do Groq (utilizando o modelo `llama3-8b-8192`) para obter as respostas.
*   **Visualização e Download:** Exibe as respostas da IA na interface e permite o download automático em formato de texto.
*   **Envio de Respostas (Experimental):** Permite o envio das respostas para um endpoint de formulário (requer configuração específica do endpoint).
*   **Jogos de Espera:** Durante o processamento, exibe jogos interativos (Campo Minado ou Pong) para entreter o usuário.
*   **Documentação Integrada:** Oferece uma seção de ajuda com informações sobre como usar o aplicativo, encontrar URLs de prova, solucionar problemas e detalhes sobre a API Groq.

## Pré-requisitos

Para rodar o SynapseFlow em sua máquina local, você precisará dos seguintes softwares instalados:

### Python

*   **Python 3.9+**: Baixe e instale a versão mais recente do Python em [python.org](https://www.python.org/downloads/).
*   **pip**: Gerenciador de pacotes do Python (geralmente vem com a instalação do Python).
*   **virtualenv (recomendado)**: Para criar ambientes Python isolados.
*   **Google Chrome ou Chromium**: O Selenium WebDriver utiliza um navegador real para simular a interação do usuário. Certifique-se de ter o Chrome ou Chromium instalado.

### Node.js

*   **Node.js (versão LTS)**: Baixe e instale a versão LTS (Long Term Support) do Node.js em [nodejs.org](https://nodejs.org/en/download/).
*   **npm ou yarn**: Gerenciadores de pacotes do Node.js (npm vem com Node.js; yarn pode ser instalado globalmente).

## Instalação

Siga os passos abaixo para configurar o projeto:

1.  **Clonar o Repositório**

    ```bash
    git clone https://github.com/seu-usuario/synapseflow.git
    cd synapseflow
```

1.  **Instalar dependências Python**:

```shellscript
pip install -r requirements.txt
```

c.  **Configurar a chave da API Groq**:
Você precisará de uma chave de API do Groq para que a IA possa resolver as questões.

1. Acesse [console.groq.com/keys](https://console.groq.com/keys) e crie uma nova chave.
2. Abra o arquivo `scripts/api_config.py`.
3. Substitua `"gsk_sua_chave_aqui"` pela sua chave real do Groq.


```python
# scripts/api_config.py
GROQ_API_KEY = "gsk_sua_chave_aqui" # <-- Substitua aqui
```

**ATENÇÃO**: Este arquivo contém sua chave de API. **NÃO** o envie para repositórios públicos. Para implantações em produção (ex: Vercel), use variáveis de ambiente (ex: `GROQ_API_KEY`).


3. **Configuração do Ambiente Node.js**

a.  **Instalar dependências Node.js**:

```shellscript
npm install
# ou se preferir yarn:
# yarn install
```




## Como Rodar a Aplicação

Após a instalação, você pode iniciar o servidor de desenvolvimento do Next.js:

```shellscript
npm run dev
# ou se preferir yarn:
# yarn dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Uso

1. **Acesse a Aplicação**: Abra seu navegador e vá para `http://localhost:3000`.
2. **Bem-vindo**: Clique em "Iniciar" na tela de boas-vindas.
3. **Escolha a Instituição**: Selecione a plataforma de ensino (ex: Unicesumar) onde sua prova está.
4. **Acesso à Prova**: Indique se o site da instituição exige login para acessar a prova.
5. **Preencha os Dados**:

1. Se exige login: Informe seu usuário, senha e a URL completa da prova.
2. Se não exige login: Apenas a URL completa da prova.



6. **Chave da API Groq**: Insira sua chave de API do Groq no campo indicado.
7. **Iniciar Processamento**: Clique em "Iniciar Processamento". A aplicação fará o login (se necessário), baixará o HTML, extrairá as questões e as resolverá com a IA. Um jogo divertido aparecerá enquanto você espera!
8. **Resultados**: Após o processamento, as respostas da IA serão exibidas. Você pode copiá-las ou, se desejar, tentar enviá-las para um formulário (funcionalidade experimental).


## Estrutura de Pastas Essencial

- `app/`: Contém as rotas e componentes principais do Next.js.
- `components/`: Componentes React reutilizáveis (incluindo UI do shadcn/ui e os jogos).
- `lib/`: Funções utilitárias e dados (ex: `institutions.ts`).
- `scripts/`: Contém os scripts Python que realizam as operações de backend (fetch HTML, extração, resolução, envio).

- `scripts/parsers/`: Módulos Python para parsers específicos de cada instituição.
- `data/`: Diretório para arquivos temporários (HTML baixado, questões extraídas, respostas da IA, logs de solicitação).



- `types/`: Definições de tipos TypeScript.


## Observações Importantes

- **Segurança da API Key**: Mantenha sua chave de API Groq segura. Não a exponha em repositórios públicos. Para produção, use variáveis de ambiente.
- **Navegador Headless**: O Selenium é configurado para rodar em modo "headless" (sem interface gráfica) por padrão. Isso é ideal para ambientes de servidor.
- **Dados Temporários**: O diretório `data/` é usado para armazenar arquivos temporários durante o processamento. Ele pode ser limpo periodicamente.
- **Persistência Local**: Algumas configurações e contadores de uso da API são armazenados no `localStorage` do seu navegador.


## Contribuição

Contribuições são bem-vindas! Se você deseja adicionar suporte a uma nova instituição, melhorar um parser existente ou implementar novas funcionalidades, sinta-se à vontade para abrir um Pull Request.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

```plaintext




To configure the generation, complete these steps:

<StepsCard steps={[{type: "run-script", stepName: "scripts/parser_base.py"},{type: "run-script", stepName: "scripts/parsers/parser_generico.py"},{type: "run-script", stepName: "scripts/parsers/parser_estacio.py"},{type: "run-script", stepName: "scripts/solicitacao.py"},{type: "run-script", stepName: "scripts/factory.py"},{type: "run-script", stepName: "scripts/extract_questions_modular.py"}]} />
```
