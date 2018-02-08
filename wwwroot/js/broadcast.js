/// <reference path="../node_modules/@aspnet/signalr/dist/esm/index.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Bind DOM elements
const messagesList = document.getElementById("messages-list");
const messageTextBox = document.getElementById("message-textbox");
const sendButton = document.getElementById("send-button");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let connection = new signalR.HubConnection("/broadcast");
        sendButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            let message = messageTextBox.value;
            yield connection.send("Broadcast", message);
        }));
        connection.on("Receive", message => {
            messagesList.innerHTML += `<li>${message}</li>`;
        });
        yield connection.start();
    });
})();
