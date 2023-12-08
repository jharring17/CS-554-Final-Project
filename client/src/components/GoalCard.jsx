import { React } from 'react'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
} from '@mui/material';
import axios from 'axios'
import { doGetUID } from "../firebase/FirebaseFunctions";

function GoalCard(props){
    const [goal, setGoal] = useState({});
    
    async function getGoalInfo(){
        let id = doGetUID();
        let data = await axios.get(`http://localhost:3000/userProfile/${id}/${props.id}`)
        setGoal(data.data)
    }

    getGoalInfo();
    return (
        <Grid item sm={4} md={3} lg={2.25} alignItems={"center"} key={props.id}>
        <Card
          variant='outlined'
          sx={{maxWidth: 300, height: 'auto', marginLeft: 'auto', marginRight: 'auto'
          }}
        >
            <h2>{goal.title}</h2>
        </Card>
      </Grid>    )
}

export default GoalCard