import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../App.css";
import axios from "axios";
import FeedItem from "./FeedItem";

const backend = axios.create({ baseURL: "http://localhost:3000" });

function Home() {
	const { currentUser } = useContext(AuthContext);
	const [loadingFeed, setLoadingFeed] = useState(true);
	const [loadingItems, setLoadingItems] = useState(true);
	const [feedData, setFeedData] = useState([]);

	useEffect(() => {
		const getData = async () => {
			const { data } = await backend.get(`/user/${currentUser.uid}/feed`);
			setFeedData(data);
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

	if (feedData.feed.length == 0)
		return (
			<div className="card">
				<h2>Nothing to be shown</h2>
			</div>
		);

	const feed = (
		<>
			{feedData.feed.map((feedItem) => {
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
			{feed}
		</>
	);
}

export default Home;
