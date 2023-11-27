// import friendsRoutes from "./friends.js";
import userRoutes from "./user.js";
import userProfileRoutes from "./userProfile.js";

const constructorMethod = (app) => {
	// app.use("/friends", friendsRoutes);
	app.use("/user", userRoutes);
	app.use("/userprofile", userProfileRoutes);

	app.use("*", (req, res) => {
		res.status(404).json({error: 'Route Not found'});
	});
};

export default constructorMethod;