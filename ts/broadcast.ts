/// <reference path="../node_modules/@aspnet/signalr/dist/esm/index.d.ts" />

// Bind DOM elements
const messagesList = document.getElementById("messages-list") as HTMLUListElement;
const messageTextBox = document.getElementById("message-textbox") as HTMLInputElement;
const sendButton = document.getElementById("send-button") as HTMLButtonElement;

(async function() {
    let connection = new signalR.HubConnection("/broadcast");

    sendButton.addEventListener("click", async () => {
        let message = messageTextBox.value;
        await connection.send("Broadcast", message);
    });

    connection.on("Receive", message => {
        messagesList.innerHTML += `<li>${message}</li>`
    });

    await connection.start();
})();
