# Verde Finanças Online

Aplicativo web de controle financeiro com interface 2.2, login por e-mail e senha e persistência no Supabase.

## Situação
**Código enviado ao GitHub; não foi implantado na Vercel.** A sincronização ainda precisa de testes funcionais em dois dispositivos antes de uso real.

## Arquivos
- `index.html`: interface financeira e tela de autenticação
- `cloud.js`: sessão, leitura e gravação no Supabase, controle de versão para conflitos
- `config.js`: URL e chave **pública** publishable do projeto
- `supabase/schema.sql`: tabela financeira com Row Level Security
- `vercel.json`: cabeçalhos de segurança

## Como testar após autorização de implantação
1. Criar uma conta e confirmar o e-mail.
2. Entrar e testar um lançamento de demonstração.
3. Abrir a mesma conta em outro navegador e verificar atualização após voltar à aba.
4. Importar um backup JSON antigo, conferir os saldos e exportar um novo backup.
5. Verificar que uma segunda conta não consegue ler os dados da primeira.
6. Testar edição simultânea; conflitos devem interromper a gravação e exigir backup.

## Segurança
- O repositório é público, mas **não** deve conter senhas, chaves secretas, tokens privados ou backups pessoais.
- A chave `sb_publishable_` é pública e apropriada para uso no navegador.
- Os dados financeiros são protegidos por RLS no banco.
- A sincronização é por documento completo, não por transação; conflito entre dispositivos pode exigir intervenção.
- Não usar para dados financeiros reais antes dos testes.

**A implantação na Vercel exige aprovação explícita do proprietário.**
