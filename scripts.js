// Fetch Discord status from Lanyard API
const DISCORD_USER_ID = '1178712273901068374';
const LANYARD_API = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;

async function fetchDiscordStatus() {
    try {
        const response = await fetch(LANYARD_API);
        const data = await response.json();

        if (data.success) {
            // Set avatar
            const avatarHash = data.data.discord_user.avatar;
            const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${avatarHash}.png`;
            document.getElementById('discordAvatar').src = avatarUrl;

            // Set status indicator
            const status = data.data.discord_status;
            const statusIndicator = document.getElementById('statusIndicator');
            statusIndicator.className = `status-indicator ${status}`;
        }
    } catch (error) {
        console.error('Error fetching Discord status:', error);
    }
}

// Fetch status on page load
fetchDiscordStatus();

// Update status every 30 seconds
setInterval(fetchDiscordStatus, 30000);
