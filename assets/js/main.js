/**
 * FAZENDA FREITAS E CUNHA — INTERATIVIDADE DO SITE
 * Silagem de Milho (25 kg) · Drone Agrícola · Pecuária · Arrendamento de Pasto
 * Povoado Conduru, área rural de Timon–MA
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavScroll();
  initCalculadora();
});

/* ─── MENU MOBILE ─── */
function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  const toggleBtn = document.querySelector('.menu-toggle');
  if (!navLinks) return;
  const isOpen = navLinks.classList.toggle('open');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', isOpen);
    toggleBtn.textContent = isOpen ? 'Fechar' : 'Menu';
  }
}

function closeMenu() {
  const navLinks = document.querySelector('.nav-links');
  const toggleBtn = document.querySelector('.menu-toggle');
  if (navLinks && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    if (toggleBtn) toggleBtn.textContent = 'Menu';
  }
}

/* ─── SCROLL REVEAL ─── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ─── NAVEGAÇÃO & SCROLL ACTIVE ─── */
function initNavScroll() {
  const header = document.querySelector('header.site-header') || document.querySelector('nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 40) {
        header.style.background = 'rgba(36, 20, 13, 0.98)';
        header.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.35)';
      } else {
        header.style.background = 'rgba(50, 27, 16, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.22)';
      }
    }

    // Link ativo
    let currentId = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ─── CALCULADORA DE SILAGEM (PESO CONFIRMADO: 25 KG) ─── */
// Consumo médio diário zootécnico de referência (kg/animal/dia)
const CONSUMO_BASE = {
  'corte': { nome: 'Bovino de Corte', mediaKg: 14, desc: 'Confinamento / Suplementação' },
  'leite': { nome: 'Bovino de Leite', mediaKg: 18, desc: 'Vacas em Lactação' },
  'ovinos': { nome: 'Ovinos & Caprinos', mediaKg: 2.5, desc: 'Matrizes / Cordeiros' },
  'equinos': { nome: 'Equinos / Tropa', mediaKg: 8, desc: 'Volumoso adaptado' }
};

const PESO_SACO_CONFIRMADO = 25; // Dado confirmado: 25 kg por saco

function initCalculadora() {
  const animalSelect = document.getElementById('calc-animal');
  const qtdInput = document.getElementById('calc-qtd');
  const diasInput = document.getElementById('calc-dias');

  if (!animalSelect || !qtdInput || !diasInput) return;

  const inputs = [animalSelect, qtdInput, diasInput];
  inputs.forEach((input) => {
    input.addEventListener('input', calcularSilagem);
    input.addEventListener('change', calcularSilagem);
  });

  calcularSilagem();
}

function setDiasPreset(dias) {
  const diasInput = document.getElementById('calc-dias');
  if (diasInput) {
    diasInput.value = dias;
    calcularSilagem();
  }
}

function calcularSilagem() {
  const animalSelect = document.getElementById('calc-animal');
  const qtdInput = document.getElementById('calc-qtd');
  const diasInput = document.getElementById('calc-dias');

  if (!animalSelect || !qtdInput || !diasInput) return;

  const tipo = animalSelect.value;
  const numAnimais = Math.max(1, parseInt(qtdInput.value, 10) || 1);
  const dias = Math.max(1, parseInt(diasInput.value, 10) || 1);
  const pesoSaco = PESO_SACO_CONFIRMADO;

  const infoAnimal = CONSUMO_BASE[tipo] || CONSUMO_BASE['corte'];
  const kgPorAnimalDia = infoAnimal.mediaKg;

  // Cálculos de consumo
  const consumoDiarioTotalKg = numAnimais * kgPorAnimalDia;
  const consumoPeriodoTotalKg = consumoDiarioTotalKg * dias;
  const sacosEstimados = Math.ceil(consumoPeriodoTotalKg / pesoSaco);
  const sacosComSeguranca = Math.ceil(sacosEstimados * 1.05); // +5% margem técnica de manejo

  // Atualizar interface
  const resAnimalNome = document.getElementById('res-animal-nome');
  const resDiario = document.getElementById('res-diario');
  const resPeriodo = document.getElementById('res-periodo');
  const resSacos = document.getElementById('res-sacos');
  const resSeguranca = document.getElementById('res-seguranca');

  if (resAnimalNome) {
    resAnimalNome.textContent = `${numAnimais} ${infoAnimal.nome}s por ${dias} dias`;
  }
  if (resDiario) {
    resDiario.textContent = `${consumoDiarioTotalKg.toLocaleString('pt-BR')} kg/dia`;
  }
  if (resPeriodo) {
    resPeriodo.textContent = `${consumoPeriodoTotalKg.toLocaleString('pt-BR')} kg`;
  }
  if (resSacos) {
    resSacos.textContent = `${sacosEstimados.toLocaleString('pt-BR')} sacos (${pesoSaco} kg)`;
  }
  if (resSeguranca) {
    resSeguranca.textContent = `${sacosComSeguranca.toLocaleString('pt-BR')} sacos`;
  }

  // Guardar no dataset para uso na transferência para o formulário
  const btnApply = document.getElementById('btn-aplicar-calc');
  if (btnApply) {
    btnApply.dataset.tipo = infoAnimal.nome;
    btnApply.dataset.animais = numAnimais;
    btnApply.dataset.dias = dias;
    btnApply.dataset.sacos = sacosEstimados;
    btnApply.dataset.pesoSaco = pesoSaco;
    btnApply.dataset.kgTotal = consumoPeriodoTotalKg;
  }
}

function aplicarCalculoNoFormulario() {
  const btnApply = document.getElementById('btn-aplicar-calc');
  if (!btnApply) return;

  const tipo = btnApply.dataset.tipo || 'Bovino de Corte';
  const animais = btnApply.dataset.animais || '25';
  const dias = btnApply.dataset.dias || '60';
  const sacos = btnApply.dataset.sacos || '840';
  const pesoSaco = btnApply.dataset.pesoSaco || '25';
  const kgTotal = btnApply.dataset.kgTotal || '21000';

  // Rolar até o formulário de contato
  const contatoSec = document.getElementById('contato');
  if (contatoSec) {
    contatoSec.scrollIntoView({ behavior: 'smooth' });
  }

  // Preencher campos
  const fInteresse = document.getElementById('f-interesse');
  if (fInteresse) {
    fInteresse.value = 'Silagem de Milho';
    atualizarFormInteresse();
  }

  const fQtd = document.getElementById('f-qtd');
  if (fQtd) {
    fQtd.value = 'calculado';
  }

  const fDuvida = document.getElementById('f-duvida');
  if (fDuvida) {
    fDuvida.value = `Estimativa da calculadora do site: ${sacos} sacos de ${pesoSaco} kg (${kgTotal} kg no total) para ${animais} ${tipo}(s) durante ${dias} dias.`;
    fDuvida.focus();
  }
}

/* ─── FAQ SANFONA ─── */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');

  // Fechar outras abas para manter a leitura limpa
  document.querySelectorAll('.faq-q').forEach((otherBtn) => {
    if (otherBtn !== btn) {
      otherBtn.classList.remove('open');
      if (otherBtn.nextElementSibling) {
        otherBtn.nextElementSibling.classList.remove('open');
      }
    }
  });

  btn.classList.toggle('open', !isOpen);
  if (answer) {
    answer.classList.toggle('open', !isOpen);
  }
}

/* ─── CONTROLE DINÂMICO DO FORMULÁRIO ─── */
function atualizarFormInteresse() {
  const selInteresse = document.getElementById('f-interesse');
  const grpRebanho = document.getElementById('grp-rebanho');
  const grpQtd = document.getElementById('grp-qtd');
  const lblDuvida = document.getElementById('lbl-duvida');
  const fDuvida = document.getElementById('f-duvida');

  if (!selInteresse) return;
  const val = selInteresse.value;

  if (val === 'Silagem de Milho') {
    if (grpRebanho) grpRebanho.style.display = 'block';
    if (grpQtd) grpQtd.style.display = 'block';
    if (lblDuvida) lblDuvida.textContent = 'Observações ou Local de Entrega';
    if (fDuvida) fDuvida.placeholder = 'Ex.: Preciso de cotação com frete para zona rural, retirada na sede ou destino...';
  } else if (val === 'Serviço com Drone Agrícola') {
    if (grpRebanho) grpRebanho.style.display = 'none';
    if (grpQtd) grpQtd.style.display = 'none';
    if (lblDuvida) lblDuvida.textContent = 'Área (Hectares) e Tipo de Aplicação *';
    if (fDuvida) fDuvida.placeholder = 'Ex.: Área de aproximadamente 40 hectares, aplicação de adubo foliar ou controle de daninhas...';
  } else if (val === 'Pecuária de Corte') {
    if (grpRebanho) grpRebanho.style.display = 'none';
    if (grpQtd) grpQtd.style.display = 'none';
    if (lblDuvida) lblDuvida.textContent = 'Interesse em Lotes / Bovinos *';
    if (fDuvida) fDuvida.placeholder = 'Ex.: Interesse em lotes de garrotes/bezerros para recria...';
  } else if (val === 'Arrendamento de Pasto') {
    if (grpRebanho) grpRebanho.style.display = 'none';
    if (grpQtd) grpQtd.style.display = 'none';
    if (lblDuvida) lblDuvida.textContent = 'Quantidade de Cabeças e Período *';
    if (fDuvida) fDuvida.placeholder = 'Ex.: Piquetes para aproximadamente 40 cabeças, pasto Mombaça ou Andropogon, período de 6 meses...';
  } else {
    if (grpRebanho) grpRebanho.style.display = 'none';
    if (grpQtd) grpQtd.style.display = 'none';
    if (lblDuvida) lblDuvida.textContent = 'Mensagem ou Proposta';
    if (fDuvida) fDuvida.placeholder = 'Digite aqui sua mensagem para a Fazenda Freitas e Cunha...';
  }
}

function selecionarServicoDrone() {
  const sel = document.getElementById('f-interesse');
  if (sel) {
    sel.value = 'Serviço com Drone Agrícola';
    atualizarFormInteresse();
  }
  const contato = document.getElementById('contato');
  if (contato) contato.scrollIntoView({ behavior: 'smooth' });
}

function selecionarServicoPecuaria() {
  const sel = document.getElementById('f-interesse');
  if (sel) {
    sel.value = 'Pecuária de Corte';
    atualizarFormInteresse();
  }
  const contato = document.getElementById('contato');
  if (contato) contato.scrollIntoView({ behavior: 'smooth' });
}

function selecionarServicoArrendamento() {
  const sel = document.getElementById('f-interesse');
  if (sel) {
    sel.value = 'Arrendamento de Pasto';
    atualizarFormInteresse();
  }
  const contato = document.getElementById('contato');
  if (contato) contato.scrollIntoView({ behavior: 'smooth' });
}

/* ─── FORMULÁRIO → WHATSAPP (MENSAGEM LIMPA E PROFISSIONAL) ─── */
function enviarWpp() {
  const interesseEl = document.getElementById('f-interesse');
  const interesse = interesseEl ? interesseEl.value : 'Silagem de Milho';
  const nome = document.getElementById('f-nome').value.trim();
  const cidade = document.getElementById('f-cidade').value.trim();
  const rebanho = document.getElementById('f-rebanho') ? document.getElementById('f-rebanho').value : '';
  const qtd = document.getElementById('f-qtd') ? document.getElementById('f-qtd').value : '';
  const duvida = document.getElementById('f-duvida') ? document.getElementById('f-duvida').value.trim() : '';

  if (!nome || !cidade) {
    alert('Por favor, informe seu nome e sua localidade.');
    return;
  }

  let msg = '';
  if (interesse === 'Serviço com Drone Agrícola') {
    msg = `Olá, Nilson!\n\n`;
    msg += `Gostaria de uma cotação para serviço de Drone Agrícola:\n\n`;
    msg += `Nome: ${nome}\n`;
    msg += `Localidade / Propriedade: ${cidade}\n`;
    if (duvida) msg += `Detalhes da Área / Operação: ${duvida}\n`;
    msg += `\nVi o site da fazenda e gostaria de verificar disponibilidade e valores para atendimento.`;
  } else if (interesse === 'Arrendamento de Pasto') {
    msg = `Olá, Nilson!\n\n`;
    msg += `Gostaria de informações sobre Arrendamento de Pasto (Mombaça / Andropogon):\n\n`;
    msg += `Nome: ${nome}\n`;
    msg += `Localidade / Propriedade: ${cidade}\n`;
    if (duvida) msg += `Quantidade de Animais / Período: ${duvida}\n`;
    msg += `\nVi o site da fazenda e gostaria de consultar a disponibilidade de piquetes e condições.`;
  } else if (interesse === 'Pecuária de Corte') {
    msg = `Olá, Nilson!\n\n`;
    msg += `Gostaria de informações sobre Pecuária de Corte:\n\n`;
    msg += `Nome: ${nome}\n`;
    msg += `Localidade / Propriedade: ${cidade}\n`;
    if (duvida) msg += `Detalhes do Interesse / Lote: ${duvida}\n`;
    msg += `\nVi o site da fazenda e gostaria de verificar disponibilidade e informações comerciais.`;
  } else {
    msg = `Olá, Nilson!\n\n`;
    msg += `Gostaria de um orçamento de Silagem de Milho Ensacada (sacos de 25 kg):\n\n`;
    msg += `Nome: ${nome}\n`;
    msg += `Localidade / Destino: ${cidade}\n`;
    if (rebanho) msg += `Tipo de criação: ${rebanho}\n`;
    if (qtd && qtd !== 'calculado') msg += `Volume desejado: ${qtd}\n`;
    if (duvida) msg += `Observações: ${duvida}\n`;
    msg += `\nVi o site da fazenda e gostaria de verificar disponibilidade e condições de fornecimento.`;
  }

  const phone = '5586988335570';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}
