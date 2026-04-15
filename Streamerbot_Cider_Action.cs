using System;
using System.Net.Http;
using Newtonsoft.Json.Linq;

public class CPHInline
{
    public bool Execute()
    {
        // Default Cider API URL
        string ciderApiUrl = "http://localhost:10767/api/v1/playback/now-playing";

        // If you have authentication enabled in Cider (Settings > Connectivity),
        // enter your API Token here.
        string apiToken = "";

        try
        {
            using (HttpClient client = new HttpClient())
            {
                if (!string.IsNullOrEmpty(apiToken))
                {
                    client.DefaultRequestHeaders.Add("apitoken", apiToken);
                }

                var response = client.GetAsync(ciderApiUrl).Result;

                if (response.IsSuccessStatusCode)
                {
                    string jsonResponse = response.Content.ReadAsStringAsync().Result;
                    JObject songData = JObject.Parse(jsonResponse);

                    // Extract song details
                    string name = songData["info"]?["name"]?.ToString() ??
                                 songData["attributes"]?["name"]?.ToString() ??
                                 songData["name"]?.ToString();

                    string artist = songData["info"]?["artistName"]?.ToString() ??
                                   songData["attributes"]?["artistName"]?.ToString() ??
                                   songData["artistName"]?.ToString();

                    string album = songData["info"]?["albumName"]?.ToString() ??
                                  songData["attributes"]?["albumName"]?.ToString() ??
                                  songData["albumName"]?.ToString();

                    // Unique identifier for the song (prefer ID, fallback to Title+Artist)
                    string songId = songData["info"]?["id"]?.ToString() ??
                                   songData["id"]?.ToString() ??
                                   $"{name}_{artist}";

                    if (!string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(artist))
                    {
                        // Check if this was triggered by a command (!song)
                        // Note: Some versions of Streamer.bot might use different keys, checking both
                        bool isManual = args.ContainsKey("command") || args.ContainsKey("commandId") || args.ContainsKey("userInput");

                        // Get the last played song ID from global variables
                        string lastSongId = CPH.GetGlobalVar<string>("lastCiderSongId", true);

                        CPH.LogInfo($"[Cider] Current: {name} ({songId}) | Last: {lastSongId} | Manual: {isManual}");

                        if (isManual || songId != lastSongId)
                        {
                            // It's a new song or a manual request
                            string message = $"🎶 {name} by {artist} is playing";
                            if (!string.IsNullOrEmpty(album))
                            {
                                message += $" (Album: {album})";
                            }

                            CPH.SendMessage(message);
                            CPH.LogInfo($"[Cider] Announced: {message}");

                            // Update the last played song ID
                            CPH.SetGlobalVar("lastCiderSongId", songId, true);
                        }
                    }
                    else
                    {
                        CPH.LogInfo("[Cider] Received empty song data - possibly idle or transitioning.");
                    }
                }
                else
                {
                    CPH.LogInfo($"[Cider] API Error: {response.StatusCode}");
                }
            }
        }
        catch (Exception ex)
        {
            CPH.LogDebug($"[Cider] Exception: {ex.Message}");
        }

        return true;
    }
}
