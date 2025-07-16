from bs4 import BeautifulSoup
import re

def extrair_questoes_do_html(arquivo_html):
    """
    Extrai questões do HTML do Studeo de forma mais precisa
    """
    with open(arquivo_html, 'r', encoding='utf-8') as file:
        content = file.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    questoes = []
    enunciados_vistos = set()  # Para evitar duplicatas
    
    # Buscar questões no HTML de impressão (mais limpo)
    questoes_impressao = soup.find_all('table', class_='tableQuestao')
    
    questao_numero = 1
    for questao_table in questoes_impressao:
        try:
            # Extrair enunciado
            enunciado_cell = questao_table.find('td', class_='questoes')
            if not enunciado_cell:
                continue
                
            enunciado_raw = enunciado_cell.get_text(strip=True)
            enunciado = limpar_enunciado(enunciado_raw)
            
            # Verificar se já vimos este enunciado (evitar duplicatas)
            enunciado_hash = enunciado[:100]  # Primeiros 100 caracteres como identificador
            if enunciado_hash in enunciados_vistos:
                continue
            enunciados_vistos.add(enunciado_hash)
            
            # Extrair alternativas
            alternativas = []
            alternativas_rows = questao_table.find_all('tr')
            
            for row in alternativas_rows:
                # Procurar por células com alternativas
                alt_cell = row.find('td', class_='labels')
                if alt_cell:
                    alt_text = alt_cell.get_text(strip=True)
                    if alt_text and len(alt_text) > 2:
                        alternativas.append(alt_text)
            
            # Remover duplicatas mantendo a ordem
            alternativas_unicas = []
            for alt in alternativas:
                if alt not in alternativas_unicas:
                    alternativas_unicas.append(alt)
            
            # Verificar se há resposta marcada (gabarito)
            resposta_correta = None
            input_checked = questao_table.find('input', {'checked': 'checked'})
            if input_checked:
                # Encontrar qual alternativa está marcada
                parent_row = input_checked.find_parent('tr')
                if parent_row:
                    resposta_cell = parent_row.find('td', class_='labels')
                    if resposta_cell:
                        resposta_correta = resposta_cell.get_text(strip=True)
            
            # Só adicionar se tiver enunciado e pelo menos 2 alternativas
            if enunciado and len(alternativas_unicas) >= 2:
                questoes.append({
                    'numero': questao_numero,
                    'enunciado': enunciado,
                    'alternativas': alternativas_unicas,
                    'resposta_correta': resposta_correta
                })
                questao_numero += 1
                
        except Exception as e:
            print(f"Erro ao processar questão: {e}")
            continue
    
    return questoes

def limpar_enunciado(texto):
    """
    Limpa e formata o enunciado da questão
    """
    # Remover quebras de linha excessivas
    texto = re.sub(r'\n+', ' ', texto)
    texto = re.sub(r'\s+', ' ', texto)
    
    # Remover caracteres HTML
    texto = texto.replace('&nbsp;', ' ')
    texto = texto.replace('&lt;', '<')
    texto = texto.replace('&gt;', '>')
    
    return texto.strip()

def questoes_conhecidas_studeo():
    """
    Questões extraídas manualmente do HTML como backup - apenas questões únicas
    """
    return [
        {
            'numero': 1,
            'enunciado': 'Um dos temas que diferenciam a linguagem C das demais linguagens é a possibilidade de podermos manipular a memória de um dispositivo computacional através dos ponteiros. Com base no código apresentado, avalie as afirmações sobre ponteiros.',
            'alternativas': [
                'I, apenas.',
                'II, apenas.',
                'III, apenas.',
                'I e II, apenas.',
                'II e III, apenas.'
            ],
            'resposta_correta': 'I e II, apenas.'
        },
        {
            'numero': 2,
            'enunciado': 'Sobre ponteiros em C, analise as afirmações sobre alocação dinâmica, tipos de dados e armazenamento de endereços.',
            'alternativas': [
                'I e II, apenas.',
                'III e IV, apenas.',
                'I, II e IV, apenas.',
                'II, III e IV, apenas.',
                'I, II, III e IV.'
            ],
            'resposta_correta': 'II, III e IV, apenas.'
        },
        {
            'numero': 3,
            'enunciado': 'Sobre structs em C, avalie o código apresentado e as afirmações sobre armazenamento de dados e sintaxe.',
            'alternativas': [
                'I, apenas.',
                'II, apenas.',
                'III, apenas.',
                'I e II, apenas.',
                'II e III, apenas.'
            ],
            'resposta_correta': 'I e II, apenas.'
        },
        {
            'numero': 4,
            'enunciado': 'Sobre pilhas estáticas implementadas com vetores, avalie as afirmações sobre capacidade e funcionamento.',
            'alternativas': [
                'I, apenas.',
                'I e II, apenas.',
                'I e III, apenas.',
                'II e III, apenas.',
                'I, II e III.'
            ],
            'resposta_correta': 'I, II e III.'
        },
        {
            'numero': 5,
            'enunciado': 'Analise o código com ponteiros e determine a saída impressa.',
            'alternativas': [
                '3, 3, 3, 1, 2',
                '3, 3, 3, 1, 3',
                '3, 5, 3, 1, 2',
                '3, 5, 3, 2, 2',
                '3, 5, 3, 2, 3'
            ],
            'resposta_correta': '3, 3, 3, 1, 2'
        },
        {
            'numero': 6,
            'enunciado': 'Sobre filas estáticas, avalie as afirmações sobre funções void e deslocamento de dados.',
            'alternativas': [
                'I, apenas.',
                'I e II, apenas.',
                'I e III, apenas.',
                'II e III, apenas.',
                'I, II e III.'
            ],
            'resposta_correta': 'I e III, apenas.'
        },
        {
            'numero': 7,
            'enunciado': 'Qual a sintaxe correta para alocar memória para um inteiro usando malloc()?',
            'alternativas': [
                'ptr = malloc(int)',
                'ptr = (int)malloc',
                'ptr = (int *) malloc(int)',
                'ptr = malloc(sizeof (int))',
                'ptr = (int *) malloc(sizeof (int))'
            ],
            'resposta_correta': 'ptr = (int *) malloc(sizeof (int))'
        },
        {
            'numero': 8,
            'enunciado': 'Qual estrutura de dados é mais adequada para armazenar informações de alunos (nome, idade, sexo, curso, média)?',
            'alternativas': [
                'Fila',
                'Pilha',
                'Registro',
                'Árvore binária',
                'Lista encadeada'
            ],
            'resposta_correta': 'Registro'
        },
        {
            'numero': 9,
            'enunciado': 'Qual a função do operador de referência (&) em ponteiros na linguagem C?',
            'alternativas': [
                'Retorna o endereço de memória da variável.',
                'Aloca dinamicamente memória para a variável.',
                'Libera a memória alocada dinamicamente.',
                'Retorna o valor contido na posição de memória.',
                'Desreferencia o ponteiro.'
            ],
            'resposta_correta': 'Retorna o endereço de memória da variável.'
        },
        {
            'numero': 10,
            'enunciado': 'Avalie as asserções sobre pilhas (LIFO) e filas (FIFO) e sua relação.',
            'alternativas': [
                'As asserções I e II são verdadeiras e II justifica I.',
                'As asserções I e II são verdadeiras, mas II não justifica I.',
                'A asserção I é verdadeira e II é falsa.',
                'A asserção I é falsa e II é verdadeira.',
                'As asserções I e II são falsas.'
            ],
            'resposta_correta': 'As asserções I e II são verdadeiras, mas II não justifica I.'
        }
    ]

def salvar_questoes_formatadas(questoes, nome_arquivo='questoes_formatadas.txt'):
    """
    Salva questões em formato limpo e organizado
    """
    with open(nome_arquivo, 'w', encoding='utf-8') as file:
        file.write("QUESTÕES - ESTRUTURAS DE DADOS\n")
        file.write("=" * 50 + "\n\n")
        
        for questao in questoes:
            file.write(f"QUESTÃO {questao['numero']}\n")
            file.write("-" * 20 + "\n")
            file.write(f"{questao['enunciado']}\n\n")
            
            file.write("ALTERNATIVAS:\n")
            for i, alternativa in enumerate(questao['alternativas']):
                # Marcar resposta correta com [X]
                marcador = "[X] " if questao.get('resposta_correta') == alternativa else "[ ] "
                file.write(f"{chr(65+i)}) {marcador}{alternativa}\n")
            
            file.write("\n" + "="*50 + "\n\n")
    
    print(f"✅ Questões salvas em: {nome_arquivo}")

def main():
    arquivo_html = "prova_studeo.html"
    
    print("🔍 Extraindo questões do Studeo...")
    
    # Tentar extrair do HTML primeiro
    try:
        questoes = extrair_questoes_do_html(arquivo_html)
        if len(questoes) < 5:  # Se não encontrou questões suficientes
            print("⚠️  Poucas questões encontradas no HTML. Usando dados conhecidos...")
            questoes = questoes_conhecidas_studeo()
    except Exception as e:
        print(f"❌ Erro no parsing: {e}")
        print("📋 Usando questões conhecidas...")
        questoes = questoes_conhecidas_studeo()
    
    # Garantir que não há duplicatas e limitar a 10 questões
    questoes_unicas = []
    enunciados_vistos = set()
    
    for questao in questoes:
        enunciado_hash = questao['enunciado'][:100]
        if enunciado_hash not in enunciados_vistos and len(questoes_unicas) < 10:
            questoes_unicas.append(questao)
            enunciados_vistos.add(enunciado_hash)
    
    if questoes_unicas:
        print(f"✅ {len(questoes_unicas)} questões únicas extraídas!")
        
        # Renumerar questões
        for i, questao in enumerate(questoes_unicas, 1):
            questao['numero'] = i
        
        # Salvar apenas o arquivo formatado
        salvar_questoes_formatadas(questoes_unicas)
        
        # Preview
        print("\n📋 PREVIEW DAS QUESTÕES:")
        print("=" * 50)
        
        for questao in questoes_unicas[:2]:  # Mostrar 2 primeiras
            print(f"\nQUESTÃO {questao['numero']}")
            print(f"{questao['enunciado'][:100]}...")
            print("\nALTERNATIVAS:")
            for i, alt in enumerate(questao['alternativas']):
                marcador = "[X]" if questao.get('resposta_correta') == alt else "[ ]"
                print(f"  {chr(65+i)}) {marcador} {alt}")
        
        print(f"\n... e mais {len(questoes_unicas) - 2} questões.")
        
    else:
        print("❌ Nenhuma questão foi extraída.")

if __name__ == "__main__":
    main()
\`\`\`
