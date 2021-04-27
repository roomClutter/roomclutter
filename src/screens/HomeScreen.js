import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import download from 'downloadjs';
import Filter from './filter'
import Login from './Login';
import {key} from '../key';

import ListItem from './listItem';

var dataArray = [];

var loaded = false;
var editing = false;
var editing_result = false;
var timer;

var clutterOptions = ["All",'1','2','3','4','5','6','7','8','9']
var roomOptions = ["All","Living Room","Kitchen","Bedroom #1","Bedroom #2","Bedroom #3","Bedroom #4","Bathroom #1","Bathroom #2","Bathroom #3","Dining Room","Hallway","Garage","Basement","Attic","Den","Office","Family Room","Deck","Balcony","Pantry","Boiler Room","Other"]

function HomeScreen() {
  const[data, setData] = useState([]);
  const[tempData, setTempData] = useState([]);
  const[editState, setEditState] = useState(false);
  
  const [location, setLocation] = useState(null);
  const [room_type, setRoomType] = useState("Living Room");
  const [clutter, setClutter] = useState(1);
  const [path, setPath] = useState(null);
  const[lowerDirtyLevel, setLowerDirtyLevel] = useState("All");
  const[upperDirtyLevel, setUpperDirtyLevel] = useState("All");
  const[roomChoice, setRoomChoice] = useState("All");
  const[error, setError] = useState(false);
  const[loginError, setLoginError] = useState(false);

  const[auth, setAuth] = useState(false)
  
  useEffect(() => {
    const loadAll = async () => {
      let users_path = await loadUsers()
      let imgs_path = await loadRooms(users_path)
      dataArray = await loadList(imgs_path)
      setData(dataArray);
      setTempData(dataArray);
      editing_result = false;
    }
    loadAll();
  }, [editing_result]);

  useEffect(() => {
    timer = setInterval(() => {
      if (editing_result == true)
      {
        editing = false;
      }
      setEditState(editing);
    }, 1000);
    return () => {
      clearInterval(timer)
      editing = false
    }
  }, []);

 // console.log(data);

 const handleLogin = (password) => {
   if(password == key) {
     setAuth(true);
   } else {
     setLoginError(true)
   }
 }

  const filterDirtyLower = (filter) => {
    setLowerDirtyLevel(filter)
  }
  
  const filterDirtyUpper = (filter) => {
    setUpperDirtyLevel(filter)
  }

  const filterRoom = (filter) => {
    setRoomChoice(filter)
  }

  const dateSortNewest = () => {
    var newData;
    newData = [...tempData].sort(function(a,b){
      return new Date(b.date_created) - new Date(a.date_created);
      })
    //newData.forEach(item => console.log(new Date(item.date_created)))
    setTempData(newData);
  }

  const dateSortOldest = () => {
    var newData;
    newData = [...tempData].sort(function(a,b){
      return new Date(a.date_created) - new Date(b.date_created);
      })
   
    setTempData(newData);
  }
  

  
  //1st and 2nd for lower and upper clutter levels, 3rd is room type
  const filterSubmit = (firstf, secondf, thirdf) => {
    var newData;
    if(firstf > secondf) {
      setError(true);
      return;
    }
    setError(false);
    if((firstf === "All" && thirdf === "All") || (secondf === "All" && thirdf === "All")) {
      newData = data;
    } else if (firstf === "All" || secondf === "All") {
      newData = data.filter(item => item.room_type === thirdf)
    } else if(thirdf === "All") {
      newData = data.filter(item => (item.clutter >= firstf) && (item.clutter <= secondf))
    } else if (firstf != "All" && secondf != "All" && thirdf != "All"){ newData = data.filter(item => (item.room_type == thirdf) && ((item.clutter >= firstf) && (item.clutter <= secondf)))
    }
    setTempData(newData)
  }
  
  /*
  const resetFilters = () => {
    //Reset filter vars
    setLowerDirtyLevel("All")
    setUpperDirtyLevel("All")
    setRoomChoice("All")
    
    //Reset pickers at top of screen
    
    //Reset room data
    setTempData(data)
  }
  */
  
  const handleEdit = (key) => {
    for (var i = 0; i < dataArray.length; i++) {
      if (dataArray[i].image == key) {
        setPath(dataArray[i].path);
        setLocation(dataArray[i].location);
        setRoomType(dataArray[i].room_type);
        setClutter(dataArray[i].clutter);
        editing = true;
      }
    }
  }
  
  const handleDelete = (key) => {
    for (var i = 0; i < dataArray.length; i++) {
      if (dataArray[i].image == key) {
        var storageRef = firebase.storage().ref()
        var deletePath = dataArray[i].path
        var deleteRef = storageRef.child(deletePath)
        deleteRef.delete().then(() => {
          console.log("Room deleted")
          let newItems = data.filter(item => {
            return item.image != key
          })
          editing_result = true
          setData(newItems);
        });
      }
    }
  }

  const renderItems = tempData.map((item,index) => {
    return (
      <div key={index}>
        <ListItem key={index} item ={item} handleEdit={handleEdit} handleDelete={handleDelete}/>
      </div>
  )})

  if(!auth) {
    return (
      <>
        {loginError ? <div className="login-error">Wrong password</div> : <div></div>}
        <Login handleLogin={handleLogin}/>
      </>
    )
  }

  if (loaded === false) {
    return (
      <div className="container">
        Loading...
      </div>
    );
  }
  if (editState === true) {
     return (
      <div className="container">
        <p className="editTitle">Edit Information</p>
        <div className = "editInputView">
          <input
            autoCapitalize = "none"
            autoComplete = "off"
            onChange = {(e) => setLocation(e.target.value)}
            placeholder = "Location"
            className = "editInputText"
            value = {location}/>
        </div>
        <div className = "pickerView">
          <p className = "editText">Room Type:</p>
          <select
            value = {room_type}
            className="pickerStyle"
            onChange = {e => setRoomType(e.target.value)}>
            <option label="Living Room" value="Living Room" />
            <option label="Kitchen" value="Kitchen" />
            <option label="Bedroom #1" value="Bedroom #1" />
            <option label="Bedroom #2" value="Bedroom #2" />
            <option label="Bedroom #3" value="Bedroom #3" />
            <option label="Bedroom #4" value="Bedroom #4" />
            <option label="Bathroom #1" value="Bathroom #1" />
            <option label="Bathroom #2" value="Bathroom #2" />
            <option label="Bathroom #3" value="Bathroom #3" />
            <option label="Dining Room" value="Dining Room" />
            <option label="Hallway" value="Hallway" />
            <option label="Garage" value="Garage" />
            <option label="Basement" value="Basement" />
            <option label="Attic" value="Attic" />
            <option label="Den" value="Den" />
            <option label="Office" value="Office" />
            <option label="Family Room" value="Family Room" />
            <option label="Deck" value="Deck" />
            <option label="Balcony" value="Balcony" />
            <option label="Pantry" value="Pantry" />
            <option label="Boiler Room" value="Boiler Room" />
            <option label="Other" value="Other" />
          </select>
        </div>
        <div className = "pickerView">
          <p className = "editText">CIR Value:</p>
          <select
            value = {clutter}
            className="pickerStyle"
            onChange={e => setClutter(e.target.value)}>
            <option label="1" value="1" />
            <option label="2" value="2" />
            <option label="3" value="3" />
            <option label="4" value="4" />
            <option label="5" value="5" />
            <option label="6" value="6" />
            <option label="7" value="7" />
            <option label="8" value="8" />
            <option label="9" value="9" />
          </select>
        </div>
        <div className='editScreenButton1'
          onClick = {() => {updateMetadata(path, location, room_type, clutter);} }>
          <p className='edit'>Change Information</p>
        </div>
        <div onClick = {() => {editing = false;} } >
          <p className='edit'>Cancel Editing</p>
        </div>
      </div>
    );
  }
  
  else {
    return (
      <div className="container">
        <header className="header">
            <p className="titleText">List of Rooms</p>
            <div className="filtering">
              <Filter title="Clutter: " id="clutterLowerFilter" options={clutterOptions} filter={filterDirtyLower} />
              <Filter title=" to " id="clutterHigherFilter" options={clutterOptions} filter={filterDirtyUpper} />
              <Filter title="Room: " id="roomTypeFilter" options={roomOptions} filter={filterRoom} />
              <button className="fbutton" onClick={() => filterSubmit(lowerDirtyLevel, upperDirtyLevel, roomChoice)} type="submit">Filter</button>
              <p className="ftext">Sort By:</p>
              <button onClick={dateSortNewest}>Newest</button>
              <button onClick={dateSortOldest}>Oldest</button>
              {error ? <div style={{color: "red"}}>Select valid Range</div> : <></>}
            </div>
            <div className="m-right" onClick = {() => downloadAll()}>
                <p className="edit large-edit">Download All Data</p>
            </div>
        </header>
        <div className='listSeparator'>
          {renderItems}
        </div>
      </div>
    );
    
  }
  
}

//<button className="fbutton" onClick={() => resetFilters()} type="submit">Reset</button>

async function loadUsers() {
  //List all users in /dev/media
  var usersRef;
  var userPaths = [];
  var callLoadFunct = false;
  
  var storageRef = firebase.storage().ref()
  usersRef = storageRef.child(`dev/media`)
  //console.log(usersRef)
  await usersRef.listAll() //Get all user folders
  .then((result) => {
    result.prefixes.forEach((folderRef) => {
      userPaths.push(folderRef.fullPath)
      callLoadFunct = true
    });
  })
  .catch((error) => {
    console.log("ERROR: Problem getting all users...")
  });
  
  if (callLoadFunct) {
    return userPaths;
  }
}

async function loadRooms(users) {
  var storageRef = firebase.storage().ref()
  var userRef;
  var imagePaths = [];

  var callLoadFunct = false;

  if (typeof users !== 'undefined') {
    for (var i = 0; i < users.length; i++) {
      
      userRef = storageRef.child(users[i])
      //console.log(userRef)
      await userRef.listAll()
      .then((result) => {
        result.items.forEach((itemRef) => {
          //console.log(itemRef)
          if (imagePaths.indexOf(itemRef.fullPath) === -1) {
            imagePaths.push(itemRef.fullPath)
            callLoadFunct = true
          }
        });
      })
      .catch((error) => {
        console.log("ERROR: Problem listing rooms...")
      });
    }
  }
  else
  {
    return false;
  }
  
  if (callLoadFunct) {
    return imagePaths
  }
}

async function loadList(imgs) {
  var imgRef, storageRef
  var location, room_type, clutter, image, path, time_created, date_created
  var dataArr = [];
  
  storageRef = firebase.storage().ref()
  
  if (typeof imgs !== 'undefined') {
    for (var i = 0; i < imgs.length; i++) {
      imgRef = storageRef.child(`${imgs[i]}`)
      await imgRef.getMetadata()
      .then((metadata) => {
        location = metadata.customMetadata.location
        room_type = metadata.customMetadata.room_type
        clutter = metadata.customMetadata.clutter
        time_created = new Date(metadata.timeCreated) //Keep original time for sorting by date
        date_created = String(new Date(metadata.timeCreated)) //Just retrieving day, month, year
        date_created = date_created.split(" ").slice(1,4) //1: Month, 2: Day, 3: Year
        date_created = date_created[0] + " " + date_created[1] + " " + date_created[2]
      })
      .catch((error) => {
        console.log("ERROR: Retrieving metadata")
      })
      
      await imgRef.getDownloadURL()
      .then((url) => {
        image = url
        path = imgRef.fullPath
        dataArr.push({location, room_type, clutter, image, path, date_created, time_created})
      })
      .catch((error) => {
        console.log("ERROR: Downloading images: " + error)
      });
    }
    loaded = true;
    return dataArr;
  }
  return false;
}

function updateMetadata(path, location_in, room_type_in, clutter_in) {
  var storageRef = firebase.storage().ref()
  var editRef = storageRef.child(path);
  
  var metadata = {
    customMetadata: {
      location: location_in,
      room_type: room_type_in,
      clutter: clutter_in
    }
  };
  
  editRef.updateMetadata(metadata)
  .then((metadata) => {
    editing_result = true
  }).catch((error) => {
    console.log("ERROR: Editing metadata: ")
    console.log(error)
  });
}

async function downloadAll() {

// WARNING: For this to work I had to disable CORS
// Command run in terminal: gsutil cors set cors.json gs://roomclutter-ba3dd.appspot.com
// cors.json below:
//  [
//    {
//      "origin": ["*"],
//      "method": ["GET"],
//      "maxAgeSeconds": 3600
//    }
//  ]

  var zip = require('jszip')(); //npm install jszip
  var readme_text = "Pictures of rooms are in the \"pictures\" folder.\nMetadata for corresponding rooms is in the \"metadata\" folder.\n\nThe numbers match up (example: image1.jpg has its metadata in metadata1.txt)."
  zip.file("README.txt", readme_text)
  const pictures = [];
  for (let i = 0; i < dataArray.length; i++) {
    pictures.push(dataArray[i].image)
  }
  try {
    downloadStepTwo(pictures, zip)
  }
  catch(error) {
    alert('Error while downloading files: ' + String(error));
    return false
  };
}

async function downloadStepTwo(pictures, zip) {
  var imgfolder = zip.folder("pictures");
  var metadatafolder = zip.folder("metadata");
  var promises = pictures.map((pic, idx) => {
    return new Promise((resolve, reject) => {
      fetch(pic)
      .then(response => response.blob())
      .then(img => {
        var img_name = "image" + String(idx + 1) + ".jpg";
        imgfolder.file(img_name, img)
        resolve(img)
      })
    })
  })
  Promise.all(promises)
  .then(() => {
    for (let i = 0; i < dataArray.length; i++) {
      try {
        var json_obj = new Object();
        json_obj.Location = dataArray[i].location;
        json_obj.RoomType = dataArray[i].room_type;
        json_obj.CIR = dataArray[i].clutter;
        json_obj.URL = dataArray[i].image;
        json_obj.Upload_Time = dataArray[i].time_created;
        var json_data = JSON.stringify(json_obj);
        metadatafolder.file("metadata" + String(i + 1) + ".json", json_data)
      }
      catch(error) {
        alert('Error while downloading metadata: ' + String(error));
        return false
      };
    }
  })
  .then(() => {
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        download(content, "CIRAppData.zip");
    })
    .catch((error) => {
    alert('Error while packaging zip file: ' + String(error));
    });
  })
  .catch((error) => {
    alert('Error while downloading files: ' + String(error));
  });
}

export default HomeScreen;
