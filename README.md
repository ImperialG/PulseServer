# PulseServer
NodeJS server to serve as a back end for the Pulse application. 

### Instructions for use

1. Clone the directory 

2. Make sure you have node and npm installed. You can find instructions for installation here here https://nodejs.org/en/download/

3. cd into the openSMILE-2.2rc1 directory and make sure you install openSMILE properly for your machine. Instructions for installation can be found in the directory at openSMILE-2.2rc1/doc/openSMILE_book

4. Run node app.js

### Pulse server provides two main methods:

####/file-upload  
This method handles the heart rate estimation upon receipt of wave file

**Requirements**

1. A .wav file sent via post request with fieldname "audio"

2. A string with ( true | false ) to specify if to use a user specific model or not with fieldname usePersonalModel

3. An alphanumeric string with fieldname phoneID, this id should be unique to all potential users, with fieldname phoneID

####/train
This method handles the user model training upon receipt of wave file and measured heart rate on recording 

**Requirements**

1. A .wav file sent via post request with fieldname "audio"

2. A string with measured heartrate with fieldname usePersonalModel

3. An alphanumeric string with fieldname phoneID, this id should be unique to all potential users
