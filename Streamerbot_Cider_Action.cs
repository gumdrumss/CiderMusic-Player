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
                // Add authentication header if token is provided
                if (!string.IsNullOrEmpty(apiToken))
                {
                    client.DefaultRequestHeaders.Add("apitoken", apiToken);
                }

                // Fetch now playing data from Cider
                var response = client.GetAsync(ciderApiUrl).Result;

                if (response.IsSuccessStatusCode)
                {
                    string jsonResponse = response.Content.ReadAsStringAsync().Result;
                    JObject songData = JObject.Parse(jsonResponse);

                    // Extract song details.
                    // Cider 2 returns the Apple Music API object for the track.
                    // We check common nested paths for maximum compatibility.
                    string name = songData["info"]?["name"]?.ToString() ??
                                 songData["attributes"]?["name"]?.ToString() ??
                                 songData["name"]?.ToString();

                    string artist = songData["info"]?["artistName"]?.ToString() ??
                                   songData["attributes"]?["artistName"]?.ToString() ??
                                   songData["artistName"]?.ToString();

                    string album = songData["info"]?["albumName"]?.ToString() ??
                                  songData["attributes"]?["albumName"]?.ToString() ??
                                  songData["albumName"]?.ToString();

                    if (!string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(artist))
                    {
                        string message = $"🎶 Now playing: {name} by {artist}";
                        if (!string.IsNullOrEmpty(album))
                        {
                            message += $" from the album {album}";
                        }
                        CPH.SendMessage(message);
                    }
                    else
                    {
                        CPH.SendMessage("🎧 No song is currently playing or Cider is idle.");
                    }
                }
                else if ((int)response.StatusCode == 401)
                {
                    CPH.SendMessage("⚠️ Cider API Authentication failed. Please check your API Token in the script.");
                }
                else
                {
                    CPH.SendMessage("❌ Could not reach Cider. Ensure it's open and the Web API is enabled in Settings.");
                }
            }
        }
        catch (Exception ex)
        {
            CPH.LogDebug($"Cider !song Error: {ex.Message}");
            CPH.SendMessage("⚠️ Error connecting to Cider. Is it running?");
        }

        return true;
    }
}
