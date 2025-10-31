V3 Futevôlei
Documento executivo
Objetivo: fornecer um roteiro acionável para produto/MVP que permita inferir entidades e modelos sem explicitar esquemas de banco. Baseado nas conversas e respostas fornecidas (foco em alunos matriculados, planos por aulas/semana, reposição automática, prioridade de vagas, pagamento PIX/cartão, web responsiva, parametrização por sócios).
Visão geral rápida
Portal web responsivo + painel administrativo para sócios/administrativo que permite:

consulta de unidades/horários/níveis por interessados; agendamento de aula experimental (regra de residência);
cadastro e associação de plano para alunos matriculados; confirmação de presença em turmas (substitui check‑in); geração automática de crédito para reposição quando aplicável;
parametrização por unidade (quadras/periodização/janelas de confirmação); gestão de professores; dashboards operacionais; pagamentos (PIX/cartão).
Definições chave
Turma: combinação fixa de dia da semana + horário (ex.: 2a 7h; Sábado 8h).
Pode ter de 1 a 3 níveis (Iniciante, Intermediário, Avançado). Deve existir pelo menos 1 quadra/rede por nível ativo na turma.
Aula: ocorrência pontual de uma turma (ex.: 30/10/2025 às 18:00).
Níveis: Iniciante, Intermediário, Avançado.
Quadra/Rede: unidade física que gera 6 vagas por quadra; número de quadras por unidade/horário é parametrizável.
Atores principais
Interessado
Mora na cidade da unidade → pode consultar unidades/horários/níveis e tabela de preços; agendar aula experimental preenchendo formulário com: Nome, Sobrenome, CPF, Celular, Endereço (CEP, número, complemento), Data de nascimento, E‑mail, Nível e Turma.
Não residentes da cidade da unidade não têm direito a aula experimental.
Sócios / Administrativo
Parametrizam unidades (quantidade de quadras/redes por horário), regras de reposição, janelas de confirmação/cancelamento, prioridades, preços e planos.
Gestão de professores (cadastrar disponibilidade, registrar faltas/atrasos).
Importação de pagamentos/planos históricos.
Acesso total ao dashboard e relatórios.
Aluno (matriculado)
Compra plano (X aulas/semana) ou avulsa/pacote 10; seleciona X turmas do seu nível; confirma presença nas turmas escolhidas; solicita e executa reposições dentro das regras.
Pode pagar avulsa e reservar conforme nível.
Pode repor até 4 aulas por mês em unidades de outras cidades.
Pode selecionar turmas em unidades diferentes desde que pague o plano da unidade mais cara do conjunto escolhido.
Professor
Cadastro com dados pessoais e vínculo (dias/horários).
Visualiza lista de alunos confirmados nas turmas que leciona (apenas nas turmas que ele ministra).
Solicitar férias (30 dias após 1 ano) — aprovação pelos sócios.
Sócios/administrativo registram faltas/atrasos do professor.
Sistema (automação)
Valida elegibilidade de reposição, calcula vagas disponíveis, processa pagamentos via gateway, envia notificações in‑app e e‑mail (integração com WhatsApp considerada fora do escopo prioritário), aplica prioridades e regras automatizadas.
Principais ações / fluxos (alto nível)
Interessado → consulta horários → agenda aula experimental (se residente).
Aluno → cadastro (telefone+OTP) → escolhe unidade e plano (mensal/trimestral/semestral por aulas/semana; avulsa; pacote 10 aulas) → seleciona X turmas do seu nível → confirma presença nessas turmas.
Confirmação de presença (substitui check‑in): aluno precisa confirmar presença dentro da janela parametrizada (por unidade e período).
Falta / Não confirmação → geração de crédito para reposição automática (se regras atenderem).
Reposição → aluno agenda reposição dentro do prazo permitido (1 semana antes ou depois da data da aula faltada) em turma compatível com nível e com vaga.
Pagamento → PIX/cartão; recorrência via cartão para planos; importação de pagamentos históricos por CPF/telefone.
Regras de confirmação / presença (sem check‑in)
Não existe check‑in físico; o ato válido é a confirmação online do aluno.
Janela de confirmação por período (parametrizável por unidade): exemplo padrão — manhã: confirmar até 21:00 do dia anterior; tarde/noite: confirmar até 1 hora antes. Valores parametrizáveis por sócios.
Se o aluno informar que irá faltar (pró‑ativo) para uma aula do seu plano → sistema impede que ele confirme essa aula e automaticamente cria 1 crédito para reposição.
Se o aluno NÃO confirmar a aula dentro da janela → automaticamente recebe 1 crédito para reposição.
A lista exibida a professores/sócios/administrativo para cada aula inclui apenas alunos que confirmaram — somente esses poderão treinar.
Regras de reposição (detalhadas)
Pré‑condições para solicitar/receber reposição:
Aluno tem crédito de reposição (criado por falta ou por regra do plano).
Aluno faltou na aula (crédito gerado) e/ou indicou ausência pró‑ativa.
Turma de reposição deve conter nível compatível (turma pode admitir múltiplos níveis).
Há vaga: vagas = quadras_ativas_no_horario * 6 - confirmados.
Limites e janelas:
Alunos podem repor até 4 aulas/mês em unidades de outras cidades (regra específica); reposições locais sujeitas a política padrão (confirmar limite global se necessário).
O aluno deve agendar a reposição no prazo de até 7 dias antes ou 7 dias depois da data da aula que faltou.
Automação:
Se todas condições atendidas → reposição é concedida automaticamente quando o aluno agenda. Caso contrário → motivo de rejeição (sem vaga / nível incompatível / sem crédito) e opção de intervenção administrativa.
Observação: reposição consome crédito se o plano utiliza créditos; pacotes avulsos consomem saldo do pacote.
Prioridade de vagas e bloqueios (sem Gympass/TotalPass)
Ordem de prioridade ao alocar vaga:
Alunos com plano ativo (mensal/trimestral/semestral) e alunos avulsos (mesma prioridade entre si).
Alunos experimentais.
Reposição (quando aplicável) — menor prioridade.
Bloqueios:
Quando a aula alcança limite de vagas → confirmações devem ser bloqueadas prioritariamente para reposição, depois para alunos experimentais, mantendo prioridade para alunos com plano ativo/avulsos (conforme a ordem acima).
Alunos com plano ativo SEMPRE podem confirmar presença nas turmas que escolheram (dentro do limite de X confirmações/semana do plano).
Remoção em caso de conflito:
Se um aluno com plano ativo confirmar presença em uma aula já lotada, o sistema remove um aluno já confirmado seguindo a ordem: reposição → experimental.
Se houver mais de um candidato na mesma categoria para remoção, desempate é feito removendo o aluno que confirmou por último (LIFO entre mesmos níveis).
Aluno removido recebe notificação in‑app e por e‑mail explicando o motivo.
Professores (detalhes operacionais)
Cadastro similar ao aluno (dados pessoais) + salário, dias/horários de trabalho, data de início, observações, permissão de ver lista de aula.
Professores autorizados veem apenas a lista de alunos confirmados nas turmas que lecionam.
Sócios/administrativo podem marcar faltas/atrasos (para relatório e possíveis efeitos contratuais/pagamentos).
Férias: professores podem solicitar 30 dias após 1 ano; aprovações feitas pelos sócios.
Sócios / Administrativo (poderes)
Parametrização completa por unidade: quadras por horário, janelas de confirmação por período, números de quadras ativos (temporária ou permanentemente), políticas de reposição, prioridade e preços.
Cancelamento de aula: ao cancelar, ninguém mais pode confirmar para essa aula; alunos já confirmados recebem notificação do cancelamento e ganham crédito para reposição automaticamente.
Importação/iniciação: importar pagamentos existentes por CPF/telefone para manter continuidade de planos vigentes.
Permissões (resumido)
Sócio / Administrativo: CRUD completo (unidades, quadras, turmas, planos, alunos, professores), parametrização, importação, relatórios.
Recepção / Operador: cadastro, confirmar manualmente em casos excepcionais, suporte a alunos.
Professor: cadastrar perfil, ver lista de confirmados das turmas que leciona, solicitar férias (não aprova).
Aluno: editar perfil, selecionar/confirmar turmas, solicitar/usar reposição, ver histórico e pagamentos.
Interessado: consulta e agendamento de aula experimental (sujeito a regra de residência).
Casos de uso prioritários (MVP — ordem sugerida)
Consulta pública de unidades/horários/níveis + agendamento experimental (validação de residência).
Cadastro de aluno (telefone+OTP), seleção/associação de plano e seleção de X turmas do nível.
Confirmação de presença com janelas parametrizáveis por unidade/periodo (substitui check‑in).
Automatização da lógica que gera créditos de reposição (falta ou não confirmação) e gestão de agendamento de reposição dentro da janela +/-7 dias.
Cálculo de vagas por quadra (quadras_ativadas * 6) e aplicação de prioridades / bloqueios.
Painel administrativo: parametrização por unidade (quadras, janelas, prioridades), importação de pagamentos, visualizar métricas prioritárias.
Integração de pagamentos (PIX e cartão, suporte a recorrência por cartão).
Notificações automáticas in‑app e e‑mail para confirmações, remoções por lotação e cancelamentos de aula. (Integração com WhatsApp considerada fora do escopo prioritário.)
Exceções e regras de borda
Clima/fechamento de praia: sócios devem poder desativar quadras/horários em lote e acionar reembolso/reagendamento.
Transferência de aulas entre unidades / aluno com múltiplas unidades: definir política (por padrão, cada plano vinculado a unidade(s) selecionadas).
Conflitos de prioridade (ex.: plano + pacote + avulso no mesmo horário): aplicar regra de prioridade definida acima.
Importação de pagamentos: detectar duplicados por CPF/telefone; reconciliar datas e tipos de plano.
Créditos de reposição: padronizar se créditos gerados por não confirmação e por aviso pró‑ativo são equivalentes (recomendado: equivalência funcional).
Requisitos não‑funcionais mínimos
Web responsiva; suporte a mobile browser.
Autenticação por telefone+OTP; armazenamento seguro de dados (CPF/telefone).
Escalabilidade para multi‑unidade (parametrização por unidade).
Logs de auditoria para ações administrativas e de professores.
Backup/restore e mecanismo de importação CSV para alunos/pagamentos.
Conformidade básica com LGPD (consentimento e retenção).
Integração com gateway (PIX/cartão).
Sistema de notificações in‑app e e‑mail (WhatsApp não prioritário).
Métricas / KPIs
Ocupação por turma (%).
Percentual de frequência dos alunos vs aulas contratadas (frequência efetiva).
Quantidade de reposições por aluno (e total).
Receita recorrente mensal (MRR) por unidade.
Taxa de não‑confirmação / no‑show (se aplicável).
Tempo médio gasto em administração (meta de redução).
Template mínimo para importação inicial (CSV)
Use CPF ou telefone como chave para casar cadastros existentes.

cpf;telefone;nome;sobrenome;email;unidade;nivel;plano_tipo;plano_inicio;plano_fim;aulas_por_semana;turmas_selecionadas;creditos_reposicao;creditos_pacote10;ultimo_pagamento;metodo_pagamento

12345678901;5521999999999;Joao;Silva;joao@ex.com;Copacabana;Intermediario;mensal;2025-10-01;2025-11-01;2;"2a 07:00,3a 08:00";1;0;2025-09-25;PIX