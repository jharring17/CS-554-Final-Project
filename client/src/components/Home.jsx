import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../App.css";
import axios from "axios";
import FeedItem from "./FeedItem";

const backend = axios.create({ baseURL: "http://54.175.184.234:3000/" });

function Home() {
	const { currentUser } = useContext(AuthContext);
	const [loadingFeed, setLoadingFeed] = useState(true);
	const [loadingItems, setLoadingItems] = useState(true);
	const [feedData, setFeedData] = useState([]);

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

	useEffect(() => {
		const getData = async () => {
			const { data: feedGot } = await backend.get(`/user/${currentUser.uid}/feed`);
			let sortedData = sortByDate(feedGot.feed);
			setFeedData(sortedData);
			setLoadingFeed(false);
		};
		if (currentUser.uid != "") getData();
	}, []);

	console.log(feedData);

	if (loadingFeed)
		return (
			<>
				{/* <div className='card'>
        <h2>
          Hello {currentUser && currentUser.displayName}, {currentUser.uid}, this is the Protected
          Home page used to show your feed
        </h2>
      </div> */}
				<div className="card">Loading...</div>
			</>
		);

	if (feedData.length == 0)
		return (
			<div className="card">
				<h2>No activity yet</h2>
			</div>
		);

	const feed = (
		<>
			{feedData.map((feedItem) => {
				return <FeedItem itemData={feedItem} key={feedItem._id} />;
			})}
		</>
	);

	return (
		<>
			{/* <div className='card'>
      <h2>
        Hello {currentUser && currentUser.displayName}, {currentUser.uid}, this is the Protected
        Home page used to show your feed
      </h2>
    </div> */}
			<p>View your friends' successful goals from the past week:</p>
			{feed}
		</>
	);
}

export default Home;
