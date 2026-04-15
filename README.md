Taking inspiration from [nuttylmao](https://nutty.gg/en-cad/products/apple-music-widget) and [ryzetech Cider Music Widget](https://github.com/ryzetech/cider4obs.git), I developed a Music Player Widget for Apple Music users who wish to display their music on stream. I took a bit of an inspiration from the Apple Music Player UI also and developed the look with the help of JulesAI. Please note, this was just a side project I did for myself and am not looking to profit from it in any manner.


**THIS APP REQUIRES CIDER(PREFERABLY V2+, which costs US$3.49.**
**Get Cider here:
https://cidercollective.itch.io/cider**

Here's a preview of how the player will look once you import and get it working properly:
<img width="545" height="723" alt="Screenshot" src="https://github.com/user-attachments/assets/6a566f05-863c-4af5-9ec8-5e2b7db8d034" />






Instructions on how to use this Widget:

1. Download and Extract the ZIP file where you'd want to save it locally in your system.
2. Create a new Browser Source in OBS and right above URL select Local File
   ![image](https://github.com/user-attachments/assets/07b41566-8b26-4637-90d7-fec58ab12963)
3.Locate the downloaded folder and select index.html
4. Position and place it how you'd like to place it on stream.

## Streamer.bot Integration (!song command)

You can also set up a chat command (like `!song`) to display what you're currently listening to in your Twitch/YouTube chat using Streamer.bot.

### Setup Instructions:

1. **Enable Cider API:**
   - Open Cider and go to **Settings > Connectivity**.
   - Ensure the **Web API** is enabled.
   - If you want to use authentication, click **Manage External Application Access** to generate an API Token.

2. **Create Action in Streamer.bot:**
   - Open Streamer.bot and go to the **Actions** tab.
   - Right-click and select **Add**. Name it `Cider Now Playing`.
   - In the **Sub-Actions** pane, right-click and select **Core > C# > Execute C# Code**.

3. **Add the C# Code & References:**
   - Open the `Streamerbot_Cider_Action.cs` file from this repository and copy its entire content.
   - In the Streamer.bot C# editor, delete any existing code and paste the content you copied.
   - **References:** Click on the **References** tab in the C# editor.
     - Right-click in the list and select **Add reference from file...**
     - Search for and add `System.Net.Http.dll` (usually found in the Streamer.bot folder or Windows GAC).
     - Also ensure `Newtonsoft.Json.dll` is present in the references (it is usually added by default or can be found in the Streamer.bot folder).
   - **Authentication (Optional):** If you enabled authentication in Cider, find the line `string apiToken = "";` and enter your token between the quotes.
   - Click **Save and Compile**. You should see "Compiled successfully!" at the bottom.

4. **Create the Chat Command:**
   - Go to the **Commands** tab in Streamer.bot.
   - Right-click and select **Add**.
   - Set the command to `!song` (or whatever you prefer).
   - Set the **Action** to `Cider Now Playing`.
   - Click **OK**.

Now, when someone types `!song` in your chat, Streamer.bot will fetch the song info from Cider and post it to chat!


