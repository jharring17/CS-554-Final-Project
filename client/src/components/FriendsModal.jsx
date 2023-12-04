import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import '../App.css';
import friendSVG from "../assets/user-plus-svgrepo-com.svg"
import axios from "axios"

function FriendsModal() {
    const {currentUser} = useContext(AuthContext);
    const [modalOpened, setModalOpened] = useState(false)
    const [requestNotifs, setRequestNotifs] = useState(2)
    const [tab, setTab] = useState(0)
    const [pending, setPending] = useState([])
    const [incoming, setIncoming] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [tabData, setTabData] = useState(<></>)
    
    const acceptFriend = async (id) => {
        alert(`Accepted ${id}`)
    }

    const declineFriend = async (id) => {
        alert(`Declined ${id}`)
    }

    const cancelRequest = async (id) => {
        alert(`Cancelled Request To ${id}`)
    }

    const sendRequest = async (id) => {
        alert(`Sent Request To ${id}`)
    }

    
    useEffect(()=>{
        const accDecButtonStyles = {border: "none", cursor: "pointer", backgroundColor: "white", height: "fit-content", margin: "auto 2px", width: "fit-content"}
        
        if(tab == 0) { // Incoming
            const {data} = {data: ["656c41e10787a2bdd8b3b0f2", "656c41e10787a2bdd8b3b0f3"]} // get incoming friends
            // Will need a promise here
            const tabTemp = data.map((id)=>{
                const userTemp = {name: "Friend Name"}// getUser
                return <div style={{display:"flex", flexDirection: "row"}} key={id}><p style={{marginLeft: "10px", marginRight: "auto", maxWidth: "50%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{userTemp.name}</p><button style={accDecButtonStyles} onClick={()=>acceptFriend(id)}>Accept</button><button style={accDecButtonStyles} onClick={()=>declineFriend(id)}>Decline</button></div>
            })
            setTabData(tabTemp)
        }
        
        if(tab == 1) { // Pending
            const {data} = {data: ["656c41e10787a2bdd8b3b0f2", "656c41e10787a2bdd8b3b0f3"]} // get incoming friends
            const tabTemp = data.map((id)=>{
                const userTemp = {name: "Friend Name"}// getUser
                return <div style={{display:"flex", flexDirection: "row"}} key={id}><p style={{marginLeft: "10px", marginRight: "auto", maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{userTemp.name}</p><button style={accDecButtonStyles} onClick={()=>cancelRequest(id)}>Cancel</button></div>
            })
            setTabData(tabTemp)
        }
    },[tab])

    const tabButtonStyle = {width: "50%", border: "none", backgroundColor: "white", paddingTop: "10px", paddingBottom: "10px", fontSize: "small", fontWeight: "bold"}

    if(modalOpened) return (
        <div style={{position: 'absolute', right: 60, bottom: 20, backgroundColor: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)", width: "250px", display: "flex", flexDirection: "column"}}>
        <button onClick={()=>setModalOpened(false)} style={{border: "none", backgroundColor: "rgba(0,0,0,0)", fontWeight: "bolder", position: 'absolute', top: 0, right: 0, cursor: "pointer"}}>X</button>
        <div style={{borderBottom: "solid 2px rgba(0,0,0,0.55)"}}>
            <button style={{...tabButtonStyle, backgroundColor: (tab == 0) ? "rgba(0,0,0,0.05)" : "white"}} onClick={()=>setTab(0)}><span style={{cursor: "pointer"}}>Incoming</span></button>
            <button style={{...tabButtonStyle, backgroundColor: (tab == 1) ? "rgba(0,0,0,0.05)" : "white", borderLeft: "solid 2px rgba(0,0,0,0.25)"}} onClick={()=>setTab(1)}><span style={{cursor: "pointer"}}>Pending</span></button>
        </div>
        <div style={{borderBottom: "solid 2px rgba(0,0,0,0.55)"}}>
            {tabData}
        </div>
        <div style={{margin: "3px", display: "flex", justifyContent: "center", gap: "10px"}}>
            <input type='text' onChange={(e)=>setInputValue(e.target.value)} placeholder='Search Username' style={{borderRadius: "10px", width: "125px", padding: "2px 10px"}}/>
            <button onClick={()=>sendRequest(inputValue)} style={{padding: "5px", fontSize: "11px", cursor:"pointer", backgroundColor: "white"}}>Send<br/>Request</button>
        </div>
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