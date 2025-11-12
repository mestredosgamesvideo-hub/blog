// ... (Seu código existente, incluindo as referências e variáveis:
// const loginForm, loginMessage, loginSection, commentsSection, logoutButton, successMessage, 
// let isLoggedIn, TEST_EMAIL, TEST_PASSWORD, showSuccessMessage, etc.)

// Duração do bloqueio em milissegundos (10 segundos)
const LOCKOUT_DURATION_MS = 10000; 

// Função auxiliar para bloquear o formulário
function lockLoginForm() {
    
    // 1. OCULTA O FORMULÁRIO INTEIRO (CAMPOS E BOTÃO)
    loginForm.style.display = 'none'; 
    
    // 2. Limpa classes de status e aplica a classe de bloqueio na mensagem
    loginMessage.classList.remove('login-success', 'login-error', 'hidden-message');
    loginMessage.classList.add('login-blocked'); // Torna a mensagem VISÍVEL e GRANDE!

    // 3. Define a mensagem de BLOQUEIO CLARA
    loginMessage.textContent = `
        🚫 ACESSO TEMPORARIAMENTE BLOQUEADO POR SEGURANÇA 🚫
        Você excedeu o limite de ${MAX_ATTEMPTS} tentativas incorretas.
        Aguarde ${LOCKOUT_DURATION_MS / 1000} segundos para tentar novamente.
        **O formulário de login reaparecerá automaticamente.**
    `;


    // 4. Desbloqueia após o tempo definido
    setTimeout(() => {
        failedAttempts = 0; // Reseta o contador
        
        // 5. MOSTRA O FORMULÁRIO NOVAMENTE
        loginForm.style.display = 'block';
        
        // 6. Reverte o estado da mensagem e a torna invisível
        loginMessage.classList.remove('login-blocked');
        loginMessage.classList.add('hidden-message'); 
        loginMessage.textContent = '';
        
        // *O botão de login e os campos já são reativados pela linha 5*

    }, LOCKOUT_DURATION_MS);
}


// Função auxiliar para bloquear o formulário
function lockLoginForm() {
    const loginButton = loginForm.querySelector('button[type="submit"]');
    
    // 1. Bloqueia o botão
    loginButton.disabled = true;
    loginButton.textContent = "Bloqueado por Segurança";
    loginButton.style.backgroundColor = "#6c757d"; 
    
    // 2. Limpa classes de status (success/error/hidden) e adiciona a classe de bloqueio
    loginMessage.classList.remove('login-success', 'login-error', 'hidden-message');
    loginMessage.classList.add('login-blocked'); 

    // 3. Define a mensagem de bloqueio
    loginMessage.textContent = `
        ❌ ACESSO BLOQUEADO POR SEGURANÇA ❌ 
        Você excedeu o limite de ${MAX_ATTEMPTS} tentativas de senha incorreta. 
        Tente novamente em ${LOCKOUT_DURATION_MS / 1000} segundos.
    `;


    // 4. Desbloqueia após o tempo definido
    setTimeout(() => {
        failedAttempts = 0; // Reseta o contador
        
        // Remove a classe de bloqueio e esconde a mensagem
        loginMessage.classList.remove('login-blocked');
        loginMessage.textContent = ''; // Limpa o texto
        // *Reaplica* a classe hidden-message após o timeout (para sumir)
        loginMessage.classList.add('hidden-message'); 
        
        // Reativa o botão
        loginButton.disabled = false;
        loginButton.textContent = "Entrar";
        loginButton.style.backgroundColor = "#28a745"; 
    }, LOCKOUT_DURATION_MS);
}

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // ... (restante do código: verificações, etc.)

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // AQUI ESTÁ O 'IF' QUE ESTAVA FALTANDO ANTES DO 'ELSE'
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
        // --- SUCESSO ---
        // ... (código de sucesso: isLoggedIn = true, etc.)
        
    } else { // <--- ESTE É O 'ELSE' QUE VOCÊ ME MOSTROU
        // --- FALHA ---
        failedAttempts++;
        
        if (failedAttempts < MAX_ATTEMPTS) {
            // Tentativas restantes
            const attemptsLeft = MAX_ATTEMPTS - failedAttempts;
            loginMessage.textContent = `E-mail ou senha incorretos. Você tem mais ${attemptsLeft} tentativa(s).`;
            // Remove bloqueio (se houver) e garante que a mensagem de erro normal aparece
            loginMessage.classList.remove('login-blocked', 'hidden-message');
            loginMessage.classList.add('login-error'); // Garante que a mensagem de erro normal aparece

        } else if (failedAttempts === MAX_ATTEMPTS) {
            // Última tentativa falha - Inicia o bloqueio
            lockLoginForm();
        }
    } 
});

// 5. Lógica de Login (COM LOGS DE DEBUG)
loginForm.addEventListener('submit'), function(event) {
    event.preventDefault();

    // Se já estiver bloqueado, ignora a tentativa de login (Este IF é a primeira barreira)
    if (failedAttempts >= MAX_ATTEMPTS) {
        console.log("DEBUG: Tentativa bloqueada. Aguardando timeout.");
        return; 
    }

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Limpa as mensagens anteriores
    loginMessage.classList.remove('login-success', 'login-error', 'login-blocked', 'hidden-message');

   // VERIFICAÇÃO DE SUCESSO
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
        // --- SUCESSO: NOVO COMPORTAMENTO DO WHATSAPP ---
        isLoggedIn = true;
        failedAttempts = 0; // Reseta o contador

        loginMessage.textContent = "Login bem-sucedido! Redirecionando para o WhatsApp...";
        loginMessage.classList.add('login-success');
        
        // 1. DEFINE A MENSAGEM E O NÚMERO
        const numeroWhatsApp = "55XX9ZZZZYYYY"; // ⬅️ TROQUE ISSO PELO NÚMERO CORRETO (55 + DDD + NÚMERO)
        const mensagemComentario = encodeURIComponent("Olá! Fiz o login e estou pronto para dar meu comentário sobre a sua página. Por favor, deixe seu comentário aqui:");

        // 2. CRIA O LINK
        const whatsappURL = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensagemComentario}`;

        // 3. REDIRECIONA APÓS 1 SEGUNDO
        setTimeout(() => {
            // Abre o link do WhatsApp em uma nova aba
            window.open(whatsappURL, '_blank'); 

            // Mantém o comportamento de mostrar a seção de comentários 
            // caso o usuário volte para a página.
            loginSection.style.display = 'none';
            commentsSection.style.display = 'block';
            logoutButton.style.display = 'block';
            
            // Limpa a mensagem de sucesso
            loginMessage.textContent = '';
            loginMessage.classList.add('hidden-message');

        }, 1000);
         
        
        } else {
    }
}
    // ... (o código de falha/bloqueio continua aqui)