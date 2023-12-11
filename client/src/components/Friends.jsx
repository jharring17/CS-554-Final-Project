import {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import '../App.css';
import axios from "axios"
import {NavLink} from 'react-router-dom';

const backend = axios.create({baseURL: "http://localhost:3000"})

const Friends = () => {
    const [friendData, setFriendData] = useState([])
    const [renderData, setRenderData] = useState(<></>)
    const [refresh, setRefresh] = useState(false)
    const [loading, setLoading] = useState(true)
    const {currentUser} = useContext(AuthContext);

    const removeFriend = async (id) => {
        const confirm = window.confirm("Are you sure?")
        if (!confirm) return
        const {data} = await backend.post(`/friends/request/REMOVE`, {user1: currentUser.uid, user2: id})
        setLoading(true)
        setRefresh(!refresh)
    }

    useEffect(()=>{
        const getData = async () => {
            const {data} = await backend.get(`/friends/request/GETA/${currentUser.uid}`)
            setFriendData(data)
            setLoading(false)
        }
        if(currentUser) getData()
    },[refresh])

    useEffect(()=>{
        const handleData = async () => {
            const mapPromise = friendData.map(async (friend)=>{
                const {data} = await backend.get(`/getUserByFireAuth/${friend}`)
                return (
                    <div key={friend} className="card" style={{display:"flex", gap: "25px", alignItems: "center", padding: "2px 10px", margin: "10px auto", maxWidth: "500px", minWidth: "fit-content", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1)"}}>
                        <img src="https://placehold.co/256x256.png" style={{width:"40px", height:"45px", borderRadius: "100%" }}/>
                        <div style={{margin: "4px", textAlign: "left"}}>
                            <NavLink to={`/userprofile/${friend}`} style={{margin: "0 0", fontSize:"16px", cursor: "pointer", color: "black", fontWeight: "normal", textDecoration: "none"}} onMouseEnter={(e)=>(e.currentTarget.style.color = "darkblue")} onMouseLeave={(e)=>(e.currentTarget.style.color = "black")}>{data.displayName}</NavLink>
                            <p style={{margin: "0 0", fontSize: "12px"}}>{data.username}</p>
                        </div>
                        <button style={{marginLeft:"auto", backgroundColor: "#282c34", color: "white", padding: "7px 15px", border: "none", borderRadius: "5px"}} onClick={()=>{removeFriend(friend)}}>Remove</button>
                    </div>
            )})
            const mapResult = await Promise.all(mapPromise)
            setRenderData(mapResult)
        }
        handleData()
    }, [friendData])
    
    return (
        <>
        <p>Your Friends</p>
        {renderData}
        </>
    )
}

export default Friends