# Simple Getting Started Tutorial
(In outline form ;))

Prerequisites: NodeJS

0. Start with a Razor Pages app with Individual Auth.

1. Add a `Hubs` directory and create a `BroadcastHub` class in it:

```csharp
public class BroadcastHub: Hub
{
    public override async Task OnConnectedAsync() 
    {
        await Clients.All.SendAsync("Receive", $"{Context.ConnectionId} joined.");
    }

    public override async Task OnDisconnectedAsync(Exception ex) 
    {
        await Clients.All.SendAsync("Receive", $"{Context.ConnectionId} left.");
    }

    public async Task Broadcast(string message)
    {
        await Clients.All.SendAsync("Receive", $"{Context.ConnectionId}: {message}");
    }
}
```

2. Add SignalR to `Startup`:
    * `ConfigureServices`: `services.AddSignalR()`
    * `Configure`:

    ```csharp
    app.UseSignalR(routes =>
    {
        routes.MapHub<BroadcastHub>("/broadcast");
    });
    ```

3. Prepare an npm `package.json` for the project by running: `npm init -y` on the command line (in the project directory)

4. Install `@aspnet/signalr` using `npm install @aspnet/signalr --registry https://dotnet.myget.org/f/aspnetcore-dev/npm/`

5. Create directory `wwwroot/lib/signalr`

6. Copy content of `node_modules/@aspnet/signalr/dist/browser` into `wwwroot/lib/signalr`

7. Add `<script>` tags to the `Pages/_Layout.cshtml`, immediately **before** the `</body>` end-tag.

8. Create `tsconfig.json` in the project directory with the following content:

```json
{
  "compilerOptions": {
    "target": "es2015",
    "outDir": "wwwroot/js"
  },
  "include": [
    "./ts/**/*.ts"
  ]
}
```

9. Install typescript compiler with `npm install -D typescript` (`-D` marks it as a "devDependency", common practice for build/compilation tools in JavaScript projects)

10. Replace the `scripts` section in `package.json` with the following:

```json
  "scripts": {
    "build": "tsc --project ./tsconfig.json"
  },
```

11. Add `ts` folder to the project root

12. Add file `ts/broadcast.ts` with the following content:

```typescript
/// <reference path="../node_modules/@aspnet/signalr/dist/esm/index.d.ts" />

// Bind DOM elements
const messagesList = document.getElementById("messages-list") as HTMLUListElement;
const messageTextBox = document.getElementById("message-textbox") as HTMLInputElement;
const messageForm = document.getElementById("message-form") as HTMLFormElement;

(async function() {
    let connection = new signalR.HubConnection("/broadcast");

    messageForm.addEventListener("submit", async event => {
        event.preventDefault();
        await connection.send("Broadcast", messageTextBox.value);
    });
    
    connection.on("Receive", message => {
        messagesList.innerHTML += `<li>${message}</li>`
    });

    await connection.start();
})();
```

13. Replace the content of `About.cshtml` with the following:

```
@page
@model AboutModel
@{
    ViewData["Title"] = "About";
}
<h2>@ViewData["Title"]</h2>
<h3>@Model.Message</h3>

<p>SignalR Demo!</p>

<div>
    <form id="message-form">
        Message: <input type="text" id="message-textbox" /> <button>Broadcast</button>
    </form>
</div>

<ul id="messages-list"></ul>

@section Scripts {
    <script src="/lib/signalr/signalr.js"></script>
    <script src="/js/broadcast.js"></script>
}
```

14. Run `npm run build` from the project directory to compile the TypeScript

15. Run `dotnet run`

16. Open the About page

17. Type something and click Send, the message should appear in the list below, along with the connection ID

18. Copy-paste the URL and open another browser window at the same URL

19. Type something and click Send, the message should appear in **both** windows, along with a different connection ID
