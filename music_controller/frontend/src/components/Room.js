import React, { Component } from 'react';
import {Grid,Button,Typography } from "@material-ui/core";
import { Link } from 'react-router-dom';
import CreateRoomPage from './CreateRoomPage';

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip:2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
        };
        this.roomCode = this.props.match.params.roomCode;
        
        this.getRoomDetails=this.getRoomDetails.bind(this);
        this.leaveButtonClick = this.leaveButtonClick.bind(this);
        this.updateShowSettings=this.updateShowSettings.bind(this);
        this.rendersettingbutton= this.rendersettingbutton.bind(this);
        this.renderSetting= this.renderSetting.bind(this);
        this.authenticateSpotify =this.authenticateSpotify.bind(this);
        this.getRoomDetails();
    }
    getRoomDetails() {
        return fetch("/api/get-room" + "?code=" + this.roomCode)
        .then((response) => {
          if (!response.ok) {
            this.props.leaveRoomCallback();
            this.props.history.push("/");
          }
          return response.json();
        })
        .then((data) => {
          this.setState({
            votesToSkip: data.votes_to_skip,
            guestCanPause: data.guest_can_pause,
            isHost: data.is_host,
          });
          if (this.state.isHost){
            this.authenticateSpotify();
      
          }
        });
    }

    authenticateSpotify() {
      fetch("/spotify/is-authenticated")
        .then((response) => response.json())
        .then((data) => {
          this.setState({ spotifyAuthenticated: data.status });
          console.log(data.status);
          if (!data.status) {
            console.log('hello');
            fetch("/spotify/get-auth-url")
              .then((response) => response.json())
              .then((data) => {
                window.location.replace(data.url);
              });
          }
        });
    }

    updateShowSettings(value) {
      this.setState({
        showSettings:value,
      });
    }
    
    leaveButtonClick(){
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          };
          fetch("/api/leave-room", requestOptions).then((_response) => {
            this.props.leaveRoomCallback();
            this.props.history.push("/");
          });
        }
rendersettingbutton(){
  return (
    <Grid item xs={12} align="center">
      <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>
        setting
      </Button>
    </Grid>

  );
}

renderSetting(){
  return(
  <Grid container spacing={1}>
    <Grid item xs={12} align="center">
      <CreateRoomPage update={ true } votesToSkip={this.state.votesToSkip} guestCanPause={this.state.guestCanPause} roomCode={this.roomCode}
      updateCallback={this.getRoomDetails}/>
    </Grid>
    <Grid item xs={12} align="center">
    <Button
            variant="contained"
            color="secondary"
            onClick={() => this.updateShowSettings(false)}
          >
            close
          </Button>   
    </Grid>
    
  </Grid>
  );}

render() {
  if (this.state.showSettings){
    return this.renderSetting();
  }
    return (
    <Grid container spacing={1} align="center"> 
        <Grid item xs={12}>
            <Typography variant="h4" component='h4'>
                code:{this.roomCode}
            </Typography>
            
        </Grid>
        <Grid item xs={12}>
        <Typography variant="h6" component='h6'>
                votes:{this.state.votesToSkip}
            </Typography>
            
            
        </Grid>
        <Grid item xs={12}>
        <Typography variant="h6" component='h6'>
                guest Can Pause:{this.state.guestCanPause.toString()}
            </Typography>
            
            
        </Grid>
        <Grid item xs={12}>
        <Typography variant="h6" component='h6'>
                Host:{this.state.isHost.toString()}
            </Typography>
            
        </Grid>
        {this.state.isHost ? this.rendersettingbutton():null}
        <Grid item xs={12}>
        <Button
            variant="contained"
            color="secondary"
            onClick={this.leaveButtonClick}
          >
            Leave Room
          </Button>     
        </Grid>

    </Grid>
    
    
    );
}
}

/*
  <div>
        <h3>{this.roomCode}</h3>
        <p>Votes: {this.state.votesToSkip}</p>
        <p>guest can pause: {this.state.guestCanPause.toString()}</p>
        <p>host: {this.state.isHost.toString()}</p>
    </div>)
*/