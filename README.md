# PulseServer
NodeJS server to serve as a back end for the Pulse application. 

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
