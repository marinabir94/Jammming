const Spotify = {
  accessToken : '',
  expiresIn : null,
  clientID : "ea39a7e792e348418109492c88c8e91d",
  //redirectURI : "http://marinabir94.surge.sh",
  redirectURI : "http://localhost:3002",
 

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
    //Get the current's user ID
    let userID;
    const headersGET = { Authorization: `Bearer ${this.accessToken}` };
    const url = `https://api.spotify.com/v1/me`;
    //GET - Return user's ID
    return fetch(url, { headers: headersGET })
      .then(response => response.json())
      .then(jsonResponse => {
        userID = jsonResponse.id;
        console.log(`1) getUserId: ${userID}`);
        return userID})
  },

  search(term) {
    //Get the whole results of a search
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
    //We create a new playlist and we get the playlistID
    console.log(`2) createPlaylist User ID: ${userID}`);
    const headersPOST = { 
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json' 
    };
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
    })
    .then(response => response.json())
    .then(jsonResponse => {
      const playlistID = jsonResponse.id;
      console.log(`3) playlistId: ${playlistID}`);
      return playlistID})
  },

  getUserPlaylists(){
  //Get the whole list of playlist's of the current user
    const headersGET = { Authorization: `Bearer ${this.accessToken}` };
    const url = `https://api.spotify.com/v1/me/playlists`;
    return fetch(url, {headers: headersGET
    }).then(response => {
      if(response.ok) {
        console.log('Im here');
        return response.json();
      }
    }).then(jsonResponse => {
        if (!jsonResponse.items) {
          return [];
        }
        return jsonResponse.items.map((playlist) => ({
          id : playlist.id,
          name : playlist.name,
        }));
    });
  },

  savePlaylist(playlistName, arrURIs){
    this.getUserPlaylists()
    .then(response =>{
      const searchPlaylist = response.find(playlist => playlist.name === playlistName);
    if(searchPlaylist){
      //If the playlist already exists, then save the tracks there
      const playlistID = searchPlaylist.id
      this.saveToPlaylist(playlistID, arrURIs);

    } else {
      //If the playlist does not exist yet, create a new one and save the tracks there
      this.getUserId()
      .then(response => {
        this.createPlaylist(response, playlistName)
        .then(jsonResponse => {
          return this.saveToPlaylist(jsonResponse, arrURIs);
        })
      })
    }})
  },

  saveToPlaylist(playlistID, arrURIs) {
    console.log(`5) playlistID: ${playlistID}`);
    const headersPOST = { 
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json' 
    };
    const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
    if (!playlistID || !arrURIs.length) {
      return;
    }    
      return fetch(url, { 
          method: 'POST',
          headers: headersPOST,
          body: JSON.stringify({
            uris: arrURIs
        })
      });     
  },

  saveNewPlaylist(playlistName, arrURIs){
  //Save a list of songs to a newly created playlist
    this.getUserId()
    .then(response => {
      this.createPlaylist(response, playlistName)
      .then(response => {
        return this.saveToPlaylist(response, arrURIs);
      })
    })
  },

};

export default Spotify;
