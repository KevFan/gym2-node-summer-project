### Project Title:
Gym Node Summer Project - <https://github.com/KevFan/gym2-node-summer-project>

### Project Description:
The project uses the [glitch template 2](https://github.com/wit-ict-summer-school-2017/glitch-template-2) as a base, and also part of [the node conversion of the play gym assignment](https://github.com/KevFan/gymPlaySolution_Node) to evolve and realise additional features.

The major additional features include class scheduling, assessment booking, target/goals and fitness programmes, with the inclusion of profile picture uploading.

### How to start project:
To run the project locally, clone or download the project. Unzip the project, and browse to project root directory using a terminal. Enter the `npm install` command to install the project dependencies.

The project also requires the [Cloudinary](http://cloudinary.com/) services in order to upload. In order to run, you will need to place a Cloudinary credentials file in the .data folder called .env.json:

.data/.env.json
~~~
{
  "cloudinary": {
    "cloud_name": "YOURID",
    "api_key": "YOURKEY",
    "api_secret": "YOURSECRET"
  }
}
~~~

Following the dependency installation, enter the `npm start` which would host the project on <http://localhost:4000/>


### User Instructions:
After hosting the project locally, users can signup or login using the preloaded accounts provided: 
```
User Accounts:

email: homer@simpson.com
password: secret

email: marge@simpson.com
password: secret
```
There is also a preloaded trainer account, which serves as an admin that can delete users and add comments to user assessments: 
```
Trainer Account:

email: trainer@trainer.com
password: secret

email: joe@trainer.com
password: secret

```
Alternative for the deployed version, you can visit <https://node-gym-summer.glitch.me/>

The above user and trainer accounts should also work for the deployed version, assuming none of the preloaded user accounts has been deleted.

### Feature List:
* Class Scheduling
  * Trainer
    * CRUD on scheduled classes
    * CRUD on each class session
    * Classes can be hidden from members
  * Member
    * View classes
    * Search for a class
    * Enroll/Un-enroll to specific class session or enroll to all sessions in a class
* Assessment Booking
  * Trainer & Member
    * CRUD on assessment bookings
* Goals
  * Trainer
    * Set/Delete goals for members
  * Member 
    * Set/Delete goals for themselves
    * Message prompt if have no open or goals awaiting processing
  * Goal status automatically set on each dashboard view 
    * Awaiting Processing - no assessment been done in past 3 days and goal date is today
    * Open - no assessment been done in past 3 days and goal date is in the future
    * Missed - no assessment been done in past 3 days of goal date and date is due or failed to reach goal with the assessment found
    * Achieved - assessment found in the past 3 days and reached goal
* Fitness Programme
  * Trainer
    * Comprised of 5 exercise sessions selected from list of classes, predefined workout routines or made a new/custom routine
    * CRUD on Fitness Programme
    * CRUD on predefined workout routines
    * CRUD on individual exercise sessions 
  * Member
    * View Fitness Progamme and individual exercise sessions

### Notes: 
* There is no sign up available for a Trainer. Trainers must be preloaded from the trainer-store.json 

### Further Improvements:
* Unit testing - no unit testing was done. Functionality was only tested manually
* Secure routes/url - trainer/member access can be allowed just from knowing the routes/paths
* List enrolled class sessions for members 
* Class sessions should auto hide/make past session unavailble
* Enroll should only enroll by dates from today
* Unset values - have default value
* Allow batch set weekly sessions
* Link trainer to classes their teaching and show on dashboard
* Set upload profile button to unavailable if cloudinary keys are not found
* Nav bar does not stack correctly


### List of Software + Technologies Used
+ [Node.js](https://nodejs.org/en/)
+ [Express](https://expressjs.com/) - Node.js Web Framework
+ [Glitch](https://glitch.com/) - Deployment platform
+ [Lowdb](https://github.com/typicode/lowdb) - JSon database for persistence
+ [WebStorm](https://www.jetbrains.com/webstorm/) - JavaScript IDE
+ [Semantic-UI-Calendar](https://github.com/mdehoog/Semantic-UI-Calendar) - Calendar module for Semantic UI
+ [Moment.js](https://momentjs.com/) - Date/Time manipulation 


### Authors:
Kevin Fan ([KevFan](https://github.com/KevFan))

### Version/Date:
18th August 2017