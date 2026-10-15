# Diretrizes Arquiteturais e Regras Obrigatórias do TerraGest ERP

Estas regras são **mandatórias e inegociáveis** em todas as tarefas, componentes, hooks e serviços desenvolvidos no projeto:

## 1. Zero Dados Estáticos ou Mocks no Código
- Proibido salvar listas, arrays de teste, constantes mockadas ou registros falsos dentro do código-fonte (ex: `MOCK_DATA`, `CLIENTES_INICIAIS`, `OBRA_PADRAO`).
- Todos os dados operacionais (clientes, equipamentos, obras, funcionários, serviços de horímetro, financeiro, despesas) devem vir exclusivamente das tabelas do banco de dados PostgreSQL via Supabase.
- Se o banco de dados retornar vazio, a interface deve renderizar o estado vazio (empty state) legítimo, incentivando o cadastro real pelo usuário, e nunca injetar fallbacks fictícios.

## 2. Zero Dados Fictícios
- Nenhuma funcionalidade deve gerar dados arbitrários ou simulados.
- Relatórios, DREs, médias de consumo e métricas financeiras devem calcular apenas valores comprovados em banco.

## 3. Zero Botões ou Janelas Fictícias
- É terminantemente proibido criar botões mortos, alertas vazios (`alert('em breve')`), ou telas decorativas sem lógica associada.
- Cada botão e modal deve executar sua ação real correspondente (persistir no Supabase, disparar upload para o Google Drive via Service Account, gerar PDF oficial via jsPDF, alterar status no banco ou excluir registro com confirmação).

## 4. Limite Estrito de no Máximo 150 Linhas por Arquivo
- **Nenhum arquivo no diretório `src/` pode exceder 150 linhas**.
- Sempre decompor arquivos grandes em submódulos de responsabilidade única:
  - Hooks de estado e regras de negócio separados (`use...State.ts`).
  - Abas e seções em componentes filhos (`Aba...tsx`, `...Section.tsx`).
  - Cards e linhas de tabelas em componentes dedicados (`...CardItem.tsx`, `...RowItem.tsx`).
  - Cabeçalhos, rodapés e barras de ação em submódulos próprios.
  - Funções utilitárias e geradores de relatório (como PDF) divididos por seções lógicas.

## 5. Blindagem Contra Arquivos Pesados no Supabase (Zero Bloat / Zero Base64)
- Proibido salvar strings Base64 (`data:image/`, `data:application/`), blobs ou arquivos binários em colunas de tabelas do Supabase ou no Supabase Storage.
- O cliente Supabase possui interceptor ativo (`src/lib/supabaseGuard.ts`) que sanitiza e bloqueia qualquer tentativa de inserção de mídias pesadas.
- Imagens de painéis de horímetro, cupons de diesel, comprovantes de pagamento e laudos devem ser armazenados **exclusivamente no Google Drive**; no Supabase, apenas a URL externa do arquivo (`https://drive.google.com/...`) pode ser persistida.
