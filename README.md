### Project Title:
Gym Node Summer Project - <https://github.com/KevFan/gym2-node-summer-project>

### Project Description:
![Image of TrainerDashboard](http://res.cloudinary.com/dv6skh7wa/image/upload/v1504085120/Node%20Gym/screenshots/trainerDashboard.png
)

The project uses the [glitch template 2](https://github.com/wit-ict-summer-school-2017/glitch-template-2) as a base, and also part of [the node conversion of the play gym assignment](https://github.com/KevFan/gymPlaySolution_Node) to evolve and realise additional features.

The major additional features include class scheduling, assessment booking, target/goals and fitness programmes, with the inclusion of profile picture uploading.

### How to start project:
To run the project locally, clone or download the project. Unzip the project, and browse to project root directory using a terminal. Enter the `npm install` command to install the project dependencies.

The project also requires the [Cloudinary](http://cloudinary.com/) services in order to upload and delete profile picture. In order to run, you will need to place a Cloudinary credentials file in the .data folder called .env.json:

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

Following the dependency installation, enter the `npm start` command which would host the project on <http://localhost:4000/>


### User Instructions:
After hosting the project locally, users can signup or login using the preloaded accounts provided: 
```
User Accounts:

email: homer@simpson.com
password: secret

email: marge@simpson.com
password: secret
```
Trainer accounts are also preloaded, which serves as admins that can perform most member CRUD actions and also additional separate CRUD actions such as class creation etc.  
```
Trainer Account:

email: trainer@trainer.com
password: secret

email: joe@trainer.com
password: secret

```
Alternative for the deployed version, you can visit <https://node-gym-summer.glitch.me/>

The above user and trainer accounts should also work for the deployed version, assuming none of the preloaded user/trainer accounts has been deleted.

### Feature List:
* Class Scheduling
  * Trainer
    * CRUD on scheduled classes
    * CRUD on each class session
    * Classes can be hidden from members
    * Class is added/updated only if the trainer adding the class is free at the dateTime
  * Member
    * View classes
    * Search for a class
    * Enroll/Un-enroll to specific class session or enroll to all sessions in a class
      * Enroll/Un-enroll is only from class sessions that are in the future
      * Past class sessions are shown as unavailable 
* Assessment Booking
  * Trainer & Member
    * CRUD on assessment bookings
    * Booking is only added/updated if trainer is free at the dateTime selected
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
    * View Fitness Programme and individual exercise sessions
* Miscellaneous
  * Form validation - Members can't signup/book assessment etc. without filling all information required 
  * Email validation for signup/update email 
    * Checks whether the email (toLowerCase) is already used by another member/trainer
    * Shows success/unsuccessful messages in login, signup and update settings
  * Profile picture uploading
    * Allows member/trainer to upload, delete, update profile picture from a cloudinary account
    * Options are disabled if cloudinary file if not found
  * Trainer
    * Delete member - deletes all member related information from json databases and cloudinary store
    * Search member to view member dashboard
  * Assessment bookings and goals are sorted by date (most recent to oldest or vice versa)
  * Date/time selection is limited to only in the future from today 

### Notes: 
* There is no sign up available for a Trainer. Trainers must be preloaded from the trainer-store.json 

### Further Improvements:
* Unit testing - no unit testing was done. Functionality was only tested manually
* Should look into REST architecture
* Secure routes/url - Trainer views are not allowed unless it's a trainer account, but member access such as to view classes are allowed from just knowing the paths/routes
* List enrolled class sessions for members.
* Error/Success message is currently achieved by rendering a page with additional message data. Adding/updating booking do not display a message as they can be done it multiple views. Should really use a library such as [connect-flash](https://github.com/jaredhanson/connect-flash) to achieve the flash message.
* Enroll/Un-enroll all sessions buttons should only be displayed if there's available class sessions or only display future sessions for members
* Link each booking to an assessment and set status to automatically completed after making an assessment
* Allow member/trainer to have option to list goals etc. by date most recent or oldest

### List of Software + Technologies Used
+ [Node.js](https://nodejs.org/en/) - JavaScript runtime
+ [Express](https://expressjs.com/) - Node.js Web Framework
+ [Glitch](https://glitch.com/) - Deployment platform
+ [Lowdb](https://github.com/typicode/lowdb) - small local JSON database powered by lodash
+ [WebStorm](https://www.jetbrains.com/webstorm/) - JavaScript IDE
+ [Semantic-UI-Calendar](https://github.com/mdehoog/Semantic-UI-Calendar) - Calendar module for Semantic UI
+ [Moment.js](https://momentjs.com/) - Date/Time manipulation 


### Authors:
Kevin Fan ([KevFan](https://github.com/KevFan))

### Version/Date:
1st September 2017