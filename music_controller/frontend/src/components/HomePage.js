import React, { Component } from "react";
import RoomJoinpage from './RoomJoinpage';
import CreateRoomPage from './CreateRoomPage';
import Info from './info';
import Room from './Room';
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import { BrowserRouter as Router, Switch,Route,Link,Redirect} from "react-router-dom";
import Paper from '@material-ui/core/Paper';


export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state={
            roomCode:null,
        };
        this.clearRoomCode = this.clearRoomCode.bind(this);

    }

    async componentDidMount() {
        fetch("/api/user-in-room")
          .then((response) => response.json())
          .then((data) => {
            this.setState({
              roomCode: data.code,
            });
          });

    }

    renderHomePage() {
        return (
            <Grid container spacing={3} align="center">
               
                <Grid item xs={12}>
                    <Typography variant="h3" compact='h3'>
                        house party
                    </Typography>
                    </Grid>
                <Grid item xs={12}>
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color="primary" to='/join' component={Link}>
                            Join a Room
                        </Button>
                        <Button color="default" to='/info' component={Link}>
                            Info
                        </Button>
                        <Button color="secondary" to='/create' component={Link}>
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }
    clearRoomCode() {
        this.setState({
          roomCode: null,
        });
      }
    render() {
        return (<Router>
            <Switch>

                
            <Route
            exact
            path="/"
            render={() => {
              return this.state.roomCode ? (
                <Redirect to={`/room/${this.state.roomCode}`} />
              ) : (
                this.renderHomePage()
              );
            }}
          />

                <Route path='/join' component={RoomJoinpage} />
                <Route path='/info' component={Info} />
                <Route path='/create' component={CreateRoomPage} />
                <Route
            path="/room/:roomCode"
            render={(props) => {
              return <Room {...props} leaveRoomCallback={this.clearRoomCode} />;
            }}
          />
            </Switch>
        </Router>);

    }
}
