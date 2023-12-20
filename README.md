# CS-554-Final-Project
This web application allows users to self report their spendings and help them set and meet budgeting goals. This app has social features that allow users to add friends to see and share each other's spendings via goal posts. Spendings are categorized and users can see utilization once a goal is met.

## Technologies
* Amazon EC2
* Cloudinary
* Firebase Authentication
* MongoDB
* ReactJS
* Redis

## Collaborators
* Ryan Giovanniello [(@rgiova27)](http://github.com/rgiova27)
* Jack Harrington [(@jharring17)](http://github.com/jharring17)
* Jacob Rosengarten [(@jrose0116)](http://github.com/jrose0116)
* Megan Sanford [(@megxsan)](http://github.com/megxsan)
* Isabella Stone [(@Isabella-Stone)](http://github.com/Isabella-Stone)

## Installation / Structure
This application requires Node.js / Node Package Manager and a Redis cache which can be ran on a Unix system or a Docker container.

3 Instances:
* Client (preffered port 5173)
* Server (port 3000)
* Redis (port 6380)

### Redis:

Ensure that Redis is installed and running on the correct port.

See the following resources:
* Redis Documentation: https://redis.io/docs/install/install-redis/
* Docker Redis Setup: https://www.docker.com/blog/how-to-use-the-redis-docker-official-image/

This can be ran using Concurrently or as 2 seperate servers. Follow one of these next 2 sections after Redis is properly installed and running.

### Option 1: Using Concurrently

#### Client (React.js) and Server (Express.js):
1. Open a terminal at the root of the application
2. Cd into the client folder `cd client`
3. Install the client dependencies using `npm i`
4. Cd into the server folder `cd ../server` from the client directory or `cd server` from the root
5. Install the server dependencies using `npm i`
6. Cd back to the root of the project
7. Install the root dependencies with `npm i`
7. Run the start script for concurrently `npm start`

### Option 2: Using Seperate Terminals (Used for Deployment)

#### Client (React.js):
1. Cd into the client folder `cd client` from the root directory
2. Install the dependencies using `npm i`
3. Run the React.js server `npm run dev`

#### Server (Express.js):
1. Cd into the server folder `cd server` from the root directory
2. Install the dependencies using `npm i`
3. Run the Express.js server `npm start`

## Deployment
The app is deployed on EC2 Micro using tmux. Tmux is a multiplexer for terminals which allows multiple terminals to be accessed and stored in the background. This allows the server to be continuously running even when a terminal isn't openned.

The servers can be split from each other as long as the URLs are updated in the React server to reach the back-end server and the back-end server to reach Redis.

Here is the deployed server (DNS not currently handled): http://54.175.184.234:5173/

### How it works:

In EC2, the following inbound rules are required (if all servers are on this instance):
* TCP Access Through Port 3000 (React Client -> Express)
* TCP Access Through Port 6380 (Express -> Redis)
* TCP Access Through Port 5173 (User -> React Client)

Once connected to the server (EC2 Instance Connect / SSH Client):
* All actions should be done as a super-user `sudo su`
* Git, Node.js / Node Package Manager, Redis, and Tmux are installed
* The repository is pulled to the EC2 server and cd'ed into
* In each tmux terminal, a server is ran respectively using Option 2 above. The following tmux commands help accomplish this.
    ```bash
    tmux # Opens a new terminal instance
    tmux list-sessions # Lists currently running sessions
    tmux attach-session -t (title) # Opens currently running session with title
    *Keyboard Ctrl+B D* # Exits currently running terminal without terminating
    *Keyboard Ctrl+D* # Kills current terminal
    ```
* Without CI/CD, updates occur by running `git pull` inside the directory then restarting each server by attaching and rerunning. 
    * It is important to run `npm i` if there are any dependency changes in the server/client.

## Details

### Authentication
Our authentication is handled with set restrictions and Firebase Authentication. Once a user is created in firebase, they are linked to a mongoDB user which links categories, goals, and expenses to the user.

#### Navigation
The navigation is very simple and is only available to authenticated users. It contains links to the feed, account, and friends. When within a section or sub-section, the corresponding link will be 'active'. Again, the sign out button is also on the navigation.

### Feed
Posts are shown at the feed/home page of the application which authenticated users can access.

When a friend completes one of their goals, a post is created which displays the goal, the category of the goal, the description, date, and the utilization (%) of their total budget. Your friends will also see this when you complete a goal.

Users are able to leave likes at the bottom of the post.

### Account Page

#### User Information
Users are able to see and edit their own information such as their display name, username, and profile picture. They are also able to manage their categories by adding and removing. This section also contains navigation to the history page.

Cloudinary is used to handle the user images. Uploaded images are stored in Cloudinary's servers and accessed via a URL in the Mongo database. 

#### Goals
Underneath the user's information is the user's goals. Here, each goal has its own card and are able to be edited and deleted. The user will also be able to add, edit, and remove expenses from the goal. These expenses contain a description, cost, and date of transaction.

#### History
The history section has its own page and contains a list of past goals with its details and indicators on whether or not the goals were successful. The top of the page contains a percentage of goals completed. If no goals have been finished, there is a card displayed stating that no history items exist.

### Friends
#### Friends Modal
In the bottom-right of each authenticated user's screen is a modal. This modal allows users to see their incoming and pending/outgoing friend requests as well as send friend requests of their own by username. Upon any action/query on/from this modal, a toastify alert will appear showing a response message.

#### Friends List
The friends page accessed by the navigation bar contains a list of friends. From here, friends can either be removed or their friend page can accessed.

#### Friend Page
Friend pages contain a friend's display name, profile picture, username, goal count, in-progress goal count, and completion percentage. This page is only accessible by a friend or it would display an unauthorized page.