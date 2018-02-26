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
