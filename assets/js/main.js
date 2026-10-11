/**
 * FAZENDA FREITAS E CUNHA — INTERATIVIDADE DO SITE
 * Silagem de Milho · Piauí
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
  const isOpen = navLinks.classList.toggle('open');
  toggleBtn.setAttribute('aria-expanded', isOpen);
  toggleBtn.innerHTML = isOpen ? '✕' : '☰';
}

function closeMenu() {
  const navLinks = document.querySelector('.nav-links');
  const toggleBtn = document.querySelector('.menu-toggle');
  if (navLinks && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    if (toggleBtn) toggleBtn.innerHTML = '☰';
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
    { threshold: 0.12 }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ─── NAVEGAÇÃO & SCROLL ACTIVE ─── */
function initNavScroll() {
  const nav = document.querySelector('nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    // Fundo da barra
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(16, 40, 16, 0.98)';
      nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.35)';
    } else {
      nav.style.background = 'rgba(20, 48, 20, 0.97)';
      nav.style.boxShadow = 'none';
    }

    // Link ativo
    let currentId = '';
    const scrollPos = window.scrollY + 200;

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

/* ─── CALCULADORA DE SILAGEM ─── */
// Consumo médio diário recomendado de silagem (kg/animal/dia)
const CONSUMO_BASE = {
  'leite': { nome: 'Bovino de Leite', mediaKg: 18, desc: '~16 a 22 kg/dia (alta produção)' },
  'corte': { nome: 'Bovino de Corte', mediaKg: 14, desc: '~12 a 16 kg/dia (confinamento/suplementação)' },
  'ovinos': { nome: 'Ovinos & Caprinos', mediaKg: 2.5, desc: '~2 a 3 kg/dia' },
  'equinos': { nome: 'Equinos / Tropa', mediaKg: 8, desc: '~6 a 10 kg/dia (volumoso adaptado)' }
};

function initCalculadora() {
  const animalSelect = document.getElementById('calc-animal');
  const qtdInput = document.getElementById('calc-qtd');
  const diasInput = document.getElementById('calc-dias');
  const pesoSacoSelect = document.getElementById('calc-peso-saco');

  if (!animalSelect || !qtdInput || !diasInput) return;

  const inputs = [animalSelect, qtdInput, diasInput, pesoSacoSelect];
  inputs.forEach((input) => {
    if (input) {
      input.addEventListener('input', calcularSilagem);
      input.addEventListener('change', calcularSilagem);
    }
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
  const pesoSacoSelect = document.getElementById('calc-peso-saco');

  const tipo = animalSelect.value;
  const numAnimais = Math.max(1, parseInt(qtdInput.value, 10) || 1);
  const dias = Math.max(1, parseInt(diasInput.value, 10) || 1);
  const pesoSaco = parseInt(pesoSacoSelect.value, 10) || 30;

  const infoAnimal = CONSUMO_BASE[tipo] || CONSUMO_BASE['corte'];
  const kgPorAnimalDia = infoAnimal.mediaKg;

  // Cálculos
  const consumoDiarioTotalKg = numAnimais * kgPorAnimalDia;
  const consumoPeriodoTotalKg = consumoDiarioTotalKg * dias;
  const sacosEstimados = Math.ceil(consumoPeriodoTotalKg / pesoSaco);
  const sacosComSeguranca = Math.ceil(sacosEstimados * 1.05); // +5% de margem recomendada de manejo

  // Atualizar visualização
  const elDiario = document.getElementById('res-diario');
  const elPeriodo = document.getElementById('res-periodo');
  const elSacos = document.getElementById('res-sacos');
  const elSacosSeguranca = document.getElementById('res-seguranca');
  const elAnimalNome = document.getElementById('res-animal-nome');

  if (elDiario) elDiario.innerText = `${consumoDiarioTotalKg.toLocaleString('pt-BR')} kg/dia`;
  if (elPeriodo) elPeriodo.innerText = `${consumoPeriodoTotalKg.toLocaleString('pt-BR')} kg`;
  if (elSacos) elSacos.innerText = `${sacosEstimados.toLocaleString('pt-BR')} sacos`;
  if (elSacosSeguranca) elSacosSeguranca.innerText = `${sacosComSeguranca.toLocaleString('pt-BR')} sacos`;
  if (elAnimalNome) elAnimalNome.innerText = `${numAnimais} ${infoAnimal.nome} por ${dias} dias`;

  // Guardar no dataset para uso no envio de WhatsApp
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

  const tipo = btnApply.dataset.tipo || 'Bovinos';
  const animais = btnApply.dataset.animais || '1';
  const dias = btnApply.dataset.dias || '30';
  const sacos = btnApply.dataset.sacos || '100';
  const pesoSaco = btnApply.dataset.pesoSaco || '30';
  const kgTotal = btnApply.dataset.kgTotal || '3000';

  // Rolar até o formulário
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
  const fDuvida = document.getElementById('f-duvida');

  if (fQtd) {
    // Tentar selecionar opção aproximada ou preencher
    fQtd.value = 'calculado';
  }

  if (fDuvida) {
    fDuvida.value = `Calculado no site: ${sacos} sacos de ${pesoSaco}kg (${kgTotal} kg no total) para ${animais} ${tipo} por ${dias} dias.`;
    fDuvida.focus();
  }
}

/* ─── FAQ SANFONA ─── */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');

  // Fechar outros para manter limpo (opcional e elegante)
  document.querySelectorAll('.faq-q').forEach((otherBtn) => {
    if (otherBtn !== btn) {
      otherBtn.classList.remove('open');
      if (otherBtn.nextElementSibling) {
        otherBtn.nextElementSibling.classList.remove('open');
      }
    }
  });

  btn.classList.toggle('open', !isOpen);
  answer.classList.toggle('open', !isOpen);
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
    if (lblDuvida) lblDuvida.innerText = 'Observações ou Dúvidas de Entrega';
    if (fDuvida) fDuvida.placeholder = 'Ex.: Preciso de cotação com frete para zona rural, cerca de 30km da cidade...';
  } else if (val === 'Pulverização com Drone Agrícola') {
    if (grpRebanho) grpRebanho.style.display = 'none';
    if (grpQtd) grpQtd.style.display = 'none';
    if (lblDuvida) lblDuvida.innerText = 'Área (Hectares) & Detalhes da Lavoura/Pastagem *';
    if (fDuvida) fDuvida.placeholder = 'Ex.: Área de ~40 hectares de milho/pasto, aplicação de adubo foliar e herbicida...';
  } else if (val === 'Pecuária de Corte') {
    if (grpRebanho) grpRebanho.style.display = 'none';
    if (grpQtd) grpQtd.style.display = 'none';
    if (lblDuvida) lblDuvida.innerText = 'Especificações do Lote / Interesse *';
    if (fDuvida) fDuvida.placeholder = 'Ex.: Tenho interesse em lote de bezerros/garrotes para recria e confinamento...';
  } else if (val === 'Arrendamento de Pastagem') {
    if (grpRebanho) grpRebanho.style.display = 'none';
    if (grpQtd) grpQtd.style.display = 'none';
    if (lblDuvida) lblDuvida.innerText = 'Quantidade de Cabeças & Período Desejado *';
    if (fDuvida) fDuvida.placeholder = 'Ex.: Piquetes para aproximadamente 40 a 60 cabeças de gado, pasto Mombaça/Andropogon, período de 6 meses...';
  } else {
    if (grpRebanho) grpRebanho.style.display = 'none';
    if (grpQtd) grpQtd.style.display = 'none';
    if (lblDuvida) lblDuvida.innerText = 'Mensagem / Proposta';
    if (fDuvida) fDuvida.placeholder = 'Digite aqui sua mensagem ou proposta para a Fazenda Freitas e Cunha...';
  }
}

function selecionarServicoDrone() {
  const sel = document.getElementById('f-interesse');
  if (sel) {
    sel.value = 'Pulverização com Drone Agrícola';
    atualizarFormInteresse();
  }
}

function selecionarServicoPecuaria() {
  const sel = document.getElementById('f-interesse');
  if (sel) {
    sel.value = 'Pecuária de Corte';
    atualizarFormInteresse();
  }
}

function selecionarServicoArrendamento() {
  const sel = document.getElementById('f-interesse');
  if (sel) {
    sel.value = 'Arrendamento de Pastagem';
    atualizarFormInteresse();
  }
}

/* ─── FORMULÁRIO → WHATSAPP ─── */
function enviarWpp() {
  const interesseEl = document.getElementById('f-interesse');
  const interesse = interesseEl ? interesseEl.value : 'Silagem de Milho';
  const nome = document.getElementById('f-nome').value.trim();
  const cidade = document.getElementById('f-cidade').value.trim();
  const rebanho = document.getElementById('f-rebanho') ? document.getElementById('f-rebanho').value : '';
  const qtd = document.getElementById('f-qtd') ? document.getElementById('f-qtd').value : '';
  const duvida = document.getElementById('f-duvida') ? document.getElementById('f-duvida').value.trim() : '';

  if (!nome || !cidade) {
    alert('Por favor, preencha pelo menos o seu nome e sua cidade.');
    return;
  }

  let msg = '';
  if (interesse === 'Pulverização com Drone Agrícola') {
    msg = `Olá, Fazenda Freitas e Cunha! (A/C Nilson Cunha) 🛸\n\n`;
    msg += `Gostaria de uma cotação para *serviço de Drone Agrícola*:\n\n`;
    msg += `*Nome:* ${nome}\n`;
    msg += `*Cidade / Propriedade:* ${cidade}\n`;
    if (duvida) msg += `*Detalhes da Área / Lavoura:* ${duvida}\n`;
    msg += `\nVi a página oficial e gostaria de mais detalhes sobre valores e disponibilidade de atendimento. Obrigado!`;
  } else if (interesse === 'Arrendamento de Pastagem') {
    msg = `Olá, Fazenda Freitas e Cunha! (A/C Nilson Cunha) 🌾\n\n`;
    msg += `Gostaria de informações sobre *Arrendamento de Pasto (Mombaça / Andropogon)*:\n\n`;
    msg += `*Nome:* ${nome}\n`;
    msg += `*Cidade / Propriedade:* ${cidade}\n`;
    if (duvida) msg += `*Detalhes / Quantidade de Cabeças:* ${duvida}\n`;
    msg += `\nVi a página oficial e gostaria de consultar a disponibilidade de piquetes e condições. Obrigado!`;
  } else if (interesse === 'Pecuária de Corte') {
    msg = `Olá, Fazenda Freitas e Cunha! 🐂\n\n`;
    msg += `Gostaria de informações sobre *Pecuária de Corte / Bovinos*:\n\n`;
    msg += `*Nome:* ${nome}\n`;
    msg += `*Cidade / Propriedade:* ${cidade}\n`;
    if (duvida) msg += `*Detalhes do Lote / Interesse:* ${duvida}\n`;
    msg += `\nVi o site e gostaria de verificar disponibilidade e informações comerciais. Obrigado!`;
  } else {
    msg = `Olá, Fazenda Freitas e Cunha! 🌽\n\n`;
    msg += `Gostaria de um orçamento de *Silagem de Milho Ensacada*:\n\n`;
    msg += `*Nome:* ${nome}\n`;
    msg += `*Cidade / Destino:* ${cidade}\n`;
    if (rebanho) msg += `*Tipo de criação:* ${rebanho}\n`;
    if (qtd && qtd !== 'calculado') msg += `*Volume desejado:* ${qtd}\n`;
    if (duvida) msg += `*Detalhes / Dúvidas:* ${duvida}\n`;
    msg += `\nVi o site e gostaria de verificar disponibilidade e valores com frete para minha localidade. Obrigado!`;
  }

  const phone = '5586988335570';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

