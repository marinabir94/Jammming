let token;
let expiresIn;
const clientID = "ea39a7e792e348418109492c88c8e91d";
const redirectURI = "http://marinabir94.surge.sh";
let accessToken = Spotify.getAccessToken();
const headersGET = { Authorization: `Bearer ${accessToken}` };
const headersPOST = { 
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json' 
};

const Spotify = {
  getAccessToken() {
    if (token) {
      return token;
    }

    //check access token match.
    //check if the token is already in the URL, which looks like this when already authorized access: https://example.com/callback#access_token=NwAExz...BV3O2Tk&token_type=Bearer&expires_in=3600&state=123
    //window.location.href returns the current URL
    const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expirationMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (tokenMatch && expirationMatch) {
      token = tokenMatch[1];
      expiresIn = Number(expirationMatch[1]);
      //This clears the parameters, allowing us to grab a new access token when it expires
      window.setTimeout(() => (token = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return token;
    } else {
      window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
    }
  },

  getUserId(){
    let userID;
    let playlistID;

    //GET - Return user's ID
    return fetch(`https://api.spotify.com/v1/me`, { headers: headersGET })
      .then(response => response.json())
      .then(jsonResponse => {
        userID = jsonResponse.id;
        console.log(`getUserId - User ID: ${userID}`);
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(response => {
        return response.json();
      }).then(jsonResponse => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artists: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
      });
  },

  savePlaylist(playlistName, arrURIs) {
    if (!playlistName || !arrURIs.length) {
      return;
    }
    
    
        //POST - We use the userID to create a Playlist ID
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          headers: headersPOST,
          method: "POST",
          body: JSON.stringify({
            name: playlistName,
            description: "New playlist description",
            public: true
          }),
        })
          .then(response => response.json())
          .then(jsonResponse => {
            playlistID = jsonResponse.id;
            console.log(`playlistID: ${playlistID}`);
            //POST - We use the Playlist ID to upload tracks to that playlist
            return fetch(
              `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
              {
                headers: headersPOST,
                method: "POST",
                body: JSON.stringify({
                  uris: arrURIs
                })
              }
            );
          });
      });
  },

  componentDidMount() {
    window.addEventListener("load", () => {
      Spotify.getAccessToken();
    });
  },
};

export default Spotify;
