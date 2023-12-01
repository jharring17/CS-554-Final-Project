import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import '../App.css';
import friendSVG from "../assets/user-plus-svgrepo-com.svg"
import axios from "axios"

function FriendsModal() {
    const {currentUser} = useContext(AuthContext);
    const [modalOpened, setModalOpened] = useState(false)
    const [requestNotifs, setRequestNotifs] = useState(100)
    const [tab, setTab] = useState(0)
    const [pending, setPending] = useState([])
    const [incoming, setIncoming] = useState([])
    
    useEffect(()=>{
        
    },[])

    if(modalOpened) return (
        <div style={{position: 'absolute', right: 60, bottom: 20, backgroundColor: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)", width: "300px"}}>
        <button onClick={()=>setModalOpened(false)} style={{border: "none", backgroundColor: "white", fontWeight: "bolder"}}>X</button>
        </div>
    )
    return (
        <button style={{borderRadius:"50%", border:"none", width: "6vw", height:"6vw", backgroundColor:"#282c34", position:"absolute", bottom: 20, right: 60}} onClick={()=>setModalOpened(true)}>
            {(requestNotifs > 0) ? <span style={{position: "absolute", top: -5, left: -5, width: "25px", height: "25px", borderRadius: "50%", backgroundColor: "red", display:"flex", alignItems:"center", justifyContent:"center", fontWeight: "bold", color:"white", zIndex: 1}}>{requestNotifs}</span> : <></>}
            <img src={friendSVG} alt="Friend Requests" style={{position:"absolute", width:"95%", height:"95%", top: "3%", left: "5%", color:"white"}}/>
        </button>
    )
}

export default FriendsModal