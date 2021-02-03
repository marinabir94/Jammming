import React from 'react';
import './PlaylistListItem.css'

class PlaylistListItem extends React.Component{
    constructor(props){
        super(props);
        this.selectPlaylistListItem = this.selectPlaylistListItem.bind(this);
    }

    selectPlaylistListItem(){
        this.props.onSelect(this.props.playlistListItem);
    }

    render(){
        return(
            <div className="PlaylistListItem">
                <h3>{this.props.name}</h3>
            </div>
        )
    }
}

export default PlaylistListItem;