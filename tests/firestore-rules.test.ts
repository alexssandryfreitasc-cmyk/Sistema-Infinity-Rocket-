import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const PROJECT_ID = 'ai-studio-agencyos-test';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function record(suite: string, name: string, passed: boolean, error?: string) {
  results.push({ suite, name, passed, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${suite}] ${name}${error ? ` -> Erro: ${error}` : ''}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('INICIANDO TESTES DO FIRESTORE SECURITY RULES (EMULATOR)');
  console.log('====================================================\n');

  const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');

  const hostPort = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
  const [host, portStr] = hostPort.split(':');
  const port = parseInt(portStr || '8085', 10);

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host,
        port
      }
    });
  } catch (err: any) {
    console.error('Falha ao inicializar ambiente de testes no emulador:', err.message);
    process.exit(1);
  }

  // ----------------------------------------------------
  // SEED DE DADOS INICIAIS (Bypassing security rules)
  // ----------------------------------------------------
  console.log('🌱 Semeando banco de dados de teste...');
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // 1. Admins
    await setDoc(doc(db, 'admins/admin-uid'), { email: 'alexssandryfreitasc@gmail.com' });
    await setDoc(doc(db, 'users/admin-uid'), {
      id: 'admin-uid',
      name: 'Admin Master',
      email: 'alexssandryfreitasc@gmail.com',
      role: 'ADMIN',
      status: 'ATIVO'
    });

    // 2. Gestor
    await setDoc(doc(db, 'users/gestor-uid'), {
      id: 'gestor-uid',
      name: 'Gestor Carlos',
      email: 'carlos@agencia.com',
      role: 'GESTOR',
      status: 'ATIVO',
      title: 'Head de Contas'
    });

    // 3. Colaborador
    await setDoc(doc(db, 'users/colab-uid'), {
      id: 'colab-uid',
      name: 'Designer Ana',
      email: 'ana@agencia.com',
      role: 'COLABORADOR',
      status: 'ATIVO',
      title: 'Senior Designer'
    });

    // 4. Cliente A
    await setDoc(doc(db, 'users/client-a-uid'), {
      id: 'client-a-uid',
      name: 'Cliente Alpha',
      email: 'alpha@empresa-a.com',
      role: 'CLIENTE',
      clientId: 'client-a',
      status: 'ATIVO'
    });

    // 5. Cliente B
    await setDoc(doc(db, 'users/client-b-uid'), {
      id: 'client-b-uid',
      name: 'Cliente Beta',
      email: 'beta@empresa-b.com',
      role: 'CLIENTE',
      clientId: 'client-b',
      status: 'ATIVO'
    });

    // 6. Usuário Pendente
    await setDoc(doc(db, 'users/pending-uid'), {
      id: 'pending-uid',
      name: 'Candidato João',
      email: 'joao@pendente.com',
      role: 'COLABORADOR',
      status: 'PENDENTE_APROVACAO'
    });

    // 7. Dados de Clientes
    await setDoc(doc(db, 'clients/client-a'), {
      id: 'client-a',
      tradingName: 'Empresa Alpha Ltda',
      status: 'ATIVO'
    });
    await setDoc(doc(db, 'clients/client-b'), {
      id: 'client-b',
      tradingName: 'Empresa Beta Ltda',
      status: 'ATIVO'
    });

    // 8. Tarefas Internas
    await setDoc(doc(db, 'tasks/task-1'), {
      id: 'task-1',
      clientId: 'client-a',
      title: 'Criar wireframe',
      status: 'A_FAZER'
    });

    // 9. Conteúdos
    await setDoc(doc(db, 'contents/content-client-a'), {
      id: 'content-client-a',
      clientId: 'client-a',
      title: 'Postagem Inaugural',
      scheduledDate: '2026-10-01',
      status: 'EM_APROVACAO',
      approvalHistory: []
    });
    await setDoc(doc(db, 'contents/content-client-b'), {
      id: 'content-client-b',
      clientId: 'client-b',
      title: 'Postagem Beta',
      scheduledDate: '2026-10-02',
      status: 'EM_APROVACAO',
      approvalHistory: []
    });

    // 10. Chamados
    await setDoc(doc(db, 'tickets/ticket-client-a'), {
      id: 'ticket-client-a',
      clientId: 'client-a',
      createdById: 'client-a-uid',
      title: 'Dúvida sobre briefing',
      description: 'Como preencher o campo X?',
      status: 'ABERTO'
    });
    await setDoc(doc(db, 'tickets/ticket-client-b'), {
      id: 'ticket-client-b',
      clientId: 'client-b',
      createdById: 'client-b-uid',
      title: 'Solicitação de logotipo',
      description: 'Envio anexo do logo',
      status: 'ABERTO'
    });

    // 11. Finanças & Caixa
    await setDoc(doc(db, 'financials/fin-client-a'), {
      id: 'fin-client-a',
      clientId: 'client-a',
      monthlyValue: 5000,
      status: 'ATIVO'
    });
    await setDoc(doc(db, 'transactions/txn-1'), {
      id: 'txn-1',
      clientId: 'client-a',
      amount: 5000,
      type: 'RECEITA'
    });

    // 12. Acessos
    await setDoc(doc(db, 'accesses/access-client-a'), {
      id: 'access-client-a',
      clientId: 'client-a',
      platformName: 'Meta Ads',
      loginOrUser: 'ads@empresa-a.com',
      authMethod: 'CONVITE_GESTOR',
      status: 'PENDENTE'
    });
  });

  console.log('🌱 Seed concluído com sucesso!\n');

  // Contextos autenticados
  const adminCtx = testEnv.authenticatedContext('admin-uid', { email: 'alexssandryfreitasc@gmail.com' }).firestore();
  const gestorCtx = testEnv.authenticatedContext('gestor-uid', { email: 'carlos@agencia.com' }).firestore();
  const colabCtx = testEnv.authenticatedContext('colab-uid', { email: 'ana@agencia.com' }).firestore();
  const clientACtx = testEnv.authenticatedContext('client-a-uid', { email: 'alpha@empresa-a.com' }).firestore();
  const clientBCtx = testEnv.authenticatedContext('client-b-uid', { email: 'beta@empresa-b.com' }).firestore();
  const pendingCtx = testEnv.authenticatedContext('pending-uid', { email: 'joao@pendente.com' }).firestore();
  const unauthCtx = testEnv.unauthenticatedContext().firestore();

  // ====================================================
  // SUÍTE 1: USUÁRIO PENDENTE / NÃO AUTENTICADO
  // ====================================================
  console.log('\n--- [SUÍTE 1: USUÁRIO PENDENTE E NÃO AUTENTICADO] ---');

  try {
    await assertFails(getDocs(collection(unauthCtx, 'clients')));
    record('UNAUTHENTICATED', 'Não autenticado NÃO pode listar clientes', true);
  } catch (e: any) { record('UNAUTHENTICATED', 'Não autenticado NÃO pode listar clientes', false, e.message); }

  try {
    await assertFails(getDocs(collection(pendingCtx, 'clients')));
    record('PENDING_USER', 'Usuário pendente NÃO pode listar clientes', true);
  } catch (e: any) { record('PENDING_USER', 'Usuário pendente NÃO pode listar clientes', false, e.message); }

  try {
    await assertFails(getDocs(collection(pendingCtx, 'tasks')));
    record('PENDING_USER', 'Usuário pendente NÃO pode ler tarefas', true);
  } catch (e: any) { record('PENDING_USER', 'Usuário pendente NÃO pode ler tarefas', false, e.message); }

  try {
    await assertFails(getDocs(collection(pendingCtx, 'financials')));
    record('PENDING_USER', 'Usuário pendente NÃO pode ler dados financeiros', true);
  } catch (e: any) { record('PENDING_USER', 'Usuário pendente NÃO pode ler dados financeiros', false, e.message); }

  try {
    // Tentativa do usuário pendente de se auto-aprovar (mudar status para ATIVO)
    await assertFails(updateDoc(doc(pendingCtx, 'users/pending-uid'), { status: 'ATIVO' }));
    record('PENDING_USER', 'Usuário pendente NÃO pode auto-aprovar seu status para ATIVO', true);
  } catch (e: any) { record('PENDING_USER', 'Usuário pendente NÃO pode auto-aprovar seu status para ATIVO', false, e.message); }

  try {
    // Tentativa do usuário pendente de mudar seu papel para ADMIN
    await assertFails(updateDoc(doc(pendingCtx, 'users/pending-uid'), { role: 'ADMIN' }));
    record('PENDING_USER', 'Usuário pendente NÃO pode auto-promover para ADMIN', true);
  } catch (e: any) { record('PENDING_USER', 'Usuário pendente NÃO pode auto-promover para ADMIN', false, e.message); }

  // ====================================================
  // SUÍTE 2: CLIENTE (RESTRIÇÕES, ISOLAMENTO E ACESSO CRUZADO)
  // ====================================================
  console.log('\n--- [SUÍTE 2: CLIENTE VINCULADO E ACESSO CRUZADO] ---');

  try {
    // Cliente A acessa seu próprio documento de cliente
    await assertSucceeds(getDoc(doc(clientACtx, 'clients/client-a')));
    record('CLIENTE_VINCULADO', 'Cliente A pode consultar (get) seu próprio registro de cliente', true);
  } catch (e: any) { record('CLIENTE_VINCULADO', 'Cliente A pode consultar (get) seu próprio registro de cliente', false, e.message); }

  try {
    // ACESSO CRUZADO: Cliente B tenta consultar o cliente A
    await assertFails(getDoc(doc(clientBCtx, 'clients/client-a')));
    record('ACESSO_CRUZADO', 'Cliente B NÃO pode consultar documento do Cliente A', true);
  } catch (e: any) { record('ACESSO_CRUZADO', 'Cliente B NÃO pode consultar documento do Cliente A', false, e.message); }

  try {
    // Cliente A tenta LISTAR a coleção de clientes (ver outros clientes)
    await assertFails(getDocs(collection(clientACtx, 'clients')));
    record('CLIENTE_ISOLAMENTO', 'Cliente A NÃO pode listar coleção geral de clientes', true);
  } catch (e: any) { record('CLIENTE_ISOLAMENTO', 'Cliente A NÃO pode listar coleção geral de clientes', false, e.message); }

  try {
    // Cliente tenta ler tarefas internas (/tasks)
    await assertFails(getDoc(doc(clientACtx, 'tasks/task-1')));
    record('CLIENTE_SEGURANCA', 'Cliente A NÃO tem acesso a tarefas internas (/tasks)', true);
  } catch (e: any) { record('CLIENTE_SEGURANCA', 'Cliente A NÃO tem acesso a tarefas internas (/tasks)', false, e.message); }

  try {
    // Cliente tenta ler financeiro (/financials)
    await assertFails(getDoc(doc(clientACtx, 'financials/fin-client-a')));
    record('CLIENTE_SEGURANCA', 'Cliente A NÃO tem acesso a contratos financeiros (/financials)', true);
  } catch (e: any) { record('CLIENTE_SEGURANCA', 'Cliente A NÃO tem acesso a contratos financeiros (/financials)', false, e.message); }

  try {
    // Cliente tenta ler fluxo de caixa (/transactions)
    await assertFails(getDoc(doc(clientACtx, 'transactions/txn-1')));
    record('CLIENTE_SEGURANCA', 'Cliente A NÃO tem acesso a movimentações de caixa (/transactions)', true);
  } catch (e: any) { record('CLIENTE_SEGURANCA', 'Cliente A NÃO tem acesso a movimentações de caixa (/transactions)', false, e.message); }

  try {
    // Cliente A lê conteúdo do seu próprio clientId
    await assertSucceeds(getDoc(doc(clientACtx, 'contents/content-client-a')));
    record('CLIENTE_CONTEUDO', 'Cliente A pode ler conteúdo vinculado à sua empresa', true);
  } catch (e: any) { record('CLIENTE_CONTEUDO', 'Cliente A pode ler conteúdo vinculado à sua empresa', false, e.message); }

  try {
    // ACESSO CRUZADO: Cliente B tenta ler conteúdo do Cliente A
    await assertFails(getDoc(doc(clientBCtx, 'contents/content-client-a')));
    record('ACESSO_CRUZADO', 'Cliente B NÃO pode ler conteúdo do Cliente A', true);
  } catch (e: any) { record('ACESSO_CRUZADO', 'Cliente B NÃO pode ler conteúdo do Cliente A', false, e.message); }

  try {
    // Cliente A aprova seu próprio conteúdo (altera APENAS campos de aprovação)
    await assertSucceeds(updateDoc(doc(clientACtx, 'contents/content-client-a'), {
      status: 'APROVADO',
      approvalHistory: [{ status: 'APROVADO', authorName: 'Cliente Alpha', timestamp: new Date().toISOString() }]
    }));
    record('CLIENTE_CONTEUDO', 'Cliente A pode alterar status de aprovação e histórico de aprovação', true);
  } catch (e: any) { record('CLIENTE_CONTEUDO', 'Cliente A pode alterar status de aprovação e histórico de aprovação', false, e.message); }

  try {
    // CAMPO PROIBIDO: Cliente A tenta alterar título e data agendada do conteúdo
    await assertFails(updateDoc(doc(clientACtx, 'contents/content-client-a'), {
      title: 'Título hackeado pelo cliente',
      scheduledDate: '2026-12-31'
    }));
    record('CAMPOS_PROIBIDOS', 'Cliente A é BLOQUEADO ao tentar alterar título ou data de conteúdo', true);
  } catch (e: any) { record('CAMPOS_PROIBIDOS', 'Cliente A é BLOQUEADO ao tentar alterar título ou data de conteúdo', false, e.message); }

  try {
    // CAMPO PROIBIDO: Cliente A tenta alterar clientId do conteúdo
    await assertFails(updateDoc(doc(clientACtx, 'contents/content-client-a'), {
      clientId: 'client-b'
    }));
    record('CAMPOS_PROIBIDOS', 'Cliente A é BLOQUEADO ao tentar alterar clientId do conteúdo', true);
  } catch (e: any) { record('CAMPOS_PROIBIDOS', 'Cliente A é BLOQUEADO ao tentar alterar clientId do conteúdo', false, e.message); }

  try {
    // Cliente cria chamado para sua empresa
    await assertSucceeds(setDoc(doc(clientACtx, 'tickets/new-ticket-a'), {
      id: 'new-ticket-a',
      clientId: 'client-a',
      createdById: 'client-a-uid',
      title: 'Novo chamado',
      description: 'Solicitação de suporte',
      status: 'ABERTO'
    }));
    record('CLIENTE_CHAMADOS', 'Cliente A pode abrir chamado para seu clientId', true);
  } catch (e: any) { record('CLIENTE_CHAMADOS', 'Cliente A pode abrir chamado para seu clientId', false, e.message); }

  try {
    // ACESSO CRUZADO: Cliente A tenta criar chamado para o Cliente B
    await assertFails(setDoc(doc(clientACtx, 'tickets/fake-ticket-b'), {
      id: 'fake-ticket-b',
      clientId: 'client-b',
      createdById: 'client-a-uid',
      title: 'Chamado fraudulento',
      description: 'Tentativa cruzada',
      status: 'ABERTO'
    }));
    record('ACESSO_CRUZADO', 'Cliente A NÃO pode abrir chamado apontando para clientId de outro cliente', true);
  } catch (e: any) { record('ACESSO_CRUZADO', 'Cliente A NÃO pode abrir chamado apontando para clientId de outro cliente', false, e.message); }

  try {
    // Cliente A atualiza resposta do seu chamado
    await assertSucceeds(updateDoc(doc(clientACtx, 'tickets/ticket-client-a'), {
      clientResponse: 'Obrigado pelo retorno!',
      status: 'RESOLVIDO'
    }));
    record('CLIENTE_CHAMADOS', 'Cliente A pode responder e alterar status de resolução no seu chamado', true);
  } catch (e: any) { record('CLIENTE_CHAMADOS', 'Cliente A pode responder e alterar status de resolução no seu chamado', false, e.message); }

  try {
    // CAMPO PROIBIDO: Cliente A tenta mudar prioridade ou responsável do chamado
    await assertFails(updateDoc(doc(clientACtx, 'tickets/ticket-client-a'), {
      priority: 'CRITICO',
      slaDeadlineHours: 1
    }));
    record('CAMPOS_PROIBIDOS', 'Cliente A é BLOQUEADO ao tentar alterar SLA ou prioridade de chamados', true);
  } catch (e: any) { record('CAMPOS_PROIBIDOS', 'Cliente A é BLOQUEADO ao tentar alterar SLA ou prioridade de chamados', false, e.message); }

  try {
    // ACESSO CRUZADO: Cliente B tenta atualizar chamado do Cliente A
    await assertFails(updateDoc(doc(clientBCtx, 'tickets/ticket-client-a'), {
      clientResponse: 'Interferência indevida'
    }));
    record('ACESSO_CRUZADO', 'Cliente B NÃO pode alterar chamado do Cliente A', true);
  } catch (e: any) { record('ACESSO_CRUZADO', 'Cliente B NÃO pode alterar chamado do Cliente A', false, e.message); }

  try {
    // SENHA EM TEXTO PLANO: Tentativa de salvar senha em accesses
    await assertFails(setDoc(doc(clientACtx, 'accesses/insecure-access'), {
      id: 'insecure-access',
      clientId: 'client-a',
      platformName: 'Instagram',
      password: 'minhasenhasecreta123'
    }));
    record('SEGURANCA_ACCESSES', 'Proibido salvar campo plaintext password em /accesses', true);
  } catch (e: any) { record('SEGURANCA_ACCESSES', 'Proibido salvar campo plaintext password em /accesses', false, e.message); }

  try {
    // Tentativa de salvar passwordOrToken em accesses
    await assertFails(setDoc(doc(clientACtx, 'accesses/insecure-token'), {
      id: 'insecure-token',
      clientId: 'client-a',
      platformName: 'Facebook',
      passwordOrToken: 'token_secreto_xyz'
    }));
    record('SEGURANCA_ACCESSES', 'Proibido salvar campo plaintext passwordOrToken em /accesses', true);
  } catch (e: any) { record('SEGURANCA_ACCESSES', 'Proibido salvar campo plaintext passwordOrToken em /accesses', false, e.message); }

  try {
    // Salvar acesso seguro (sem senhas em texto puro)
    await assertSucceeds(setDoc(doc(clientACtx, 'accesses/secure-access'), {
      id: 'secure-access',
      clientId: 'client-a',
      platformName: 'Google Tag Manager',
      loginOrUser: 'gtm@empresa-a.com',
      authMethod: 'CONVITE_GESTOR',
      status: 'PENDENTE'
    }));
    record('SEGURANCA_ACCESSES', 'Permitido salvar acesso seguro por concessão/convite sem senhas', true);
  } catch (e: any) { record('SEGURANCA_ACCESSES', 'Permitido salvar acesso seguro por concessão/convite sem senhas', false, e.message); }

  // ====================================================
  // SUÍTE 3: COLABORADOR
  // ====================================================
  console.log('\n--- [SUÍTE 3: COLABORADOR] ---');

  try {
    await assertSucceeds(getDoc(doc(colabCtx, 'clients/client-a')));
    record('COLABORADOR', 'Colaborador pode visualizar cliente da agência', true);
  } catch (e: any) { record('COLABORADOR', 'Colaborador pode visualizar cliente da agência', false, e.message); }

  try {
    await assertSucceeds(getDoc(doc(colabCtx, 'tasks/task-1')));
    record('COLABORADOR', 'Colaborador pode visualizar tarefas operacionais', true);
  } catch (e: any) { record('COLABORADOR', 'Colaborador pode visualizar tarefas operacionais', false, e.message); }

  try {
    await assertSucceeds(updateDoc(doc(colabCtx, 'tasks/task-1'), { status: 'EM_ANDAMENTO' }));
    record('COLABORADOR', 'Colaborador pode mover status da tarefa', true);
  } catch (e: any) { record('COLABORADOR', 'Colaborador pode mover status da tarefa', false, e.message); }

  try {
    // Colaborador tenta DELETAR tarefa
    await assertFails(deleteDoc(doc(colabCtx, 'tasks/task-1')));
    record('COLABORADOR_EXCLUSAO', 'Colaborador NÃO tem permissão para excluir tarefas', true);
  } catch (e: any) { record('COLABORADOR_EXCLUSAO', 'Colaborador NÃO tem permissão para excluir tarefas', false, e.message); }

  try {
    // Colaborador tenta ler contratos financeiros (/financials)
    await assertFails(getDoc(doc(colabCtx, 'financials/fin-client-a')));
    record('COLABORADOR_FINANCEIRO', 'Colaborador NÃO tem permissão para ler faturamento (/financials)', true);
  } catch (e: any) { record('COLABORADOR_FINANCEIRO', 'Colaborador NÃO tem permissão para ler faturamento (/financials)', false, e.message); }

  try {
    // Colaborador tenta ler fluxo de caixa (/transactions)
    await assertFails(getDoc(doc(colabCtx, 'transactions/txn-1')));
    record('COLABORADOR_FINANCEIRO', 'Colaborador NÃO tem permissão para ler fluxo de caixa (/transactions)', true);
  } catch (e: any) { record('COLABORADOR_FINANCEIRO', 'Colaborador NÃO tem permissão para ler fluxo de caixa (/transactions)', false, e.message); }

  try {
    // Colaborador tenta alterar seu próprio cargo para ADMIN
    await assertFails(updateDoc(doc(colabCtx, 'users/colab-uid'), { role: 'ADMIN' }));
    record('COLABORADOR_PERMISSOES', 'Colaborador NÃO pode alterar seu próprio role', true);
  } catch (e: any) { record('COLABORADOR_PERMISSOES', 'Colaborador NÃO pode alterar seu próprio role', false, e.message); }

  try {
    // Colaborador tenta alterar seu próprio status
    await assertFails(updateDoc(doc(colabCtx, 'users/colab-uid'), { status: 'PENDENTE_APROVACAO' }));
    record('COLABORADOR_PERMISSOES', 'Colaborador NÃO pode alterar seu próprio status', true);
  } catch (e: any) { record('COLABORADOR_PERMISSOES', 'Colaborador NÃO pode alterar seu próprio status', false, e.message); }

  // ====================================================
  // SUÍTE 4: GESTOR
  // ====================================================
  console.log('\n--- [SUÍTE 4: GESTOR] ---');

  try {
    await assertSucceeds(getDoc(doc(gestorCtx, 'financials/fin-client-a')));
    record('GESTOR', 'Gestor pode visualizar métricas de faturamento (/financials)', true);
  } catch (e: any) { record('GESTOR', 'Gestor pode visualizar métricas de faturamento (/financials)', false, e.message); }

  try {
    await assertSucceeds(getDoc(doc(gestorCtx, 'transactions/txn-1')));
    record('GESTOR', 'Gestor pode visualizar fluxo de caixa (/transactions)', true);
  } catch (e: any) { record('GESTOR', 'Gestor pode visualizar fluxo de caixa (/transactions)', false, e.message); }

  try {
    // Gestor atualiza detalhes operacionais de colaborador (nome, telefone, título)
    await assertSucceeds(updateDoc(doc(gestorCtx, 'users/colab-uid'), {
      title: 'Líder Criativo',
      phone: '11999998888'
    }));
    record('GESTOR', 'Gestor pode atualizar campos operacionais (cargo/telefone) de colaborador', true);
  } catch (e: any) { record('GESTOR', 'Gestor pode atualizar campos operacionais (cargo/telefone) de colaborador', false, e.message); }

  try {
    // GESTOR TENTA PROMOVER USUÁRIO (ALTERAR 'role'): DEVE SER BLOQUEADO!
    await assertFails(updateDoc(doc(gestorCtx, 'users/colab-uid'), { role: 'GESTOR' }));
    record('GESTOR_RESTRICAO', 'Gestor NÃO PODE alterar o role de outros usuários (promoção bloqueada)', true);
  } catch (e: any) { record('GESTOR_RESTRICAO', 'Gestor NÃO PODE alterar o role de outros usuários (promoção bloqueada)', false, e.message); }

  try {
    // GESTOR TENTA APROVAR OU ALTERAR 'status' DE USUÁRIO: DEVE SER BLOQUEADO!
    await assertFails(updateDoc(doc(gestorCtx, 'users/pending-uid'), { status: 'ATIVO' }));
    record('GESTOR_RESTRICAO', 'Gestor NÃO PODE alterar status de usuários (aprovação restrita a ADMIN)', true);
  } catch (e: any) { record('GESTOR_RESTRICAO', 'Gestor NÃO PODE alterar status de usuários (aprovação restrita a ADMIN)', false, e.message); }

  try {
    // GESTOR TENTA ALTERAR O PRÓPRIO ROLE (auto-promoção para ADMIN): DEVE SER BLOQUEADO!
    await assertFails(updateDoc(doc(gestorCtx, 'users/gestor-uid'), { role: 'ADMIN' }));
    record('GESTOR_RESTRICAO', 'Gestor NÃO PODE alterar o próprio role para ADMIN', true);
  } catch (e: any) { record('GESTOR_RESTRICAO', 'Gestor NÃO PODE alterar o próprio role para ADMIN', false, e.message); }

  try {
    // GESTOR TENTA ALTERAR DOCUMENTO DE UM ADMIN: DEVE SER BLOQUEADO!
    await assertFails(updateDoc(doc(gestorCtx, 'users/admin-uid'), { name: 'Nome alterado por gestor' }));
    record('GESTOR_RESTRICAO', 'Gestor NÃO PODE alterar perfis de Administradores', true);
  } catch (e: any) { record('GESTOR_RESTRICAO', 'Gestor NÃO PODE alterar perfis de Administradores', false, e.message); }

  try {
    // GESTOR TENTA EXCLUIR CLIENTE: DEVE SER BLOQUEADO! (Apenas ADMIN)
    await assertFails(deleteDoc(doc(gestorCtx, 'clients/client-b')));
    record('GESTOR_RESTRICAO', 'Gestor NÃO PODE excluir cadastro de clientes (exclusão restrita a ADMIN)', true);
  } catch (e: any) { record('GESTOR_RESTRICAO', 'Gestor NÃO PODE excluir cadastro de clientes (exclusão restrita a ADMIN)', false, e.message); }

  try {
    // GESTOR TENTA EXCLUIR REGISTRO FINANCEIRO: DEVE SER BLOQUEADO! (Apenas ADMIN)
    await assertFails(deleteDoc(doc(gestorCtx, 'financials/fin-client-a')));
    record('GESTOR_RESTRICAO', 'Gestor NÃO PODE excluir registros financeiros (exclusão restrita a ADMIN)', true);
  } catch (e: any) { record('GESTOR_RESTRICAO', 'Gestor NÃO PODE excluir registros financeiros (exclusão restrita a ADMIN)', false, e.message); }

  // ====================================================
  // SUÍTE 5: ADMIN
  // ====================================================
  console.log('\n--- [SUÍTE 5: ADMIN] ---');

  try {
    // Admin pode alterar role de qualquer usuário (promover para GESTOR)
    await assertSucceeds(updateDoc(doc(adminCtx, 'users/colab-uid'), { role: 'GESTOR' }));
    record('ADMIN', 'Admin pode alterar role de usuários (promover para GESTOR)', true);
  } catch (e: any) { record('ADMIN', 'Admin pode alterar role de usuários (promover para GESTOR)', false, e.message); }

  try {
    // Admin pode alterar status (aprovar usuário pendente)
    await assertSucceeds(updateDoc(doc(adminCtx, 'users/pending-uid'), { status: 'ATIVO' }));
    record('ADMIN', 'Admin pode aprovar contas de usuários pendentes', true);
  } catch (e: any) { record('ADMIN', 'Admin pode aprovar contas de usuários pendentes', false, e.message); }

  try {
    // Admin pode excluir cliente
    await assertSucceeds(deleteDoc(doc(adminCtx, 'clients/client-b')));
    record('ADMIN', 'Admin pode excluir cadastro de clientes', true);
  } catch (e: any) { record('ADMIN', 'Admin pode excluir cadastro de clientes', false, e.message); }

  try {
    // Admin pode excluir registro financeiro
    await assertSucceeds(deleteDoc(doc(adminCtx, 'financials/fin-client-a')));
    record('ADMIN', 'Admin pode excluir registros financeiros', true);
  } catch (e: any) { record('ADMIN', 'Admin pode excluir registros financeiros', false, e.message); }

  await testEnv.cleanup();

  console.log('\n====================================================');
  console.log('RESUMO DA EXECUÇÃO DOS TESTES DE SEGURANÇA');
  console.log('====================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total de testes: ${results.length}`);
  console.log(`Sucessos: ${passedCount} ✅`);
  console.log(`Falhas: ${failedCount} ${failedCount === 0 ? '🎉' : '❌'}`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});
