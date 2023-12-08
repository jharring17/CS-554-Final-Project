import { getUserByUsername, getUser, getUserByMongoId } from "../data/users.js";
import friendsRoutes from "./friends.js";
import userRoutes from "./user.js";
import userProfileRoutes from "./userProfile.js";

const constructorMethod = (app) => {
	app.use("/friends", friendsRoutes);
	app.use("/user", userRoutes);
	app.use("/userprofile", userProfileRoutes);

	app.get("/getUserByFireAuth/:id", async (req, res) => {
		try{
			let data = await getUser(req.params.id)
			return res.json(data)
		} catch (e) {
			return res.status(404).json({error: e})
		}
	})

	app.get("/getIdByUsername/:username", async (req, res) => {
		try{
			let data = await getUserByUsername(req.params.username)
			return res.json(data)
		} catch (e) {
			return res.status(404).json({error: e})
		}
	})

	app.get("/getUserById/:id", async (req, res) => {
		try{
			let data = await getUserByMongoId(req.params.id)
			return res.json(data)
		} catch (e) {
			return res.status(404).json({error: e})
		}
	})

	app.use("*", (req, res) => {
		res.status(404).json({error: 'Route Not found'});
	});
};

export default constructorMethod;