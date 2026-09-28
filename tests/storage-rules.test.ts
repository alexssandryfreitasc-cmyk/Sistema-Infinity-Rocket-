import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { ref, uploadBytes, getBytes, deleteObject } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'demo-agencyos-test';

interface TestStats {
  passed: number;
  failed: number;
  total: number;
}

const stats: TestStats = { passed: 0, failed: 0, total: 0 };

async function expectSuccess(description: string, fn: () => Promise<unknown>) {
  stats.total++;
  try {
    await assertSucceeds(fn());
    console.log(`✅ [SUCESSO] ${description}`);
    stats.passed++;
  } catch (error: any) {
    console.error(`❌ [FALHA] ${description}`);
    console.error('   Erro:', error?.message || error);
    stats.failed++;
  }
}

async function expectFailure(description: string, fn: () => Promise<unknown>) {
  stats.total++;
  try {
    await assertFails(fn());
    console.log(`✅ [NEGADO ESPERADO] ${description}`);
    stats.passed++;
  } catch (error: any) {
    console.error(`❌ [FALHA - DEVERIA TER SIDO BLOQUEADO] ${description}`);
    console.error('   Erro:', error?.message || error);
    stats.failed++;
  }
}

async function runStorageRulesTests() {
  console.log('====================================================');
  console.log('TESTES DE REGRAS DO CLOUD STORAGE (FIREBASE EMULATOR)');
  console.log('====================================================\n');

  const hostPortStorage = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';
  const [sHost, sPortStr] = hostPortStorage.split(':');
  const sPort = parseInt(sPortStr || '9199', 10);

  const hostPortFirestore = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
  const [fHost, fPortStr] = hostPortFirestore.split(':');
  const fPort = parseInt(fPortStr || '8085', 10);

  const storageRules = fs.readFileSync(path.resolve('storage.rules'), 'utf8');
  const firestoreRules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      storage: {
        host: sHost,
        port: sPort,
        rules: storageRules
      },
      firestore: {
        host: fHost,
        port: fPort,
        rules: firestoreRules
      }
    });
  } catch (err: any) {
    console.error('Falha ao inicializar ambiente de testes do Storage:', err.message);
    process.exit(1);
  }

  // Prepara dados no Firestore para resolução das regras cross-service
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    // Cliente A
    await setDoc(doc(db, 'users', 'client-a-uid'), {
      role: 'CLIENTE',
      status: 'ATIVO',
      clientId: 'empresa-alpha',
      email: 'alpha@empresa.com'
    });
    // Cliente B
    await setDoc(doc(db, 'users', 'client-b-uid'), {
      role: 'CLIENTE',
      status: 'ATIVO',
      clientId: 'empresa-beta',
      email: 'beta@empresa.com'
    });
    // Colaborador
    await setDoc(doc(db, 'users', 'colaborador-uid'), {
      role: 'COLABORADOR',
      status: 'ATIVO',
      email: 'designer@agencia.com'
    });
    // Gestor
    await setDoc(doc(db, 'users', 'gestor-uid'), {
      role: 'GESTOR',
      status: 'ATIVO',
      email: 'gerente@agencia.com'
    });
    // Admin
    await setDoc(doc(db, 'users', 'admin-uid'), {
      role: 'ADMIN',
      status: 'ATIVO',
      email: 'admin@agencia.com'
    });
    // Usuário Pendente
    await setDoc(doc(db, 'users', 'pendente-uid'), {
      role: 'CLIENTE',
      status: 'PENDENTE_APROVACAO',
      clientId: 'empresa-alpha',
      email: 'pendente@empresa.com'
    });
  });

  const clientACtx = testEnv.authenticatedContext('client-a-uid');
  const clientBCtx = testEnv.authenticatedContext('client-b-uid');
  const colaboradorCtx = testEnv.authenticatedContext('colaborador-uid');
  const gestorCtx = testEnv.authenticatedContext('gestor-uid');
  const adminCtx = testEnv.authenticatedContext('admin-uid');
  const pendenteCtx = testEnv.authenticatedContext('pendente-uid');
  const anonCtx = testEnv.unauthenticatedContext();

  const smallData = new Uint8Array([10, 20, 30, 40, 50]);

  console.log('--- [SUÍTE 1: ACESSO DE CLIENTE E ISOLAMENTO MULTI-TENANT] ---');
  // 1. Cliente A faz upload do seu próprio arquivo válido
  await expectSuccess('Cliente A pode fazer upload de imagem PNG na pasta da sua empresa', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return uploadBytes(fileRef, smallData, { contentType: 'image/png' });
  });

  // 2. Cliente A pode ler o arquivo da sua empresa
  await expectSuccess('Cliente A pode ler o arquivo recém-enviado da sua empresa', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return getBytes(fileRef);
  });

  // 3. Cliente B tenta ler o arquivo do Cliente A
  await expectFailure('Cliente B NÃO PODE ler arquivos confidenciais do Cliente A (Acesso Cruzado)', async () => {
    const fileRef = ref(clientBCtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return getBytes(fileRef);
  });

  // 4. Cliente B tenta fazer upload na pasta do Cliente A
  await expectFailure('Cliente B NÃO PODE fazer upload na pasta do Cliente A (Acesso Cruzado)', async () => {
    const fileRef = ref(clientBCtx.storage(), 'clients/empresa-alpha/assets/invasao.png');
    return uploadBytes(fileRef, smallData, { contentType: 'image/png' });
  });

  // 5. Cliente A tenta fazer upload na pasta do Cliente B
  await expectFailure('Cliente A NÃO PODE fazer upload na pasta do Cliente B', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-beta/assets/teste.png');
    return uploadBytes(fileRef, smallData, { contentType: 'image/png' });
  });

  // 6. Cliente A tenta deletar seu próprio arquivo (apenas agência pode deletar)
  await expectFailure('Cliente A NÃO PODE excluir arquivos (exclusão restrita à agência)', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return deleteObject(fileRef);
  });

  console.log('\n--- [SUÍTE 2: VALIDAÇÃO DE TIPOS DE ARQUIVO (MIME TYPES)] ---');
  // Formatos permitidos
  await expectSuccess('Cliente A pode fazer upload de PDF (application/pdf)', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/docs/contrato.pdf');
    return uploadBytes(fileRef, smallData, { contentType: 'application/pdf' });
  });

  await expectSuccess('Cliente A pode fazer upload de Vídeo MP4 (video/mp4)', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/videos/reels.mp4');
    return uploadBytes(fileRef, smallData, { contentType: 'video/mp4' });
  });

  await expectSuccess('Cliente A pode fazer upload de Documento DOCX', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/briefings/briefing.docx');
    return uploadBytes(fileRef, smallData, {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  });

  await expectSuccess('Cliente A pode fazer upload de Arquivo ZIP', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/assets/pack.zip');
    return uploadBytes(fileRef, smallData, { contentType: 'application/zip' });
  });

  // Formatos proibidos (executáveis, scripts maliciosos, html)
  await expectFailure('Cliente A é BLOQUEADO ao enviar executável Windows (.exe)', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/virus.exe');
    return uploadBytes(fileRef, smallData, { contentType: 'application/x-msdownload' });
  });

  await expectFailure('Cliente A é BLOQUEADO ao enviar script shell (.sh)', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/script.sh');
    return uploadBytes(fileRef, smallData, { contentType: 'application/x-sh' });
  });

  await expectFailure('Cliente A é BLOQUEADO ao enviar Javascript malicioso (.js)', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/exploit.js');
    return uploadBytes(fileRef, smallData, { contentType: 'application/javascript' });
  });

  await expectFailure('Cliente A é BLOQUEADO ao enviar arquivo HTML com XSS (.html)', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/phishing.html');
    return uploadBytes(fileRef, smallData, { contentType: 'text/html' });
  });

  console.log('\n--- [SUÍTE 3: LIMITE DE TAMANHO DE ARQUIVO (50 MB)] ---');
  // Arquivo dentro do limite (ex: 2 MB)
  const twoMbData = new Uint8Array(2 * 1024 * 1024);
  await expectSuccess('Upload de arquivo de 2 MB (dentro do limite de 50 MB) é permitido', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/media/foto-alta.jpg');
    return uploadBytes(fileRef, twoMbData, { contentType: 'image/jpeg' });
  });

  // Arquivo excedendo o limite (50 MB + 1 KB = 52.429.824 bytes)
  const fiftyMbPlusData = new Uint8Array(50 * 1024 * 1024 + 1024);
  await expectFailure('Upload de arquivo excedendo 50 MB é BLOQUEADO', async () => {
    const fileRef = ref(clientACtx.storage(), 'clients/empresa-alpha/media/video-gigante.mp4');
    return uploadBytes(fileRef, fiftyMbPlusData, { contentType: 'video/mp4' });
  });

  console.log('\n--- [SUÍTE 4: ACESSO OPERACIONAL DA EQUIPE DA AGÊNCIA] ---');
  // Colaborador tem acesso a todos os arquivos de clientes
  await expectSuccess('Colaborador da agência pode ler arquivos de qualquer cliente', async () => {
    const fileRef = ref(colaboradorCtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return getBytes(fileRef);
  });

  await expectSuccess('Colaborador da agência pode fazer upload em pasta de cliente', async () => {
    const fileRef = ref(colaboradorCtx.storage(), 'clients/empresa-alpha/creatives/banner.png');
    return uploadBytes(fileRef, smallData, { contentType: 'image/png' });
  });

  // Gestor tem acesso completo
  await expectSuccess('Gestor pode ler arquivos de cliente', async () => {
    const fileRef = ref(gestorCtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return getBytes(fileRef);
  });

  await expectSuccess('Gestor pode excluir arquivo operacional de cliente', async () => {
    const fileRef = ref(gestorCtx.storage(), 'clients/empresa-alpha/creatives/banner.png');
    return deleteObject(fileRef);
  });

  // Admin tem acesso irrestrito
  await expectSuccess('Admin pode ler e gerenciar arquivos de clientes', async () => {
    const fileRef = ref(adminCtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return getBytes(fileRef);
  });

  console.log('\n--- [SUÍTE 5: USUÁRIO NÃO AUTENTICADO E PENDENTE] ---');
  await expectFailure('Usuário anônimo é BLOQUEADO ao tentar ler arquivos', async () => {
    const fileRef = ref(anonCtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return getBytes(fileRef);
  });

  await expectFailure('Usuário anônimo é BLOQUEADO ao tentar enviar arquivos', async () => {
    const fileRef = ref(anonCtx.storage(), 'clients/empresa-alpha/assets/anon.png');
    return uploadBytes(fileRef, smallData, { contentType: 'image/png' });
  });

  await expectFailure('Usuário com status PENDENTE_APROVACAO é BLOQUEADO ao tentar ler arquivos', async () => {
    const fileRef = ref(pendenteCtx.storage(), 'clients/empresa-alpha/assets/logo.png');
    return getBytes(fileRef);
  });

  await expectFailure('Usuário com status PENDENTE_APROVACAO é BLOQUEADO ao tentar enviar arquivos', async () => {
    const fileRef = ref(pendenteCtx.storage(), 'clients/empresa-alpha/assets/pendente.png');
    return uploadBytes(fileRef, smallData, { contentType: 'image/png' });
  });

  console.log('\n====================================================');
  console.log('RESUMO DA EXECUÇÃO DOS TESTES DO STORAGE');
  console.log('====================================================');
  console.log(`Total de testes: ${stats.total}`);
  console.log(`Sucessos: ${stats.passed} ✅`);
  console.log(`Falhas: ${stats.failed} ${stats.failed > 0 ? '❌' : '🎉'}\n`);

  await testEnv.cleanup();

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runStorageRulesTests().catch((err) => {
  console.error('Erro fatal nos testes do Storage:', err);
  process.exit(1);
});
