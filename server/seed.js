import { register } from "./data/users.js";
import {dbConnection, closeConnection} from './config/mongoConnection';

const db = await dbConnection();
await db.dropDatabase();

let user1 = undefined;

try {
    user1 = await register("Isabella Stone", "ibellarose1", "Password123!", 21);
    console.log(user1);
} catch (e) {
    console.log(e);
}


// try {
//     let check = await checkUser("IBellaROse1@gmAil.cOM   ", "Iii9iw*u");
//     console.log(check);
// } catch (e) {
//     console.log(e);
// }


await closeConnection();
console.log('\nDone seeding!');