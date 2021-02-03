import React from "react";
import "./PlaylistList.css";
import PlaylistListItem from "../PlaylistListItem/PlaylistListItem";

class PlaylistList extends React.Component {
  render() {
    return (
    <div className="PlaylistList">
        <h2>Local Playlists</h2>
        {this.props.playlistResults.map(playlistitem => {
          return <PlaylistListItem 
                    playlistitem={playlistitem} 
                    id={playlistitem.id}
                    name={playlistitem.name} 
                    onSelect = {this.props.onSelect}/>
        })}
      </div>
    );
  }
}

export default PlaylistList;