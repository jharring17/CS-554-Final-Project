import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import '../App.css';
import axios from "axios"
import HistoryItem from "./HistoryItem";

const backend = axios.create({baseURL: "http://localhost:3000"})

const History = (props) => {
    const {currentUser} = useContext(AuthContext);
    const [itemData, setItemData] = useState(props.itemData)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState({})
    const [historyList, setHistory] = useState({})

    useEffect( () =>{
        const getData = async () => {
            let fire_id = currentUser.uid;
            const {data: userData} = await backend.get(`/getUserByFireAuth/${fire_id}`)
            setUser(userData)
            const {data: historyData} = await backend.get(`/userProfile/${fire_id}/history`)
            setHistory(historyData.history);
            setLoading(false)
        }
        getData()
        }, []
    )

    if(loading) return (<p>Loading...</p>)
    else
    {
        if (historyList.length == 0)
		return (
			<div className="card">
				<h2>No Goal History</h2>
			</div>
		);
        
	const feed = (
		<>
			{historyList.map((item) => {
				return <HistoryItem itemData={item} key={item._id} />;
			})}
		</>
	);

	return (
		<>
			{feed}
		</>
	);
    }
}

export default History;
