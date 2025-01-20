// ==UserScript==
// @name        Twitter Discreet Blocking
// @namespace   Violentmonkey Scripts
// @match       https://x.com/*
// @grant       none
// @version     1.0
// @author      Dayil
// @description Bloqueia usuários no Twitter apenas localmente (Oculta) com interface para adicionar/remover usuários e novo botão específico para perfis.
// @icon        https://cdn-icons-png.flaticon.com/512/5509/5509381.png?sz=64
// @license     MIT
// ==/UserScript==


(function() {
    const STORAGE_KEY = "blockedAccounts";
    const UPDATE_INTERVAL = 1000; // Intervalo de 5 segundos

    // Função para recuperar contas bloqueadas do localStorage
    function getBlockedAccounts() {
        let storedAccounts = localStorage.getItem(STORAGE_KEY);
        console.log('Contas bloqueadas carregadas:', storedAccounts);
        return storedAccounts ? JSON.parse(storedAccounts) : [];
        updateBlockedAccounts();
    }

    // Função para salvar contas bloqueadas no localStorage
    function saveBlockedAccounts(accounts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }

    // Função para adicionar uma conta à lista de bloqueios
    function addBlockedAccount(account) {
        let accounts = getBlockedAccounts();
        if (!accounts.includes(account)) {
            accounts.push(account);
            saveBlockedAccounts(accounts);
            hideTweets();
            updateBlockedAccounts();
        }
    }

    // Função para remover uma conta da lista de bloqueios
    function removeBlockedAccount(account) {
        let accounts = getBlockedAccounts();
        accounts = accounts.filter(a => a !== account);
        saveBlockedAccounts(accounts);
        hideTweets();
        updateBlockedAccounts();
    }

    // Função para ocultar tweets de contas bloqueadas
    function hideTweets() {
        let blockedAccounts = getBlockedAccounts();

        document.querySelectorAll('[data-testid="cellInnerDiv"]').forEach(tweet => {
            let tweetAuthor = tweet.querySelector('[data-testid="User-Name"] a')?.href.split("/").pop();
            let tweetReposter = tweet.querySelector('[data-testid="socialContext"] a')?.href.split("/").pop();
            if (blockedAccounts.includes(tweetAuthor) || blockedAccounts.includes(tweetReposter)) {
                tweet.style.display = "none";
            }
        });

        let profileUsername = window.location.pathname.split("/").filter(Boolean)[0];
        if (blockedAccounts.includes(profileUsername)) {
            document.querySelectorAll('[data-testid="tweet"]').forEach(tweet => {
                tweet.style.display = "none";
            });
        }
    }

    // Função para criar a interface de gerenciamento
    function createInterface() {
        let container = document.createElement("div");
        container.style.position = "fixed";
        container.style.bottom = "40px";
        container.style.left = "10px";
        container.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        container.style.border = "1px solid #ccc";
        container.style.padding = "10px";
        container.style.zIndex = 9999;
        container.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.3)";
        container.style.maxWidth = "200px";
        container.style.display = "none"; // Inicialmente oculto

        let title = document.createElement("h4");
        title.textContent = "Bloqueio Discreto";
        title.style.color = "#333";
        container.appendChild(title);

        let input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Adicionar usuário";
        input.style.width = "100%";
        input.style.marginBottom = "10px";
        input.style.border = "1px solid #ccc";
        input.style.borderRadius = "4px";
        input.style.padding = "5px";
        container.appendChild(input);

        let addButton = document.createElement("button");
        addButton.textContent = "Adicionar";
        addButton.style.width = "100%";
        addButton.style.backgroundColor = "#007bff"; // Azul
        addButton.style.color = "white";
        addButton.style.border = "none";
        addButton.style.borderRadius = "4px";
        addButton.onclick = () => {
            let account = input.value.trim();
            if (account) {
                addBlockedAccount(account);
                input.value = "";
                updateBlockedAccounts();
                renderBlockedAccounts();
            }
        };

        container.appendChild(addButton);
        let list = document.createElement("ul");
        list.style.listStyleType = "none";
        list.style.padding = "0";
        container.appendChild(list);

        function renderBlockedAccounts() {
            list.innerHTML = "";
            let blockedAccounts = getBlockedAccounts();
            blockedAccounts.forEach(account => {
                let listItem = document.createElement("li");
                listItem.textContent = account;
                listItem.style.display = "flex";
                listItem.style.justifyContent = "space-between";
                listItem.style.alignItems = "center";

                let removeButton = document.createElement("button");
                removeButton.textContent = "X";
                removeButton.style.marginLeft = "10px";
                removeButton.style.backgroundColor = "#dc3545"; // Vermelho
                removeButton.style.color = "white";
                removeButton.style.border = "none";
                removeButton.style.borderRadius = "4px";
                removeButton.onclick = () => {
                    removeBlockedAccount(account);
                };

                listItem.appendChild(removeButton);
                list.appendChild(listItem);
            });
        }

        function toggleContainer() {
            container.style.display = container.style.display === "none" ? "block" : "none";
        }

        let closeButton = document.createElement("button");
        closeButton.textContent = "Fechar";
        closeButton.style.width = "100%";
        closeButton.style.backgroundColor = "#dc3545"; // Vermelho
        closeButton.style.color = "white";
        closeButton.style.border = "none";
        closeButton.style.borderRadius = "4px";
        closeButton.onclick = () => {
            toggleContainer();
            updateButtonsVisibility();
            renderBlockedAccounts();
        };
        container.appendChild(closeButton);

        let toggleButton = document.createElement("button");
        toggleButton.style.position = "fixed";
        toggleButton.style.bottom = "40px";
        toggleButton.style.left = "10px";
        toggleButton.style.width = "30px";
        toggleButton.style.height = "30px";
        toggleButton.style.backgroundImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZmlsbD0ibm9uZSIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTguNDY0NTcgMTQuMTIxM0M4LjA3NDA0IDE0LjUxMTggOC4wNzQwNCAxNS4xNDUgOC40NjQ1NyAxNS41MzU1QzguODU1MDkgMTUuOTI2IDkuNDg4MjUgMTUuOTI2IDkuODc4NzggMTUuNTM1NUwxNS41MzU2IDkuODc4NjJDMTUuOTI2MiA5LjQ4ODEgMTUuOTI2MiA4Ljg1NDkzIDE1LjUzNTYgOC40NjQ0MUMxNS4xNDUxIDguMDczODggMTQuNTExOSA4LjA3Mzg4IDE0LjEyMTQgOC40NjQ0MUw4LjQ2NDU3IDE0LjEyMTNaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48cGF0aCBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02LjM0MzE1IDE3LjY1NjlDOS40NjczNCAyMC43ODEgMTQuNTMyNyAyMC43ODEgMTcuNjU2OSAxNy42NTY5QzIwLjc4MSAxNC41MzI3IDIwLjc4MSA5LjQ2NzM0IDE3LjY1NjkgNi4zNDMxNUMxNC41MzI3IDMuMjE4OTUgOS40NjczNCAzLjIxODk1IDYuMzQzMTUgNi4zNDMxNUMzLjIxODk1IDkuNDY3MzQgMy4yMTg5NSAxNC41MzI3IDYuMzQzMTUgMTcuNjU2OVpNMTYuMjQyNiAxNi4yNDI2QzEzLjg5OTUgMTguNTg1OCAxMC4xMDA1IDE4LjU4NTggNy43NTczNiAxNi4yNDI2QzUuNDE0MjEgMTMuODk5NSA1LjQxNDIxIDEwLjEwMDUgNy43NTczNiA3Ljc1NzM2QzEwLjEwMDUgNS40MTQyMSAxMy44OTk1IDUuNDE0MjEgMTYuMjQyNiA3Ljc1NzM2QzE4LjU4NTggMTAuMTAwNSAxOC41ODU4IDEzLjg5OTUgMTYuMjQyNiAxNi4yNDI2WiIgZmlsbD0iY3VycmVudENvbG9yIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')";
        toggleButton.style.backgroundSize = "cover";
        toggleButton.style.border = "none";
        toggleButton.style.borderRadius = "50%";
        toggleButton.style.cursor = "pointer";
        toggleButton.onclick = () => {
            toggleContainer();
            renderBlockedAccounts();
            updateButtonsVisibility();
        };

        document.body.appendChild(container);
        document.body.appendChild(toggleButton);
        console.log("Interface de gerenciamento criada");
    }

    // Função para criar o botão de perfil
    function createProfileButton() {
        let profileButton = document.createElement("button2");
        profileButton.style.position = "fixed";
        profileButton.style.bottom = "10px";
        profileButton.style.left = "10px";
        profileButton.style.width = "30px";
        profileButton.style.height = "30px";
        profileButton.style.backgroundImage = "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDggNDg7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGcgaWQ9IlBhZGRpbmdfX3gyNl9fQXJ0Ym9hcmQiLz48ZyBpZD0iSWNvbnMiPjxwYXRoIGQ9Ik0yNC4wMDAyNCwxMy41MjkzYy01Ljc3MzkzLDAtMTAuNDcxMTksNC42OTcyNy0xMC40NzExOSwxMC40NzA3czQuNjk3MjcsMTAuNDcwNywxMC40NzExOSwxMC40NzA3ICAgYzUuNzczNDQsMCwxMC40NzA3LTQuNjk3MjcsMTAuNDcwNy0xMC40NzA3UzI5Ljc3MzY4LDEzLjUyOTMsMjQuMDAwMjQsMTMuNTI5M3ogTTI3LjcxMzYyLDI1LjIyNDYxaC03LjQyNzI1ICAgYy0wLjY3NTI5LDAtMS4yMjUxLTAuNTQ4ODMtMS4yMjUxLTEuMjI0NjFzMC41NDk4LTEuMjI0NjEsMS4yMjUxLTEuMjI0NjFoNy40MjcyNWMwLjY3NTI5LDAsMS4yMjUxLDAuNTQ4ODMsMS4yMjUxLDEuMjI0NjEgICBTMjguMzg4OTIsMjUuMjI0NjEsMjcuNzEzNjIsMjUuMjI0NjF6IiBzdHlsZT0iZmlsbDojMzAzMDMwOyIvPjwvZz48L3N2Zz4=')";
        profileButton.style.backgroundSize = "contain";
        profileButton.style.backgroundRepeat = "no-repeat";
        profileButton.style.border = "none";
        profileButton.style.borderRadius = "50%";
        profileButton.style.zIndex = 10000;
        profileButton.title = "Adicionar/Remover perfil";
        profileButton.style.display = "none"; // Inicialmente oculto
        profileButton.style.cursor = "pointer";
        profileButton.onclick = () => {
            let profileUsername = window.location.pathname.split("/").filter(Boolean)[0];
            if (profileUsername) {
                let blockedAccounts = getBlockedAccounts();
                if (blockedAccounts.includes(profileUsername)) {
                    removeBlockedAccount(profileUsername);
                } else {
                    addBlockedAccount(profileUsername);
                }
            }
            updateButtonsVisibility();
            updateBlockedAccounts();
        };

        document.body.appendChild(profileButton);
        console.log("Botão de perfil criado");
    }

    // Função para atualizar a visibilidade dos botões
    function updateButtonsVisibility() {
        let profileButton = document.querySelector("[title='Adicionar/Remover perfil']");
        let isProfilePage = window.location.pathname.split("/").length > 1 && window.location.pathname.split("/")[1] !== "home";
        if (profileButton) {
            profileButton.style.display = isProfilePage ? "block" : "none";
        }
    }

    // Função para atualizar a interface e ocultar tweets
    function updateBlockedAccounts() {
        hideTweets();
        if (document.querySelector("div[style*='fixed']")) {
            let container = document.querySelector("div[style*='fixed']");
            renderBlockedAccounts(); // Atualiza a lista de contas bloqueadas na interface
        }
    }

    // Função para iniciar o monitoramento e atualização periódica
    function startMonitoring() {
        setInterval(() => {
            updateButtonsVisibility();
            updateBlockedAccounts();
        }, UPDATE_INTERVAL);
    }

    // Função para renderizar as contas bloqueadas na interface
    function renderBlockedAccounts() {
        let container = document.querySelector("div[style*='fixed']");
        if (!container) return;

        let list = container.querySelector("ul");
        list.innerHTML = "";
        let blockedAccounts = getBlockedAccounts();
        blockedAccounts.forEach(account => {
            let listItem = document.createElement("li");
            listItem.textContent = account;
            listItem.style.display = "flex";
            listItem.style.justifyContent = "space-between";
            listItem.style.alignItems = "center";

            let removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.style.marginLeft = "10px";
            removeButton.style.backgroundColor = "#dc3545"; // Vermelho
            removeButton.style.color = "white";
            removeButton.style.border = "none";
            removeButton.style.borderRadius = "4px";
            removeButton.onclick = () => {
                removeBlockedAccount(account);
                updateBlockedAccounts();
            };

            listItem.appendChild(removeButton);
            list.appendChild(listItem);
        });
    }

    // Função de inicialização
    function init() {
        hideTweets();
        createInterface();
        createProfileButton();
        startMonitoring();
    }

    // Executa a inicialização após o carregamento da página
    window.addEventListener('load', init);

    // Observadores de mudanças no DOM
    let mObserver = new MutationObserver(hideTweets);
    mObserver.observe(document.body, { subtree: true, childList: true, characterData: true });

    let urlObserver = new MutationObserver(updateButtonsVisibility);
    urlObserver.observe(document.body, { childList: true, subtree: true });
})();
