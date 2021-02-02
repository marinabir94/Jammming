const Spotify = {
  accessToken : '',
  expiresIn : null,
  clientID : "ea39a7e792e348418109492c88c8e91d",
  redirectURI : "http://marinabir94.surge.sh",
 

  getAccessToken() {
    if (this.accessToken) {
      return this.accessToken;
    }

    //check access token match.
    //check if the token is already in the URL, which looks like this when already authorized access: https://example.com/callback#access_token=NwAExz...BV3O2Tk&token_type=Bearer&expires_in=3600&state=123
    //window.location.href returns the current URL
    const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expirationMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (tokenMatch && expirationMatch) {
      this.accessToken = tokenMatch[1];
      this.expiresIn = Number(expirationMatch[1]);
      //This clears the parameters, allowing us to grab a new access token when it expires
      window.setTimeout(() => (this.accessToken = ""), this.expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return this.accessToken;
    } else {
      window.location = `https://accounts.spotify.com/authorize?client_id=${this.clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${this.redirectURI}`;
    }
  },


  getUserId(){
    const headersGET = { Authorization: `Bearer ${this.accessToken}` };
    const url = `https://api.spotify.com/v1/me`;
    //GET - Return user's ID
    return fetch(url, { headers: headersGET })
      .then(response => {
        if(response.ok){
          return response.json();
        }
      }).then(jsonResponse => jsonResponse.id);
  },

  search(term) {
    const headersGET = { Authorization: `Bearer ${this.accessToken}` };
    const url = `https://api.spotify.com/v1/search?type=track&q=${term}`;
    return fetch(url, {headers: headersGET
    }).then(response => {
      if(response.ok) {
        return response.json();
      }
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

  createPlaylist(userID, playlistName){
    const headersPOST = { 
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json' 
    };
    console.log(`createPlaylist User ID: ${userID}`)
    const url =`https://api.spotify.com/v1/users/${userID}/playlists`;
    //POST - We use the userID to create a Playlist ID
    return fetch(url, {
      headers: headersPOST,
      method: "POST",
      body: JSON.stringify({
        name: playlistName,
        description: "New playlist description",
        public: true
      })
    }).then(response => {
      if (response.ok) {
          return response.json();
      }
    });
  },

  saveToPlaylist(playlistName, arrURIs) {
    const headersPOST = { 
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json' 
    };
    if (!playlistName || !arrURIs.length) {
      return;
    }    
    return this.getUserId()
    .then(response => {
      return this.createPlaylist(response, playlistName)
    }).then(response => {
      const playlistID = response.id;
      const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
      return fetch(url, {
          method: 'POST',
          headers: headersPOST,
          body: JSON.stringify({
            uris: arrURIs
        })
      });
    }).then(response => {
      if (response.ok){
          return response.json();
      }
    });        
  },

  savePlaylist(playlistName, arrURIs){
    const userID = Spotify.getUserId();
    console.log(`savePlaylist User ID: ${userID}`)
    return Spotify.createPlaylist(userID, playlistName)
    .then(Spotify.saveToPlaylist(playlistName, arrURIs));
  },

  componentDidMount() {
    window.addEventListener("load", () => {
      Spotify.getAccessToken();
    });
  },
};

export default Spotify;
