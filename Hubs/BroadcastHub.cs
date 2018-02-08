using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace SignalRTesting.Hubs {
    public class BroadcastHub: Hub
    {
        public override async Task OnConnectedAsync() 
        {
            await Clients.All.InvokeAsync("Receive", $"{Context.ConnectionId} joined");
        }

        public override async Task OnDisconnectedAsync(Exception ex) 
        {
            await Clients.All.InvokeAsync("Receive", $"{Context.ConnectionId} left");
        }

        public async Task Broadcast(string message)
        {
            await Clients.All.InvokeAsync("Receive", $"{Context.ConnectionId}: {message}");
        }
    }
}