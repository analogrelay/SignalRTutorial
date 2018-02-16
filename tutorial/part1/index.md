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

You should now have `Pages/Chat.cshtml` and `Pages/Chat.cshtml.cs` files in your project. First, open `Pages/Chat.cshtml.cs` and change the namespace name to match your other page models:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SignalRTutorial.Pages
{
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

The UI we've added is fairly simple. We're going to use the ASP.NET Core Identity framework for authentication, which means the user will have a name when they get here.

![The Chat UI](images/chat-ui.png)