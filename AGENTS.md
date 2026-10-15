# Regras Mandatórias de Desenvolvimento - TerraGest ERP

As seguintes diretrizes aplicam-se a **todas as alterações de código** sem exceção:

1. **Sem dados no código (Zero Mocks)**: Nunca salvar dados hardcoded ou fallbacks falsos. Todas as informações devem vir exclusivamente do Supabase.
2. **Sem dados fictícios**: Não inventar registros ou valores simulados.
3. **Sem botões ou modais fictícios**: Todos os botões, links e telas devem ter lógica real de banco de dados, upload de Drive ou geração de documento.
4. **Teto de 150 linhas por arquivo**: Nenhum arquivo no diretório `src/` pode ter mais de 150 linhas. Sempre modularizar e separar responsabilidades.
5. **Zero Arquivos Pesados no Supabase (Apenas Texto e Links de Drive)**: É terminantemente proibido salvar imagens (Base64), PDFs ou arquivos binários no banco de dados do Supabase ou no Supabase Storage. O Supabase deve armazenar estritamente dados leves (textos, números, datas e URLs). Todo arquivo de mídia, foto de horímetro, cupom ou laudo deve ser armazenado exclusivamente no Google Drive.

