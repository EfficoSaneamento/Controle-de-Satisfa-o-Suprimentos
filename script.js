const scriptURL = 'https://script.google.com/macros/s/AKfycbyLmxmMRklwvbHs-qw9vCjqj6TwFCaVovPf7mFtj4VGfIlCCUsnTCgGRxzTqOLs3vPdRw/exec';

const perguntas = [
    { titulo: "Satisfação Geral", texto: "De forma geral, qual é seu nível de satisfação com os serviços prestados pela área de Suprimentos?", nome: "avaliacao_geral" },
    { titulo: "Disponibilidade da equipe", texto: "Como você avalia a disponibilidade, quando você precisa suporte ou esclarecimento?", nome: "disponibilidade"},
    { titulo: "Postura profissional", texto:"Como você avalia a cordialidade e o profissionalismo da equipe de Suprimentos?", nome:"postura"},
    { titulo: "Cumprimento de prazos", texto:"A área de Suprimentos cumpre os prazos acordados para compras e contratações?", nome: "prazo"},
    { titulo: "Conformidade com a solicitação", texto: "Os itens ou serviços entregues correspondem exatamente ao que foi solicitado ?", nome: "conformidade"},
    { titulo: "Qualidade dos fornecedores", texto: "Como você avalia a qualidade dos fornecedores homologados pela área de Suprimentos?", nome: "qualidade" },
    { titulo: "Resolução de problemas", texto: "Quando ocorre algum problema com produtos ou serviços, a área de Suprimentos atua de forma eficaz para solucioná-lo", nome: "resolucao" },
    { titulo: "Custo-benefício", texto: "As soluções apresentadas pela área de Suprimentos oferecem bom custo-benefício?", nome:"custo"},
    { titulo: "Apoio ao negócio",texto : "A área de Suprimentos contribui de forma positiva para os resultados da sua área/departamento?", nome: "apoio"},
    { titulo: "Proativiade", texto: "A área de Suprimentos propõe melhorias, alternativas ou soluções além do solicitado?", nome: "proatividade"}
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