# Getting Started with SignalR Core Preview 1

**TBD** SignalR is aweseome, blah blah

## Building the UI

**TBD** Global.json?

Let's start by building a simple UI for a simple chat app. First, create a new Razor pages application using `dotnet new`:

```
› dotnet new razor -au Individual --name SignalRTutorial
The template "ASP.NET Core Web App" was created successfully.
This template contains technologies from parties other than Microsoft, see https://aka.ms/template-3pn for details.

Processing post-creation actions...
Running 'dotnet restore' on SignalRTutorial/SignalRTutorial.csproj...
  Restoring packages for /Users/anurse/Code/anurse/SignalRTutorial/tutorial/code/SignalRTutorial/SignalRTutorial.csproj...
  Restoring packages for /Users/anurse/Code/anurse/SignalRTutorial/tutorial/code/SignalRTutorial/SignalRTutorial.csproj...
  Restore completed in 139.33 ms for /Users/anurse/Code/anurse/SignalRTutorial/tutorial/code/SignalRTutorial/SignalRTutorial.csproj.
  Restore completed in 621.09 ms for /Users/anurse/Code/anurse/SignalRTutorial/tutorial/code/SignalRTutorial/SignalRTutorial.csproj.
  Generating MSBuild file /Users/anurse/Code/anurse/SignalRTutorial/tutorial/code/SignalRTutorial/obj/SignalRTutorial.csproj.nuget.g.props.
  Generating MSBuild file /Users/anurse/Code/anurse/SignalRTutorial/tutorial/code/SignalRTutorial/obj/SignalRTutorial.csproj.nuget.g.targets.
  Restore completed in 1.72 sec for /Users/anurse/Code/anurse/SignalRTutorial/tutorial/code/SignalRTutorial/SignalRTutorial.csproj.

Restore succeeded.
```

Add a new page for the chat UI:

```
> cd SignalRTutorial/Pages
> dotnet new page --name Chat
The template "Razor Page" was created successfully.
```

You should now have `Pages/Chat.cshtml` and `Pages/Chat.cshtml.cs` files in your project. First, open `Pages/Chat.cshtml.cs`, change the namespace name to match your other page models and add the `Authorize` attribute to ensure only authenticated users can access the 

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SignalRTutorial.Pages
{
    [Authorize]
    public class ChatModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
```

Next, open `Pages/Chat.cshtml` and add some UI:

```html
@page
@model ChatModel
@{
}

<h1>Chat</h1>

<form id="send-form">
    Send a message: 
    <input type="text" id="message-textbox" disabled /> 
    <button id="send-button" type="submit" disabled>Send</button>
</form>

<ul id="messages-list">
</ul>
```

The UI we've added is fairly simple. We're going to use the ASP.NET Core Identity framework for authentication, which means the user will have a name when they get here. To try it out, use `dotnet run` to launch the site and Register as a new user. Then navigate to the `/Chat` endpoint, you should see the following UI:

![Chat UI](images/chat-ui.png)

## Writing the server code

In SignalR, you put server-side code in a "Hub". Hubs contain methods that the SignalR Client allows you to invoke from the browser, much like how an MVC controller has actions that are invoked by issuing HTTP requests. However, unlike an MVC Controller Action, SignalR allows the **server** to invoke methods on the **client** as well, allowing you to develop real-time applications that notify users of new content.

So, first, we need to build a hub. Back in the root of the project, create a `Hubs` directory and add a new file to that directory called `ChatHub.cs`:

```csharp
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SignalRTutorial.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.All.SendAsync("ReceiveAction", Context.User.Identity.Name, "joined");
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            await Clients.All.SendAsync("ReceiveAction", Context.User.Identity.Name, "left");
        }

        public async Task Send(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", $"{Context.User.Identity.Name}: {message}");
        }
    }
}
```

Let's go back over that code a little bit and look at what it does. First, we have a class inheriting from `Hub`, which is the base class required for all SignalR Hubs. We apply the `[Authorize]` attribute to it which restricts access to the Hub to registered users and ensures that `Context.User` is available for us in the Hub methods. Inside Hub methods, you can use the `Clients` property to access various collections of clients. We use the `.All` property, which gives us an object that can be used to send messages to every client connected to the Hub.

When a new client connects, the `OnConnectedAsync` method will be invoked. We override that method to Send the `ReceiveAction` message to every client, and provide two arguments: The name of the user, and the action that occurred (in this case, that they "joined" the chat session). We do the same for `OnDisconnectedAsync`, which is invoked when a client disconnects.

When a client invokes the `Send` method, we Send the `ReceiveMessage` message to every client, again providing two arguments: The name of the user sending the message and the message itself. Every client will receive this message, including the sending client itself.

To finish off the server-side, we need to add SignalR to our application. We do that in the `Startup.cs` file. First, in the `ConfigureServices` method, add the following to the end of that method to register the necessary SignalR services into the DI container:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ... MVC and other services ...

    services.AddSignalR();
}
```

Then, we need to put SignalR into the middleware pipeline, and give our `ChatHub` hub a URL that the client can reference. We do that by adding these lines to the **end** of the `Configure` method:

```csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    // ... other middleware ...

    app.UseSignalR(routes =>
    {
        routes.MapHub<ChatHub>("/chat");
    });
}
```

**NOTE**: You'll need to add a using directive for `SignalRTutorial.Hubs` in order to use `ChatHub` in your `MapHub` call.

## Building the client-side

Now that we have the server hub up and running, we need to add code to the `Chat.cshtml` page to use the client. First, however, we need to get the SignalR JavaScript client and add it to our application. There are many ways you can do this, such as using a bundling tool like Webpack, but here we're going to go with a fairly simple approach of copying and pasting ;).

First, create a `package.json` file to hold JavaScript dependencies for the application:

```
› npm init -y
Wrote to /Users/anurse/Code/anurse/SignalRTutorial/tutorial/code/SignalRTutorial/package.json:

{
  "name": "SignalRTutorial",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Then, install the SignalR client:

```
› npm i @aspnet/signalr
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN SignalRTutorial@1.0.0 No description
npm WARN SignalRTutorial@1.0.0 No repository field.

+ @aspnet/signalr@1.0.0-preview2-30113
added 1 package in 1.54s
```

You can find the version of the client designed for use in Browsers in `node_modules/@aspnet/signalr/dist/browser`. There are minified files there as well. For now, let's just copy the `signalr.js` file out of that directory and into `wwwroot/lib/signalr` in the project:

![SignalR JS Client in place](images/signalr-js-file.png)

Now, we can add JavaScript to our `Chat.cshtml` page to wire everything up. At the end of the file (after the closing `</ul>` tag), add the following:

```html
@section Scripts {
    <script src="/lib/signalr/signalr.js"></script>
    <script type="text/javascript">
        // Bind DOM elements
        var sendForm = document.getElementById("send-form");
        var messagesList = document.getElementById("messages-list");
        var messageTextBox = document.getElementById("message-textbox");

        var connection = new signalR.HubConnection("/chat");

        sendForm.addEventListener("submit", function() {
            var message = messageTextBox.value;
            messageTextBox.value = "";
            connection.send("Send", message);
        });

        connection.on("ReceiveMessage", function (sender, message) {
            messagesList.innerHTML += '<li>' + sender + ': ' + message + '</li>';
        });

        connection.on("ReceiveAction", function (sender, action) {
            messagesList.innerHTML += '<li>' + sender + ' ' + message + '</li>';
        });

        connection.start();
    </script>
}
```

We put our scripts in the `Scripts` Razor section, in order to ensure they end up at the very bottom of the Layout page. First, we load the `signalr.js` library we just copied in:

```html
<script src="/lib/signalr.js"></script>
```

Then, we add a script block for our own code. In that code, we create a new connection, connecting to the URL we specified back in the `Configure` method.

```javascript
var connection = new signalR.HubConnection("/chat");
```

At this point, the connection has not yet been opened. We need to call `connection.start()` to open the connection. However, before we do that we have some set-up to do.

First, let's wire up the "submit" handler for the `<form>`. When the "Send" button is pressed, this handler will be fired and we want to grab the content of the message text box and send the `Send` message to the server, passing the message as an argument (we also clear the text box so that the user can enter a new message):

```javascript
sendForm.addEventListener("submit", function() {
    var message = messageTextBox.value;
    messageTextBox.value = "";
    connection.send("Send", message);
});
```

Then, we wire up handlers for the `ReceiveAction` and `ReceiveMessage` messages (remember back in the Hub we use the `SendAsync` method to send those messages, so we need a handler on the client for them):

```javascript
connection.on("ReceiveMessage", function (sender, message) {
    messagesList.innerHTML += '<li>' + sender + ': ' + message + '</li>';
});

connection.on("ReceiveAction", function (sender, action) {
    messagesList.innerHTML += '<li>' + sender + ' ' + message + '</li>';
});
```

Finally, we start the connection:

```javascript
connection.start();
```

## Testing it out

With all that code in place, it should be ready to go. Use `dotnet run` to launch the app and give it a try! Then, use a Private Browsing window and log in as a different user. You should be able to chat back and forth between the browser windows.