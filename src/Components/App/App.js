import React from "react";
import "./App.css";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";
import Spotify from "../../utils/Spotify";
//import { render } from "@testing-library/react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      playlistName: "New Playlist",
      playlistTracks: []
      // TESTING
      // searchResults: [
      //   { name: "name1", artist: "artist1", album: "album1", id: 1 },
      //   { name: "name2", artist: "artist2", album: "album2", id: 2 },
      //   { name: "name3", artist: "artist3", album: "album3", id: 3 },
      // ],
      //TESTING
      // playlistTracks: [
      //   {
      //     name: "playlistTrackname1",
      //     artist: "playlistTrackartist1",
      //     album: "playlistTrackalbum1",
      //     id: 4,
      //   },
      //   {
      //     name: "playlistTrackname2",
      //     artist: "playlistTrackartist2",
      //     album: "playlistTrackalbum2",
      //     id: 5,
      //   },
      //   {
      //     name: "playlistTrackname3",
      //     artist: "playlistTrackartist3",
      //     album: "playlistTrackalbum3",
      //     id: 6,
      //   },
      // ],
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  //Click handler
  addTrack(track) {
    let currentTracks = this.state.playlistTracks;
    if (currentTracks.includes(track.id)) {
      return;
    } else {
      currentTracks.push(track);
      this.setState({ playlistTracks: currentTracks });
    }
  }

  //Click handler
  removeTrack(track) {
    let currentTracks = this.state.playlistTracks;
    currentTracks = currentTracks.filter((item) => item.id !== track.id);
    this.setState({ playlistTracks: currentTracks });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  //Needs an array of URIs to be sent to the API GET method.
  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      //After sending the POST, we restore the default values
      this.setState({
        playlistName: "New Playlist",
        playlistTracks: [],
      });
    });
  }

  search(term) {
    Spotify.search(term).then(results => {
      this.setState({ searchResults: results });
    })
  }

  render() {
    return (
      <div>
        <h1>
          Ja<span className="highlight">mmm</span>ing
        </h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack}
            />
            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist}
            />
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
     window.addEventListener('load', () => {Spotify.getAccessToken()});
  }
}

export default App;
