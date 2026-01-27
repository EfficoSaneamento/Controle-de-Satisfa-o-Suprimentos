const scriptURL = 'https://script.google.com/macros/s/AKfycbxzcVo3NlvBc_8HKNMz0yJZZJbhjoOFaDA5v50TYwcAo5QOlmo4hPHnsCBwku8GgHlW8A/exec';

const perguntas = [
    { titulo: "Atendimento da Equipe", texto: "Como você avalia a presteza e clareza da equipe de Suprimentos ao tirar dúvidas sobre suas solicitações?", nome: "avaliacao_geral" },
    { titulo: "Agilidade no Processo", texto: "Como você avalia o tempo de resposta entre a abertura da requisição e a efetivação da compra?", nome: "ambiente" },
    { titulo: "Qualidade dos Produtos/Serviços", texto: "De forma geral, os itens ou serviços entregues pelos fornecedores atendem às especificações solicitadas?", nome: "limpeza" },
];

const legendas = ["Muito Insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito Satisfeito"];
const container = document.getElementById('containerPerguntas');

// Renderização das perguntas
perguntas.forEach(p => {
    const div = document.createElement('div');
    div.className = "space-y-3";
    div.innerHTML = `
        <div class="border-l-4 border-[#687b58] pl-3">
            <h3 class="text-md font-bold text-slate-800">${p.titulo}</h3>
            <p class="text-xs text-slate-500">${p.texto}</p>
        </div>
        <div class="flex justify-between gap-1 sm:gap-2">
            ${[1, 2, 3, 4, 5].map((n, i) => `
                <div class="flex-1 text-center">
                    <input type="radio" name="${p.nome}" id="${p.nome}_${n}" value="${n}" class="hidden radio-card" required onchange="toggleJustificativa('${p.nome}', ${n})">
                    <label for="${p.nome}_${n}" class="radio-label flex flex-col items-center justify-center py-3 px-1 border border-slate-200 rounded-lg cursor-pointer transition-all h-20 sm:h-24">
                        <span class="text-lg font-bold">${n}</span>
                        <span class="text-xxs uppercase mt-1 leading-tight text-center px-1">${legendas[i]}</span>
                    </label>
                </div>
            `).join('')}
        </div>
        <div id="box_just_${p.nome}" class="hidden mt-3 animate-in fade-in duration-300">
            <textarea name="just_${p.nome}" id="input_just_${p.nome}" 
                placeholder="Por favor, conte-nos o motivo da nota baixa para ${p.titulo.toLowerCase()}..."
                class="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm italic outline-none focus:ring-1 focus:ring-orange-400"
                rows="2"></textarea>
        </div>
    `;
    container.appendChild(div);
});

// Função para mostrar/esconder justificativa
function toggleJustificativa(nome, nota) {
    const box = document.getElementById(`box_just_${nome}`);
    const input = document.getElementById(`input_just_${nome}`);
    
    if (nota <= 2) {
        box.classList.remove('hidden');
        input.required = true; // Torna o campo obrigatório no HTML
    } else {
        box.classList.add('hidden');
        input.required = false;
        input.value = ""; // Limpa se o usuário mudar de ideia para nota alta
    }
}

// Manipulação do envio do formulário
document.getElementById('formPesquisa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnEnviar');
    const formData = new FormData(e.target);
    const dados = Object.fromEntries(formData.entries());

    // Validação extra de segurança para Justificativas
    let pendente = false;
    perguntas.forEach(p => {
        const nota = parseInt(dados[p.nome]);
        const justificativa = dados[`just_${p.nome}`];
        if (nota <= 2 && (!justificativa || justificativa.trim().length < 3)) {
            pendente = true;
        }
    });

    if (pendente) {
        alert("⚠️ Por favor, justifique as notas baixas (mínimo 3 caracteres).");
        return;
    }

    // Feedback visual de carregamento
    btn.disabled = true;
    btn.innerText = "ENVIANDO...";

    try {
        // O envio para Google Script funciona melhor como POST sem CORS
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Sucesso (No modo no-cors não conseguimos ler a resposta, então seguimos para o redirect)
        window.location.href = "agradecimento.html";

    } catch (err) {
        console.error("Erro no envio:", err);
        alert("❌ Erro ao enviar os dados. Verifique sua conexão e tente novamente.");
        btn.disabled = false;
        btn.innerText = "ENVIAR AVALIAÇÃO";
    }
});