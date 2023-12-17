import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import '../App.css';
import friendSVG from "../assets/user-plus-svgrepo-com.svg"
import axios from "axios"
import {ToastContainer, toast} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

const backend = axios.create({baseURL: "http://localhost:3000"})

function FriendsModal() {
    const {currentUser} = useContext(AuthContext);
    const [modalOpened, setModalOpened] = useState(false)
    const [tab, setTab] = useState(0)
    const [pending, setPending] = useState([])
    const [loading, setLoading] = useState(true)
    const [incoming, setIncoming] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [tabData, setTabData] = useState(<></>)
    const [userId, setUserId] = useState("")
    const [refresh, setRefresh] = useState(false)

    const acceptFriend = async (id) => {
        try {
            await backend.post(`/friends/request/ACCEPT`, {user1: userId, user2: id})
            setRefresh(!refresh)
            toast("Request Accepted")
        } catch (error) {
            toast("Accept Failed")
        }
    }

    const declineFriend = async (id) => {
        try {
            await backend.post(`/friends/request/DECLINE`, {user1: userId, user2: id})
            setRefresh(!refresh)
            toast("Successfully Declined")
        } catch (error) {
            toast("Decline Failed")
        }
    }

    const cancelRequest = async (id) => {
        try {
            await backend.post(`/friends/request/CANCEL`, {user1: userId, user2: id})
            setRefresh(!refresh)
            toast("Successfully Cancelled")
        } catch (e) {
            toast("Cancel Failed")
        }
    }

    const sendRequest = async (username) => {
        username = username.trim()
        try {
            if(!(/^[a-zA-Z0-9]+$/.test(username)) || username.length < 8 || username.length > 20) throw {response: {status:400, error: "Bad username"}}
            const {data} = await backend.get(`/getIdByUsername/${username.trim()}`)
            await backend.post(`/friends/request/SEND`, {user1: userId, user2: data.fire_id})
            toast(`Request Sent To ${data.displayName}`)
            setRefresh(!refresh)
        } catch (e) {
            if(e.response.data == 'User already in friends list: sendFriendRequest') toast.error("User is already your friend!")
            else if(e.response.status == 404) toast.error("User Not Found")
            else if(e.response.status == 400) toast.error("Bad Username")
        }
    }

    useEffect(()=>{
        const getData = async () =>{
            try{
                await backend(`/getUserByFireAuth/${currentUser.uid}`)
                setUserId(currentUser.uid)
                setLoading(false)
            } catch (e) {
                toast.error("Error:", e)
            }
        }
        getData()
    }, [])
    
    useEffect(()=>{
        const getData = async () => {
            const {data: dataInc} = await backend.get(`/friends/request/GETI/${userId}`)
            const {data: dataPend} = await backend.get(`/friends/request/GETP/${userId}`)
            setIncoming(dataInc)
            setPending(dataPend)
        }
        if(userId != "") getData()
    },[tab, userId, refresh])

    useEffect(()=>{
        const accDecButtonStyles = {border: "none", cursor: "pointer", backgroundColor: "white", height: "fit-content", margin: "auto 2px", width: "fit-content"}

        const tabFunction = async () =>{
            if(incoming)
            if(tab == 0) { 
                // Incoming // get incoming friends
                // Will need a promise here
                if(incoming.length == 0) {
                    setTabData(<p>No incoming requests</p>)
                    return;
                }
                const promise = incoming.map(async (id)=>{
                    const {data} = await backend.get(`/getUserByFireAuth/${id}`)
                    const userTemp = {name: data.displayName}// getUser

                    return <div style={{display:"flex", flexDirection: "row"}} key={id}><p style={{marginLeft: "10px", marginRight: "auto", maxWidth: "50%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{userTemp.name}</p><button style={accDecButtonStyles} onClick={()=>acceptFriend(id)}>Accept</button><button style={accDecButtonStyles} onClick={()=>declineFriend(id)}>Decline</button></div>
                })
                let tabTemp = await Promise.all(promise)
                setTabData(tabTemp)
                
            }
        }
        tabFunction()
    }, [incoming])

    useEffect(()=>{
        const accDecButtonStyles = {border: "none", cursor: "pointer", backgroundColor: "white", height: "fit-content", margin: "auto 2px", width: "fit-content"}

        const tabFunction = async () =>{
            if(pending)
            if(tab == 1) { // Pending
                if(pending.length == 0) {
                    setTabData(<p>No pending requests</p>)
                    return;
                }
                const promise = pending.map(async (id)=>{
                    const {data} = await backend.get(`/getUserByFireAuth/${id}`)
                    const userTemp = {name: data.displayName}// getUser
                    return <div style={{display:"flex", flexDirection: "row"}} key={id}><p style={{marginLeft: "10px", marginRight: "auto", maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{userTemp.name}</p><button style={accDecButtonStyles} onClick={()=>cancelRequest(id)}>Cancel</button></div>
                })
                let tabTemp = await Promise.all(promise)
                setTabData(tabTemp)
            }
        }
        tabFunction()
    }, [pending])

    const tabButtonStyle = {width: "50%", border: "none", backgroundColor: "white", paddingTop: "10px", paddingBottom: "10px", fontSize: "small", fontWeight: "bold"}
    
    if(loading) return (<></>)
    if(modalOpened) return (<>
        <ToastContainer
        position="top-right"
        autoClose={2000}
        limit={3}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        />
        <div style={{position: 'fixed', right: 60, bottom: 20, backgroundColor: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)", width: "250px", display: "flex", flexDirection: "column"}}>
            <button onClick={()=>setModalOpened(false)} style={{border: "none", backgroundColor: "rgba(0,0,0,0)", fontWeight: "bolder", position: 'absolute', top: 0, right: 0, cursor: "pointer"}}>X</button>
            <div style={{borderBottom: "solid 2px rgba(0,0,0,0.55)"}}>
                <button style={{...tabButtonStyle, backgroundColor: (tab == 0) ? "rgba(0,0,0,0.05)" : "white"}} onClick={()=>setTab(0)}><span style={{cursor: "pointer"}}>Incoming</span></button>
                <button style={{...tabButtonStyle, backgroundColor: (tab == 1) ? "rgba(0,0,0,0.05)" : "white", borderLeft: "solid 2px rgba(0,0,0,0.25)"}} onClick={()=>setTab(1)}><span style={{cursor: "pointer"}}>Pending</span></button>
            </div>
            <div style={{borderBottom: "solid 2px rgba(0,0,0,0.55)"}}>
                {tabData}
            </div>
            <div style={{margin: "3px", display: "flex", justifyContent: "center", gap: "10px"}}>
                <input id="requestInput" type='text' onChange={(e)=>setInputValue(e.target.value)} placeholder='Search Username' style={{borderRadius: "10px", width: "125px", padding: "2px 10px"}}/>
                <button onClick={()=>{ sendRequest(inputValue); document.getElementById("requestInput").value = ""; setInputValue("")}} style={{padding: "5px", fontSize: "11px", cursor:"pointer", backgroundColor: "white"}}>Send<br/>Request</button>
            </div>
        </div>
        </>
    )
    return (
        <button style={{borderRadius:"50%", border:"none", width: "6vw", height:"6vw", backgroundColor:"#282c34", position:"fixed", bottom: 20, right: 60}} onClick={()=>setModalOpened(true)}>
            {(incoming.length > 0) ? <span style={{position: "absolute", top: -5, left: -5, width: "25px", height: "25px", borderRadius: "50%", backgroundColor: "red", display:"flex", alignItems:"center", justifyContent:"center", fontWeight: "bold", color:"white", zIndex: 1}}>{incoming.length}</span> : <></>}
            <img src={friendSVG} alt="Friend Requests" style={{position:"absolute", width:"95%", height:"95%", top: "3%", left: "5%", color:"white"}}/>
        </button>
    )
}

export default FriendsModal