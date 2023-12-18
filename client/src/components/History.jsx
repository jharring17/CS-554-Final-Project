import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import '../App.css';
import axios from "axios"
import HistoryItem from "./HistoryItem";

const backend = axios.create({baseURL: "http://54.175.184.234:3000/"})

const History = (props) => {
    const {currentUser} = useContext(AuthContext);
    const [itemData, setItemData] = useState(props.itemData)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState({})
    const [historyList, setHistory] = useState({})

    function sortByDate(list) {
        const sortedArray = list.sort((a, b) => {
            const monthA = parseInt(a.goalDate.substring(0,2));
            const dayA = parseInt(a.goalDate.substring(3,5));
            const yearA = parseInt(a.goalDate.substring(6));
            const monthB = parseInt(b.goalDate.substring(0,2));
            const dayB = parseInt(b.goalDate.substring(3,5));
            const yearB = parseInt(b.goalDate.substring(6));

            if (yearA !== yearB)
            {
                return yearB - yearA;
            }
            if (monthA !== monthB)
            {
                return monthB - monthA;
            }
            if (dayA !== dayB)
            {
                return dayB - dayA;
            }
            return 0;
        });
        return sortedArray;
    }

    useEffect( () =>{
        const getData = async () => {
            let fire_id = currentUser.uid;
            const {data: userData} = await backend.get(`/getUserByFireAuth/${fire_id}`)
            setUser(userData)
            const {data: historyData} = await backend.get(`/userProfile/${fire_id}/history`)
            let sortedHistory = sortByDate(historyData.history);
            setHistory(sortedHistory);
            // setHistory(historyData.history);
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

    const historySucceeded = historyList.reduce((total, item) => {if(item.successful == true) return total+1; else return total}, 0)

	return (
		<>
            <h2>Sucessfully completed {(historySucceeded / historyList.length * 100).toFixed(0)}% of past goals</h2>
			{feed}
		</>
	);
    }
}

export default History;
